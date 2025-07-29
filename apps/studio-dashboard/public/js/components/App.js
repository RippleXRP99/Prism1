// Main Studio App Component
function StudioApp() {
    const [studio, setStudio] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [isLoading, setIsLoading] = React.useState(true);

    // Check for existing authentication on mount
    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('prism-studio-token');
                const storedStudio = localStorage.getItem('prism-studio-data');
                
                if (token && storedStudio) {
                    const studioData = JSON.parse(storedStudio);
                    setStudio(studioData);
                } else {
                    setStudio(null);
                }
            } catch (error) {
                console.error('Studio auth check failed:', error);
                setStudio(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLoginSuccess = (studioData) => {
        setStudio(studioData);
    };

    const handleLogout = () => {
        localStorage.removeItem('prism-studio-token');
        localStorage.removeItem('prism-studio-data');
        setStudio(null);
        setActiveTab('dashboard');
    };

    const handleUpdateStudio = (updatedStudio) => {
        setStudio(updatedStudio);
    };

    // Loading screen
    if (isLoading) {
        return React.createElement('div', {
            className: 'studio-app',
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh'
            }
        }, [
            React.createElement('div', {
                key: 'loading-content',
                style: { textAlign: 'center' }
            }, [
                React.createElement('div', { key: 'spinner', className: 'loading-spinner' }),
                React.createElement('h2', {
                    key: 'text',
                    style: { 
                        marginTop: 'var(--prism-space-lg)', 
                        color: 'var(--studio-primary)'
                    }
                }, 'Loading Studio Dashboard...')
            ])
        ]);
    }

    // Show login modal if not authenticated
    if (!studio) {
        return React.createElement(StudioLoginModal, {
            onLoginSuccess: handleLoginSuccess
        });
    }

    // Render component based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return React.createElement(StudioDashboard, { 
                    studio, 
                    setActiveTab 
                });
            case 'creators':
                return React.createElement(CreatorManagement, { 
                    studio 
                });
            case 'analytics':
                return React.createElement(StudioAnalytics, { 
                    studio 
                });
            case 'settings':
                return React.createElement(StudioSettings, { 
                    studio,
                    onUpdateStudio: handleUpdateStudio
                });
            default:
                return React.createElement(StudioDashboard, { studio, setActiveTab });
        }
    };

    // Main studio layout
    return React.createElement('div', {
        className: 'studio-app'
    }, [
        React.createElement('header', {
            key: 'header',
            className: 'studio-header'
        }, [
            React.createElement('div', {
                key: 'header-content',
                className: 'studio-header-content'
            }, [
                React.createElement('div', {
                    key: 'logo',
                    className: 'studio-logo'
                }, [
                    React.createElement('span', { key: 'icon' }, '🏢'),
                    React.createElement('span', { key: 'text' }, 'PRISM Studio')
                ]),

                React.createElement('nav', {
                    key: 'nav',
                    className: 'studio-nav'
                }, window.studioNavItems.map(item => 
                    React.createElement('button', {
                        key: item.id,
                        className: `studio-nav-item ${activeTab === item.id ? 'active' : ''}`,
                        onClick: () => setActiveTab(item.id),
                        title: item.description
                    }, [
                        React.createElement('span', { key: 'icon' }, item.icon),
                        React.createElement('span', { key: 'label' }, item.label)
                    ])
                )),

                React.createElement('div', {
                    key: 'user-menu',
                    style: { display: 'flex', alignItems: 'center', gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('span', {
                        key: 'studio-name',
                        style: { 
                            color: 'var(--prism-gray-300)',
                            fontSize: 'var(--prism-text-sm)'
                        }
                    }, studio.name),
                    React.createElement('button', {
                        key: 'logout',
                        onClick: handleLogout,
                        style: {
                            background: 'none',
                            border: '1px solid var(--prism-gray-600)',
                            borderRadius: 'var(--prism-radius-md)',
                            color: 'var(--prism-gray-300)',
                            padding: 'var(--prism-space-sm) var(--prism-space-md)',
                            cursor: 'pointer',
                            fontSize: 'var(--prism-text-sm)',
                            transition: 'all 0.2s ease'
                        },
                        onMouseEnter: (e) => {
                            e.target.style.borderColor = 'var(--prism-error)';
                            e.target.style.color = 'var(--prism-error)';
                        },
                        onMouseLeave: (e) => {
                            e.target.style.borderColor = 'var(--prism-gray-600)';
                            e.target.style.color = 'var(--prism-gray-300)';
                        }
                    }, '🚪 Abmelden')
                ])
            ])
        ]),

        React.createElement('main', {
            key: 'main',
            className: 'studio-main'
        }, renderContent()),

        React.createElement('footer', {
            key: 'footer',
            style: {
                marginTop: 'var(--prism-space-3xl)',
                paddingTop: 'var(--prism-space-xl)',
                borderTop: '1px solid var(--prism-gray-700)',
                textAlign: 'center',
                color: 'var(--prism-gray-500)',
                fontSize: 'var(--prism-text-sm)'
            }
        }, [
            React.createElement('p', {
                key: 'copyright'
            }, `© ${new Date().getFullYear()} PRISM Platform - Studio Management Dashboard`)
        ])
    ]);
}

// Export the component globally
window.StudioApp = StudioApp;
