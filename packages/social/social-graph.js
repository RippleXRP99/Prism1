// ============================================================================
// SOCIAL GRAPH IMPLEMENTATION - Month 5: Social Graph Implementation
// ============================================================================

const EventEmitter = require('events');

class SocialGraphSystem extends EventEmitter {
  constructor(database) {
    super();
    this.database = database;
    this.isInitialized = false;

    // Graph cache for performance
    this.relationshipCache = new Map();
    this.recommendationCache = new Map();
    this.influenceCache = new Map();

    // Cache expiry times (in milliseconds)
    this.cacheExpiry = {
      relationships: 5 * 60 * 1000,    // 5 minutes
      recommendations: 15 * 60 * 1000,  // 15 minutes
      influence: 30 * 60 * 1000         // 30 minutes
    };

    // Graph statistics
    this.stats = {
      totalRelationships: 0,
      totalCommunities: 0,
      averageConnections: 0,
      topInfluencers: [],
      graphDensity: 0,
      lastAnalysisUpdate: new Date()
    };

    this.setupCacheCleanup();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing Social Graph System...');

      await this.createIndexes();
      await this.buildInitialGraph();
      await this.updateStats();

      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ Social Graph System initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Social Graph System:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Social relationships indexes
      await this.database.socialRelationships().createIndex({ userId: 1, relationshipType: 1 });
      await this.database.socialRelationships().createIndex({ targetUserId: 1, relationshipType: 1 });
      await this.database.socialRelationships().createIndex({ strength: -1 });
      await this.database.socialRelationships().createIndex({ lastInteraction: -1 });

      // User influence indexes
      await this.database.userInfluence().createIndex({ userId: 1 }, { unique: true });
      await this.database.userInfluence().createIndex({ overallScore: -1 });
      await this.database.userInfluence().createIndex({ category: 1, score: -1 });

      // Content interactions (for graph building)
      await this.database.contentInteractions().createIndex({ userId: 1, contentId: 1 });
      await this.database.contentInteractions().createIndex({ contentId: 1, interactionType: 1 });
      await this.database.contentInteractions().createIndex({ createdAt: -1 });

      // Community clusters
      await this.database.communityClusters().createIndex({ members: 1 });
      await this.database.communityClusters().createIndex({ category: 1, size: -1 });

      console.log('✅ Social graph indexes created');
    } catch (error) {
      console.error('❌ Error creating social graph indexes:', error);
    }
  }

  async buildInitialGraph() {
    try {
      console.log('🔗 Building initial social graph...');

      // Build relationships from existing data
      await this.buildRelationshipsFromFollows();
      await this.buildRelationshipsFromInteractions();
      await this.calculateInfluenceScores();
      await this.detectCommunities();

      console.log('✅ Initial social graph built');
    } catch (error) {
      console.error('❌ Error building initial graph:', error);
    }
  }

  // ============================================================================
  // RELATIONSHIP MANAGEMENT
  // ============================================================================

  async addRelationship(userId, targetUserId, relationshipType, strength = 1, metadata = {}) {
    try {
      const relationship = {
        _id: this.database.createObjectId(),
        userId: this.database.createObjectId(userId),
        targetUserId: this.database.createObjectId(targetUserId),
        relationshipType: relationshipType, // follow, friend, block, mute, favorite
        strength: strength, // 1-10 scale
        bidirectional: relationshipType === 'friend',
        metadata: metadata,
        createdAt: new Date(),
        lastInteraction: new Date(),
        interactionCount: 1
      };

      // Check if relationship already exists
      const existing = await this.database.socialRelationships().findOne({
        userId: this.database.createObjectId(userId),
        targetUserId: this.database.createObjectId(targetUserId),
        relationshipType: relationshipType
      });

      if (existing) {
        // Update existing relationship
        await this.database.socialRelationships().updateOne(
          { _id: existing._id },
          {
            $set: {
              strength: Math.min(strength + existing.strength, 10),
              lastInteraction: new Date(),
              metadata: { ...existing.metadata, ...metadata }
            },
            $inc: { interactionCount: 1 }
          }
        );

        // Clear cache
        this.clearUserCache(userId);
        this.clearUserCache(targetUserId);

        return existing._id;
      } else {
        // Create new relationship
        const result = await this.database.socialRelationships().insertOne(relationship);

        // If bidirectional, create reverse relationship
        if (relationship.bidirectional) {
          const reverseRelationship = {
            ...relationship,
            _id: this.database.createObjectId(),
            userId: this.database.createObjectId(targetUserId),
            targetUserId: this.database.createObjectId(userId)
          };
          await this.database.socialRelationships().insertOne(reverseRelationship);
        }

        // Clear cache
        this.clearUserCache(userId);
        this.clearUserCache(targetUserId);

        // Emit event
        this.emit('relationshipAdded', {
          userId,
          targetUserId,
          relationshipType,
          strength
        });

        return result.insertedId;
      }

    } catch (error) {
      console.error('Error adding relationship:', error);
      throw error;
    }
  }

  async removeRelationship(userId, targetUserId, relationshipType) {
    try {
      const result = await this.database.socialRelationships().deleteOne({
        userId: this.database.createObjectId(userId),
        targetUserId: this.database.createObjectId(targetUserId),
        relationshipType: relationshipType
      });

      // If bidirectional, remove reverse relationship
      if (relationshipType === 'friend') {
        await this.database.socialRelationships().deleteOne({
          userId: this.database.createObjectId(targetUserId),
          targetUserId: this.database.createObjectId(userId),
          relationshipType: relationshipType
        });
      }

      // Clear cache
      this.clearUserCache(userId);
      this.clearUserCache(targetUserId);

      this.emit('relationshipRemoved', {
        userId,
        targetUserId,
        relationshipType
      });

      return result.deletedCount > 0;

    } catch (error) {
      console.error('Error removing relationship:', error);
      throw error;
    }
  }

  async getRelationships(userId, relationshipType = null, options = {}) {
    try {
      const cacheKey = `relationships_${userId}_${relationshipType || 'all'}`;
      
      // Check cache first
      if (this.relationshipCache.has(cacheKey)) {
        const cached = this.relationshipCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry.relationships) {
          return cached.data;
        }
      }

      const { page = 1, limit = 50, sortBy = 'strength', sortOrder = -1 } = options;
      const skip = (page - 1) * limit;

      const query = {
        userId: this.database.createObjectId(userId)
      };

      if (relationshipType) {
        query.relationshipType = relationshipType;
      }

      const relationships = await this.database.socialRelationships()
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get target user details
      const targetUserIds = relationships.map(r => r.targetUserId);
      const users = await this.database.users()
        .find({ _id: { $in: targetUserIds } })
        .toArray();

      const userMap = new Map(users.map(u => [u._id.toString(), u]));

      const enrichedRelationships = relationships.map(relationship => {
        const targetUser = userMap.get(relationship.targetUserId.toString());
        return {
          ...relationship,
          targetUser: {
            _id: relationship.targetUserId,
            username: targetUser?.username || 'Unknown',
            displayName: targetUser?.profile?.displayName || 'Unknown User',
            avatar: targetUser?.profile?.avatar || null,
            isVerified: targetUser?.isVerified || false,
            isOnline: targetUser?.isOnline || false
          }
        };
      });

      const result = {
        relationships: enrichedRelationships,
        pagination: {
          currentPage: page,
          hasNextPage: relationships.length === limit
        }
      };

      // Cache result
      this.relationshipCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      console.error('Error getting relationships:', error);
      throw error;
    }
  }

  async getRelationshipStrength(userId, targetUserId) {
    try {
      const relationship = await this.database.socialRelationships().findOne({
        userId: this.database.createObjectId(userId),
        targetUserId: this.database.createObjectId(targetUserId)
      });

      if (!relationship) {
        return 0;
      }

      // Calculate dynamic strength based on interactions
      const baseStrength = relationship.strength || 1;
      const recentInteractions = relationship.interactionCount || 1;
      const daysSinceLastInteraction = (Date.now() - relationship.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      
      // Decay strength over time
      const timeDecay = Math.max(0.1, 1 - (daysSinceLastInteraction / 30)); // 30-day decay
      
      return Math.round((baseStrength * Math.log(recentInteractions + 1) * timeDecay) * 100) / 100;

    } catch (error) {
      console.error('Error getting relationship strength:', error);
      return 0;
    }
  }

  // ============================================================================
  // RECOMMENDATION SYSTEM
  // ============================================================================

  async getRecommendedUsers(userId, options = {}) {
    try {
      const cacheKey = `recommendations_${userId}`;
      
      // Check cache first
      if (this.recommendationCache.has(cacheKey)) {
        const cached = this.recommendationCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry.recommendations) {
          return cached.data;
        }
      }

      const { limit = 20, algorithm = 'collaborative' } = options;
      let recommendations = [];

      switch (algorithm) {
        case 'collaborative':
          recommendations = await this.getCollaborativeRecommendations(userId, limit);
          break;
        case 'content_based':
          recommendations = await this.getContentBasedRecommendations(userId, limit);
          break;
        case 'hybrid':
          recommendations = await this.getHybridRecommendations(userId, limit);
          break;
        default:
          recommendations = await this.getCollaborativeRecommendations(userId, limit);
      }

      // Cache result
      this.recommendationCache.set(cacheKey, {
        data: recommendations,
        timestamp: Date.now()
      });

      return recommendations;

    } catch (error) {
      console.error('Error getting recommended users:', error);
      return [];
    }
  }

  async getCollaborativeRecommendations(userId, limit) {
    try {
      // Find users with similar interests based on follows and interactions
      const userFollows = await this.database.follows()
        .find({ followerId: this.database.createObjectId(userId) })
        .toArray();

      const followingIds = userFollows.map(f => f.followingId);

      if (followingIds.length === 0) {
        return await this.getPopularUsersRecommendations(limit);
      }

      // Find users who follow the same people
      const similarUsers = await this.database.follows().aggregate([
        {
          $match: {
            followingId: { $in: followingIds },
            followerId: { $ne: this.database.createObjectId(userId) }
          }
        },
        {
          $group: {
            _id: '$followerId',
            commonFollows: { $sum: 1 },
            lastFollow: { $max: '$createdAt' }
          }
        },
        {
          $match: { commonFollows: { $gte: 2 } } // At least 2 common follows
        },
        {
          $sort: { commonFollows: -1, lastFollow: -1 }
        },
        { $limit: limit * 2 }
      ]).toArray();

      // Get who these similar users follow that the current user doesn't
      const similarUserIds = similarUsers.map(u => u._id);
      
      const recommendations = await this.database.follows().aggregate([
        {
          $match: {
            followerId: { $in: similarUserIds },
            followingId: { $nin: [...followingIds, this.database.createObjectId(userId)] }
          }
        },
        {
          $group: {
            _id: '$followingId',
            recommendationScore: { $sum: 1 },
            recommendedBy: { $addToSet: '$followerId' }
          }
        },
        {
          $sort: { recommendationScore: -1 }
        },
        { $limit: limit }
      ]).toArray();

      // Enrich with user data
      const userIds = recommendations.map(r => r._id);
      const users = await this.database.users()
        .find({ _id: { $in: userIds } })
        .toArray();

      return this.enrichRecommendations(recommendations, users, 'collaborative_filtering');

    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return [];
    }
  }

  async getContentBasedRecommendations(userId, limit) {
    try {
      // Get user's content interaction history
      const user = await this.database.users().findOne({
        _id: this.database.createObjectId(userId)
      });

      if (!user) return [];

      // Find creators who produce content similar to what user interacts with
      const userInteractions = await this.database.contentInteractions()
        .find({ userId: this.database.createObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      if (userInteractions.length === 0) {
        return await this.getPopularUsersRecommendations(limit);
      }

      // Analyze content categories and tags
      const contentIds = userInteractions.map(i => i.contentId);
      const contents = await this.database.advancedMedia()
        .find({ _id: { $in: contentIds } })
        .toArray();

      // Extract categories and tags
      const categories = new Map();
      const tags = new Map();

      contents.forEach(content => {
        content.categories?.forEach(cat => {
          categories.set(cat, (categories.get(cat) || 0) + 1);
        });
        content.tags?.forEach(tag => {
          tags.set(tag, (tags.get(tag) || 0) + 1);
        });
      });

      // Find creators who produce similar content
      const topCategories = Array.from(categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

      const topTags = Array.from(tags.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);

      const similarCreators = await this.database.advancedMedia().aggregate([
        {
          $match: {
            $or: [
              { categories: { $in: topCategories } },
              { tags: { $in: topTags } }
            ],
            creatorId: { $ne: this.database.createObjectId(userId) }
          }
        },
        {
          $group: {
            _id: '$creatorId',
            contentCount: { $sum: 1 },
            avgViews: { $avg: '$analytics.views' },
            matchingCategories: {
              $sum: {
                $size: {
                  $setIntersection: ['$categories', topCategories]
                }
              }
            },
            matchingTags: {
              $sum: {
                $size: {
                  $setIntersection: ['$tags', topTags]
                }
              }
            }
          }
        },
        {
          $addFields: {
            recommendationScore: {
              $add: [
                { $multiply: ['$matchingCategories', 3] },
                { $multiply: ['$matchingTags', 1] },
                { $divide: ['$avgViews', 1000] }
              ]
            }
          }
        },
        {
          $sort: { recommendationScore: -1 }
        },
        { $limit: limit }
      ]).toArray();

      // Enrich with user data
      const creatorIds = similarCreators.map(c => c._id);
      const creators = await this.database.users()
        .find({ _id: { $in: creatorIds } })
        .toArray();

      return this.enrichRecommendations(similarCreators, creators, 'content_based');

    } catch (error) {
      console.error('Error getting content-based recommendations:', error);
      return [];
    }
  }

  async getHybridRecommendations(userId, limit) {
    try {
      const collaborativeLimit = Math.ceil(limit * 0.6);
      const contentBasedLimit = Math.floor(limit * 0.4);

      const [collaborative, contentBased] = await Promise.all([
        this.getCollaborativeRecommendations(userId, collaborativeLimit),
        this.getContentBasedRecommendations(userId, contentBasedLimit)
      ]);

      // Merge and deduplicate
      const seen = new Set();
      const hybrid = [];

      // Add collaborative recommendations first (higher weight)
      collaborative.forEach(rec => {
        if (!seen.has(rec.user._id.toString())) {
          hybrid.push({ ...rec, algorithm: 'hybrid_collaborative' });
          seen.add(rec.user._id.toString());
        }
      });

      // Add content-based recommendations
      contentBased.forEach(rec => {
        if (!seen.has(rec.user._id.toString()) && hybrid.length < limit) {
          hybrid.push({ ...rec, algorithm: 'hybrid_content' });
          seen.add(rec.user._id.toString());
        }
      });

      return hybrid;

    } catch (error) {
      console.error('Error getting hybrid recommendations:', error);
      return [];
    }
  }

  async getPopularUsersRecommendations(limit) {
    try {
      const popularUsers = await this.database.users().aggregate([
        {
          $match: {
            isCreator: true,
            'stats.followers': { $gte: 100 }
          }
        },
        {
          $addFields: {
            popularityScore: {
              $add: [
                '$stats.followers',
                { $multiply: ['$stats.totalViews', 0.1] },
                { $multiply: ['$stats.totalLikes', 0.5] }
              ]
            }
          }
        },
        {
          $sort: { popularityScore: -1 }
        },
        { $limit: limit }
      ]).toArray();

      return popularUsers.map(user => ({
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.profile?.displayName || user.username,
          avatar: user.profile?.avatar || null,
          bio: user.profile?.bio || '',
          isVerified: user.isVerified || false,
          stats: user.stats
        },
        recommendationScore: user.popularityScore,
        algorithm: 'popularity_based',
        reason: 'Popular creator'
      }));

    } catch (error) {
      console.error('Error getting popular users recommendations:', error);
      return [];
    }
  }

  enrichRecommendations(recommendations, users, algorithm) {
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    return recommendations.map(rec => {
      const user = userMap.get(rec._id.toString());
      return {
        user: {
          _id: rec._id,
          username: user?.username || 'Unknown',
          displayName: user?.profile?.displayName || 'Unknown User',
          avatar: user?.profile?.avatar || null,
          bio: user?.profile?.bio || '',
          isVerified: user?.isVerified || false,
          stats: user?.stats
        },
        recommendationScore: rec.recommendationScore || 0,
        algorithm: algorithm,
        reason: this.generateRecommendationReason(rec, algorithm)
      };
    });
  }

  generateRecommendationReason(rec, algorithm) {
    switch (algorithm) {
      case 'collaborative_filtering':
        return `${rec.recommendationScore} mutual connections`;
      case 'content_based':
        return 'Similar content interests';
      case 'popularity_based':
        return 'Popular creator';
      default:
        return 'Recommended for you';
    }
  }

  // ============================================================================
  // INFLUENCE CALCULATION
  // ============================================================================

  async calculateInfluenceScores() {
    try {
      console.log('📊 Calculating influence scores...');

      const users = await this.database.users()
        .find({ isCreator: true })
        .toArray();

      const influencePromises = users.map(user => this.calculateUserInfluence(user._id.toString()));
      await Promise.all(influencePromises);

      console.log('✅ Influence scores calculated');
    } catch (error) {
      console.error('Error calculating influence scores:', error);
    }
  }

  async calculateUserInfluence(userId) {
    try {
      const user = await this.database.users().findOne({
        _id: this.database.createObjectId(userId)
      });

      if (!user) return;

      // Calculate various influence metrics
      const [
        followerData,
        contentData,
        interactionData,
        networkData
      ] = await Promise.all([
        this.calculateFollowerInfluence(userId),
        this.calculateContentInfluence(userId),
        this.calculateInteractionInfluence(userId),
        this.calculateNetworkInfluence(userId)
      ]);

      // Weighted influence score
      const weights = {
        followers: 0.3,
        content: 0.25,
        interactions: 0.25,
        network: 0.2
      };

      const overallScore = (
        followerData.score * weights.followers +
        contentData.score * weights.content +
        interactionData.score * weights.interactions +
        networkData.score * weights.network
      );

      const influence = {
        userId: this.database.createObjectId(userId),
        overallScore: Math.round(overallScore * 100) / 100,
        followerInfluence: followerData,
        contentInfluence: contentData,
        interactionInfluence: interactionData,
        networkInfluence: networkData,
        category: this.determineInfluenceCategory(overallScore),
        rank: 0, // Will be calculated later
        lastCalculated: new Date()
      };

      // Update or insert influence record
      await this.database.userInfluence().updateOne(
        { userId: this.database.createObjectId(userId) },
        { $set: influence },
        { upsert: true }
      );

      return influence;

    } catch (error) {
      console.error('Error calculating user influence:', error);
      return null;
    }
  }

  async calculateFollowerInfluence(userId) {
    try {
      const followerCount = await this.database.follows().countDocuments({
        followingId: this.database.createObjectId(userId)
      });

      // Get follower quality (followers of followers)
      const followerQuality = await this.database.follows().aggregate([
        {
          $match: { followingId: this.database.createObjectId(userId) }
        },
        {
          $lookup: {
            from: 'follows',
            localField: 'followerId',
            foreignField: 'followingId',
            as: 'followerFollowers'
          }
        },
        {
          $group: {
            _id: null,
            avgFollowerCount: { $avg: { $size: '$followerFollowers' } }
          }
        }
      ]).toArray();

      const qualityScore = followerQuality[0]?.avgFollowerCount || 1;
      
      // Normalize scores (log scale for follower count)
      const followersScore = Math.log10(Math.max(1, followerCount));
      const qualityNormalized = Math.log10(Math.max(1, qualityScore));

      return {
        score: Math.min(10, followersScore + qualityNormalized * 0.3),
        followerCount: followerCount,
        averageFollowerQuality: qualityScore,
        details: {
          raw_followers: followerCount,
          quality_multiplier: qualityNormalized
        }
      };

    } catch (error) {
      console.error('Error calculating follower influence:', error);
      return { score: 0, followerCount: 0, averageFollowerQuality: 0 };
    }
  }

  async calculateContentInfluence(userId) {
    try {
      const contentAnalytics = await this.database.advancedMedia().aggregate([
        {
          $match: { creatorId: this.database.createObjectId(userId) }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$analytics.views' },
            totalLikes: { $sum: '$analytics.likes' },
            totalComments: { $sum: '$analytics.comments' },
            totalShares: { $sum: '$analytics.shares' },
            contentCount: { $sum: 1 },
            avgViews: { $avg: '$analytics.views' },
            avgEngagement: {
              $avg: {
                $divide: [
                  { $add: ['$analytics.likes', '$analytics.comments', '$analytics.shares'] },
                  { $max: ['$analytics.views', 1] }
                ]
              }
            }
          }
        }
      ]).toArray();

      if (!contentAnalytics[0]) {
        return { score: 0, totalViews: 0, engagementRate: 0 };
      }

      const data = contentAnalytics[0];
      
      // Calculate content influence score
      const viewsScore = Math.log10(Math.max(1, data.totalViews)) * 0.4;
      const engagementScore = (data.avgEngagement || 0) * 100 * 0.6;
      
      return {
        score: Math.min(10, viewsScore + engagementScore),
        totalViews: data.totalViews,
        totalLikes: data.totalLikes,
        totalComments: data.totalComments,
        contentCount: data.contentCount,
        engagementRate: data.avgEngagement || 0,
        details: {
          views_component: viewsScore,
          engagement_component: engagementScore
        }
      };

    } catch (error) {
      console.error('Error calculating content influence:', error);
      return { score: 0, totalViews: 0, engagementRate: 0 };
    }
  }

  async calculateInteractionInfluence(userId) {
    try {
      // Get interaction patterns (comments received, mentions, shares)
      const interactionData = await this.database.comments().aggregate([
        {
          $lookup: {
            from: 'advancedMedia',
            localField: 'contentId',
            foreignField: '_id',
            as: 'content'
          }
        },
        {
          $match: {
            'content.creatorId': this.database.createObjectId(userId)
          }
        },
        {
          $group: {
            _id: null,
            totalComments: { $sum: 1 },
            uniqueCommenters: { $addToSet: '$userId' },
            avgCommentsPerContent: { $avg: 1 }
          }
        }
      ]).toArray();

      const data = interactionData[0] || { totalComments: 0, uniqueCommenters: [] };
      
      const commentsScore = Math.log10(Math.max(1, data.totalComments));
      const diversityScore = Math.log10(Math.max(1, data.uniqueCommenters.length));
      
      return {
        score: Math.min(10, commentsScore * 0.6 + diversityScore * 0.4),
        totalComments: data.totalComments,
        uniqueInteractors: data.uniqueCommenters.length,
        details: {
          comments_component: commentsScore,
          diversity_component: diversityScore
        }
      };

    } catch (error) {
      console.error('Error calculating interaction influence:', error);
      return { score: 0, totalComments: 0, uniqueInteractors: 0 };
    }
  }

  async calculateNetworkInfluence(userId) {
    try {
      // Calculate network centrality and reach
      const connections = await this.database.socialRelationships()
        .find({ userId: this.database.createObjectId(userId) })
        .toArray();

      const directConnections = connections.length;
      
      // Calculate second-degree connections
      const connectionIds = connections.map(c => c.targetUserId);
      const secondDegreeCount = await this.database.socialRelationships().countDocuments({
        userId: { $in: connectionIds },
        targetUserId: { $ne: this.database.createObjectId(userId) }
      });

      // Network reach score
      const directScore = Math.log10(Math.max(1, directConnections));
      const reachScore = Math.log10(Math.max(1, secondDegreeCount)) * 0.3;
      
      return {
        score: Math.min(10, directScore + reachScore),
        directConnections: directConnections,
        networkReach: secondDegreeCount,
        details: {
          direct_component: directScore,
          reach_component: reachScore
        }
      };

    } catch (error) {
      console.error('Error calculating network influence:', error);
      return { score: 0, directConnections: 0, networkReach: 0 };
    }
  }

  determineInfluenceCategory(score) {
    if (score >= 8) return 'mega_influencer';
    if (score >= 6) return 'macro_influencer';
    if (score >= 4) return 'micro_influencer';
    if (score >= 2) return 'nano_influencer';
    return 'emerging';
  }

  async getTopInfluencers(category = null, limit = 50) {
    try {
      const cacheKey = `top_influencers_${category || 'all'}_${limit}`;
      
      if (this.influenceCache.has(cacheKey)) {
        const cached = this.influenceCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry.influence) {
          return cached.data;
        }
      }

      const query = {};
      if (category) {
        query.category = category;
      }

      const influencers = await this.database.userInfluence()
        .find(query)
        .sort({ overallScore: -1 })
        .limit(limit)
        .toArray();

      // Get user details
      const userIds = influencers.map(inf => inf.userId);
      const users = await this.database.users()
        .find({ _id: { $in: userIds } })
        .toArray();

      const userMap = new Map(users.map(u => [u._id.toString(), u]));

      const enrichedInfluencers = influencers.map((influencer, index) => {
        const user = userMap.get(influencer.userId.toString());
        return {
          ...influencer,
          rank: index + 1,
          user: {
            _id: influencer.userId,
            username: user?.username || 'Unknown',
            displayName: user?.profile?.displayName || 'Unknown User',
            avatar: user?.profile?.avatar || null,
            isVerified: user?.isVerified || false
          }
        };
      });

      this.influenceCache.set(cacheKey, {
        data: enrichedInfluencers,
        timestamp: Date.now()
      });

      return enrichedInfluencers;

    } catch (error) {
      console.error('Error getting top influencers:', error);
      return [];
    }
  }

  // ============================================================================
  // COMMUNITY DETECTION
  // ============================================================================

  async detectCommunities() {
    try {
      console.log('👥 Detecting communities...');

      // Simple community detection based on interaction patterns
      const communities = await this.database.follows().aggregate([
        {
          $group: {
            _id: '$followingId',
            followers: { $addToSet: '$followerId' },
            followerCount: { $sum: 1 }
          }
        },
        {
          $match: { followerCount: { $gte: 10 } } // Minimum community size
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $project: {
            creatorId: '$_id',
            members: '$followers',
            size: '$followerCount',
            creator: { $arrayElemAt: ['$creator', 0] },
            category: { $arrayElemAt: ['$creator.profile.category', 0] }
          }
        }
      ]).toArray();

      // Save communities
      for (const community of communities) {
        const communityDoc = {
          _id: this.database.createObjectId(),
          creatorId: community.creatorId,
          members: community.members,
          size: community.size,
          category: community.category || 'general',
          centerUser: community.creatorId,
          cohesionScore: await this.calculateCommunityCohesion(community.members),
          createdAt: new Date(),
          lastAnalyzed: new Date()
        };

        await this.database.communityClusters().updateOne(
          { creatorId: community.creatorId },
          { $set: communityDoc },
          { upsert: true }
        );
      }

      console.log(`✅ Detected ${communities.length} communities`);
      return communities.length;

    } catch (error) {
      console.error('Error detecting communities:', error);
      return 0;
    }
  }

  async calculateCommunityCohesion(memberIds) {
    try {
      // Calculate internal connections vs external connections
      const internalConnections = await this.database.socialRelationships().countDocuments({
        userId: { $in: memberIds },
        targetUserId: { $in: memberIds }
      });

      const totalPossibleConnections = memberIds.length * (memberIds.length - 1);
      
      if (totalPossibleConnections === 0) return 0;
      
      return Math.round((internalConnections / totalPossibleConnections) * 100) / 100;

    } catch (error) {
      console.error('Error calculating community cohesion:', error);
      return 0;
    }
  }

  // ============================================================================
  // GRAPH BUILDING FROM EXISTING DATA
  // ============================================================================

  async buildRelationshipsFromFollows() {
    try {
      const follows = await this.database.follows()
        .find({})
        .toArray();

      const relationshipPromises = follows.map(follow => 
        this.addRelationship(
          follow.followerId.toString(),
          follow.followingId.toString(),
          'follow',
          1,
          { source: 'follow_system', createdAt: follow.createdAt }
        ).catch(err => console.error('Error adding follow relationship:', err))
      );

      await Promise.all(relationshipPromises);
      console.log(`✅ Built ${follows.length} relationships from follows`);

    } catch (error) {
      console.error('Error building relationships from follows:', error);
    }
  }

  async buildRelationshipsFromInteractions() {
    try {
      // Build relationships from comments, likes, and other interactions
      const recentInteractions = await this.database.comments().aggregate([
        {
          $lookup: {
            from: 'advancedMedia',
            localField: 'contentId',
            foreignField: '_id',
            as: 'content'
          }
        },
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
          }
        },
        {
          $group: {
            _id: {
              userId: '$userId',
              creatorId: { $arrayElemAt: ['$content.creatorId', 0] }
            },
            interactionCount: { $sum: 1 },
            lastInteraction: { $max: '$createdAt' }
          }
        },
        {
          $match: {
            '_id.userId': { $ne: '$_id.creatorId' }, // Exclude self-interactions
            interactionCount: { $gte: 3 } // Minimum interaction threshold
          }
        }
      ]).toArray();

      const interactionPromises = recentInteractions.map(interaction => 
        this.addRelationship(
          interaction._id.userId.toString(),
          interaction._id.creatorId.toString(),
          'interact',
          Math.min(10, interaction.interactionCount),
          { 
            source: 'interaction_system',
            interactionCount: interaction.interactionCount,
            lastInteraction: interaction.lastInteraction
          }
        ).catch(err => console.error('Error adding interaction relationship:', err))
      );

      await Promise.all(interactionPromises);
      console.log(`✅ Built ${recentInteractions.length} relationships from interactions`);

    } catch (error) {
      console.error('Error building relationships from interactions:', error);
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  clearUserCache(userId) {
    const keysToDelete = [];
    for (const key of this.relationshipCache.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }
    for (const key of this.recommendationCache.keys()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.relationshipCache.delete(key);
      this.recommendationCache.delete(key);
    });
  }

  setupCacheCleanup() {
    // Clean up expired cache entries every 30 minutes
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, value] of this.relationshipCache.entries()) {
        if (now - value.timestamp > this.cacheExpiry.relationships) {
          this.relationshipCache.delete(key);
        }
      }
      
      for (const [key, value] of this.recommendationCache.entries()) {
        if (now - value.timestamp > this.cacheExpiry.recommendations) {
          this.recommendationCache.delete(key);
        }
      }
      
      for (const [key, value] of this.influenceCache.entries()) {
        if (now - value.timestamp > this.cacheExpiry.influence) {
          this.influenceCache.delete(key);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes
  }

  async updateStats() {
    try {
      const [totalRel, totalComm, topInfluencers] = await Promise.all([
        this.database.socialRelationships().countDocuments(),
        this.database.communityClusters().countDocuments(),
        this.getTopInfluencers(null, 10)
      ]);

      // Calculate average connections
      const avgConnections = await this.database.socialRelationships().aggregate([
        {
          $group: {
            _id: '$userId',
            connectionCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            avgConnections: { $avg: '$connectionCount' }
          }
        }
      ]).toArray();

      this.stats.totalRelationships = totalRel;
      this.stats.totalCommunities = totalComm;
      this.stats.averageConnections = avgConnections[0]?.avgConnections || 0;
      this.stats.topInfluencers = topInfluencers.slice(0, 5);
      this.stats.lastAnalysisUpdate = new Date();

    } catch (error) {
      console.error('Error updating social graph stats:', error);
    }
  }

  getStats() {
    return { ...this.stats };
  }

  async shutdown() {
    console.log('🔄 Shutting down Social Graph System...');
    this.isInitialized = false;
    this.relationshipCache.clear();
    this.recommendationCache.clear();
    this.influenceCache.clear();
    this.emit('shutdown');
    console.log('✅ Social Graph System shut down successfully');
  }
}

module.exports = SocialGraphSystem;
