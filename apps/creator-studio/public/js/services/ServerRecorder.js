// Server Recording System for Prism Creator Studio
class ServerRecorder {
    constructor() {
        this.peer = null;
        this.recordingSession = null;
        this.websocket = null;
        this.serverUrl = 'ws://localhost:8080';
        this.apiUrl = 'http://localhost:3004';
        this.isRecording = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
    }

    async startRecording(stream, options = {}) {
        console.log('🎥 Starting Prism Server Recording...');
        
        try {
            // 1. Request recording session from Recording Server
            const sessionResponse = await fetch(`http://localhost:8080/api/recordings/session`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'user-' + Date.now(),
                    quality: options.quality || '1080p',
                    format: 'mp4',
                    autoSave: true,
                    liveStream: options.isLive || false,
                    timestamp: new Date().toISOString()
                })
            });

            if (!sessionResponse.ok) {
                throw new Error(`Session creation failed: ${sessionResponse.status}`);
            }

            this.recordingSession = await sessionResponse.json();
            console.log('✅ Recording session created:', this.recordingSession.id);

            // 2. Establish WebSocket connection to recording server
            await this.connectToRecordingServer();

            // 3. Setup WebRTC peer connection
            await this.setupWebRTCConnection(stream);

            this.isRecording = true;
            this.notifyRecordingStarted();

            return this.recordingSession;

        } catch (error) {
            console.error('❌ Failed to start server recording:', error);
            throw error;
        }
    }

    async connectToRecordingServer() {
        return new Promise((resolve, reject) => {
            const wsUrl = `ws://localhost:8080/recording/${this.recordingSession.id}`;
            console.log('🔗 Connecting to recording server:', wsUrl);

            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('✅ WebSocket connected to recording server');
                this.reconnectAttempts = 0;
                resolve();
            };

            this.websocket.onmessage = async (event) => {
                const message = JSON.parse(event.data);
                await this.handleServerMessage(message);
            };

            this.websocket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                reject(error);
            };

            this.websocket.onclose = () => {
                console.log('🔌 WebSocket connection closed');
                if (this.isRecording && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                }
            };

            // Timeout for connection
            setTimeout(() => {
                if (this.websocket.readyState !== WebSocket.OPEN) {
                    reject(new Error('WebSocket connection timeout'));
                }
            }, 10000);
        });
    }

    async setupWebRTCConnection(stream) {
        console.log('🔧 Setting up WebRTC connection...');

        this.peer = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        // Add stream tracks to peer connection
        stream.getTracks().forEach(track => {
            console.log(`📡 Adding ${track.kind} track to peer connection`);
            this.peer.addTrack(track, stream);
        });

        // Handle ICE candidates
        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                this.websocket.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };

        // Monitor connection state
        this.peer.oniceconnectionstatechange = () => {
            console.log('🔗 WebRTC ICE state:', this.peer.iceConnectionState);
            
            if (this.peer.iceConnectionState === 'connected') {
                console.log('✅ WebRTC connection established - recording started');
            } else if (this.peer.iceConnectionState === 'failed') {
                console.error('❌ WebRTC connection failed');
                this.handleConnectionFailure();
            }
        };

        // Request server to start recording
        this.websocket.send(JSON.stringify({
            type: 'start-recording',
            sessionId: this.recordingSession.id
        }));
    }

    async handleServerMessage(message) {
        console.log('📨 Server message:', message.type);

        switch (message.type) {
            case 'offer':
                await this.peer.setRemoteDescription(new RTCSessionDescription(message.offer));
                const answer = await this.peer.createAnswer();
                await this.peer.setLocalDescription(answer);
                
                this.websocket.send(JSON.stringify({
                    type: 'answer',
                    answer: answer
                }));
                break;

            case 'ice-candidate':
                await this.peer.addIceCandidate(new RTCIceCandidate(message.candidate));
                break;

            case 'recording-started':
                console.log('🎬 Server confirmed recording started');
                break;

            case 'recording-stopped':
                console.log('🛑 Server confirmed recording stopped');
                this.handleRecordingComplete(message.data);
                break;

            case 'error':
                console.error('❌ Server error:', message.error);
                this.handleServerError(message.error);
                break;

            default:
                console.log('🤷 Unknown message type:', message.type);
        }
    }

    async stopRecording() {
        console.log('🛑 Stopping server recording...');
        
        if (!this.isRecording) {
            console.warn('⚠️ No active recording to stop');
            return null;
        }

        try {
            // Send stop signal to server
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'stop-recording',
                    sessionId: this.recordingSession.id
                }));
            }

            // Close WebRTC connection
            if (this.peer) {
                this.peer.close();
                this.peer = null;
            }

            // Close WebSocket
            if (this.websocket) {
                this.websocket.close();
                this.websocket = null;
            }

            this.isRecording = false;

            // Get final recording result from Recording Server
            const result = await fetch(`http://localhost:8080/api/recordings/${this.recordingSession.id}/finalize`, {
                method: 'POST'
            });

            if (result.ok) {
                const recordingData = await result.json();
                console.log('✅ Recording completed successfully:', recordingData);
                return recordingData;
            } else {
                throw new Error(`Failed to finalize recording: ${result.status}`);
            }

        } catch (error) {
            console.error('❌ Error stopping recording:', error);
            throw error;
        }
    }

    attemptReconnect() {
        this.reconnectAttempts++;
        console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

        setTimeout(async () => {
            try {
                await this.connectToRecordingServer();
                console.log('✅ Reconnection successful');
            } catch (error) {
                console.error('❌ Reconnection failed:', error);
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    this.handleFinalConnectionFailure();
                }
            }
        }, 2000 * this.reconnectAttempts); // Exponential backoff
    }

    handleConnectionFailure() {
        console.error('❌ WebRTC connection failed');
        this.notifyConnectionError('WebRTC connection failed');
    }

    handleServerError(error) {
        console.error('❌ Server recording error:', error);
        this.notifyConnectionError(`Server error: ${error}`);
    }

    handleFinalConnectionFailure() {
        console.error('❌ Failed to reconnect to recording server');
        this.isRecording = false;
        this.notifyConnectionError('Recording server unavailable - please try again later');
    }

    handleRecordingComplete(data) {
        console.log('🎉 Recording completed on server:', data);
        this.notifyRecordingComplete(data);
    }

    notifyRecordingStarted() {
        document.dispatchEvent(new CustomEvent('serverRecordingStarted', {
            detail: { 
                sessionId: this.recordingSession.id,
                quality: this.recordingSession.quality
            }
        }));
    }

    notifyRecordingComplete(data) {
        document.dispatchEvent(new CustomEvent('serverRecordingComplete', {
            detail: data
        }));
    }

    notifyConnectionError(error) {
        document.dispatchEvent(new CustomEvent('serverRecordingError', {
            detail: { error }
        }));
    }

    getRecordingStatus() {
        return {
            isRecording: this.isRecording,
            sessionId: this.recordingSession?.id || null,
            connectionState: this.peer?.iceConnectionState || 'disconnected',
            websocketState: this.websocket?.readyState || WebSocket.CLOSED
        };
    }
}

// Make globally available
window.ServerRecorder = ServerRecorder;
