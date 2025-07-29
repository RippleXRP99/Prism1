// Creator Settings Component - Profile & Studio Key Management
function CreatorSettings({ user, setActiveTab }) {
    const [profile, setProfile] = React.useState({
        name: user?.name || '',
        stageName: user?.stageName || '',
        email: user?.email || '',
        category: user?.category || 'content',
        description: user?.description || '',
        socialMedia: user?.socialMedia || {},
        preferences: user?.preferences || {
            notifications: true,
            autoPublish: false,
            privacy: 'public'
        }
    });

    const [studioKeys, setStudioKeys] = React.useState(() => {
        const saved = localStorage.getItem('prism-creator-studio-keys');
        return saved ? JSON.parse(saved) : [];
    });

    const [showKeyGenerator, setShowKeyGenerator] = React.useState(false);
    const [keyForm, setKeyForm] = React.useState({
        permission: 'view',
        description: '',
        expiryDays: 365
    });

    const [saveMessage, setSaveMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    // Access Permissions für Studio Keys
    const accessPermissions = [
        {
            id: 'view',
            label: 'View Only',
            description: 'Studio kann nur Statistiken und Content einsehen',
            icon: '👀',
            features: ['Dashboard anzeigen', 'Content-Statistiken', 'Terminkalender einsehen']
        },
        {
            id: 'support',
            label: 'Support Access',
            description: 'Studio kann bei Planung und Chat-Verwaltung helfen',
            icon: '🤝',
            features: ['Content planen', 'Chat-Interaktionen', 'Terminkoordination', 'Benachrichtigungen']
        },
        {
            id: 'full',
            label: 'Full Access',
            description: 'Studio hat vollständige Kontrolle (außer Streaming)',
            icon: '🔐',
            features: ['Content-Upload', 'Profil-Management', 'Monetarisierung', 'Einstellungen', 'Analytics']
        }
    ];

    React.useEffect(() => {
        // Update localStorage when studio keys change
        localStorage.setItem('prism-creator-studio-keys', JSON.stringify(studioKeys));
    }, [studioKeys]);

    const handleProfileSave = async () => {
        setIsLoading(true);
        setSaveMessage('');
        
        try {
            // Here you would normally call an API to update profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update local storage
            const updatedUser = { ...user, ...profile };
            localStorage.setItem('prism-user', JSON.stringify(updatedUser));
            
            setSaveMessage('Profil erfolgreich gespeichert!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Fehler beim Speichern des Profils');
        } finally {
            setIsLoading(false);
        }
    };

    const generateStudioKey = () => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const keyId = `sk_${timestamp}_${randomString}`;
        
        const newKey = {
            id: keyId,
            key: keyId,
            permission: keyForm.permission,
            description: keyForm.description || `Studio Key - ${accessPermissions.find(p => p.id === keyForm.permission)?.label}`,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (keyForm.expiryDays * 24 * 60 * 60 * 1000)).toISOString(),
            isActive: true,
            usedBy: null // Will be filled when studio uses the key
        };

        setStudioKeys(prev => [newKey, ...prev]);
        setShowKeyGenerator(false);
        setKeyForm({
            permission: 'view',
            description: '',
            expiryDays: 365
        });
    };

    const revokeKey = (keyId) => {
        setStudioKeys(prev => prev.map(key => 
            key.id === keyId ? { ...key, isActive: false, revokedAt: new Date().toISOString() } : key
        ));
    };

    const getPermissionBadge = (permission) => {
        const perm = accessPermissions.find(p => p.id === permission);
        const colors = {
            view: 'var(--prism-info)',
            support: 'var(--prism-warning)', 
            full: 'var(--prism-error)'
        };
        
        return React.createElement('span', {
            style: {
                background: `rgba(${permission === 'view' ? '6, 182, 212' : permission === 'support' ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
                color: colors[permission],
                border: `1px solid ${colors[permission]}`,
                padding: 'var(--prism-space-xs) var(--prism-space-sm)',
                borderRadius: 'var(--prism-radius-sm)',
                fontSize: 'var(--prism-text-xs)',
                fontWeight: '600'
            }
        }, `${perm?.icon} ${perm?.label}`);
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
                className: 'gradient-text',
                style: { fontSize: 'var(--prism-text-3xl)', marginBottom: 'var(--prism-space-sm)' }
            }, '⚙️ Creator Einstellungen'),
            React.createElement('p', {
                key: 'subtitle',
                style: { color: 'var(--prism-gray-400)' }
            }, 'Verwalten Sie Ihr Profil und generieren Sie Studio Keys für Kooperationen')
        ]),

        React.createElement('div', {
            key: 'content',
            style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-xl)' }
        }, [
            // Profile Settings
            React.createElement('div', {
                key: 'profile-settings',
                className: 'card-prism'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-lg)',
                        color: 'var(--prism-purple)'
                    }
                }, '👤 Profil Einstellungen'),

                React.createElement('div', {
                    key: 'form',
                    style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--prism-space-lg)' }
                }, [
                    React.createElement('div', { key: 'name' }, [
                        React.createElement('label', {
                            key: 'label',
                            style: { 
                                display: 'block', 
                                marginBottom: 'var(--prism-space-sm)',
                                color: 'var(--prism-gray-300)',
                                fontWeight: '600'
                            }
                        }, 'Name'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: profile.name,
                            onChange: (e) => setProfile(prev => ({ ...prev, name: e.target.value })),
                            style: {
                                width: '100%',
                                padding: 'var(--prism-space-md)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: 'var(--prism-radius-md)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white'
                            },
                            placeholder: 'Ihr echter Name'
                        })
                    ]),

                    React.createElement('div', { key: 'stage-name' }, [
                        React.createElement('label', {
                            key: 'label',
                            style: { 
                                display: 'block', 
                                marginBottom: 'var(--prism-space-sm)',
                                color: 'var(--prism-gray-300)',
                                fontWeight: '600'
                            }
                        }, 'Künstlername'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: profile.stageName,
                            onChange: (e) => setProfile(prev => ({ ...prev, stageName: e.target.value })),
                            style: {
                                width: '100%',
                                padding: 'var(--prism-space-md)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: 'var(--prism-radius-md)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white'
                            },
                            placeholder: 'Ihr öffentlicher Name'
                        })
                    ]),

                    React.createElement('div', { key: 'category', style: { gridColumn: 'span 2' } }, [
                        React.createElement('label', {
                            key: 'label',
                            style: { 
                                display: 'block', 
                                marginBottom: 'var(--prism-space-sm)',
                                color: 'var(--prism-gray-300)',
                                fontWeight: '600'
                            }
                        }, 'Kategorie'),
                        React.createElement('select', {
                            key: 'select',
                            value: profile.category,
                            onChange: (e) => setProfile(prev => ({ ...prev, category: e.target.value })),
                            style: {
                                width: '100%',
                                padding: 'var(--prism-space-md)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: 'var(--prism-radius-md)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white'
                            }
                        }, [
                            React.createElement('option', { key: 'cam', value: 'cam' }, '📹 Cam Model'),
                            React.createElement('option', { key: 'content', value: 'content' }, '🎬 Content Creator'),
                            React.createElement('option', { key: 'influencer', value: 'influencer' }, '⭐ Influencer'),
                            React.createElement('option', { key: 'fetish', value: 'fetish' }, '🔥 Fetish Model'),
                            React.createElement('option', { key: 'escort', value: 'escort' }, '💎 Escort'),
                            React.createElement('option', { key: 'onlyfans', value: 'onlyfans' }, '🌟 OnlyFans')
                        ])
                    ])
                ]),

                React.createElement('div', {
                    key: 'save-section',
                    style: { 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'var(--prism-space-lg)',
                        padding: 'var(--prism-space-lg)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--prism-radius-md)'
                    }
                }, [
                    saveMessage && React.createElement('div', {
                        key: 'message',
                        style: {
                            color: saveMessage.includes('Fehler') ? 'var(--prism-error)' : 'var(--prism-success)',
                            fontWeight: '600'
                        }
                    }, saveMessage),

                    React.createElement('button', {
                        key: 'save',
                        onClick: handleProfileSave,
                        disabled: isLoading,
                        className: 'btn-prism',
                        style: { opacity: isLoading ? 0.7 : 1 }
                    }, isLoading ? 'Speichert...' : '💾 Profil speichern')
                ])
            ]),

            // Studio Key Management
            React.createElement('div', {
                key: 'studio-keys',
                className: 'card-prism'
            }, [
                React.createElement('div', {
                    key: 'header',
                    style: { 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: 'var(--prism-space-lg)'
                    }
                }, [
                    React.createElement('div', { key: 'title-section' }, [
                        React.createElement('h3', {
                            key: 'title',
                            style: { 
                                fontSize: 'var(--prism-text-xl)', 
                                color: 'var(--prism-purple)',
                                marginBottom: 'var(--prism-space-xs)'
                            }
                        }, '🔑 Studio Keys'),
                        React.createElement('p', {
                            key: 'subtitle',
                            style: { color: 'var(--prism-gray-400)', fontSize: 'var(--prism-text-sm)' }
                        }, 'Generieren Sie Keys für Studio-Kooperationen')
                    ]),

                    React.createElement('button', {
                        key: 'generate',
                        onClick: () => setShowKeyGenerator(true),
                        className: 'btn-prism'
                    }, '➕ Neuen Key generieren')
                ]),

                React.createElement('div', {
                    key: 'keys-list',
                    style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)' }
                }, studioKeys.length > 0 ? 
                    studioKeys.map(key => 
                        React.createElement('div', {
                            key: key.id,
                            style: {
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${key.isActive ? 'var(--prism-gray-700)' : 'var(--prism-gray-800)'}`,
                                borderRadius: 'var(--prism-radius-lg)',
                                padding: 'var(--prism-space-lg)',
                                opacity: key.isActive ? 1 : 0.6
                            }
                        }, [
                            React.createElement('div', {
                                key: 'header',
                                style: { 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'flex-start',
                                    marginBottom: 'var(--prism-space-md)'
                                }
                            }, [
                                React.createElement('div', { key: 'info' }, [
                                    React.createElement('div', {
                                        key: 'description',
                                        style: { 
                                            fontSize: 'var(--prism-text-lg)', 
                                            fontWeight: '600',
                                            marginBottom: 'var(--prism-space-xs)'
                                        }
                                    }, key.description),
                                    React.createElement('div', {
                                        key: 'meta',
                                        style: { 
                                            display: 'flex', 
                                            gap: 'var(--prism-space-md)',
                                            alignItems: 'center'
                                        }
                                    }, [
                                        getPermissionBadge(key.permission),
                                        React.createElement('span', {
                                            key: 'date',
                                            style: { 
                                                color: 'var(--prism-gray-400)', 
                                                fontSize: 'var(--prism-text-sm)'
                                            }
                                        }, `Erstellt: ${new Date(key.createdAt).toLocaleDateString('de-DE')}`)
                                    ])
                                ]),

                                key.isActive && React.createElement('button', {
                                    key: 'revoke',
                                    onClick: () => revokeKey(key.id),
                                    style: {
                                        background: 'none',
                                        border: '1px solid var(--prism-error)',
                                        borderRadius: 'var(--prism-radius-sm)',
                                        color: 'var(--prism-error)',
                                        padding: 'var(--prism-space-xs) var(--prism-space-sm)',
                                        cursor: 'pointer',
                                        fontSize: 'var(--prism-text-sm)'
                                    }
                                }, '🗑️ Widerrufen')
                            ]),

                            React.createElement('div', {
                                key: 'key-display',
                                style: {
                                    background: 'var(--prism-gray-900)',
                                    border: '1px solid var(--prism-gray-700)',
                                    borderRadius: 'var(--prism-radius-md)',
                                    padding: 'var(--prism-space-md)',
                                    fontFamily: 'monospace',
                                    fontSize: 'var(--prism-text-sm)',
                                    wordBreak: 'break-all',
                                    color: 'var(--prism-success)'
                                }
                            }, key.key),

                            React.createElement('div', {
                                key: 'expiry',
                                style: { 
                                    marginTop: 'var(--prism-space-sm)',
                                    fontSize: 'var(--prism-text-xs)',
                                    color: 'var(--prism-gray-500)'
                                }
                            }, `Läuft ab: ${new Date(key.expiresAt).toLocaleDateString('de-DE')}${key.usedBy ? ` • Verwendet von: ${key.usedBy}` : ''}`)
                        ])
                    ) : [
                        React.createElement('div', {
                            key: 'empty',
                            style: {
                                textAlign: 'center',
                                padding: 'var(--prism-space-3xl)',
                                color: 'var(--prism-gray-400)'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'icon',
                                style: { fontSize: '3rem', marginBottom: 'var(--prism-space-lg)' }
                            }, '🔑'),
                            React.createElement('p', { key: 'text' }, 'Noch keine Studio Keys generiert')
                        ])
                    ]
                )
            ])
        ]),

        // Key Generator Modal
        showKeyGenerator && React.createElement('div', {
            key: 'key-generator-modal',
            className: 'modal',
            onClick: (e) => e.target === e.currentTarget && setShowKeyGenerator(false)
        }, [
            React.createElement('div', {
                key: 'modal-content',
                className: 'modal-content',
                style: { maxWidth: '600px' }
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
                        style: { fontSize: 'var(--prism-text-xl)', color: 'var(--prism-purple)' }
                    }, 'Studio Key generieren'),
                    React.createElement('button', {
                        key: 'close',
                        onClick: () => setShowKeyGenerator(false),
                        style: {
                            background: 'none',
                            border: 'none',
                            color: 'var(--prism-gray-400)',
                            fontSize: 'var(--prism-text-xl)',
                            cursor: 'pointer'
                        }
                    }, '✕')
                ]),

                React.createElement('div', {
                    key: 'permissions',
                    style: { marginBottom: 'var(--prism-space-xl)' }
                }, [
                    React.createElement('h4', {
                        key: 'title',
                        style: { 
                            marginBottom: 'var(--prism-space-lg)',
                            color: 'var(--prism-gray-300)'
                        }
                    }, 'Berechtigung auswählen:'),

                    React.createElement('div', {
                        key: 'options',
                        style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)' }
                    }, accessPermissions.map(permission => 
                        React.createElement('label', {
                            key: permission.id,
                            style: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 'var(--prism-space-md)',
                                padding: 'var(--prism-space-lg)',
                                border: `2px solid ${keyForm.permission === permission.id ? 'var(--prism-purple)' : 'var(--prism-gray-700)'}`,
                                borderRadius: 'var(--prism-radius-lg)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }
                        }, [
                            React.createElement('input', {
                                key: 'radio',
                                type: 'radio',
                                name: 'permission',
                                value: permission.id,
                                checked: keyForm.permission === permission.id,
                                onChange: (e) => setKeyForm(prev => ({ ...prev, permission: e.target.value })),
                                style: { marginTop: 'var(--prism-space-xs)' }
                            }),
                            React.createElement('div', { key: 'content' }, [
                                React.createElement('div', {
                                    key: 'header',
                                    style: { 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 'var(--prism-space-sm)',
                                        marginBottom: 'var(--prism-space-sm)'
                                    }
                                }, [
                                    React.createElement('span', { key: 'icon' }, permission.icon),
                                    React.createElement('strong', { key: 'label' }, permission.label)
                                ]),
                                React.createElement('p', {
                                    key: 'description',
                                    style: { 
                                        color: 'var(--prism-gray-400)', 
                                        fontSize: 'var(--prism-text-sm)',
                                        marginBottom: 'var(--prism-space-sm)'
                                    }
                                }, permission.description),
                                React.createElement('ul', {
                                    key: 'features',
                                    style: { 
                                        fontSize: 'var(--prism-text-xs)',
                                        color: 'var(--prism-gray-500)',
                                        paddingLeft: 'var(--prism-space-lg)'
                                    }
                                }, permission.features.map((feature, index) => 
                                    React.createElement('li', { key: index }, feature)
                                ))
                            ])
                        ])
                    ))
                ]),

                React.createElement('div', {
                    key: 'form-fields',
                    style: { marginBottom: 'var(--prism-space-xl)' }
                }, [
                    React.createElement('div', {
                        key: 'description',
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
                        }, 'Beschreibung (Optional)'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: keyForm.description,
                            onChange: (e) => setKeyForm(prev => ({ ...prev, description: e.target.value })),
                            style: {
                                width: '100%',
                                padding: 'var(--prism-space-md)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: 'var(--prism-radius-md)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white'
                            },
                            placeholder: 'z.B. "MainStudio - Marketing"'
                        })
                    ]),

                    React.createElement('div', {
                        key: 'expiry',
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
                        }, 'Gültigkeitsdauer (Tage)'),
                        React.createElement('select', {
                            key: 'select',
                            value: keyForm.expiryDays,
                            onChange: (e) => setKeyForm(prev => ({ ...prev, expiryDays: Number(e.target.value) })),
                            style: {
                                width: '100%',
                                padding: 'var(--prism-space-md)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: 'var(--prism-radius-md)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white'
                            }
                        }, [
                            React.createElement('option', { key: '30', value: 30 }, '30 Tage'),
                            React.createElement('option', { key: '90', value: 90 }, '90 Tage'),
                            React.createElement('option', { key: '365', value: 365 }, '1 Jahr'),
                            React.createElement('option', { key: '730', value: 730 }, '2 Jahre'),
                            React.createElement('option', { key: '1095', value: 1095 }, '3 Jahre')
                        ])
                    ])
                ]),

                React.createElement('div', {
                    key: 'actions',
                    style: { display: 'flex', gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('button', {
                        key: 'cancel',
                        onClick: () => setShowKeyGenerator(false),
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
                        key: 'generate',
                        onClick: generateStudioKey,
                        className: 'btn-prism',
                        style: { flex: 1 }
                    }, '🔑 Key generieren')
                ])
            ])
        ])
    ]);
}

// Export the component for use in other files
window.CreatorSettings = CreatorSettings;
