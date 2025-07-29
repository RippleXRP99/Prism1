// Studio Dashboard Component
function StudioDashboard({ studio, setActiveTab }) {
    const [stats, setStats] = React.useState({
        totalCreators: 0,
        activeCreators: 0,
        pendingInvites: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        avgCommission: 20
    });

    const [recentActivity, setRecentActivity] = React.useState([]);
    const [showAddCreatorModal, setShowAddCreatorModal] = React.useState(false);
    const [studioKey, setStudioKey] = React.useState('');

    React.useEffect(() => {
        loadDashboardData();
    }, [studio]);

    const loadDashboardData = async () => {
        try {
            // Load studio statistics
            const portfolio = await window.studioAPI.getStudioPortfolio(studio.id);
            const analytics = await window.studioAPI.getStudioAnalytics(studio.id);
            
            if (portfolio.success) {
                const creators = portfolio.creators || [];
                setStats(prev => ({
                    ...prev,
                    totalCreators: creators.length,
                    activeCreators: creators.filter(c => c.status === 'active').length,
                    pendingInvites: creators.filter(c => c.status === 'pending').length
                }));
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleAddCreator = () => {
        setShowAddCreatorModal(true);
    };

    return React.createElement('div', {
        className: 'animate-in'
    }, [
        React.createElement('div', {
            key: 'header',
            style: { marginBottom: 'var(--prism-space-2xl)' }
        }, [
            React.createElement('h1', {
                key: 'title',
                className: 'gradient-studio',
                style: { fontSize: 'var(--prism-text-4xl)', marginBottom: 'var(--prism-space-sm)' }
            }, `Willkommen, ${studio.name}`),
            React.createElement('p', {
                key: 'subtitle',
                style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-lg)' }
            }, 'Verwalten Sie Ihr Creator Portfolio und überwachen Sie die Performance')
        ]),

        React.createElement('div', {
            key: 'stats',
            className: 'stats-grid'
        }, [
            React.createElement('div', {
                key: 'total-creators',
                className: 'card-studio'
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: '700',
                        color: 'var(--studio-primary)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, stats.totalCreators),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                }, 'Gesamt Creator')
            ]),

            React.createElement('div', {
                key: 'active-creators',
                className: 'card-studio'
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: '700',
                        color: 'var(--prism-success)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, stats.activeCreators),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                }, 'Aktive Creator')
            ]),

            React.createElement('div', {
                key: 'pending-invites',
                className: 'card-studio'
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: '700',
                        color: 'var(--prism-warning)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, stats.pendingInvites),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                }, 'Offene Einladungen')
            ]),

            React.createElement('div', {
                key: 'monthly-earnings',
                className: 'card-studio'
            }, [
                React.createElement('div', {
                    key: 'value',
                    style: {
                        fontSize: 'var(--prism-text-3xl)',
                        fontWeight: '700',
                        color: 'var(--studio-accent)',
                        marginBottom: 'var(--prism-space-sm)'
                    }
                }, `€${stats.monthlyEarnings.toLocaleString()}`),
                React.createElement('div', {
                    key: 'label',
                    style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                }, 'Monatliche Einnahmen')
            ])
        ]),

        React.createElement('div', {
            key: 'actions',
            className: 'feature-grid'
        }, [
            React.createElement('div', {
                key: 'add-creator',
                className: 'card-studio'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-md)',
                        color: 'var(--studio-primary)'
                    }
                }, '👥 Creator hinzufügen'),
                React.createElement('p', {
                    key: 'description',
                    style: { 
                        color: 'var(--prism-gray-400)', 
                        marginBottom: 'var(--prism-space-lg)',
                        lineHeight: '1.6'
                    }
                }, 'Verwenden Sie Studio Keys um Creator zu Ihrem Portfolio hinzuzufügen'),
                React.createElement('button', {
                    key: 'button',
                    className: 'btn-studio',
                    onClick: handleAddCreator
                }, [
                    React.createElement('span', { key: 'icon' }, '➕'),
                    React.createElement('span', { key: 'text' }, 'Creator Key eingeben')
                ])
            ]),

            React.createElement('div', {
                key: 'manage-portfolio',
                className: 'card-studio'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-md)',
                        color: 'var(--studio-primary)'
                    }
                }, '📊 Portfolio verwalten'),
                React.createElement('p', {
                    key: 'description',
                    style: { 
                        color: 'var(--prism-gray-400)', 
                        marginBottom: 'var(--prism-space-lg)',
                        lineHeight: '1.6'
                    }
                }, 'Verwalten Sie Ihre Creator-Beziehungen und Einstellungen'),
                React.createElement('button', {
                    key: 'button',
                    className: 'btn-studio',
                    onClick: () => setActiveTab('creators')
                }, [
                    React.createElement('span', { key: 'icon' }, '👥'),
                    React.createElement('span', { key: 'text' }, 'Portfolio öffnen')
                ])
            ]),

            React.createElement('div', {
                key: 'analytics',
                className: 'card-studio'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-md)',
                        color: 'var(--studio-primary)'
                    }
                }, '📈 Analytics'),
                React.createElement('p', {
                    key: 'description',
                    style: { 
                        color: 'var(--prism-gray-400)', 
                        marginBottom: 'var(--prism-space-lg)',
                        lineHeight: '1.6'
                    }
                }, 'Detaillierte Performance-Analysen und Insights'),
                React.createElement('button', {
                    key: 'button',
                    className: 'btn-studio',
                    onClick: () => setActiveTab('analytics')
                }, [
                    React.createElement('span', { key: 'icon' }, '📊'),
                    React.createElement('span', { key: 'text' }, 'Analytics öffnen')
                ])
            ])
        ]),

        // Add Creator Modal
        showAddCreatorModal && React.createElement(AddCreatorModal, {
            key: 'add-creator-modal',
            onClose: () => setShowAddCreatorModal(false),
            onSuccess: () => {
                setShowAddCreatorModal(false);
                loadDashboardData();
            }
        })
    ]);
}

