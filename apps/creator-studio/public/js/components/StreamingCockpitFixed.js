// Streaming Cockpit Component - Fixed Layout
function StreamingCockpit({ streamSettings, deviceSettings, multistream, obsToken, onClose, onStreamStop }) {
    const [cockpitState, setCockpitState] = React.useState({
        isFullscreen: false,
        showChat: true,
        showStats: true,
        showControls: true,
        streamDuration: 0,
        viewers: Math.floor(Math.random() * 100) + 1,
        chatMessages: [
            { id: 1, username: 'StreamFan123', message: 'Hallo! 👋', timestamp: new Date() },
            { id: 2, username: 'GamerGirl', message: 'Cooles Setup!', timestamp: new Date() },
            { id: 3, username: 'TechNerd', message: 'Welche Kamera verwendest du?', timestamp: new Date() }
        ],
        streamStats: {
            bitrate: streamSettings.bitrate,
            droppedFrames: 0,
            fps: streamSettings.fps,
            cpu: Math.floor(Math.random() * 30) + 20,
            memory: Math.floor(Math.random() * 40) + 30
        }
    });

    const [currentStream, setCurrentStream] = React.useState(null);

    // Timer for stream duration
    React.useEffect(() => {
        const interval = setInterval(() => {
            setCockpitState(prev => ({
                ...prev,
                streamDuration: prev.streamDuration + 1,
                viewers: prev.viewers + Math.floor(Math.random() * 3) - 1,
                streamStats: {
                    ...prev.streamStats,
                    cpu: Math.max(10, Math.min(80, prev.streamStats.cpu + Math.floor(Math.random() * 10) - 5)),
                    memory: Math.max(20, Math.min(90, prev.streamStats.memory + Math.floor(Math.random() * 6) - 3)),
                    droppedFrames: prev.streamStats.droppedFrames + Math.floor(Math.random() * 2)
                }
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Start camera stream
    React.useEffect(() => {
        const startCockpitStream = async () => {
            if (streamSettings.selectedCamera) {
                try {
                    const constraints = {
                        video: {
                            deviceId: { exact: streamSettings.selectedCamera },
                            width: { ideal: parseInt(streamSettings.resolution.split('x')[0]) },
                            height: { ideal: parseInt(streamSettings.resolution.split('x')[1]) },
                            frameRate: { ideal: parseInt(streamSettings.fps) }
                        },
                        audio: streamSettings.selectedMicrophone ? {
                            deviceId: { exact: streamSettings.selectedMicrophone }
                        } : false
                    };

                    const stream = await navigator.mediaDevices.getUserMedia(constraints);
                    setCurrentStream(stream);
                    
                    const videoElement = document.getElementById('cockpit-stream-video');
                    if (videoElement) {
                        videoElement.srcObject = stream;
                    }
                } catch (error) {
                    console.error('Failed to start cockpit stream:', error);
                }
            }
        };

        startCockpitStream();

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [streamSettings.selectedCamera, streamSettings.selectedMicrophone]);

    // Format duration
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Stop stream and close cockpit
    const handleStopStream = () => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        onStreamStop();
        onClose();
    };

    // Add chat message (simulation)
    const addChatMessage = (message) => {
        const newMessage = {
            id: Date.now(),
            username: 'Du',
            message: message,
            timestamp: new Date()
        };
        setCockpitState(prev => ({
            ...prev,
            chatMessages: [...prev.chatMessages, newMessage].slice(-50)
        }));
    };

    return React.createElement('div', {
        className: 'streaming-cockpit',
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
            zIndex: 1000,
            display: 'grid',
            gridTemplateRows: '60px 50px 1fr 60px',
            gridTemplateColumns: '1fr',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            overflow: 'hidden'
        }
    }, [
        // Top Bar - Stream Control
        React.createElement('div', {
            key: 'top-bar',
            style: {
                background: 'rgba(0, 0, 0, 0.9)',
                padding: '0 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
            }
        }, [
            React.createElement('div', {
                key: 'stream-info',
                style: { display: 'flex', alignItems: 'center', gap: '20px' }
            }, [
                React.createElement('div', {
                    key: 'live-indicator',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }
                }, [
                    React.createElement('span', {
                        key: 'pulse',
                        style: {
                            width: '8px',
                            height: '8px',
                            background: 'white',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                        }
                    }),
                    React.createElement('span', { key: 'text' }, 'LIVE')
                ]),
                React.createElement('div', {
                    key: 'stream-title',
                    style: { fontSize: '18px', fontWeight: '600' }
                }, streamSettings.title || 'Unbenannter Stream'),
                React.createElement('div', {
                    key: 'duration',
                    style: { fontSize: '16px', color: '#10b981', fontFamily: 'monospace' }
                }, formatDuration(cockpitState.streamDuration)),
                React.createElement('div', {
                    key: 'viewers',
                    style: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px' }
                }, [
                    React.createElement('span', { key: 'icon' }, '👥'),
                    React.createElement('span', { key: 'count' }, cockpitState.viewers)
                ])
            ]),
            React.createElement('div', {
                key: 'top-controls',
                style: { display: 'flex', alignItems: 'center', gap: '12px' }
            }, [
                React.createElement('button', {
                    key: 'stop-stream-btn',
                    onClick: handleStopStream,
                    style: {
                        padding: '8px 16px',
                        background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600'
                    }
                }, '⏹️ Stream Beenden'),
                React.createElement('button', {
                    key: 'close-btn',
                    onClick: onClose,
                    style: {
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }
                }, '✕')
            ])
        ]),

        // Platforms Bar
        React.createElement('div', {
            key: 'platforms-bar',
            style: {
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '8px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '16px',
                backdropFilter: 'blur(10px)'
            }
        }, multistream.platforms.filter(p => p.enabled).map(platform =>
            React.createElement('div', {
                key: platform.id,
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '15px',
                    fontSize: '12px',
                    color: 'white'
                }
            }, [
                React.createElement('span', { key: 'icon' }, platform.icon),
                React.createElement('span', { key: 'name' }, platform.name),
                React.createElement('span', {
                    key: 'status',
                    style: {
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                        marginLeft: '4px'
                    }
                })
            ])
        )),

        // Main Content Area
        React.createElement('div', {
            key: 'main-content',
            style: {
                display: 'grid',
                gridTemplateColumns: '300px 1fr 320px',
                gap: '0',
                overflow: 'hidden',
                height: '100%'
            }
        }, [
            // Left Panel - Notifications
            React.createElement('div', {
                key: 'notifications-panel',
                style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, [
                React.createElement('h3', {
                    key: 'notifications-title',
                    style: {
                        margin: '0 0 16px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '🔔'),
                    React.createElement('span', { key: 'text' }, 'Benachrichtigungen')
                ]),
                React.createElement('div', {
                    key: 'notifications-list',
                    style: {
                        flex: 1,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }
                }, [
                    React.createElement('div', {
                        key: 'notif-1',
                        style: {
                            padding: '12px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'title',
                            style: { fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }
                        }, '🟢 Stream gestartet'),
                        React.createElement('div', {
                            key: 'content',
                            style: { color: '#e5e7eb' }
                        }, 'Erfolgreich auf allen Plattformen live')
                    ]),
                    React.createElement('div', {
                        key: 'notif-2',
                        style: {
                            padding: '12px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'title',
                            style: { fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }
                        }, '👥 Neue Follower'),
                        React.createElement('div', {
                            key: 'content',
                            style: { color: '#e5e7eb' }
                        }, '+5 neue Follower in den letzten 10 Minuten')
                    ]),
                    React.createElement('div', {
                        key: 'notif-3',
                        style: {
                            padding: '12px',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'title',
                            style: { fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }
                        }, '⚠️ CPU Warnung'),
                        React.createElement('div', {
                            key: 'content',
                            style: { color: '#e5e7eb' }
                        }, `CPU Auslastung bei ${cockpitState.streamStats.cpu}%`)
                    ])
                ])
            ]),

            // Center - Video Area
            React.createElement('div', {
                key: 'video-area',
                style: {
                    background: '#000',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    padding: '20px'
                }
            }, [
                React.createElement('div', {
                    key: 'video-container',
                    style: {
                        width: '100%',
                        maxWidth: '100%',
                        aspectRatio: '16/9',
                        position: 'relative',
                        background: '#000',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '2px solid rgba(239, 68, 68, 0.5)'
                    }
                }, [
                    React.createElement('video', {
                        key: 'stream-video',
                        id: 'cockpit-stream-video',
                        autoPlay: true,
                        muted: true,
                        playsInline: true,
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }
                    }),
                    React.createElement('div', {
                        key: 'live-badge',
                        style: {
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'pulse-dot',
                            style: {
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'white',
                                animation: 'pulse 2s infinite'
                            }
                        }),
                        React.createElement('span', { key: 'live-text' }, 'LIVE')
                    ]),
                    React.createElement('div', {
                        key: 'video-info',
                        style: {
                            position: 'absolute',
                            bottom: '16px',
                            left: '16px',
                            background: 'rgba(0, 0, 0, 0.8)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontFamily: 'monospace'
                        }
                    }, [
                        React.createElement('div', { key: 'resolution' }, `${streamSettings.resolution} @ ${streamSettings.fps}fps`),
                        React.createElement('div', { key: 'bitrate' }, `${streamSettings.bitrate} kbps`)
                    ])
                ]),
                React.createElement('div', {
                    key: 'video-controls',
                    style: {
                        marginTop: '16px',
                        display: 'flex',
                        gap: '12px'
                    }
                }, [
                    React.createElement('button', {
                        key: 'mute-btn',
                        style: {
                            padding: '10px 20px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }
                    }, '🎤 Mikrofon'),
                    React.createElement('button', {
                        key: 'camera-btn',
                        style: {
                            padding: '10px 20px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }
                    }, '📹 Kamera'),
                    React.createElement('button', {
                        key: 'screen-btn',
                        style: {
                            padding: '10px 20px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }
                    }, '🖥️ Screen Share')
                ])
            ]),

            // Right Panel - Chat
            React.createElement('div', {
                key: 'chat-panel',
                style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }
            }, [
                React.createElement('div', {
                    key: 'chat-header',
                    style: {
                        padding: '16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }
                }, [
                    React.createElement('h3', {
                        key: 'chat-title',
                        style: {
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '💬'),
                        React.createElement('span', { key: 'text' }, 'Live Chat')
                    ]),
                    React.createElement('span', {
                        key: 'chat-count',
                        style: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                        }
                    }, cockpitState.chatMessages.length)
                ]),
                React.createElement('div', {
                    key: 'chat-messages',
                    style: {
                        flex: 1,
                        padding: '12px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }
                }, cockpitState.chatMessages.map(msg =>
                    React.createElement('div', {
                        key: msg.id,
                        style: {
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'message-header',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '4px'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'username',
                                style: { fontWeight: 'bold', color: '#60a5fa' }
                            }, msg.username),
                            React.createElement('span', {
                                key: 'timestamp',
                                style: { fontSize: '12px', color: '#9ca3af' }
                            }, msg.timestamp.toLocaleTimeString())
                        ]),
                        React.createElement('div', {
                            key: 'message-content',
                            style: { color: '#e5e7eb' }
                        }, msg.message)
                    ])
                )),
                React.createElement('div', {
                    key: 'chat-input',
                    style: {
                        padding: '12px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }
                }, [
                    React.createElement('input', {
                        key: 'message-input',
                        type: 'text',
                        placeholder: 'Nachricht eingeben...',
                        style: {
                            width: '100%',
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '14px'
                        },
                        onKeyPress: (e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                                addChatMessage(e.target.value.trim());
                                e.target.value = '';
                            }
                        }
                    })
                ])
            ])
        ]),

        // Bottom Stats Bar
        React.createElement('div', {
            key: 'stats-bar',
            style: {
                background: 'rgba(0, 0, 0, 0.9)',
                padding: '12px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '20px',
                backdropFilter: 'blur(10px)'
            }
        }, [
            React.createElement('div', {
                key: 'bitrate-stat',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'label',
                    style: { color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }
                }, 'Bitrate'),
                React.createElement('div', {
                    key: 'value',
                    style: { fontWeight: 'bold', fontSize: '16px', color: '#10b981' }
                }, `${cockpitState.streamStats.bitrate} kbps`)
            ]),
            React.createElement('div', {
                key: 'fps-stat',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'label',
                    style: { color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }
                }, 'FPS'),
                React.createElement('div', {
                    key: 'value',
                    style: { fontWeight: 'bold', fontSize: '16px', color: '#3b82f6' }
                }, cockpitState.streamStats.fps)
            ]),
            React.createElement('div', {
                key: 'cpu-stat',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'label',
                    style: { color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }
                }, 'CPU'),
                React.createElement('div', {
                    key: 'value',
                    style: { 
                        fontWeight: 'bold', 
                        fontSize: '16px',
                        color: cockpitState.streamStats.cpu > 70 ? '#ef4444' : '#10b981'
                    }
                }, `${cockpitState.streamStats.cpu}%`)
            ]),
            React.createElement('div', {
                key: 'memory-stat',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'label',
                    style: { color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }
                }, 'RAM'),
                React.createElement('div', {
                    key: 'value',
                    style: { 
                        fontWeight: 'bold', 
                        fontSize: '16px',
                        color: cockpitState.streamStats.memory > 80 ? '#ef4444' : '#10b981'
                    }
                }, `${cockpitState.streamStats.memory}%`)
            ]),
            React.createElement('div', {
                key: 'dropped-frames-stat',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'label',
                    style: { color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }
                }, 'Dropped'),
                React.createElement('div', {
                    key: 'value',
                    style: { 
                        fontWeight: 'bold', 
                        fontSize: '16px',
                        color: cockpitState.streamStats.droppedFrames > 10 ? '#ef4444' : '#9ca3af'
                    }
                }, `${cockpitState.streamStats.droppedFrames}`)
            ]),
            React.createElement('div', {
                key: 'viewers-stat',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'label',
                    style: { color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }
                }, 'Zuschauer'),
                React.createElement('div', {
                    key: 'value',
                    style: { fontWeight: 'bold', fontSize: '16px', color: '#8b5cf6' }
                }, cockpitState.viewers)
            ])
        ])
    ]);
}

// Export to global scope
window.StreamingCockpit = StreamingCockpit;
