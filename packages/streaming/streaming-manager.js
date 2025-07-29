// Streaming API for PRISM platform - WebRTC and Socket.io integration
const { Server } = require('socket.io');

class StreamingManager {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URLS?.split(',') || ['http://localhost:3020', 'http://localhost:3030'],
        methods: ['GET', 'POST']
      }
    });
    
    this.activeStreams = new Map();
    this.streamViewers = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔗 User connected: ${socket.id}`);

      // Creator starts streaming
      socket.on('start-stream', (data) => {
        const { streamId, creatorId, title, description } = data;
        
        const streamInfo = {
          id: streamId,
          creatorId,
          title,
          description,
          startedAt: new Date(),
          status: 'live',
          viewers: 0,
          socketId: socket.id
        };

        this.activeStreams.set(streamId, streamInfo);
        this.streamViewers.set(streamId, new Set());

        // Join creator to their stream room
        socket.join(`stream-${streamId}`);
        
        // Notify all users about new stream
        socket.broadcast.emit('new-stream', {
          streamId,
          title,
          creatorId,
          viewerCount: 0
        });

        socket.emit('stream-started', { success: true, streamInfo });
        console.log(`📺 Stream started: ${streamId} by creator ${creatorId}`);
      });

      // Viewer joins stream
      socket.on('join-stream', (data) => {
        const { streamId, userId } = data;
        const stream = this.activeStreams.get(streamId);
        
        if (!stream) {
          socket.emit('stream-error', { message: 'Stream not found' });
          return;
        }

        // Add viewer to stream
        const viewers = this.streamViewers.get(streamId);
        viewers.add(socket.id);
        
        // Join viewer to stream room
        socket.join(`stream-${streamId}`);
        
        // Update viewer count
        stream.viewers = viewers.size;
        
        // Notify creator and other viewers about new viewer
        socket.to(`stream-${streamId}`).emit('viewer-joined', {
          streamId,
          viewerCount: stream.viewers,
          userId
        });

        socket.emit('stream-joined', {
          success: true,
          streamInfo: {
            id: streamId,
            title: stream.title,
            creatorId: stream.creatorId,
            viewerCount: stream.viewers
          }
        });

        console.log(`👀 Viewer ${userId} joined stream ${streamId}`);
      });

      // Viewer leaves stream
      socket.on('leave-stream', (data) => {
        const { streamId, userId } = data;
        this.handleViewerLeave(socket, streamId, userId);
      });

      // WebRTC signaling for peer-to-peer streaming
      socket.on('webrtc-offer', (data) => {
        const { streamId, offer, targetSocketId } = data;
        socket.to(targetSocketId).emit('webrtc-offer', {
          streamId,
          offer,
          fromSocketId: socket.id
        });
        console.log(`📡 WebRTC offer sent for stream ${streamId}`);
      });

      socket.on('webrtc-answer', (data) => {
        const { streamId, answer, targetSocketId } = data;
        socket.to(targetSocketId).emit('webrtc-answer', {
          streamId,
          answer,
          fromSocketId: socket.id
        });
        console.log(`📡 WebRTC answer sent for stream ${streamId}`);
      });

      socket.on('webrtc-ice-candidate', (data) => {
        const { streamId, candidate, targetSocketId } = data;
        socket.to(targetSocketId).emit('webrtc-ice-candidate', {
          streamId,
          candidate,
          fromSocketId: socket.id
        });
      });

      // Chat messages in stream
      socket.on('stream-message', (data) => {
        const { streamId, message, userId, username } = data;
        const stream = this.activeStreams.get(streamId);
        
        if (!stream) {
          socket.emit('stream-error', { message: 'Stream not found' });
          return;
        }

        const chatMessage = {
          id: Date.now().toString(),
          userId,
          username,
          message,
          timestamp: new Date(),
          streamId
        };

        // Send message to all viewers and creator
        this.io.to(`stream-${streamId}`).emit('new-stream-message', chatMessage);
        console.log(`💬 Chat message in stream ${streamId}: ${username}: ${message}`);
      });

      // Creator ends stream
      socket.on('end-stream', (data) => {
        const { streamId, creatorId } = data;
        this.endStream(streamId, socket);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        this.handleDisconnection(socket);
      });

      // Stream quality settings
      socket.on('update-stream-quality', (data) => {
        const { streamId, quality } = data;
        const stream = this.activeStreams.get(streamId);
        
        if (stream && stream.socketId === socket.id) {
          stream.quality = quality;
          socket.to(`stream-${streamId}`).emit('stream-quality-updated', {
            streamId,
            quality
          });
          console.log(`📺 Stream ${streamId} quality updated to ${quality}`);
        }
      });

      // Stream recording controls
      socket.on('start-recording', (data) => {
        const { streamId } = data;
        // TODO: Implement recording logic
        socket.emit('recording-started', { streamId, recordingId: Date.now().toString() });
        console.log(`🔴 Recording started for stream ${streamId}`);
      });

      socket.on('stop-recording', (data) => {
        const { streamId, recordingId } = data;
        // TODO: Implement recording stop logic
        socket.emit('recording-stopped', { streamId, recordingId });
        console.log(`⏹️ Recording stopped for stream ${streamId}`);
      });
    });
  }

  // Handle viewer leaving stream
  handleViewerLeave(socket, streamId, userId) {
    const viewers = this.streamViewers.get(streamId);
    const stream = this.activeStreams.get(streamId);
    
    if (viewers && stream) {
      viewers.delete(socket.id);
      stream.viewers = viewers.size;
      
      socket.to(`stream-${streamId}`).emit('viewer-left', {
        streamId,
        viewerCount: stream.viewers,
        userId
      });

      socket.leave(`stream-${streamId}`);
      console.log(`👋 Viewer ${userId} left stream ${streamId}`);
    }
  }

  // End stream
  endStream(streamId, creatorSocket) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) return;

    // Notify all viewers that stream ended
    creatorSocket.to(`stream-${streamId}`).emit('stream-ended', {
      streamId,
      endedAt: new Date()
    });

    // Clean up
    this.activeStreams.delete(streamId);
    this.streamViewers.delete(streamId);
    
    // Remove all sockets from stream room
    const room = this.io.sockets.adapter.rooms.get(`stream-${streamId}`);
    if (room) {
      room.forEach(socketId => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(`stream-${streamId}`);
        }
      });
    }

    console.log(`📺 Stream ended: ${streamId}`);
  }

  // Handle socket disconnection
  handleDisconnection(socket) {
    // Check if disconnected socket was a creator
    for (const [streamId, stream] of this.activeStreams.entries()) {
      if (stream.socketId === socket.id) {
        this.endStream(streamId, socket);
        break;
      }
    }

    // Remove from all stream viewer lists
    for (const [streamId, viewers] of this.streamViewers.entries()) {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id);
        const stream = this.activeStreams.get(streamId);
        if (stream) {
          stream.viewers = viewers.size;
          socket.to(`stream-${streamId}`).emit('viewer-left', {
            streamId,
            viewerCount: stream.viewers
          });
        }
      }
    }
  }

  // Get active streams
  getActiveStreams() {
    return Array.from(this.activeStreams.values()).map(stream => ({
      id: stream.id,
      title: stream.title,
      creatorId: stream.creatorId,
      viewers: stream.viewers,
      startedAt: stream.startedAt,
      quality: stream.quality || 'auto'
    }));
  }

  // Get stream statistics
  getStreamStats(streamId) {
    const stream = this.activeStreams.get(streamId);
    if (!stream) return null;

    return {
      id: streamId,
      title: stream.title,
      creatorId: stream.creatorId,
      viewers: stream.viewers,
      startedAt: stream.startedAt,
      duration: Date.now() - stream.startedAt.getTime(),
      status: stream.status
    };
  }
}

module.exports = StreamingManager;
