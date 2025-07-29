// Simple Creator Settings Component - Fixed Version
function CreatorSettings({ user, setActiveTab }) {
    const [profile, setProfile] = React.useState({
        name: user?.displayName || 'Creator Name',
        email: user?.email || 'creator@example.com',
        bio: 'Content Creator & Streamer',
        avatar: user?.avatar || '/api/placeholder/100/100'
    });

    const [studioKeys, setStudioKeys] = React.useState([]);
    const [newKeyName, setNewKeyName] = React.useState('');
    const [showCreateKey, setShowCreateKey] = React.useState(false);
    const [selectedPermission, setSelectedPermission] = React.useState('view');
    const [keyExpiration, setKeyExpiration] = React.useState('never');

    // Load existing studio keys
    React.useEffect(() => {
        const savedKeys = localStorage.getItem('studio-keys');
        if (savedKeys) {
            setStudioKeys(JSON.parse(savedKeys));
        }
    }, []);

    const handleSave = () => {
        // Simulate saving
        localStorage.setItem('creator-profile', JSON.stringify(profile));
        alert('Einstellungen gespeichert!');
    };

    const generateStudioKey = () => {
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 8);
        const key = `sk_${timestamp}_${randomPart}`;
        
        // Calculate expiration date
        let expiresAt = null;
        if (keyExpiration !== 'never') {
            const expirationDays = parseInt(keyExpiration);
            expiresAt = new Date(Date.now() + (expirationDays * 24 * 60 * 60 * 1000));
        }
        
        const newKey = {
            id: Date.now().toString(),
            name: newKeyName || `Studio Key ${studioKeys.length + 1}`,
            key: key,
            permission: selectedPermission,
            created: new Date().toLocaleDateString('de-DE'),
            createdTimestamp: Date.now(),
            lastUsed: null,
            usageCount: 0,
            active: true,
            expiresAt: expiresAt,
            expired: false
        };
        
        const updatedKeys = [...studioKeys, newKey];
        setStudioKeys(updatedKeys);
        localStorage.setItem('studio-keys', JSON.stringify(updatedKeys));
        setNewKeyName('');
        setSelectedPermission('view');
        setKeyExpiration('never');
        setShowCreateKey(false);
        alert('Studio Key erfolgreich erstellt!');
    };

    const deleteStudioKey = (keyId) => {
        if (confirm('Möchten Sie diesen Studio Key wirklich löschen?')) {
            const updatedKeys = studioKeys.filter(key => key.id !== keyId);
            setStudioKeys(updatedKeys);
            localStorage.setItem('studio-keys', JSON.stringify(updatedKeys));
        }
    };

    const toggleKeyStatus = (keyId) => {
        const updatedKeys = studioKeys.map(key => 
            key.id === keyId ? { ...key, active: !key.active } : key
        );
        setStudioKeys(updatedKeys);
        localStorage.setItem('studio-keys', JSON.stringify(updatedKeys));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Studio Key in die Zwischenablage kopiert!');
        });
    };

    const getPermissionInfo = (permission) => {
        const permissions = {
            view: {
                name: 'View Only',
                color: '#3b82f6',
                icon: '🔵',
                description: 'Nur Ansicht',
                features: ['Statistiken ansehen', 'VODs und Videos ansehen', 'Geplanten Content ansehen', 'Finanzielle Daten einsehen']
            },
            support: {
                name: 'Support Access',
                color: '#f59e0b',
                icon: '🟡',
                description: 'Support & Bearbeitung',
                features: ['Alles aus View Only', 'Content planen und bearbeiten', 'Fan-Interaktionen durchführen', 'Stream-Einstellungen verwalten', 'Content vorbereiten (nicht veröffentlichen)']
            },
            full: {
                name: 'Full Access',
                color: '#ef4444',
                icon: '🔴',
                description: 'Vollzugriff',
                features: ['Voller Zugriff auf alle Funktionen', 'Finanzmanagement', 'Vollständige Content-Verwaltung', '❌ AUSNAHME: Stream starten bleibt beim Model']
            }
        };
        return permissions[permission] || permissions.view;
    };

    const isKeyExpired = (key) => {
        if (!key.expiresAt) return false;
        return new Date() > new Date(key.expiresAt);
    };

    const getExpirationText = (key) => {
        if (!key.expiresAt) return 'Kein Ablauf';
        const expDate = new Date(key.expiresAt);
        const now = new Date();
        const daysLeft = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) return '❌ Abgelaufen';
        if (daysLeft === 0) return '⚠️ Läuft heute ab';
        if (daysLeft <= 7) return `⚠️ ${daysLeft} Tage verbleibend`;
        return `✅ ${daysLeft} Tage verbleibend`;
    };

    return React.createElement('div', {
        className: 'animate-in',
        style: { padding: '2rem' }
    }, [
        // Header
        React.createElement('div', {
            key: 'header',
            style: { marginBottom: '2rem' }
        }, [
            React.createElement('h1', {
                key: 'title',
                style: { 
                    fontSize: '2.5rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                }
            }, '⚙️ Creator Einstellungen'),
            React.createElement('p', {
                key: 'subtitle',
                style: { color: 'var(--prism-text-secondary)' }
            }, 'Verwalten Sie Ihr Profil und Studio Management Keys für Model-Studio Kooperationen')
        ]),
        
        // Profile Section
        React.createElement('div', {
            key: 'profile-section',
            style: {
                background: 'var(--prism-bg-secondary)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--prism-border)',
                marginBottom: '2rem'
            }
        }, [
            React.createElement('h3', {
                key: 'section-title',
                style: { marginBottom: '1.5rem', color: 'var(--prism-text-primary)' }
            }, '👤 Profile Information'),
            
            // Profile Form
            React.createElement('div', {
                key: 'form',
                style: { display: 'grid', gap: '1rem' }
            }, [
                // Name Field
                React.createElement('div', {
                    key: 'name-field'
                }, [
                    React.createElement('label', {
                        key: 'name-label',
                        style: { 
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--prism-text-primary)',
                            fontWeight: '500'
                        }
                    }, 'Creator Name'),
                    React.createElement('input', {
                        key: 'name-input',
                        type: 'text',
                        value: profile.name,
                        onChange: (e) => setProfile(prev => ({ ...prev, name: e.target.value })),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--prism-border)',
                            borderRadius: '8px',
                            background: 'var(--prism-bg-primary)',
                            color: 'var(--prism-text-primary)',
                            fontSize: '1rem'
                        }
                    })
                ]),
                
                // Email Field
                React.createElement('div', {
                    key: 'email-field'
                }, [
                    React.createElement('label', {
                        key: 'email-label',
                        style: { 
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--prism-text-primary)',
                            fontWeight: '500'
                        }
                    }, 'Email'),
                    React.createElement('input', {
                        key: 'email-input',
                        type: 'email',
                        value: profile.email,
                        onChange: (e) => setProfile(prev => ({ ...prev, email: e.target.value })),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--prism-border)',
                            borderRadius: '8px',
                            background: 'var(--prism-bg-primary)',
                            color: 'var(--prism-text-primary)',
                            fontSize: '1rem'
                        }
                    })
                ]),
                
                // Save Button
                React.createElement('button', {
                    key: 'save-button',
                    onClick: handleSave,
                    style: {
                        marginTop: '1rem',
                        padding: '0.75rem 1.5rem',
                        background: 'var(--prism-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'center'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '💾'),
                    React.createElement('span', { key: 'text' }, 'Speichern')
                ])
            ])
        ]),
        
        // Studio Keys Section
        React.createElement('div', {
            key: 'studio-keys-section',
            style: {
                background: 'var(--prism-bg-secondary)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--prism-border)'
            }
        }, [
            // Section Header
            React.createElement('div', {
                key: 'keys-header',
                style: { 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }
            }, [
                React.createElement('h3', {
                    key: 'keys-title',
                    style: { color: 'var(--prism-text-primary)', margin: 0 }
                }, '🎭 Model Management - Studio Keys'),
                React.createElement('button', {
                    key: 'add-key-btn',
                    onClick: () => setShowCreateKey(!showCreateKey),
                    style: {
                        padding: '0.5rem 1rem',
                        background: 'var(--prism-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    React.createElement('span', { key: 'icon' }, '➕'),
                    React.createElement('span', { key: 'text' }, 'Neuer Key')
                ])
            ]),
            
            // Create Key Form
            showCreateKey && React.createElement('div', {
                key: 'create-form',
                style: {
                    background: 'var(--prism-bg-primary)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--prism-border)',
                    marginBottom: '1.5rem'
                }
            }, [
                React.createElement('h4', {
                    key: 'form-title',
                    style: { 
                        color: 'var(--prism-text-primary)', 
                        marginBottom: '1.5rem',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, ['🆕 Neuen Studio Management Key erstellen']),
                
                // Key Name
                React.createElement('div', {
                    key: 'name-section',
                    style: { marginBottom: '1.5rem' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--prism-text-primary)',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }
                    }, '📝 Key Name (optional)'),
                    React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: newKeyName,
                        onChange: (e) => setNewKeyName(e.target.value),
                        placeholder: 'z.B. "Premium Studio Access" oder "Support Team Key"',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--prism-border)',
                            borderRadius: '8px',
                            background: 'var(--prism-bg-secondary)',
                            color: 'var(--prism-text-primary)',
                            fontSize: '0.95rem'
                        }
                    })
                ]),
                
                // Permission Level Selection
                React.createElement('div', {
                    key: 'permission-section',
                    style: { marginBottom: '1.5rem' }
                }, [
                    React.createElement('label', {
                        key: 'permission-label',
                        style: {
                            display: 'block',
                            marginBottom: '1rem',
                            color: 'var(--prism-text-primary)',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }
                    }, '🎯 Berechtigungsebene wählen'),
                    
                    // Permission Options
                    React.createElement('div', {
                        key: 'permission-options',
                        style: { display: 'grid', gap: '0.75rem' }
                    }, ['view', 'support', 'full'].map(permission => {
                        const info = getPermissionInfo(permission);
                        return React.createElement('div', {
                            key: permission,
                            onClick: () => setSelectedPermission(permission),
                            style: {
                                padding: '1rem',
                                border: `2px solid ${selectedPermission === permission ? info.color : 'var(--prism-border)'}`,
                                borderRadius: '8px',
                                background: selectedPermission === permission ? `${info.color}15` : 'var(--prism-bg-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'permission-header',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.5rem'
                                }
                            }, [
                                React.createElement('input', {
                                    key: 'radio',
                                    type: 'radio',
                                    checked: selectedPermission === permission,
                                    onChange: () => setSelectedPermission(permission),
                                    style: { accentColor: info.color }
                                }),
                                React.createElement('span', {
                                    key: 'icon',
                                    style: { fontSize: '1.2rem' }
                                }, info.icon),
                                React.createElement('strong', {
                                    key: 'name',
                                    style: { 
                                        color: 'var(--prism-text-primary)',
                                        fontSize: '1rem'
                                    }
                                }, info.name),
                                React.createElement('span', {
                                    key: 'desc',
                                    style: { 
                                        color: 'var(--prism-text-secondary)',
                                        fontSize: '0.9rem'
                                    }
                                }, `- ${info.description}`)
                            ]),
                            React.createElement('div', {
                                key: 'features',
                                style: {
                                    fontSize: '0.85rem',
                                    color: 'var(--prism-text-secondary)',
                                    paddingLeft: '2rem'
                                }
                            }, info.features.map((feature, index) => 
                                React.createElement('div', {
                                    key: index,
                                    style: { marginBottom: '0.25rem' }
                                }, `• ${feature}`)
                            ))
                        ]);
                    }))
                ]),
                
                // Expiration Settings
                React.createElement('div', {
                    key: 'expiration-section',
                    style: { marginBottom: '1.5rem' }
                }, [
                    React.createElement('label', {
                        key: 'expiration-label',
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--prism-text-primary)',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }
                    }, '⏰ Key Ablaufzeit'),
                    React.createElement('select', {
                        key: 'expiration-select',
                        value: keyExpiration,
                        onChange: (e) => setKeyExpiration(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--prism-border)',
                            borderRadius: '8px',
                            background: 'var(--prism-bg-secondary)',
                            color: 'var(--prism-text-primary)',
                            fontSize: '0.95rem'
                        }
                    }, [
                        React.createElement('option', { key: 'never', value: 'never' }, 'Kein Ablauf (permanent)'),
                        React.createElement('option', { key: '7', value: '7' }, '7 Tage'),
                        React.createElement('option', { key: '30', value: '30' }, '30 Tage'),
                        React.createElement('option', { key: '90', value: '90' }, '90 Tage'),
                        React.createElement('option', { key: '365', value: '365' }, '1 Jahr')
                    ])
                ]),
                
                // Create Button
                React.createElement('div', {
                    key: 'create-actions',
                    style: {
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    React.createElement('button', {
                        key: 'cancel-btn',
                        onClick: () => setShowCreateKey(false),
                        style: {
                            padding: '0.75rem 1.5rem',
                            background: 'var(--prism-bg-secondary)',
                            color: 'var(--prism-text-secondary)',
                            border: '1px solid var(--prism-border)',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }
                    }, '❌ Abbrechen'),
                    React.createElement('button', {
                        key: 'create-btn',
                        onClick: generateStudioKey,
                        style: {
                            padding: '0.75rem 2rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '🔑'),
                        React.createElement('span', { key: 'text' }, 'Studio Key erstellen')
                    ])
                ])
            ]),
            
            // Keys List
            React.createElement('div', {
                key: 'keys-list',
                style: { display: 'grid', gap: '1rem' }
            }, studioKeys.length === 0 ? [
                React.createElement('div', {
                    key: 'empty-state',
                    style: {
                        textAlign: 'center',
                        padding: '2rem',
                        color: 'var(--prism-text-secondary)',
                        border: '2px dashed var(--prism-border)',
                        borderRadius: '8px'
                    }
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: { fontSize: '3rem', marginBottom: '1rem' }
                    }, '🔑'),
                    React.createElement('p', {
                        key: 'text',
                        style: { margin: 0, fontSize: '1.1rem' }
                    }, 'Noch keine Studio Management Keys erstellt'),
                    React.createElement('p', {
                        key: 'subtext',
                        style: { margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.7 }
                    }, 'Erstellen Sie Studio Keys für Model-Studio Kooperationen mit verschiedenen Berechtigungsebenen')
                ])
            ] : studioKeys.map(key => {
                const permissionInfo = getPermissionInfo(key.permission);
                const expired = isKeyExpired(key);
                const expirationText = getExpirationText(key);
                
                return React.createElement('div', {
                    key: key.id,
                    style: {
                        background: 'var(--prism-bg-primary)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: `2px solid ${expired ? '#ef4444' : (key.active ? permissionInfo.color : 'var(--prism-border)')}`,
                        opacity: (key.active && !expired) ? 1 : 0.6,
                        position: 'relative'
                    }
                }, [
                    // Key Header
                    React.createElement('div', {
                        key: 'key-header',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'key-info',
                            style: { flex: 1 }
                        }, [
                            React.createElement('div', {
                                key: 'title-row',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    marginBottom: '0.5rem'
                                }
                            }, [
                                React.createElement('h4', {
                                    key: 'key-name',
                                    style: {
                                        color: 'var(--prism-text-primary)',
                                        margin: 0,
                                        fontSize: '1.1rem',
                                        fontWeight: '600'
                                    }
                                }, key.name),
                                React.createElement('span', {
                                    key: 'permission-badge',
                                    style: {
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: '500',
                                        background: permissionInfo.color,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }
                                }, [
                                    React.createElement('span', { key: 'icon' }, permissionInfo.icon),
                                    React.createElement('span', { key: 'text' }, permissionInfo.name)
                                ])
                            ]),
                            React.createElement('div', {
                                key: 'key-meta',
                                style: {
                                    color: 'var(--prism-text-secondary)',
                                    fontSize: '0.85rem',
                                    display: 'grid',
                                    gap: '0.25rem'
                                }
                            }, [
                                React.createElement('div', { key: 'created' }, `📅 Erstellt: ${key.created}`),
                                React.createElement('div', { key: 'usage' }, `📊 Verwendet: ${key.usageCount || 0} mal`),
                                React.createElement('div', { 
                                    key: 'expiration',
                                    style: { 
                                        color: expired ? '#ef4444' : (expirationText.includes('⚠️') ? '#f59e0b' : 'var(--prism-text-secondary)')
                                    }
                                }, `⏰ ${expirationText}`),
                                key.lastUsed && React.createElement('div', { 
                                    key: 'last-used'
                                }, `🕒 Zuletzt verwendet: ${key.lastUsed}`)
                            ])
                        ]),
                        React.createElement('div', {
                            key: 'key-status',
                            style: {
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                background: expired ? '#ef4444' : (key.active ? '#10b981' : '#6b7280'),
                                color: 'white',
                                textAlign: 'center'
                            }
                        }, expired ? '❌ Abgelaufen' : (key.active ? '✅ Aktiv' : '⏸️ Inaktiv'))
                    ]),
                    
                    // Permission Features
                    React.createElement('div', {
                        key: 'permission-features',
                        style: {
                            background: 'var(--prism-bg-secondary)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            border: '1px solid var(--prism-border)'
                        }
                    }, [
                        React.createElement('h5', {
                            key: 'features-title',
                            style: {
                                color: 'var(--prism-text-primary)',
                                margin: '0 0 0.75rem 0',
                                fontSize: '0.95rem',
                                fontWeight: '600'
                            }
                        }, `🎯 Berechtigungen: ${permissionInfo.description}`),
                        React.createElement('div', {
                            key: 'features-list',
                            style: {
                                fontSize: '0.8rem',
                                color: 'var(--prism-text-secondary)',
                                display: 'grid',
                                gap: '0.25rem'
                            }
                        }, permissionInfo.features.map((feature, index) => 
                            React.createElement('div', {
                                key: index,
                                style: { 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }
                            }, [
                                React.createElement('span', {
                                    key: 'bullet',
                                    style: { color: permissionInfo.color, fontWeight: 'bold' }
                                }, '•'),
                                React.createElement('span', { key: 'text' }, feature)
                            ])
                        ))
                    ]),
                    
                    // Key Value
                    React.createElement('div', {
                        key: 'key-value',
                        style: {
                            background: 'var(--prism-bg-secondary)',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--prism-border)',
                            marginBottom: '1rem',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            wordBreak: 'break-all',
                            color: 'var(--prism-text-primary)',
                            position: 'relative'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'key-label',
                            style: {
                                fontSize: '0.75rem',
                                color: 'var(--prism-text-secondary)',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }
                        }, 'Studio Management Key:'),
                        React.createElement('div', {
                            key: 'key-text',
                            style: { 
                                paddingRight: '3rem',
                                background: '#1a1a1a',
                                padding: '0.75rem',
                                borderRadius: '4px',
                                border: '1px solid var(--prism-border)'
                            }
                        }, key.key),
                        React.createElement('button', {
                            key: 'copy-btn',
                            onClick: () => copyToClipboard(key.key),
                            style: {
                                position: 'absolute',
                                top: '2rem',
                                right: '0.5rem',
                                background: permissionInfo.color,
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem 0.75rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }
                        }, [
                            React.createElement('span', { key: 'icon' }, '📋'),
                            React.createElement('span', { key: 'text' }, 'Copy')
                        ])
                    ]),
                    
                    // Key Actions
                    React.createElement('div', {
                        key: 'key-actions',
                        style: {
                            display: 'flex',
                            gap: '0.75rem',
                            justifyContent: 'flex-end'
                        }
                    }, [
                        !expired && React.createElement('button', {
                            key: 'toggle-btn',
                            onClick: () => toggleKeyStatus(key.id),
                            style: {
                                padding: '0.5rem 1rem',
                                background: key.active ? '#f59e0b' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }
                        }, [
                            React.createElement('span', { key: 'icon' }, key.active ? '⏸️' : '▶️'),
                            React.createElement('span', { key: 'text' }, key.active ? 'Deaktivieren' : 'Aktivieren')
                        ]),
                        React.createElement('button', {
                            key: 'delete-btn',
                            onClick: () => deleteStudioKey(key.id),
                            style: {
                                padding: '0.5rem 1rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }
                        }, [
                            React.createElement('span', { key: 'icon' }, '🗑️'),
                            React.createElement('span', { key: 'text' }, 'Löschen')
                        ])
                    ])
                ]);
            }))
        ])
    ]);
}

// Export the component globally with multiple methods
if (typeof window !== 'undefined') {
    window.CreatorSettings = CreatorSettings;
    
    // Also add to global components registry
    if (!window.prismComponents) {
        window.prismComponents = {};
    }
    window.prismComponents.CreatorSettings = CreatorSettings;
}

// Debug log to confirm component loading
console.log('✅ CreatorSettings component loaded successfully');
