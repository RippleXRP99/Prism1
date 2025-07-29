// ============================================================================
// REVENUE DASHBOARD SYSTEM - Month 6: Advanced Monetization
// ============================================================================

const EventEmitter = require('events');

class RevenueDashboardSystem extends EventEmitter {
  constructor(database) {
    super();
    this.database = database;
    this.isInitialized = false;

    // Revenue categories
    this.revenueCategories = {
      subscriptions: 'Subscription Revenue',
      tips: 'Tips & Donations',
      payPerView: 'Pay-Per-View Content',
      merchandise: 'Merchandise Sales',
      commissions: 'Custom Commissions',
      affiliate: 'Affiliate Revenue',
      other: 'Other Revenue'
    };

    // Time periods for analytics
    this.timePeriods = {
      '24h': { hours: 24, label: 'Last 24 Hours' },
      '7d': { days: 7, label: 'Last 7 Days' },
      '30d': { days: 30, label: 'Last 30 Days' },
      '90d': { days: 90, label: 'Last 90 Days' },
      '1y': { days: 365, label: 'Last Year' },
      'all': { days: null, label: 'All Time' }
    };

    // Analytics cache
    this.analyticsCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

    // Real-time revenue tracking
    this.realtimeRevenue = {
      today: 0,
      week: 0,
      month: 0,
      lastUpdated: new Date()
    };

    // Performance metrics
    this.performanceMetrics = {
      conversionRates: {},
      averageOrderValue: {},
      customerLifetimeValue: {},
      churnRates: {},
      growthRates: {}
    };
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing Revenue Dashboard System...');

      await this.createIndexes();
      await this.initializeAnalytics();
      await this.setupRealtimeTracking();

      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ Revenue Dashboard System initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Revenue Dashboard System:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Revenue records indexes
      await this.database.revenueRecords().createIndex({ creatorId: 1, date: -1 });
      await this.database.revenueRecords().createIndex({ category: 1, date: -1 });
      await this.database.revenueRecords().createIndex({ date: -1, amount: -1 });

      // Analytics snapshots indexes
      await this.database.analyticsSnapshots().createIndex({ creatorId: 1, period: 1, date: -1 });
      await this.database.analyticsSnapshots().createIndex({ type: 1, date: -1 });

      // Performance metrics indexes
      await this.database.performanceMetrics().createIndex({ creatorId: 1, metric: 1, date: -1 });

      console.log('✅ Revenue dashboard indexes created');
    } catch (error) {
      console.error('❌ Error creating revenue dashboard indexes:', error);
    }
  }

  async initializeAnalytics() {
    try {
      // Initialize analytics for all creators
      await this.generateGlobalAnalytics();
      
      // Setup periodic analytics updates
      this.setupPeriodicUpdates();

    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }

  setupRealtimeTracking() {
    // Update real-time revenue every minute
    setInterval(async () => {
      try {
        await this.updateRealtimeRevenue();
      } catch (error) {
        console.error('Error updating realtime revenue:', error);
      }
    }, 60 * 1000); // 1 minute

    // Clear analytics cache every 5 minutes
    setInterval(() => {
      this.clearExpiredCache();
    }, 5 * 60 * 1000); // 5 minutes
  }

  setupPeriodicUpdates() {
    // Generate daily analytics at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.generateDailyAnalytics();
      
      // Set up daily interval
      setInterval(() => {
        this.generateDailyAnalytics();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
    }, timeUntilMidnight);
  }

  // ============================================================================
  // REVENUE TRACKING
  // ============================================================================

  async recordRevenue(revenueData) {
    try {
      const {
        creatorId,
        category,
        amount,
        currency = 'USD',
        source, // subscription_id, tip_id, ppv_id, etc.
        sourceType, // 'subscription', 'tip', 'pay_per_view', etc.
        userId = null,
        metadata = {},
        date = new Date()
      } = revenueData;

      const revenue = {
        _id: this.database.createObjectId(),
        revenueId: this.generateRevenueId(),
        creatorId: this.database.createObjectId(creatorId),
        category,
        amount,
        currency,
        source,
        sourceType,
        userId: userId ? this.database.createObjectId(userId) : null,
        metadata,
        date: new Date(date),
        createdAt: new Date()
      };

      const result = await this.database.revenueRecords().insertOne(revenue);

      // Update real-time tracking
      await this.updateRealtimeRevenue();

      // Clear relevant cache
      this.clearCreatorCache(creatorId);

      this.emit('revenueRecorded', {
        revenueId: result.insertedId,
        creatorId,
        category,
        amount
      });

      return { ...revenue, _id: result.insertedId };

    } catch (error) {
      console.error('Error recording revenue:', error);
      throw error;
    }
  }

  generateRevenueId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `rev_${timestamp}_${random}`;
  }

  async updateRealtimeRevenue() {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
        this.getTotalRevenue({ startDate: today }),
        this.getTotalRevenue({ startDate: weekStart }),
        this.getTotalRevenue({ startDate: monthStart })
      ]);

      this.realtimeRevenue = {
        today: todayRevenue.total,
        week: weekRevenue.total,
        month: monthRevenue.total,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error updating realtime revenue:', error);
    }
  }

  async getTotalRevenue(filters = {}) {
    try {
      const {
        creatorId = null,
        category = null,
        startDate = null,
        endDate = null
      } = filters;

      const query = {};

      if (creatorId) {
        query.creatorId = this.database.createObjectId(creatorId);
      }

      if (category) {
        query.category = category;
      }

      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const result = await this.database.revenueRecords().aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            average: { $avg: '$amount' }
          }
        }
      ]).toArray();

      return result[0] || { total: 0, count: 0, average: 0 };

    } catch (error) {
      console.error('Error getting total revenue:', error);
      return { total: 0, count: 0, average: 0 };
    }
  }

  // ============================================================================
  // DASHBOARD ANALYTICS
  // ============================================================================

  async getCreatorDashboard(creatorId, period = '30d') {
    try {
      const cacheKey = `dashboard_${creatorId}_${period}`;
      const cached = this.getCachedData(cacheKey);
      
      if (cached) {
        return cached;
      }

      const dashboard = await this.generateCreatorDashboard(creatorId, period);
      
      this.setCachedData(cacheKey, dashboard);
      
      return dashboard;

    } catch (error) {
      console.error('Error getting creator dashboard:', error);
      throw error;
    }
  }

  async generateCreatorDashboard(creatorId, period) {
    try {
      const dateRange = this.getDateRange(period);
      
      const [
        overview,
        revenueByCategory,
        revenueOverTime,
        topRevenueSources,
        performanceMetrics,
        comparisons
      ] = await Promise.all([
        this.getRevenueOverview(creatorId, dateRange),
        this.getRevenueByCategory(creatorId, dateRange),
        this.getRevenueOverTime(creatorId, dateRange),
        this.getTopRevenueSources(creatorId, dateRange),
        this.getPerformanceMetrics(creatorId, dateRange),
        this.getComparisons(creatorId, period)
      ]);

      return {
        period,
        dateRange,
        overview,
        revenueByCategory,
        revenueOverTime,
        topRevenueSources,
        performanceMetrics,
        comparisons,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating creator dashboard:', error);
      throw error;
    }
  }

  async getRevenueOverview(creatorId, dateRange) {
    try {
      const { startDate, endDate } = dateRange;

      const [
        totalRevenue,
        revenueGrowth,
        transactionCount,
        averageTransactionValue
      ] = await Promise.all([
        this.getTotalRevenue({ creatorId, startDate, endDate }),
        this.getRevenueGrowth(creatorId, dateRange),
        this.getTransactionCount(creatorId, dateRange),
        this.getAverageTransactionValue(creatorId, dateRange)
      ]);

      return {
        totalRevenue: totalRevenue.total,
        revenueGrowth,
        transactionCount: transactionCount.count,
        averageTransactionValue: averageTransactionValue.average || 0,
        projectedMonthlyRevenue: this.calculateProjectedRevenue(creatorId, dateRange)
      };

    } catch (error) {
      console.error('Error getting revenue overview:', error);
      return {
        totalRevenue: 0,
        revenueGrowth: 0,
        transactionCount: 0,
        averageTransactionValue: 0,
        projectedMonthlyRevenue: 0
      };
    }
  }

  async getRevenueByCategory(creatorId, dateRange) {
    try {
      const { startDate, endDate } = dateRange;

      const result = await this.database.revenueRecords().aggregate([
        {
          $match: {
            creatorId: this.database.createObjectId(creatorId),
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            average: { $avg: '$amount' }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]).toArray();

      const totalRevenue = result.reduce((sum, item) => sum + item.total, 0);

      return result.map(item => ({
        category: item._id,
        name: this.revenueCategories[item._id] || item._id,
        total: item.total,
        count: item.count,
        average: item.average,
        percentage: totalRevenue > 0 ? (item.total / totalRevenue * 100).toFixed(2) : 0
      }));

    } catch (error) {
      console.error('Error getting revenue by category:', error);
      return [];
    }
  }

  async getRevenueOverTime(creatorId, dateRange, granularity = 'day') {
    try {
      const { startDate, endDate } = dateRange;
      
      let groupFormat;
      switch (granularity) {
        case 'hour':
          groupFormat = {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
            hour: { $hour: '$date' }
          };
          break;
        case 'day':
          groupFormat = {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          };
          break;
        case 'week':
          groupFormat = {
            year: { $year: '$date' },
            week: { $week: '$date' }
          };
          break;
        case 'month':
          groupFormat = {
            year: { $year: '$date' },
            month: { $month: '$date' }
          };
          break;
        default:
          groupFormat = {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          };
      }

      const result = await this.database.revenueRecords().aggregate([
        {
          $match: {
            creatorId: this.database.createObjectId(creatorId),
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: groupFormat,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            categories: {
              $push: {
                category: '$category',
                amount: '$amount'
              }
            }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
        }
      ]).toArray();

      return result.map(item => ({
        period: this.formatPeriodLabel(item._id, granularity),
        total: item.total,
        count: item.count,
        categories: this.aggregateCategories(item.categories)
      }));

    } catch (error) {
      console.error('Error getting revenue over time:', error);
      return [];
    }
  }

  formatPeriodLabel(dateGroup, granularity) {
    const { year, month, day, hour, week } = dateGroup;
    
    switch (granularity) {
      case 'hour':
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:00`;
      case 'day':
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      case 'week':
        return `${year}-W${String(week).padStart(2, '0')}`;
      case 'month':
        return `${year}-${String(month).padStart(2, '0')}`;
      default:
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  aggregateCategories(categories) {
    const aggregated = {};
    
    categories.forEach(item => {
      if (!aggregated[item.category]) {
        aggregated[item.category] = 0;
      }
      aggregated[item.category] += item.amount;
    });

    return Object.entries(aggregated).map(([category, amount]) => ({
      category,
      amount
    }));
  }

  async getTopRevenueSources(creatorId, dateRange, limit = 10) {
    try {
      const { startDate, endDate } = dateRange;

      const result = await this.database.revenueRecords().aggregate([
        {
          $match: {
            creatorId: this.database.createObjectId(creatorId),
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              sourceType: '$sourceType',
              source: '$source'
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            lastTransaction: { $max: '$date' }
          }
        },
        {
          $sort: { total: -1 }
        },
        {
          $limit: limit
        }
      ]).toArray();

      return result.map(item => ({
        sourceType: item._id.sourceType,
        source: item._id.source,
        total: item.total,
        count: item.count,
        lastTransaction: item.lastTransaction
      }));

    } catch (error) {
      console.error('Error getting top revenue sources:', error);
      return [];
    }
  }

  async getPerformanceMetrics(creatorId, dateRange) {
    try {
      const [
        conversionRate,
        averageOrderValue,
        customerRetention,
        growthRate
      ] = await Promise.all([
        this.calculateConversionRate(creatorId, dateRange),
        this.calculateAverageOrderValue(creatorId, dateRange),
        this.calculateCustomerRetention(creatorId, dateRange),
        this.calculateGrowthRate(creatorId, dateRange)
      ]);

      return {
        conversionRate,
        averageOrderValue,
        customerRetention,
        growthRate
      };

    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        conversionRate: 0,
        averageOrderValue: 0,
        customerRetention: 0,
        growthRate: 0
      };
    }
  }

  async getComparisons(creatorId, period) {
    try {
      const currentRange = this.getDateRange(period);
      const previousRange = this.getPreviousDateRange(period);

      const [currentRevenue, previousRevenue] = await Promise.all([
        this.getTotalRevenue({ creatorId, ...currentRange }),
        this.getTotalRevenue({ creatorId, ...previousRange })
      ]);

      const revenueChange = this.calculatePercentageChange(
        previousRevenue.total,
        currentRevenue.total
      );

      const transactionChange = this.calculatePercentageChange(
        previousRevenue.count,
        currentRevenue.count
      );

      return {
        revenue: {
          current: currentRevenue.total,
          previous: previousRevenue.total,
          change: revenueChange
        },
        transactions: {
          current: currentRevenue.count,
          previous: previousRevenue.count,
          change: transactionChange
        }
      };

    } catch (error) {
      console.error('Error getting comparisons:', error);
      return {
        revenue: { current: 0, previous: 0, change: 0 },
        transactions: { current: 0, previous: 0, change: 0 }
      };
    }
  }

  // ============================================================================
  // CALCULATIONS AND UTILITIES
  // ============================================================================

  getDateRange(period) {
    const now = new Date();
    const endDate = new Date(now);
    let startDate;

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { startDate, endDate };
  }

  getPreviousDateRange(period) {
    const current = this.getDateRange(period);
    const duration = current.endDate.getTime() - current.startDate.getTime();
    
    return {
      startDate: new Date(current.startDate.getTime() - duration),
      endDate: new Date(current.startDate.getTime())
    };
  }

  calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) {
      return newValue > 0 ? 100 : 0;
    }
    return ((newValue - oldValue) / oldValue * 100).toFixed(2);
  }

  async getRevenueGrowth(creatorId, dateRange) {
    // Implementation for revenue growth calculation
    return 0; // Placeholder
  }

  async getTransactionCount(creatorId, dateRange) {
    const { startDate, endDate } = dateRange;
    
    const result = await this.database.revenueRecords().aggregate([
      {
        $match: {
          creatorId: this.database.createObjectId(creatorId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    return result[0] || { count: 0 };
  }

  async getAverageTransactionValue(creatorId, dateRange) {
    const { startDate, endDate } = dateRange;
    
    const result = await this.database.revenueRecords().aggregate([
      {
        $match: {
          creatorId: this.database.createObjectId(creatorId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$amount' }
        }
      }
    ]).toArray();

    return result[0] || { average: 0 };
  }

  calculateProjectedRevenue(creatorId, dateRange) {
    // Implementation for projected revenue calculation
    return 0; // Placeholder
  }

  async calculateConversionRate(creatorId, dateRange) {
    // Implementation for conversion rate calculation
    return 0; // Placeholder
  }

  async calculateAverageOrderValue(creatorId, dateRange) {
    // Implementation for average order value calculation
    return 0; // Placeholder
  }

  async calculateCustomerRetention(creatorId, dateRange) {
    // Implementation for customer retention calculation
    return 0; // Placeholder
  }

  async calculateGrowthRate(creatorId, dateRange) {
    // Implementation for growth rate calculation
    return 0; // Placeholder
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  getCachedData(key) {
    const cached = this.analyticsCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.analyticsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCreatorCache(creatorId) {
    const keysToDelete = [];
    for (const key of this.analyticsCache.keys()) {
      if (key.includes(creatorId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.analyticsCache.delete(key));
  }

  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.analyticsCache.entries()) {
      if ((now - value.timestamp) >= this.cacheTimeout) {
        this.analyticsCache.delete(key);
      }
    }
  }

  // ============================================================================
  // REPORTING
  // ============================================================================

  async generateRevenueReport(creatorId, options = {}) {
    try {
      const {
        period = '30d',
        format = 'json', // json, csv, pdf
        includeDetails = false,
        categories = null
      } = options;

      const dashboard = await this.getCreatorDashboard(creatorId, period);
      
      const report = {
        creatorId,
        period,
        generatedAt: new Date(),
        summary: dashboard.overview,
        breakdown: dashboard.revenueByCategory,
        timeline: dashboard.revenueOverTime,
        topSources: dashboard.topRevenueSources,
        metrics: dashboard.performanceMetrics,
        comparisons: dashboard.comparisons
      };

      if (includeDetails) {
        report.detailedTransactions = await this.getDetailedTransactions(
          creatorId, 
          dashboard.dateRange, 
          categories
        );
      }

      // Format report based on requested format
      if (format === 'csv') {
        return this.formatReportAsCSV(report);
      } else if (format === 'pdf') {
        return this.formatReportAsPDF(report);
      }

      return report;

    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw error;
    }
  }

  async getDetailedTransactions(creatorId, dateRange, categories = null) {
    try {
      const { startDate, endDate } = dateRange;
      const query = {
        creatorId: this.database.createObjectId(creatorId),
        date: { $gte: startDate, $lte: endDate }
      };

      if (categories) {
        query.category = { $in: categories };
      }

      return await this.database.revenueRecords()
        .find(query)
        .sort({ date: -1 })
        .toArray();

    } catch (error) {
      console.error('Error getting detailed transactions:', error);
      return [];
    }
  }

  formatReportAsCSV(report) {
    // Implementation for CSV formatting
    return 'CSV data'; // Placeholder
  }

  formatReportAsPDF(report) {
    // Implementation for PDF formatting
    return 'PDF data'; // Placeholder
  }

  // ============================================================================
  // GLOBAL ANALYTICS
  // ============================================================================

  async generateGlobalAnalytics() {
    try {
      const globalStats = await this.database.revenueRecords().aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            averageTransactionValue: { $avg: '$amount' },
            uniqueCreators: { $addToSet: '$creatorId' }
          }
        }
      ]).toArray();

      const categoryBreakdown = await this.database.revenueRecords().aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]).toArray();

      return {
        global: globalStats[0] || {
          totalRevenue: 0,
          totalTransactions: 0,
          averageTransactionValue: 0,
          uniqueCreators: []
        },
        byCategory: categoryBreakdown,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating global analytics:', error);
      return null;
    }
  }

  async generateDailyAnalytics() {
    try {
      console.log('📊 Generating daily analytics...');
      
      // This would run analytics for all creators
      const creators = await this.database.users().find({ role: 'creator' }).toArray();
      
      for (const creator of creators) {
        await this.generateCreatorDailySnapshot(creator._id);
      }
      
      await this.generateGlobalDailySnapshot();
      
      console.log('✅ Daily analytics generated');

    } catch (error) {
      console.error('Error generating daily analytics:', error);
    }
  }

  async generateCreatorDailySnapshot(creatorId) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);

      const snapshot = await this.generateCreatorDashboard(creatorId, '24h');
      
      await this.database.analyticsSnapshots().insertOne({
        creatorId: this.database.createObjectId(creatorId),
        type: 'daily',
        period: '24h',
        date: yesterday,
        data: snapshot,
        createdAt: new Date()
      });

    } catch (error) {
      console.error(`Error generating daily snapshot for creator ${creatorId}:`, error);
    }
  }

  async generateGlobalDailySnapshot() {
    try {
      const globalAnalytics = await this.generateGlobalAnalytics();
      
      await this.database.analyticsSnapshots().insertOne({
        type: 'global_daily',
        period: '24h',
        date: new Date(),
        data: globalAnalytics,
        createdAt: new Date()
      });

    } catch (error) {
      console.error('Error generating global daily snapshot:', error);
    }
  }

  // ============================================================================
  // API METHODS
  // ============================================================================

  getRealtimeRevenue() {
    return { ...this.realtimeRevenue };
  }

  getRevenueCategories() {
    return { ...this.revenueCategories };
  }

  getTimePeriods() {
    return { ...this.timePeriods };
  }

  async shutdown() {
    console.log('🔄 Shutting down Revenue Dashboard System...');
    this.isInitialized = false;
    this.analyticsCache.clear();
    this.emit('shutdown');
    console.log('✅ Revenue Dashboard System shut down successfully');
  }
}

module.exports = RevenueDashboardSystem;
