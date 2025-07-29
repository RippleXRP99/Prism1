// ============================================================================
// PAY-PER-VIEW SYSTEM - Month 6: Advanced Monetization
// ============================================================================

const EventEmitter = require('events');

class PayPerViewSystem extends EventEmitter {
  constructor(database) {
    super();
    this.database = database;
    this.isInitialized = false;

    // Pay-per-view pricing tiers
    this.pricingTiers = {
      photo: {
        minimum: 0.99,
        maximum: 19.99,
        suggested: [1.99, 2.99, 4.99, 7.99, 9.99]
      },
      video: {
        minimum: 1.99,
        maximum: 49.99,
        suggested: [2.99, 4.99, 7.99, 12.99, 19.99, 29.99]
      },
      live: {
        minimum: 4.99,
        maximum: 99.99,
        suggested: [9.99, 14.99, 19.99, 29.99, 49.99]
      },
      exclusive: {
        minimum: 9.99,
        maximum: 199.99,
        suggested: [14.99, 24.99, 39.99, 59.99, 99.99]
      }
    };

    // Access duration options
    this.accessDurations = {
      '24h': { hours: 24, label: '24 Hours' },
      '7d': { hours: 168, label: '7 Days' },
      '30d': { hours: 720, label: '30 Days' },
      'permanent': { hours: null, label: 'Permanent Access' }
    };

    // Content protection settings
    this.protection = {
      watermarkEnabled: true,
      downloadPrevention: true,
      screenshotPrevention: true,
      maxViewsPerPurchase: 10,
      deviceLimitPerPurchase: 3
    };

    // Analytics tracking
    this.analytics = {
      totalPurchases: 0,
      totalRevenue: 0,
      averagePurchaseValue: 0,
      conversionRate: 0,
      topPerformingContent: [],
      lastUpdated: new Date()
    };
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing Pay-Per-View System...');

      await this.createIndexes();
      await this.updateAnalytics();
      await this.setupContentProtection();

      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ Pay-Per-View System initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Pay-Per-View System:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // PPV content indexes
      await this.database.ppvContent().createIndex({ creatorId: 1, isActive: 1 });
      await this.database.ppvContent().createIndex({ category: 1, price: 1 });
      await this.database.ppvContent().createIndex({ createdAt: -1 });
      await this.database.ppvContent().createIndex({ viewCount: -1 });

      // PPV purchases indexes
      await this.database.ppvPurchases().createIndex({ userId: 1, contentId: 1 }, { unique: true });
      await this.database.ppvPurchases().createIndex({ userId: 1, createdAt: -1 });
      await this.database.ppvPurchases().createIndex({ contentId: 1, status: 1 });
      await this.database.ppvPurchases().createIndex({ expiresAt: 1 });

      // Content access indexes
      await this.database.contentAccess().createIndex({ userId: 1, contentId: 1 });
      await this.database.contentAccess().createIndex({ userId: 1, expiresAt: 1 });
      await this.database.contentAccess().createIndex({ contentId: 1, isActive: 1 });

      console.log('✅ Pay-per-view indexes created');
    } catch (error) {
      console.error('❌ Error creating pay-per-view indexes:', error);
    }
  }

  async setupContentProtection() {
    // Setup content protection mechanisms
    console.log('🔒 Setting up content protection...');
    // Implementation would include watermarking, DRM setup, etc.
  }

  // ============================================================================
  // CONTENT MANAGEMENT
  // ============================================================================

  async createPPVContent(creatorId, contentData) {
    try {
      const {
        title,
        description,
        category, // photo, video, live, exclusive
        type, // image, video, stream
        price,
        accessDuration = '30d',
        mediaFiles = [],
        thumbnailUrl = '',
        tags = [],
        isExclusive = false,
        maxPurchases = null,
        scheduledRelease = null
      } = contentData;

      // Validate pricing
      const validation = this.validatePricing(category, price);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Validate access duration
      if (!this.accessDurations[accessDuration]) {
        throw new Error('Invalid access duration');
      }

      const ppvContent = {
        _id: this.database.createObjectId(),
        contentId: this.generateContentId(),
        creatorId: this.database.createObjectId(creatorId),
        title,
        description,
        category,
        type,
        pricing: {
          amount: price,
          currency: 'USD',
          accessDuration,
          accessHours: this.accessDurations[accessDuration].hours
        },
        media: {
          files: mediaFiles,
          thumbnailUrl,
          duration: this.calculateMediaDuration(mediaFiles),
          size: this.calculateMediaSize(mediaFiles)
        },
        metadata: {
          tags,
          isExclusive,
          maxPurchases,
          currentPurchases: 0,
          scheduledRelease
        },
        protection: {
          watermarkEnabled: this.protection.watermarkEnabled,
          downloadPrevention: this.protection.downloadPrevention,
          screenshotPrevention: this.protection.screenshotPrevention,
          maxViews: this.protection.maxViewsPerPurchase,
          deviceLimit: this.protection.deviceLimitPerPurchase
        },
        analytics: {
          viewCount: 0,
          purchaseCount: 0,
          revenue: 0,
          conversionRate: 0,
          averageViewTime: 0
        },
        status: scheduledRelease ? 'scheduled' : 'active',
        isActive: true,
        isVisible: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.database.ppvContent().insertOne(ppvContent);

      this.emit('ppvContentCreated', {
        contentId: result.insertedId,
        creatorId,
        category,
        price
      });

      return { ...ppvContent, _id: result.insertedId };

    } catch (error) {
      console.error('Error creating PPV content:', error);
      throw error;
    }
  }

  generateContentId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ppv_${timestamp}_${random}`;
  }

  validatePricing(category, price) {
    const tier = this.pricingTiers[category];
    if (!tier) {
      return { valid: false, error: 'Invalid content category' };
    }

    if (price < tier.minimum || price > tier.maximum) {
      return {
        valid: false,
        error: `Price must be between $${tier.minimum} and $${tier.maximum} for ${category} content`
      };
    }

    return { valid: true };
  }

  calculateMediaDuration(mediaFiles) {
    // Calculate total media duration in seconds
    return mediaFiles.reduce((total, file) => {
      return total + (file.duration || 0);
    }, 0);
  }

  calculateMediaSize(mediaFiles) {
    // Calculate total media size in bytes
    return mediaFiles.reduce((total, file) => {
      return total + (file.size || 0);
    }, 0);
  }

  async updatePPVContent(contentId, updateData) {
    try {
      const validFields = [
        'title', 'description', 'price', 'accessDuration',
        'tags', 'isExclusive', 'maxPurchases', 'isActive', 'isVisible'
      ];

      const updateQuery = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (validFields.includes(key)) {
          if (key === 'price') {
            // Validate new pricing
            const content = await this.database.ppvContent().findOne({
              _id: this.database.createObjectId(contentId)
            });
            
            const validation = this.validatePricing(content.category, value);
            if (!validation.valid) {
              throw new Error(validation.error);
            }
            
            updateQuery['pricing.amount'] = value;
          } else if (key === 'accessDuration') {
            if (!this.accessDurations[value]) {
              throw new Error('Invalid access duration');
            }
            updateQuery['pricing.accessDuration'] = value;
            updateQuery['pricing.accessHours'] = this.accessDurations[value].hours;
          } else {
            updateQuery[key] = value;
          }
        }
      }

      updateQuery.updatedAt = new Date();

      const result = await this.database.ppvContent().findOneAndUpdate(
        { _id: this.database.createObjectId(contentId) },
        { $set: updateQuery },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        throw new Error('PPV content not found');
      }

      this.emit('ppvContentUpdated', {
        contentId,
        updateData: updateQuery
      });

      return result.value;

    } catch (error) {
      console.error('Error updating PPV content:', error);
      throw error;
    }
  }

  async deletePPVContent(contentId) {
    try {
      // Check for active purchases
      const activePurchases = await this.database.ppvPurchases().countDocuments({
        contentId: this.database.createObjectId(contentId),
        status: 'active'
      });

      if (activePurchases > 0) {
        throw new Error(`Cannot delete content with ${activePurchases} active purchases`);
      }

      await this.database.ppvContent().updateOne(
        { _id: this.database.createObjectId(contentId) },
        {
          $set: {
            isActive: false,
            isVisible: false,
            deletedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      this.emit('ppvContentDeleted', { contentId });

      return true;

    } catch (error) {
      console.error('Error deleting PPV content:', error);
      throw error;
    }
  }

  // ============================================================================
  // PURCHASE PROCESSING
  // ============================================================================

  async purchaseContent(userId, contentId, paymentMethodId) {
    try {
      // Get content information
      const content = await this.database.ppvContent().findOne({
        _id: this.database.createObjectId(contentId),
        isActive: true,
        isVisible: true
      });

      if (!content) {
        throw new Error('Content not found or unavailable');
      }

      // Check if already purchased
      const existingPurchase = await this.database.ppvPurchases().findOne({
        userId: this.database.createObjectId(userId),
        contentId: content._id
      });

      if (existingPurchase && existingPurchase.status === 'active') {
        throw new Error('Content already purchased');
      }

      // Check purchase limits
      if (content.metadata.maxPurchases && 
          content.metadata.currentPurchases >= content.metadata.maxPurchases) {
        throw new Error('Content purchase limit reached');
      }

      // Check if user is the creator
      if (content.creatorId.toString() === userId) {
        throw new Error('Creators cannot purchase their own content');
      }

      // Calculate access expiry
      const accessExpiry = content.pricing.accessHours ? 
        new Date(Date.now() + content.pricing.accessHours * 60 * 60 * 1000) : null;

      // Create purchase record
      const purchase = {
        _id: this.database.createObjectId(),
        purchaseId: this.generatePurchaseId(),
        userId: this.database.createObjectId(userId),
        contentId: content._id,
        creatorId: content.creatorId,
        amount: content.pricing.amount,
        currency: content.pricing.currency,
        paymentMethodId: this.database.createObjectId(paymentMethodId),
        access: {
          grantedAt: new Date(),
          expiresAt: accessExpiry,
          maxViews: content.protection.maxViews,
          currentViews: 0,
          deviceLimit: content.protection.deviceLimit,
          registeredDevices: []
        },
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const purchaseResult = await this.database.ppvPurchases().insertOne(purchase);

      // Process payment (this would integrate with payment processing system)
      const paymentResult = await this.processPayment(userId, content, paymentMethodId);

      if (paymentResult.success) {
        // Update purchase status
        await this.database.ppvPurchases().updateOne(
          { _id: purchaseResult.insertedId },
          {
            $set: {
              status: 'active',
              transactionId: paymentResult.transactionId,
              activatedAt: new Date(),
              updatedAt: new Date()
            }
          }
        );

        // Update content analytics
        await this.database.ppvContent().updateOne(
          { _id: content._id },
          {
            $inc: {
              'metadata.currentPurchases': 1,
              'analytics.purchaseCount': 1,
              'analytics.revenue': content.pricing.amount
            },
            $set: { updatedAt: new Date() }
          }
        );

        // Grant content access
        await this.grantContentAccess(userId, contentId, purchaseResult.insertedId);

        this.emit('contentPurchased', {
          purchaseId: purchaseResult.insertedId,
          userId,
          contentId,
          creatorId: content.creatorId.toString(),
          amount: content.pricing.amount
        });

        return {
          success: true,
          purchaseId: purchaseResult.insertedId,
          accessExpiry,
          transactionId: paymentResult.transactionId
        };

      } else {
        // Update purchase status to failed
        await this.database.ppvPurchases().updateOne(
          { _id: purchaseResult.insertedId },
          {
            $set: {
              status: 'failed',
              failureReason: paymentResult.error,
              updatedAt: new Date()
            }
          }
        );

        throw new Error(paymentResult.error);
      }

    } catch (error) {
      console.error('Error purchasing content:', error);
      throw error;
    }
  }

  generatePurchaseId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ppv_purchase_${timestamp}_${random}`;
  }

  async processPayment(userId, content, paymentMethodId) {
    // This would integrate with the payment processing system
    // For now, return a mock successful payment
    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      amount: content.pricing.amount
    };
  }

  async grantContentAccess(userId, contentId, purchaseId) {
    try {
      const purchase = await this.database.ppvPurchases().findOne({
        _id: this.database.createObjectId(purchaseId)
      });

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      const access = {
        _id: this.database.createObjectId(),
        userId: this.database.createObjectId(userId),
        contentId: this.database.createObjectId(contentId),
        purchaseId: purchase._id,
        isActive: true,
        grantedAt: new Date(),
        expiresAt: purchase.access.expiresAt,
        maxViews: purchase.access.maxViews,
        currentViews: 0,
        lastAccessedAt: null,
        createdAt: new Date()
      };

      await this.database.contentAccess().insertOne(access);

      this.emit('contentAccessGranted', {
        userId,
        contentId,
        purchaseId,
        expiresAt: access.expiresAt
      });

      return access;

    } catch (error) {
      console.error('Error granting content access:', error);
      throw error;
    }
  }

  // ============================================================================
  // ACCESS CONTROL
  // ============================================================================

  async verifyContentAccess(userId, contentId, deviceId = null) {
    try {
      const access = await this.database.contentAccess().findOne({
        userId: this.database.createObjectId(userId),
        contentId: this.database.createObjectId(contentId),
        isActive: true
      });

      if (!access) {
        return { hasAccess: false, reason: 'No valid purchase found' };
      }

      // Check expiry
      if (access.expiresAt && access.expiresAt < new Date()) {
        await this.database.contentAccess().updateOne(
          { _id: access._id },
          { $set: { isActive: false, expiredAt: new Date() } }
        );
        return { hasAccess: false, reason: 'Access expired' };
      }

      // Check view limits
      if (access.maxViews && access.currentViews >= access.maxViews) {
        return { hasAccess: false, reason: 'View limit exceeded' };
      }

      // Check device limits (if deviceId provided)
      if (deviceId) {
        const purchase = await this.database.ppvPurchases().findOne({
          _id: access.purchaseId
        });

        if (purchase && purchase.access.deviceLimit) {
          const deviceRegistered = purchase.access.registeredDevices.includes(deviceId);
          
          if (!deviceRegistered && 
              purchase.access.registeredDevices.length >= purchase.access.deviceLimit) {
            return { hasAccess: false, reason: 'Device limit exceeded' };
          }

          if (!deviceRegistered) {
            // Register the device
            await this.database.ppvPurchases().updateOne(
              { _id: purchase._id },
              {
                $push: { 'access.registeredDevices': deviceId },
                $set: { updatedAt: new Date() }
              }
            );
          }
        }
      }

      return {
        hasAccess: true,
        access: {
          expiresAt: access.expiresAt,
          remainingViews: access.maxViews ? access.maxViews - access.currentViews : null,
          purchaseId: access.purchaseId
        }
      };

    } catch (error) {
      console.error('Error verifying content access:', error);
      return { hasAccess: false, reason: 'Error verifying access' };
    }
  }

  async recordContentView(userId, contentId, viewData = {}) {
    try {
      const {
        deviceId = null,
        duration = 0,
        completionPercentage = 0
      } = viewData;

      // Update access record
      await this.database.contentAccess().updateOne(
        {
          userId: this.database.createObjectId(userId),
          contentId: this.database.createObjectId(contentId),
          isActive: true
        },
        {
          $inc: { currentViews: 1 },
          $set: { lastAccessedAt: new Date() }
        }
      );

      // Update content analytics
      await this.database.ppvContent().updateOne(
        { _id: this.database.createObjectId(contentId) },
        {
          $inc: { 'analytics.viewCount': 1 },
          $set: { updatedAt: new Date() }
        }
      );

      // Record view details
      const viewRecord = {
        _id: this.database.createObjectId(),
        userId: this.database.createObjectId(userId),
        contentId: this.database.createObjectId(contentId),
        deviceId,
        duration,
        completionPercentage,
        timestamp: new Date()
      };

      await this.database.contentViews().insertOne(viewRecord);

      this.emit('contentViewed', {
        userId,
        contentId,
        duration,
        completionPercentage
      });

    } catch (error) {
      console.error('Error recording content view:', error);
    }
  }

  // ============================================================================
  // QUERIES AND ANALYTICS
  // ============================================================================

  async getCreatorPPVContent(creatorId, options = {}) {
    try {
      const {
        category = null,
        status = 'active',
        sortBy = 'createdAt',
        sortOrder = -1,
        limit = 20,
        skip = 0
      } = options;

      const query = {
        creatorId: this.database.createObjectId(creatorId),
        isActive: true
      };

      if (category) {
        query.category = category;
      }

      if (status !== 'all') {
        query.status = status;
      }

      const content = await this.database.ppvContent()
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      return content;

    } catch (error) {
      console.error('Error getting creator PPV content:', error);
      throw error;
    }
  }

  async getUserPurchases(userId, options = {}) {
    try {
      const {
        status = 'active',
        sortBy = 'createdAt',
        sortOrder = -1,
        limit = 20,
        skip = 0
      } = options;

      const query = {
        userId: this.database.createObjectId(userId)
      };

      if (status !== 'all') {
        query.status = status;
      }

      const purchases = await this.database.ppvPurchases()
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Populate content information
      for (const purchase of purchases) {
        const content = await this.database.ppvContent().findOne({
          _id: purchase.contentId
        });
        purchase.content = content;
      }

      return purchases;

    } catch (error) {
      console.error('Error getting user purchases:', error);
      throw error;
    }
  }

  async getPPVContentById(contentId) {
    try {
      return await this.database.ppvContent().findOne({
        _id: this.database.createObjectId(contentId),
        isActive: true
      });
    } catch (error) {
      console.error('Error getting PPV content by ID:', error);
      throw error;
    }
  }

  async updateAnalytics() {
    try {
      const [
        totalPurchases,
        totalRevenue,
        topContent
      ] = await Promise.all([
        this.database.ppvPurchases().countDocuments({ status: 'active' }),
        this.getTotalPPVRevenue(),
        this.getTopPerformingContent()
      ]);

      this.analytics = {
        totalPurchases,
        totalRevenue,
        averagePurchaseValue: totalPurchases > 0 ? totalRevenue / totalPurchases : 0,
        conversionRate: await this.calculateConversionRate(),
        topPerformingContent: topContent,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error updating PPV analytics:', error);
    }
  }

  async getTotalPPVRevenue() {
    try {
      const result = await this.database.ppvPurchases().aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]).toArray();

      return result[0]?.total || 0;
    } catch (error) {
      console.error('Error getting total PPV revenue:', error);
      return 0;
    }
  }

  async getTopPerformingContent(limit = 10) {
    try {
      return await this.database.ppvContent()
        .find({ isActive: true })
        .sort({ 'analytics.revenue': -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error getting top performing content:', error);
      return [];
    }
  }

  async calculateConversionRate() {
    try {
      const totalViews = await this.database.ppvContent().aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$analytics.viewCount' }
          }
        }
      ]).toArray();

      const totalPurchases = await this.database.ppvPurchases().countDocuments({
        status: 'active'
      });

      const views = totalViews[0]?.total || 0;
      return views > 0 ? (totalPurchases / views * 100).toFixed(2) : 0;

    } catch (error) {
      console.error('Error calculating conversion rate:', error);
      return 0;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getPricingTiers() {
    return { ...this.pricingTiers };
  }

  getAccessDurations() {
    return { ...this.accessDurations };
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  async shutdown() {
    console.log('🔄 Shutting down Pay-Per-View System...');
    this.isInitialized = false;
    this.emit('shutdown');
    console.log('✅ Pay-Per-View System shut down successfully');
  }
}

module.exports = PayPerViewSystem;
