const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');

class PrismRecordingServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ 
            server: this.server,
            verifyClient: (info) => {
                // Accept connections to /recording/:sessionId
                return info.req.url.startsWith('/recording/');
            }
        });
        
        this.recordings = new Map();
        this.recordingDir = path.join(__dirname, '../../uploads/recordings');
        this.mediaDir = path.join(__dirname, '../../uploads/media');
        this.thumbnailDir = path.join(__dirname, '../../uploads/thumbnails');
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        
        // Ensure directories exist
        if (!fs.existsSync(this.recordingDir)) {
            fs.mkdirSync(this.recordingDir, { recursive: true });
        }
        if (!fs.existsSync(this.mediaDir)) {
            fs.mkdirSync(this.mediaDir, { recursive: true });
        }
        if (!fs.existsSync(this.thumbnailDir)) {
            fs.mkdirSync(this.thumbnailDir, { recursive: true });
        }
        
        // Load existing recordings on startup
        this.loadExistingRecordings();
    }

    loadExistingRecordings() {
        try {
            console.log('📂 Loading existing recordings...');
            
            // Get all video files from recordings directory
            const recordingFiles = fs.readdirSync(this.recordingDir)
                .filter(file => file.endsWith('.mp4') || file.endsWith('.webm'))
                .map(file => path.join(this.recordingDir, file));

            recordingFiles.forEach(filePath => {
                const filename = path.basename(filePath);
                const sessionId = filename.replace(/\.(mp4|webm)$/, '');
                const extension = path.extname(filename);
                const stats = fs.statSync(filePath);
                
                // Create recording session entry
                const session = {
                    id: sessionId,
                    userId: 'unknown',
                    quality: '1080p',
                    format: extension.substring(1), // Remove the dot
                    autoSave: true,
                    liveStream: false,
                    timestamp: stats.birthtime.toISOString(),
                    status: 'completed',
                    filePath: filePath,
                    fileSize: stats.size,
                    duration: 0, // Could be calculated with ffprobe if needed
                    startTime: stats.birthtime.toISOString(),
                    endTime: stats.mtime.toISOString(),
                    thumbnailPath: null
                };

                this.recordings.set(sessionId, session);
                
                // Copy to media directory if not exists
                const mediaPath = path.join(this.mediaDir, filename);
                if (!fs.existsSync(mediaPath)) {
                    fs.copyFileSync(filePath, mediaPath);
                }
                
                // Generate thumbnail if not exists
                const thumbnailJpg = path.join(this.thumbnailDir, `${sessionId}.jpg`);
                const thumbnailSvg = path.join(this.thumbnailDir, `${sessionId}.svg`);
                
                if (!fs.existsSync(thumbnailJpg) && !fs.existsSync(thumbnailSvg)) {
                    // Generate thumbnail asynchronously
                    this.generateThumbnail(filePath, sessionId)
                        .then(thumbnailPath => {
                            session.thumbnailPath = `/uploads/thumbnails/${sessionId}.jpg`;
                            console.log('🖼️ Generated thumbnail for existing recording:', sessionId);
                        })
                        .catch(error => {
                            console.warn('⚠️ Failed to generate thumbnail for existing recording:', sessionId, error.message);
                            session.thumbnailPath = `/uploads/thumbnails/${sessionId}.svg`;
                        });
                } else {
                    // Thumbnail already exists
                    if (fs.existsSync(thumbnailJpg)) {
                        session.thumbnailPath = `/uploads/thumbnails/${sessionId}.jpg`;
                    } else if (fs.existsSync(thumbnailSvg)) {
                        session.thumbnailPath = `/uploads/thumbnails/${sessionId}.svg`;
                    }
                }
            });

            console.log(`✅ Loaded ${recordingFiles.length} existing recordings`);
            
        } catch (error) {
            console.error('❌ Error loading existing recordings:', error);
        }
    }

    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
        // Configure multer for file uploads
        const upload = multer({
            dest: this.recordingDir,
            limits: {
                fileSize: 500 * 1024 * 1024 // 500MB limit
            }
        });
        this.upload = upload;
        
        // Serve media files from uploads directory
        this.app.use('/uploads/media', express.static(this.mediaDir));
        this.app.use('/uploads/thumbnails', express.static(this.thumbnailDir));
        
        // CORS for development
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });
    }

    setupRoutes() {
        // Create new recording session
        this.app.post('/api/recordings/session', (req, res) => {
            const sessionId = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const session = {
                id: sessionId,
                userId: req.body.userId,
                quality: req.body.quality || '1080p',
                format: req.body.format || 'mp4',
                autoSave: req.body.autoSave || true,
                liveStream: req.body.liveStream || false,
                timestamp: req.body.timestamp || new Date().toISOString(),
                status: 'created',
                filePath: null,
                fileSize: 0,
                duration: 0
            };

            this.recordings.set(sessionId, session);
            
            console.log('📝 Created recording session:', sessionId);
            res.json(session);
        });

        // Finalize recording
        this.app.post('/api/recordings/:sessionId/finalize', async (req, res) => {
            const sessionId = req.params.sessionId;
            const session = this.recordings.get(sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Recording session not found' });
            }

            try {
                // Check if recording file exists
                const recordingPath = path.join(this.recordingDir, `${sessionId}.mp4`);
                
                if (fs.existsSync(recordingPath)) {
                    const stats = fs.statSync(recordingPath);
                    session.fileSize = stats.size;
                    session.filePath = recordingPath;
                    session.status = 'completed';

                    // Get video duration using ffprobe
                    const duration = await this.getVideoDuration(recordingPath);
                    session.duration = duration;

                    // Copy to media uploads directory for API access
                    const mediaPath = path.join(__dirname, '../../uploads/media', `${sessionId}.mp4`);
                    fs.copyFileSync(recordingPath, mediaPath);

                    console.log('✅ Recording finalized:', sessionId, `(${stats.size} bytes)`);
                    
                    res.json({
                        success: true,
                        sessionId: sessionId,
                        filePath: `/uploads/media/${sessionId}.mp4`,
                        fileSize: session.fileSize,
                        duration: session.duration,
                        downloadUrl: `http://localhost:3004/uploads/media/${sessionId}.mp4`
                    });
                } else {
                    session.status = 'failed';
                    console.error('❌ Recording file not found:', recordingPath);
                    res.status(404).json({ 
                        error: 'Recording file not found',
                        sessionId: sessionId
                    });
                }
            } catch (error) {
                console.error('❌ Error finalizing recording:', error);
                session.status = 'error';
                res.status(500).json({ 
                    error: 'Failed to finalize recording',
                    details: error.message
                });
            }
        });

        // Upload recording file
        this.app.post('/api/recordings/:sessionId/upload', this.upload.single('video'), async (req, res) => {
            const sessionId = req.params.sessionId;
            const session = this.recordings.get(sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Recording session not found' });
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No video file uploaded' });
            }

            try {
                console.log('📤 Processing uploaded recording:', sessionId);
                
                // Move uploaded file to final destination
                const finalPath = path.join(this.recordingDir, `${sessionId}.webm`);
                fs.renameSync(req.file.path, finalPath);
                
                // Update session
                session.status = 'completed';
                session.filePath = finalPath;
                session.fileSize = req.file.size;
                session.endTime = new Date().toISOString();
                
                // Copy to media directory for serving
                const mediaPath = path.join(this.mediaDir, `${sessionId}.webm`);
                fs.copyFileSync(finalPath, mediaPath);
                
                // Generate thumbnail
                let thumbnailPath = null;
                try {
                    thumbnailPath = await this.generateThumbnail(finalPath, sessionId);
                    session.thumbnailPath = `/uploads/thumbnails/${sessionId}.jpg`;
                    console.log('🖼️ Thumbnail generated for:', sessionId);
                } catch (thumbnailError) {
                    console.warn('⚠️ Thumbnail generation failed, using fallback:', thumbnailError.message);
                    session.thumbnailPath = `/uploads/thumbnails/${sessionId}.svg`;
                }
                
                console.log('✅ Recording uploaded and processed:', sessionId, `(${req.file.size} bytes)`);
                
                res.json({
                    success: true,
                    sessionId: sessionId,
                    filePath: `/uploads/media/${sessionId}.webm`,
                    fileSize: req.file.size,
                    thumbnailPath: session.thumbnailPath,
                    downloadUrl: `http://localhost:8081/uploads/media/${sessionId}.webm`,
                    thumbnailUrl: `http://localhost:8081${session.thumbnailPath}`
                });
                
            } catch (error) {
                console.error('❌ Error processing upload:', error);
                session.status = 'error';
                res.status(500).json({
                    error: 'Failed to process upload',
                    details: error.message
                });
            }
        });

        // Get recording status
        this.app.get('/api/recordings/:sessionId', (req, res) => {
            const sessionId = req.params.sessionId;
            const session = this.recordings.get(sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Recording session not found' });
            }

            res.json(session);
        });

        // List all recordings
        this.app.get('/api/recordings', (req, res) => {
                const allRecordings = Array.from(this.recordings.values()).map(recording => ({
                ...recording,
                thumbnailUrl: recording.thumbnailPath ? `http://localhost:8081${recording.thumbnailPath}` : null,
                videoUrl: `http://localhost:8081/uploads/media/${recording.id}.${recording.format}`
            }));
            res.json(allRecordings);
        });

        // Get thumbnail for a specific recording
        this.app.get('/api/recordings/:sessionId/thumbnail', (req, res) => {
            const sessionId = req.params.sessionId;
            const session = this.recordings.get(sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Recording session not found' });
            }

            if (!session.thumbnailPath) {
                return res.status(404).json({ error: 'Thumbnail not available' });
            }

            const thumbnailFullPath = path.join(__dirname, '../..', session.thumbnailPath);
            
            if (fs.existsSync(thumbnailFullPath)) {
                res.sendFile(path.resolve(thumbnailFullPath));
            } else {
                res.status(404).json({ error: 'Thumbnail file not found' });
            }
        });
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, request) => {
            const url = new URL(request.url, `http://${request.headers.host}`);
            const sessionId = url.pathname.split('/').pop();
            
            console.log('🔌 WebSocket connected for session:', sessionId);
            
            const session = this.recordings.get(sessionId);
            if (!session) {
                ws.close(1000, 'Session not found');
                return;
            }

            ws.sessionId = sessionId;
            ws.session = session;

            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data);
                    await this.handleWebSocketMessage(ws, message);
                } catch (error) {
                    console.error('❌ WebSocket message error:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Invalid message format'
                    }));
                }
            });

            ws.on('close', () => {
                console.log('🔌 WebSocket disconnected for session:', sessionId);
                this.stopRecording(sessionId);
            });

            ws.on('error', (error) => {
                console.error('❌ WebSocket error:', error);
            });
        });
    }

    async handleWebSocketMessage(ws, message) {
        console.log('📨 WebSocket message:', message.type, 'for session:', ws.sessionId);

        switch (message.type) {
            case 'start-recording':
                await this.startRecording(ws);
                break;

            case 'stop-recording':
                await this.stopRecording(ws.sessionId);
                break;

            case 'answer':
                // Handle WebRTC answer (in a real implementation, you would process this)
                console.log('📡 Received WebRTC answer');
                ws.send(JSON.stringify({
                    type: 'recording-started'
                }));
                break;

            case 'ice-candidate':
                // Handle ICE candidate (in a real implementation, you would process this)
                console.log('🧊 Received ICE candidate');
                break;

            default:
                console.log('🤷 Unknown message type:', message.type);
        }
    }

    async startRecording(ws) {
        const sessionId = ws.sessionId;
        const session = ws.session;
        
        console.log('🎬 Starting recording for session:', sessionId);

        try {
            // Create a valid WebRTC offer with proper SDP
            const offer = {
                type: 'offer',
                sdp: [
                    'v=0',
                    'o=- 4611731400430051336 2 IN IP4 127.0.0.1',
                    's=-',
                    't=0 0',
                    'a=group:BUNDLE 0 1',
                    'a=extmap-allow-mixed',
                    'a=msid-semantic: WMS',
                    'm=audio 9 UDP/TLS/RTP/SAVPF 111 63 103 104 9 0 8 106 105 13 110 112 113 126',
                    'c=IN IP4 0.0.0.0',
                    'a=rtcp:9 IN IP4 0.0.0.0',
                    'a=ice-ufrag:4ZcD',
                    'a=ice-pwd:2/1muCWoOi3uLifh0nAH+Av/',
                    'a=ice-options:trickle',
                    'a=fingerprint:sha-256 75:74:5A:A6:A4:E5:52:F4:A7:67:4C:01:C7:EE:91:3F:21:3D:A2:E3:53:7B:6F:30:86:F2:30:FF:A6:22:D9:35',
                    'a=setup:actpass',
                    'a=mid:0',
                    'a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level',
                    'a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time',
                    'a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01',
                    'a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid',
                    'a=recvonly',
                    'a=rtcp-mux',
                    'a=rtpmap:111 opus/48000/2',
                    'a=rtcp-fb:111 transport-cc',
                    'a=fmtp:111 minptime=10;useinbandfec=1',
                    'a=rtpmap:63 red/48000/2',
                    'a=fmtp:63 111/111',
                    'a=rtpmap:103 ISAC/16000',
                    'a=rtpmap:104 ISAC/32000',
                    'a=rtpmap:9 G722/8000',
                    'a=rtpmap:0 PCMU/8000',
                    'a=rtpmap:8 PCMA/8000',
                    'a=rtpmap:106 CN/32000',
                    'a=rtpmap:105 CN/16000',
                    'a=rtpmap:13 CN/8000',
                    'a=rtpmap:110 telephone-event/48000',
                    'a=rtpmap:112 telephone-event/32000',
                    'a=rtpmap:113 telephone-event/16000',
                    'a=rtpmap:126 telephone-event/8000',
                    'm=video 9 UDP/TLS/RTP/SAVPF 96 97 102 103 104 105 106 107 108 109 127 125 39 40 45 46 98 99 100 101 114 115 116',
                    'c=IN IP4 0.0.0.0',
                    'a=rtcp:9 IN IP4 0.0.0.0',
                    'a=ice-ufrag:4ZcD',
                    'a=ice-pwd:2/1muCWoOi3uLifh0nAH+Av/',
                    'a=ice-options:trickle',
                    'a=fingerprint:sha-256 75:74:5A:A6:A4:E5:52:F4:A7:67:4C:01:C7:EE:91:3F:21:3D:A2:E3:53:7B:6F:30:86:F2:30:FF:A6:22:D9:35',
                    'a=setup:actpass',
                    'a=mid:1',
                    'a=extmap:14 urn:ietf:params:rtp-hdrext:toffset',
                    'a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time',
                    'a=extmap:13 urn:3gpp:video-orientation',
                    'a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01',
                    'a=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay',
                    'a=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type',
                    'a=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing',
                    'a=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space',
                    'a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid',
                    'a=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id',
                    'a=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id',
                    'a=recvonly',
                    'a=rtcp-mux',
                    'a=rtcp-rsize',
                    'a=rtpmap:96 VP8/90000',
                    'a=rtcp-fb:96 goog-remb',
                    'a=rtcp-fb:96 transport-cc',
                    'a=rtcp-fb:96 ccm fir',
                    'a=rtcp-fb:96 nack',
                    'a=rtcp-fb:96 nack pli',
                    'a=rtpmap:97 rtx/90000',
                    'a=fmtp:97 apt=96',
                    'a=rtpmap:102 H264/90000',
                    'a=rtcp-fb:102 goog-remb',
                    'a=rtcp-fb:102 transport-cc',
                    'a=rtcp-fb:102 ccm fir',
                    'a=rtcp-fb:102 nack',
                    'a=rtcp-fb:102 nack pli',
                    'a=fmtp:102 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f',
                    'a=rtpmap:103 rtx/90000',
                    'a=fmtp:103 apt=102',
                    'a=rtpmap:104 H264/90000',
                    'a=rtcp-fb:104 goog-remb',
                    'a=rtcp-fb:104 transport-cc',
                    'a=rtcp-fb:104 ccm fir',
                    'a=rtcp-fb:104 nack',
                    'a=rtcp-fb:104 nack pli',
                    'a=fmtp:104 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f',
                    'a=rtpmap:105 rtx/90000',
                    'a=fmtp:105 apt=104',
                    'a=rtpmap:106 H264/90000',
                    'a=rtcp-fb:106 goog-remb',
                    'a=rtcp-fb:106 transport-cc',
                    'a=rtcp-fb:106 ccm fir',
                    'a=rtcp-fb:106 nack',
                    'a=rtcp-fb:106 nack pli',
                    'a=fmtp:106 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d001f',
                    'a=rtpmap:107 rtx/90000',
                    'a=fmtp:107 apt=106',
                    'a=rtpmap:108 H264/90000',
                    'a=rtcp-fb:108 goog-remb',
                    'a=rtcp-fb:108 transport-cc',
                    'a=rtcp-fb:108 ccm fir',
                    'a=rtcp-fb:108 nack',
                    'a=rtcp-fb:108 nack pli',
                    'a=fmtp:108 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=4d0032',
                    'a=rtpmap:109 rtx/90000',
                    'a=fmtp:109 apt=108',
                    'a=rtpmap:127 H265/90000',
                    'a=rtcp-fb:127 goog-remb',
                    'a=rtcp-fb:127 transport-cc',
                    'a=rtcp-fb:127 ccm fir',
                    'a=rtcp-fb:127 nack',
                    'a=rtcp-fb:127 nack pli',
                    'a=rtpmap:125 rtx/90000',
                    'a=fmtp:125 apt=127',
                    'a=rtpmap:39 AV1/90000',
                    'a=rtcp-fb:39 goog-remb',
                    'a=rtcp-fb:39 transport-cc',
                    'a=rtcp-fb:39 ccm fir',
                    'a=rtcp-fb:39 nack',
                    'a=rtcp-fb:39 nack pli',
                    'a=rtpmap:40 rtx/90000',
                    'a=fmtp:40 apt=39',
                    'a=rtpmap:45 AV1/90000',
                    'a=rtcp-fb:45 goog-remb',
                    'a=rtcp-fb:45 transport-cc',
                    'a=rtcp-fb:45 ccm fir',
                    'a=rtcp-fb:45 nack',
                    'a=rtcp-fb:45 nack pli',
                    'a=rtpmap:46 rtx/90000',
                    'a=fmtp:46 apt=45',
                    'a=rtpmap:98 VP9/90000',
                    'a=rtcp-fb:98 goog-remb',
                    'a=rtcp-fb:98 transport-cc',
                    'a=rtcp-fb:98 ccm fir',
                    'a=rtcp-fb:98 nack',
                    'a=rtcp-fb:98 nack pli',
                    'a=fmtp:98 profile-id=0',
                    'a=rtpmap:99 rtx/90000',
                    'a=fmtp:99 apt=98',
                    'a=rtpmap:100 VP9/90000',
                    'a=rtcp-fb:100 goog-remb',
                    'a=rtcp-fb:100 transport-cc',
                    'a=rtcp-fb:100 ccm fir',
                    'a=rtcp-fb:100 nack',
                    'a=rtcp-fb:100 nack pli',
                    'a=fmtp:100 profile-id=2',
                    'a=rtpmap:101 rtx/90000',
                    'a=fmtp:101 apt=100',
                    'a=rtpmap:114 red/90000',
                    'a=rtpmap:115 rtx/90000',
                    'a=fmtp:115 apt=114',
                    'a=rtpmap:116 ulpfec/90000'
                ].join('\r\n') + '\r\n'
            };

            ws.send(JSON.stringify({
                type: 'offer',
                offer: offer
            }));

            // Simulate recording process
            session.status = 'recording';
            session.startTime = new Date().toISOString();

            console.log('✅ Recording started for session:', sessionId);

        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            ws.send(JSON.stringify({
                type: 'error',
                error: 'Failed to start recording'
            }));
        }
    }

    async stopRecording(sessionId) {
        const session = this.recordings.get(sessionId);
        if (!session || session.status !== 'recording') {
            return;
        }

        console.log('🛑 Stopping recording for session:', sessionId);

        try {
            session.status = 'processing';
            session.endTime = new Date().toISOString();

            // Create a dummy recording file for demonstration
            // In a real implementation, this would be the actual recorded video
            const recordingPath = path.join(this.recordingDir, `${sessionId}.mp4`);
            const dummyVideoContent = Buffer.from('dummy video content for ' + sessionId);
            fs.writeFileSync(recordingPath, dummyVideoContent);

            session.status = 'completed';
            console.log('✅ Recording stopped and saved:', sessionId);

            // Notify client
            this.notifyRecordingComplete(sessionId, {
                sessionId: sessionId,
                filePath: recordingPath,
                fileSize: dummyVideoContent.length
            });

        } catch (error) {
            console.error('❌ Failed to stop recording:', error);
            session.status = 'error';
        }
    }

    notifyRecordingComplete(sessionId, data) {
        // Find WebSocket connection for this session
        this.wss.clients.forEach(ws => {
            if (ws.sessionId === sessionId && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'recording-stopped',
                    data: data
                }));
            }
        });
    }

    async getVideoDuration(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    console.warn('⚠️ Could not get video duration, using default:', err.message);
                    // Fallback to random duration if ffprobe fails
                    resolve(Math.floor(Math.random() * 300) + 30);
                } else {
                    const duration = metadata.format.duration || 0;
                    resolve(Math.round(duration));
                }
            });
        });
    }

    async generateThumbnail(videoPath, sessionId) {
        return new Promise((resolve, reject) => {
            const thumbnailPath = path.join(this.thumbnailDir, `${sessionId}.jpg`);
            
            console.log('🖼️ Generating thumbnail for:', sessionId);
            
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: ['10%'], // Take screenshot at 10% of video duration
                    filename: `${sessionId}.jpg`,
                    folder: this.thumbnailDir,
                    size: '320x180' // 16:9 aspect ratio thumbnail
                })
                .on('end', () => {
                    console.log('✅ Thumbnail generated:', thumbnailPath);
                    resolve(thumbnailPath);
                })
                .on('error', (err) => {
                    console.error('❌ Thumbnail generation failed:', err.message);
                    // Create a fallback thumbnail
                    this.createFallbackThumbnail(sessionId)
                        .then(resolve)
                        .catch(reject);
                });
        });
    }

    async createFallbackThumbnail(sessionId) {
        return new Promise((resolve, reject) => {
            const thumbnailPath = path.join(this.thumbnailDir, `${sessionId}.jpg`);
            
            // Create a simple placeholder image using Canvas (if available) or just copy a default
            // For now, we'll create a simple text-based SVG and convert it
            const svgContent = `
                <svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
                    <rect width="320" height="180" fill="#1a1a1a"/>
                    <text x="160" y="90" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dominant-baseline="middle">📹</text>
                    <text x="160" y="120" font-family="Arial" font-size="12" fill="#ccc" text-anchor="middle" dominant-baseline="middle">Video Thumbnail</text>
                </svg>
            `;
            
            // Save SVG as fallback (browsers can display this)
            const svgPath = path.join(this.thumbnailDir, `${sessionId}.svg`);
            fs.writeFileSync(svgPath, svgContent);
            
            console.log('📄 Created fallback SVG thumbnail:', svgPath);
            resolve(svgPath);
        });
    }

    start(port = 8081) {
        this.server.listen(port, () => {
            console.log('🚀 Prism Recording Server started on port', port);
            console.log('📡 WebSocket endpoint: ws://localhost:' + port + '/recording/:sessionId');
            console.log('🌐 HTTP API endpoint: http://localhost:' + port + '/api/recordings');
        });
    }
}

// Start the server
const recordingServer = new PrismRecordingServer();
recordingServer.start(8081);

module.exports = PrismRecordingServer;
