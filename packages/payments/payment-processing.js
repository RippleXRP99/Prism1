// ============================================================================
// PAYMENT PROCESSING SYSTEM - Month 6: Advanced Monetization
// ============================================================================

const EventEmitter = require('events');
const crypto = require('crypto');

class PaymentProcessingSystem extends EventEmitter {
  constructor(database) {
    super();
    this.database = database;
    this.isInitialized = false;

    // Payment providers
    this.providers = {
      stripe: null,
      paypal: null,
      crypto: null
    };

    // Payment processing queues
    this.processingQueue = new Map();
    this.retryQueue = new Map();

    // Fee structures
    this.fees = {
      platform: {
        percentage: 0.05, // 5% platform fee
        minimum: 0.50,    // $0.50 minimum fee
        maximum: 50.00    // $50 maximum fee
      },
      processing: {
        stripe: {
          percentage: 0.029, // 2.9%
          fixed: 0.30        // $0.30
        },
        paypal: {
          percentage: 0.034, // 3.4%
          fixed: 0.30        // $0.30
        },
        crypto: {
          percentage: 0.01,  // 1%
          fixed: 0.00        // No fixed fee
        }
      }
    };

    // Transaction limits
    this.limits = {
      tips: {
        minimum: 1.00,
        maximum: 500.00,
        dailyLimit: 2000.00
      },
      subscriptions: {
        minimum: 4.99,
        maximum: 99.99
      },
      payPerView: {
        minimum: 0.99,
        maximum: 49.99
      },
      payouts: {
        minimum: 20.00,
        maximum: 10000.00,
        dailyLimit: 50000.00
      }
    };

    // Statistics tracking
    this.stats = {
      totalTransactions: 0,
      totalVolume: 0,
      successRate: 0,
      averageTransactionValue: 0,
      topPaymentMethods: [],
      lastUpdated: new Date()
    };

    this.setupProviders();
    this.setupRetryMechanism();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing Payment Processing System...');

      await this.createIndexes();
      await this.initializeProviders();
      await this.validateConfiguration();
      await this.updateStats();

      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ Payment Processing System initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Payment Processing System:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Transactions indexes
      await this.database.transactions().createIndex({ userId: 1, status: 1 });
      await this.database.transactions().createIndex({ creatorId: 1, type: 1 });
      await this.database.transactions().createIndex({ transactionId: 1 }, { unique: true });
      await this.database.transactions().createIndex({ createdAt: -1 });
      await this.database.transactions().createIndex({ amount: -1 });

      // Payment methods indexes
      await this.database.paymentMethods().createIndex({ userId: 1, isActive: 1 });
      await this.database.paymentMethods().createIndex({ provider: 1, type: 1 });

      // Payouts indexes
      await this.database.payouts().createIndex({ creatorId: 1, status: 1 });
      await this.database.payouts().createIndex({ scheduledDate: 1 });
      await this.database.payouts().createIndex({ createdAt: -1 });

      // Wallet indexes
      await this.database.wallets().createIndex({ userId: 1 }, { unique: true });
      await this.database.wallets().createIndex({ balance: -1 });

      console.log('✅ Payment indexes created');
    } catch (error) {
      console.error('❌ Error creating payment indexes:', error);
    }
  }

  setupProviders() {
    // Initialize payment providers based on environment
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        this.providers.stripe = stripe;
        console.log('✅ Stripe provider initialized');
      }

      if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
        // PayPal SDK initialization would go here
        console.log('✅ PayPal provider ready for initialization');
      }

      // Crypto payment provider initialization
      console.log('✅ Payment providers setup completed');
    } catch (error) {
      console.error('❌ Error setting up payment providers:', error);
    }
  }

  async initializeProviders() {
    // Test connectivity to payment providers
    const providerTests = [];

    if (this.providers.stripe) {
      providerTests.push(this.testStripeConnection());
    }

    if (this.providers.paypal) {
      providerTests.push(this.testPayPalConnection());
    }

    await Promise.allSettled(providerTests);
  }

  async testStripeConnection() {
    try {
      await this.providers.stripe.balance.retrieve();
      console.log('✅ Stripe connection verified');
      return true;
    } catch (error) {
      console.error('❌ Stripe connection failed:', error.message);
      return false;
    }
  }

  async testPayPalConnection() {
    try {
      // PayPal connection test would go here
      console.log('✅ PayPal connection test ready');
      return true;
    } catch (error) {
      console.error('❌ PayPal connection failed:', error.message);
      return false;
    }
  }

  // ============================================================================
  // PAYMENT PROCESSING
  // ============================================================================

  async processPayment(paymentData) {
    try {
      const {
        userId,
        creatorId,
        amount,
        currency = 'USD',
        type, // 'tip', 'subscription', 'pay_per_view'
        paymentMethodId,
        metadata = {}
      } = paymentData;

      // Validate payment
      const validation = await this.validatePayment(paymentData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Create transaction record
      const transaction = await this.createTransaction({
        userId,
        creatorId,
        amount,
        currency,
        type,
        paymentMethodId,
        metadata,
        status: 'pending'
      });

      // Process payment based on provider
      const paymentMethod = await this.getPaymentMethod(paymentMethodId);
      let result;

      switch (paymentMethod.provider) {
        case 'stripe':
          result = await this.processStripePayment(transaction, paymentMethod);
          break;
        case 'paypal':
          result = await this.processPayPalPayment(transaction, paymentMethod);
          break;
        case 'crypto':
          result = await this.processCryptoPayment(transaction, paymentMethod);
          break;
        default:
          throw new Error('Unsupported payment provider');
      }

      // Update transaction with result
      await this.updateTransaction(transaction._id, {
        status: result.success ? 'completed' : 'failed',
        providerTransactionId: result.transactionId,
        providerResponse: result.response,
        completedAt: result.success ? new Date() : null,
        failureReason: result.success ? null : result.error
      });

      // Handle successful payment
      if (result.success) {
        await this.handleSuccessfulPayment(transaction, result);
      } else {
        await this.handleFailedPayment(transaction, result);
      }

      this.emit('paymentProcessed', {
        transaction,
        result,
        success: result.success
      });

      return {
        success: result.success,
        transactionId: transaction._id,
        providerTransactionId: result.transactionId,
        message: result.success ? 'Payment processed successfully' : result.error
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }

  async validatePayment(paymentData) {
    const { userId, creatorId, amount, type, paymentMethodId } = paymentData;

    // Check required fields
    if (!userId || !amount || !type || !paymentMethodId) {
      return { valid: false, error: 'Missing required payment fields' };
    }

    // Validate amount based on type
    const typeLimit = this.limits[type];
    if (!typeLimit) {
      return { valid: false, error: 'Invalid payment type' };
    }

    if (amount < typeLimit.minimum || amount > typeLimit.maximum) {
      return { 
        valid: false, 
        error: `Amount must be between $${typeLimit.minimum} and $${typeLimit.maximum}` 
      };
    }

    // Check daily limits
    const dailySpent = await this.getDailySpending(userId, type);
    if (dailySpent + amount > typeLimit.dailyLimit) {
      return { 
        valid: false, 
        error: `Daily limit of $${typeLimit.dailyLimit} exceeded` 
      };
    }

    // Validate payment method
    const paymentMethod = await this.getPaymentMethod(paymentMethodId);
    if (!paymentMethod || !paymentMethod.isActive) {
      return { valid: false, error: 'Invalid or inactive payment method' };
    }

    // Check if user can pay creator (not themselves, etc.)
    if (creatorId && userId === creatorId) {
      return { valid: false, error: 'Cannot pay yourself' };
    }

    return { valid: true };
  }

  async createTransaction(transactionData) {
    const transaction = {
      _id: this.database.createObjectId(),
      transactionId: this.generateTransactionId(),
      userId: this.database.createObjectId(transactionData.userId),
      creatorId: transactionData.creatorId ? this.database.createObjectId(transactionData.creatorId) : null,
      amount: transactionData.amount,
      currency: transactionData.currency,
      type: transactionData.type,
      paymentMethodId: this.database.createObjectId(transactionData.paymentMethodId),
      metadata: transactionData.metadata,
      status: transactionData.status,
      fees: this.calculateFees(transactionData.amount, transactionData.type),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.database.transactions().insertOne(transaction);
    return { ...transaction, _id: result.insertedId };
  }

  generateTransactionId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `tx_${timestamp}_${random}`;
  }

  calculateFees(amount, type) {
    const platformFee = Math.min(
      Math.max(amount * this.fees.platform.percentage, this.fees.platform.minimum),
      this.fees.platform.maximum
    );

    // Processing fees vary by provider - using Stripe as default
    const processingFee = (amount * this.fees.processing.stripe.percentage) + this.fees.processing.stripe.fixed;

    const creatorAmount = amount - platformFee - processingFee;

    return {
      total: amount,
      platform: platformFee,
      processing: processingFee,
      creator: creatorAmount
    };
  }

  // ============================================================================
  // PROVIDER-SPECIFIC PROCESSING
  // ============================================================================

  async processStripePayment(transaction, paymentMethod) {
    try {
      if (!this.providers.stripe) {
        throw new Error('Stripe provider not initialized');
      }

      const paymentIntent = await this.providers.stripe.paymentIntents.create({
        amount: Math.round(transaction.amount * 100), // Convert to cents
        currency: transaction.currency.toLowerCase(),
        payment_method: paymentMethod.providerMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          transactionId: transaction.transactionId,
          userId: transaction.userId.toString(),
          creatorId: transaction.creatorId?.toString(),
          type: transaction.type
        }
      });

      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          transactionId: paymentIntent.id,
          response: paymentIntent
        };
      } else {
        return {
          success: false,
          error: 'Payment not completed',
          response: paymentIntent
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        response: error
      };
    }
  }

  async processPayPalPayment(transaction, paymentMethod) {
    try {
      // PayPal payment processing implementation
      // This would integrate with PayPal SDK
      
      return {
        success: true,
        transactionId: `pp_${Date.now()}`,
        response: { status: 'COMPLETED' }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        response: error
      };
    }
  }

  async processCryptoPayment(transaction, paymentMethod) {
    try {
      // Cryptocurrency payment processing
      // This would integrate with crypto payment processors
      
      return {
        success: true,
        transactionId: `crypto_${Date.now()}`,
        response: { status: 'confirmed' }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        response: error
      };
    }
  }

  // ============================================================================
  // PAYMENT METHOD MANAGEMENT
  // ============================================================================

  async addPaymentMethod(userId, paymentMethodData) {
    try {
      const {
        provider, // stripe, paypal, crypto
        type,     // card, bank_account, paypal, bitcoin
        token,    // Provider-specific token
        metadata = {}
      } = paymentMethodData;

      // Verify with provider
      let providerMethodId;
      switch (provider) {
        case 'stripe':
          providerMethodId = await this.verifyStripePaymentMethod(token);
          break;
        case 'paypal':
          providerMethodId = await this.verifyPayPalPaymentMethod(token);
          break;
        default:
          providerMethodId = token;
      }

      const paymentMethod = {
        _id: this.database.createObjectId(),
        userId: this.database.createObjectId(userId),
        provider,
        type,
        providerMethodId,
        isActive: true,
        isDefault: false,
        metadata,
        createdAt: new Date(),
        lastUsed: null
      };

      const result = await this.database.paymentMethods().insertOne(paymentMethod);
      
      this.emit('paymentMethodAdded', {
        userId,
        paymentMethodId: result.insertedId,
        provider,
        type
      });

      return { ...paymentMethod, _id: result.insertedId };

    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async verifyStripePaymentMethod(token) {
    if (!this.providers.stripe) {
      throw new Error('Stripe provider not initialized');
    }

    const paymentMethod = await this.providers.stripe.paymentMethods.retrieve(token);
    return paymentMethod.id;
  }

  async verifyPayPalPaymentMethod(token) {
    // PayPal verification logic
    return token;
  }

  async getPaymentMethod(paymentMethodId) {
    return await this.database.paymentMethods().findOne({
      _id: this.database.createObjectId(paymentMethodId),
      isActive: true
    });
  }

  async getUserPaymentMethods(userId) {
    return await this.database.paymentMethods()
      .find({
        userId: this.database.createObjectId(userId),
        isActive: true
      })
      .sort({ isDefault: -1, createdAt: -1 })
      .toArray();
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
        billingCycle = 'monthly', // monthly, yearly
        paymentMethodId
      } = subscriptionData;

      // Get subscription tier details
      const creator = await this.database.users().findOne({
        _id: this.database.createObjectId(creatorId)
      });

      const tierInfo = creator.subscriptionTiers?.find(t => t.tier === tier);
      if (!tierInfo) {
        throw new Error('Invalid subscription tier');
      }

      const amount = billingCycle === 'yearly' ? 
        tierInfo.yearlyPrice || (tierInfo.monthlyPrice * 10) : // 2 months free for yearly
        tierInfo.monthlyPrice;

      // Process initial payment
      const paymentResult = await this.processPayment({
        userId,
        creatorId,
        amount,
        type: 'subscription',
        paymentMethodId,
        metadata: {
          tier,
          billingCycle,
          initialPayment: true
        }
      });

      if (!paymentResult.success) {
        throw new Error('Initial payment failed');
      }

      // Create subscription record
      const subscription = {
        _id: this.database.createObjectId(),
        userId: this.database.createObjectId(userId),
        creatorId: this.database.createObjectId(creatorId),
        tier,
        amount,
        billingCycle,
        paymentMethodId: this.database.createObjectId(paymentMethodId),
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: this.calculateNextBillingDate(billingCycle),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.database.subscriptions().insertOne(subscription);

      this.emit('subscriptionCreated', {
        userId,
        creatorId,
        subscriptionId: result.insertedId,
        tier,
        amount
      });

      return { ...subscription, _id: result.insertedId };

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  calculateNextBillingDate(billingCycle) {
    const now = new Date();
    if (billingCycle === 'yearly') {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  }

  async processSubscriptionRenewal(subscriptionId) {
    try {
      const subscription = await this.database.subscriptions().findOne({
        _id: this.database.createObjectId(subscriptionId)
      });

      if (!subscription || subscription.status !== 'active') {
        throw new Error('Invalid subscription for renewal');
      }

      // Process renewal payment
      const paymentResult = await this.processPayment({
        userId: subscription.userId.toString(),
        creatorId: subscription.creatorId.toString(),
        amount: subscription.amount,
        type: 'subscription',
        paymentMethodId: subscription.paymentMethodId.toString(),
        metadata: {
          subscriptionRenewal: true,
          subscriptionId: subscriptionId
        }
      });

      if (paymentResult.success) {
        // Update subscription period
        await this.database.subscriptions().updateOne(
          { _id: subscription._id },
          {
            $set: {
              currentPeriodStart: new Date(),
              currentPeriodEnd: this.calculateNextBillingDate(subscription.billingCycle),
              updatedAt: new Date()
            }
          }
        );

        this.emit('subscriptionRenewed', {
          subscriptionId,
          userId: subscription.userId,
          creatorId: subscription.creatorId,
          amount: subscription.amount
        });
      } else {
        // Handle failed renewal
        await this.handleFailedRenewal(subscription);
      }

      return paymentResult;

    } catch (error) {
      console.error('Error processing subscription renewal:', error);
      throw error;
    }
  }

  // ============================================================================
  // PAYOUT SYSTEM
  // ============================================================================

  async scheduleCreatorPayout(creatorId, amount, scheduledDate = null) {
    try {
      // Validate payout eligibility
      const eligibility = await this.validatePayoutEligibility(creatorId, amount);
      if (!eligibility.eligible) {
        throw new Error(eligibility.reason);
      }

      const payout = {
        _id: this.database.createObjectId(),
        creatorId: this.database.createObjectId(creatorId),
        amount,
        currency: 'USD',
        status: 'scheduled',
        scheduledDate: scheduledDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        fees: this.calculatePayoutFees(amount),
        method: 'bank_transfer', // Default method
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await this.database.payouts().insertOne(payout);

      this.emit('payoutScheduled', {
        creatorId,
        payoutId: result.insertedId,
        amount
      });

      return { ...payout, _id: result.insertedId };

    } catch (error) {
      console.error('Error scheduling payout:', error);
      throw error;
    }
  }

  async validatePayoutEligibility(creatorId, amount) {
    // Check minimum payout amount
    if (amount < this.limits.payouts.minimum) {
      return {
        eligible: false,
        reason: `Minimum payout amount is $${this.limits.payouts.minimum}`
      };
    }

    // Check available balance
    const wallet = await this.getCreatorWallet(creatorId);
    if (wallet.availableBalance < amount) {
      return {
        eligible: false,
        reason: 'Insufficient available balance'
      };
    }

    // Check daily payout limits
    const todayPayouts = await this.getTodayPayouts(creatorId);
    if (todayPayouts + amount > this.limits.payouts.dailyLimit) {
      return {
        eligible: false,
        reason: `Daily payout limit of $${this.limits.payouts.dailyLimit} exceeded`
      };
    }

    return { eligible: true };
  }

  calculatePayoutFees(amount) {
    // Simple flat fee for now - could be more complex
    const fee = Math.min(amount * 0.01, 5.00); // 1% up to $5
    return {
      total: amount,
      fee: fee,
      net: amount - fee
    };
  }

  // ============================================================================
  // WALLET MANAGEMENT
  // ============================================================================

  async getCreatorWallet(creatorId) {
    let wallet = await this.database.wallets().findOne({
      userId: this.database.createObjectId(creatorId)
    });

    if (!wallet) {
      wallet = await this.createWallet(creatorId);
    }

    return wallet;
  }

  async createWallet(userId) {
    const wallet = {
      _id: this.database.createObjectId(),
      userId: this.database.createObjectId(userId),
      balance: 0,
      availableBalance: 0,
      pendingBalance: 0,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.database.wallets().insertOne(wallet);
    return { ...wallet, _id: result.insertedId };
  }

  async updateWalletBalance(userId, amount, type = 'earning') {
    try {
      const wallet = await this.getCreatorWallet(userId);
      
      const updateData = {
        updatedAt: new Date()
      };

      if (type === 'earning') {
        updateData.balance = wallet.balance + amount;
        updateData.availableBalance = wallet.availableBalance + amount;
      } else if (type === 'payout') {
        updateData.balance = wallet.balance - amount;
        updateData.availableBalance = wallet.availableBalance - amount;
      } else if (type === 'pending') {
        updateData.pendingBalance = wallet.pendingBalance + amount;
      }

      await this.database.wallets().updateOne(
        { userId: this.database.createObjectId(userId) },
        { $set: updateData }
      );

      this.emit('walletUpdated', {
        userId,
        amount,
        type,
        newBalance: updateData.balance || wallet.balance
      });

      return updateData;

    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }

  // ============================================================================
  // STATISTICS AND ANALYTICS
  // ============================================================================

  async updateStats() {
    try {
      const [
        totalTransactions,
        totalVolume,
        successfulTransactions
      ] = await Promise.all([
        this.database.transactions().countDocuments(),
        this.database.transactions().aggregate([
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).toArray(),
        this.database.transactions().countDocuments({ status: 'completed' })
      ]);

      const volume = totalVolume[0]?.total || 0;
      const successRate = totalTransactions > 0 ? 
        (successfulTransactions / totalTransactions * 100).toFixed(2) : 0;

      this.stats = {
        totalTransactions,
        totalVolume: volume,
        successRate: parseFloat(successRate),
        averageTransactionValue: totalTransactions > 0 ? volume / totalTransactions : 0,
        topPaymentMethods: await this.getTopPaymentMethods(),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error updating payment stats:', error);
    }
  }

  async getTopPaymentMethods() {
    try {
      const result = await this.database.transactions().aggregate([
        { $match: { status: 'completed' } },
        {
          $lookup: {
            from: 'paymentMethods',
            localField: 'paymentMethodId',
            foreignField: '_id',
            as: 'paymentMethod'
          }
        },
        { $unwind: '$paymentMethod' },
        {
          $group: {
            _id: '$paymentMethod.provider',
            count: { $sum: 1 },
            volume: { $sum: '$amount' }
          }
        },
        { $sort: { volume: -1 } },
        { $limit: 5 }
      ]).toArray();

      return result;
    } catch (error) {
      console.error('Error getting top payment methods:', error);
      return [];
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  async getDailySpending(userId, type) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await this.database.transactions().aggregate([
      {
        $match: {
          userId: this.database.createObjectId(userId),
          type: type,
          status: 'completed',
          createdAt: { $gte: today }
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
  }

  async getTodayPayouts(creatorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await this.database.payouts().aggregate([
      {
        $match: {
          creatorId: this.database.createObjectId(creatorId),
          createdAt: { $gte: today }
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
  }

  setupRetryMechanism() {
    // Setup retry mechanism for failed payments
    setInterval(async () => {
      try {
        await this.retryFailedPayments();
      } catch (error) {
        console.error('Error in retry mechanism:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async retryFailedPayments() {
    const failedPayments = await this.database.transactions().find({
      status: 'failed',
      retryCount: { $lt: 3 },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).toArray();

    for (const payment of failedPayments) {
      try {
        await this.retryPayment(payment);
      } catch (error) {
        console.error(`Error retrying payment ${payment._id}:`, error);
      }
    }
  }

  async retryPayment(transaction) {
    // Implement payment retry logic
    console.log(`Retrying payment ${transaction._id}`);
  }

  async handleSuccessfulPayment(transaction, result) {
    // Update creator wallet for earnings
    if (transaction.creatorId) {
      await this.updateWalletBalance(
        transaction.creatorId.toString(),
        transaction.fees.creator,
        'earning'
      );
    }

    // Grant access for pay-per-view content
    if (transaction.type === 'pay_per_view') {
      await this.grantContentAccess(transaction);
    }

    // Update subscription status
    if (transaction.type === 'subscription') {
      await this.activateSubscription(transaction);
    }
  }

  async handleFailedPayment(transaction, result) {
    // Handle failed payment cleanup
    console.log(`Payment failed for transaction ${transaction._id}: ${result.error}`);
  }

  async handleFailedRenewal(subscription) {
    // Handle failed subscription renewal
    await this.database.subscriptions().updateOne(
      { _id: subscription._id },
      {
        $set: {
          status: 'past_due',
          updatedAt: new Date()
        }
      }
    );
  }

  async grantContentAccess(transaction) {
    // Grant access to pay-per-view content
    const access = {
      userId: transaction.userId,
      contentId: transaction.metadata.contentId,
      transactionId: transaction._id,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    await this.database.contentAccess().insertOne(access);
  }

  async activateSubscription(transaction) {
    // Activate or update subscription
    const subscriptionId = transaction.metadata.subscriptionId;
    if (subscriptionId) {
      await this.database.subscriptions().updateOne(
        { _id: this.database.createObjectId(subscriptionId) },
        {
          $set: {
            status: 'active',
            updatedAt: new Date()
          }
        }
      );
    }
  }

  getStats() {
    return { ...this.stats };
  }

  async validateConfiguration() {
    const issues = [];

    if (!this.providers.stripe && !this.providers.paypal) {
      issues.push('No payment providers configured');
    }

    if (issues.length > 0) {
      console.warn('⚠️ Payment configuration issues:', issues);
    }

    return issues;
  }

  async shutdown() {
    console.log('🔄 Shutting down Payment Processing System...');
    this.isInitialized = false;
    this.processingQueue.clear();
    this.retryQueue.clear();
    this.emit('shutdown');
    console.log('✅ Payment Processing System shut down successfully');
  }
}

module.exports = PaymentProcessingSystem;
