// Database connection and models
// This module will handle MongoDB connection and provide data models

const { MongoClient, ObjectId } = require('mongodb');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prism';
      const dbName = process.env.DB_NAME || 'prism';
      
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.isConnected = true;
      
      // Create indexes for better performance
      await this.createIndexes();
      
      console.log(`✅ Connected to MongoDB database: ${dbName}`);
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('📴 Disconnected from MongoDB');
    }
  }

  async createIndexes() {
    try {
      // Users collection indexes
      await this.users().createIndex({ email: 1 }, { unique: true });
      await this.users().createIndex({ username: 1 }, { unique: true });
      await this.users().createIndex({ role: 1 });
      await this.users().createIndex({ isCreator: 1 });
      await this.users().createIndex({ createdAt: -1 });

      // Content collection indexes
      await this.content().createIndex({ creatorId: 1 });
      await this.content().createIndex({ status: 1 });
      await this.content().createIndex({ category: 1 });
      await this.content().createIndex({ tags: 1 });
      await this.content().createIndex({ createdAt: -1 });
      await this.content().createIndex({ publishedAt: -1 });
      await this.content().createIndex({ views: -1 });
      
      // Text search index for content
      await this.content().createIndex({ 
        title: 'text', 
        description: 'text', 
        tags: 'text' 
      });

      // Advanced Media collection indexes - Month 4
      await this.advancedMedia().createIndex({ creatorId: 1, createdAt: -1 });
      await this.advancedMedia().createIndex({ 'processing.status': 1 });
      await this.advancedMedia().createIndex({ tags: 1 });
      await this.advancedMedia().createIndex({ mediaType: 1, privacy: 1 });
      await this.advancedMedia().createIndex({ 'analytics.views': -1 });
      await this.advancedMedia().createIndex({ folders: 1 });

      // Streaming Sessions indexes
      await this.streamingSessions().createIndex({ streamId: 1 }, { unique: true });
      await this.streamingSessions().createIndex({ creatorId: 1, createdAt: -1 });
      await this.streamingSessions().createIndex({ status: 1 });

      // Processing Jobs indexes
      await this.processingJobs().createIndex({ status: 1, priority: -1, 'timing.queuedAt': 1 });
      await this.processingJobs().createIndex({ mediaId: 1 });
      await this.processingJobs().createIndex({ creatorId: 1 });

      // CDN Analytics indexes
      await this.cdnAnalytics().createIndex({ period: 1, timestamp: -1 });

      console.log('📊 Database indexes created successfully');
    } catch (error) {
      console.warn('⚠️ Some indexes may already exist:', error.message);
    }
  }

  getDb() {
    if (!this.isConnected || !this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  // Collection helpers
  users() {
    return this.getDb().collection('users');
  }

  content() {
    return this.getDb().collection('content');
  }

  streams() {
    return this.getDb().collection('streams');
  }

  subscriptions() {
    return this.getDb().collection('subscriptions');
  }

  payments() {
    return this.getDb().collection('payments');
  }

  analytics() {
    return this.getDb().collection('analytics');
  }

  // Advanced Media collections - Month 4: Erweiterte Medien-Funktionen
  advancedMedia() {
    return this.getDb().collection('advancedMedia');
  }

  mediaCollections() {
    return this.getDb().collection('mediaCollections');
  }

  streamingSessions() {
    return this.getDb().collection('streamingSessions');
  }

  processingJobs() {
    return this.getDb().collection('processingJobs');
  }

  cdnAnalytics() {
    return this.getDb().collection('cdnAnalytics');
  }

  // Helper method to create ObjectId
  createObjectId(id) {
    if (id && ObjectId.isValid(id)) {
      return new ObjectId(id);
    }
    return new ObjectId();
  }

  // Helper method to validate ObjectId
  isValidObjectId(id) {
    return ObjectId.isValid(id);
  }
}

// Data Models/Schemas (validation helpers)
const models = {
  user: {
    create: (userData) => ({
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash,
      profile: {
        displayName: userData.displayName || userData.username,
        bio: userData.bio || '',
        avatar: userData.avatar || null,
        banner: userData.banner || null
      },
      role: userData.role || 'user', // user, creator, admin
      isCreator: userData.isCreator || false,
      isVerified: userData.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date()
    }),

    validate: (userData) => {
      const errors = [];
      
      if (!userData.username || userData.username.length < 3) {
        errors.push('Username must be at least 3 characters');
      }
      
      if (!userData.email || !userData.email.includes('@')) {
        errors.push('Valid email is required');
      }
      
      if (!userData.password || userData.password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
      
      return { isValid: errors.length === 0, errors };
    }
  },

  content: {
    create: (contentData) => ({
      title: contentData.title,
      description: contentData.description || '',
      creatorId: contentData.creatorId,
      type: contentData.type || 'video', // video, audio, image, text
      status: contentData.status || 'draft', // draft, published, private, deleted
      mediaUrl: contentData.mediaUrl || null,
      thumbnailUrl: contentData.thumbnailUrl || null,
      duration: contentData.duration || null,
      fileSize: contentData.fileSize || null,
      tags: contentData.tags || [],
      category: contentData.category || 'general',
      isPremium: contentData.isPremium || false,
      price: contentData.price || null,
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: contentData.status === 'published' ? new Date() : null
    }),

    validate: (contentData) => {
      const errors = [];
      
      if (!contentData.title || contentData.title.length < 1) {
        errors.push('Title is required');
      }
      
      if (!contentData.creatorId) {
        errors.push('Creator ID is required');
      }
      
      return { isValid: errors.length === 0, errors };
    }
  },

  // ============================================================================
  // ADVANCED MEDIA MODELS - Month 4: Erweiterte Medien-Funktionen
  // ============================================================================

  advancedMedia: {
    create: (mediaData) => ({
      creatorId: new ObjectId(mediaData.creatorId),
      title: mediaData.title,
      description: mediaData.description || '',
      mediaType: mediaData.mediaType,
      
      originalFile: {
        filename: mediaData.filename,
        originalName: mediaData.originalName,
        mimeType: mediaData.mimeType,
        size: mediaData.size,
        path: mediaData.path,
        checksum: mediaData.checksum,
        uploadedAt: new Date()
      },

      processing: {
        status: 'pending',
        progress: 0,
        profiles: []
      },

      cdn: {
        distributed: false,
        providers: [],
        purgeRequested: false
      },

      urls: {
        original: mediaData.originalUrl || '',
        thumbnail: '',
        web: '',
        mobile: '',
        hls: '',
        dash: ''
      },

      metadata: {
        duration: mediaData.duration || 0,
        dimensions: {
          width: mediaData.width || 0,
          height: mediaData.height || 0
        },
        extractedAt: new Date()
      },

      analytics: {
        views: 0,
        downloads: 0,
        streams: 0,
        totalWatchTime: 0,
        uniqueViewers: 0,
        averageWatchTime: 0,
        bounceRate: 0,
        engagementScore: 0,
        conversionRate: 0
      },

      folders: mediaData.folders || [],
      tags: mediaData.tags || [],
      categories: mediaData.categories || [],
      
      privacy: mediaData.privacy || 'private',
      accessControl: {
        allowDownload: mediaData.allowDownload !== false,
        allowEmbed: mediaData.allowEmbed !== false,
        allowShare: mediaData.allowShare !== false,
        geoRestrictions: [],
        ageRestriction: 0
      },

      monetization: {
        enabled: false,
        price: 0,
        currency: 'USD',
        purchaseCount: 0,
        revenue: 0
      },

      createdAt: new Date(),
      updatedAt: new Date()
    }),

    validate: (mediaData) => {
      const errors = [];
      
      if (!mediaData.title) {
        errors.push('Title is required');
      }
      
      if (!mediaData.creatorId) {
        errors.push('Creator ID is required');
      }
      
      if (!mediaData.mediaType || !['video', 'audio', 'image', 'document', 'archive'].includes(mediaData.mediaType)) {
        errors.push('Valid media type is required');
      }
      
      return { isValid: errors.length === 0, errors };
    }
  },

  streamingSession: {
    create: (sessionData) => ({
      streamId: sessionData.streamId,
      creatorId: new ObjectId(sessionData.creatorId),
      title: sessionData.title,
      description: sessionData.description || '',

      config: {
        bitrate: sessionData.bitrate || 3000,
        resolution: sessionData.resolution || '1920x1080',
        framerate: sessionData.framerate || 30,
        encoder: sessionData.encoder || 'x264',
        keyframeInterval: sessionData.keyframeInterval || 2,
        audioCodec: sessionData.audioCodec || 'aac',
        videoBitrate: sessionData.videoBitrate || 2500,
        audioBitrate: sessionData.audioBitrate || 128
      },

      platforms: sessionData.platforms || [],
      scenes: sessionData.scenes || [],
      currentScene: sessionData.currentScene || 'default',

      health: {
        status: 'offline',
        bitrate: 0,
        framerate: 0,
        droppedFrames: 0,
        networkHealth: 'unknown'
      },

      recordings: [],

      chatSettings: {
        enabled: true,
        moderation: {
          autoMod: true,
          slowMode: 0,
          followersOnly: false,
          bannedWords: [],
          bannedUsers: []
        }
      },

      analytics: {
        totalViewers: 0,
        peakViewers: 0,
        averageViewers: 0,
        totalChatMessages: 0,
        uniqueChatters: 0,
        followersGained: 0,
        donations: 0,
        watchTimeMinutes: 0
      },

      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }),

    validate: (sessionData) => {
      const errors = [];
      
      if (!sessionData.streamId) {
        errors.push('Stream ID is required');
      }
      
      if (!sessionData.creatorId) {
        errors.push('Creator ID is required');
      }
      
      if (!sessionData.title) {
        errors.push('Stream title is required');
      }
      
      return { isValid: errors.length === 0, errors };
    }
  },

  processingJob: {
    create: (jobData) => ({
      jobId: jobData.jobId,
      mediaId: new ObjectId(jobData.mediaId),
      creatorId: new ObjectId(jobData.creatorId),
      type: jobData.type,
      priority: jobData.priority || 5,
      
      input: {
        filePath: jobData.inputPath,
        format: jobData.inputFormat,
        size: jobData.inputSize
      },
      
      output: {
        profiles: jobData.profiles || []
      },
      
      progress: {
        overall: 0,
        currentStep: 'queued',
        totalSteps: jobData.totalSteps || 1,
        completedSteps: 0,
        estimatedTimeRemaining: null
      },
      
      status: 'queued',
      
      timing: {
        queuedAt: new Date(),
        retryCount: 0
      },
      
      logs: []
    }),

    validate: (jobData) => {
      const errors = [];
      
      if (!jobData.jobId) {
        errors.push('Job ID is required');
      }
      
      if (!jobData.mediaId) {
        errors.push('Media ID is required');
      }
      
      if (!jobData.type || !['video_encode', 'audio_encode', 'image_optimize', 'thumbnail_generate', 'metadata_extract'].includes(jobData.type)) {
        errors.push('Valid job type is required');
      }
      
      return { isValid: errors.length === 0, errors };
    }
  }
};

// Create singleton instance
const database = new Database();

module.exports = {
  database,
  models
};
