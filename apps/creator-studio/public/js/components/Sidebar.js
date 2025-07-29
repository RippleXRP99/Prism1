// Sidebar Component for Creator Studio
function Sidebar({ activeTab, onTabChange, user }) {
    // Fallback navigation items if constants haven't loaded yet
    const fallbackNavItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Statistiken & Quick Actions' },
        { id: 'media-library', icon: '📁', label: 'Media Library', description: 'Upload & Content Management' },
        { id: 'streaming-studio', icon: '🎥', label: 'Livestreaming Studio', description: 'Multi-Cam, Szenen & Chat' }
    ];
    
    const navigationItems = window.navItems || fallbackNavItems;
    
    return React.createElement('div', {
        className: 'sidebar'
    }, [
        React.createElement('div', {
            key: 'logo',
            className: 'logo-creator'
        }, [
            React.createElement('div', {
                key: 'icon',
                className: 'logo-icon-creator'
            }, '🎨'),
            'Creator Studio'
        ]),
        
        user && React.createElement('div', {
            key: 'userInfo',
            className: 'card-prism',
            style: {
                marginBottom: 'var(--prism-space-2xl)',
                padding: 'var(--prism-space-lg)',
                background: 'var(--prism-gray-700)'
            }
        }, [
            React.createElement('div', {
                key: 'userHeader',
                className: 'flex-prism',
                style: { marginBottom: 'var(--prism-space-sm)' }
            }, [
                React.createElement('div', {
                    key: 'avatar',
                    style: {
                        width: '40px',
                        height: '40px',
                        background: 'var(--prism-gradient-primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 'var(--prism-space-md)',
                        color: 'white',
                        fontWeight: '600'
                    }
                }, (user.profile?.displayName || user.username).charAt(0).toUpperCase()),
                React.createElement('div', {
                    key: 'userDetails'
                }, [
                    React.createElement('div', {
                        key: 'name',
                        style: { fontWeight: '600', color: 'var(--prism-gray-100)' }
                    }, user.profile?.displayName || user.username),
                    React.createElement('div', {
                        key: 'email',
                        style: { fontSize: 'var(--prism-text-sm)', color: 'var(--prism-gray-400)' }
                    }, user.email)
                ])
            ]),
            React.createElement('div', {
                key: 'status',
                className: 'status'
            }, 'Creator Account')
        ]),
        
        React.createElement('nav', {
            key: 'navigation',
            style: { flex: 1 }
        }, navigationItems.map(item => 
            React.createElement('div', {
                key: item.id,
                className: 'nav-item ' + (activeTab === item.id ? 'active' : ''),
                onClick: () => onTabChange(item.id),
                title: item.description,
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: 'var(--prism-space-md)',
                    marginBottom: 'var(--prism-space-xs)'
                }
            }, [
                React.createElement('div', {
                    key: 'itemHeader',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%'
                    }
                }, [
                    React.createElement('span', {
                        key: 'icon',
                        style: { fontSize: 'var(--prism-text-lg)', marginRight: 'var(--prism-space-sm)' }
                    }, item.icon),
                    React.createElement('span', {
                        key: 'label',
                        style: { fontWeight: '600' }
                    }, item.label)
                ]),
                React.createElement('div', {
                    key: 'description',
                    style: {
                        fontSize: 'var(--prism-text-xs)',
                        color: 'var(--prism-gray-400)',
                        marginTop: 'var(--prism-space-xs)',
                        marginLeft: '28px',
                        opacity: activeTab === item.id ? 1 : 0.7
                    }
                }, item.description)
            ])
        )),
        
        React.createElement('div', {
            key: 'footer',
            style: {
                marginTop: 'var(--prism-space-2xl)',
                paddingTop: 'var(--prism-space-xl)',
                borderTop: '1px solid var(--prism-gray-700)'
            }
        }, React.createElement('a', {
            href: 'http://localhost:3000',
            target: '_blank',
            className: 'btn-prism btn-prism-dark',
            style: { width: '100%', justifyContent: 'center' }
        }, [
            React.createElement('span', { key: 'icon' }, '🔗'),
            'View Consumer Site'
        ]))
    ]);
}
