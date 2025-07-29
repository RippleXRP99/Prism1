// ============================================================================
// TIPPING SYSTEM - Month 6: Advanced Monetization
// ============================================================================

const EventEmitter = require('events');

class TippingSystem extends EventEmitter {
  constructor(database, paymentProcessor) {
    super();
    this.database = database;
    this.paymentProcessor = paymentProcessor;
    this.isInitialized = false;

    // Tip amount presets
    this.tipPresets = [
      { amount: 1, emoji: '☕', label: 'Coffee' },
      { amount: 3, emoji: '🍕', label: 'Slice' },
      { amount: 5, emoji: '🍺', label: 'Beer' },
      { amount: 10, emoji: '🍷', label: 'Wine' },
      { amount: 25, emoji: '🎉', label: 'Party' },
      { amount: 50, emoji: '💎', label: 'Diamond' },
      { amount: 100, emoji: '👑', label: 'Royal' },
      { amount: 200, emoji: '🚀', label: 'Rocket' }
    ];

    // Custom tip ranges
    this.tipRanges = {
      minimum: 1.00,
      maximum: 500.00,
      suggested: {
        low: [1, 3, 5],
        medium: [10, 15, 25],
        high: [50, 100, 200]
      }
    };

    // Tip multipliers for special events
    this.multipliers = {
      birthday: 2.0,
      milestone: 1.5,
      special_event: 1.25,
      livestream: 1.1,
      new_creator: 1.2
    };

    // Leaderboards configuration
    this.leaderboards = {
      daily: { resetHours: 24, maxEntries: 100 },
      weekly: { resetHours: 168, maxEntries: 50 },
      monthly: { resetHours: 720, maxEntries: 25 },
      allTime: { resetHours: null, maxEntries: 10 }
    };

    // Analytics tracking
    this.analytics = {
      totalTips: 0,
      totalAmount: 0,
      averageTipAmount: 0,
      topTippers: [],
      popularTipAmounts: [],
      lastUpdated: new Date()
    };

    // Live tip tracking for streams
    this.liveTips = new Map(); // streamId -> tip data
    this.tipGoals = new Map(); // streamId -> goal data
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing Tipping System...');

      await this.createIndexes();
      await this.updateAnalytics();
      await this.initializeLeaderboards();

      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ Tipping System initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Tipping System:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Tips indexes
      await this.database.tips().createIndex({ userId: 1, createdAt: -1 });
      await this.database.tips().createIndex({ creatorId: 1, createdAt: -1 });
      await this.database.tips().createIndex({ streamId: 1, createdAt: -1 });
      await this.database.tips().createIndex({ amount: -1 });
      await this.database.tips().createIndex({ createdAt: -1 });

      // Tip goals indexes
      await this.database.tipGoals().createIndex({ creatorId: 1, isActive: 1 });
      await this.database.tipGoals().createIndex({ streamId: 1 }, { unique: true });
      await this.database.tipGoals().createIndex({ endDate: 1 });

      // Leaderboards indexes
      await this.database.tipLeaderboards().createIndex({ type: 1, period: 1 });
      await this.database.tipLeaderboards().createIndex({ 'entries.userId': 1 });
      await this.database.tipLeaderboards().createIndex({ resetDate: 1 });

      console.log('✅ Tipping system indexes created');
    } catch (error) {
      console.error('❌ Error creating tipping system indexes:', error);
    }
  }

  async initializeLeaderboards() {
    const types = ['daily', 'weekly', 'monthly', 'allTime'];
    
    for (const type of types) {
      await this.ensureLeaderboardExists(type);
    }
  }

  // ============================================================================
  // TIP PROCESSING
  // ============================================================================

  async sendTip(tipData) {
    try {
      const {
        userId,
        creatorId,
        amount,
        message = '',
        isAnonymous = false,
        streamId = null,
        paymentMethodId,
        multiplier = 1.0
      } = tipData;

      // Validate tip amount
      const validation = this.validateTipAmount(amount);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Check daily tip limits
      const dailyLimit = await this.checkDailyTipLimit(userId);
      if (!dailyLimit.allowed) {
        throw new Error(dailyLimit.reason);
      }

      // Apply multiplier if applicable
      const finalAmount = amount * multiplier;

      // Create tip record
      const tip = {
        _id: this.database.createObjectId(),
        tipId: this.generateTipId(),
        userId: this.database.createObjectId(userId),
        creatorId: this.database.createObjectId(creatorId),
        amount: finalAmount,
        originalAmount: amount,
        multiplier,
        currency: 'USD',
        message: message.trim(),
        isAnonymous,
        streamId: streamId ? this.database.createObjectId(streamId) : null,
        paymentMethodId: this.database.createObjectId(paymentMethodId),
        status: 'pending',
        visibility: 'public', // public, followers_only, private
        metadata: {
          platform: 'web',
          userAgent: 'browser',
          ipAddress: null // Would be set from request
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const tipResult = await this.database.tips().insertOne(tip);

      // Process payment
      const paymentResult = await this.paymentProcessor.processPayment({
        userId,
        creatorId,
        amount: finalAmount,
        type: 'tip',
        paymentMethodId,
        metadata: {
          tipId: tip.tipId,
          message,
          streamId
        }
      });

      if (paymentResult.success) {
        // Update tip status
        await this.database.tips().updateOne(
          { _id: tipResult.insertedId },
          {
            $set: {
              status: 'completed',
              transactionId: paymentResult.transactionId,
              completedAt: new Date(),
              updatedAt: new Date()
            }
          }
        );

        // Update analytics and leaderboards
        await this.processTipSuccess(tip, tipResult.insertedId);

        // Handle live stream tips
        if (streamId) {
          await this.handleLiveStreamTip(streamId, tip);
        }

        this.emit('tipSent', {
          tipId: tipResult.insertedId,
          userId,
          creatorId,
          amount: finalAmount,
          message,
          streamId
        });

        return {
          success: true,
          tipId: tipResult.insertedId,
          transactionId: paymentResult.transactionId,
          amount: finalAmount
        };

      } else {
        // Update tip status to failed
        await this.database.tips().updateOne(
          { _id: tipResult.insertedId },
          {
            $set: {
              status: 'failed',
              failureReason: paymentResult.message,
              updatedAt: new Date()
            }
          }
        );

        throw new Error(paymentResult.message);
      }

    } catch (error) {
      console.error('Error sending tip:', error);
      throw error;
    }
  }

  generateTipId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `tip_${timestamp}_${random}`;
  }

  validateTipAmount(amount) {
    if (amount < this.tipRanges.minimum) {
      return {
        valid: false,
        error: `Minimum tip amount is $${this.tipRanges.minimum}`
      };
    }

    if (amount > this.tipRanges.maximum) {
      return {
        valid: false,
        error: `Maximum tip amount is $${this.tipRanges.maximum}`
      };
    }

    return { valid: true };
  }

  async checkDailyTipLimit(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyTips = await this.database.tips().aggregate([
        {
          $match: {
            userId: this.database.createObjectId(userId),
            status: 'completed',
            createdAt: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      const dailyTotal = dailyTips[0]?.total || 0;
      const dailyCount = dailyTips[0]?.count || 0;

      // Daily limits (could be user-configurable)
      const dailyAmountLimit = 2000; // $2000 per day
      const dailyCountLimit = 100;   // 100 tips per day

      if (dailyTotal >= dailyAmountLimit) {
        return {
          allowed: false,
          reason: `Daily tip amount limit of $${dailyAmountLimit} reached`
        };
      }

      if (dailyCount >= dailyCountLimit) {
        return {
          allowed: false,
          reason: `Daily tip count limit of ${dailyCountLimit} reached`
        };
      }

      return { allowed: true };

    } catch (error) {
      console.error('Error checking daily tip limit:', error);
      return { allowed: false, reason: 'Error validating tip limits' };
    }
  }

  async processTipSuccess(tip, tipId) {
    try {
      // Update analytics
      await this.updateTipAnalytics(tip);

      // Update leaderboards
      await this.updateTipLeaderboards(tip);

      // Award achievements/badges (if system exists)
      await this.checkTipAchievements(tip);

      // Send notifications
      await this.sendTipNotifications(tip, tipId);

    } catch (error) {
      console.error('Error processing tip success:', error);
    }
  }

  // ============================================================================
  // LIVE STREAM TIPS
  // ============================================================================

  async handleLiveStreamTip(streamId, tip) {
    try {
      const streamIdStr = streamId.toString();

      // Add to live tips tracking
      if (!this.liveTips.has(streamIdStr)) {
        this.liveTips.set(streamIdStr, {
          tips: [],
          totalAmount: 0,
          tipCount: 0,
          topTipper: null
        });
      }

      const streamTips = this.liveTips.get(streamIdStr);
      streamTips.tips.push({
        tipId: tip._id,
        userId: tip.userId,
        amount: tip.amount,
        message: tip.message,
        isAnonymous: tip.isAnonymous,
        timestamp: tip.createdAt
      });

      streamTips.totalAmount += tip.amount;
      streamTips.tipCount += 1;

      // Update top tipper
      if (!streamTips.topTipper || tip.amount > streamTips.topTipper.amount) {
        streamTips.topTipper = {
          userId: tip.userId,
          amount: tip.amount,
          isAnonymous: tip.isAnonymous
        };
      }

      // Check tip goals
      await this.checkTipGoals(streamId, streamTips);

      // Emit live tip event for real-time updates
      this.emit('liveStreamTip', {
        streamId: streamIdStr,
        tip: {
          amount: tip.amount,
          message: tip.message,
          isAnonymous: tip.isAnonymous,
          timestamp: tip.createdAt
        },
        streamStats: {
          totalAmount: streamTips.totalAmount,
          tipCount: streamTips.tipCount
        }
      });

    } catch (error) {
      console.error('Error handling live stream tip:', error);
    }
  }

  async createTipGoal(creatorId, goalData) {
    try {
      const {
        title,
        description = '',
        targetAmount,
        streamId = null,
        endDate = null,
        rewardDescription = ''
      } = goalData;

      if (targetAmount < 10 || targetAmount > 10000) {
        throw new Error('Tip goal amount must be between $10 and $10,000');
      }

      const tipGoal = {
        _id: this.database.createObjectId(),
        goalId: this.generateGoalId(),
        creatorId: this.database.createObjectId(creatorId),
        streamId: streamId ? this.database.createObjectId(streamId) : null,
        title,
        description,
        targetAmount,
        currentAmount: 0,
        contributorCount: 0,
        rewardDescription,
        isActive: true,
        isCompleted: false,
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.database.tipGoals().insertOne(tipGoal);

      if (streamId) {
        this.tipGoals.set(streamId.toString(), {
          goalId: result.insertedId,
          targetAmount,
          currentAmount: 0,
          title,
          isCompleted: false
        });
      }

      this.emit('tipGoalCreated', {
        goalId: result.insertedId,
        creatorId,
        targetAmount,
        title
      });

      return { ...tipGoal, _id: result.insertedId };

    } catch (error) {
      console.error('Error creating tip goal:', error);
      throw error;
    }
  }

  generateGoalId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `goal_${timestamp}_${random}`;
  }

  async checkTipGoals(streamId, streamTips) {
    try {
      const streamIdStr = streamId.toString();
      const goal = this.tipGoals.get(streamIdStr);

      if (goal && !goal.isCompleted) {
        const newAmount = streamTips.totalAmount;
        
        // Update goal progress
        await this.database.tipGoals().updateOne(
          { _id: this.database.createObjectId(goal.goalId) },
          {
            $set: {
              currentAmount: newAmount,
              updatedAt: new Date()
            }
          }
        );

        // Check if goal is completed
        if (newAmount >= goal.targetAmount) {
          await this.database.tipGoals().updateOne(
            { _id: this.database.createObjectId(goal.goalId) },
            {
              $set: {
                isCompleted: true,
                completedAt: new Date(),
                updatedAt: new Date()
              }
            }
          );

          goal.isCompleted = true;

          this.emit('tipGoalCompleted', {
            goalId: goal.goalId,
            streamId: streamIdStr,
            targetAmount: goal.targetAmount,
            finalAmount: newAmount
          });
        }

        // Emit progress update
        this.emit('tipGoalProgress', {
          goalId: goal.goalId,
          streamId: streamIdStr,
          currentAmount: newAmount,
          targetAmount: goal.targetAmount,
          percentage: Math.min((newAmount / goal.targetAmount) * 100, 100)
        });
      }

    } catch (error) {
      console.error('Error checking tip goals:', error);
    }
  }

  // ============================================================================
  // LEADERBOARDS
  // ============================================================================

  async updateTipLeaderboards(tip) {
    try {
      const types = ['daily', 'weekly', 'monthly', 'allTime'];

      for (const type of types) {
        await this.updateLeaderboard(type, tip);
      }

    } catch (error) {
      console.error('Error updating tip leaderboards:', error);
    }
  }

  async updateLeaderboard(type, tip) {
    try {
      const leaderboard = await this.getOrCreateLeaderboard(type);
      
      // Find existing entry for user
      let userEntry = leaderboard.entries.find(
        entry => entry.userId.toString() === tip.userId.toString()
      );

      if (userEntry) {
        // Update existing entry
        userEntry.totalAmount += tip.amount;
        userEntry.tipCount += 1;
        userEntry.lastTip = tip.createdAt;
      } else {
        // Create new entry
        userEntry = {
          userId: tip.userId,
          totalAmount: tip.amount,
          tipCount: 1,
          lastTip: tip.createdAt,
          rank: 0
        };
        leaderboard.entries.push(userEntry);
      }

      // Sort and update ranks
      leaderboard.entries.sort((a, b) => b.totalAmount - a.totalAmount);
      leaderboard.entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Limit entries
      const maxEntries = this.leaderboards[type].maxEntries;
      if (leaderboard.entries.length > maxEntries) {
        leaderboard.entries = leaderboard.entries.slice(0, maxEntries);
      }

      // Update database
      await this.database.tipLeaderboards().updateOne(
        { _id: leaderboard._id },
        {
          $set: {
            entries: leaderboard.entries,
            totalTips: leaderboard.entries.reduce((sum, e) => sum + e.tipCount, 0),
            totalAmount: leaderboard.entries.reduce((sum, e) => sum + e.totalAmount, 0),
            updatedAt: new Date()
          }
        }
      );

    } catch (error) {
      console.error(`Error updating ${type} leaderboard:`, error);
    }
  }

  async getOrCreateLeaderboard(type) {
    try {
      const resetHours = this.leaderboards[type].resetHours;
      let resetDate = null;

      if (resetHours) {
        resetDate = new Date(Date.now() + resetHours * 60 * 60 * 1000);
      }

      let leaderboard = await this.database.tipLeaderboards().findOne({
        type,
        period: this.getCurrentPeriod(type)
      });

      if (!leaderboard) {
        leaderboard = {
          _id: this.database.createObjectId(),
          type,
          period: this.getCurrentPeriod(type),
          entries: [],
          totalTips: 0,
          totalAmount: 0,
          resetDate,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await this.database.tipLeaderboards().insertOne(leaderboard);
        leaderboard._id = result.insertedId;
      }

      return leaderboard;

    } catch (error) {
      console.error('Error getting/creating leaderboard:', error);
      throw error;
    }
  }

  getCurrentPeriod(type) {
    const now = new Date();
    
    switch (type) {
      case 'daily':
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'monthly':
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      case 'allTime':
        return 'all';
      default:
        return 'unknown';
    }
  }

  async ensureLeaderboardExists(type) {
    const existing = await this.database.tipLeaderboards().findOne({
      type,
      period: this.getCurrentPeriod(type)
    });

    if (!existing) {
      await this.getOrCreateLeaderboard(type);
    }
  }

  async getLeaderboard(type, limit = null) {
    try {
      const leaderboard = await this.database.tipLeaderboards().findOne({
        type,
        period: this.getCurrentPeriod(type)
      });

      if (!leaderboard) {
        return {
          type,
          period: this.getCurrentPeriod(type),
          entries: [],
          totalTips: 0,
          totalAmount: 0
        };
      }

      let entries = leaderboard.entries;
      if (limit && entries.length > limit) {
        entries = entries.slice(0, limit);
      }

      return {
        ...leaderboard,
        entries
      };

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS AND QUERIES
  // ============================================================================

  async updateTipAnalytics(tip) {
    try {
      this.analytics.totalTips += 1;
      this.analytics.totalAmount += tip.amount;
      this.analytics.averageTipAmount = this.analytics.totalAmount / this.analytics.totalTips;
      this.analytics.lastUpdated = new Date();

      // Update popular tip amounts
      await this.updatePopularTipAmounts();

    } catch (error) {
      console.error('Error updating tip analytics:', error);
    }
  }

  async updatePopularTipAmounts() {
    try {
      const result = await this.database.tips().aggregate([
        {
          $match: { status: 'completed' }
        },
        {
          $group: {
            _id: '$amount',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]).toArray();

      this.analytics.popularTipAmounts = result.map(item => ({
        amount: item._id,
        count: item.count
      }));

    } catch (error) {
      console.error('Error updating popular tip amounts:', error);
    }
  }

  async getUserTips(userId, options = {}) {
    try {
      const {
        type = 'sent', // sent, received
        status = 'completed',
        sortBy = 'createdAt',
        sortOrder = -1,
        limit = 20,
        skip = 0
      } = options;

      const query = {
        status
      };

      if (type === 'sent') {
        query.userId = this.database.createObjectId(userId);
      } else {
        query.creatorId = this.database.createObjectId(userId);
      }

      const tips = await this.database.tips()
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .toArray();

      return tips;

    } catch (error) {
      console.error('Error getting user tips:', error);
      throw error;
    }
  }

  async getCreatorTipStats(creatorId, period = '30d') {
    try {
      const startDate = this.getPeriodStartDate(period);
      
      const stats = await this.database.tips().aggregate([
        {
          $match: {
            creatorId: this.database.createObjectId(creatorId),
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalTips: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' },
            uniqueTippers: { $addToSet: '$userId' }
          }
        }
      ]).toArray();

      const result = stats[0] || {
        totalTips: 0,
        totalAmount: 0,
        averageAmount: 0,
        uniqueTippers: []
      };

      return {
        ...result,
        uniqueTippersCount: result.uniqueTippers.length,
        period
      };

    } catch (error) {
      console.error('Error getting creator tip stats:', error);
      throw error;
    }
  }

  getPeriodStartDate(period) {
    const now = new Date();
    
    switch (period) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  // ============================================================================
  // NOTIFICATIONS AND ACHIEVEMENTS
  // ============================================================================

  async sendTipNotifications(tip, tipId) {
    try {
      // Notify creator of received tip
      this.emit('tipNotification', {
        type: 'tip_received',
        recipientId: tip.creatorId,
        data: {
          tipId,
          amount: tip.amount,
          message: tip.message,
          isAnonymous: tip.isAnonymous,
          senderId: tip.isAnonymous ? null : tip.userId
        }
      });

      // Notify sender of successful tip
      this.emit('tipNotification', {
        type: 'tip_sent',
        recipientId: tip.userId,
        data: {
          tipId,
          amount: tip.amount,
          creatorId: tip.creatorId
        }
      });

    } catch (error) {
      console.error('Error sending tip notifications:', error);
    }
  }

  async checkTipAchievements(tip) {
    try {
      // Check for milestone achievements
      const userStats = await this.getUserTipStats(tip.userId.toString(), 'sent');
      
      // Achievement: First tip
      if (userStats.totalTips === 1) {
        this.emit('achievement', {
          userId: tip.userId,
          type: 'first_tip',
          data: { amount: tip.amount }
        });
      }

      // Achievement: Generous tipper (100+ tips)
      if (userStats.totalTips === 100) {
        this.emit('achievement', {
          userId: tip.userId,
          type: 'generous_tipper',
          data: { totalTips: userStats.totalTips }
        });
      }

      // Achievement: Big spender ($1000+ total)
      if (userStats.totalAmount >= 1000) {
        this.emit('achievement', {
          userId: tip.userId,
          type: 'big_spender',
          data: { totalAmount: userStats.totalAmount }
        });
      }

    } catch (error) {
      console.error('Error checking tip achievements:', error);
    }
  }

  async getUserTipStats(userId, type = 'sent') {
    try {
      const query = {
        status: 'completed'
      };

      if (type === 'sent') {
        query.userId = this.database.createObjectId(userId);
      } else {
        query.creatorId = this.database.createObjectId(userId);
      }

      const stats = await this.database.tips().aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalTips: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' },
            firstTip: { $min: '$createdAt' },
            lastTip: { $max: '$createdAt' }
          }
        }
      ]).toArray();

      return stats[0] || {
        totalTips: 0,
        totalAmount: 0,
        averageAmount: 0,
        firstTip: null,
        lastTip: null
      };

    } catch (error) {
      console.error('Error getting user tip stats:', error);
      return {
        totalTips: 0,
        totalAmount: 0,
        averageAmount: 0,
        firstTip: null,
        lastTip: null
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getTipPresets() {
    return [...this.tipPresets];
  }

  getTipRanges() {
    return { ...this.tipRanges };
  }

  getMultipliers() {
    return { ...this.multipliers };
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  getLiveStreamTips(streamId) {
    return this.liveTips.get(streamId.toString()) || {
      tips: [],
      totalAmount: 0,
      tipCount: 0,
      topTipper: null
    };
  }

  async clearLiveStreamTips(streamId) {
    this.liveTips.delete(streamId.toString());
    this.tipGoals.delete(streamId.toString());
  }

  // ============================================================================
  // ANALYTICS AND STATISTICS
  // ============================================================================

  async updateAnalytics() {
    try {
      const now = new Date();
      const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

      // Update tip analytics
      const tipAnalytics = await this.database.tips().aggregate([
        {
          $match: {
            createdAt: { $gte: last30Days }
          }
        },
        {
          $group: {
            _id: null,
            totalTips: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            averageAmount: { $avg: '$amount' },
            uniqueTippers: { $addToSet: '$userId' },
            uniqueCreators: { $addToSet: '$creatorId' }
          }
        }
      ]).toArray();

      const analytics = tipAnalytics[0] || {
        totalTips: 0,
        totalAmount: 0,
        averageAmount: 0,
        uniqueTippers: [],
        uniqueCreators: []
      };

      this.analytics = {
        totalTips: analytics.totalTips,
        totalAmount: analytics.totalAmount,
        averageAmount: analytics.averageAmount,
        uniqueTippers: analytics.uniqueTippers.length,
        uniqueCreators: analytics.uniqueCreators.length,
        lastUpdated: now
      };

      console.log('📊 Tipping analytics updated:', this.analytics);

    } catch (error) {
      console.error('Error updating tipping analytics:', error);
      // Set default analytics on error
      this.analytics = {
        totalTips: 0,
        totalAmount: 0,
        averageAmount: 0,
        uniqueTippers: 0,
        uniqueCreators: 0,
        lastUpdated: new Date()
      };
    }
  }

  getAnalytics() {
    return {
      ...this.analytics,
      tipPresets: this.tipPresets,
      achievements: this.achievements,
      isInitialized: this.isInitialized
    };
  }

  async shutdown() {
    console.log('🔄 Shutting down Tipping System...');
    this.isInitialized = false;
    this.liveTips.clear();
    this.tipGoals.clear();
    this.emit('shutdown');
    console.log('✅ Tipping System shut down successfully');
  }
}

module.exports = TippingSystem;
