// Studio Management Component - Model Management & Studio Access Control
function StudioManagement({ setActiveTab }) {
    // State Management
    const [activeView, setActiveView] = React.useState('dashboard'); // dashboard, models, permissions, analytics
    const [studios, setStudios] = React.useState(() => {
        const saved = localStorage.getItem('prism-studios');
        return saved ? JSON.parse(saved) : [];
    });
    const [models, setModels] = React.useState(() => {
        const saved = localStorage.getItem('prism-models');
        return saved ? JSON.parse(saved) : [];
    });
    const [studioKeys, setStudioKeys] = React.useState(() => {
        const saved = localStorage.getItem('prism-studio-keys');
        return saved ? JSON.parse(saved) : [];
    });
    const [showCreateStudioModal, setShowCreateStudioModal] = React.useState(false);
    const [showCreateModelModal, setShowCreateModelModal] = React.useState(false);
    const [showKeyGeneratorModal, setShowKeyGeneratorModal] = React.useState(false);
    const [selectedStudio, setSelectedStudio] = React.useState(null);
    const [selectedModel, setSelectedModel] = React.useState(null);
    const [studioForm, setStudioForm] = React.useState({
        name: '',
        email: '',
        description: '',
        website: '',
        commission: 15,
        specialties: ''
    });
    const [modelForm, setModelForm] = React.useState({
        name: '',
        email: '',
        stageName: '',
        category: 'cam',
        description: '',
        portfolio: [],
        socialMedia: {},
        commission: 20,
        studioId: ''
    });
    const [keyForm, setKeyForm] = React.useState({
        studioId: '',
        permission: 'view',
        description: '',
        expiryDays: 365
    });

    // Access Permissions
    const accessPermissions = [
        {
            id: 'view',
            name: 'View Only',
            description: 'Statistiken, VODs, Videos, Bilder, geplanter Content, Finanzen ansehen',
            color: '#3b82f6',
            icon: '👁️',
            permissions: [
                'view_statistics',
                'view_vods',
                'view_content',
                'view_finances',
                'view_schedule'
            ]
        },
        {
            id: 'support',
            name: 'Support Access',
            description: 'Alles aus View + Content planen, Fan-Interaktionen, Stream-Einstellungen, Content bearbeiten',
            color: '#f59e0b',
            icon: '🛠️',
            permissions: [
                'view_statistics',
                'view_vods',
                'view_content',
                'view_finances',
                'view_schedule',
                'plan_content',
                'manage_fans',
                'stream_settings',
                'edit_content'
            ]
        },
        {
            id: 'full',
            name: 'Full Access',
            description: 'Voller Zugriff auf alle Funktionen außer Stream starten',
            color: '#ef4444',
            icon: '🔑',
            permissions: [
                'view_statistics',
                'view_vods',
                'view_content',
                'view_finances',
                'view_schedule',
                'plan_content',
                'manage_fans',
                'stream_settings',
                'edit_content',
                'manage_settings',
                'financial_management',
                'full_content_management'
            ]
        }
    ];

    // Model Categories
    const modelCategories = [
        { id: 'cam', label: 'Cam Model', icon: '📹', color: '#ef4444' },
        { id: 'content', label: 'Content Creator', icon: '🎬', color: '#3b82f6' },
        { id: 'influencer', label: 'Influencer', icon: '⭐', color: '#f59e0b' },
        { id: 'fetish', label: 'Fetish Model', icon: '🔥', color: '#8b5cf6' },
        { id: 'escort', label: 'Escort', icon: '💎', color: '#06b6d4' },
        { id: 'onlyfans', label: 'OnlyFans Creator', icon: '💕', color: '#ec4899' }
    ];

    // Save to localStorage
    React.useEffect(() => {
        localStorage.setItem('prism-studios', JSON.stringify(studios));
    }, [studios]);

    React.useEffect(() => {
        localStorage.setItem('prism-models', JSON.stringify(models));
    }, [models]);

    React.useEffect(() => {
        localStorage.setItem('prism-studio-keys', JSON.stringify(studioKeys));
    }, [studioKeys]);

    // Helper Functions
    const generateStudioKey = () => {
        return 'sk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 12);
    };

    const getCategoryConfig = (categoryId) => {
        return modelCategories.find(cat => cat.id === categoryId) || modelCategories[0];
    };

    const getPermissionConfig = (permissionId) => {
        return accessPermissions.find(perm => perm.id === permissionId) || accessPermissions[0];
    };

    // Studio Management Functions
    const createStudio = () => {
        if (!studioForm.name.trim()) return;

        const newStudio = {
            id: 'studio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: studioForm.name,
            email: studioForm.email,
            description: studioForm.description,
            website: studioForm.website,
            commission: parseFloat(studioForm.commission) || 15,
            specialties: studioForm.specialties.split(',').map(s => s.trim()).filter(s => s),
            createdAt: new Date().toISOString(),
            status: 'active',
            models: [],
            totalEarnings: 0,
            monthlyEarnings: 0
        };

        setStudios(prev => [...prev, newStudio]);
        setStudioForm({
            name: '',
            email: '',
            description: '',
            website: '',
            commission: 15,
            specialties: ''
        });
        setShowCreateStudioModal(false);
    };

    const updateStudio = (studioId, updates) => {
        setStudios(prev => prev.map(studio => 
            studio.id === studioId ? { ...studio, ...updates } : studio
        ));
    };

    const deleteStudio = (studioId) => {
        setStudios(prev => prev.filter(studio => studio.id !== studioId));
        setStudioKeys(prev => prev.filter(key => key.studioId !== studioId));
        setModels(prev => prev.map(model => 
            model.studioId === studioId ? { ...model, studioId: '' } : model
        ));
    };

    // Model Management Functions
    const createModel = () => {
        if (!modelForm.name.trim()) return;

        const newModel = {
            id: 'model_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: modelForm.name,
            email: modelForm.email,
            stageName: modelForm.stageName || modelForm.name,
            category: modelForm.category,
            description: modelForm.description,
            portfolio: [],
            socialMedia: {},
            commission: parseFloat(modelForm.commission) || 20,
            studioId: modelForm.studioId,
            createdAt: new Date().toISOString(),
            status: 'active',
            earnings: {
                total: 0,
                monthly: 0,
                weekly: 0,
                daily: 0
            },
            statistics: {
                totalViews: 0,
                totalShows: 0,
                averageRating: 0,
                fanCount: 0
            },
            schedule: [],
            content: []
        };

        setModels(prev => [...prev, newModel]);
        
        // Update studio's model list
        if (modelForm.studioId) {
            updateStudio(modelForm.studioId, {
                models: [...(studios.find(s => s.id === modelForm.studioId)?.models || []), newModel.id]
            });
        }

        setModelForm({
            name: '',
            email: '',
            stageName: '',
            category: 'cam',
            description: '',
            portfolio: [],
            socialMedia: {},
            commission: 20,
            studioId: ''
        });
        setShowCreateModelModal(false);
    };

    const updateModel = (modelId, updates) => {
        setModels(prev => prev.map(model => 
            model.id === modelId ? { ...model, ...updates } : model
        ));
    };

    const deleteModel = (modelId) => {
        const model = models.find(m => m.id === modelId);
        setModels(prev => prev.filter(model => model.id !== modelId));
        
        // Remove from studio's model list
        if (model?.studioId) {
            const studio = studios.find(s => s.id === model.studioId);
            if (studio) {
                updateStudio(studio.id, {
                    models: studio.models.filter(id => id !== modelId)
                });
            }
        }
    };

    // Studio Key Management
    const generateKey = () => {
        if (!keyForm.studioId || !keyForm.permission) return;

        const newKey = {
            id: 'key_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            key: generateStudioKey(),
            studioId: keyForm.studioId,
            permission: keyForm.permission,
            description: keyForm.description,
            createdAt: new Date().toISOString(),
            expiresAt: keyForm.expiryDays > 0 
                ? new Date(Date.now() + keyForm.expiryDays * 24 * 60 * 60 * 1000).toISOString()
                : null,
            isActive: true,
            lastUsed: null,
            usageCount: 0
        };

        setStudioKeys(prev => [...prev, newKey]);
        setKeyForm({
            studioId: '',
            permission: 'view',
            description: '',
            expiryDays: 365
        });
        setShowKeyGeneratorModal(false);
    };

    const revokeKey = (keyId) => {
        setStudioKeys(prev => prev.map(key => 
            key.id === keyId ? { ...key, isActive: false } : key
        ));
    };

    const deleteKey = (keyId) => {
        setStudioKeys(prev => prev.filter(key => key.id !== keyId));
    };

    // Analytics Functions
    const getStudioAnalytics = (studioId) => {
        const studio = studios.find(s => s.id === studioId);
        const studioModels = models.filter(m => m.studioId === studioId);
        
        return {
            totalModels: studioModels.length,
            activeModels: studioModels.filter(m => m.status === 'active').length,
            totalEarnings: studioModels.reduce((sum, model) => sum + model.earnings.total, 0),
            monthlyEarnings: studioModels.reduce((sum, model) => sum + model.earnings.monthly, 0),
            totalViews: studioModels.reduce((sum, model) => sum + model.statistics.totalViews, 0),
            averageRating: studioModels.length > 0 
                ? studioModels.reduce((sum, model) => sum + model.statistics.averageRating, 0) / studioModels.length
                : 0,
            commission: studio?.commission || 0
        };
    };

    const getOverallAnalytics = () => {
        return {
            totalStudios: studios.length,
            activeStudios: studios.filter(s => s.status === 'active').length,
            totalModels: models.length,
            activeModels: models.filter(m => m.status === 'active').length,
            totalEarnings: models.reduce((sum, model) => sum + model.earnings.total, 0),
            monthlyEarnings: models.reduce((sum, model) => sum + model.earnings.monthly, 0),
            activeKeys: studioKeys.filter(k => k.isActive).length,
            totalKeys: studioKeys.length
        };
    };

    // Render Functions
    const renderDashboard = () => {
        const analytics = getOverallAnalytics();

        return React.createElement('div', {
            style: {
                width: '100%'
            }
        }, [
            React.createElement('h2', {
                key: 'title',
                style: {
                    margin: '0 0 2rem 0',
                    color: 'var(--prism-text)',
                    fontSize: '2rem'
                }
            }, '🏢 Studio Management Dashboard'),

            // Quick Stats
            React.createElement('div', {
                key: 'stats',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }
            }, [
                React.createElement('div', {
                    key: 'studios',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '16px',
                        padding: '2rem',
                        borderLeft: '6px solid #3b82f6',
                        textAlign: 'center'
                    }
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: {
                            fontSize: '3rem',
                            marginBottom: '1rem'
                        }
                    }, '🏢'),
                    React.createElement('div', {
                        key: 'value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#3b82f6',
                            marginBottom: '0.5rem'
                        }
                    }, analytics.totalStudios),
                    React.createElement('div', {
                        key: 'label',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: '1rem'
                        }
                    }, 'Studios'),
                    React.createElement('div', {
                        key: 'sub',
                        style: {
                            color: 'var(--prism-success)',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem'
                        }
                    }, `${analytics.activeStudios} aktiv`)
                ]),

                React.createElement('div', {
                    key: 'models',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '16px',
                        padding: '2rem',
                        borderLeft: '6px solid #ec4899',
                        textAlign: 'center'
                    }
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: {
                            fontSize: '3rem',
                            marginBottom: '1rem'
                        }
                    }, '👤'),
                    React.createElement('div', {
                        key: 'value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#ec4899',
                            marginBottom: '0.5rem'
                        }
                    }, analytics.totalModels),
                    React.createElement('div', {
                        key: 'label',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: '1rem'
                        }
                    }, 'Models'),
                    React.createElement('div', {
                        key: 'sub',
                        style: {
                            color: 'var(--prism-success)',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem'
                        }
                    }, `${analytics.activeModels} aktiv`)
                ]),

                React.createElement('div', {
                    key: 'earnings',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '16px',
                        padding: '2rem',
                        borderLeft: '6px solid #10b981',
                        textAlign: 'center'
                    }
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: {
                            fontSize: '3rem',
                            marginBottom: '1rem'
                        }
                    }, '💰'),
                    React.createElement('div', {
                        key: 'value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#10b981',
                            marginBottom: '0.5rem'
                        }
                    }, `€${analytics.monthlyEarnings.toLocaleString()}`),
                    React.createElement('div', {
                        key: 'label',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: '1rem'
                        }
                    }, 'Monatlich'),
                    React.createElement('div', {
                        key: 'sub',
                        style: {
                            color: 'var(--prism-gray-300)',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem'
                        }
                    }, `€${analytics.totalEarnings.toLocaleString()} gesamt`)
                ]),

                React.createElement('div', {
                    key: 'keys',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '16px',
                        padding: '2rem',
                        borderLeft: '6px solid #f59e0b',
                        textAlign: 'center'
                    }
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: {
                            fontSize: '3rem',
                            marginBottom: '1rem'
                        }
                    }, '🔑'),
                    React.createElement('div', {
                        key: 'value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#f59e0b',
                            marginBottom: '0.5rem'
                        }
                    }, analytics.activeKeys),
                    React.createElement('div', {
                        key: 'label',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: '1rem'
                        }
                    }, 'Aktive Keys'),
                    React.createElement('div', {
                        key: 'sub',
                        style: {
                            color: 'var(--prism-gray-300)',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem'
                        }
                    }, `${analytics.totalKeys} gesamt`)
                ])
            ]),

            // Quick Actions
            React.createElement('div', {
                key: 'actions',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }
            }, [
                React.createElement('div', {
                    key: 'create-studio',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '12px',
                        padding: '2rem',
                        border: '2px dashed #3b82f6',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                    },
                    onClick: () => setShowCreateStudioModal(true),
                    onMouseEnter: (e) => e.target.style.transform = 'translateY(-2px)',
                    onMouseLeave: (e) => e.target.style.transform = 'translateY(0)'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: {
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            color: '#3b82f6'
                        }
                    }, '🏢'),
                    React.createElement('h3', {
                        key: 'title',
                        style: {
                            margin: '0 0 0.5rem 0',
                            color: 'var(--prism-text)'
                        }
                    }, 'Neues Studio'),
                    React.createElement('p', {
                        key: 'desc',
                        style: {
                            margin: 0,
                            color: 'var(--prism-gray-400)'
                        }
                    }, 'Studio hinzufügen und verwalten')
                ]),

                React.createElement('div', {
                    key: 'add-model',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '12px',
                        padding: '2rem',
                        border: '2px dashed #ec4899',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                    },
                    onClick: () => setShowCreateModelModal(true),
                    onMouseEnter: (e) => e.target.style.transform = 'translateY(-2px)',
                    onMouseLeave: (e) => e.target.style.transform = 'translateY(0)'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: {
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            color: '#ec4899'
                        }
                    }, '👤'),
                    React.createElement('h3', {
                        key: 'title',
                        style: {
                            margin: '0 0 0.5rem 0',
                            color: 'var(--prism-text)'
                        }
                    }, 'Model hinzufügen'),
                    React.createElement('p', {
                        key: 'desc',
                        style: {
                            margin: 0,
                            color: 'var(--prism-gray-400)'
                        }
                    }, 'Neues Model zum Portfolio')
                ]),

                React.createElement('div', {
                    key: 'generate-key',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '12px',
                        padding: '2rem',
                        border: '2px dashed #f59e0b',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                    },
                    onClick: () => setShowKeyGeneratorModal(true),
                    onMouseEnter: (e) => e.target.style.transform = 'translateY(-2px)',
                    onMouseLeave: (e) => e.target.style.transform = 'translateY(0)'
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: {
                            fontSize: '3rem',
                            marginBottom: '1rem',
                            color: '#f59e0b'
                        }
                    }, '🔑'),
                    React.createElement('h3', {
                        key: 'title',
                        style: {
                            margin: '0 0 0.5rem 0',
                            color: 'var(--prism-text)'
                        }
                    }, 'Studio Key generieren'),
                    React.createElement('p', {
                        key: 'desc',
                        style: {
                            margin: 0,
                            color: 'var(--prism-gray-400)'
                        }
                    }, 'Zugriffsberechtigung erstellen')
                ])
            ]),

            // Recent Activity
            React.createElement('div', {
                key: 'recent',
                style: {
                    background: 'var(--prism-card)',
                    borderRadius: '16px',
                    padding: '2rem'
                }
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: {
                        margin: '0 0 1.5rem 0',
                        color: 'var(--prism-text)'
                    }
                }, '📊 Letzte Aktivitäten'),
                React.createElement('div', {
                    key: 'activity',
                    style: {
                        color: 'var(--prism-gray-400)',
                        textAlign: 'center',
                        padding: '3rem'
                    }
                }, 'Aktivitäts-Feed wird hier angezeigt...')
            ])
        ]);
    };

    const renderStudioList = () => {
        return React.createElement('div', {
            style: {
                width: '100%'
            }
        }, [
            React.createElement('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }
            }, [
                React.createElement('h2', {
                    key: 'title',
                    style: {
                        margin: 0,
                        color: 'var(--prism-text)'
                    }
                }, '🏢 Studios verwalten'),
                React.createElement('button', {
                    key: 'add',
                    onClick: () => setShowCreateStudioModal(true),
                    style: {
                        background: 'var(--prism-purple)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }
                }, '+ Neues Studio')
            ]),

            React.createElement('div', {
                key: 'studios',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '1.5rem'
                }
            }, studios.map(studio => {
                const analytics = getStudioAnalytics(studio.id);
                
                return React.createElement('div', {
                    key: studio.id,
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '16px',
                        padding: '2rem',
                        border: '1px solid var(--prism-gray-700)',
                        transition: 'all 0.2s ease'
                    },
                    onMouseEnter: (e) => e.target.style.transform = 'translateY(-2px)',
                    onMouseLeave: (e) => e.target.style.transform = 'translateY(0)'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1.5rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'info'
                        }, [
                            React.createElement('h3', {
                                key: 'name',
                                style: {
                                    margin: '0 0 0.5rem 0',
                                    color: 'var(--prism-text)',
                                    fontSize: '1.5rem'
                                }
                            }, studio.name),
                            React.createElement('p', {
                                key: 'email',
                                style: {
                                    margin: 0,
                                    color: 'var(--prism-gray-400)',
                                    fontSize: '0.9rem'
                                }
                            }, studio.email)
                        ]),
                        React.createElement('div', {
                            key: 'actions',
                            style: {
                                display: 'flex',
                                gap: '0.5rem'
                            }
                        }, [
                            React.createElement('button', {
                                key: 'edit',
                                onClick: () => setSelectedStudio(studio),
                                style: {
                                    background: 'var(--prism-gray-700)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    color: 'var(--prism-text)',
                                    cursor: 'pointer'
                                }
                            }, '✏️'),
                            React.createElement('button', {
                                key: 'delete',
                                onClick: () => deleteStudio(studio.id),
                                style: {
                                    background: '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    color: 'white',
                                    cursor: 'pointer'
                                }
                            }, '🗑️')
                        ])
                    ]),

                    studio.description && React.createElement('p', {
                        key: 'description',
                        style: {
                            margin: '0 0 1.5rem 0',
                            color: 'var(--prism-gray-300)',
                            lineHeight: '1.5'
                        }
                    }, studio.description),

                    React.createElement('div', {
                        key: 'stats',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'models',
                            style: {
                                textAlign: 'center',
                                padding: '1rem',
                                background: 'var(--prism-gray-800)',
                                borderRadius: '8px'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'value',
                                style: {
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#ec4899',
                                    marginBottom: '0.25rem'
                                }
                            }, analytics.totalModels),
                            React.createElement('div', {
                                key: 'label',
                                style: {
                                    fontSize: '0.8rem',
                                    color: 'var(--prism-gray-400)'
                                }
                            }, 'Models')
                        ]),
                        React.createElement('div', {
                            key: 'earnings',
                            style: {
                                textAlign: 'center',
                                padding: '1rem',
                                background: 'var(--prism-gray-800)',
                                borderRadius: '8px'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'value',
                                style: {
                                    fontSize: '1.5rem',
                                    fontWeight: '700',
                                    color: '#10b981',
                                    marginBottom: '0.25rem'
                                }
                            }, `€${analytics.monthlyEarnings.toLocaleString()}`),
                            React.createElement('div', {
                                key: 'label',
                                style: {
                                    fontSize: '0.8rem',
                                    color: 'var(--prism-gray-400)'
                                }
                            }, 'Monatlich')
                        ])
                    ]),

                    React.createElement('div', {
                        key: 'meta',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                            color: 'var(--prism-gray-400)'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'commission'
                        }, `${studio.commission}% Provision`),
                        React.createElement('span', {
                            key: 'status',
                            style: {
                                padding: '0.25rem 0.5rem',
                                background: studio.status === 'active' ? '#10b981' : '#6b7280',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.75rem'
                            }
                        }, studio.status === 'active' ? 'Aktiv' : 'Inaktiv')
                    ])
                ]);
            }))
        ]);
    };

    const renderModelList = () => {
        return React.createElement('div', {
            style: {
                width: '100%'
            }
        }, [
            React.createElement('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }
            }, [
                React.createElement('h2', {
                    key: 'title',
                    style: {
                        margin: 0,
                        color: 'var(--prism-text)'
                    }
                }, '👤 Models verwalten'),
                React.createElement('button', {
                    key: 'add',
                    onClick: () => setShowCreateModelModal(true),
                    style: {
                        background: 'var(--prism-purple)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }
                }, '+ Neues Model')
            ]),

            React.createElement('div', {
                key: 'models',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }
            }, models.map(model => {
                const category = getCategoryConfig(model.category);
                const studio = studios.find(s => s.id === model.studioId);
                
                return React.createElement('div', {
                    key: model.id,
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '16px',
                        padding: '2rem',
                        border: `2px solid ${category.color}20`,
                        borderLeft: `6px solid ${category.color}`,
                        transition: 'all 0.2s ease'
                    },
                    onMouseEnter: (e) => e.target.style.transform = 'translateY(-2px)',
                    onMouseLeave: (e) => e.target.style.transform = 'translateY(0)'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1.5rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'info'
                        }, [
                            React.createElement('h3', {
                                key: 'name',
                                style: {
                                    margin: '0 0 0.25rem 0',
                                    color: 'var(--prism-text)',
                                    fontSize: '1.4rem'
                                }
                            }, `${category.icon} ${model.stageName}`),
                            React.createElement('p', {
                                key: 'real-name',
                                style: {
                                    margin: '0 0 0.25rem 0',
                                    color: 'var(--prism-gray-400)',
                                    fontSize: '0.9rem'
                                }
                            }, model.name),
                            React.createElement('p', {
                                key: 'email',
                                style: {
                                    margin: 0,
                                    color: 'var(--prism-gray-500)',
                                    fontSize: '0.8rem'
                                }
                            }, model.email)
                        ]),
                        React.createElement('div', {
                            key: 'actions',
                            style: {
                                display: 'flex',
                                gap: '0.5rem'
                            }
                        }, [
                            React.createElement('button', {
                                key: 'edit',
                                onClick: () => setSelectedModel(model),
                                style: {
                                    background: 'var(--prism-gray-700)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    color: 'var(--prism-text)',
                                    cursor: 'pointer'
                                }
                            }, '✏️'),
                            React.createElement('button', {
                                key: 'delete',
                                onClick: () => deleteModel(model.id),
                                style: {
                                    background: '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    color: 'white',
                                    cursor: 'pointer'
                                }
                            }, '🗑️')
                        ])
                    ]),

                    React.createElement('div', {
                        key: 'category-studio',
                        style: {
                            display: 'flex',
                            gap: '0.5rem',
                            marginBottom: '1.5rem'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'category',
                            style: {
                                padding: '0.25rem 0.75rem',
                                background: category.color + '20',
                                color: category.color,
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }
                        }, category.label),
                        studio && React.createElement('span', {
                            key: 'studio',
                            style: {
                                padding: '0.25rem 0.75rem',
                                background: 'var(--prism-gray-700)',
                                color: 'var(--prism-text)',
                                borderRadius: '12px',
                                fontSize: '0.8rem'
                            }
                        }, `🏢 ${studio.name}`)
                    ]),

                    model.description && React.createElement('p', {
                        key: 'description',
                        style: {
                            margin: '0 0 1.5rem 0',
                            color: 'var(--prism-gray-300)',
                            lineHeight: '1.5',
                            fontSize: '0.9rem'
                        }
                    }, model.description),

                    React.createElement('div', {
                        key: 'stats',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '0.75rem',
                            marginBottom: '1.5rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'earnings',
                            style: {
                                textAlign: 'center',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                borderRadius: '8px'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'value',
                                style: {
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: '#10b981',
                                    marginBottom: '0.25rem'
                                }
                            }, `€${model.earnings.monthly.toLocaleString()}`),
                            React.createElement('div', {
                                key: 'label',
                                style: {
                                    fontSize: '0.7rem',
                                    color: 'var(--prism-gray-400)'
                                }
                            }, 'Monatlich')
                        ]),
                        React.createElement('div', {
                            key: 'views',
                            style: {
                                textAlign: 'center',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                borderRadius: '8px'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'value',
                                style: {
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: '#3b82f6',
                                    marginBottom: '0.25rem'
                                }
                            }, model.statistics.totalViews.toLocaleString()),
                            React.createElement('div', {
                                key: 'label',
                                style: {
                                    fontSize: '0.7rem',
                                    color: 'var(--prism-gray-400)'
                                }
                            }, 'Views')
                        ]),
                        React.createElement('div', {
                            key: 'rating',
                            style: {
                                textAlign: 'center',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                borderRadius: '8px'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'value',
                                style: {
                                    fontSize: '1.2rem',
                                    fontWeight: '700',
                                    color: '#f59e0b',
                                    marginBottom: '0.25rem'
                                }
                            }, `${model.statistics.averageRating.toFixed(1)}⭐`),
                            React.createElement('div', {
                                key: 'label',
                                style: {
                                    fontSize: '0.7rem',
                                    color: 'var(--prism-gray-400)'
                                }
                            }, 'Rating')
                        ])
                    ]),

                    React.createElement('div', {
                        key: 'meta',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                            color: 'var(--prism-gray-400)'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'commission'
                        }, `${model.commission}% Provision`),
                        React.createElement('span', {
                            key: 'fans'
                        }, `${model.statistics.fanCount} Fans`),
                        React.createElement('span', {
                            key: 'status',
                            style: {
                                padding: '0.25rem 0.5rem',
                                background: model.status === 'active' ? '#10b981' : '#6b7280',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.75rem'
                            }
                        }, model.status === 'active' ? 'Aktiv' : 'Inaktiv')
                    ])
                ]);
            }))
        ]);
    };

    const renderPermissions = () => {
        return React.createElement('div', {
            style: {
                width: '100%'
            }
        }, [
            React.createElement('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }
            }, [
                React.createElement('h2', {
                    key: 'title',
                    style: {
                        margin: 0,
                        color: 'var(--prism-text)'
                    }
                }, '🔑 Studio Berechtigungen'),
                React.createElement('button', {
                    key: 'generate',
                    onClick: () => setShowKeyGeneratorModal(true),
                    style: {
                        background: 'var(--prism-purple)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }
                }, '+ Neuen Key generieren')
            ]),

            // Permission Types Overview
            React.createElement('div', {
                key: 'permission-types',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '3rem'
                }
            }, accessPermissions.map(permission => 
                React.createElement('div', {
                    key: permission.id,
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '16px',
                        padding: '2rem',
                        border: `2px solid ${permission.color}20`,
                        borderLeft: `6px solid ${permission.color}`
                    }
                }, [
                    React.createElement('div', {
                        key: 'header',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'icon',
                            style: {
                                fontSize: '2rem'
                            }
                        }, permission.icon),
                        React.createElement('h3', {
                            key: 'name',
                            style: {
                                margin: 0,
                                color: permission.color,
                                fontSize: '1.3rem'
                            }
                        }, permission.name)
                    ]),
                    React.createElement('p', {
                        key: 'description',
                        style: {
                            margin: '0 0 1.5rem 0',
                            color: 'var(--prism-gray-300)',
                            lineHeight: '1.5'
                        }
                    }, permission.description),
                    React.createElement('div', {
                        key: 'permissions',
                        style: {
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }
                    }, permission.permissions.map(perm => 
                        React.createElement('span', {
                            key: perm,
                            style: {
                                padding: '0.25rem 0.5rem',
                                background: 'var(--prism-gray-700)',
                                color: 'var(--prism-text)',
                                borderRadius: '8px',
                                fontSize: '0.75rem'
                            }
                        }, perm.replace('_', ' '))
                    ))
                ])
            )),

            // Active Keys
            React.createElement('div', {
                key: 'active-keys',
                style: {
                    background: 'var(--prism-card)',
                    borderRadius: '16px',
                    padding: '2rem'
                }
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: {
                        margin: '0 0 1.5rem 0',
                        color: 'var(--prism-text)'
                    }
                }, 'Aktive Studio Keys'),
                
                studioKeys.length === 0 ? React.createElement('div', {
                    key: 'empty',
                    style: {
                        textAlign: 'center',
                        color: 'var(--prism-gray-400)',
                        padding: '3rem'
                    }
                }, 'Noch keine Studio Keys erstellt') : React.createElement('div', {
                    key: 'keys',
                    style: {
                        display: 'grid',
                        gap: '1rem'
                    }
                }, studioKeys.map(key => {
                    const studio = studios.find(s => s.id === key.studioId);
                    const permission = getPermissionConfig(key.permission);
                    const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
                    
                    return React.createElement('div', {
                        key: key.id,
                        style: {
                            background: 'var(--prism-gray-800)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            border: `2px solid ${key.isActive && !isExpired ? permission.color : '#6b7280'}20`,
                            opacity: key.isActive && !isExpired ? 1 : 0.6
                        }
                    }, [
                        React.createElement('div', {
                            key: 'header',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '1rem'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'info'
                            }, [
                                React.createElement('div', {
                                    key: 'studio-perm',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        marginBottom: '0.5rem'
                                    }
                                }, [
                                    React.createElement('h4', {
                                        key: 'studio',
                                        style: {
                                            margin: 0,
                                            color: 'var(--prism-text)'
                                        }
                                    }, studio ? studio.name : 'Gelöschtes Studio'),
                                    React.createElement('span', {
                                        key: 'permission',
                                        style: {
                                            padding: '0.25rem 0.75rem',
                                            background: permission.color + '20',
                                            color: permission.color,
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }
                                    }, `${permission.icon} ${permission.name}`)
                                ]),
                                React.createElement('code', {
                                    key: 'key',
                                    style: {
                                        background: 'var(--prism-gray-900)',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        color: 'var(--prism-gray-300)',
                                        fontFamily: 'monospace'
                                    }
                                }, key.key)
                            ]),
                            React.createElement('div', {
                                key: 'actions',
                                style: {
                                    display: 'flex',
                                    gap: '0.5rem'
                                }
                            }, [
                                React.createElement('button', {
                                    key: 'copy',
                                    onClick: () => navigator.clipboard.writeText(key.key),
                                    style: {
                                        background: 'var(--prism-gray-700)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.5rem',
                                        color: 'var(--prism-text)',
                                        cursor: 'pointer'
                                    }
                                }, '📋'),
                                React.createElement('button', {
                                    key: 'revoke',
                                    onClick: () => revokeKey(key.id),
                                    style: {
                                        background: '#ef4444',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }
                                }, '🚫'),
                                React.createElement('button', {
                                    key: 'delete',
                                    onClick: () => deleteKey(key.id),
                                    style: {
                                        background: '#7f1d1d',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.5rem',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }
                                }, '🗑️')
                            ])
                        ]),
                        
                        React.createElement('div', {
                            key: 'meta',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.8rem',
                                color: 'var(--prism-gray-400)'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'created'
                            }, `Erstellt: ${new Date(key.createdAt).toLocaleDateString('de-DE')}`),
                            key.expiresAt && React.createElement('span', {
                                key: 'expires',
                                style: {
                                    color: isExpired ? '#ef4444' : 'var(--prism-gray-400)'
                                }
                            }, `Läuft ab: ${new Date(key.expiresAt).toLocaleDateString('de-DE')}`),
                            React.createElement('span', {
                                key: 'usage'
                            }, `${key.usageCount} mal verwendet`),
                            React.createElement('span', {
                                key: 'status',
                                style: {
                                    padding: '0.25rem 0.5rem',
                                    background: key.isActive && !isExpired ? '#10b981' : '#ef4444',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem'
                                }
                            }, key.isActive && !isExpired ? 'Aktiv' : isExpired ? 'Abgelaufen' : 'Deaktiviert')
                        ])
                    ]);
                }))
            ])
        ]);
    };

    // Modal Render Functions
    const renderCreateStudioModal = () => {
        if (!showCreateStudioModal) return null;

        return React.createElement('div', {
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }
        }, [
            React.createElement('div', {
                key: 'modal',
                style: {
                    background: 'var(--prism-card)',
                    borderRadius: '16px',
                    padding: '2rem',
                    width: '90%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: {
                        margin: '0 0 2rem 0',
                        color: 'var(--prism-text)'
                    }
                }, '🏢 Neues Studio erstellen'),

                React.createElement('div', {
                    key: 'form',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }
                }, [
                    React.createElement('input', {
                        key: 'name',
                        type: 'text',
                        placeholder: 'Studio Name',
                        value: studioForm.name,
                        onChange: (e) => setStudioForm(prev => ({ ...prev, name: e.target.value })),
                        style: {
                            padding: '0.75rem',
                            background: 'var(--prism-gray-800)',
                            border: '1px solid var(--prism-gray-600)',
                            borderRadius: '8px',
                            color: 'var(--prism-text)',
                            fontSize: '1rem'
                        }
                    })
                ]),

                React.createElement('div', {
                    key: 'actions',
                    style: {
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '2rem'
                    }
                }, [
                    React.createElement('button', {
                        key: 'cancel',
                        onClick: () => setShowCreateStudioModal(false),
                        style: {
                            flex: 1,
                            padding: '0.75rem',
                            background: 'var(--prism-gray-700)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--prism-text)',
                            cursor: 'pointer'
                        }
                    }, 'Abbrechen'),
                    React.createElement('button', {
                        key: 'create',
                        onClick: createStudio,
                        style: {
                            flex: 1,
                            padding: '0.75rem',
                            background: 'var(--prism-purple)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }
                    }, 'Studio erstellen')
                ])
            ])
        ]);
    };

    const renderCreateModelModal = () => {
        if (!showCreateModelModal) return null;
        return null; // Simplified for now
    };

    const renderKeyGeneratorModal = () => {
        if (!showKeyGeneratorModal) return null;
        return null; // Simplified for now
    };

    return React.createElement('div', {
        style: {
            padding: '2rem',
            background: 'var(--prism-bg)',
            minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }
    }, [
        // Navigation
        React.createElement('div', {
            key: 'nav',
            style: {
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                background: 'var(--prism-card)',
                padding: '1rem',
                borderRadius: '16px'
            }
        }, [
            React.createElement('button', {
                key: 'dashboard',
                onClick: () => setActiveView('dashboard'),
                style: {
                    padding: '0.75rem 1.5rem',
                    background: activeView === 'dashboard' ? 'var(--prism-purple)' : 'transparent',
                    color: activeView === 'dashboard' ? 'white' : 'var(--prism-text)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                }
            }, '📊 Dashboard'),
            React.createElement('button', {
                key: 'studios',
                onClick: () => setActiveView('studios'),
                style: {
                    padding: '0.75rem 1.5rem',
                    background: activeView === 'studios' ? 'var(--prism-purple)' : 'transparent',
                    color: activeView === 'studios' ? 'white' : 'var(--prism-text)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                }
            }, '🏢 Studios'),
            React.createElement('button', {
                key: 'models',
                onClick: () => setActiveView('models'),
                style: {
                    padding: '0.75rem 1.5rem',
                    background: activeView === 'models' ? 'var(--prism-purple)' : 'transparent',
                    color: activeView === 'models' ? 'white' : 'var(--prism-text)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                }
            }, '👤 Models'),
            React.createElement('button', {
                key: 'permissions',
                onClick: () => setActiveView('permissions'),
                style: {
                    padding: '0.75rem 1.5rem',
                    background: activeView === 'permissions' ? 'var(--prism-purple)' : 'transparent',
                    color: activeView === 'permissions' ? 'white' : 'var(--prism-text)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                }
            }, '🔑 Berechtigungen')
        ]),

        // Content Area
        React.createElement('div', {
            key: 'content',
            style: {
                width: '100%'
            }
        }, [
            activeView === 'dashboard' && renderDashboard(),
            activeView === 'studios' && renderStudioList(),
            activeView === 'models' && renderModelList(),
            activeView === 'permissions' && renderPermissions()
        ]),

        // Modals
        renderCreateStudioModal(),
        renderCreateModelModal(),
        renderKeyGeneratorModal()
    ]);
}
