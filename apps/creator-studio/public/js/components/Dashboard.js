// Dashboard Component for Creator Studio
function Dashboard({ user, content, setActiveTab }) {
    const stats = {
        totalContent: content.length,
        publishedContent: content.filter(c => c.status === 'published').length,
        totalViews: content.reduce((sum, c) => sum + c.views, 0),
        totalLikes: content.reduce((sum, c) => sum + c.likes, 0)
    };
    
    return React.createElement('div', {
        className: 'animate-in'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'header'
        }, [
            React.createElement('h1', {
                key: 'title',
                className: 'gradient-text'
            }, 'Dashboard'),
            React.createElement('p', {
                key: 'subtitle'
            }, `Welcome back, ${user?.profile?.displayName || user?.username}! Ready to create amazing content?`)
        ]),
        
        React.createElement('div', {
            key: 'stats',
            className: 'feature-grid',
            style: { marginBottom: 'var(--prism-space-3xl)' }
        }, [
            React.createElement('div', {
                key: 'totalContent',
                className: 'card-prism'
            }, [
                React.createElement('div', {
                    key: 'totalContent-value',
                    style: {
                        fontSize: 'var(--prism-text-4xl)',
                        fontWeight: '700',
                        color: 'var(--prism-purple)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, stats.totalContent),
                React.createElement('div', {
                    key: 'totalContent-label',
                    style: {
                        color: 'var(--prism-gray-400)',
                        fontSize: 'var(--prism-text-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }
                }, 'Total Content')
            ]),
            
            React.createElement('div', {
                key: 'publishedContent',
                className: 'card-prism'
            }, [
                React.createElement('div', {
                    key: 'publishedContent-value',
                    style: {
                        fontSize: 'var(--prism-text-4xl)',
                        fontWeight: '700',
                        color: 'var(--prism-success)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, stats.publishedContent),
                React.createElement('div', {
                    key: 'publishedContent-label',
                    style: {
                        color: 'var(--prism-gray-400)',
                        fontSize: 'var(--prism-text-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }
                }, 'Published')
            ]),
            
            React.createElement('div', {
                key: 'totalViews',
                className: 'card-prism'
            }, [
                React.createElement('div', {
                    key: 'totalViews-value',
                    style: {
                        fontSize: 'var(--prism-text-4xl)',
                        fontWeight: '700',
                        color: 'var(--prism-pink)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, stats.totalViews.toLocaleString()),
                React.createElement('div', {
                    key: 'totalViews-label',
                    style: {
                        color: 'var(--prism-gray-400)',
                        fontSize: 'var(--prism-text-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }
                }, 'Total Views')
            ]),
            
            React.createElement('div', {
                key: 'totalLikes',
                className: 'card-prism'
            }, [
                React.createElement('div', {
                    key: 'totalLikes-value',
                    style: {
                        fontSize: 'var(--prism-text-4xl)',
                        fontWeight: '700',
                        color: 'var(--prism-info)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, stats.totalLikes.toLocaleString()),
                React.createElement('div', {
                    key: 'totalLikes-label',
                    style: {
                        color: 'var(--prism-gray-400)',
                        fontSize: 'var(--prism-text-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }
                }, 'Total Likes')
            ])
        ]),
        
        React.createElement('div', {
            key: 'actions',
            style: {
                display: 'flex',
                gap: 'var(--prism-space-lg)',
                marginBottom: 'var(--prism-space-3xl)',
                flexWrap: 'wrap'
            }
        }, [
            React.createElement('button', {
                key: 'newVideo',
                className: 'btn-prism btn-prism-primary'
            }, [
                React.createElement('span', { key: 'newVideo-icon' }, '📹'),
                React.createElement('span', { key: 'newVideo-text' }, 'New Video')
            ]),
            React.createElement('button', {
                key: 'goLive',
                className: 'btn-prism btn-prism-dark',
                onClick: async () => {
                    try {
                        // Load ServerRecorder service
                        if (!window.ServerRecorder) {
                            const script = document.createElement('script');
                            script.src = '/js/services/ServerRecorder.js';
                            document.head.appendChild(script);
                            
                            // Wait for script to load
                            await new Promise((resolve, reject) => {
                                script.onload = resolve;
                                script.onerror = reject;
                                setTimeout(reject, 5000); // Timeout after 5 seconds
                            });
                        }
                        
                        console.log('🚀 ServerRecorder loaded successfully');
                        
                        // Navigate to LiveStudio with server recording enabled
                        if (window.navigationManager) {
                            window.navigationManager.navigateTo('livestudio', {
                                recordingMode: 'server',
                                autoRecord: false
                            });
                        }
                    } catch (error) {
                        console.error('❌ Failed to load ServerRecorder:', error);
                        
                        // Fallback: Navigate anyway
                        if (window.navigationManager) {
                            window.navigationManager.navigateTo('livestudio');
                        }
                        
                        alert('Server Recording System konnte nicht geladen werden. Bitte versuchen Sie es erneut.');
                    }
                }
            }, [
                React.createElement('span', { key: 'goLive-icon' }, '🎙️'),
                React.createElement('span', { key: 'goLive-text' }, 'Go Live')
            ]),
            React.createElement('button', {
                key: 'analytics',
                className: 'btn-prism btn-prism-dark'
            }, [
                React.createElement('span', { key: 'analytics-icon' }, '📊'),
                React.createElement('span', { key: 'analytics-text' }, 'View Analytics')
            ]),
            React.createElement('button', {
                key: 'contentPlanner',
                className: 'btn-prism btn-prism-secondary',
                onClick: () => {
                    // Use the normal tab navigation instead of overlay
                    setActiveTab('content-planner');
                }
            }, [
                React.createElement('span', { key: 'contentPlanner-icon' }, '📅'),
                React.createElement('span', { key: 'contentPlanner-text' }, 'Content Planner')
            ])
        ]),
        
        React.createElement('div', {
            key: 'quickActions',
            className: 'card-prism'
        }, [
            React.createElement('h3', {
                key: 'title',
                style: {
                    fontSize: 'var(--prism-text-2xl)',
                    fontWeight: '600',
                    color: 'var(--prism-gray-100)',
                    marginBottom: 'var(--prism-space-lg)'
                }
            }, 'Quick Actions'),
            
            React.createElement('p', {
                key: 'subtitle',
                style: {
                    color: 'var(--prism-gray-400)',
                    marginBottom: 'var(--prism-space-xl)'
                }
            }, 'Get started with creating and managing your content'),
            
            React.createElement('div', {
                key: 'actionsList',
                style: {
                    display: 'grid',
                    gap: 'var(--prism-space-md)',
                    color: 'var(--prism-gray-300)'
                }
            }, [
                React.createElement('div', {
                    key: 'upload',
                    className: 'flex-prism',
                    style: { gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('span', { key: 'upload-icon' }, '📤'),
                    React.createElement('span', { key: 'upload-text' }, 'Upload your first video')
                ]),
                
                React.createElement('div', {
                    key: 'profile',
                    className: 'flex-prism',
                    style: { gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('span', { key: 'profile-icon' }, '👤'),
                    React.createElement('span', { key: 'profile-text' }, 'Set up your creator profile')
                ]),
                
                React.createElement('div', {
                    key: 'monetization',
                    className: 'flex-prism',
                    style: { gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('span', { key: 'monetization-icon' }, '💰'),
                    React.createElement('span', { key: 'monetization-text' }, 'Configure monetization')
                ]),
                
                React.createElement('div', {
                    key: 'live',
                    className: 'flex-prism',
                    style: { gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('span', { key: 'live-icon' }, '🔴'),
                    React.createElement('span', { key: 'live-text' }, 'Go live with your audience')
                ])
            ])
        ])
    ]);
}
