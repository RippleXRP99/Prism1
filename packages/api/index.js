const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import modules
const { database } = require('../database');
const auth = require('../auth');
const { roleManager, requirePermission, requireRole, router: rolesRouter } = require('../auth/roles');
const utils = require('../utils');

const app = express();
const PORT = process.env.API_PORT || 3004;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3005'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'PRISM API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: database.isConnected ? 'Connected' : 'Disconnected'
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'PRISM API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        refresh: 'POST /api/auth/refresh'
      },
      users: {
        list: 'GET /api/users',
        profile: 'GET /api/users/:id',
        update: 'PUT /api/users/:id'
      },
      content: {
        list: 'GET /api/content',
        create: 'POST /api/content',
        get: 'GET /api/content/:id',
        update: 'PUT /api/content/:id',
        delete: 'DELETE /api/content/:id'
      }
    }
  });
});

// === AUTHENTICATION ROUTES ===

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, displayName, isCreator } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json(utils.response.error('Username, email, and password are required'));
    }
    
    if (!utils.isValidEmail(email)) {
      return res.status(400).json(utils.response.error('Invalid email format'));
    }
    
    if (password.length < 6) {
      return res.status(400).json(utils.response.error('Password must be at least 6 characters'));
    }
    
    // Check if user already exists
    const existingUser = await database.users().findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(409).json(utils.response.error('User already exists with this email or username'));
    }
    
    // Hash password
    const passwordHash = await auth.hashPassword(password);
    
    // Create user
    const userData = {
      username,
      email,
      passwordHash,
      displayName: displayName || username,
      isCreator: isCreator || false,
      role: 'user',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActive: new Date(),
      profile: {
        bio: '',
        avatar: null,
        banner: null
      }
    };
    
    const result = await database.users().insertOne(userData);
    const user = await database.users().findOne({ _id: result.insertedId });
    
    // Generate JWT token
    const token = auth.generateToken({
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isCreator: user.isCreator
    });
    
    // Remove password from response
    delete user.passwordHash;
    
    res.status(201).json(utils.response.success({
      user,
      token
    }, 'User registered successfully'));
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(utils.response.error('Registration failed'));
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json(utils.response.error('Email and password are required'));
    }
    
    // Find user
    const user = await database.users().findOne({ email });
    if (!user) {
      return res.status(401).json(utils.response.error('Invalid credentials'));
    }
    
    // Check password
    const isValidPassword = await auth.comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json(utils.response.error('Invalid credentials'));
    }
    
    // Update last active
    await database.users().updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date() } }
    );
    
    // Generate JWT token
    const token = auth.generateToken({
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isCreator: user.isCreator
    });
    
    // Remove password from response
    delete user.passwordHash;
    
    res.json(utils.response.success({
      user,
      token
    }, 'Login successful'));
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(utils.response.error('Login failed'));
  }
});

// Get user profile (protected)
app.get('/api/auth/profile', auth.authenticate, async (req, res) => {
  try {
    const user = await database.users().findOne(
      { _id: database.createObjectId(req.user.userId) },
      { projection: { passwordHash: 0 } }
    );
    
    if (!user) {
      return res.status(404).json(utils.response.error('User not found'));
    }
    
    res.json(utils.response.success(user, 'Profile retrieved successfully'));
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json(utils.response.error('Failed to retrieve profile'));
  }
});

// === USER ROUTES ===

// Get users list (with pagination)
app.get('/api/users', auth.optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const pagination = utils.paginate(page, limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { 'profile.displayName': { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }
    
    // Get users
    const users = await database.users()
      .find(query, { projection: { passwordHash: 0 } })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await database.users().countDocuments(query);
    
    res.json(utils.response.paginated(users, { ...pagination, total }));
    
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json(utils.response.error('Failed to retrieve users'));
  }
});

// Get user by ID
app.get('/api/users/:id', auth.optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!database.isValidObjectId(id)) {
      return res.status(400).json(utils.response.error('Invalid user ID format'));
    }
    
    const user = await database.users().findOne(
      { _id: database.createObjectId(id) },
      { projection: { passwordHash: 0, email: 0 } } // Hide sensitive info for public view
    );
    
    if (!user) {
      return res.status(404).json(utils.response.error('User not found'));
    }
    
    res.json(utils.response.success(user, 'User retrieved successfully'));
    
  } catch (error) {
    console.error('User get error:', error);
    res.status(500).json(utils.response.error('Failed to retrieve user'));
  }
});

// Update user profile (protected)
app.put('/api/users/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!database.isValidObjectId(id)) {
      return res.status(400).json(utils.response.error('Invalid user ID format'));
    }
    
    // Users can only update their own profile (or admins can update any)
    if (req.user.userId.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json(utils.response.error('Access denied'));
    }
    
    const { displayName, bio, avatar, banner } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (displayName) updateData['profile.displayName'] = displayName;
    if (bio !== undefined) updateData['profile.bio'] = bio;
    if (avatar !== undefined) updateData['profile.avatar'] = avatar;
    if (banner !== undefined) updateData['profile.banner'] = banner;
    
    const result = await database.users().updateOne(
      { _id: database.createObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json(utils.response.error('User not found'));
    }
    
    const updatedUser = await database.users().findOne(
      { _id: database.createObjectId(id) },
      { projection: { passwordHash: 0 } }
    );
    
    res.json(utils.response.success(updatedUser, 'Profile updated successfully'));
    
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json(utils.response.error('Failed to update profile'));
  }
});

// === CONTENT ROUTES ===

// Get content list (with pagination and filters)
app.get('/api/content', auth.optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, creatorId, status = 'published' } = req.query;
    const pagination = utils.paginate(page, limit);
    
    // Build query
    const query = { status };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (creatorId) {
      query.creatorId = creatorId;
    }
    
    // Get content
    const content = await database.content()
      .find(query)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await database.content().countDocuments(query);
    
    res.json(utils.response.paginated(content, { ...pagination, total }));
    
  } catch (error) {
    console.error('Content list error:', error);
    res.status(500).json(utils.response.error('Failed to retrieve content'));
  }
});

// Create new content (protected, creators only)
app.post('/api/content', auth.authenticate, async (req, res) => {
  try {
    if (!req.user.isCreator && req.user.role !== 'admin') {
      return res.status(403).json(utils.response.error('Only creators can create content'));
    }
    
    const { title, description, type, category, tags, isPremium, price } = req.body;
    
    if (!title) {
      return res.status(400).json(utils.response.error('Title is required'));
    }
    
    const contentData = {
      title,
      description: description || '',
      creatorId: req.user.userId,
      type: type || 'video',
      status: 'draft',
      category: category || 'general',
      tags: tags || [],
      isPremium: isPremium || false,
      price: isPremium ? (price || 0) : null,
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: 0,
      mediaUrl: null,
      thumbnailUrl: null,
      duration: null,
      fileSize: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null
    };
    
    const result = await database.content().insertOne(contentData);
    const content = await database.content().findOne({ _id: result.insertedId });
    
    res.status(201).json(utils.response.success(content, 'Content created successfully'));
    
  } catch (error) {
    console.error('Content creation error:', error);
    res.status(500).json(utils.response.error('Failed to create content'));
  }
});

