// Live Studio Component - Dedicated Live Streaming Page
function LiveStudio({ user, streamSettings: initialStreamSettings }) {
    const [streamSettings, setStreamSettings] = React.useState({
        title: '',
        description: '',
        category: 'gaming',
        isLive: true, // Always live on this page
        viewers: Math.floor(Math.random() * 50) + 1,
        duration: '00:00:00',
        selectedCamera: '',
        selectedMicrophone: '',
        bitrate: '4000',
        resolution: '1920x1080',
        fps: '60',
        ...initialStreamSettings
    });
    
    const [streamDuration, setStreamDuration] = React.useState(0);
    const [currentStream, setCurrentStream] = React.useState(null);
    const [liveVideoStream, setLiveVideoStream] = React.useState(null);
    
    // Stream sharing channel
    const [streamChannel] = React.useState(() => {
        if (typeof BroadcastChannel !== 'undefined') {
            return new BroadcastChannel('prism-stream-channel');
        }
        return null;
    });
    
    // Multistream configuration
    const [multistream] = React.useState({
        platforms: [
            { id: 'twitch', name: 'Twitch', icon: '🟣', enabled: true, status: 'connected' },
            { id: 'youtube', name: 'YouTube', icon: '🔴', enabled: true, status: 'connected' },
            { id: 'discord', name: 'Discord', icon: '💙', enabled: false, status: 'disconnected' },
            { id: 'tiktok', name: 'TikTok', icon: '⚫', enabled: true, status: 'connected' }
        ]
    });

    // Duration timer
    React.useEffect(() => {
        const timer = setInterval(() => {
            setStreamDuration(prev => prev + 1);
        }, 1000);
        
        return () => clearInterval(timer);
    }, []);

    // Update viewers periodically
    React.useEffect(() => {
        const viewerTimer = setInterval(() => {
            setStreamSettings(prev => ({
                ...prev,
                viewers: Math.max(1, prev.viewers + Math.floor(Math.random() * 3) - 1)
            }));
        }, 5000);
        
        return () => clearInterval(viewerTimer);
    }, []);

    // Listen for shared stream from main window
    React.useEffect(() => {
        // Check for existing shared stream
        const checkForSharedStream = () => {
            if (window.opener && window.opener.prismSharedStream) {
                const sharedStream = window.opener.prismSharedStream;
                setLiveVideoStream(sharedStream);
                setCurrentStream(sharedStream);
                
                // Attach to video element
                const mainVideo = document.getElementById('main-stream-video');
                if (mainVideo) {
                    mainVideo.srcObject = sharedStream;
                }
                
                console.log('Live Studio: Shared stream gefunden und verbunden');
            } else {
                // Try again in 500ms
                setTimeout(checkForSharedStream, 500);
            }
        };
        
        // Start checking immediately
        checkForSharedStream();
        
        // Listen to BroadcastChannel messages
        if (streamChannel) {
            const handleMessage = (event) => {
                const { type, streamSettings: newSettings, streamId } = event.data;
                
                switch (type) {
                    case 'STREAM_STARTED':
                    case 'LIVE_STREAM_STARTED':
                        if (newSettings) {
                            setStreamSettings(prev => ({ ...prev, ...newSettings }));
                        }
                        
                        // Get the shared stream from parent window
                        if (window.opener && window.opener.prismSharedStream) {
                            const sharedStream = window.opener.prismSharedStream;
                            setLiveVideoStream(sharedStream);
                            setCurrentStream(sharedStream);
                            
                            const mainVideo = document.getElementById('main-stream-video');
                            if (mainVideo) {
                                mainVideo.srcObject = sharedStream;
                            }
                        }
                        break;
                        
                    case 'STREAM_STOPPED':
                    case 'LIVE_STREAM_STOPPED':
                        setLiveVideoStream(null);
                        setCurrentStream(null);
                        
                        const mainVideo = document.getElementById('main-stream-video');
                        if (mainVideo) {
                            mainVideo.srcObject = null;
                        }
                        break;
                }
            };
            
            streamChannel.addEventListener('message', handleMessage);
            
            return () => {
                streamChannel.removeEventListener('message', handleMessage);
            };
        }
    }, [streamChannel]);

    // Format duration helper
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // End stream handler
    const handleEndStream = () => {
        if (confirm('Stream wirklich beenden?')) {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                setCurrentStream(null);
            }
            
            // Notify parent window (if opened from livestreaming studio)
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'streamEnded' }, '*');
            }
            
            // Close the live studio window
            window.close();
        }
    };

    // CSS animations for pulse effect
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

    return React.createElement('div', {
        style: {
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(17,17,35,0.98))',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden'
        }
    }, [
        // Enhanced Cockpit Header
        React.createElement('div', {
            key: 'cockpit-header',
            style: {
                padding: '20px 30px',
                background: 'linear-gradient(135deg, rgba(var(--prism-primary-rgb), 0.1), rgba(var(--prism-accent-rgb), 0.1))',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backdropFilter: 'blur(10px)',
                flexShrink: 0
            }
        }, [
            React.createElement('div', {
                key: 'header-left',
                style: { display: 'flex', alignItems: 'center', gap: '16px' }
            }, [
                React.createElement('div', {
                    key: 'live-indicator-large',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        borderRadius: '25px',
                        boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
                        animation: 'pulse 2s infinite'
                    }
                }, [
                    React.createElement('div', {
                        key: 'live-dot-large',
                        style: {
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            animation: 'pulse 1s infinite'
                        }
                    }),
                    React.createElement('span', {
                        key: 'live-text-large',
                        style: {
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '18px',
                            letterSpacing: '2px'
                        }
                    }, 'LIVE')
                ]),
                React.createElement('div', {
                    key: 'stream-info-header',
                    style: { color: 'white' }
                }, [
                    React.createElement('h1', {
                        key: 'stream-title',
                        style: {
                            margin: 0,
                            fontSize: '24px',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, white, #E5E7EB)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }
                    }, streamSettings.title || 'Live Stream'),
                    React.createElement('p', {
                        key: 'stream-duration',
                        style: {
                            margin: '4px 0 0 0',
                            color: '#10B981',
                            fontSize: '16px',
                            fontWeight: '600'
                        }
                    }, `Live seit ${formatDuration(streamDuration)}`)
                ])
            ]),
            React.createElement('div', {
                key: 'header-right',
                style: { display: 'flex', alignItems: 'center', gap: '20px' }
            }, [
                React.createElement('div', {
                    key: 'viewer-stats',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }
                }, [
                    React.createElement('span', { 
                        key: 'viewers-icon',
                        style: { fontSize: '20px' }
                    }, '👥'),
                    React.createElement('span', {
                        key: 'viewers-text',
                        style: {
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '600'
                        }
                    }, `${streamSettings.viewers} Zuschauer`)
                ]),
                React.createElement('button', {
                    key: 'end-stream-btn',
                    onClick: handleEndStream,
                    style: {
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                        transition: 'all 0.3s',
                        backdropFilter: 'blur(10px)'
                    }
                }, [
                    React.createElement('span', { 
                        key: 'icon',
                        style: { fontSize: '14px' }
                    }, '⏹️'),
                    React.createElement('span', { key: 'text' }, 'Stream Beenden')
                ])
            ])
        ]),

        // Main Cockpit Content - Custom Grid Layout
        React.createElement('div', {
            key: 'cockpit-main',
            style: {
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '200px 1fr 200px',
                gridTemplateRows: 'auto 1fr',
                gap: '12px',
                padding: '12px',
                overflow: 'hidden',
                minHeight: 0,
                gridTemplateAreas: `
                    "notifications multistreams chat"
                    "notifications stream-video chat"
                `
            }
        }, [
            // Top Center - Multistreams
            React.createElement('div', {
                key: 'multistream-status',
                style: {
                    gridArea: 'multistreams',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '12px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }
            }, [
                React.createElement('h3', {
                    key: 'multistream-title',
                    style: {
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '📡'),
                    React.createElement('span', { key: 'text' }, 'Multistream Status')
                ]),
                React.createElement('div', {
                    key: 'platforms-grid',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '12px'
                    }
                }, multistream.platforms.filter(p => p.enabled).map(platform =>
                    React.createElement('div', {
                        key: platform.id,
                        style: {
                            padding: '12px',
                            background: platform.status === 'connected' ? 
                                'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            borderRadius: '8px',
                            border: `1px solid ${platform.status === 'connected' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                            textAlign: 'center'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'platform-icon',
                            style: { fontSize: '20px', marginBottom: '4px' }
                        }, platform.icon),
                        React.createElement('div', {
                            key: 'platform-name',
                            style: {
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '2px'
                            }
                        }, platform.name),
                        React.createElement('div', {
                            key: 'platform-status',
                            style: {
                                color: platform.status === 'connected' ? '#10B981' : '#EF4444',
                                fontSize: '10px',
                                fontWeight: '500'
                            }
                        }, platform.status === 'connected' ? 'Live' : 'Offline')
                    ])
                )),
                multistream.platforms.filter(p => p.enabled).length === 0 && 
                React.createElement('div', {
                    key: 'no-platforms',
                    style: {
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '14px',
                        padding: '20px'
                    }
                }, 'Keine Multistream-Plattformen aktiviert')
            ]),

            // Center - Main Stream Video
            React.createElement('div', {
                key: 'main-stream-area',
                style: {
                    gridArea: 'stream-video',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    height: '100%',
                    width: '100%',
                    padding: '12px',
                    boxSizing: 'border-box'
                }
            }, [
                // Large Stream Preview - Proper 16:9 aspect ratio
                React.createElement('div', {
                    key: 'main-preview-container',
                    style: {
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0',
                        margin: '0'
                    }
                }, [
                    React.createElement('div', {
                        key: 'main-preview',
                        style: {
                            width: '100%',
                            aspectRatio: '16/9',
                            background: 'linear-gradient(135deg, #000000, #1a1a1a)',
                            borderRadius: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '2px solid transparent',
                            backgroundImage: 'linear-gradient(#000, #000), linear-gradient(90deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6)',
                            backgroundOrigin: 'border-box',
                            backgroundClip: 'content-box, border-box',
                            boxShadow: '0 15px 30px rgba(0,0,0,0.4), 0 0 25px rgba(239, 68, 68, 0.2)',
                            margin: '0 auto'
                        }
                    }, [
                        React.createElement('video', {
                            key: 'main-stream-video',
                            id: 'main-stream-video',
                            autoPlay: true,
                            muted: true,
                            playsInline: true,
                            style: {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: liveVideoStream ? 'block' : 'none',
                                backgroundColor: '#000'
                            }
                        }),
                        
                        // Placeholder when no stream is available
                        !liveVideoStream && React.createElement('div', {
                            key: 'no-stream-placeholder',
                            style: {
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.6)'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'placeholder-icon',
                                style: { fontSize: '4rem', marginBottom: '16px', opacity: 0.7 }
                            }, '📹'),
                            React.createElement('div', {
                                key: 'placeholder-text',
                                style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' }
                            }, 'Warte auf Live-Stream...'),
                            React.createElement('div', {
                                key: 'placeholder-hint',
                                style: { fontSize: '14px', opacity: 0.8 }
                            }, 'Starte die Vorschau oder den Stream im Creator Studio')
                        ]),
                        // Stream Info Overlay
                        React.createElement('div', {
                            key: 'stream-overlay-info',
                            style: {
                                position: 'absolute',
                                bottom: '12px',
                                left: '12px',
                                right: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'tech-info',
                                style: {
                                    background: 'rgba(0,0,0,0.8)',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(15px)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }
                            }, [
                                React.createElement('div', {
                                    key: 'resolution-info',
                                    style: {
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        marginBottom: '2px'
                                    }
                                }, `${streamSettings.resolution} @ ${streamSettings.fps} FPS`),
                                React.createElement('div', {
                                    key: 'bitrate-info',
                                    style: {
                                        color: '#10B981',
                                        fontSize: '10px',
                                        fontFamily: 'monospace'
                                    }
                                }, `${streamSettings.bitrate} kbps`)
                            ]),
                            React.createElement('div', {
                                key: 'stream-health',
                                style: {
                                    background: 'rgba(0,0,0,0.8)',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backdropFilter: 'blur(15px)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }
                            }, [
                                React.createElement('div', {
                                    key: 'health-indicator',
                                    style: {
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#10B981'
                                    }
                                }),
                                React.createElement('span', {
                                    key: 'health-text',
                                    style: {
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }
                                }, 'Stabil')
                            ])
                        ])
                    ])
                ]),

                // Live Statistics directly under the video
                React.createElement('div', {
                    key: 'stream-stats-bar',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        padding: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        flexShrink: 0
                    }
                }, [
                    React.createElement('div', {
                        key: 'duration-stat',
                        style: {
                            padding: '6px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '6px',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            textAlign: 'center'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'stat-value',
                            style: {
                                color: '#3B82F6',
                                fontSize: '14px',
                                fontWeight: '700',
                                marginBottom: '2px'
                            }
                        }, formatDuration(streamDuration)),
                        React.createElement('div', {
                            key: 'stat-label',
                            style: {
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }
                        }, 'Dauer')
                    ]),
                    React.createElement('div', {
                        key: 'viewers-stat',
                        style: {
                            padding: '6px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '6px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            textAlign: 'center'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'stat-value',
                            style: {
                                color: '#10B981',
                                fontSize: '14px',
                                fontWeight: '700',
                                marginBottom: '2px'
                            }
                        }, streamSettings.viewers),
                        React.createElement('div', {
                            key: 'stat-label',
                            style: {
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }
                        }, 'Zuschauer')
                    ]),
                    React.createElement('div', {
                        key: 'peak-viewers-stat',
                        style: {
                            padding: '6px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '6px',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            textAlign: 'center'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'stat-value',
                            style: {
                                color: '#F59E0B',
                                fontSize: '14px',
                                fontWeight: '700',
                                marginBottom: '2px'
                            }
                        }, Math.max(streamSettings.viewers + 15, 42)),
                        React.createElement('div', {
                            key: 'stat-label',
                            style: {
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }
                        }, 'Peak')
                    ])
                ])
            ]),

            // Left - Notifications
            React.createElement('div', {
                key: 'notifications',
                style: {
                    gridArea: 'notifications',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '12px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }
            }, [
                React.createElement('h3', {
                    key: 'notifications-title',
                    style: {
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '🔔'),
                    React.createElement('span', { key: 'text' }, 'Benachrichtigungen')
                ]),
                React.createElement('div', {
                    key: 'notifications-list',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        flex: 1,
                        overflowY: 'auto'
                    }
                }, [
                    React.createElement('div', {
                        key: 'notification-1',
                        style: {
                            padding: '8px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '6px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: '10px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'notification-header',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '2px'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'type',
                                style: { color: '#10B981', fontWeight: '600' }
                            }, '🎉 Follower'),
                            React.createElement('span', {
                                key: 'time',
                                style: { color: 'rgba(255,255,255,0.6)' }
                            }, '2min')
                        ]),
                        React.createElement('div', {
                            key: 'notification-content',
                            style: { color: 'rgba(255,255,255,0.8)' }
                        }, 'StreamLover123')
                    ]),
                    React.createElement('div', {
                        key: 'notification-2',
                        style: {
                            padding: '12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            fontSize: '12px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'notification-header',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'type',
                                style: { color: '#3B82F6', fontWeight: '600' }
                            }, '💰 Donation'),
                            React.createElement('span', {
                                key: 'time',
                                style: { color: 'rgba(255,255,255,0.6)' }
                            }, 'vor 5min')
                        ]),
                        React.createElement('div', {
                            key: 'notification-content',
                            style: { color: 'rgba(255,255,255,0.8)' }
                        }, 'MegaFan hat 5€ gespendet!')
                    ]),
                    React.createElement('div', {
                        key: 'notification-3',
                        style: {
                            padding: '12px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            fontSize: '12px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'notification-header',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'type',
                                style: { color: '#8B5CF6', fontWeight: '600' }
                            }, '⭐ Highlight'),
                            React.createElement('span', {
                                key: 'time',
                                style: { color: 'rgba(255,255,255,0.6)' }
                            }, 'vor 8min')
                        ]),
                        React.createElement('div', {
                            key: 'notification-content',
                            style: { color: 'rgba(255,255,255,0.8)' }
                        }, 'Stream Moment gespeichert!')
                    ]),
                    React.createElement('div', {
                        key: 'notification-4',
                        style: {
                            padding: '12px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontSize: '12px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'notification-header',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'type',
                                style: { color: '#10B981', fontWeight: '600' }
                            }, '👋 Neuer Viewer'),
                            React.createElement('span', {
                                key: 'time',
                                style: { color: 'rgba(255,255,255,0.6)' }
                            }, 'vor 12min')
                        ]),
                        React.createElement('div', {
                            key: 'notification-content',
                            style: { color: 'rgba(255,255,255,0.8)' }
                        }, 'GamerPro99 ist beigetreten!')
                    ])
                ])
            ]),

            // Right - Live Chat
            React.createElement('div', {
                key: 'live-chat',
                style: {
                    gridArea: 'chat',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '12px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }
            }, [
                React.createElement('h3', {
                    key: 'chat-title',
                    style: {
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '💬'),
                    React.createElement('span', { key: 'text' }, 'Live Chat')
                ]),
                React.createElement('div', {
                    key: 'chat-messages',
                    style: {
                        flex: 1,
                        overflowY: 'auto',
                        marginBottom: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }
                }, [
                    React.createElement('div', {
                        key: 'message-1',
                        style: {
                            padding: '6px 8px',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '6px',
                            fontSize: '10px',
                            marginBottom: '4px'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'username',
                            style: { color: '#3B82F6', fontWeight: '600' }
                        }, 'StreamFan42: '),
                        React.createElement('span', {
                            key: 'message',
                            style: { color: 'rgba(255,255,255,0.9)' }
                        }, 'Geiler Stream! 🔥')
                    ]),
                    React.createElement('div', {
                        key: 'message-2',
                        style: {
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'username',
                            style: { color: '#10B981', fontWeight: '600' }
                        }, 'TechGuru99: '),
                        React.createElement('span', {
                            key: 'message',
                            style: { color: 'rgba(255,255,255,0.9)' }
                        }, 'Welche Software nutzt du?')
                    ]),
                    React.createElement('div', {
                        key: 'message-3',
                        style: {
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'username',
                            style: { color: '#F59E0B', fontWeight: '600' }
                        }, 'NewViewer: '),
                        React.createElement('span', {
                            key: 'message',
                            style: { color: 'rgba(255,255,255,0.9)' }
                        }, 'Hallo zusammen! 👋')
                    ]),
                    React.createElement('div', {
                        key: 'message-4',
                        style: {
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'username',
                            style: { color: '#8B5CF6', fontWeight: '600' }
                        }, 'ProGamer: '),
                        React.createElement('span', {
                            key: 'message',
                            style: { color: 'rgba(255,255,255,0.9)' }
                        }, 'Mega Setup! 💪')
                    ]),
                    React.createElement('div', {
                        key: 'message-5',
                        style: {
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'username',
                            style: { color: '#EF4444', fontWeight: '600' }
                        }, 'StreamLover: '),
                        React.createElement('span', {
                            key: 'message',
                            style: { color: 'rgba(255,255,255,0.9)' }
                        }, 'Können wir mehr von diesem Content bekommen?')
                    ])
                ]),
                React.createElement('div', {
                    key: 'chat-input',
                    style: {
                        display: 'flex',
                        gap: '8px'
                    }
                }, [
                    React.createElement('input', {
                        key: 'message-input',
                        type: 'text',
                        placeholder: 'Nachricht eingeben...',
                        style: {
                            flex: 1,
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '12px'
                        }
                    }),
                    React.createElement('button', {
                        key: 'send-btn',
                        style: {
                            padding: '8px 12px',
                            background: 'var(--prism-primary)',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }
                    }, '📤')
                ])
            ])
        ])
    ]);
}

// Export to global scope
window.LiveStudio = LiveStudio;
