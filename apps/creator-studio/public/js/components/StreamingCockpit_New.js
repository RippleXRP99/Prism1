// StreamingCockpit Component - Server Recording Only
function StreamingCockpit({ settings }) {
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

    React.useEffect(() => {
        initializeStream();
        setupEventListeners();

        return () => {
            cleanup();
        };
    }, []);

    const setupEventListeners = () => {
        // Listen for server recording events
        document.addEventListener('serverRecordingStarted', handleRecordingStarted);
        document.addEventListener('serverRecordingComplete', handleRecordingComplete);
        document.addEventListener('serverRecordingError', handleRecordingError);
    };

    const initializeStream = async () => {
        try {
            console.log('🎥 Initializing camera and microphone...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: settings.camera,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    deviceId: settings.microphone,
                    noiseSuppression: true,
                    echoCancellation: true
                }
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                console.log('✅ Stream initialized successfully');
            }

            setIsStreaming(true);

        } catch (error) {
            console.error('❌ Failed to initialize stream:', error);
            setError('Kamera oder Mikrofon konnte nicht initialisiert werden');
        }
    };

    const startRecording = async () => {
        if (!streamRef.current) {
            setError('Stream nicht verfügbar');
            return;
        }

        try {
            console.log('🎬 Starting server recording...');
            setRecordingStatus('connecting');
            setError(null);

            // Initialize server recorder
            if (!recorderRef.current) {
                recorderRef.current = new window.ServerRecorder();
            }

            // Start recording with server
            const session = await recorderRef.current.startRecording(streamRef.current, {
                quality: '1080p',
                isLive: true
            });

            setRecordingSession(session);
            setRecordingStatus('recording');
            setIsRecording(true);

            console.log('✅ Server recording started successfully');

        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            setError('Aufzeichnung konnte nicht gestartet werden: ' + error.message);
            setRecordingStatus('error');
        }
    };

    const stopRecording = async () => {
        if (!recorderRef.current || !isRecording) {
            return;
        }

        try {
            console.log('🛑 Stopping server recording...');
            setRecordingStatus('stopping');

            const result = await recorderRef.current.stopRecording();
            
            console.log('✅ Recording stopped successfully:', result);
            setRecordingStatus('completed');
            setIsRecording(false);

            // Reload media library
            setTimeout(() => {
                if (window.mediaLibrary && typeof window.mediaLibrary.loadStreamRecordings === 'function') {
                    window.mediaLibrary.loadStreamRecordings();
                }
            }, 1000);

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
                }, isRecording ? '⏹️ Aufzeichnung stoppen' : '🔴 Aufzeichnung starten')
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