// Get content by ID
app.get('/api/content/:id', auth.optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!database.isValidObjectId(id)) {
      return res.status(400).json(utils.response.error('Invalid content ID format'));
    }
    
    const content = await database.content().findOne({ _id: database.createObjectId(id) });
    
    if (!content) {
      return res.status(404).json(utils.response.error('Content not found'));
    }
    
    // Check access permissions
    if (content.status === 'private' && req.user?.userId !== content.creatorId) {
      return res.status(403).json(utils.response.error('Access denied'));
    }
    
    if (content.status === 'draft' && req.user?.userId !== content.creatorId && req.user?.role !== 'admin') {
      return res.status(403).json(utils.response.error('Access denied'));
    }
    
    // Increment view count (only for published content)
    if (content.status === 'published') {
      await database.content().updateOne(
        { _id: database.createObjectId(id) },
        { $inc: { views: 1 } }
      );
      content.views += 1;
    }
    
    res.json(utils.response.success(content, 'Content retrieved successfully'));
    
  } catch (error) {
    console.error('Content get error:', error);
    res.status(500).json(utils.response.error('Failed to retrieve content'));
  }
});

// Update content (protected, creator or admin only)
app.put('/api/content/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!database.isValidObjectId(id)) {
      return res.status(400).json(utils.response.error('Invalid content ID format'));
    }
    
    const content = await database.content().findOne({ _id: database.createObjectId(id) });
    if (!content) {
      return res.status(404).json(utils.response.error('Content not found'));
    }
    
    // Check permissions
    if (content.creatorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json(utils.response.error('Access denied'));
    }
    
    const { title, description, category, tags, status, isPremium, price } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (isPremium !== undefined) updateData.isPremium = isPremium;
    if (price !== undefined) updateData.price = isPremium ? price : null;
    
    if (status && ['draft', 'published', 'private'].includes(status)) {
      updateData.status = status;
      if (status === 'published' && content.status !== 'published') {
        updateData.publishedAt = new Date();
      }
    }
    
    await database.content().updateOne({ _id: database.createObjectId(id) }, { $set: updateData });
    
    const updatedContent = await database.content().findOne({ _id: database.createObjectId(id) });
    
    res.json(utils.response.success(updatedContent, 'Content updated successfully'));
    
  } catch (error) {
    console.error('Content update error:', error);
    res.status(500).json(utils.response.error('Failed to update content'));
  }
});

// Delete content (protected, creator or admin only)
app.delete('/api/content/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!database.isValidObjectId(id)) {
      return res.status(400).json(utils.response.error('Invalid content ID format'));
    }
    
    const content = await database.content().findOne({ _id: database.createObjectId(id) });
    if (!content) {
      return res.status(404).json(utils.response.error('Content not found'));
    }
    
    // Check permissions
    if (content.creatorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json(utils.response.error('Access denied'));
    }
    
    await database.content().deleteOne({ _id: database.createObjectId(id) });
    
    res.json(utils.response.success(null, 'Content deleted successfully'));
    
  } catch (error) {
    console.error('Content delete error:', error);
    res.status(500).json(utils.response.error('Failed to delete content'));
  }
});

// ============================================================================
// ADVANCED MEDIA ENDPOINTS - Month 4: Erweiterte Medien-Funktionen
// ============================================================================

// Import advanced media modules
const AdvancedStreamingManager = require('../media/advanced-streaming');
const MediaProcessingPipeline = require('../media/processing-pipeline');
const { CDNManager } = require('../media/cdn-integration');
const MediaLibraryManager = require('../media/library-manager');

// Initialize advanced media services
const advancedStreaming = new AdvancedStreamingManager();
const processingPipeline = new MediaProcessingPipeline();
const cdnManager = new CDNManager();
const libraryManager = new MediaLibraryManager(
  database, // MongoDB connection
  cdnManager,
  processingPipeline
);

// Advanced media upload with processing pipeline
app.post('/api/media/advanced-upload', auth.authenticate, async (req, res) => {
  const upload = mediaHandler.createUploadMiddleware();
  
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Advanced upload error:', err);
      return res.status(400).json(utils.response.error(err.message));
    }

    try {
      if (!req.file) {
        return res.status(400).json(utils.response.error('No file provided'));
      }

      const metadata = JSON.parse(req.body.metadata || '{}');
      metadata.creatorId = req.user.userId;

      // Upload and process with advanced pipeline
      const result = await libraryManager.uploadMedia(req.file, metadata);

      res.json(utils.response.success('Media upload started', result));

    } catch (error) {
      console.error('Advanced media processing error:', error);
      res.status(500).json(utils.response.error('Failed to process media upload'));
    }
  });
});

// Advanced media search and filtering
app.get('/api/media/search', auth.authenticate, async (req, res) => {
  try {
    const query = {
      search: req.query.search || '',
      filters: {},
      sort: req.query.sort || 'createdAt_desc',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      includeAnalytics: req.query.analytics === 'true'
    };

    // Parse filters from query parameters
    Object.keys(req.query).forEach(key => {
      if (key.startsWith('filter_')) {
        const filterName = key.replace('filter_', '');
        const filterValue = req.query[key];
        
        if (filterValue.includes(',')) {
          query.filters[filterName] = filterValue.split(',');
        } else {
          try {
            query.filters[filterName] = JSON.parse(filterValue);
          } catch {
            query.filters[filterName] = filterValue;
          }
        }
      }
    });

    const results = await libraryManager.searchMedia(req.user.userId, query);
    
    res.json(utils.response.success('Media search completed', results.data, {
      pagination: results.pagination,
      filters: results.filters,
      appliedFilters: results.appliedFilters
    }));

  } catch (error) {
    console.error('Media search error:', error);
    res.status(500).json(utils.response.error('Media search failed'));
  }
});

// Media analytics endpoint
app.get('/api/media/:mediaId/analytics', auth.authenticate, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const timeRange = req.query.range || '30d';

    const analytics = await libraryManager.getMediaAnalytics(mediaId, timeRange);
    
    res.json(utils.response.success('Analytics retrieved', analytics));

  } catch (error) {
    console.error('Media analytics error:', error);
    res.status(500).json(utils.response.error('Failed to get analytics'));
  }
});

// Bulk media operations
app.post('/api/media/bulk-update', auth.authenticate, async (req, res) => {
  try {
    const { mediaIds, updates } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json(utils.response.error('No media IDs provided'));
    }

    const result = await libraryManager.bulkUpdateMedia(mediaIds, updates, req.user.userId);
    
    res.json(utils.response.success('Bulk update completed', result));

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json(utils.response.error('Bulk update failed'));
  }
});

