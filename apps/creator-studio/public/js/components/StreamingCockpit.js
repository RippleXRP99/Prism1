// StreamingCockpit Component - Server Recording Only
function StreamingCockpit({ settings, streamSettings, deviceSettings, onClose, onStreamStop }) {
    // Merge settings from different props for backward compatibility
    const mergedSettings = settings || {
        camera: deviceSettings?.camera,
        microphone: deviceSettings?.microphone,
        ...streamSettings
    };
    const [isStreaming, setIsStreaming] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordingStatus, setRecordingStatus] = React.useState('idle');
    const [recordingSession, setRecordingSession] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [stats, setStats] = React.useState({
        viewers: 0,
        duration: '00:00:00',
        quality: 'HD',
        recordingSize: '0 MB'
    });

    const videoRef = React.useRef(null);
    const streamRef = React.useRef(null);
    const recorderRef = React.useRef(null);
    const recordingStartTimeRef = React.useRef(null);

    React.useEffect(() => {
        // List available devices for debugging
        listAvailableDevices();
        initializeStream();
        setupEventListeners();

        return () => {
            cleanup();
        };
    }, []);

    const listAvailableDevices = async () => {
        try {
            // Check browser support first
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('❌ Browser does not support camera access');
                setError('Browser unterstützt keine Kamera-Zugriffe. Bitte verwenden Sie Chrome, Firefox oder Edge.');
                return;
            }

            console.log('✅ Browser supports camera access');
            
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const audioDevices = devices.filter(device => device.kind === 'audioinput');
            
            console.log('📹 Available cameras:', videoDevices.length);
            videoDevices.forEach((device, index) => {
                console.log(`  ${index + 1}. ${device.label || 'Unknown Camera'} (${device.deviceId.substring(0, 20)}...)`);
            });
            
            console.log('🎤 Available microphones:', audioDevices.length);
            audioDevices.forEach((device, index) => {
                console.log(`  ${index + 1}. ${device.label || 'Unknown Microphone'} (${device.deviceId.substring(0, 20)}...)`);
            });

            if (videoDevices.length === 0) {
                setError('Keine Kamera gefunden. Bitte schließen Sie eine Kamera an.');
            }
            if (audioDevices.length === 0) {
                console.warn('⚠️ No microphones found');
            }
        } catch (error) {
            console.error('❌ Failed to enumerate devices:', error);
            setError('Geräte-Auflistung fehlgeschlagen. Bitte Browser-Berechtigungen prüfen.');
        }
    };

    const setupEventListeners = () => {
        // Listen for server recording events
        document.addEventListener('serverRecordingStarted', handleRecordingStarted);
        document.addEventListener('serverRecordingComplete', handleRecordingComplete);
        document.addEventListener('serverRecordingError', handleRecordingError);
    };

    const initializeStream = async () => {
        try {
            console.log('🎥 Initializing camera and microphone...');
            console.log('📱 Settings received:', mergedSettings);
            
            // First, try with basic constraints
            let stream;
            try {
                console.log('🔄 Attempting basic camera access...');
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                console.log('✅ Basic camera access successful');
            } catch (basicError) {
                console.error('❌ Basic camera access failed:', basicError);
                throw new Error('Kamera oder Mikrofon nicht verfügbar. Bitte Berechtigungen prüfen.');
            }

            // If basic access works, try with enhanced constraints
            if (stream) {
                // Stop the basic stream first
                stream.getTracks().forEach(track => track.stop());
                
                console.log('🔧 Applying enhanced constraints...');
                
                const videoConstraints = {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 }
                };

                const audioConstraints = {
                    noiseSuppression: true,
                    echoCancellation: true,
                    autoGainControl: true
                };

                // Add device ID if available and valid
                if (mergedSettings?.camera && 
                    mergedSettings.camera !== 'default' && 
                    mergedSettings.camera !== 'undefined') {
                    try {
                        videoConstraints.deviceId = { exact: mergedSettings.camera };
                        console.log('📹 Using specific camera:', mergedSettings.camera);
                    } catch (deviceError) {
                        console.warn('⚠️ Specific camera failed, using default');
                    }
                }
                
                if (mergedSettings?.microphone && 
                    mergedSettings.microphone !== 'default' && 
                    mergedSettings.microphone !== 'undefined') {
                    try {
                        audioConstraints.deviceId = { exact: mergedSettings.microphone };
                        console.log('🎤 Using specific microphone:', mergedSettings.microphone);
                    } catch (deviceError) {
                        console.warn('⚠️ Specific microphone failed, using default');
                    }
                }
                
                // Get the enhanced stream with timeout
                stream = await Promise.race([
                    navigator.mediaDevices.getUserMedia({
                        video: videoConstraints,
                        audio: audioConstraints
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Camera timeout after 10 seconds')), 10000)
                    )
                ]);
            }

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                console.log('✅ Stream initialized successfully');
            }

            setIsStreaming(true);

        } catch (error) {
            console.error('❌ Failed to initialize stream:', error);
            
            // Provide specific error messages
            let errorMessage = 'Kamera oder Mikrofon konnte nicht initialisiert werden';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Kamera/Mikrofon-Berechtigungen wurden verweigert. Bitte Berechtigungen in den Browser-Einstellungen aktivieren.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'Keine Kamera oder Mikrofon gefunden. Bitte Geräte anschließen.';
            } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
                errorMessage = 'Kamera-Initialisierung dauerte zu lange. Bitte versuchen Sie es erneut.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = 'Kamera unterstützt die gewünschte Qualität nicht. Versuche mit niedrigerer Qualität...';
                
                // Try with lower quality as fallback
                try {
                    console.log('🔄 Trying fallback with lower quality...');
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 640, height: 480 },
                        audio: true
                    });
                    
                    streamRef.current = fallbackStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallbackStream;
                        await videoRef.current.play();
                        console.log('✅ Fallback stream initialized successfully');
                    }
                    setIsStreaming(true);
                    return; // Success with fallback
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                }
            }
            
            setError(errorMessage);
        }
    };

    const startRecording = async () => {
        if (!streamRef.current) {
            setError('Stream nicht verfügbar');
            return;
        }

        try {
            console.log('🎬 Starting local recording...');
            console.log('📊 Stream info:', {
                active: streamRef.current.active,
                tracks: streamRef.current.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState
                }))
            });

            setRecordingStatus('connecting');
            setError(null);

            // Verify stream has active tracks
            const tracks = streamRef.current.getTracks();
            if (tracks.length === 0) {
                throw new Error('Stream hat keine Tracks');
            }

            const activeTracks = tracks.filter(track => track.readyState === 'live');
            if (activeTracks.length === 0) {
                throw new Error('Stream hat keine aktiven Tracks');
            }

            console.log(`📹 Found ${activeTracks.length} active tracks:`, activeTracks.map(t => `${t.kind} (${t.readyState})`));
            
            // Additional stream validation
            if (!streamRef.current.active) {
                console.warn('⚠️ Stream is marked as inactive, but continuing...');
            }

            // Advanced stream diagnostics
            console.log('🔍 Advanced stream diagnostics:');
            console.log('  - Stream active:', streamRef.current.active);
            console.log('  - Stream id:', streamRef.current.id);
            console.log('  - Track details:');
            streamRef.current.getTracks().forEach((track, index) => {
                console.log(`    Track ${index + 1}: ${track.kind}`);
                console.log(`      - enabled: ${track.enabled}`);
                console.log(`      - readyState: ${track.readyState}`);
                console.log(`      - muted: ${track.muted}`);
                console.log(`      - label: ${track.label}`);
                console.log(`      - settings:`, track.getSettings ? track.getSettings() : 'not available');
            });

            // Test if we can clone the stream (often reveals issues)
            try {
                const testClone = streamRef.current.clone();
                testClone.getTracks().forEach(track => track.stop());
                console.log('✅ Stream clone test passed');
            } catch (cloneError) {
                console.warn('⚠️ Stream clone test failed:', cloneError);
            }

            // Ultimate codec strategy - simple but reliable
            const codecConfigs = [
                // Start with MP4 (most reliable)
                { mimeType: 'video/mp4', options: {} },
                { mimeType: 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"', options: { videoBitsPerSecond: 2000000, audioBitsPerSecond: 128000 } },
                // WebM without specific codecs (lets browser choose)
                { mimeType: 'video/webm', options: {} },
                // VP9 (often more reliable than VP8)
                { mimeType: 'video/webm; codecs="vp9,opus"', options: { videoBitsPerSecond: 1500000, audioBitsPerSecond: 96000 } },
                // VP8 as last resort
                { mimeType: 'video/webm; codecs="vp8,opus"', options: { videoBitsPerSecond: 1000000, audioBitsPerSecond: 64000 } }
            ];

            let selectedConfig = null;
            
            for (const config of codecConfigs) {
                if (MediaRecorder.isTypeSupported(config.mimeType)) {
                    console.log(`✅ Will use codec: ${config.mimeType}`);
                    selectedConfig = {
                        mimeType: config.mimeType,
                        options: {
                            mimeType: config.mimeType,
                            ...config.options
                        }
                    };
                    break;
                }
            }

            if (!selectedConfig) {
                throw new Error('Kein unterstützter Video-Codec gefunden. Browser ist zu alt.');
            }

            await attemptRecording(selectedConfig);

        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            setError('Aufzeichnung konnte nicht gestartet werden: ' + error.message);
            setRecordingStatus('error');
        }
    };

    const attemptRecording = async (config) => {
        return new Promise((resolve, reject) => {
            const mediaRecorder = new MediaRecorder(streamRef.current, config.options);
            const chunks = [];
            let totalSize = 0;
            let dataEventCount = 0;
            let recordingTimeout = null;

            mediaRecorder.ondataavailable = (event) => {
                dataEventCount++;
                const dataSize = event.data?.size || 0;
                console.log(`📦 Data chunk ${dataEventCount} received: ${dataSize} bytes`);
                
                if (event.data && dataSize > 0) {
                    chunks.push(event.data);
                    totalSize += dataSize;
                    console.log(`📊 Total recorded: ${totalSize} bytes in ${chunks.length} chunks`);
                } else {
                    console.warn(`⚠️ Empty data chunk ${dataEventCount} - codec: ${config.mimeType}`);
                    
                    // If we get 2 empty chunks quickly, this codec is broken
                    if (dataEventCount >= 2 && totalSize === 0) {
                        console.error(`❌ Codec ${config.mimeType} produces empty chunks - trying fallback`);
                        clearTimeout(recordingTimeout);
                        mediaRecorder.stop();
                        
                        // Try next codec in line
                        setTimeout(() => {
                            tryFallbackCodec();
                        }, 100);
                        return;
                    }
                }
            };

            mediaRecorder.onstop = async () => {
                clearTimeout(recordingTimeout);
                console.log(`📹 Recording finished! Total: ${totalSize} bytes in ${chunks.length} chunks from ${dataEventCount} data events`);
                
                if (chunks.length === 0 || totalSize === 0) {
                    console.error('❌ No data recorded with', config.mimeType);
                    tryFallbackCodec();
                    return;
                }

                const blob = new Blob(chunks, { type: config.mimeType });
                console.log(`🔄 Created blob: ${blob.size} bytes, type: ${blob.type}`);
                
                // Upload to server
                await uploadRecording(blob);
                
                setRecordingStatus('completed');
                setIsRecording(false);
                
                // Reload media library
                setTimeout(() => {
                    if (window.mediaLibrary && typeof window.mediaLibrary.loadStreamRecordings === 'function') {
                        window.mediaLibrary.loadStreamRecordings();
                    }
                }, 1000);
                
                resolve();
            };

            mediaRecorder.onerror = (event) => {
                clearTimeout(recordingTimeout);
                console.error('❌ MediaRecorder error:', event);
                tryFallbackCodec();
            };

            mediaRecorder.onstart = () => {
                console.log('▶️ MediaRecorder started with', config.mimeType);
            };

            const tryFallbackCodec = () => {
                // Find next codec to try
                const currentIndex = codecConfigs.findIndex(c => c.mimeType === config.mimeType);
                const nextConfigs = codecConfigs.slice(currentIndex + 1);
                
                for (const nextConfig of nextConfigs) {
                    if (MediaRecorder.isTypeSupported(nextConfig.mimeType)) {
                        console.log(`� Trying fallback codec: ${nextConfig.mimeType}`);
                        const fallbackConfig = {
                            mimeType: nextConfig.mimeType,
                            options: {
                                mimeType: nextConfig.mimeType,
                                ...nextConfig.options
                            }
                        };
                        
                        setTimeout(() => {
                            attemptRecording(fallbackConfig).then(resolve).catch(reject);
                        }, 500);
                        return;
                    }
                }
                
                // No more fallbacks
                setError('Alle Video-Codecs fehlgeschlagen. Browser-Problem.');
                setRecordingStatus('error');
                reject(new Error('All codecs failed'));
            };

            try {
                console.log('� Starting MediaRecorder with', config.mimeType);
                mediaRecorder.start(1000); // 1 second intervals
                recorderRef.current = mediaRecorder;
                
                // Set timeout to detect completely non-functional recording
                recordingTimeout = setTimeout(() => {
                    if (totalSize === 0) {
                        console.error('❌ No data after 3 seconds - trying fallback');
                        mediaRecorder.stop();
                    }
                }, 3000);
                
                setTimeout(() => {
                    if (mediaRecorder.state === 'recording') {
                        setRecordingStatus('recording');
                        setIsRecording(true);
                        recordingStartTimeRef.current = Date.now();
                        console.log('✅ Recording confirmed with', config.mimeType);
                        
                        // Test data flow
                        setTimeout(() => {
                            if (mediaRecorder.state === 'recording') {
                                mediaRecorder.requestData();
                            }
                        }, 1500);
                        
                    } else {
                        tryFallbackCodec();
                    }
                }, 500);
                
            } catch (startError) {
                console.error('❌ Failed to start MediaRecorder:', startError);
                tryFallbackCodec();
            }
        });
    };

    const uploadRecording = async (blob) => {
        try {
            console.log(`📤 Uploading recording to server... Size: ${blob.size} bytes, Type: ${blob.type}`);
            
            if (blob.size === 0) {
                throw new Error('Recording ist leer (0 bytes)');
            }

            // Create session first
            const sessionResponse = await fetch('http://localhost:8081/api/recordings/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 'current-user',
                    quality: '1080p',
                    format: 'webm',
                    autoSave: true,
                    liveStream: false
                })
            });

            if (!sessionResponse.ok) {
                const errorText = await sessionResponse.text();
                throw new Error(`Failed to create recording session: ${sessionResponse.status} - ${errorText}`);
            }

            const session = await sessionResponse.json();
            console.log('📝 Created recording session:', session.id);

            // Upload the video file
            const formData = new FormData();
            formData.append('video', blob, `${session.id}.webm`);

            console.log('📡 Sending upload request...');
            const uploadResponse = await fetch(`http://localhost:8081/api/recordings/${session.id}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                throw new Error(`Failed to upload recording: ${uploadResponse.status} - ${errorText}`);
            }

            const result = await uploadResponse.json();
            console.log('✅ Recording uploaded successfully:', result);

            // Verify file size on server
            if (result.fileSize === 0) {
                console.warn('⚠️ Server reports file size is 0 bytes!');
                setError('Upload erfolgreich, aber Datei ist leer');
            }

        } catch (error) {
            console.error('❌ Failed to upload recording:', error);
            setError('Upload fehlgeschlagen: ' + error.message);
        }
    };

    const stopRecording = async () => {
        if (!recorderRef.current || !isRecording) {
            console.log('⚠️ No active recording to stop');
            return;
        }

        try {
            console.log('🛑 Stopping local recording...');
            console.log('📊 MediaRecorder state:', recorderRef.current.state);
            
            // Check recording duration
            const recordingDuration = recordingStartTimeRef.current ? Date.now() - recordingStartTimeRef.current : 0;
            console.log(`⏱️ Recording duration: ${recordingDuration}ms`);
            
            if (recordingDuration < 1000) {
                console.warn('⚠️ Recording duration is very short, may result in no data');
            }
            
            setRecordingStatus('stopping');

            // Stop the MediaRecorder
            if (recorderRef.current && recorderRef.current.state === 'recording') {
                // Request a final data chunk before stopping
                console.log('📤 Requesting final data chunk...');
                recorderRef.current.requestData();
                
                // Small delay to ensure data is collected
                setTimeout(() => {
                    if (recorderRef.current && recorderRef.current.state === 'recording') {
                        console.log('⏹️ Stopping MediaRecorder...');
                        recorderRef.current.stop();
                    }
                }, 200);
            } else {
                console.log('⚠️ MediaRecorder not in recording state:', recorderRef.current?.state);
            }

            console.log('✅ Recording stop initiated successfully');

        } catch (error) {
            console.error('❌ Failed to stop recording:', error);
            setError('Aufzeichnung konnte nicht gestoppt werden: ' + error.message);
            setRecordingStatus('error');
        }
    };

    const handleRecordingStarted = (event) => {
        console.log('🎉 Recording started event received:', event.detail);
        setRecordingStatus('recording');
        setIsRecording(true);
        updateStats();
    };

    const handleRecordingComplete = (event) => {
        console.log('🎉 Recording completed event received:', event.detail);
        setRecordingStatus('completed');
        setIsRecording(false);
        
        // Show success message
        setTimeout(() => {
            setRecordingStatus('idle');
        }, 3000);
    };

    const handleRecordingError = (event) => {
        console.error('❌ Recording error event received:', event.detail);
        setError(event.detail.error);
        setRecordingStatus('error');
        setIsRecording(false);
    };

    const updateStats = () => {
        // Update recording stats periodically
        if (isRecording) {
            setStats(prev => ({
                ...prev,
                viewers: Math.floor(Math.random() * 100) + 1,
                recordingSize: ((Date.now() - (recordingSession?.timestamp ? new Date(recordingSession.timestamp).getTime() : Date.now())) / 1000 / 60 * 2).toFixed(1) + ' MB'
            }));
        }
    };

    React.useEffect(() => {
        if (isRecording) {
            const interval = setInterval(updateStats, 1000);
            return () => clearInterval(interval);
        }
    }, [isRecording]);

    const cleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (recorderRef.current && isRecording) {
            recorderRef.current.stopRecording().catch(console.error);
        }
        
        // Remove event listeners
        document.removeEventListener('serverRecordingStarted', handleRecordingStarted);
        document.removeEventListener('serverRecordingComplete', handleRecordingComplete);
        document.removeEventListener('serverRecordingError', handleRecordingError);
    };

    const getStatusColor = () => {
        switch (recordingStatus) {
            case 'recording': return 'var(--prism-success)';
            case 'connecting': case 'stopping': return 'var(--prism-warning)';
            case 'error': return 'var(--prism-danger)';
            case 'completed': return 'var(--prism-info)';
            default: return 'var(--prism-gray-400)';
        }
    };

    const getStatusText = () => {
        switch (recordingStatus) {
            case 'recording': return '🔴 Aufzeichnung läuft';
            case 'connecting': return '🔄 Verbinde mit Server...';
            case 'stopping': return '⏹️ Stoppe Aufzeichnung...';
            case 'error': return '❌ Fehler aufgetreten';
            case 'completed': return '✅ Aufzeichnung gespeichert';
            default: return '⚪ Bereit für Aufzeichnung';
        }
    };

    return React.createElement('div', {
        style: {
            height: '100vh',
            display: 'grid',
            gridTemplateColumns: '300px 1fr 300px',
            gridTemplateRows: '80px 1fr 150px',
            gap: '1rem',
            padding: '1rem',
            background: 'var(--prism-bg)',
            color: 'var(--prism-text)'
        }
    }, [
        // Header with platforms
        React.createElement('div', {
            key: 'platforms',
            style: {
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem',
                background: 'var(--prism-card)',
                borderRadius: '12px',
                padding: '1rem'
            }
        }, [
            React.createElement('div', {
                key: 'youtube',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: '#ff0000',
                    borderRadius: '8px',
                    color: 'white'
                }
            }, [
                React.createElement('span', { key: 'icon' }, '📺'),
                React.createElement('span', { key: 'text' }, 'YouTube')
            ]),
            React.createElement('div', {
                key: 'twitch',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: '#9146ff',
                    borderRadius: '8px',
                    color: 'white'
                }
            }, [
                React.createElement('span', { key: 'icon' }, '🎮'),
                React.createElement('span', { key: 'text' }, 'Twitch')
            ]),
            React.createElement('div', {
                key: 'facebook',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: '#1877f2',
                    borderRadius: '8px',
                    color: 'white'
                }
            }, [
                React.createElement('span', { key: 'icon' }, '📘'),
                React.createElement('span', { key: 'text' }, 'Facebook')
            ])
        ]),

        // Notifications sidebar
        React.createElement('div', {
            key: 'notifications',
            style: {
                background: 'var(--prism-card)',
                borderRadius: '12px',
                padding: '1rem',
                overflow: 'hidden'
            }
        }, [
            React.createElement('h3', {
                key: 'title',
                style: {
                    margin: '0 0 1rem 0',
                    fontSize: '1.2rem',
                    color: 'var(--prism-text)'
                }
            }, 'Benachrichtigungen'),
            React.createElement('div', {
                key: 'status',
                style: {
                    padding: '0.75rem',
                    background: 'var(--prism-gray-800)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    borderLeft: `4px solid ${getStatusColor()}`
                }
            }, [
                React.createElement('div', {
                    key: 'text',
                    style: {
                        fontSize: '0.9rem',
                        color: getStatusColor(),
                        fontWeight: '600'
                    }
                }, getStatusText())
            ]),
            error && React.createElement('div', {
                key: 'error',
                style: {
                    padding: '0.75rem',
                    background: 'var(--prism-danger-bg)',
                    color: 'var(--prism-danger)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }
            }, error)
        ]),

        // Main video area
        React.createElement('div', {
            key: 'video',
            style: {
                background: '#000',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden'
            }
        }, [
            React.createElement('video', {
                key: 'videoElement',
                ref: videoRef,
                autoPlay: true,
                muted: true,
                style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                }
            }),
            React.createElement('div', {
                key: 'controls',
                style: {
                    position: 'absolute',
                    bottom: '1rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '1rem'
                }
            }, [
                React.createElement('button', {
                    key: 'record',
                    onClick: isRecording ? stopRecording : startRecording,
                    disabled: recordingStatus === 'connecting' || recordingStatus === 'stopping',
                    style: {
                        padding: '0.75rem 2rem',
                        background: isRecording ? 'var(--prism-danger)' : 'var(--prism-success)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        opacity: (recordingStatus === 'connecting' || recordingStatus === 'stopping') ? 0.7 : 1
                    }
                }, isRecording ? '⏹️ Aufzeichnung stoppen' : '🔴 Aufzeichnung starten'),
                
                // Debug button for camera issues
                !isStreaming && React.createElement('button', {
                    key: 'debug',
                    onClick: async () => {
                        console.log('🔧 Debug: Re-initializing camera...');
                        await initializeStream();
                    },
                    style: {
                        padding: '0.75rem 1.5rem',
                        background: 'var(--prism-warning)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                    }
                }, '🔧 Kamera neu starten')
            ])
        ]),

        // Chat sidebar
        React.createElement('div', {
            key: 'chat',
            style: {
                background: 'var(--prism-card)',
                borderRadius: '12px',
                padding: '1rem',
                overflow: 'hidden'
            }
        }, [
            React.createElement('h3', {
                key: 'title',
                style: {
                    margin: '0 0 1rem 0',
                    fontSize: '1.2rem',
                    color: 'var(--prism-text)'
                }
            }, 'Live Chat'),
            React.createElement('div', {
                key: 'messages',
                style: {
                    height: 'calc(100% - 2rem)',
                    background: 'var(--prism-gray-800)',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontSize: '0.9rem',
                    color: 'var(--prism-gray-400)'
                }
            }, 'Chat wird geladen...')
        ]),

        // Stats footer
        React.createElement('div', {
            key: 'stats',
            style: {
                gridColumn: '1 / -1',
                background: 'var(--prism-card)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem'
            }
        }, [
            React.createElement('div', {
                key: 'viewers',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'var(--prism-purple)'
                    }
                }, stats.viewers),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: '0.9rem' }
                }, 'Zuschauer')
            ]),
            React.createElement('div', {
                key: 'duration',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'var(--prism-success)'
                    }
                }, stats.duration),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: '0.9rem' }
                }, 'Stream-Zeit')
            ]),
            React.createElement('div', {
                key: 'quality',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'var(--prism-info)'
                    }
                }, stats.quality),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: '0.9rem' }
                }, 'Qualität')
            ]),
            React.createElement('div', {
                key: 'recording',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'var(--prism-pink)'
                    }
                }, stats.recordingSize),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: '0.9rem' }
                }, 'Aufzeichnung')
            ])
        ])
    ]);
}

// Register as global component
window.StreamingCockpit = StreamingCockpit;
