// Main App Component for Creator Studio
function CreatorStudioApp() {
    const [user, setUser] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [content, setContent] = React.useState([
        { id: 1, title: 'Welcome Video', status: 'published', views: 1250, likes: 89, category: 'general' },
        { id: 2, title: 'Tutorial Content', status: 'draft', views: 0, likes: 0, category: 'education' },
        { id: 3, title: 'Live Stream Replay', status: 'published', views: 3400, likes: 234, category: 'entertainment' }
    ]);
    const [isLoading, setIsLoading] = React.useState(true);

    // Check for existing authentication on mount
    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('prism-token');
                const storedUser = localStorage.getItem('prism-user');
                
                if (token && storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('prism-token');
        localStorage.removeItem('prism-user');
        setUser(null);
        setActiveTab('dashboard');
    };

    const handleContentUpdate = () => {
        // Refresh content list
        console.log('Content updated');
    };

    // Loading screen
    if (isLoading) {
        return React.createElement('div', {
            className: 'layout',
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--prism-gray-900)',
                color: 'var(--prism-gray-100)'
            }
        }, [
            React.createElement('div', {
                key: 'loading',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', {
                    key: 'spinner',
                    className: 'prism-spin',
                    style: { fontSize: '3rem', marginBottom: '1rem' }
                }, '🎨'),
                React.createElement('h2', {
                    key: 'text'
                }, 'Loading Creator Studio...')
            ])
        ]);
    }

    // Show login modal if not authenticated
    if (!user) {
        return React.createElement(CreatorLoginModal, {
            onLoginSuccess: handleLoginSuccess
        });
    }

    // Render component based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return React.createElement(Dashboard, { 
                    user, 
                    content, 
                    setActiveTab 
                });
            case 'streaming-studio':
                return React.createElement(LivestreamingStudio, { user });
            case 'media-library':
                return React.createElement(MediaLibrary, { content, onContentUpdate: handleContentUpdate });
            case 'content-planner':
                return React.createElement(ContentPlanner, {
                    setActiveTab
                });
            case 'creator-settings':
                // Safety check for CreatorSettings component
                const SettingsComponent = window.CreatorSettings || window.prismComponents?.CreatorSettings;
                if (!SettingsComponent) {
                    console.warn('CreatorSettings component not found, showing loading state');
                    return React.createElement('div', {
                        key: 'loading-settings',
                        style: { 
                            padding: '3rem', 
                            textAlign: 'center',
                            background: 'var(--prism-bg-secondary)',
                            borderRadius: '12px',
                            margin: '2rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'spinner',
                            style: { 
                                fontSize: '3rem',
                                marginBottom: '1rem',
                                animation: 'pulse 2s ease-in-out infinite'
                            }
                        }, '⚙️'),
                        React.createElement('h3', {
                            key: 'title',
                            style: { color: 'var(--prism-text-primary)' }
                        }, 'Lade Creator Einstellungen...'),
                        React.createElement('p', {
                            key: 'message',
                            style: { color: 'var(--prism-text-secondary)', marginTop: '0.5rem' }
                        }, 'Die Einstellungen werden geladen. Bitte warten Sie einen Moment.'),
                        React.createElement('button', {
                            key: 'retry',
                            onClick: () => window.location.reload(),
                            style: {
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                background: 'var(--prism-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }
                        }, 'Seite neu laden')
                    ]);
                }
                return React.createElement(SettingsComponent, {
                    user,
                    setActiveTab
                });
            case 'monetization':
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
                        }, '💰 Monetarisierung'),
                        React.createElement('p', {
                            key: 'subtitle'
                        }, 'Preise, Abos & Einnahmen verwalten')
                    ]),
                    React.createElement('div', {
                        key: 'content',
                        className: 'card-prism'
                    }, 'Monetization features will be available soon!')
                ]);
            case 'fan-interaction':
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
                        }, '💬 Fan-Interaktion'),
                        React.createElement('p', {
                            key: 'subtitle'
                        }, 'Nachrichten, Kommentare & Fanclub Management')
                    ]),
                    React.createElement('div', {
                        key: 'content',
                        className: 'card-prism'
                    }, 'Fan interaction features will be available soon!')
                ]);
            case 'analytics':
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
                        }, '📈 Analytik'),
                        React.createElement('p', {
                            key: 'subtitle'
                        }, 'Performance & Trends analysieren')
                    ]),
                    React.createElement('div', {
                        key: 'content',
                        className: 'card-prism'
                    }, 'Analytics features will be available soon!')
                ]);
            case 'team-settings':
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
                        }, '👥 Team & Einstellungen'),
                        React.createElement('p', {
                            key: 'subtitle'
                        }, 'Rollen, Berechtigungen & Integrationen')
                    ]),
                    React.createElement('div', {
                        key: 'content',
                        className: 'card-prism'
                    }, 'Team & Settings features will be available soon!')
                ]);
            case 'mobile-companion':
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
                        }, '📱 Mobile Companion'),
                        React.createElement('p', {
                            key: 'subtitle'
                        }, 'Mobile App Control & Fernsteuerung')
                    ]),
                    React.createElement('div', {
                        key: 'content',
                        className: 'card-prism'
                    }, 'Mobile Companion features will be available soon!')
                ]);
            case 'integrations':
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
                        }, '🔗 Integrationen'),
                        React.createElement('p', {
                            key: 'subtitle'
                        }, 'OBS, Social Media & Payment Providers')
                    ]),
                    React.createElement('div', {
                        key: 'content',
                        className: 'card-prism'
                    }, 'Integration features will be available soon!')
                ]);
            default:
                return React.createElement(Dashboard, { user, content });
        }
    };

    // Main app layout
    return React.createElement('div', {
        className: 'layout'
    }, [
        React.createElement(Sidebar, {
            key: 'sidebar',
            activeTab,
            onTabChange: setActiveTab,
            user
        }),
        React.createElement('div', {
            key: 'main',
            className: 'main-content'
        }, [
            React.createElement('div', {
                key: 'content'
            }, renderContent()),
            React.createElement('div', {
                key: 'footer',
                style: {
                    marginTop: 'var(--prism-space-3xl)',
                    paddingTop: 'var(--prism-space-xl)',
                    borderTop: '1px solid var(--prism-gray-700)',
                    textAlign: 'center',
                    color: 'var(--prism-gray-400)'
                }
            }, [
                React.createElement('button', {
                    key: 'logout',
                    onClick: handleLogout,
                    className: 'btn-prism btn-prism-dark',
                    style: { marginBottom: 'var(--prism-space-md)' }
                }, [
                    React.createElement('span', { key: 'icon' }, '🚪'),
                    'Logout'
                ]),
                React.createElement('p', {
                    key: 'version',
                    style: { fontSize: 'var(--prism-text-sm)' }
                }, 'PRISM Creator Studio v1.0 - Modular Architecture')
            ])
        ])
    ]);
}

// Component availability diagnostics
function diagnoseComponents() {
    const requiredComponents = [
        'CreatorSettings', 'Dashboard', 'LivestreamingStudio', 
        'MediaLibrary', 'ContentPlanner', 'Sidebar', 'LoginModal'
    ];
    
    const missing = [];
    const available = [];
    
    requiredComponents.forEach(componentName => {
        if (typeof window[componentName] !== 'undefined') {
            available.push(componentName);
        } else {
            missing.push(componentName);
        }
    });
    
    console.log('🔍 Component Diagnostics:');
    console.log('✅ Available components:', available);
    if (missing.length > 0) {
        console.warn('❌ Missing components:', missing);
    }
    
    return { available, missing };
}

// Run diagnostics when App loads
diagnoseComponents();

// Component is ready to be rendered by the main script
// No auto-initialization here to prevent double rendering