app.post('/api/media/bulk-delete', auth.authenticate, async (req, res) => {
  try {
    const { mediaIds } = req.body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json(utils.response.error('No media IDs provided'));
    }

    const result = await libraryManager.bulkDeleteMedia(mediaIds, req.user.userId);
    
    res.json(utils.response.success('Bulk delete completed', result));

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json(utils.response.error('Bulk delete failed'));
  }
});

// CDN management endpoints
app.post('/api/media/:mediaId/cdn/:action', auth.authenticate, async (req, res) => {
  try {
    const { mediaId, action } = req.params;

    // Get media info
    const media = await libraryManager.getMediaById(mediaId);
    if (!media) {
      return res.status(404).json(utils.response.error('Media not found'));
    }

    // Verify ownership
    if (media.creatorId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json(utils.response.error('Access denied'));
    }

    let result;
    switch (action) {
      case 'purge':
        result = await cdnManager.purgeContent(media.urls.original);
        break;
      case 'distribute':
        result = await cdnManager.distributeContent(media);
        break;
      case 'analytics':
        result = await cdnManager.getCDNAnalytics('24h');
        break;
      default:
        return res.status(400).json(utils.response.error('Invalid CDN action'));
    }

    res.json(utils.response.success(`CDN ${action} completed`, result));

  } catch (error) {
    console.error('CDN action error:', error);
    res.status(500).json(utils.response.error(`CDN ${req.params.action} failed`));
  }
});

// Processing pipeline status
app.get('/api/media/processing/status', auth.authenticate, async (req, res) => {
  try {
    const queueStatus = processingPipeline.getQueueStatus();
    
    res.json(utils.response.success('Processing status retrieved', queueStatus));

  } catch (error) {
    console.error('Processing status error:', error);
    res.status(500).json(utils.response.error('Failed to get processing status'));
  }
});

app.get('/api/media/processing/:jobId', auth.authenticate, async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobStatus = processingPipeline.getJobStatus(jobId);
    
    if (!jobStatus) {
      return res.status(404).json(utils.response.error('Processing job not found'));
    }

    res.json(utils.response.success('Job status retrieved', jobStatus));

  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json(utils.response.error('Failed to get job status'));
  }
});

// Library overview and statistics
app.get('/api/media/library/overview', auth.authenticate, async (req, res) => {
  try {
    const overview = await libraryManager.getLibraryOverview(req.user.userId);
    
    res.json(utils.response.success('Library overview retrieved', overview));

  } catch (error) {
    console.error('Library overview error:', error);
    res.status(500).json(utils.response.error('Failed to get library overview'));
  }
});

// Folder management
app.post('/api/media/folders', auth.authenticate, async (req, res) => {
  try {
    const folderData = req.body;
    const folder = await libraryManager.createFolder(req.user.userId, folderData);
    
    res.json(utils.response.success('Folder created', folder));

  } catch (error) {
    console.error('Folder creation error:', error);
    res.status(500).json(utils.response.error('Failed to create folder'));
  }
});

app.get('/api/media/folders', auth.authenticate, async (req, res) => {
  try {
    const folderStructure = await libraryManager.getFolderStructure(req.user.userId);
    
    res.json(utils.response.success('Folder structure retrieved', folderStructure));

  } catch (error) {
    console.error('Folder structure error:', error);
    res.status(500).json(utils.response.error('Failed to get folder structure'));
  }
});

// ============================================================================
// ADVANCED STREAMING ENDPOINTS - Month 4: Fortschrittliche Streaming-Funktionen
// ============================================================================

// Advanced stream configuration and multi-platform streaming
app.post('/api/streams/advanced', auth.authenticate, async (req, res) => {
  try {
    const streamConfig = req.body;
    streamConfig.creatorId = req.user.userId;
    streamConfig.streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Configure advanced stream
    const config = advancedStreaming.configureAdvancedStream(streamConfig.streamId, streamConfig);
    
    // Start multi-platform streaming if enabled
    let platformResults = {};
    if (streamConfig.platforms && streamConfig.platforms.length > 1) {
      platformResults = await advancedStreaming.startMultiplatformStream(
        streamConfig.streamId, 
        streamConfig.platforms
      );
    }

    res.json(utils.response.success('Advanced stream configured', {
      streamId: streamConfig.streamId,
      config: config,
      platforms: platformResults,
      estimatedLatency: '3-5 seconds'
    }));

  } catch (error) {
    console.error('Advanced stream setup error:', error);
    res.status(500).json(utils.response.error('Failed to setup advanced stream'));
  }
});

// Scene management
app.post('/api/streams/scene', auth.authenticate, async (req, res) => {
  try {
    const { streamId, sceneName, transition } = req.body;

    const result = await advancedStreaming.switchScene(streamId, sceneName, transition);
    
    res.json(utils.response.success('Scene switched', result));

  } catch (error) {
    console.error('Scene switch error:', error);
    res.status(500).json(utils.response.error('Failed to switch scene'));
  }
});

// Stream health monitoring
app.get('/api/streams/:streamId/health', auth.authenticate, async (req, res) => {
  try {
    const { streamId } = req.params;
    const health = advancedStreaming.getStreamHealth(streamId);
    
    if (!health) {
      return res.status(404).json(utils.response.error('Stream not found'));
    }

    res.json(utils.response.success('Stream health retrieved', health));

  } catch (error) {
    console.error('Stream health error:', error);
    res.status(500).json(utils.response.error('Failed to get stream health'));
  }
});

// Recording management
app.post('/api/streams/:streamId/recording/start', auth.authenticate, async (req, res) => {
  try {
    const { streamId } = req.params;
    const { quality } = req.body;

    const result = await advancedStreaming.startRecording(streamId, quality);
    
    res.json(utils.response.success('Recording started', result));

  } catch (error) {
    console.error('Recording start error:', error);
    res.status(500).json(utils.response.error('Failed to start recording'));
  }
});

app.post('/api/streams/:streamId/recording/:recordingId/stop', auth.authenticate, async (req, res) => {
  try {
    const { recordingId } = req.params;

    const result = await advancedStreaming.stopRecording(recordingId);
    
    res.json(utils.response.success('Recording stopped', result));

  } catch (error) {
    console.error('Recording stop error:', error);
    res.status(500).json(utils.response.error('Failed to stop recording'));
  }
});

// Chat moderation configuration
app.post('/api/streams/:streamId/chat/moderation', auth.authenticate, async (req, res) => {
  try {
    const { streamId } = req.params;
    const settings = req.body;

    const result = advancedStreaming.configureChatModeration(streamId, settings);
    
    res.json(utils.response.success('Chat moderation configured', result));

  } catch (error) {
    console.error('Chat moderation error:', error);
    res.status(500).json(utils.response.error('Failed to configure chat moderation'));
  }
});

// ============================================================================
// MEDIA ENDPOINTS - Phase 3: Media, Streaming, Payments
// ============================================================================

