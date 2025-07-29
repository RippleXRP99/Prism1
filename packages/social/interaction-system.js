// ============================================================================
// SOCIAL INTERACTION SYSTEM - Month 5: Sozial & Interaktion
// ============================================================================

const EventEmitter = require('events');

class SocialInteractionSystem extends EventEmitter {
  constructor(database) {
    super();
    this.database = database;
    this.isInitialized = false;
    
    // Interaction statistics
    this.stats = {
      totalComments: 0,
      totalLikes: 0,
      totalShares: 0,
      totalDirectMessages: 0,
      activeConversations: 0,
      dailyInteractions: 0,
      lastStatsUpdate: new Date()
    };

    // Rate limiting for interactions
    this.rateLimits = {
      comments: { limit: 20, window: 60000 }, // 20 comments per minute
      likes: { limit: 100, window: 60000 },   // 100 likes per minute
      messages: { limit: 50, window: 60000 }, // 50 messages per minute
      follows: { limit: 30, window: 300000 }  // 30 follows per 5 minutes
    };

    this.userActionCache = new Map(); // Rate limiting cache
    this.setupCleanupInterval();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing Social Interaction System...');

      // Initialize collections
      await this.createIndexes();
      
      // Load initial statistics
      await this.updateStats();
      
      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ Social Interaction System initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Social Interaction System:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Comments indexes
      await this.database.comments().createIndex({ contentId: 1, createdAt: -1 });
      await this.database.comments().createIndex({ userId: 1, createdAt: -1 });
      await this.database.comments().createIndex({ parentId: 1 });

      // Likes indexes
      await this.database.likes().createIndex({ contentId: 1, userId: 1 }, { unique: true });
      await this.database.likes().createIndex({ userId: 1, createdAt: -1 });
      await this.database.likes().createIndex({ contentId: 1, createdAt: -1 });

      // Direct messages indexes
      await this.database.directMessages().createIndex({ conversationId: 1, createdAt: -1 });
      await this.database.directMessages().createIndex({ senderId: 1, createdAt: -1 });
      await this.database.directMessages().createIndex({ recipientId: 1, createdAt: -1 });

      // Conversations indexes
      await this.database.conversations().createIndex({ participants: 1 });
      await this.database.conversations().createIndex({ lastMessageAt: -1 });

      // Social graph indexes
      await this.database.follows().createIndex({ followerId: 1, followingId: 1 }, { unique: true });
      await this.database.follows().createIndex({ followerId: 1, createdAt: -1 });
      await this.database.follows().createIndex({ followingId: 1, createdAt: -1 });

      console.log('✅ Social interaction indexes created');
    } catch (error) {
      console.error('❌ Error creating social indexes:', error);
    }
  }

  // ============================================================================
  // COMMENT SYSTEM
  // ============================================================================

  async addComment(contentId, userId, commentText, parentId = null) {
    try {
      // Rate limiting check
      if (!(await this.checkRateLimit(userId, 'comments'))) {
        throw new Error('Rate limit exceeded for comments');
      }

      // Validate content exists
      const content = await this.database.advancedMedia().findOne({ _id: contentId });
      if (!content) {
        throw new Error('Content not found');
      }

      // Create comment
      const comment = {
        _id: this.database.createObjectId(),
        contentId: this.database.createObjectId(contentId),
        userId: this.database.createObjectId(userId),
        text: commentText.trim(),
        parentId: parentId ? this.database.createObjectId(parentId) : null,
        isEdited: false,
        isDeleted: false,
        likes: 0,
        replies: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert comment
      const result = await this.database.comments().insertOne(comment);

      // Update parent comment reply count
      if (parentId) {
        await this.database.comments().updateOne(
          { _id: this.database.createObjectId(parentId) },
          { $inc: { replies: 1 } }
        );
      }

      // Update content comment count
      await this.database.advancedMedia().updateOne(
        { _id: this.database.createObjectId(contentId) },
        { $inc: { 'analytics.comments': 1 } }
      );

      this.stats.totalComments++;
      this.stats.dailyInteractions++;

      // Emit event for real-time updates
      this.emit('commentAdded', {
        commentId: result.insertedId,
        contentId,
        userId,
        text: commentText,
        parentId
      });

      return {
        ...comment,
        _id: result.insertedId
      };

    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getComments(contentId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = -1,
        parentId = null
      } = options;

      const skip = (page - 1) * limit;
      
      const query = {
        contentId: this.database.createObjectId(contentId),
        isDeleted: false
      };

      if (parentId === null) {
        query.parentId = null; // Top-level comments only
      } else if (parentId) {
        query.parentId = this.database.createObjectId(parentId);
      }

      const comments = await this.database.comments()
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get user details for comments
      const userIds = comments.map(c => c.userId);
      const users = await this.database.users()
        .find({ _id: { $in: userIds } })
        .toArray();

      const userMap = new Map(users.map(u => [u._id.toString(), u]));

      // Enrich comments with user data
      const enrichedComments = comments.map(comment => ({
        ...comment,
        user: {
          _id: comment.userId,
          username: userMap.get(comment.userId.toString())?.username || 'Unknown',
          displayName: userMap.get(comment.userId.toString())?.profile?.displayName || 'Unknown User',
          avatar: userMap.get(comment.userId.toString())?.profile?.avatar || null
        }
      }));

      // Get total count for pagination
      const totalCount = await this.database.comments().countDocuments(query);

      return {
        comments: enrichedComments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1
        }
      };

    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  }

  async editComment(commentId, userId, newText) {
    try {
      const comment = await this.database.comments().findOne({
        _id: this.database.createObjectId(commentId),
        userId: this.database.createObjectId(userId),
        isDeleted: false
      });

      if (!comment) {
        throw new Error('Comment not found or access denied');
      }

      // Update comment
      const result = await this.database.comments().updateOne(
        { _id: this.database.createObjectId(commentId) },
        {
          $set: {
            text: newText.trim(),
            isEdited: true,
            updatedAt: new Date()
          }
        }
      );

      this.emit('commentEdited', {
        commentId,
        userId,
        newText
      });

      return { success: true, modified: result.modifiedCount };

    } catch (error) {
      console.error('Error editing comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId, userId, isAdmin = false) {
    try {
      const query = {
        _id: this.database.createObjectId(commentId),
        isDeleted: false
      };

      if (!isAdmin) {
        query.userId = this.database.createObjectId(userId);
      }

      const comment = await this.database.comments().findOne(query);
      if (!comment) {
        throw new Error('Comment not found or access denied');
      }

      // Soft delete comment
      await this.database.comments().updateOne(
        { _id: this.database.createObjectId(commentId) },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            text: '[Comment deleted]'
          }
        }
      );

      // Update parent comment reply count
      if (comment.parentId) {
        await this.database.comments().updateOne(
          { _id: comment.parentId },
          { $inc: { replies: -1 } }
        );
      }

      // Update content comment count
      await this.database.advancedMedia().updateOne(
        { _id: comment.contentId },
        { $inc: { 'analytics.comments': -1 } }
      );

      this.emit('commentDeleted', {
        commentId,
        userId: isAdmin ? null : userId,
        contentId: comment.contentId
      });

      return { success: true };

    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // ============================================================================
  // LIKE SYSTEM
  // ============================================================================

  async toggleLike(contentId, userId, type = 'content') {
    try {
      // Rate limiting check
      if (!(await this.checkRateLimit(userId, 'likes'))) {
        throw new Error('Rate limit exceeded for likes');
      }

      const targetId = this.database.createObjectId(contentId);
      const userObjectId = this.database.createObjectId(userId);

      // Check if like already exists
      const existingLike = await this.database.likes().findOne({
        contentId: targetId,
        userId: userObjectId,
        type: type
      });

      let isLiked = false;
      let likesChange = 0;

      if (existingLike) {
        // Remove like
        await this.database.likes().deleteOne({
          _id: existingLike._id
        });
        likesChange = -1;
        isLiked = false;
      } else {
        // Add like
        const like = {
          _id: this.database.createObjectId(),
          contentId: targetId,
          userId: userObjectId,
          type: type,
          createdAt: new Date()
        };

        await this.database.likes().insertOne(like);
        likesChange = 1;
        isLiked = true;
        this.stats.totalLikes++;
      }

      // Update target's like count
      const updateTarget = type === 'content' ? 'advancedMedia' : 'comments';
      const updateField = type === 'content' ? 'analytics.likes' : 'likes';

      await this.database[updateTarget]().updateOne(
        { _id: targetId },
        { $inc: { [updateField]: likesChange } }
      );

      this.stats.dailyInteractions++;

      this.emit('likeToggled', {
        contentId,
        userId,
        type,
        isLiked,
        likesChange
      });

      return {
        isLiked,
        likesChange,
        success: true
      };

    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  async getLikes(contentId, type = 'content', options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const likes = await this.database.likes()
        .find({
          contentId: this.database.createObjectId(contentId),
          type: type
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get user details
      const userIds = likes.map(like => like.userId);
      const users = await this.database.users()
        .find({ _id: { $in: userIds } })
        .toArray();

      const userMap = new Map(users.map(u => [u._id.toString(), u]));

      const enrichedLikes = likes.map(like => ({
        ...like,
        user: {
          _id: like.userId,
          username: userMap.get(like.userId.toString())?.username || 'Unknown',
          displayName: userMap.get(like.userId.toString())?.profile?.displayName || 'Unknown User',
          avatar: userMap.get(like.userId.toString())?.profile?.avatar || null
        }
      }));

      const totalCount = await this.database.likes().countDocuments({
        contentId: this.database.createObjectId(contentId),
        type: type
      });

      return {
        likes: enrichedLikes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        }
      };

    } catch (error) {
      console.error('Error getting likes:', error);
      throw error;
    }
  }

  async getUserLikeStatus(contentIds, userId, type = 'content') {
    try {
      const likes = await this.database.likes()
        .find({
          contentId: { $in: contentIds.map(id => this.database.createObjectId(id)) },
          userId: this.database.createObjectId(userId),
          type: type
        })
        .toArray();

      const likeMap = new Map(likes.map(like => [like.contentId.toString(), true]));
      
      return contentIds.reduce((acc, contentId) => {
        acc[contentId] = likeMap.has(contentId) || false;
        return acc;
      }, {});

    } catch (error) {
      console.error('Error getting user like status:', error);
      throw error;
    }
  }

  // ============================================================================
  // DIRECT MESSAGING SYSTEM
  // ============================================================================

  async sendDirectMessage(senderId, recipientId, messageText, attachments = []) {
    try {
      // Rate limiting check
      if (!(await this.checkRateLimit(senderId, 'messages'))) {
        throw new Error('Rate limit exceeded for messages');
      }

      // Validate users exist
      const [sender, recipient] = await Promise.all([
        this.database.users().findOne({ _id: this.database.createObjectId(senderId) }),
        this.database.users().findOne({ _id: this.database.createObjectId(recipientId) })
      ]);

      if (!sender || !recipient) {
        throw new Error('Sender or recipient not found');
      }

      // Check if recipient accepts messages
      if (recipient.settings?.privacy?.allowDirectMessages === false) {
        throw new Error('Recipient does not accept direct messages');
      }

      // Get or create conversation
      const conversation = await this.getOrCreateConversation(senderId, recipientId);

      // Create message
      const message = {
        _id: this.database.createObjectId(),
        conversationId: conversation._id,
        senderId: this.database.createObjectId(senderId),
        recipientId: this.database.createObjectId(recipientId),
        text: messageText.trim(),
        attachments: attachments || [],
        isRead: false,
        isEdited: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert message
      const result = await this.database.directMessages().insertOne(message);

      // Update conversation
      await this.database.conversations().updateOne(
        { _id: conversation._id },
        {
          $set: {
            lastMessageAt: new Date(),
            lastMessage: messageText.substring(0, 100),
            lastMessageSenderId: this.database.createObjectId(senderId)
          },
          $inc: { messageCount: 1 }
        }
      );

      this.stats.totalDirectMessages++;
      this.stats.dailyInteractions++;

      // Emit real-time event
      this.emit('messageReceived', {
        messageId: result.insertedId,
        conversationId: conversation._id,
        senderId,
        recipientId,
        text: messageText,
        sender: {
          username: sender.username,
          displayName: sender.profile?.displayName,
          avatar: sender.profile?.avatar
        }
      });

      return {
        ...message,
        _id: result.insertedId,
        conversation: conversation
      };

    } catch (error) {
      console.error('Error sending direct message:', error);
      throw error;
    }
  }

  async getOrCreateConversation(userId1, userId2) {
    try {
      const participants = [
        this.database.createObjectId(userId1),
        this.database.createObjectId(userId2)
      ].sort();

      // Try to find existing conversation
      let conversation = await this.database.conversations().findOne({
        participants: { $all: participants, $size: 2 }
      });

      if (!conversation) {
        // Create new conversation
        const newConversation = {
          _id: this.database.createObjectId(),
          participants: participants,
          messageCount: 0,
          createdAt: new Date(),
          lastMessageAt: new Date(),
          lastMessage: '',
          lastMessageSenderId: null
        };

        const result = await this.database.conversations().insertOne(newConversation);
        conversation = { ...newConversation, _id: result.insertedId };
        
        this.stats.activeConversations++;
      }

      return conversation;

    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw error;
    }
  }

  async getConversations(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const conversations = await this.database.conversations()
        .find({
          participants: this.database.createObjectId(userId)
        })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get other participants' details
      const participantIds = conversations
        .flatMap(conv => conv.participants)
        .filter(id => id.toString() !== userId);

      const users = await this.database.users()
        .find({ _id: { $in: participantIds } })
        .toArray();

      const userMap = new Map(users.map(u => [u._id.toString(), u]));

      // Enrich conversations
      const enrichedConversations = conversations.map(conv => {
        const otherParticipant = conv.participants.find(p => p.toString() !== userId);
        const otherUser = userMap.get(otherParticipant.toString());

        return {
          ...conv,
          otherParticipant: {
            _id: otherParticipant,
            username: otherUser?.username || 'Unknown',
            displayName: otherUser?.profile?.displayName || 'Unknown User',
            avatar: otherUser?.profile?.avatar || null,
            isOnline: otherUser?.isOnline || false
          }
        };
      });

      return {
        conversations: enrichedConversations,
        pagination: {
          currentPage: page,
          hasNextPage: conversations.length === limit
        }
      };

    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  async getMessages(conversationId, userId, options = {}) {
    try {
      const { page = 1, limit = 50, before = null } = options;

      // Verify user is participant
      const conversation = await this.database.conversations().findOne({
        _id: this.database.createObjectId(conversationId),
        participants: this.database.createObjectId(userId)
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      const query = {
        conversationId: this.database.createObjectId(conversationId),
        isDeleted: false
      };

      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      const messages = await this.database.directMessages()
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      // Mark messages as read
      await this.database.directMessages().updateMany(
        {
          conversationId: this.database.createObjectId(conversationId),
          recipientId: this.database.createObjectId(userId),
          isRead: false
        },
        { $set: { isRead: true, readAt: new Date() } }
      );

      return {
        messages: messages.reverse(), // Return in chronological order
        pagination: {
          hasMoreMessages: messages.length === limit,
          oldestMessageId: messages.length > 0 ? messages[0]._id : null
        }
      };

    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId, userId) {
    try {
      const result = await this.database.directMessages().updateOne(
        {
          _id: this.database.createObjectId(messageId),
          recipientId: this.database.createObjectId(userId),
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      this.emit('messageRead', {
        messageId,
        userId
      });

      return { success: true, modified: result.modifiedCount };

    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async getUnreadMessageCount(userId) {
    try {
      const count = await this.database.directMessages().countDocuments({
        recipientId: this.database.createObjectId(userId),
        isRead: false,
        isDeleted: false
      });

      return count;

    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  // ============================================================================
  // SOCIAL GRAPH (FOLLOW SYSTEM)
  // ============================================================================

  async followUser(followerId, followingId) {
    try {
      // Rate limiting check
      if (!(await this.checkRateLimit(followerId, 'follows'))) {
        throw new Error('Rate limit exceeded for follows');
      }

      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      // Check if already following
      const existingFollow = await this.database.follows().findOne({
        followerId: this.database.createObjectId(followerId),
        followingId: this.database.createObjectId(followingId)
      });

      if (existingFollow) {
        throw new Error('Already following this user');
      }

      // Create follow relationship
      const follow = {
        _id: this.database.createObjectId(),
        followerId: this.database.createObjectId(followerId),
        followingId: this.database.createObjectId(followingId),
        createdAt: new Date()
      };

      await this.database.follows().insertOne(follow);

      // Update follower/following counts
      await Promise.all([
        this.database.users().updateOne(
          { _id: this.database.createObjectId(followerId) },
          { $inc: { 'stats.following': 1 } }
        ),
        this.database.users().updateOne(
          { _id: this.database.createObjectId(followingId) },
          { $inc: { 'stats.followers': 1 } }
        )
      ]);

      this.emit('userFollowed', {
        followerId,
        followingId
      });

      return { success: true, followId: follow._id };

    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followerId, followingId) {
    try {
      const result = await this.database.follows().deleteOne({
        followerId: this.database.createObjectId(followerId),
        followingId: this.database.createObjectId(followingId)
      });

      if (result.deletedCount === 0) {
        throw new Error('Follow relationship not found');
      }

      // Update follower/following counts
      await Promise.all([
        this.database.users().updateOne(
          { _id: this.database.createObjectId(followerId) },
          { $inc: { 'stats.following': -1 } }
        ),
        this.database.users().updateOne(
          { _id: this.database.createObjectId(followingId) },
          { $inc: { 'stats.followers': -1 } }
        )
      ]);

      this.emit('userUnfollowed', {
        followerId,
        followingId
      });

      return { success: true };

    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async getFollowers(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const follows = await this.database.follows()
        .find({ followingId: this.database.createObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const followerIds = follows.map(f => f.followerId);
      const followers = await this.database.users()
        .find({ _id: { $in: followerIds } })
        .toArray();

      const followerMap = new Map(followers.map(u => [u._id.toString(), u]));

      const enrichedFollowers = follows.map(follow => {
        const user = followerMap.get(follow.followerId.toString());
        return {
          followId: follow._id,
          followedAt: follow.createdAt,
          user: {
            _id: follow.followerId,
            username: user?.username || 'Unknown',
            displayName: user?.profile?.displayName || 'Unknown User',
            avatar: user?.profile?.avatar || null,
            bio: user?.profile?.bio || '',
            isVerified: user?.isVerified || false
          }
        };
      });

      return {
        followers: enrichedFollowers,
        pagination: {
          currentPage: page,
          hasNextPage: follows.length === limit
        }
      };

    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  async getFollowing(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      const follows = await this.database.follows()
        .find({ followerId: this.database.createObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const followingIds = follows.map(f => f.followingId);
      const following = await this.database.users()
        .find({ _id: { $in: followingIds } })
        .toArray();

      const followingMap = new Map(following.map(u => [u._id.toString(), u]));

      const enrichedFollowing = follows.map(follow => {
        const user = followingMap.get(follow.followingId.toString());
        return {
          followId: follow._id,
          followedAt: follow.createdAt,
          user: {
            _id: follow.followingId,
            username: user?.username || 'Unknown',
            displayName: user?.profile?.displayName || 'Unknown User',
            avatar: user?.profile?.avatar || null,
            bio: user?.profile?.bio || '',
            isVerified: user?.isVerified || false
          }
        };
      });

      return {
        following: enrichedFollowing,
        pagination: {
          currentPage: page,
          hasNextPage: follows.length === limit
        }
      };

    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  }

  async isFollowing(followerId, followingId) {
    try {
      const follow = await this.database.follows().findOne({
        followerId: this.database.createObjectId(followerId),
        followingId: this.database.createObjectId(followingId)
      });

      return !!follow;

    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  async getMutualFollows(userId1, userId2) {
    try {
      // Get users that both follow
      const user1Following = await this.database.follows()
        .find({ followerId: this.database.createObjectId(userId1) })
        .toArray();

      const user2Following = await this.database.follows()
        .find({ followerId: this.database.createObjectId(userId2) })
        .toArray();

      const user1FollowingIds = new Set(user1Following.map(f => f.followingId.toString()));
      const mutualFollowIds = user2Following
        .filter(f => user1FollowingIds.has(f.followingId.toString()))
        .map(f => f.followingId);

      if (mutualFollowIds.length === 0) {
        return { mutualFollows: [], count: 0 };
      }

      const mutualUsers = await this.database.users()
        .find({ _id: { $in: mutualFollowIds } })
        .limit(10) // Limit to prevent large responses
        .toArray();

      return {
        mutualFollows: mutualUsers.map(user => ({
          _id: user._id,
          username: user.username,
          displayName: user.profile?.displayName || user.username,
          avatar: user.profile?.avatar || null
        })),
        count: mutualFollowIds.length
      };

    } catch (error) {
      console.error('Error getting mutual follows:', error);
      return { mutualFollows: [], count: 0 };
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  async checkRateLimit(userId, actionType) {
    const now = Date.now();
    const userKey = `${userId}_${actionType}`;
    const limit = this.rateLimits[actionType];

    if (!this.userActionCache.has(userKey)) {
      this.userActionCache.set(userKey, []);
    }

    const userActions = this.userActionCache.get(userKey);
    
    // Remove old actions outside the window
    const validActions = userActions.filter(timestamp => now - timestamp < limit.window);
    this.userActionCache.set(userKey, validActions);

    // Check if under limit
    if (validActions.length >= limit.limit) {
      return false;
    }

    // Add current action
    validActions.push(now);
    this.userActionCache.set(userKey, validActions);

    return true;
  }

  setupCleanupInterval() {
    // Clean up rate limiting cache every 5 minutes
    setInterval(() => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      for (const [key, actions] of this.userActionCache.entries()) {
        const validActions = actions.filter(timestamp => now - timestamp < fiveMinutes);
        if (validActions.length === 0) {
          this.userActionCache.delete(key);
        } else {
          this.userActionCache.set(key, validActions);
        }
      }
    }, 300000); // 5 minutes
  }

  async updateStats() {
    try {
      const [commentCount, likeCount, messageCount, conversationCount] = await Promise.all([
        this.database.comments().countDocuments({ isDeleted: false }),
        this.database.likes().countDocuments(),
        this.database.directMessages().countDocuments({ isDeleted: false }),
        this.database.conversations().countDocuments()
      ]);

      this.stats.totalComments = commentCount;
      this.stats.totalLikes = likeCount;
      this.stats.totalDirectMessages = messageCount;
      this.stats.activeConversations = conversationCount;
      this.stats.lastStatsUpdate = new Date();

    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  getStats() {
    return { ...this.stats };
  }

  async shutdown() {
    console.log('🔄 Shutting down Social Interaction System...');
    this.isInitialized = false;
    this.userActionCache.clear();
    this.emit('shutdown');
    console.log('✅ Social Interaction System shut down successfully');
  }
}

module.exports = SocialInteractionSystem;