// Add Creator Modal Component
function AddCreatorModal({ onClose, onSuccess }) {
    const [studioKey, setStudioKey] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await window.studioAPI.addCreatorWithKey(studioKey, {});
            
            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || 'Fehler beim Hinzufügen des Creators');
            }
        } catch (error) {
            setError('Ein Fehler ist aufgetreten');
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement('div', {
        className: 'modal-studio'
    }, [
        React.createElement('div', {
            key: 'modal-content',
            className: 'modal-content-studio'
        }, [
            React.createElement('div', {
                key: 'header',
                style: { 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 'var(--prism-space-xl)'
                }
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { fontSize: 'var(--prism-text-xl)', color: 'var(--studio-primary)' }
                }, 'Creator hinzufügen'),
                React.createElement('button', {
                    key: 'close',
                    onClick: onClose,
                    style: {
                        background: 'none',
                        border: 'none',
                        color: 'var(--prism-gray-400)',
                        fontSize: 'var(--prism-text-xl)',
                        cursor: 'pointer'
                    }
                }, '✕')
            ]),

            React.createElement('form', {
                key: 'form',
                onSubmit: handleSubmit
            }, [
                React.createElement('div', {
                    key: 'studio-key',
                    style: { marginBottom: 'var(--prism-space-lg)' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: { 
                            display: 'block', 
                            marginBottom: 'var(--prism-space-sm)',
                            color: 'var(--prism-gray-300)',
                            fontWeight: '600'
                        }
                    }, 'Studio Key'),
                    React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: studioKey,
                        onChange: (e) => setStudioKey(e.target.value),
                        className: 'input-studio',
                        placeholder: 'sk_1234567890_abcdef...',
                        required: true
                    }),
                    React.createElement('small', {
                        key: 'help',
                        style: { color: 'var(--prism-gray-500)', marginTop: 'var(--prism-space-xs)', display: 'block' }
                    }, 'Der Creator muss Ihnen diesen Key bereitstellen')
                ]),

                error && React.createElement('div', {
                    key: 'error',
                    style: {
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--prism-error)',
                        borderRadius: 'var(--prism-radius-md)',
                        padding: 'var(--prism-space-md)',
                        marginBottom: 'var(--prism-space-lg)',
                        color: 'var(--prism-error)'
                    }
                }, error),

                React.createElement('div', {
                    key: 'actions',
                    style: { display: 'flex', gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('button', {
                        key: 'cancel',
                        type: 'button',
                        onClick: onClose,
                        style: {
                            flex: 1,
                            padding: 'var(--prism-space-md)',
                            border: '1px solid var(--prism-gray-600)',
                            borderRadius: 'var(--prism-radius-md)',
                            background: 'transparent',
                            color: 'var(--prism-gray-300)',
                            cursor: 'pointer'
                        }
                    }, 'Abbrechen'),
                    React.createElement('button', {
                        key: 'submit',
                        type: 'submit',
                        className: 'btn-studio',
                        disabled: isLoading,
                        style: { 
                            flex: 1,
                            opacity: isLoading ? 0.7 : 1
                        }
                    }, isLoading ? 'Wird hinzugefügt...' : 'Creator hinzufügen')
                ])
            ])
        ])
    ]);
}