// Import media handler
const mediaHandler = require('../media/media-handler');

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Media upload endpoint
app.post('/api/media/upload', auth.authenticate, (req, res) => {
  const upload = mediaHandler.createUploadMiddleware();
  
  upload.array('files', 10)(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json(utils.response.error(err.message));
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(utils.response.error('No files provided'));
      }

      const uploadedFiles = [];
      
      for (const file of req.files) {
        const processedFile = await mediaHandler.processUploadedFile(
          file, 
          req.user.userId,
          req.body.contentType || 'content'
        );
        uploadedFiles.push(processedFile);
      }

      res.json(utils.response.success('Files uploaded successfully', {
        files: uploadedFiles,
        totalFiles: uploadedFiles.length,
        uploadedAt: new Date()
      }));

    } catch (error) {
      console.error('File processing error:', error);
      res.status(500).json(utils.response.error('Failed to process uploaded files'));
    }
  });
});

// Get file metadata
app.get('/api/media/:fileId', auth.optionalAuth, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // TODO: Implement database lookup for file metadata
    // For now, return placeholder data
    const fileMetadata = {
      id: fileId,
      originalName: 'sample-video.mp4',
      fileType: 'video',
      fileSize: 15728640, // 15MB
      uploadedAt: new Date(),
      url: `/uploads/videos/${fileId}`,
      thumbnail: `/uploads/thumbnails/${fileId}_thumb.jpg`,
      metadata: {
        duration: 180, // 3 minutes
        resolution: '1920x1080',
        bitrate: '2000kbps'
      }
    };

    res.json(utils.response.success('File metadata retrieved', fileMetadata));
  } catch (error) {
    console.error('File metadata error:', error);
    res.status(500).json(utils.response.error('Failed to get file metadata'));
  }
});

// Delete uploaded file
app.delete('/api/media/:fileId', auth.authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // TODO: Implement file deletion logic with database lookup
    // For now, simulate successful deletion
    
    res.json(utils.response.success('File deleted successfully', {
      fileId,
      deletedAt: new Date()
    }));
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json(utils.response.error('Failed to delete file'));
  }
});

// ============================================================================
// STREAMING ENDPOINTS - Phase 3: WebRTC/Socket.io Integration
// ============================================================================

// Get active streams
app.get('/api/streams', auth.optionalAuth, async (req, res) => {
  try {
    // TODO: Get streams from streaming manager
    const mockStreams = [
      {
        id: 'stream_123',
        title: 'Live Gaming Session',
        creatorId: 'creator_456',
        creatorName: 'GamerPro',
        viewers: 1250,
        category: 'gaming',
        startedAt: new Date(Date.now() - 3600000), // 1 hour ago
        thumbnail: '/uploads/thumbnails/stream_123_thumb.jpg'
      },
      {
        id: 'stream_789',
        title: 'Cooking Tutorial',
        creatorId: 'creator_101',
        creatorName: 'ChefMaster',
        viewers: 850,
        category: 'lifestyle',
        startedAt: new Date(Date.now() - 1800000), // 30 minutes ago
        thumbnail: '/uploads/thumbnails/stream_789_thumb.jpg'
      }
    ];

    res.json(utils.response.success('Active streams retrieved', {
      streams: mockStreams,
      totalStreams: mockStreams.length
    }));
  } catch (error) {
    console.error('Streams error:', error);
    res.status(500).json(utils.response.error('Failed to get active streams'));
  }
});

// Create new stream
app.post('/api/streams', auth.authenticate, async (req, res) => {
  try {
    const { title, description, category, isPrivate = false } = req.body;
    
    if (!title) {
      return res.status(400).json(utils.response.error('Stream title is required'));
    }

    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const streamData = {
      id: streamId,
      title,
      description: description || '',
      category: category || 'general',
      creatorId: req.user.userId,
      isPrivate,
      status: 'preparing',
      createdAt: new Date()
    };

    // TODO: Initialize stream with streaming manager
    
    res.json(utils.response.success('Stream created', streamData));
  } catch (error) {
    console.error('Stream creation error:', error);
    res.status(500).json(utils.response.error('Failed to create stream'));
  }
});

// Get stream details
app.get('/api/streams/:streamId', auth.optionalAuth, async (req, res) => {
  try {
    const { streamId } = req.params;
    
    // TODO: Get stream from streaming manager
    const mockStream = {
      id: streamId,
      title: 'Live Stream',
      description: 'An amazing live stream',
      creatorId: 'creator_123',
      creatorName: 'StreamerPro',
      viewers: 1000,
      category: 'entertainment',
      startedAt: new Date(Date.now() - 1800000),
      status: 'live'
    };

    res.json(utils.response.success('Stream details retrieved', mockStream));
  } catch (error) {
    console.error('Stream details error:', error);
    res.status(500).json(utils.response.error('Failed to get stream details'));
  }
});

// ============================================================================
// PAYMENT ENDPOINTS - Phase 3: Payment Integration (Prepared)
// ============================================================================

// Process tip payment
app.post('/api/payments/tip', auth.authenticate, async (req, res) => {
  try {
    const { creatorId, amount, currency = 'USD', message } = req.body;
    
    if (!creatorId || !amount) {
      return res.status(400).json(utils.response.error('Creator ID and amount are required'));
    }

    if (amount < 1) {
      return res.status(400).json(utils.response.error('Minimum tip amount is $1'));
    }

    // TODO: Process payment with payment manager
    const tipResult = {
      id: `tip_${Date.now()}`,
      creatorId,
      userId: req.user.userId,
      amount,
      currency,
      message: message || '',
      status: 'completed', // Placeholder
      processedAt: new Date()
    };

    res.json(utils.response.success('Tip sent successfully', tipResult));
  } catch (error) {
    console.error('Tip payment error:', error);
    res.status(500).json(utils.response.error('Failed to process tip'));
  }
});

// Get creator earnings
app.get('/api/payments/earnings', auth.authenticate, async (req, res) => {
  try {
    // TODO: Get earnings from payment manager
    const mockEarnings = {
      creatorId: req.user.userId,
      totalEarnings: 1234.56,
      thisMonth: 456.78,
      lastMonth: 321.45,
      tips: 123.45,
      subscriptions: 987.65,
      currency: 'USD',
      lastUpdated: new Date()
    };

    res.json(utils.response.success('Earnings retrieved', mockEarnings));
  } catch (error) {
    console.error('Earnings error:', error);
    res.status(500).json(utils.response.error('Failed to get earnings'));
  }
});

// ============================================================================
// SOCIAL INTERACTION ENDPOINTS - Month 5: Social Features
// ============================================================================

// Import social modules
const SocialInteractionSystem = require('../social/interaction-system');
const CreatorFanInteractionSystem = require('../social/creator-fan-interactions');
const SocialGraphSystem = require('../social/social-graph');

// Initialize social systems
const socialInteraction = new SocialInteractionSystem(database);
const creatorFanInteraction = new CreatorFanInteractionSystem(database);
const socialGraph = new SocialGraphSystem(database);

