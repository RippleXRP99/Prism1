// Livestreaming Studio Component - Enhanced with Real Device Detection
function LivestreamingStudio({ user }) {
    // Add CSS animations for the pulse effect
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.02); }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

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
    
    // Stream sharing between windows
    const [streamChannel] = React.useState(() => {
        if (typeof BroadcastChannel !== 'undefined') {
            return new BroadcastChannel('prism-stream-channel');
        }
        return null;
    });
    
    // Live Studio window reference
    const [liveStudioWindow, setLiveStudioWindow] = React.useState(null);
    
    // Content Planner Widget State
    const [todaysTask, setTodaysTask] = React.useState(null);
    const [contentPlannerData, setContentPlannerData] = React.useState([]);
    
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
    
    // Content Planner Helper Functions
    const getCategoryColor = (category) => {
        const colors = {
            'stream': '#ef4444',
            'video': '#3b82f6',
            'short': '#10b981',
            'podcast': '#8b5cf6',
            'post': '#f59e0b',
            'collab': '#06b6d4',
            'tutorial': '#84cc16',
            'review': '#f97316'
        };
        return colors[category] || '#6b7280';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'stream': 'Live Stream',
            'video': 'Video',
            'short': 'Short/Clip',
            'podcast': 'Podcast',
            'post': 'Social Post',
            'collab': 'Kollaboration',
            'tutorial': 'Tutorial',
            'review': 'Review'
        };
        return labels[category] || category;
    };

    const getStatusColor = (status) => {
        const colors = {
            'idea': '#6b7280',
            'planned': '#3b82f6',
            'in_progress': '#f59e0b',
            'ready': '#10b981',
            'published': '#8b5cf6',
            'archived': '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'idea': 'Idee',
            'planned': 'Geplant',
            'in_progress': 'In Bearbeitung',
            'ready': 'Bereit',
            'published': 'Veröffentlicht',
            'archived': 'Archiviert'
        };
        return labels[status] || status;
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
            
            // Share stream with Live Studio via BroadcastChannel
            if (streamChannel) {
                streamChannel.postMessage({
                    type: 'STREAM_STARTED',
                    streamSettings: streamSettings,
                    streamId: stream.id
                });
            }
            
            // Store reference for Live Studio
            window.prismSharedStream = stream;
            
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
            
            // Notify Live Studio that stream stopped
            if (streamChannel) {
                streamChannel.postMessage({
                    type: 'STREAM_STOPPED'
                });
            }
            
            // Clear shared stream reference
            window.prismSharedStream = null;
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

    // Content Planner Data Loading
    React.useEffect(() => {
        const loadContentPlannerData = () => {
            try {
                const saved = localStorage.getItem('prism-content-plan');
                const contentData = saved ? JSON.parse(saved) : [];
                setContentPlannerData(contentData);
                
                // Find today's task
                const today = new Date().toISOString().split('T')[0];
                const todaysItem = contentData.find(item => {
                    const itemDate = new Date(item.scheduledDate).toISOString().split('T')[0];
                    return itemDate === today && item.status !== 'published' && item.status !== 'archived';
                });
                
                setTodaysTask(todaysItem);
            } catch (error) {
                console.error('Error loading content planner data:', error);
            }
        };

        loadContentPlannerData();
        
        // Update every minute to check for changes
        const interval = setInterval(loadContentPlannerData, 60000);
        
        return () => clearInterval(interval);
    }, []);

    // Listen for messages from Live Studio page
    React.useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'streamEnded') {
                setStreamSettings(prev => ({
                    ...prev,
                    isLive: false,
                    viewers: 0
                }));
                
                if (currentStream) {
                    currentStream.getTracks().forEach(track => track.stop());
                    setCurrentStream(null);
                }
                
                console.log('Stream beendet von Live Studio');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [currentStream]);

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
                
                // Share stream with Live Studio immediately
                window.prismSharedStream = stream;
                
                setStreamSettings(prev => ({
                    ...prev,
                    isLive: true,
                    duration: formatDuration(streamDuration),
                    viewers: Math.floor(Math.random() * 50) + 1 // Simulate viewers
                }));
                
                // Store stream settings for Live page
                localStorage.setItem('streamTitle', streamSettings.title);
                localStorage.setItem('streamDescription', streamSettings.description);
                localStorage.setItem('streamCategory', streamSettings.category);
                localStorage.setItem('selectedCamera', streamSettings.selectedCamera);
                localStorage.setItem('selectedMicrophone', streamSettings.selectedMicrophone);
                localStorage.setItem('streamBitrate', streamSettings.bitrate);
                localStorage.setItem('streamResolution', streamSettings.resolution);
                localStorage.setItem('streamFPS', streamSettings.fps);
                localStorage.setItem('userData', JSON.stringify(user));
                
                // Notify Live Studio via BroadcastChannel
                if (streamChannel) {
                    streamChannel.postMessage({
                        type: 'LIVE_STREAM_STARTED',
                        streamSettings: {
                            ...streamSettings,
                            isLive: true,
                            duration: formatDuration(streamDuration),
                            viewers: Math.floor(Math.random() * 50) + 1
                        },
                        streamId: stream.id
                    });
                }
                
                // Open Live page in new tab
                const livePageUrl = `live.html?title=${encodeURIComponent(streamSettings.title)}&resolution=${streamSettings.resolution}&fps=${streamSettings.fps}&bitrate=${streamSettings.bitrate}`;
                const newWindow = window.open(livePageUrl, 'live-studio', 'width=1920,height=1080,scrollbars=no,resizable=yes');
                setLiveStudioWindow(newWindow);
                
                console.log('Live Studio geöffnet in neuem Tab');
                
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
            
            // Clear shared stream
            window.prismSharedStream = null;
            
            // Notify Live Studio that stream ended
            if (streamChannel) {
                streamChannel.postMessage({
                    type: 'LIVE_STREAM_STOPPED'
                });
            }
            
            // Close Live Studio window if it's open
            if (liveStudioWindow && !liveStudioWindow.closed) {
                liveStudioWindow.close();
                setLiveStudioWindow(null);
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

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('In Zwischenablage kopiert!');
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    // Open Live Studio function
    const openLiveStudio = () => {
        if (!previewStream && !streamSettings.isLive) {
            alert('Bitte starte zuerst die Vorschau oder den Live-Stream, um das Live Studio zu verwenden.');
            return;
        }
        
        // Store current stream settings for Live Studio
        localStorage.setItem('streamTitle', streamSettings.title || 'Live Stream');
        localStorage.setItem('streamDescription', streamSettings.description || '');
        localStorage.setItem('streamCategory', streamSettings.category);
        localStorage.setItem('selectedCamera', streamSettings.selectedCamera);
        localStorage.setItem('selectedMicrophone', streamSettings.selectedMicrophone);
        localStorage.setItem('streamBitrate', streamSettings.bitrate);
        localStorage.setItem('streamResolution', streamSettings.resolution);
        localStorage.setItem('streamFPS', streamSettings.fps);
        localStorage.setItem('userData', JSON.stringify(user));
        
        // Open Live Studio in new window
        const livePageUrl = `live.html?title=${encodeURIComponent(streamSettings.title || 'Live Stream')}&resolution=${streamSettings.resolution}&fps=${streamSettings.fps}&bitrate=${streamSettings.bitrate}`;
        const newWindow = window.open(livePageUrl, 'live-studio', 'width=1920,height=1080,scrollbars=no,resizable=yes');
        
        if (newWindow) {
            setLiveStudioWindow(newWindow);
            
            // Notify the new window about the existing stream
            setTimeout(() => {
                if (streamChannel) {
                    streamChannel.postMessage({
                        type: previewStream ? 'STREAM_STARTED' : 'LIVE_STREAM_STARTED',
                        streamSettings: streamSettings,
                        streamId: (previewStream || currentStream)?.id
                    });
                }
            }, 1000);
        }
    };

    // Content Planner Component Render Function
    const renderContentPlannerComponent = () => {
        return React.createElement('div', {
            className: 'content-planner-component',
            style: {
                backgroundColor: 'var(--prism-bg-secondary)',
                border: '1px solid var(--prism-border)',
                borderRadius: '12px',
                padding: '20px',
                color: 'var(--prism-text-primary)'
            }
        }, [
            // Header
            React.createElement('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    borderBottom: '1px solid var(--prism-border)',
                    paddingBottom: '12px'
                }
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        margin: 0,
                        color: 'var(--prism-primary)',
                        fontSize: '18px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '📅'),
                    React.createElement('span', { key: 'text' }, 'Heutige Aufgabe')
                ]),
                React.createElement('button', {
                    key: 'refresh',
                    onClick: () => {
                        const saved = localStorage.getItem('prism-content-plan');
                        const contentData = saved ? JSON.parse(saved) : [];
                        setContentPlannerData(contentData);
                        const today = new Date().toISOString().split('T')[0];
                        const todaysItem = contentData.find(item => {
                            const itemDate = new Date(item.scheduledDate).toISOString().split('T')[0];
                            return itemDate === today && item.status !== 'published' && item.status !== 'archived';
                        });
                        setTodaysTask(todaysItem);
                    },
                    style: {
                        background: 'var(--prism-bg-tertiary)',
                        border: '1px solid var(--prism-border)',
                        color: 'var(--prism-text-secondary)',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '🔄'),
                    React.createElement('span', { key: 'text' }, 'Aktualisieren')
                ]),
            ]),
            
            // Content
            React.createElement('div', {
                key: 'content'
            }, todaysTask ? [
                // Task Card
                React.createElement('div', {
                    key: 'task-card',
                    style: {
                        backgroundColor: 'var(--prism-bg-tertiary)',
                        border: '1px solid var(--prism-border)',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '16px'
                    }
                }, [
                    // Task Header
                    React.createElement('div', {
                        key: 'task-header',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '12px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'task-info',
                            style: { flex: 1 }
                        }, [
                            React.createElement('h4', {
                                key: 'title',
                                style: { 
                                    margin: '0 0 8px 0',
                                    color: 'var(--prism-text-primary)',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }
                            }, todaysTask.title),
                            React.createElement('div', {
                                key: 'meta',
                                style: {
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center'
                                }
                            }, [
                                React.createElement('span', {
                                    key: 'category',
                                    style: { 
                                        backgroundColor: getCategoryColor(todaysTask.category),
                                        color: '#fff',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }
                                }, getCategoryLabel(todaysTask.category)),
                                todaysTask.scheduledTime && React.createElement('span', {
                                    key: 'time',
                                    style: { 
                                        color: 'var(--prism-text-secondary)',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }
                                }, [
                                    React.createElement('span', { key: 'icon' }, '🕐'),
                                    React.createElement('span', { key: 'text' }, todaysTask.scheduledTime)
                                ]),
                            ])
                        ]),
                        React.createElement('span', {
                            key: 'status',
                            style: {
                                backgroundColor: getStatusColor(todaysTask.status),
                                color: '#fff',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '500'
                            }
                        }, getStatusLabel(todaysTask.status))
                    ]),
                    
                    // Description
                    todaysTask.description && React.createElement('div', {
                        key: 'description',
                        style: { 
                            color: 'var(--prism-text-secondary)',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            marginBottom: '16px',
                            padding: '12px',
                            backgroundColor: 'var(--prism-bg-primary)',
                            borderRadius: '6px',
                            border: '1px solid var(--prism-border)'
                        }
                    }, todaysTask.description),
                    
                    // Action Buttons
                    React.createElement('div', {
                        key: 'actions',
                        style: { 
                            display: 'flex',
                            gap: '12px'
                        }
                    }, [
                        React.createElement('button', {
                            key: 'start',
                            onClick: () => {
                                // Update task status to "in_progress"
                                const contentData = [...contentPlannerData];
                                const taskIndex = contentData.findIndex(item => item.id === todaysTask.id);
                                if (taskIndex !== -1) {
                                    contentData[taskIndex].status = 'in_progress';
                                    localStorage.setItem('prism-content-plan', JSON.stringify(contentData));
                                    setContentPlannerData(contentData);
                                    setTodaysTask({...todaysTask, status: 'in_progress'});
                                }
                            },
                            disabled: todaysTask.status === 'in_progress' || todaysTask.status === 'ready',
                            style: {
                                flex: 1,
                                padding: '10px 16px',
                                backgroundColor: todaysTask.status === 'planned' ? 'var(--prism-success)' : 'var(--prism-bg-tertiary)',
                                color: todaysTask.status === 'planned' ? '#fff' : 'var(--prism-text-secondary)',
                                border: todaysTask.status === 'planned' ? 'none' : '1px solid var(--prism-border)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: todaysTask.status === 'planned' ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }
                        }, [
                            React.createElement('span', { 
                                key: 'icon' 
                            }, todaysTask.status === 'planned' ? '▶️' : todaysTask.status === 'in_progress' ? '⏸️' : '✅'),
                            React.createElement('span', { 
                                key: 'text' 
                            }, todaysTask.status === 'planned' ? 'Starten' : todaysTask.status === 'in_progress' ? 'Läuft...' : 'Bereit')
                        ]),
                        React.createElement('button', {
                            key: 'complete',
                            onClick: () => {
                                // Update task status to "ready" 
                                const contentData = [...contentPlannerData];
                                const taskIndex = contentData.findIndex(item => item.id === todaysTask.id);
                                if (taskIndex !== -1) {
                                    contentData[taskIndex].status = 'ready';
                                    localStorage.setItem('prism-content-plan', JSON.stringify(contentData));
                                    setContentPlannerData(contentData);
                                    setTodaysTask({...todaysTask, status: 'ready'});
                                }
                            },
                            disabled: todaysTask.status === 'planned',
                            style: {
                                flex: 1,
                                padding: '10px 16px',
                                backgroundColor: todaysTask.status === 'in_progress' ? 'var(--prism-primary)' : 'var(--prism-bg-tertiary)',
                                color: todaysTask.status === 'in_progress' ? '#fff' : 'var(--prism-text-secondary)',
                                border: todaysTask.status === 'in_progress' ? 'none' : '1px solid var(--prism-border)',
                                borderRadius: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: todaysTask.status === 'in_progress' ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }
                        }, [
                            React.createElement('span', { key: 'icon' }, '✓'),
                            React.createElement('span', { key: 'text' }, 'Abschließen')
                        ])
                    ])
                ])
            ] : [
                // No Task State
                React.createElement('div', {
                    key: 'no-task',
                    style: { 
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: 'var(--prism-text-secondary)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: { 
                            fontSize: '48px', 
                            marginBottom: '16px',
                            opacity: 0.6
                        }
                    }, '📝'),
                    React.createElement('div', {
                        key: 'message',
                        style: { 
                            fontSize: '16px',
                            marginBottom: '16px',
                            color: 'var(--prism-text-primary)'
                        }
                    }, 'Keine Aufgaben für heute geplant'),
                    React.createElement('div', {
                        key: 'submessage',
                        style: { 
                            fontSize: '14px',
                            marginBottom: '20px'
                        }
                    }, 'Erstelle neue Inhalte im Content Planner'),
                    React.createElement('button', {
                        key: 'open-planner',
                        onClick: () => {
                            // Switch to Content Planner tab
                            if (typeof setActiveTab === 'function') {
                                setActiveTab('content-planner');
                            }
                        },
                        style: {
                            padding: '8px 16px',
                            backgroundColor: 'var(--prism-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            margin: '0 auto'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '📅'),
                        React.createElement('span', { key: 'text' }, 'Content Planner öffnen')
                    ])
                ])
            ])
        ]);
    };

    const elements = [
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
                }, 'Professionelle Streaming-Kontrolle mit echten Geräten')
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
                ]),
                
                React.createElement('button', {
                    key: 'open-live-studio',
                    onClick: openLiveStudio,
                    style: {
                        padding: '12px 24px',
                        backgroundColor: 'var(--prism-blue)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: 'var(--prism-text-lg)',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginLeft: '8px'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '🎬'),
                    React.createElement('span', { key: 'text' }, 'Live Studio')
                ])
            ])
        ]),
        
        React.createElement('div', {
            key: 'content',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--prism-space-xl)'
            }
        }, [


            React.createElement('div', {
                key: 'settings-grid',
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
            
            // Content Planner Component
            React.createElement('div', {
                key: 'content-planner',
                className: 'card-prism'
            }, renderContentPlannerComponent())
            ])
        ])
    ];

    return React.createElement('div', {
        className: 'livestreaming-studio',
        style: {
            padding: 'var(--prism-space-lg)',
            minHeight: '100vh',
            background: 'var(--prism-bg-primary)'
        }
    }, elements);
}
// Export to global scope
window.LivestreamingStudio = LivestreamingStudio;
