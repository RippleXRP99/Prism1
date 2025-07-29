// ============================================================================
// PAYMENTS PACKAGE INDEX - Month 6: Advanced Monetization
// ============================================================================

const PaymentProcessingSystem = require('./payment-processing');
const SubscriptionTiersSystem = require('./subscription-tiers');
const PayPerViewSystem = require('./pay-per-view');
const TippingSystem = require('./tipping-system');
const RevenueDashboardSystem = require('./revenue-dashboard');

class PaymentsManager {
  constructor(database) {
    this.database = database;
    this.isInitialized = false;

    // Initialize all payment systems
    this.paymentProcessor = new PaymentProcessingSystem(database);
    this.subscriptionTiers = new SubscriptionTiersSystem(database);
    this.payPerView = new PayPerViewSystem(database);
    this.tippingSystem = new TippingSystem(database, this.paymentProcessor);
    this.revenueDashboard = new RevenueDashboardSystem(database);

    // System status tracking
    this.systemStatus = {
      paymentProcessor: 'initializing',
      subscriptionTiers: 'initializing',
      payPerView: 'initializing',
      tippingSystem: 'initializing',
      revenueDashboard: 'initializing'
    };

    // Setup event listeners
    this.setupEventListeners();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing PRISM Payments Manager...');

      // Initialize all systems in parallel
      const initPromises = [
        this.initializePaymentProcessor(),
        this.initializeSubscriptionTiers(),
        this.initializePayPerView(),
        this.initializeTippingSystem(),
        this.initializeRevenueDashboard()
      ];

      await Promise.all(initPromises);

      this.isInitialized = true;
      console.log('✅ PRISM Payments Manager initialized successfully');

      return {
        success: true,
        systemStatus: this.systemStatus,
        message: 'All payment systems initialized successfully'
      };

    } catch (error) {
      console.error('❌ Failed to initialize PRISM Payments Manager:', error);
      throw error;
    }
  }

  async initializePaymentProcessor() {
    try {
      await this.paymentProcessor.initialize();
      this.systemStatus.paymentProcessor = 'active';
      console.log('✅ Payment Processor initialized');
    } catch (error) {
      this.systemStatus.paymentProcessor = 'error';
      console.error('❌ Payment Processor initialization failed:', error);
      throw error;
    }
  }

  async initializeSubscriptionTiers() {
    try {
      await this.subscriptionTiers.initialize();
      this.systemStatus.subscriptionTiers = 'active';
      console.log('✅ Subscription Tiers System initialized');
    } catch (error) {
      this.systemStatus.subscriptionTiers = 'error';
      console.error('❌ Subscription Tiers System initialization failed:', error);
      throw error;
    }
  }

  async initializePayPerView() {
    try {
      await this.payPerView.initialize();
      this.systemStatus.payPerView = 'active';
      console.log('✅ Pay-Per-View System initialized');
    } catch (error) {
      this.systemStatus.payPerView = 'error';
      console.error('❌ Pay-Per-View System initialization failed:', error);
      throw error;
    }
  }

  async initializeTippingSystem() {
    try {
      await this.tippingSystem.initialize();
      this.systemStatus.tippingSystem = 'active';
      console.log('✅ Tipping System initialized');
    } catch (error) {
      this.systemStatus.tippingSystem = 'error';
      console.error('❌ Tipping System initialization failed:', error);
      throw error;
    }
  }

  async initializeRevenueDashboard() {
    try {
      await this.revenueDashboard.initialize();
      this.systemStatus.revenueDashboard = 'active';
      console.log('✅ Revenue Dashboard System initialized');
    } catch (error) {
      this.systemStatus.revenueDashboard = 'error';
      console.error('❌ Revenue Dashboard System initialization failed:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Payment processor events
    this.paymentProcessor.on('paymentProcessed', (data) => {
      this.handlePaymentProcessed(data);
    });

    // Subscription events
    this.subscriptionTiers.on('subscriptionCreated', (data) => {
      this.handleSubscriptionCreated(data);
    });

    this.subscriptionTiers.on('subscriptionCanceled', (data) => {
      this.handleSubscriptionCanceled(data);
    });

    // Pay-per-view events
    this.payPerView.on('contentPurchased', (data) => {
      this.handleContentPurchased(data);
    });

    // Tipping events
    this.tippingSystem.on('tipSent', (data) => {
      this.handleTipSent(data);
    });

    this.tippingSystem.on('tipGoalCompleted', (data) => {
      this.handleTipGoalCompleted(data);
    });

    // Revenue events
    this.revenueDashboard.on('revenueRecorded', (data) => {
      console.log('📈 Revenue recorded:', data);
    });
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  async handlePaymentProcessed(data) {
    try {
      const { transaction, result, success } = data;

      if (success) {
        // Record revenue
        await this.revenueDashboard.recordRevenue({
          creatorId: transaction.creatorId?.toString(),
          category: this.mapTransactionTypeToCategory(transaction.type),
          amount: transaction.fees?.creator || transaction.amount,
          source: transaction._id.toString(),
          sourceType: transaction.type,
          userId: transaction.userId.toString(),
          metadata: {
            transactionId: transaction._id,
            providerTransactionId: result.transactionId
          }
        });

        console.log(`💰 Payment processed successfully: ${transaction.type} - $${transaction.amount}`);
      }

    } catch (error) {
      console.error('Error handling payment processed event:', error);
    }
  }

  async handleSubscriptionCreated(data) {
    try {
      const { subscriptionId, userId, creatorId, tier, amount } = data;

      console.log(`🔄 New subscription created: ${tier} - $${amount}/month`);

      // Additional subscription creation logic can go here
      // e.g., sending welcome emails, granting access, etc.

    } catch (error) {
      console.error('Error handling subscription created event:', error);
    }
  }

  async handleSubscriptionCanceled(data) {
    try {
      const { subscriptionId, userId, creatorId, tier, cancelReason } = data;

      console.log(`❌ Subscription canceled: ${tier} - Reason: ${cancelReason}`);

      // Additional subscription cancellation logic can go here
      // e.g., sending feedback requests, exit surveys, etc.

    } catch (error) {
      console.error('Error handling subscription canceled event:', error);
    }
  }

  async handleContentPurchased(data) {
    try {
      const { purchaseId, userId, contentId, creatorId, amount } = data;

      console.log(`🎬 Content purchased: ${contentId} - $${amount}`);

      // Additional content purchase logic can go here
      // e.g., analytics tracking, recommendations, etc.

    } catch (error) {
      console.error('Error handling content purchased event:', error);
    }
  }

  async handleTipSent(data) {
    try {
      const { tipId, userId, creatorId, amount, message, streamId } = data;

      console.log(`💝 Tip sent: $${amount}${message ? ` - "${message}"` : ''}`);

      // Additional tip handling logic can go here
      // e.g., live stream notifications, leaderboard updates, etc.

    } catch (error) {
      console.error('Error handling tip sent event:', error);
    }
  }

  async handleTipGoalCompleted(data) {
    try {
      const { goalId, streamId, targetAmount, finalAmount } = data;

      console.log(`🎯 Tip goal completed! Target: $${targetAmount}, Final: $${finalAmount}`);

      // Additional goal completion logic can go here
      // e.g., special effects, rewards, notifications, etc.

    } catch (error) {
      console.error('Error handling tip goal completed event:', error);
    }
  }

  mapTransactionTypeToCategory(type) {
    const mapping = {
      'subscription': 'subscriptions',
      'tip': 'tips',
      'pay_per_view': 'payPerView',
      'merchandise': 'merchandise',
      'commission': 'commissions',
      'affiliate': 'affiliate'
    };

    return mapping[type] || 'other';
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  // Payment Processing
  async processPayment(paymentData) {
    this.ensureInitialized();
    return await this.paymentProcessor.processPayment(paymentData);
  }

  async addPaymentMethod(userId, paymentMethodData) {
    this.ensureInitialized();
    return await this.paymentProcessor.addPaymentMethod(userId, paymentMethodData);
  }

  async getUserPaymentMethods(userId) {
    this.ensureInitialized();
    return await this.paymentProcessor.getUserPaymentMethods(userId);
  }

  // Subscription Management
  async createSubscription(subscriptionData) {
    this.ensureInitialized();
    return await this.subscriptionTiers.createSubscription(subscriptionData);
  }

  async cancelSubscription(subscriptionId, cancelReason, cancelAtPeriodEnd = true) {
    this.ensureInitialized();
    return await this.subscriptionTiers.cancelSubscription(subscriptionId, cancelReason, cancelAtPeriodEnd);
  }

  async getCreatorTiers(creatorId) {
    this.ensureInitialized();
    return await this.subscriptionTiers.getCreatorTiers(creatorId);
  }

  async createCreatorTiers(creatorId, customTiers = null) {
    this.ensureInitialized();
    return await this.subscriptionTiers.createCreatorTiers(creatorId, customTiers);
  }

  async getUserSubscriptions(userId) {
    this.ensureInitialized();
    return await this.subscriptionTiers.getUserSubscriptions(userId);
  }

  // Pay-Per-View
  async createPPVContent(creatorId, contentData) {
    this.ensureInitialized();
    return await this.payPerView.createPPVContent(creatorId, contentData);
  }

  async purchaseContent(userId, contentId, paymentMethodId) {
    this.ensureInitialized();
    return await this.payPerView.purchaseContent(userId, contentId, paymentMethodId);
  }

  async verifyContentAccess(userId, contentId, deviceId = null) {
    this.ensureInitialized();
    return await this.payPerView.verifyContentAccess(userId, contentId, deviceId);
  }

  async getCreatorPPVContent(creatorId, options = {}) {
    this.ensureInitialized();
    return await this.payPerView.getCreatorPPVContent(creatorId, options);
  }

  async getUserPurchases(userId, options = {}) {
    this.ensureInitialized();
    return await this.payPerView.getUserPurchases(userId, options);
  }

  // Tipping
  async sendTip(tipData) {
    this.ensureInitialized();
    return await this.tippingSystem.sendTip(tipData);
  }

  async createTipGoal(creatorId, goalData) {
    this.ensureInitialized();
    return await this.tippingSystem.createTipGoal(creatorId, goalData);
  }

  async getLeaderboard(type, limit = null) {
    this.ensureInitialized();
    return await this.tippingSystem.getLeaderboard(type, limit);
  }

  async getUserTips(userId, options = {}) {
    this.ensureInitialized();
    return await this.tippingSystem.getUserTips(userId, options);
  }

  getLiveStreamTips(streamId) {
    this.ensureInitialized();
    return this.tippingSystem.getLiveStreamTips(streamId);
  }

  // Revenue Dashboard
  async getCreatorDashboard(creatorId, period = '30d') {
    this.ensureInitialized();
    return await this.revenueDashboard.getCreatorDashboard(creatorId, period);
  }

  async generateRevenueReport(creatorId, options = {}) {
    this.ensureInitialized();
    return await this.revenueDashboard.generateRevenueReport(creatorId, options);
  }

  getRealtimeRevenue() {
    this.ensureInitialized();
    return this.revenueDashboard.getRealtimeRevenue();
  }

  // Wallet Management
  async getCreatorWallet(creatorId) {
    this.ensureInitialized();
    return await this.paymentProcessor.getCreatorWallet(creatorId);
  }

  async scheduleCreatorPayout(creatorId, amount, scheduledDate = null) {
    this.ensureInitialized();
    return await this.paymentProcessor.scheduleCreatorPayout(creatorId, amount, scheduledDate);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error('Payments Manager not initialized. Call initialize() first.');
    }
  }

  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      systems: { ...this.systemStatus }
    };
  }

  getSystemStats() {
    if (!this.isInitialized) {
      return null;
    }

    return {
      paymentProcessor: this.paymentProcessor.getStats(),
      subscriptionTiers: this.subscriptionTiers.getAnalytics(),
      payPerView: this.payPerView.getAnalytics(),
      tippingSystem: this.tippingSystem.getAnalytics(),
      revenueDashboard: this.revenueDashboard.getRealtimeRevenue()
    };
  }

  // Configuration getters
  getTipPresets() {
    return this.tippingSystem.getTipPresets();
  }

  getSubscriptionTierDefaults() {
    return this.subscriptionTiers.getDefaultTiers();
  }

  getPPVPricingTiers() {
    return this.payPerView.getPricingTiers();
  }

  getRevenueCategories() {
    return this.revenueDashboard.getRevenueCategories();
  }

  // ============================================================================
  // SHUTDOWN
  // ============================================================================

  async shutdown() {
    try {
      console.log('🔄 Shutting down PRISM Payments Manager...');

      const shutdownPromises = [
        this.paymentProcessor.shutdown(),
        this.subscriptionTiers.shutdown(),
        this.payPerView.shutdown(),
        this.tippingSystem.shutdown(),
        this.revenueDashboard.shutdown()
      ];

      await Promise.all(shutdownPromises);

      this.isInitialized = false;
      console.log('✅ PRISM Payments Manager shut down successfully');

    } catch (error) {
      console.error('❌ Error during Payments Manager shutdown:', error);
      throw error;
    }
  }
}