// Initialize social systems when server starts
async function initializeSocialSystems() {
  try {
    await socialInteraction.initialize();
    await creatorFanInteraction.initialize();
    await socialGraph.initialize();
    console.log('✅ Social systems initialized');
  } catch (error) {
    console.error('❌ Failed to initialize social systems:', error);
  }
}

// === COMMENT SYSTEM ENDPOINTS ===

// Add comment to content
app.post('/api/social/comments', auth.authenticate, async (req, res) => {
  try {
    const { contentId, text, parentId } = req.body;
    
    if (!contentId || !text) {
      return res.status(400).json(utils.response.error('Content ID and text are required'));
    }

    const comment = await socialInteraction.addComment(
      req.user.userId,
      contentId,
      text,
      parentId
    );
    
    res.json(utils.response.success('Comment added successfully', comment));

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json(utils.response.error('Failed to add comment'));
  }
});

// Get comments for content
app.get('/api/social/comments/:contentId', auth.optionalAuth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { page = 1, limit = 20, sort = 'newest' } = req.query;

    const comments = await socialInteraction.getComments(contentId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });
    
    res.json(utils.response.success('Comments retrieved', comments));

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json(utils.response.error('Failed to get comments'));
  }
});

// Update comment
app.put('/api/social/comments/:commentId', auth.authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await socialInteraction.updateComment(
      commentId,
      req.user.userId,
      { text }
    );
    
    res.json(utils.response.success('Comment updated successfully', comment));

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json(utils.response.error('Failed to update comment'));
  }
});

// Delete comment
app.delete('/api/social/comments/:commentId', auth.authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;

    await socialInteraction.deleteComment(commentId, req.user.userId);
    
    res.json(utils.response.success('Comment deleted successfully'));

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json(utils.response.error('Failed to delete comment'));
  }
});

// === LIKE SYSTEM ENDPOINTS ===

// Toggle like on content
app.post('/api/social/likes', auth.authenticate, async (req, res) => {
  try {
    const { contentId, targetType = 'content' } = req.body;
    
    if (!contentId) {
      return res.status(400).json(utils.response.error('Content ID is required'));
    }

    const result = await socialInteraction.toggleLike(
      req.user.userId,
      contentId,
      targetType
    );
    
    res.json(utils.response.success('Like toggled successfully', result));

  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json(utils.response.error('Failed to toggle like'));
  }
});

// Get likes for content
app.get('/api/social/likes/:contentId', auth.optionalAuth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const likes = await socialInteraction.getLikes(contentId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json(utils.response.success('Likes retrieved', likes));

  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json(utils.response.error('Failed to get likes'));
  }
});

// === DIRECT MESSAGING ENDPOINTS ===

// Send direct message
app.post('/api/social/messages', auth.authenticate, async (req, res) => {
  try {
    const { receiverId, text, attachments } = req.body;
    
    if (!receiverId || !text) {
      return res.status(400).json(utils.response.error('Receiver ID and text are required'));
    }

    const message = await socialInteraction.sendDirectMessage(
      req.user.userId,
      receiverId,
      text,
      attachments
    );
    
    res.json(utils.response.success('Message sent successfully', message));

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json(utils.response.error('Failed to send message'));
  }
});

// Get conversations for user
app.get('/api/social/conversations', auth.authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const conversations = await socialInteraction.getConversations(req.user.userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json(utils.response.success('Conversations retrieved', conversations));

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json(utils.response.error('Failed to get conversations'));
  }
});

// Get messages in conversation
app.get('/api/social/conversations/:conversationId/messages', auth.authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await socialInteraction.getMessages(
      conversationId,
      req.user.userId,
      {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    );
    
    res.json(utils.response.success('Messages retrieved', messages));

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json(utils.response.error('Failed to get messages'));
  }
});

// === SOCIAL GRAPH ENDPOINTS ===

// Follow/Unfollow user
app.post('/api/social/follow', auth.authenticate, async (req, res) => {
  try {
    const { targetUserId, action } = req.body; // action: 'follow' or 'unfollow'
    
    if (!targetUserId || !action) {
      return res.status(400).json(utils.response.error('Target user ID and action are required'));
    }

    let result;
    if (action === 'follow') {
      result = await socialInteraction.followUser(req.user.userId, targetUserId);
    } else if (action === 'unfollow') {
      result = await socialInteraction.unfollowUser(req.user.userId, targetUserId);
    } else {
      return res.status(400).json(utils.response.error('Invalid action'));
    }
    
    res.json(utils.response.success(`${action} successful`, result));

  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json(utils.response.error(`Failed to ${req.body.action}`));
  }
});

// Get user relationships
app.get('/api/social/relationships', auth.authenticate, async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;

    const relationships = await socialGraph.getRelationships(
      req.user.userId,
      type,
      {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    );
    
    res.json(utils.response.success('Relationships retrieved', relationships));

  } catch (error) {
    console.error('Get relationships error:', error);
    res.status(500).json(utils.response.error('Failed to get relationships'));
  }
});

// Get user recommendations
app.get('/api/social/recommendations', auth.authenticate, async (req, res) => {
  try {
    const { limit = 20, algorithm = 'hybrid' } = req.query;

    const recommendations = await socialGraph.getRecommendedUsers(
      req.user.userId,
      {
        limit: parseInt(limit),
        algorithm
      }
    );
    
    res.json(utils.response.success('Recommendations retrieved', recommendations));

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json(utils.response.error('Failed to get recommendations'));
  }
});

// === CREATOR-FAN INTERACTION ENDPOINTS ===

// Send tip to creator
app.post('/api/social/tips', auth.authenticate, async (req, res) => {
  try {
    const { creatorId, amount, message, isAnonymous = false } = req.body;
    
    if (!creatorId || !amount) {
      return res.status(400).json(utils.response.error('Creator ID and amount are required'));
    }

    if (amount < 1 || amount > 500) {
      return res.status(400).json(utils.response.error('Tip amount must be between $1 and $500'));
    }

    const tip = await creatorFanInteraction.sendTip(
      req.user.userId,
      creatorId,
      amount,
      message,
      isAnonymous
    );
    
    res.json(utils.response.success('Tip sent successfully', tip));

  } catch (error) {
    console.error('Send tip error:', error);
    res.status(500).json(utils.response.error('Failed to send tip'));
  }
});

// Purchase personal message request
app.post('/api/social/personal-messages', auth.authenticate, async (req, res) => {
  try {
    const { creatorId, message, priority = 'normal' } = req.body;
    
    if (!creatorId || !message) {
      return res.status(400).json(utils.response.error('Creator ID and message are required'));
    }

    const request = await creatorFanInteraction.purchasePersonalMessage(
      req.user.userId,
      creatorId,
      message,
      priority
    );
    
    res.json(utils.response.success('Personal message request created', request));

  } catch (error) {
    console.error('Personal message error:', error);
    res.status(500).json(utils.response.error('Failed to create personal message request'));
  }
});

