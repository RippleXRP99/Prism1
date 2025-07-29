// ============================================================================
// CREATOR-FAN INTERACTION SYSTEM - Month 5: Creator-Fan-Interaktionen
// ============================================================================

const EventEmitter = require('events');

class CreatorFanInteractionSystem extends EventEmitter {
  constructor(database, socialSystem) {
    super();
    this.database = database;
    this.socialSystem = socialSystem;
    this.isInitialized = false;

    // Interaction types and pricing
    this.interactionTypes = {
      tip: { minAmount: 1, maxAmount: 1000, currency: 'USD' },
      personalMessage: { price: 5, duration: 24 * 60 * 60 * 1000 }, // 24 hours
      videoCall: { price: 50, duration: 15 * 60 * 1000 }, // 15 minutes
      customRequest: { minPrice: 10, maxPrice: 500 },
      exclusiveContent: { price: 20, duration: 7 * 24 * 60 * 60 * 1000 }, // 7 days
      fanClub: { monthlyPrice: 10, yearlyPrice: 100 },
      merchandise: { minPrice: 15, maxPrice: 200 }
    };

    // Statistics
    this.stats = {
      totalTips: 0,
      totalTipAmount: 0,
      totalPersonalMessages: 0,
      totalVideoCallsScheduled: 0,
      totalCustomRequests: 0,
      activeFanClubMembers: 0,
      lastStatsUpdate: new Date()
    };
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize() {
    try {
      console.log('🚀 Initializing Creator-Fan Interaction System...');

      await this.createIndexes();
      await this.updateStats();

      this.isInitialized = true;
      this.emit('initialized');

      console.log('✅ Creator-Fan Interaction System initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Creator-Fan Interaction System:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      // Tips indexes
      await this.database.tips().createIndex({ creatorId: 1, createdAt: -1 });
      await this.database.tips().createIndex({ fanId: 1, createdAt: -1 });
      await this.database.tips().createIndex({ status: 1 });

      // Personal messages indexes
      await this.database.personalMessages().createIndex({ creatorId: 1, createdAt: -1 });
      await this.database.personalMessages().createIndex({ fanId: 1, createdAt: -1 });
      await this.database.personalMessages().createIndex({ status: 1, expiresAt: 1 });

      // Video calls indexes
      await this.database.videoCalls().createIndex({ creatorId: 1, scheduledAt: 1 });
      await this.database.videoCalls().createIndex({ fanId: 1, scheduledAt: 1 });
      await this.database.videoCalls().createIndex({ status: 1 });

      // Custom requests indexes
      await this.database.customRequests().createIndex({ creatorId: 1, createdAt: -1 });
      await this.database.customRequests().createIndex({ fanId: 1, createdAt: -1 });
      await this.database.customRequests().createIndex({ status: 1 });

      // Fan club memberships indexes
      await this.database.fanClubMemberships().createIndex({ creatorId: 1, isActive: 1 });
      await this.database.fanClubMemberships().createIndex({ fanId: 1, isActive: 1 });
      await this.database.fanClubMemberships().createIndex({ expiresAt: 1 });

      console.log('✅ Creator-Fan interaction indexes created');
    } catch (error) {
      console.error('❌ Error creating Creator-Fan indexes:', error);
    }
  }

  // ============================================================================
  // TIP SYSTEM
  // ============================================================================

  async sendTip(fanId, creatorId, amount, message = '', isAnonymous = false) {
    try {
      // Validate amount
      if (amount < this.interactionTypes.tip.minAmount || amount > this.interactionTypes.tip.maxAmount) {
        throw new Error(`Tip amount must be between $${this.interactionTypes.tip.minAmount} and $${this.interactionTypes.tip.maxAmount}`);
      }

      // Validate users exist
      const [fan, creator] = await Promise.all([
        this.database.users().findOne({ _id: this.database.createObjectId(fanId) }),
        this.database.users().findOne({ _id: this.database.createObjectId(creatorId), isCreator: true })
      ]);

      if (!fan || !creator) {
        throw new Error('Fan or creator not found');
      }

      // Check if creator accepts tips
      if (creator.creatorSettings?.acceptTips === false) {
        throw new Error('Creator does not accept tips');
      }

      // Create tip record
      const tip = {
        _id: this.database.createObjectId(),
        fanId: this.database.createObjectId(fanId),
        creatorId: this.database.createObjectId(creatorId),
        amount: amount,
        currency: this.interactionTypes.tip.currency,
        message: message.trim(),
        isAnonymous: isAnonymous,
        status: 'pending',
        transactionId: null,
        processingFee: Math.round(amount * 0.05 * 100) / 100, // 5% fee
        creatorEarnings: Math.round(amount * 0.95 * 100) / 100, // 95% to creator
        createdAt: new Date(),
        processedAt: null
      };

      // Insert tip
      const result = await this.database.tips().insertOne(tip);

      // Update statistics
      this.stats.totalTips++;
      this.stats.totalTipAmount += amount;

      // Emit event for real-time notifications
      this.emit('tipReceived', {
        tipId: result.insertedId,
        creatorId,
        fanId,
        amount,
        message,
        isAnonymous,
        fan: isAnonymous ? null : {
          username: fan.username,
          displayName: fan.profile?.displayName,
          avatar: fan.profile?.avatar
        }
      });

      return {
        ...tip,
        _id: result.insertedId,
        success: true
      };

    } catch (error) {
      console.error('Error sending tip:', error);
      throw error;
    }
  }

  async getCreatorTips(creatorId, options = {}) {
    try {
      const { page = 1, limit = 20, status = null, timeframe = null } = options;
      const skip = (page - 1) * limit;

      const query = {
        creatorId: this.database.createObjectId(creatorId)
      };

      if (status) {
        query.status = status;
      }

      if (timeframe) {
        const now = new Date();
        const timeframeMap = {
          '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
          '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        };

        if (timeframeMap[timeframe]) {
          query.createdAt = { $gte: timeframeMap[timeframe] };
        }
      }

      const tips = await this.database.tips()
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get fan details for non-anonymous tips
      const fanIds = tips
        .filter(tip => !tip.isAnonymous)
        .map(tip => tip.fanId);

      const fans = await this.database.users()
        .find({ _id: { $in: fanIds } })
        .toArray();

      const fanMap = new Map(fans.map(f => [f._id.toString(), f]));

      // Enrich tips with fan data
      const enrichedTips = tips.map(tip => {
        const tipData = { ...tip };
        
        if (!tip.isAnonymous && fanMap.has(tip.fanId.toString())) {
          const fan = fanMap.get(tip.fanId.toString());
          tipData.fan = {
            _id: tip.fanId,
            username: fan.username,
            displayName: fan.profile?.displayName || fan.username,
            avatar: fan.profile?.avatar || null
          };
        } else {
          tipData.fan = { displayName: 'Anonymous Supporter' };
        }

        return tipData;
      });

      // Get total count and earnings
      const [totalCount, totalEarnings] = await Promise.all([
        this.database.tips().countDocuments(query),
        this.database.tips().aggregate([
          { $match: query },
          { $group: { _id: null, total: { $sum: '$creatorEarnings' } } }
        ]).toArray()
      ]);

      return {
        tips: enrichedTips,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount
        },
        summary: {
          totalEarnings: totalEarnings[0]?.total || 0,
          averageTip: totalCount > 0 ? (totalEarnings[0]?.total || 0) / totalCount : 0
        }
      };

    } catch (error) {
      console.error('Error getting creator tips:', error);
      throw error;
    }
  }

  // ============================================================================
  // PERSONAL MESSAGE SYSTEM
  // ============================================================================

  async purchasePersonalMessage(fanId, creatorId, messageText, specialRequests = '') {
    try {
      // Validate users and creator settings
      const [fan, creator] = await Promise.all([
        this.database.users().findOne({ _id: this.database.createObjectId(fanId) }),
        this.database.users().findOne({ _id: this.database.createObjectId(creatorId), isCreator: true })
      ]);

      if (!fan || !creator) {
        throw new Error('Fan or creator not found');
      }

      if (creator.creatorSettings?.personalMessages?.enabled === false) {
        throw new Error('Creator does not offer personal messages');
      }

      const price = creator.creatorSettings?.personalMessages?.price || this.interactionTypes.personalMessage.price;
      const duration = creator.creatorSettings?.personalMessages?.duration || this.interactionTypes.personalMessage.duration;

      // Create personal message request
      const personalMessage = {
        _id: this.database.createObjectId(),
        fanId: this.database.createObjectId(fanId),
        creatorId: this.database.createObjectId(creatorId),
        requestText: messageText.trim(),
        specialRequests: specialRequests.trim(),
        price: price,
        status: 'pending', // pending, accepted, completed, rejected, expired
        priority: 'normal', // normal, high, urgent
        responseText: '',
        responseMediaUrl: '',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + duration),
        acceptedAt: null,
        completedAt: null
      };

      const result = await this.database.personalMessages().insertOne(personalMessage);

      this.stats.totalPersonalMessages++;

      // Notify creator
      this.emit('personalMessageRequested', {
        messageId: result.insertedId,
        creatorId,
        fanId,
        price,
        fan: {
          username: fan.username,
          displayName: fan.profile?.displayName,
          avatar: fan.profile?.avatar
        }
      });

      return {
        ...personalMessage,
        _id: result.insertedId,
        success: true
      };

    } catch (error) {
      console.error('Error purchasing personal message:', error);
      throw error;
    }
  }

  async respondToPersonalMessage(creatorId, messageId, responseText, responseMediaUrl = null) {
    try {
      const personalMessage = await this.database.personalMessages().findOne({
        _id: this.database.createObjectId(messageId),
        creatorId: this.database.createObjectId(creatorId),
        status: 'accepted'
      });

      if (!personalMessage) {
        throw new Error('Personal message not found or not accepted');
      }

      // Check if not expired
      if (new Date() > personalMessage.expiresAt) {
        await this.database.personalMessages().updateOne(
          { _id: this.database.createObjectId(messageId) },
          { $set: { status: 'expired' } }
        );
        throw new Error('Personal message request has expired');
      }

      // Update with response
      const result = await this.database.personalMessages().updateOne(
        { _id: this.database.createObjectId(messageId) },
        {
          $set: {
            status: 'completed',
            responseText: responseText.trim(),
            responseMediaUrl: responseMediaUrl,
            completedAt: new Date()
          }
        }
      );

      // Notify fan
      this.emit('personalMessageCompleted', {
        messageId,
        fanId: personalMessage.fanId,
        creatorId,
        responseText,
        hasMedia: !!responseMediaUrl
      });

      return { success: true, modified: result.modifiedCount };

    } catch (error) {
      console.error('Error responding to personal message:', error);
      throw error;
    }
  }

  async getPersonalMessages(creatorId, options = {}) {
    try {
      const { page = 1, limit = 20, status = null } = options;
      const skip = (page - 1) * limit;

      const query = {
        creatorId: this.database.createObjectId(creatorId)
      };

      if (status) {
        query.status = status;
      }

      const messages = await this.database.personalMessages()
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get fan details
      const fanIds = messages.map(msg => msg.fanId);
      const fans = await this.database.users()
        .find({ _id: { $in: fanIds } })
        .toArray();

      const fanMap = new Map(fans.map(f => [f._id.toString(), f]));

      const enrichedMessages = messages.map(message => ({
        ...message,
        fan: {
          _id: message.fanId,
          username: fanMap.get(message.fanId.toString())?.username || 'Unknown',
          displayName: fanMap.get(message.fanId.toString())?.profile?.displayName || 'Unknown Fan',
          avatar: fanMap.get(message.fanId.toString())?.profile?.avatar || null
        }
      }));

      return {
        messages: enrichedMessages,
        pagination: {
          currentPage: page,
          hasNextPage: messages.length === limit
        }
      };

    } catch (error) {
      console.error('Error getting personal messages:', error);
      throw error;
    }
  }

  // ============================================================================
  // VIDEO CALL SYSTEM
  // ============================================================================

  async scheduleVideoCall(fanId, creatorId, preferredDateTime, duration = 15, specialRequests = '') {
    try {
      const [fan, creator] = await Promise.all([
        this.database.users().findOne({ _id: this.database.createObjectId(fanId) }),
        this.database.users().findOne({ _id: this.database.createObjectId(creatorId), isCreator: true })
      ]);

      if (!fan || !creator) {
        throw new Error('Fan or creator not found');
      }

      if (creator.creatorSettings?.videoCalls?.enabled === false) {
        throw new Error('Creator does not offer video calls');
      }

      const price = creator.creatorSettings?.videoCalls?.price || this.interactionTypes.videoCall.price;
      const maxDuration = creator.creatorSettings?.videoCalls?.maxDuration || 30; // minutes

      if (duration > maxDuration) {
        throw new Error(`Video call duration cannot exceed ${maxDuration} minutes`);
      }

      // Create video call request
      const videoCall = {
        _id: this.database.createObjectId(),
        fanId: this.database.createObjectId(fanId),
        creatorId: this.database.createObjectId(creatorId),
        preferredDateTime: new Date(preferredDateTime),
        scheduledAt: null,
        duration: duration, // in minutes
        price: price * (duration / 15), // Price per 15-minute block
        specialRequests: specialRequests.trim(),
        status: 'pending', // pending, scheduled, completed, cancelled, no_show
        meetingUrl: null,
        meetingId: null,
        createdAt: new Date(),
        completedAt: null
      };

      const result = await this.database.videoCalls().insertOne(videoCall);

      this.stats.totalVideoCallsScheduled++;

      // Notify creator
      this.emit('videoCallRequested', {
        callId: result.insertedId,
        creatorId,
        fanId,
        preferredDateTime,
        duration,
        price: videoCall.price,
        fan: {
          username: fan.username,
          displayName: fan.profile?.displayName,
          avatar: fan.profile?.avatar
        }
      });

      return {
        ...videoCall,
        _id: result.insertedId,
        success: true
      };

    } catch (error) {
      console.error('Error scheduling video call:', error);
      throw error;
    }
  }

  async confirmVideoCall(creatorId, callId, scheduledDateTime, meetingUrl) {
    try {
      const videoCall = await this.database.videoCalls().findOne({
        _id: this.database.createObjectId(callId),
        creatorId: this.database.createObjectId(creatorId),
        status: 'pending'
      });

      if (!videoCall) {
        throw new Error('Video call request not found');
      }

      // Generate meeting ID
      const meetingId = `prism-call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const result = await this.database.videoCalls().updateOne(
        { _id: this.database.createObjectId(callId) },
        {
          $set: {
            status: 'scheduled',
            scheduledAt: new Date(scheduledDateTime),
            meetingUrl: meetingUrl,
            meetingId: meetingId,
            confirmedAt: new Date()
          }
        }
      );

      // Notify fan
      this.emit('videoCallConfirmed', {
        callId,
        fanId: videoCall.fanId,
        creatorId,
        scheduledAt: new Date(scheduledDateTime),
        meetingUrl,
        meetingId
      });

      return { success: true, meetingId, modified: result.modifiedCount };

    } catch (error) {
      console.error('Error confirming video call:', error);
      throw error;
    }
  }

  // ============================================================================
  // CUSTOM REQUEST SYSTEM
  // ============================================================================

  async submitCustomRequest(fanId, creatorId, requestType, description, budget, deadline = null) {
    try {
      const [fan, creator] = await Promise.all([
        this.database.users().findOne({ _id: this.database.createObjectId(fanId) }),
        this.database.users().findOne({ _id: this.database.createObjectId(creatorId), isCreator: true })
      ]);

      if (!fan || !creator) {
        throw new Error('Fan or creator not found');
      }

      if (creator.creatorSettings?.customRequests?.enabled === false) {
        throw new Error('Creator does not accept custom requests');
      }

      // Validate budget
      if (budget < this.interactionTypes.customRequest.minPrice || 
          budget > this.interactionTypes.customRequest.maxPrice) {
        throw new Error(`Budget must be between $${this.interactionTypes.customRequest.minPrice} and $${this.interactionTypes.customRequest.maxPrice}`);
      }

      const customRequest = {
        _id: this.database.createObjectId(),
        fanId: this.database.createObjectId(fanId),
        creatorId: this.database.createObjectId(creatorId),
        requestType: requestType, // video, photo, audio, written, other
        description: description.trim(),
        budget: budget,
        proposedDeadline: deadline ? new Date(deadline) : null,
        status: 'pending', // pending, quoted, accepted, in_progress, completed, rejected
        creatorQuote: null,
        creatorDeadline: null,
        creatorNotes: '',
        deliverables: [],
        createdAt: new Date(),
        acceptedAt: null,
        completedAt: null
      };

      const result = await this.database.customRequests().insertOne(customRequest);

      this.stats.totalCustomRequests++;

      // Notify creator
      this.emit('customRequestSubmitted', {
        requestId: result.insertedId,
        creatorId,
        fanId,
        requestType,
        budget,
        fan: {
          username: fan.username,
          displayName: fan.profile?.displayName,
          avatar: fan.profile?.avatar
        }
      });

      return {
        ...customRequest,
        _id: result.insertedId,
        success: true
      };

    } catch (error) {
      console.error('Error submitting custom request:', error);
      throw error;
    }
  }

  async quoteCustomRequest(creatorId, requestId, quote, deadline, notes = '') {
    try {
      const customRequest = await this.database.customRequests().findOne({
        _id: this.database.createObjectId(requestId),
        creatorId: this.database.createObjectId(creatorId),
        status: 'pending'
      });

      if (!customRequest) {
        throw new Error('Custom request not found');
      }

      const result = await this.database.customRequests().updateOne(
        { _id: this.database.createObjectId(requestId) },
        {
          $set: {
            status: 'quoted',
            creatorQuote: quote,
            creatorDeadline: new Date(deadline),
            creatorNotes: notes.trim(),
            quotedAt: new Date()
          }
        }
      );

      // Notify fan
      this.emit('customRequestQuoted', {
        requestId,
        fanId: customRequest.fanId,
        creatorId,
        quote,
        deadline: new Date(deadline),
        notes
      });

      return { success: true, modified: result.modifiedCount };

    } catch (error) {
      console.error('Error quoting custom request:', error);
      throw error;
    }
  }

  // ============================================================================
  // FAN CLUB SYSTEM
  // ============================================================================

  async joinFanClub(fanId, creatorId, membershipType = 'monthly') {
    try {
      const [fan, creator] = await Promise.all([
        this.database.users().findOne({ _id: this.database.createObjectId(fanId) }),
        this.database.users().findOne({ _id: this.database.createObjectId(creatorId), isCreator: true })
      ]);

      if (!fan || !creator) {
        throw new Error('Fan or creator not found');
      }

      if (creator.creatorSettings?.fanClub?.enabled === false) {
        throw new Error('Creator does not have a fan club');
      }

      // Check if already a member
      const existingMembership = await this.database.fanClubMemberships().findOne({
        fanId: this.database.createObjectId(fanId),
        creatorId: this.database.createObjectId(creatorId),
        isActive: true
      });

      if (existingMembership) {
        throw new Error('Already a fan club member');
      }

      const price = membershipType === 'yearly' 
        ? this.interactionTypes.fanClub.yearlyPrice 
        : this.interactionTypes.fanClub.monthlyPrice;

      const duration = membershipType === 'yearly' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

      const membership = {
        _id: this.database.createObjectId(),
        fanId: this.database.createObjectId(fanId),
        creatorId: this.database.createObjectId(creatorId),
        membershipType: membershipType,
        price: price,
        isActive: true,
        benefits: creator.creatorSettings?.fanClub?.benefits || [],
        joinedAt: new Date(),
        expiresAt: new Date(Date.now() + duration),
        autoRenew: false
      };

      const result = await this.database.fanClubMemberships().insertOne(membership);

      // Update creator's fan club count
      await this.database.users().updateOne(
        { _id: this.database.createObjectId(creatorId) },
        { $inc: { 'creatorStats.fanClubMembers': 1 } }
      );

      this.stats.activeFanClubMembers++;

      // Notify creator
      this.emit('fanClubMemberJoined', {
        membershipId: result.insertedId,
        creatorId,
        fanId,
        membershipType,
        fan: {
          username: fan.username,
          displayName: fan.profile?.displayName,
          avatar: fan.profile?.avatar
        }
      });

      return {
        ...membership,
        _id: result.insertedId,
        success: true
      };

    } catch (error) {
      console.error('Error joining fan club:', error);
      throw error;
    }
  }

  async getFanClubMembers(creatorId, options = {}) {
    try {
      const { page = 1, limit = 50, isActive = true } = options;
      const skip = (page - 1) * limit;

      const query = {
        creatorId: this.database.createObjectId(creatorId)
      };

      if (isActive !== null) {
        query.isActive = isActive;
      }

      const memberships = await this.database.fanClubMemberships()
        .find(query)
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get fan details
      const fanIds = memberships.map(m => m.fanId);
      const fans = await this.database.users()
        .find({ _id: { $in: fanIds } })
        .toArray();

      const fanMap = new Map(fans.map(f => [f._id.toString(), f]));

      const enrichedMemberships = memberships.map(membership => ({
        ...membership,
        fan: {
          _id: membership.fanId,
          username: fanMap.get(membership.fanId.toString())?.username || 'Unknown',
          displayName: fanMap.get(membership.fanId.toString())?.profile?.displayName || 'Unknown Fan',
          avatar: fanMap.get(membership.fanId.toString())?.profile?.avatar || null
        }
      }));

      return {
        members: enrichedMemberships,
        pagination: {
          currentPage: page,
          hasNextPage: memberships.length === limit
        }
      };

    } catch (error) {
      console.error('Error getting fan club members:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  async getCreatorInteractionAnalytics(creatorId, timeframe = '30d') {
    try {
      const now = new Date();
      const timeframeMap = {
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      };

      const startDate = timeframeMap[timeframe] || timeframeMap['30d'];
      const creatorObjectId = this.database.createObjectId(creatorId);

      const [
        tipsData,
        personalMessagesData,
        videoCallsData,
        customRequestsData,
        fanClubData
      ] = await Promise.all([
        // Tips analytics
        this.database.tips().aggregate([
          {
            $match: {
              creatorId: creatorObjectId,
              createdAt: { $gte: startDate },
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' },
              avgAmount: { $avg: '$amount' }
            }
          }
        ]).toArray(),

        // Personal messages analytics
        this.database.personalMessages().aggregate([
          {
            $match: {
              creatorId: creatorObjectId,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]).toArray(),

        // Video calls analytics
        this.database.videoCalls().aggregate([
          {
            $match: {
              creatorId: creatorObjectId,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalRevenue: { $sum: '$price' }
            }
          }
        ]).toArray(),

        // Custom requests analytics
        this.database.customRequests().aggregate([
          {
            $match: {
              creatorId: creatorObjectId,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              avgBudget: { $avg: '$budget' }
            }
          }
        ]).toArray(),

        // Fan club analytics
        this.database.fanClubMemberships().aggregate([
          {
            $match: {
              creatorId: creatorObjectId,
              joinedAt: { $gte: startDate },
              isActive: true
            }
          },
          {
            $group: {
              _id: '$membershipType',
              count: { $sum: 1 },
              totalRevenue: { $sum: '$price' }
            }
          }
        ]).toArray()
      ]);

      // Format analytics data
      const analytics = {
        timeframe: timeframe,
        period: { start: startDate, end: now },
        tips: {
          count: tipsData[0]?.count || 0,
          totalAmount: tipsData[0]?.totalAmount || 0,
          averageAmount: tipsData[0]?.avgAmount || 0
        },
        personalMessages: personalMessagesData.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        videoCalls: videoCallsData.reduce((acc, item) => {
          acc[item._id] = { count: item.count, revenue: item.totalRevenue || 0 };
          return acc;
        }, {}),
        customRequests: customRequestsData.reduce((acc, item) => {
          acc[item._id] = { count: item.count, avgBudget: item.avgBudget || 0 };
          return acc;
        }, {}),
        fanClub: fanClubData.reduce((acc, item) => {
          acc[item._id] = { count: item.count, revenue: item.totalRevenue || 0 };
          return acc;
        }, {})
      };

      return analytics;

    } catch (error) {
      console.error('Error getting creator interaction analytics:', error);
      throw error;
    }
  }

  async updateStats() {
    try {
      const [tips, personalMessages, videoCalls, customRequests, fanClubMembers] = await Promise.all([
        this.database.tips().aggregate([
          { $group: { _id: null, count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
        ]).toArray(),
        this.database.personalMessages().countDocuments(),
        this.database.videoCalls().countDocuments(),
        this.database.customRequests().countDocuments(),
        this.database.fanClubMemberships().countDocuments({ isActive: true })
      ]);

      this.stats.totalTips = tips[0]?.count || 0;
      this.stats.totalTipAmount = tips[0]?.totalAmount || 0;
      this.stats.totalPersonalMessages = personalMessages;
      this.stats.totalVideoCallsScheduled = videoCalls;
      this.stats.totalCustomRequests = customRequests;
      this.stats.activeFanClubMembers = fanClubMembers;
      this.stats.lastStatsUpdate = new Date();

    } catch (error) {
      console.error('Error updating Creator-Fan interaction stats:', error);
    }
  }

  getStats() {
    return { ...this.stats };
  }

  async shutdown() {
    console.log('🔄 Shutting down Creator-Fan Interaction System...');
    this.isInitialized = false;
    this.emit('shutdown');
    console.log('✅ Creator-Fan Interaction System shut down successfully');
  }
}

module.exports = CreatorFanInteractionSystem;