// Legacy PaymentManager class for backwards compatibility
class PaymentManager {
  constructor() {
    console.warn('⚠️ PaymentManager is deprecated. Use PaymentsManager instead.');
    this.providers = {
      stripe: null,
      paypal: null,
      crypto: null
    };
    
    this.supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    this.minimumAmounts = {
      USD: 1.00,
      EUR: 1.00,
      GBP: 1.00,
      CAD: 1.50,
      AUD: 1.50
    };
  }

  async initializeProviders() {
    console.log('🔄 Initializing payment providers...');
    console.log('✅ Payment providers initialized (placeholder)');
  }

  async createPaymentIntent(data) {
    const {
      amount,
      currency = 'USD',
      creatorId,
      userId,
      type,
      description,
      metadata = {}
    } = data;

    if (!this.validateAmount(amount, currency)) {
      throw new Error(`Invalid amount: ${amount} ${currency}`);
    }

    return {
      id: `pi_${Date.now()}`,
      amount,
      currency,
      status: 'requires_payment_method',
      client_secret: `pi_${Date.now()}_secret_${Math.random()}`,
      metadata: {
        creatorId,
        userId,
        type,
        description,
        ...metadata
      }
    };
  }

  validateAmount(amount, currency) {
    const minimum = this.minimumAmounts[currency] || 1.00;
    return amount >= minimum && amount <= 999999.99;
  }