// Schedule video call with creator
app.post('/api/social/video-calls', auth.authenticate, async (req, res) => {
  try {
    const { creatorId, requestedTime, duration = 15, topic } = req.body;
    
    if (!creatorId || !requestedTime) {
      return res.status(400).json(utils.response.error('Creator ID and requested time are required'));
    }

    const call = await creatorFanInteraction.scheduleVideoCall(
      req.user.userId,
      creatorId,
      new Date(requestedTime),
      duration,
      topic
    );
    
    res.json(utils.response.success('Video call scheduled', call));

  } catch (error) {
    console.error('Schedule video call error:', error);
    res.status(500).json(utils.response.error('Failed to schedule video call'));
  }
});

// Submit custom content request
app.post('/api/social/custom-requests', auth.authenticate, async (req, res) => {
  try {
    const { creatorId, description, contentType, budget, deadline } = req.body;
    
    if (!creatorId || !description || !contentType) {
      return res.status(400).json(utils.response.error('Creator ID, description, and content type are required'));
    }

    const request = await creatorFanInteraction.submitCustomRequest(
      req.user.userId,
      creatorId,
      description,
      contentType,
      budget,
      deadline ? new Date(deadline) : undefined
    );
    
    res.json(utils.response.success('Custom request submitted', request));

  } catch (error) {
    console.error('Custom request error:', error);
    res.status(500).json(utils.response.error('Failed to submit custom request'));
  }
});

// Join fan club
app.post('/api/social/fan-clubs/:creatorId/join', auth.authenticate, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { tier = 'basic' } = req.body;

    const membership = await creatorFanInteraction.joinFanClub(
      req.user.userId,
      creatorId,
      tier
    );
    
    res.json(utils.response.success('Joined fan club successfully', membership));

  } catch (error) {
    console.error('Join fan club error:', error);
    res.status(500).json(utils.response.error('Failed to join fan club'));
  }
});

// Get creator analytics (for creators only)
app.get('/api/social/creator/analytics', auth.authenticate, async (req, res) => {
  try {
    if (!req.user.isCreator && req.user.role !== 'admin') {
      return res.status(403).json(utils.response.error('Only creators can access analytics'));
    }

    const { period = '30d' } = req.query;

    const analytics = await creatorFanInteraction.getCreatorAnalytics(
      req.user.userId,
      period
    );
    
    res.json(utils.response.success('Creator analytics retrieved', analytics));

  } catch (error) {
    console.error('Creator analytics error:', error);
    res.status(500).json(utils.response.error('Failed to get creator analytics'));
  }
});

// Get top influencers
app.get('/api/social/influencers', auth.optionalAuth, async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;

    const influencers = await socialGraph.getTopInfluencers(
      category,
      parseInt(limit)
    );
    
    res.json(utils.response.success('Top influencers retrieved', influencers));

  } catch (error) {
    console.error('Get influencers error:', error);
    res.status(500).json(utils.response.error('Failed to get influencers'));
  }
});

// === ADMIN ENDPOINTS - Phase 4: Admin Dashboard, Erweiterungen ===
// Use role management middleware for admin endpoints

// Admin dashboard stats
app.get('/api/admin/stats', requireRole(['admin', 'moderator']), (req, res) => {
  try {
    const mockStats = {
      users: {
        total: 2847,
        active: 2456,
        creators: 432,
        newToday: 23
      },
      content: {
        total: 15642,
        published: 14890,
        flagged: 34,
        pending: 18,
        uploadedToday: 156
      },
      revenue: {
        total: 458920,
        thisMonth: 45892,
        lastMonth: 38456,
        platformFee: 22946
      },
      reports: {
        total: 234,
        pending: 23,
        resolved: 198,
        investigating: 13
      },
      system: {
        uptime: '99.7%',
        responseTime: '1.2s',
        activeStreams: 156,
        storageUsed: '89%'
      }
    };

    res.json(utils.response.success('Admin stats retrieved', mockStats));
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json(utils.response.error('Failed to get admin stats'));
  }
});

// Get all users for admin management
app.get('/api/admin/users', requirePermission('user.read'), (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    
    const mockUsers = [
      { 
        id: 1, 
        username: 'creator1', 
        email: 'creator@example.com', 
        role: 'creator', 
        status: 'active', 
        joinDate: '2025-01-15',
        totalContent: 25,
        totalRevenue: 1234.56,
        lastActive: '2025-07-23'
      },
      { 
        id: 2, 
        username: 'user123', 
        email: 'user@example.com', 
        role: 'user', 
        status: 'active', 
        joinDate: '2025-02-20',
        totalContent: 0,
        totalRevenue: 0,
        lastActive: '2025-07-22'
      },
      { 
        id: 3, 
        username: 'moderator1', 
        email: 'mod@example.com', 
        role: 'moderator', 
        status: 'active', 
        joinDate: '2025-01-01',
        totalContent: 0,
        totalRevenue: 0,
        lastActive: '2025-07-23'
      }
    ];

    let filteredUsers = mockUsers;
    
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    const total = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + parseInt(limit));

    res.json(utils.response.success('Users retrieved', {
      users: paginatedUsers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json(utils.response.error('Failed to get users'));
  }
});

// Update user role/status
app.put('/api/admin/users/:userId', requirePermission('user.update'), (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status, email } = req.body;

    // Mock user update
    res.json(utils.response.success('User updated successfully', {
      id: userId,
      role,
      status,
      email,
      updatedAt: new Date(),
      updatedBy: req.user.userId
    }));
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json(utils.response.error('Failed to update user'));
  }
});

// Suspend/activate user
app.post('/api/admin/users/:userId/suspend', requirePermission('user.suspend'), (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body;

    res.json(utils.response.success('User suspended successfully', {
      userId,
      status: 'suspended',
      reason,
      duration,
      suspendedBy: req.user.userId,
      suspendedAt: new Date()
    }));
  } catch (error) {
    console.error('User suspension error:', error);
    res.status(500).json(utils.response.error('Failed to suspend user'));
  }
});

