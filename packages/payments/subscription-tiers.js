// ============================================================================
// SUBSCRIPTION TIERS SYSTEM - Month 6: Advanced Monetization
// ============================================================================

const EventEmitter = require('events');

class SubscriptionTiersSystem extends EventEmitter {
  constructor(database) {
    super();
    this.database = database;
    this.isInitialized = false;

    // Default tier templates
    this.defaultTiers = {
      basic: {
        tier: 'basic',
        name: 'Basic',
        monthlyPrice: 9.99,
        yearlyPrice: 99.99,
        features: [
          'Access to basic content',
          'Monthly live streams',
          'Community access',
          'Basic messaging'
        ],
        color: '#6A0DAD',
        priority: 1
      },
      premium: {
        tier: 'premium',
        name: 'Premium',
        monthlyPrice: 19.99,
        yearlyPrice: 199.99,
        features: [
          'All Basic features',
          'Weekly live streams',
          'Exclusive content',
          'Priority messaging',
          'Custom requests (2/month)'
        ],
        color: '#FF1493',
        priority: 2
      },
      vip: {
        tier: 'vip',
        name: 'VIP',
        monthlyPrice: 49.99,
        yearlyPrice: 499.99,
        features: [
          'All Premium features',
          'Daily live streams',
          'Personal video messages',
          'Video calls (1/month)',
          'Custom requests (unlimited)',
          'Early access to new content',
          'Exclusive merchandise discounts'
        ],
        color: '#FFD700',
        priority: 3
      }
    };

    // Tier analytics
    this.analytics = {
      totalSubscribers: 0,
      totalRevenue: 0,
      conversionRates: {},
      churnRates: {},
      averageLifetimeValue: {},
      lastUpdated: new Date()
    };
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing Subscription Tiers System...');

      await this.createIndexes();
      await this.updateAnalytics();

      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ Subscription Tiers System initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Subscription Tiers System:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Subscription tiers indexes
      await this.database.subscriptionTiers().createIndex({ creatorId: 1, tier: 1 });
      await this.database.subscriptionTiers().createIndex({ isActive: 1 });
      await this.database.subscriptionTiers().createIndex({ monthlyPrice: 1 });

      // Subscriptions indexes
      await this.database.subscriptions().createIndex({ userId: 1, status: 1 });
      await this.database.subscriptions().createIndex({ creatorId: 1, tier: 1 });
      await this.database.subscriptions().createIndex({ currentPeriodEnd: 1 });

      console.log('✅ Subscription tiers indexes created');
    } catch (error) {
      console.error('❌ Error creating subscription tiers indexes:', error);
    }
  }

  // ============================================================================
  // TIER MANAGEMENT
  // ============================================================================

  async createCreatorTiers(creatorId, customTiers = null) {
    try {
      const tiers = customTiers || Object.values(this.defaultTiers);
      const createdTiers = [];

      for (const tierData of tiers) {
        const tier = {
          _id: this.database.createObjectId(),
          creatorId: this.database.createObjectId(creatorId),
          tier: tierData.tier,
          name: tierData.name,
          description: tierData.description || '',
          monthlyPrice: tierData.monthlyPrice,
          yearlyPrice: tierData.yearlyPrice || (tierData.monthlyPrice * 10), // 2 months free
          features: tierData.features || [],
          benefits: tierData.benefits || [],
          color: tierData.color || '#6A0DAD',
          priority: tierData.priority || 1,
          maxSubscribers: tierData.maxSubscribers || null,
          currentSubscribers: 0,
          isActive: true,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await this.database.subscriptionTiers().insertOne(tier);
        createdTiers.push({ ...tier, _id: result.insertedId });
      }

      this.emit('tiersCreated', {
        creatorId,
        tiers: createdTiers
      });

      return createdTiers;

    } catch (error) {
      console.error('Error creating creator tiers:', error);
      throw error;
    }
  }

  async updateTier(creatorId, tier, updateData) {
    try {
      const validatedData = this.validateTierData(updateData);
      
      const updatedTier = await this.database.subscriptionTiers().findOneAndUpdate(
        {
          creatorId: this.database.createObjectId(creatorId),
          tier: tier
        },
        {
          $set: {
            ...validatedData,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!updatedTier.value) {
        throw new Error('Tier not found');
      }

      this.emit('tierUpdated', {
        creatorId,
        tier,
        updatedData: validatedData
      });

      return updatedTier.value;

    } catch (error) {
      console.error('Error updating tier:', error);
      throw error;
    }
  }

  validateTierData(data) {
    const validFields = [
      'name', 'description', 'monthlyPrice', 'yearlyPrice', 
      'features', 'benefits', 'color', 'priority', 
      'maxSubscribers', 'isActive', 'isVisible'
    ];

    const validated = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (validFields.includes(key)) {
        validated[key] = value;
      }
    }

    // Validate pricing
    if (validated.monthlyPrice !== undefined) {
      if (validated.monthlyPrice < 0.99 || validated.monthlyPrice > 999.99) {
        throw new Error('Monthly price must be between $0.99 and $999.99');
      }
    }

    if (validated.yearlyPrice !== undefined) {
      if (validated.yearlyPrice < 9.99 || validated.yearlyPrice > 9999.99) {
        throw new Error('Yearly price must be between $9.99 and $9,999.99');
      }
    }

    return validated;
  }

  async getCreatorTiers(creatorId, includeInactive = false) {
    try {
      const query = {
        creatorId: this.database.createObjectId(creatorId)
      };

      if (!includeInactive) {
        query.isActive = true;
      }

      const tiers = await this.database.subscriptionTiers()
        .find(query)
        .sort({ priority: 1 })
        .toArray();

      return tiers;

    } catch (error) {
      console.error('Error getting creator tiers:', error);
      throw error;
    }
  }

  async getTierById(tierId) {
    try {
      return await this.database.subscriptionTiers().findOne({
        _id: this.database.createObjectId(tierId)
      });
    } catch (error) {
      console.error('Error getting tier by ID:', error);
      throw error;
    }
  }

  async deactivateTier(creatorId, tier) {
    try {
      // Check if tier has active subscribers
      const activeSubscribers = await this.database.subscriptions().countDocuments({
        creatorId: this.database.createObjectId(creatorId),
        tier: tier,
        status: 'active'
      });

      if (activeSubscribers > 0) {
        throw new Error(`Cannot deactivate tier with ${activeSubscribers} active subscribers`);
      }

      await this.database.subscriptionTiers().updateOne(
        {
          creatorId: this.database.createObjectId(creatorId),
          tier: tier
        },
        {
          $set: {
            isActive: false,
            isVisible: false,
            updatedAt: new Date()
          }
        }
      );

      this.emit('tierDeactivated', {
        creatorId,
        tier
      });

      return true;

    } catch (error) {
      console.error('Error deactivating tier:', error);
      throw error;
    }
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  async createSubscription(subscriptionData) {
    try {
      const {
        userId,
        creatorId,
        tier,
        billingCycle = 'monthly',
        paymentMethodId,
        promoCode = null
      } = subscriptionData;

      // Get tier information
      const tierInfo = await this.database.subscriptionTiers().findOne({
        creatorId: this.database.createObjectId(creatorId),
        tier: tier,
        isActive: true
      });

      if (!tierInfo) {
        throw new Error('Invalid or inactive subscription tier');
      }

      // Check subscriber limits
      if (tierInfo.maxSubscribers && tierInfo.currentSubscribers >= tierInfo.maxSubscribers) {
        throw new Error('Subscription tier is at maximum capacity');
      }

      // Check for existing active subscription
      const existingSubscription = await this.database.subscriptions().findOne({
        userId: this.database.createObjectId(userId),
        creatorId: this.database.createObjectId(creatorId),
        status: { $in: ['active', 'trialing'] }
      });

      if (existingSubscription) {
        throw new Error('User already has an active subscription to this creator');
      }

      // Calculate pricing
      const pricing = await this.calculateSubscriptionPricing(tierInfo, billingCycle, promoCode);

      // Create subscription
      const subscription = {
        _id: this.database.createObjectId(),
        subscriptionId: this.generateSubscriptionId(),
        userId: this.database.createObjectId(userId),
        creatorId: this.database.createObjectId(creatorId),
        tier: tier,
        tierName: tierInfo.name,
        billing: {
          cycle: billingCycle,
          amount: pricing.amount,
          originalAmount: pricing.originalAmount,
          discount: pricing.discount,
          currency: 'USD'
        },
        paymentMethodId: this.database.createObjectId(paymentMethodId),
        status: 'pending',
        trial: {
          isTrialing: false,
          trialEnd: null
        },
        currentPeriod: {
          start: new Date(),
          end: this.calculatePeriodEnd(billingCycle)
        },
        cancelAtPeriodEnd: false,
        cancelReason: null,
        metadata: {
          promoCode: promoCode,
          signupSource: 'web'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.database.subscriptions().insertOne(subscription);

      // Update tier subscriber count
      await this.database.subscriptionTiers().updateOne(
        { _id: tierInfo._id },
        { $inc: { currentSubscribers: 1 } }
      );

      this.emit('subscriptionCreated', {
        subscriptionId: result.insertedId,
        userId,
        creatorId,
        tier,
        amount: pricing.amount
      });

      return { ...subscription, _id: result.insertedId };

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  generateSubscriptionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `sub_${timestamp}_${random}`;
  }

  async calculateSubscriptionPricing(tierInfo, billingCycle, promoCode = null) {
    let amount = billingCycle === 'yearly' ? tierInfo.yearlyPrice : tierInfo.monthlyPrice;
    const originalAmount = amount;
    let discount = 0;

    // Apply promo code if provided
    if (promoCode) {
      const promo = await this.validatePromoCode(promoCode, tierInfo.creatorId);
      if (promo && promo.isValid) {
        if (promo.type === 'percentage') {
          discount = amount * (promo.value / 100);
        } else if (promo.type === 'fixed') {
          discount = Math.min(promo.value, amount);
        }
        amount = Math.max(0, amount - discount);
      }
    }

    return {
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
      originalAmount,
      discount,
      promoCode
    };
  }

  calculatePeriodEnd(billingCycle) {
    const now = new Date();
    if (billingCycle === 'yearly') {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  async updateSubscription(subscriptionId, updateData) {
    try {
      const validFields = [
        'status', 'cancelAtPeriodEnd', 'cancelReason', 
        'paymentMethodId', 'metadata'
      ];

      const updateQuery = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (validFields.includes(key)) {
          updateQuery[key] = value;
        }
      }

      updateQuery.updatedAt = new Date();

      const result = await this.database.subscriptions().findOneAndUpdate(
        { _id: this.database.createObjectId(subscriptionId) },
        { $set: updateQuery },
        { returnDocument: 'after' }
      );

      if (!result.value) {
        throw new Error('Subscription not found');
      }

      this.emit('subscriptionUpdated', {
        subscriptionId,
        updateData: updateQuery
      });

      return result.value;

    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId, cancelReason = 'user_requested', cancelAtPeriodEnd = true) {
    try {
      const subscription = await this.database.subscriptions().findOne({
        _id: this.database.createObjectId(subscriptionId)
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.status === 'canceled') {
        throw new Error('Subscription is already canceled');
      }

      const updateData = {
        cancelAtPeriodEnd,
        cancelReason,
        canceledAt: new Date(),
        updatedAt: new Date()
      };

      if (!cancelAtPeriodEnd) {
        updateData.status = 'canceled';
        updateData.currentPeriod.end = new Date();
      }

      await this.database.subscriptions().updateOne(
        { _id: subscription._id },
        { $set: updateData }
      );

      // Update tier subscriber count if immediately canceled
      if (!cancelAtPeriodEnd) {
        await this.database.subscriptionTiers().updateOne(
          {
            creatorId: subscription.creatorId,
            tier: subscription.tier
          },
          { $inc: { currentSubscribers: -1 } }
        );
      }

      this.emit('subscriptionCanceled', {
        subscriptionId,
        userId: subscription.userId,
        creatorId: subscription.creatorId,
        tier: subscription.tier,
        cancelAtPeriodEnd,
        cancelReason
      });

      return true;

    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription(subscriptionId) {
    try {
      const subscription = await this.database.subscriptions().findOne({
        _id: this.database.createObjectId(subscriptionId)
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.status === 'active') {
        throw new Error('Subscription is already active');
      }

      if (subscription.currentPeriod.end < new Date()) {
        throw new Error('Cannot reactivate expired subscription');
      }

      await this.database.subscriptions().updateOne(
        { _id: subscription._id },
        {
          $set: {
            status: 'active',
            cancelAtPeriodEnd: false,
            cancelReason: null,
            canceledAt: null,
            updatedAt: new Date()
          }
        }
      );

      this.emit('subscriptionReactivated', {
        subscriptionId,
        userId: subscription.userId,
        creatorId: subscription.creatorId,
        tier: subscription.tier
      });

      return true;

    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  // ============================================================================
  // PROMO CODES
  // ============================================================================

  async createPromoCode(creatorId, promoData) {
    try {
      const {
        code,
        type, // 'percentage' or 'fixed'
        value,
        description = '',
        maxUses = null,
        validFrom = new Date(),
        validUntil = null,
        applicableTiers = []
      } = promoData;

      // Validate promo code
      if (!code || code.length < 3) {
        throw new Error('Promo code must be at least 3 characters');
      }

      if (!['percentage', 'fixed'].includes(type)) {
        throw new Error('Promo type must be percentage or fixed');
      }

      if (type === 'percentage' && (value < 1 || value > 100)) {
        throw new Error('Percentage value must be between 1 and 100');
      }

      if (type === 'fixed' && (value < 0.01 || value > 1000)) {
        throw new Error('Fixed value must be between 0.01 and 1000');
      }

      // Check if code already exists
      const existingCode = await this.database.promoCodes().findOne({
        creatorId: this.database.createObjectId(creatorId),
        code: code.toLowerCase()
      });

      if (existingCode) {
        throw new Error('Promo code already exists');
      }

      const promoCode = {
        _id: this.database.createObjectId(),
        creatorId: this.database.createObjectId(creatorId),
        code: code.toLowerCase(),
        type,
        value,
        description,
        maxUses,
        currentUses: 0,
        validFrom,
        validUntil,
        applicableTiers,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.database.promoCodes().insertOne(promoCode);

      this.emit('promoCodeCreated', {
        creatorId,
        promoCodeId: result.insertedId,
        code
      });

      return { ...promoCode, _id: result.insertedId };

    } catch (error) {
      console.error('Error creating promo code:', error);
      throw error;
    }
  }

  async validatePromoCode(code, creatorId) {
    try {
      const promoCode = await this.database.promoCodes().findOne({
        creatorId: this.database.createObjectId(creatorId),
        code: code.toLowerCase(),
        isActive: true
      });

      if (!promoCode) {
        return { isValid: false, reason: 'Invalid promo code' };
      }

      const now = new Date();

      // Check validity dates
      if (promoCode.validFrom > now) {
        return { isValid: false, reason: 'Promo code not yet valid' };
      }

      if (promoCode.validUntil && promoCode.validUntil < now) {
        return { isValid: false, reason: 'Promo code has expired' };
      }

      // Check usage limits
      if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
        return { isValid: false, reason: 'Promo code usage limit reached' };
      }

      return {
        isValid: true,
        type: promoCode.type,
        value: promoCode.value,
        description: promoCode.description
      };

    } catch (error) {
      console.error('Error validating promo code:', error);
      return { isValid: false, reason: 'Error validating promo code' };
    }
  }

  async usePromoCode(code, creatorId) {
    try {
      await this.database.promoCodes().updateOne(
        {
          creatorId: this.database.createObjectId(creatorId),
          code: code.toLowerCase()
        },
        {
          $inc: { currentUses: 1 },
          $set: { updatedAt: new Date() }
        }
      );

      this.emit('promoCodeUsed', {
        creatorId,
        code
      });

    } catch (error) {
      console.error('Error using promo code:', error);
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async updateAnalytics() {
    try {
      const [
        totalSubscribers,
        totalRevenue,
        tierStats
      ] = await Promise.all([
        this.database.subscriptions().countDocuments({ status: 'active' }),
        this.getTotalRevenue(),
        this.getTierStatistics()
      ]);

      this.analytics = {
        totalSubscribers,
        totalRevenue,
        tierStats,
        conversionRates: await this.getConversionRates(),
        churnRates: await this.getChurnRates(),
        averageLifetimeValue: await this.getAverageLifetimeValue(),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error updating subscription analytics:', error);
    }
  }

  async getTotalRevenue() {
    try {
      const result = await this.database.transactions().aggregate([
        {
          $match: {
            type: 'subscription',
            status: 'completed'
          }
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
      console.error('Error getting total revenue:', error);
      return 0;
    }
  }

  async getTierStatistics() {
    try {
      const result = await this.database.subscriptions().aggregate([
        {
          $match: { status: 'active' }
        },
        {
          $group: {
            _id: '$tier',
            count: { $sum: 1 },
            revenue: { $sum: '$billing.amount' }
          }
        },
        {
          $sort: { revenue: -1 }
        }
      ]).toArray();

      return result;
    } catch (error) {
      console.error('Error getting tier statistics:', error);
      return [];
    }
  }

  async getConversionRates() {
    // Implementation for conversion rate calculation
    return {};
  }

  async getChurnRates() {
    // Implementation for churn rate calculation
    return {};
  }

  async getAverageLifetimeValue() {
    // Implementation for lifetime value calculation
    return {};
  }

  // ============================================================================
  // SUBSCRIPTION QUERIES
  // ============================================================================

  async getUserSubscriptions(userId) {
    try {
      return await this.database.subscriptions()
        .find({
          userId: this.database.createObjectId(userId),
          status: { $in: ['active', 'trialing', 'past_due'] }
        })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      throw error;
    }
  }

  async getCreatorSubscriptions(creatorId, status = null) {
    try {
      const query = {
        creatorId: this.database.createObjectId(creatorId)
      };

      if (status) {
        query.status = status;
      }

      return await this.database.subscriptions()
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error getting creator subscriptions:', error);
      throw error;
    }
  }

  async getSubscriptionById(subscriptionId) {
    try {
      return await this.database.subscriptions().findOne({
        _id: this.database.createObjectId(subscriptionId)
      });
    } catch (error) {
      console.error('Error getting subscription by ID:', error);
      throw error;
    }
  }

  async hasActiveSubscription(userId, creatorId) {
    try {
      const subscription = await this.database.subscriptions().findOne({
        userId: this.database.createObjectId(userId),
        creatorId: this.database.createObjectId(creatorId),
        status: { $in: ['active', 'trialing'] }
      });

      return !!subscription;
    } catch (error) {
      console.error('Error checking active subscription:', error);
      return false;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getAnalytics() {
    return { ...this.analytics };
  }

  getDefaultTiers() {
    return { ...this.defaultTiers };
  }

  async shutdown() {
    console.log('🔄 Shutting down Subscription Tiers System...');
    this.isInitialized = false;
    this.emit('shutdown');
    console.log('✅ Subscription Tiers System shut down successfully');
  }
}

module.exports = SubscriptionTiersSystem;