  async confirmPayment(paymentIntentId, paymentMethod) {
    console.log(`💳 Processing payment: ${paymentIntentId}`);
    
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount_received: 1000,
      currency: 'usd',
      created: Math.floor(Date.now() / 1000)
    };
  }

  async createSubscription(customerId, priceId, options = {}) {
    return {
      id: `sub_${Date.now()}`,
      customer: customerId,
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
      items: {
        data: [{
          id: `si_${Date.now()}`,
          price: { id: priceId },
          quantity: 1
        }]
      }
    };
  }

  async cancelSubscription(subscriptionId) {
    return {
      id: subscriptionId,
      status: 'canceled',
      canceled_at: Math.floor(Date.now() / 1000)
    };
  }

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  calculatePlatformFee(amount, feePercentage = 5) {
    return Math.round(amount * (feePercentage / 100) * 100) / 100;
  }

  calculateCreatorEarnings(amount, platformFeePercentage = 5, processingFeePercentage = 2.9) {
    const platformFee = this.calculatePlatformFee(amount, platformFeePercentage);
    const processingFee = this.calculatePlatformFee(amount, processingFeePercentage);
    return amount - platformFee - processingFee;
  }
}

// Export the main class and individual systems
module.exports = {
  PaymentsManager,
  PaymentProcessingSystem,
  SubscriptionTiersSystem,
  PayPerViewSystem,
  TippingSystem,
  RevenueDashboardSystem,
  PaymentManager // Legacy support
};