// Get content for moderation
app.get('/api/admin/content', requirePermission('content.moderate'), (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const mockContent = [
      {
        id: 1,
        title: 'Amazing Tutorial',
        creator: 'creator1',
        creatorId: 1,
        views: 15420,
        status: 'published',
        created: '2025-07-20',
        reports: 0,
        duration: '10:34',
        size: '45.2 MB'
      },
      {
        id: 2,
        title: 'Live Stream Highlight',
        creator: 'creator1',
        creatorId: 1,
        views: 8900,
        status: 'published',
        created: '2025-07-22',
        reports: 2,
        duration: '15:22',
        size: '78.9 MB'
      },
      {
        id: 3,
        title: 'Controversial Video',
        creator: 'creator1',
        creatorId: 1,
        views: 2300,
        status: 'flagged',
        created: '2025-07-23',
        reports: 5,
        duration: '8:45',
        size: '32.1 MB'
      }
    ];

    let filteredContent = mockContent;
    
    if (status) {
      filteredContent = filteredContent.filter(item => item.status === status);
    }
    
    if (search) {
      filteredContent = filteredContent.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.creator.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = filteredContent.length;
    const startIndex = (page - 1) * limit;
    const paginatedContent = filteredContent.slice(startIndex, startIndex + parseInt(limit));

    res.json(utils.response.success('Content retrieved', {
      content: paginatedContent,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    console.error('Admin content error:', error);
    res.status(500).json(utils.response.error('Failed to get content'));
  }
});

// Moderate content (approve/reject)
app.post('/api/admin/content/:contentId/moderate', requirePermission('content.moderate'), (req, res) => {
  try {
    const { contentId } = req.params;
    const { action, reason } = req.body; // action: 'approve', 'reject', 'remove'

    res.json(utils.response.success('Content moderated successfully', {
      contentId,
      action,
      reason,
      moderatedBy: req.user.userId,
      moderatedAt: new Date()
    }));
  } catch (error) {
    console.error('Content moderation error:', error);
    res.status(500).json(utils.response.error('Failed to moderate content'));
  }
});

// Get reports
app.get('/api/admin/reports', requirePermission('report.read'), (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    
    const mockReports = [
      {
        id: 1,
        type: 'inappropriate_content',
        contentId: 2,
        contentTitle: 'Live Stream Highlight',
        reporter: 'user123',
        reporterId: 2,
        status: 'pending',
        reason: 'Contains inappropriate language',
        created: '2025-07-23 09:30',
        assignedTo: null
      },
      {
        id: 2,
        type: 'spam',
        contentId: 3,
        contentTitle: 'Controversial Video',
        reporter: 'user456',
        reporterId: 4,
        status: 'resolved',
        reason: 'Repetitive spam content',
        created: '2025-07-23 10:15',
        assignedTo: req.user.userId,
        resolvedAt: '2025-07-23 11:30'
      },
      {
        id: 3,
        type: 'harassment',
        userId: 3,
        username: 'problematic',
        reporter: 'user789',
        reporterId: 5,
        status: 'investigating',
        reason: 'Harassing other users in comments',
        created: '2025-07-23 11:00',
        assignedTo: req.user.userId
      }
    ];

    let filteredReports = mockReports;
    
    if (status) {
      filteredReports = filteredReports.filter(report => report.status === status);
    }
    
    if (type) {
      filteredReports = filteredReports.filter(report => report.type === type);
    }

    const total = filteredReports.length;
    const startIndex = (page - 1) * limit;
    const paginatedReports = filteredReports.slice(startIndex, startIndex + parseInt(limit));

    res.json(utils.response.success('Reports retrieved', {
      reports: paginatedReports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    console.error('Admin reports error:', error);
    res.status(500).json(utils.response.error('Failed to get reports'));
  }
});

// Handle report
app.post('/api/admin/reports/:reportId/handle', requirePermission('report.resolve'), (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, resolution, notes } = req.body; // action: 'resolve', 'escalate', 'dismiss'

    res.json(utils.response.success('Report handled successfully', {
      reportId,
      action,
      resolution,
      notes,
      handledBy: req.user.userId,
      handledAt: new Date()
    }));
  } catch (error) {
    console.error('Report handling error:', error);
    res.status(500).json(utils.response.error('Failed to handle report'));
  }
});

// System analytics
app.get('/api/admin/analytics', requirePermission('system.analytics'), (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y
    
    const mockAnalytics = {
      period,
      userGrowth: [
        { date: '2025-07-17', newUsers: 45, totalUsers: 2756 },
        { date: '2025-07-18', newUsers: 52, totalUsers: 2808 },
        { date: '2025-07-19', newUsers: 38, totalUsers: 2846 },
        { date: '2025-07-20', newUsers: 61, totalUsers: 2907 },
        { date: '2025-07-21', newUsers: 43, totalUsers: 2950 },
        { date: '2025-07-22', newUsers: 29, totalUsers: 2979 },
        { date: '2025-07-23', newUsers: 23, totalUsers: 3002 }
      ],
      contentStats: [
        { date: '2025-07-17', uploads: 156, views: 45231 },
        { date: '2025-07-18', uploads: 189, views: 52847 },
        { date: '2025-07-19', uploads: 142, views: 38592 },
        { date: '2025-07-20', uploads: 203, views: 61049 },
        { date: '2025-07-21', uploads: 167, views: 47382 },
        { date: '2025-07-22', uploads: 134, views: 41236 },
        { date: '2025-07-23', uploads: 98, views: 29847 }
      ],
      revenue: [
        { date: '2025-07-17', revenue: 3245.67 },
        { date: '2025-07-18', revenue: 4123.89 },
        { date: '2025-07-19', revenue: 2876.54 },
        { date: '2025-07-20', revenue: 5234.12 },
        { date: '2025-07-21', revenue: 3987.45 },
        { date: '2025-07-22', revenue: 3456.78 },
        { date: '2025-07-23', revenue: 2134.56 }
      ]
    };

    res.json(utils.response.success('Analytics retrieved', mockAnalytics));
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json(utils.response.error('Failed to get analytics'));
  }
});

// Use roles router for role management endpoints
app.use('/api/admin/roles', rolesRouter);

// Studio Authentication Route
app.post('/api/studio/auth', async (req, res) => {
  try {
    const { studioName, studioKey, email, password } = req.body;
    
    // Simple studio authentication supporting both methods
    let isValidAuth = false;
    let responseData = {};
    
    // Method 1: Studio Key authentication
    if (studioName && studioKey) {
      isValidAuth = true;
      responseData = {
        id: `studio_${Date.now()}`,
        name: studioName,
        studioId: `studio_${Date.now()}`,
        studioName,
        token: 'mock_studio_token_' + Date.now(),
        type: 'studio_key'
      };
    }
    
    // Method 2: Email/Password authentication (Demo credentials)
    if (email && password) {
      // Accept any email/password combination for demo
      const studioNameFromEmail = email.split('@')[0] || 'Demo Studio';
      isValidAuth = true;
      responseData = {
        id: `studio_${Date.now()}`,
        name: `${studioNameFromEmail} Studio`,
        studioId: `studio_${Date.now()}`,
        studioName: `${studioNameFromEmail} Studio`,
        email: email,
        token: 'mock_studio_token_' + Date.now(),
        type: 'email_password'
      };
    }
    
    if (isValidAuth) {
      res.json(utils.response.success('Studio authenticated', responseData));
    } else {
      res.status(401).json(utils.response.error('Invalid studio credentials - please provide either (studioName + studioKey) or (email + password)'));
    }
  } catch (error) {
    console.error('Studio auth error:', error);
    res.status(500).json(utils.response.error('Studio authentication failed'));
  }
});

// Studio Key Validation Route
app.post('/api/studio/validate-key', async (req, res) => {
  try {
    const { studioKey } = req.body;
    
    if (!studioKey) {
      return res.status(400).json(utils.response.error('Studio key required'));
    }
    
    // Validate key format: sk_timestamp_randompart
    const keyPattern = /^sk_\d+_[a-zA-Z0-9]+$/;
    if (!keyPattern.test(studioKey)) {
      return res.status(400).json(utils.response.error('Invalid studio key format'));
    }
    
    // Parse key components
    const parts = studioKey.split('_');
    const timestamp = parseInt(parts[1]);
    const randomPart = parts[2];
    
    // Mock key validation - in a real app, this would check a database
    const keyInfo = {
      valid: true,
      creatorId: `creator_${timestamp}`,
      creatorName: 'Demo Creator', // Would come from database
      permission: 'view', // Would be stored with the key
      created: new Date(timestamp).toISOString(),
      lastUsed: null,
      usageCount: 0,
      active: true,
      expiresAt: null // Would check expiration if set
    };
    
    res.json(utils.response.success('Studio key validated', keyInfo));
  } catch (error) {
    console.error('Studio key validation error:', error);
    res.status(500).json(utils.response.error('Key validation failed'));
  }
});

// Add Creator to Studio Portfolio
app.post('/api/studio/:studioId/creators', async (req, res) => {
  try {
    const { studioId } = req.params;
    const { studioKey, creatorName } = req.body;
    
    if (!studioKey) {
      return res.status(400).json(utils.response.error('Studio key required'));
    }
    
    // Validate the studio key first
    const keyPattern = /^sk_\d+_[a-zA-Z0-9]+$/;
    if (!keyPattern.test(studioKey)) {
      return res.status(400).json(utils.response.error('Invalid studio key format'));
    }
    
    // Create new creator connection
    const newCreator = {
      id: `creator_${Date.now()}`,
      name: creatorName || 'Creator from Key',
      studioKey: studioKey,
      studioId: studioId,
      status: 'pending', // Creator needs to approve
      permission: 'view', // Default permission from key
      commission: 20,
      category: 'general',
      joinedAt: new Date().toISOString(),
      lastActive: null
    };
    
    res.json(utils.response.success('Creator added to studio portfolio', newCreator));
  } catch (error) {
    console.error('Add creator error:', error);
    res.status(500).json(utils.response.error('Failed to add creator'));
  }
});

// Get Studio Portfolio
app.get('/api/studio/:studioId/portfolio', async (req, res) => {
  try {
    const { studioId } = req.params;
    
    // Mock portfolio data
    const mockCreators = [
      {
        id: 'creator_001',
        name: 'Alex Gaming',
        username: '@alexgaming',
        category: 'Gaming',
        status: 'active',
        followers: 15240,
        monthlyRevenue: 2847.50,
        commission: 15,
        joinedDate: '2024-12-15',
        lastActive: '2025-07-28'
      },
      {
        id: 'creator_002', 
        name: 'Sarah Tech',
        username: '@sarahtech',
        category: 'Technology',
        status: 'active',
        followers: 8932,
        monthlyRevenue: 1456.80,
        commission: 20,
        joinedDate: '2025-01-10',
        lastActive: '2025-07-29'
      },
      {
        id: 'creator_003',
        name: 'Mike Fitness',
        username: '@mikefitness',
        category: 'Fitness',
        status: 'pending',
        followers: 12567,
        monthlyRevenue: 0,
        commission: 18,
        joinedDate: '2025-07-20',
        lastActive: '2025-07-25'
      }
    ];

    res.json(utils.response.success('Portfolio retrieved', {
      creators: mockCreators,
      totalCreators: mockCreators.length,
      activeCreators: mockCreators.filter(c => c.status === 'active').length,
      totalRevenue: mockCreators.reduce((sum, c) => sum + c.monthlyRevenue, 0)
    }));
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json(utils.response.error('Failed to get portfolio'));
  }
});

// Add Creator to Studio
app.post('/api/studio/add-creator', async (req, res) => {
  try {
    const { studioKey, creatorData } = req.body;
    
    // Mock validation
    if (!studioKey || !creatorData) {
      return res.status(400).json(utils.response.error('Studio key and creator data required'));
    }

    res.json(utils.response.success('Creator added to studio', {
      creatorId: `creator_${Date.now()}`,
      status: 'pending',
      message: 'Creator has been added to studio portfolio'
    }));
  } catch (error) {
    console.error('Add creator error:', error);
    res.status(500).json(utils.response.error('Failed to add creator'));
  }
});

// Update Creator Relationship
app.put('/api/studio/:studioId/creator/:creatorId', async (req, res) => {
  try {
    const { studioId, creatorId } = req.params;
    const updates = req.body;
    
    res.json(utils.response.success('Creator relationship updated', {
      creatorId,
      updates,
      lastModified: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Update creator error:', error);
    res.status(500).json(utils.response.error('Failed to update creator'));
  }
});

// Get Studio Analytics
app.get('/api/studio/:studioId/analytics', async (req, res) => {
  try {
    const { studioId } = req.params;
    const { period = '30d' } = req.query;
    
    // Mock analytics data
    const mockAnalytics = {
      period,
      overview: {
        totalRevenue: 15847.30,
        monthlyGrowth: 12.5,
        activeCreators: 8,
        totalCreators: 12,
        avgCommission: 17.5
      },
      revenue: [
        { date: '2025-07-01', amount: 1245.67 },
        { date: '2025-07-02', amount: 1567.89 },
        { date: '2025-07-03', amount: 1234.56 },
        { date: '2025-07-04', amount: 1789.23 },
        { date: '2025-07-05', amount: 1456.78 }
      ],
      topCreators: [
        { name: 'Alex Gaming', revenue: 2847.50, growth: 15.2 },
        { name: 'Sarah Tech', revenue: 1456.80, growth: 8.7 },
        { name: 'Mike Fitness', revenue: 987.45, growth: 22.1 }
      ],
      categories: {
        'Gaming': 45.2,
        'Technology': 28.7,
        'Fitness': 15.4,
        'Lifestyle': 10.7
      }
    };

    res.json(utils.response.success('Analytics retrieved', mockAnalytics));
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json(utils.response.error('Failed to get analytics'));
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json(utils.response.error(`Route ${req.originalUrl} not found`));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json(utils.response.error(
    process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  ));
});

// Initialize database and start server
async function startServer() {
  try {
    await database.connect();
    
    // Initialize social systems
    await initializeSocialSystems();
    
    app.listen(PORT, () => {
      console.log(`🚀 PRISM API Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database: Connected to ${process.env.MONGODB_URI || 'mongodb://localhost:27017/prism'}`);
      console.log(`🔐 Auth: JWT-based authentication enabled`);
      console.log(`🤝 Social: Social interaction systems initialized`);
      console.log(`📝 API Endpoints:`);
      console.log(`   - Authentication: /api/auth/*`);
      console.log(`   - Users: /api/users/*`);
      console.log(`   - Content: /api/content/*`);
      console.log(`   - Media Upload: /api/media/*`);
      console.log(`   - Live Streaming: /api/streams/*`);
      console.log(`   - Social Features: /api/social/*`);
      console.log(`   - Payments: /api/payments/*`);
      console.log(`   - Health Check: /health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await database.disconnect();
  process.exit(0);
});

startServer();
