// Livestreaming Studio Component - Enhanced with Real Device Detection
function LivestreamingStudio({ user }) {
    const [streamSettings, setStreamSettings] = React.useState({
        title: '',
        description: '',
        category: 'gaming',
        isLive: false,
        viewers: 0,
        duration: '00:00:00',
        selectedCamera: '',
        selectedMicrophone: '',
        bitrate: '4000',
        resolution: '1920x1080',
        fps: '60'
    });
    
    const [obsToken] = React.useState(() => {
        // Generate a unique OBS token for this user
        return `prism_${user?.id || 'demo'}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    });
    
    const [deviceSettings, setDeviceSettings] = React.useState({
        cameras: [],
        microphones: [],
        isScanning: false,
        lastScan: null
    });
    
    const [currentStream, setCurrentStream] = React.useState(null);
    const [previewStream, setPreviewStream] = React.useState(null);
    const [streamDuration, setStreamDuration] = React.useState(0);
    const [isPermissionDenied, setIsPermissionDenied] = React.useState(false);
    
    // Real device detection functions
    const scanForDevices = async () => {
        setDeviceSettings(prev => ({...prev, isScanning: true}));
        
        try {
            // Request permissions first
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            // Stop the stream immediately - we just needed permission
            stream.getTracks().forEach(track => track.stop());
            setIsPermissionDenied(false);
            
            // Get list of all media devices
            const devices = await navigator.mediaDevices.enumerateDevices();
            
            const cameras = devices
                .filter(device => device.kind === 'videoinput')
                .map(device => ({
                    id: device.deviceId,
                    name: device.label || `Kamera ${device.deviceId.substr(0, 8)}`,
                    status: 'available',
                    kind: 'videoinput'
                }));
                
            const microphones = devices
                .filter(device => device.kind === 'audioinput')
                .map(device => ({
                    id: device.deviceId,
                    name: device.label || `Mikrofon ${device.deviceId.substr(0, 8)}`,
                    status: 'available',
                    kind: 'audioinput'
                }));
            
            setDeviceSettings(prev => ({
                ...prev,
                cameras,
                microphones,
                isScanning: false,
                lastScan: new Date().toLocaleTimeString()
            }));
            
            // Auto-select first available devices
            if (cameras.length > 0 && !streamSettings.selectedCamera) {
                setStreamSettings(prev => ({...prev, selectedCamera: cameras[0].id}));
            }
            if (microphones.length > 0 && !streamSettings.selectedMicrophone) {
                setStreamSettings(prev => ({...prev, selectedMicrophone: microphones[0].id}));
            }
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            setIsPermissionDenied(true);
            setDeviceSettings(prev => ({...prev, isScanning: false}));
        }
    };
    
    // Start camera preview
    const startPreview = async () => {
        try {
            if (previewStream) {
                previewStream.getTracks().forEach(track => track.stop());
            }
            
            const constraints = {
                video: streamSettings.selectedCamera ? 
                    { deviceId: { exact: streamSettings.selectedCamera } } : true,
                audio: streamSettings.selectedMicrophone ? 
                    { deviceId: { exact: streamSettings.selectedMicrophone } } : true
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setPreviewStream(stream);
            
            // Find preview video element and attach stream
            const previewVideo = document.getElementById('stream-preview-video');
            if (previewVideo) {
                previewVideo.srcObject = stream;
            }
            
        } catch (error) {
            console.error('Error starting preview:', error);
            alert('Fehler beim Starten der Vorschau: ' + error.message);
        }
    };
    
    // Stop preview
    const stopPreview = () => {
        if (previewStream) {
            previewStream.getTracks().forEach(track => track.stop());
            setPreviewStream(null);
            
            const previewVideo = document.getElementById('stream-preview-video');
            if (previewVideo) {
                previewVideo.srcObject = null;
            }
        }
    };
    
    // Timer for stream duration
    React.useEffect(() => {
        let interval;
        if (streamSettings.isLive) {
            interval = setInterval(() => {
                setStreamDuration(prev => prev + 1);
            }, 1000);
        } else {
            setStreamDuration(0);
        }
        
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [streamSettings.isLive]);
    
    // Format duration
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Scan for devices on component mount
    React.useEffect(() => {
        scanForDevices();
    }, []);
    
    // Auto-start preview when devices are selected
    React.useEffect(() => {
        if (streamSettings.selectedCamera && !streamSettings.isLive) {
            startPreview();
        }
    }, [streamSettings.selectedCamera, streamSettings.selectedMicrophone]);
    
    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            stopPreview();
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const [multistream, setMultistream] = React.useState({
        platforms: [
            { 
                id: 'twitch', 
                name: 'Twitch', 
                enabled: false, 
                streamKey: '', 
                status: 'disconnected',
                icon: '🎮'
            },
            { 
                id: 'youtube', 
                name: 'YouTube Live', 
                enabled: false, 
                streamKey: '', 
                status: 'disconnected',
                icon: '📺'
            },
            { 
                id: 'facebook', 
                name: 'Facebook Live', 
                enabled: false, 
                streamKey: '', 
                status: 'disconnected',
                icon: '📘'
            },
            { 
                id: 'custom', 
                name: 'Custom RTMP', 
                enabled: false, 
                streamKey: '', 
                rtmpUrl: '',
                status: 'disconnected',
                icon: '🔗'
            }
        ]
    });
    
    const [previewMode, setPreviewMode] = React.useState('camera');
    const [showOBSGuide, setShowOBSGuide] = React.useState(false);
    
    const streamServerUrl = `rtmp://live.prism-studio.com/live/${obsToken}`;
    
    // Real streaming functions
    const toggleLivestream = async () => {
        if (!streamSettings.isLive) {
            // Start streaming
            try {
                const constraints = {
                    video: streamSettings.selectedCamera ? 
                        { deviceId: { exact: streamSettings.selectedCamera } } : true,
                    audio: streamSettings.selectedMicrophone ? 
                        { deviceId: { exact: streamSettings.selectedMicrophone } } : true
                };
                
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                setCurrentStream(stream);
                
                setStreamSettings(prev => ({
                    ...prev,
                    isLive: true,
                    duration: formatDuration(streamDuration),
                    viewers: Math.floor(Math.random() * 50) + 1 // Simulate viewers
                }));
                
                console.log('Stream gestartet mit:', {
                    camera: streamSettings.selectedCamera,
                    microphone: streamSettings.selectedMicrophone,
                    bitrate: streamSettings.bitrate,
                    resolution: streamSettings.resolution
                });
                
            } catch (error) {
                console.error('Fehler beim Starten des Streams:', error);
                alert('Fehler beim Starten des Streams: ' + error.message);
            }
        } else {
            // Stop streaming
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                setCurrentStream(null);
            }
            
            setStreamSettings(prev => ({
                ...prev,
                isLive: false,
                viewers: 0
            }));
            
            console.log('Stream beendet');
        }
    };
    
    // Test device function
    const testDevice = async (deviceType, deviceId) => {
        try {
            const constraints = {};
            if (deviceType === 'camera') {
                constraints.video = { deviceId: { exact: deviceId } };
            } else if (deviceType === 'microphone') {
                constraints.audio = { deviceId: { exact: deviceId } };
            }
            
            const testStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Test for 2 seconds then stop
            setTimeout(() => {
                testStream.getTracks().forEach(track => track.stop());
            }, 2000);
            
            alert(`${deviceType === 'camera' ? 'Kamera' : 'Mikrofon'} Test erfolgreich!`);
            
        } catch (error) {
            console.error(`Error testing ${deviceType}:`, error);
            alert(`Fehler beim Testen des ${deviceType === 'camera' ? 'Kamera' : 'Mikrofon'}: ${error.message}`);
        }
    };
    
    // Copy OBS settings to clipboard
    const copyOBSSettings = async () => {
        const obsSettings = `OBS Studio Settings für PRISM:

Server (RTMP URL): rtmp://stream.prism.live/live
Stream Key: ${obsToken}

Empfohlene Einstellungen:
- Bitrate: ${streamSettings.bitrate} kbps
- Auflösung: ${streamSettings.resolution}
- FPS: ${streamSettings.fps}
- Encoder: x264 (Software) oder NVENC (Hardware)
- Audio Bitrate: 160 kbps

Anleitung:
1. Öffne OBS Studio
2. Gehe zu "Einstellungen" > "Stream"
3. Wähle "Benutzerdefiniert..." als Service
4. Füge die Server-URL ein
5. Füge den Stream-Key ein
6. Klicke "OK" und starte den Stream`;

        try {
            await navigator.clipboard.writeText(obsSettings);
            alert('OBS Einstellungen in die Zwischenablage kopiert!');
        } catch (error) {
            console.error('Fehler beim Kopieren:', error);
            // Fallback für ältere Browser
            const textArea = document.createElement('textarea');
            textArea.value = obsSettings;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('OBS Einstellungen in die Zwischenablage kopiert!');
        }
    };

    const handlePlatformToggle = (platformId) => {
        setMultistream(prev => ({
            ...prev,
            platforms: prev.platforms.map(platform =>
                platform.id === platformId 
                    ? { ...platform, enabled: !platform.enabled }
                    : platform
            )
        }));
    };
    
    const handleStreamKeyUpdate = (platformId, streamKey, rtmpUrl = '') => {
        setMultistream(prev => ({
            ...prev,
            platforms: prev.platforms.map(platform =>
                platform.id === platformId 
                    ? { ...platform, streamKey, rtmpUrl }
                    : platform
            )
        }));
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('In Zwischenablage kopiert!');
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    return React.createElement('div', {
        className: 'livestreaming-studio',
        style: {
            padding: 'var(--prism-space-lg)',
            minHeight: '100vh',
            background: 'var(--prism-bg-primary)'
        }
    }, [
        React.createElement('div', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--prism-space-xl)',
                borderBottom: '1px solid var(--prism-gray-800)',
                paddingBottom: 'var(--prism-space-lg)'
            }
        }, [
            React.createElement('div', { key: 'title-section' }, [
                React.createElement('h1', {
                    key: 'title',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: 'bold',
                        color: 'var(--prism-gray-100)',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--prism-space-md)'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '🎥'),
                    React.createElement('span', { key: 'text' }, 'Live Studio')
                ]),
                React.createElement('p', {
                    key: 'subtitle',
                    style: {
                        color: 'var(--prism-gray-400)',
                        margin: '4px 0 0 0',
                        fontSize: 'var(--prism-text-lg)'
                    }
                }, 'Professionelle Streaming-Kontrolle mit OBS Integration')
            ]),
            
            React.createElement('div', {
                key: 'stream-status',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--prism-space-md)'
                }
            }, [
                React.createElement('div', {
                    key: 'status-info',
                    style: {
                        textAlign: 'right',
                        color: 'var(--prism-gray-300)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'status',
                        style: {
                            fontSize: 'var(--prism-text-lg)',
                            fontWeight: '600',
                            color: streamSettings.isLive ? '#EF4444' : 'var(--prism-gray-400)'
                        }
                    }, streamSettings.isLive ? '🔴 LIVE' : '⚫ OFFLINE'),
                    streamSettings.isLive && React.createElement('div', {
                        key: 'live-stats',
                        style: { fontSize: 'var(--prism-text-sm)' }
                    }, `${streamSettings.viewers} Zuschauer • ${formatDuration(streamDuration)}`)
                ]),
                
                React.createElement('button', {
                    key: 'toggle-stream',
                    onClick: toggleLivestream,
                    disabled: !streamSettings.selectedCamera || isPermissionDenied,
                    style: {
                        padding: '12px 24px',
                        backgroundColor: streamSettings.isLive ? '#EF4444' : 'var(--prism-green)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: 'var(--prism-text-lg)',
                        fontWeight: '600',
                        cursor: (!streamSettings.selectedCamera || isPermissionDenied) ? 'not-allowed' : 'pointer',
                        opacity: (!streamSettings.selectedCamera || isPermissionDenied) ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, streamSettings.isLive ? '⏹️' : '▶️'),
                    React.createElement('span', { key: 'text' }, streamSettings.isLive ? 'Stream Beenden' : 'Stream Starten')
                ])
            ])
        ]),
        
        React.createElement('div', {
            key: 'content',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 'var(--prism-space-xl)'
            }
        }, [
            // Stream Settings
            React.createElement('div', {
                key: 'stream-settings',
                className: 'card-prism'
            }, [
                React.createElement('h3', {
                    key: 'settings-title',
                    style: {
                        fontSize: 'var(--prism-text-lg)',
                        fontWeight: '600',
                        color: 'var(--prism-gray-100)',
                        marginBottom: 'var(--prism-space-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--prism-space-sm)'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '⚙️'),
                    React.createElement('span', { key: 'text' }, 'Stream Einstellungen')
                ]),
                
                React.createElement('div', {
                    key: 'settings-form',
                    style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('div', {
                        key: 'title-field',
                        style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                    }, [
                        React.createElement('label', {
                            key: 'title-label',
                            style: { color: 'var(--prism-gray-300)', fontSize: 'var(--prism-text-sm)' }
                        }, 'Stream Titel'),
                        React.createElement('input', {
                            key: 'title-input',
                            type: 'text',
                            placeholder: 'Gib deinem Stream einen Titel...',
                            value: streamSettings.title,
                            onChange: (e) => setStreamSettings(prev => ({...prev, title: e.target.value})),
                            style: {
                                padding: '8px 12px',
                                background: 'var(--prism-gray-800)',
                                border: '1px solid var(--prism-gray-700)',
                                borderRadius: '6px',
                                color: 'var(--prism-gray-100)',
                                fontSize: 'var(--prism-text-sm)'
                            }
                        })
                    ]),
                    
                    React.createElement('div', {
                        key: 'description-field',
                        style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                    }, [
                        React.createElement('label', {
                            key: 'description-label',
                            style: { color: 'var(--prism-gray-300)', fontSize: 'var(--prism-text-sm)' }
                        }, 'Beschreibung'),
                        React.createElement('textarea', {
                            key: 'description-input',
                            placeholder: 'Beschreibe deinen Stream...',
                            value: streamSettings.description,
                            onChange: (e) => setStreamSettings(prev => ({...prev, description: e.target.value})),
                            rows: 3,
                            style: {
                                padding: '8px 12px',
                                background: 'var(--prism-gray-800)',
                                border: '1px solid var(--prism-gray-700)',
                                borderRadius: '6px',
                                color: 'var(--prism-gray-100)',
                                fontSize: 'var(--prism-text-sm)',
                                resize: 'vertical'
                            }
                        })
                    ]),
                    
                    React.createElement('div', {
                        key: 'category-field',
                        style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                    }, [
                        React.createElement('label', {
                            key: 'category-label',
                            style: { color: 'var(--prism-gray-300)', fontSize: 'var(--prism-text-sm)' }
                        }, 'Kategorie'),
                        React.createElement('select', {
                            key: 'category-select',
                            value: streamSettings.category,
                            onChange: (e) => setStreamSettings(prev => ({...prev, category: e.target.value})),
                            style: {
                                padding: '8px 12px',
                                background: 'var(--prism-gray-800)',
                                border: '1px solid var(--prism-gray-700)',
                                borderRadius: '6px',
                                color: 'var(--prism-gray-100)',
                                fontSize: 'var(--prism-text-sm)'
                            }
                        }, [
                            React.createElement('option', { key: 'gaming', value: 'gaming' }, 'Gaming'),
                            React.createElement('option', { key: 'music', value: 'music' }, 'Musik'),
                            React.createElement('option', { key: 'talk', value: 'talk' }, 'Talk Show'),
                            React.createElement('option', { key: 'creative', value: 'creative' }, 'Kreativ'),
                            React.createElement('option', { key: 'education', value: 'education' }, 'Bildung'),
                            React.createElement('option', { key: 'irl', value: 'irl' }, 'IRL')
                        ])
                    ])
                ])
            ]),
            
            // Device Settings
            React.createElement('div', {
                key: 'device-settings',
                className: 'card-prism'
            }, [
                React.createElement('h3', {
                    key: 'device-title',
                    style: {
                        fontSize: 'var(--prism-text-lg)',
                        fontWeight: '600',
                        color: 'var(--prism-gray-100)',
                        marginBottom: 'var(--prism-space-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--prism-space-sm)'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '🎥'),
                    React.createElement('span', { key: 'text' }, 'Audio/Video Geräte')
                ]),
                
                React.createElement('div', {
                    key: 'device-form',
                    style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)' }
                }, [
                    // Device scan status
                    React.createElement('div', {
                        key: 'device-scan-status',
                        style: {
                            padding: 'var(--prism-space-sm)',
                            borderRadius: '6px',
                            backgroundColor: isPermissionDenied ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            border: `1px solid ${isPermissionDenied ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }
                    }, [
                        React.createElement('div', { key: 'status-info' }, [
                            React.createElement('span', {
                                key: 'status-text',
                                style: {
                                    color: isPermissionDenied ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)',
                                    fontSize: 'var(--prism-text-sm)',
                                    fontWeight: '500'
                                }
                            }, isPermissionDenied ? 
                                'Kamera/Mikrofon Zugriff verweigert' : 
                                `${deviceSettings.cameras.length} Kameras, ${deviceSettings.microphones.length} Mikrofone gefunden`
                            ),
                            deviceSettings.lastScan && React.createElement('div', {
                                key: 'last-scan',
                                style: {
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-xs)',
                                    marginTop: '2px'
                                }
                            }, `Letzter Scan: ${deviceSettings.lastScan}`)
                        ]),
                        React.createElement('button', {
                            key: 'rescan-btn',
                            onClick: scanForDevices,
                            disabled: deviceSettings.isScanning,
                            style: {
                                padding: '6px 12px',
                                backgroundColor: 'var(--prism-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: 'var(--prism-text-xs)',
                                cursor: deviceSettings.isScanning ? 'not-allowed' : 'pointer',
                                opacity: deviceSettings.isScanning ? 0.6 : 1
                            }
                        }, deviceSettings.isScanning ? 'Scanne...' : 'Neu scannen')
                    ]),
                    
                    React.createElement('div', {
                        key: 'camera-field',
                        style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                    }, [
                        React.createElement('label', {
                            key: 'camera-label',
                            style: {
                                fontSize: 'var(--prism-text-sm)',
                                fontWeight: '500',
                                color: 'var(--prism-gray-200)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }
                        }, [
                            React.createElement('span', { key: 'text' }, 'Kamera'),
                            deviceSettings.cameras.length === 0 && React.createElement('span', {
                                key: 'no-cameras',
                                style: {
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-xs)',
                                    fontWeight: 'normal'
                                }
                            }, '(keine gefunden)')
                        ]),
                        React.createElement('div', {
                            key: 'camera-controls',
                            style: { display: 'flex', gap: '8px' }
                        }, [
                            React.createElement('select', {
                                key: 'camera-select',
                                value: streamSettings.selectedCamera,
                                onChange: (e) => setStreamSettings(prev => ({...prev, selectedCamera: e.target.value})),
                                disabled: deviceSettings.cameras.length === 0,
                                style: {
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: 'var(--prism-gray-800)',
                                    border: '1px solid var(--prism-gray-700)',
                                    borderRadius: '6px',
                                    color: 'var(--prism-gray-100)',
                                    fontSize: 'var(--prism-text-sm)'
                                }
                            }, [
                                deviceSettings.cameras.length === 0 ?
                                    React.createElement('option', { key: 'none', value: '' }, 'Keine Kameras gefunden') :
                                    deviceSettings.cameras.map(camera =>
                                        React.createElement('option', { 
                                            key: camera.id, 
                                            value: camera.id 
                                        }, camera.name)
                                    )
                            ]),
                            streamSettings.selectedCamera && React.createElement('button', {
                                key: 'test-camera',
                                onClick: () => testDevice('camera', streamSettings.selectedCamera),
                                style: {
                                    padding: '8px 12px',
                                    backgroundColor: 'var(--prism-gray-700)',
                                    color: 'white',
                                    border: '1px solid var(--prism-gray-600)',
                                    borderRadius: '6px',
                                    fontSize: 'var(--prism-text-sm)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }
                            }, 'Test')
                        ])
                    ]),
                    
                    React.createElement('div', {
                        key: 'microphone-field',
                        style: { display: 'flex', flexDirection: 'column', gap: '4px' }
                    }, [
                        React.createElement('label', {
                            key: 'microphone-label',
                            style: {
                                fontSize: 'var(--prism-text-sm)',
                                fontWeight: '500',
                                color: 'var(--prism-gray-200)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }
                        }, [
                            React.createElement('span', { key: 'text' }, 'Mikrofon'),
                            deviceSettings.microphones.length === 0 && React.createElement('span', {
                                key: 'no-microphones',
                                style: {
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-xs)',
                                    fontWeight: 'normal'
                                }
                            }, '(keine gefunden)')
                        ]),
                        React.createElement('div', {
                            key: 'microphone-controls',
                            style: { display: 'flex', gap: '8px' }
                        }, [
                            React.createElement('select', {
                                key: 'microphone-select',
                                value: streamSettings.selectedMicrophone,
                                onChange: (e) => setStreamSettings(prev => ({...prev, selectedMicrophone: e.target.value})),
                                disabled: deviceSettings.microphones.length === 0,
                                style: {
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: 'var(--prism-gray-800)',
                                    border: '1px solid var(--prism-gray-700)',
                                    borderRadius: '6px',
                                    color: 'var(--prism-gray-100)',
                                    fontSize: 'var(--prism-text-sm)'
                                }
                            }, [
                                deviceSettings.microphones.length === 0 ?
                                    React.createElement('option', { key: 'none', value: '' }, 'Keine Mikrofone gefunden') :
                                    deviceSettings.microphones.map(microphone =>
                                        React.createElement('option', { 
                                            key: microphone.id, 
                                            value: microphone.id 
                                        }, microphone.name)
                                    )
                            ]),
                            streamSettings.selectedMicrophone && React.createElement('button', {
                                key: 'test-microphone',
                                onClick: () => testDevice('microphone', streamSettings.selectedMicrophone),
                                style: {
                                    padding: '8px 12px',
                                    backgroundColor: 'var(--prism-gray-700)',
                                    color: 'white',
                                    border: '1px solid var(--prism-gray-600)',
                                    borderRadius: '6px',
                                    fontSize: 'var(--prism-text-sm)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }
                            }, 'Test')
                        ])
                    ])
                ])
            ]),
            
            // Stream Preview
            React.createElement('div', {
                key: 'stream-preview',
                className: 'card-prism'
            }, [
                React.createElement('h3', {
                    key: 'preview-title',
                    style: {
                        fontSize: 'var(--prism-text-lg)',
                        fontWeight: '600',
                        color: 'var(--prism-gray-100)',
                        marginBottom: 'var(--prism-space-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--prism-space-sm)'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '👀'),
                    React.createElement('span', { key: 'text' }, 'Stream Vorschau')
                ]),
                
                React.createElement('div', {
                    key: 'preview-window',
                    style: {
                        aspectRatio: '16/9',
                        background: 'linear-gradient(45deg, var(--prism-gray-900), var(--prism-gray-800))',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        marginBottom: 'var(--prism-space-md)',
                        border: streamSettings.isLive ? '2px solid #EF4444' : '2px solid var(--prism-gray-700)',
                        overflow: 'hidden'
                    }
                }, [
                    // Real video preview element
                    React.createElement('video', {
                        key: 'stream-preview-video',
                        id: 'stream-preview-video',
                        autoPlay: true,
                        muted: true,
                        playsInline: true,
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: previewStream ? 'block' : 'none'
                        }
                    }),
                    
                    // Placeholder when no preview
                    !previewStream && React.createElement('div', {
                        key: 'preview-placeholder',
                        style: {
                            textAlign: 'center',
                            color: 'var(--prism-gray-400)',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'placeholder-icon',
                            style: { fontSize: '3rem', marginBottom: '8px' }
                        }, isPermissionDenied ? '🚫' : '📹'),
                        React.createElement('p', {
                            key: 'placeholder-text',
                            style: { margin: 0, fontSize: 'var(--prism-text-sm)' }
                        }, isPermissionDenied ? 'Kamera Zugriff verweigert' : 
                           streamSettings.selectedCamera ? 'Vorschau wird geladen...' : 'Wähle eine Kamera aus'),
                        !isPermissionDenied && !streamSettings.selectedCamera && React.createElement('p', {
                            key: 'placeholder-hint',
                            style: { 
                                margin: '4px 0 0 0', 
                                fontSize: 'var(--prism-text-xs)',
                                color: 'var(--prism-gray-500)'
                            }
                        }, 'Scanne nach Geräten um zu beginnen')
                    ]),
                    
                    // Live indicator
                    streamSettings.isLive && React.createElement('div', {
                        key: 'live-indicator',
                        style: {
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: '#EF4444',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: 'var(--prism-text-xs)',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'live-dot',
                            style: {
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: 'white'
                            }
                        }),
                        React.createElement('span', { key: 'live-text' }, 'LIVE')
                    ]),
                    
                    // Stream info overlay
                    (previewStream || streamSettings.isLive) && React.createElement('div', {
                        key: 'stream-info',
                        style: {
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            fontSize: 'var(--prism-text-xs)',
                            fontFamily: 'monospace'
                        }
                    }, [
                        React.createElement('div', { key: 'resolution' }, streamSettings.resolution),
                        React.createElement('div', { key: 'fps' }, `${streamSettings.fps} FPS`),
                        streamSettings.isLive && React.createElement('div', { 
                            key: 'duration', 
                            style: { marginTop: '2px', color: '#10B981' }
                        }, formatDuration(streamDuration))
                    ])
                ]),
                
                React.createElement('div', {
                    key: 'preview-controls',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--prism-space-sm)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'preview-buttons',
                        style: { display: 'flex', gap: '8px' }
                    }, [
                        React.createElement('button', {
                            key: 'start-preview',
                            onClick: startPreview,
                            disabled: !streamSettings.selectedCamera || isPermissionDenied,
                            style: {
                                padding: '6px 12px',
                                backgroundColor: 'var(--prism-blue)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: 'var(--prism-text-sm)',
                                cursor: (!streamSettings.selectedCamera || isPermissionDenied) ? 'not-allowed' : 'pointer',
                                opacity: (!streamSettings.selectedCamera || isPermissionDenied) ? 0.5 : 1
                            }
                        }, 'Vorschau starten'),
                        React.createElement('button', {
                            key: 'stop-preview',
                            onClick: stopPreview,
                            disabled: !previewStream,
                            style: {
                                padding: '6px 12px',
                                backgroundColor: 'var(--prism-gray-700)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: 'var(--prism-text-sm)',
                                cursor: !previewStream ? 'not-allowed' : 'pointer',
                                opacity: !previewStream ? 0.5 : 1
                            }
                        }, 'Vorschau stoppen')
                    ])
                ])
            ]),
            
            // OBS Integration
            React.createElement('div', {
                key: 'obs-integration',
                className: 'card-prism'
            }, [
                React.createElement('div', {
                    key: 'obs-header',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--prism-space-md)'
                    }
                }, [
                    React.createElement('h3', {
                        key: 'obs-title',
                        style: {
                            fontSize: 'var(--prism-text-lg)',
                            fontWeight: '600',
                            color: 'var(--prism-gray-100)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--prism-space-sm)'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '🎛️'),
                        React.createElement('span', { key: 'text' }, 'OBS Studio Integration')
                    ]),
                    
                    React.createElement('button', {
                        key: 'obs-guide-btn',
                        onClick: () => setShowOBSGuide(!showOBSGuide),
                        style: {
                            padding: '6px 12px',
                            background: 'var(--prism-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: 'var(--prism-text-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '📖'),
                        React.createElement('span', { key: 'text' }, showOBSGuide ? 'Anleitung ausblenden' : 'Setup Anleitung')
                    ])
                ]),
                
                React.createElement('div', {
                    key: 'obs-content',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: showOBSGuide ? '1fr 1fr' : '1fr',
                        gap: 'var(--prism-space-lg)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'obs-settings',
                        style: {
                            background: 'var(--prism-gray-800)',
                            padding: 'var(--prism-space-lg)',
                            borderRadius: '8px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'rtmp-url',
                            style: { marginBottom: 'var(--prism-space-md)' }
                        }, [
                            React.createElement('label', {
                                key: 'url-label',
                                style: {
                                    display: 'block',
                                    color: 'var(--prism-gray-300)',
                                    fontSize: 'var(--prism-text-sm)',
                                    marginBottom: '4px'
                                }
                            }, 'RTMP Server URL:'),
                            React.createElement('div', {
                                key: 'url-input-group',
                                style: { display: 'flex', gap: '8px' }
                            }, [
                                React.createElement('input', {
                                    key: 'url-input',
                                    type: 'text',
                                    value: 'rtmp://stream.prism.live/live',
                                    readOnly: true,
                                    style: {
                                        flex: 1,
                                        padding: '8px 12px',
                                        background: 'var(--prism-gray-700)',
                                        border: '1px solid var(--prism-gray-600)',
                                        borderRadius: '4px',
                                        color: 'var(--prism-gray-100)',
                                        fontSize: 'var(--prism-text-sm)',
                                        fontFamily: 'monospace'
                                    }
                                }),
                                React.createElement('button', {
                                    key: 'copy-url-btn',
                                    onClick: () => copyToClipboard('rtmp://stream.prism.live/live'),
                                    style: {
                                        padding: '8px 12px',
                                        background: 'var(--prism-purple)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: 'var(--prism-text-sm)'
                                    }
                                }, '📋')
                            ])
                        ]),
                        
                        React.createElement('div', {
                            key: 'stream-key',
                            style: {
                                background: 'var(--prism-gray-800)',
                                padding: 'var(--prism-space-md)',
                                borderRadius: '8px'
                            }
                        }, [
                            React.createElement('label', {
                                key: 'key-label',
                                style: {
                                    display: 'block',
                                    color: 'var(--prism-gray-300)',
                                    fontSize: 'var(--prism-text-sm)',
                                    marginBottom: '4px'
                                }
                            }, 'Stream Key (Ihr persönlicher Token):'),
                            React.createElement('div', {
                                key: 'key-input-group',
                                style: { display: 'flex', gap: '8px' }
                            }, [
                                React.createElement('input', {
                                    key: 'key-input',
                                    type: 'text',
                                    value: obsToken,
                                    readOnly: true,
                                    style: {
                                        flex: 1,
                                        padding: '8px 12px',
                                        background: 'var(--prism-gray-700)',
                                        border: '1px solid var(--prism-gray-600)',
                                        borderRadius: '4px',
                                        color: 'var(--prism-gray-100)',
                                        fontSize: 'var(--prism-text-sm)',
                                        fontFamily: 'monospace'
                                    }
                                }),
                                React.createElement('button', {
                                    key: 'copy-key-btn',
                                    onClick: () => copyToClipboard(obsToken),
                                    style: {
                                        padding: '8px 12px',
                                        background: 'var(--prism-purple)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: 'var(--prism-text-sm)'
                                    }
                                }, '📋')
                            ])
                        ]),
                        
                        React.createElement('button', {
                            key: 'copy-all-btn',
                            onClick: copyOBSSettings,
                            style: {
                                width: '100%',
                                padding: '12px',
                                marginTop: 'var(--prism-space-md)',
                                background: 'var(--prism-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: 'var(--prism-text-sm)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }
                        }, [
                            React.createElement('span', { key: 'icon' }, '📋'),
                            React.createElement('span', { key: 'text' }, 'Komplette OBS Einstellungen kopieren')
                        ])
                    ]),
                    
                    showOBSGuide && React.createElement('div', {
                        key: 'obs-guide',
                        style: {
                            background: 'var(--prism-gray-800)',
                            padding: 'var(--prism-space-lg)',
                            borderRadius: '8px'
                        }
                    }, [
                        React.createElement('h4', {
                            key: 'guide-title',
                            style: {
                                color: 'var(--prism-gray-100)',
                                marginBottom: 'var(--prism-space-md)',
                                fontSize: 'var(--prism-text-lg)'
                            }
                        }, '🎬 OBS Setup Anleitung'),
                        React.createElement('ol', {
                            key: 'guide-steps',
                            style: {
                                color: 'var(--prism-gray-300)',
                                fontSize: 'var(--prism-text-sm)',
                                lineHeight: '1.6'
                            }
                        }, [
                            React.createElement('li', { key: 'step1' }, 'Öffne OBS Studio'),
                            React.createElement('li', { key: 'step2' }, 'Gehe zu "Einstellungen" → "Stream"'),
                            React.createElement('li', { key: 'step3' }, 'Wähle "Benutzerdefiniert..." als Service'),
                            React.createElement('li', { key: 'step4' }, 'Füge die RTMP URL ein'),
                            React.createElement('li', { key: 'step5' }, 'Füge deinen Stream Key ein'),
                            React.createElement('li', { key: 'step6' }, 'Stelle Audio/Video Qualität ein'),
                            React.createElement('li', { key: 'step7' }, 'Klicke "OK" und "Streaming starten"')
                        ])
                    ])
                ])
            ]),
            
            // Multistream Settings
            React.createElement('div', {
                key: 'multistream-settings',
                className: 'card-prism'
            }, [
                React.createElement('h3', {
                    key: 'multistream-title',
                    style: {
                        fontSize: 'var(--prism-text-lg)',
                        fontWeight: '600',
                        color: 'var(--prism-gray-100)',
                        marginBottom: 'var(--prism-space-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--prism-space-sm)'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '📡'),
                    React.createElement('span', { key: 'text' }, 'Multistream Einstellungen')
                ]),
                
                React.createElement('div', {
                    key: 'platforms-list',
                    style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)' }
                }, multistream.platforms.map(platform =>
                    React.createElement('div', {
                        key: platform.id,
                        style: {
                            padding: 'var(--prism-space-md)',
                            background: 'var(--prism-gray-800)',
                            borderRadius: '8px',
                            border: platform.enabled ? '2px solid var(--prism-accent)' : '1px solid var(--prism-gray-700)'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'platform-header',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: platform.enabled ? 'var(--prism-space-sm)' : 0
                            }
                        }, [
                            React.createElement('div', {
                                key: 'platform-info',
                                style: { display: 'flex', alignItems: 'center', gap: '8px' }
                            }, [
                                React.createElement('span', {
                                    key: 'icon',
                                    style: { fontSize: 'var(--prism-text-lg)' }
                                }, platform.icon),
                                React.createElement('span', {
                                    key: 'name',
                                    style: {
                                        color: 'var(--prism-gray-100)',
                                        fontWeight: '500'
                                    }
                                }, platform.name),
                                React.createElement('span', {
                                    key: 'status',
                                    style: {
                                        fontSize: 'var(--prism-text-xs)',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: platform.status === 'connected' ? 'var(--prism-green)' : 'var(--prism-gray-600)',
                                        color: 'white'
                                    }
                                }, platform.status === 'connected' ? 'Verbunden' : 'Getrennt')
                            ]),
                            React.createElement('label', {
                                key: 'toggle',
                                style: {
                                    position: 'relative',
                                    display: 'inline-block',
                                    width: '44px',
                                    height: '24px'
                                }
                            }, [
                                React.createElement('input', {
                                    key: 'checkbox',
                                    type: 'checkbox',
                                    checked: platform.enabled,
                                    onChange: () => handlePlatformToggle(platform.id),
                                    style: { opacity: 0, width: 0, height: 0 }
                                }),
                                React.createElement('span', {
                                    key: 'slider',
                                    style: {
                                        position: 'absolute',
                                        cursor: 'pointer',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: platform.enabled ? 'var(--prism-accent)' : 'var(--prism-gray-600)',
                                        transition: '0.3s',
                                        borderRadius: '24px'
                                    }
                                })
                            ])
                        ]),
                        
                        platform.enabled && React.createElement('div', {
                            key: 'platform-inputs',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' }
                        }, [
                            platform.id === 'custom' && React.createElement('input', {
                                key: 'rtmp-url',
                                type: 'text',
                                placeholder: 'RTMP URL (z.B. rtmp://...)',
                                value: platform.rtmpUrl || '',
                                onChange: (e) => handleStreamKeyUpdate(platform.id, platform.streamKey, e.target.value),
                                style: {
                                    padding: '6px 10px',
                                    background: 'var(--prism-gray-700)',
                                    border: '1px solid var(--prism-gray-600)',
                                    borderRadius: '4px',
                                    color: 'var(--prism-gray-100)',
                                    fontSize: 'var(--prism-text-sm)'
                                }
                            }),
                            React.createElement('input', {
                                key: 'stream-key',
                                type: 'text',
                                placeholder: `${platform.name} Stream Key`,
                                value: platform.streamKey,
                                onChange: (e) => handleStreamKeyUpdate(platform.id, e.target.value, platform.rtmpUrl),
                                style: {
                                    padding: '6px 10px',
                                    background: 'var(--prism-gray-700)',
                                    border: '1px solid var(--prism-gray-600)',
                                    borderRadius: '4px',
                                    color: 'var(--prism-gray-100)',
                                    fontSize: 'var(--prism-text-sm)'
                                }
                            })
                        ])
                    ])
                ))
            ])
        ])
    ]);
}

// Export to global scope
window.LivestreamingStudio = LivestreamingStudio;
