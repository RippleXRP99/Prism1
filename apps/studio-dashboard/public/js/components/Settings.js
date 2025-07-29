// Studio Settings Component
function StudioSettings({ studio, onUpdateStudio }) {
    const [settings, setSettings] = React.useState({
        name: studio.name || '',
        email: studio.email || '',
        website: studio.website || '',
        description: studio.description || '',
        defaultCommission: studio.defaultCommission || 20,
        autoApprove: studio.autoApprove || false,
        notifications: {
            email: true,
            newCreators: true,
            payouts: true
        }
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [saveMessage, setSaveMessage] = React.useState('');

    React.useEffect(() => {
        setSettings({
            name: studio.name || '',
            email: studio.email || '',
            website: studio.website || '',
            description: studio.description || '',
            defaultCommission: studio.defaultCommission || 20,
            autoApprove: studio.autoApprove || false,
            notifications: studio.notifications || {
                email: true,
                newCreators: true,
                payouts: true
            }
        });
    }, [studio]);

    const handleSave = async () => {
        setIsLoading(true);
        setSaveMessage('');
        
        try {
            // Here you would normally call an API to update studio settings
            // For now, we'll simulate a successful save
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update local storage
            const updatedStudio = { ...studio, ...settings };
            localStorage.setItem('prism-studio-data', JSON.stringify(updatedStudio));
            
            onUpdateStudio(updatedStudio);
            setSaveMessage('Einstellungen erfolgreich gespeichert!');
            
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Fehler beim Speichern der Einstellungen');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNotificationChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [field]: value
            }
        }));
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
                style: { fontSize: 'var(--prism-text-3xl)', marginBottom: 'var(--prism-space-sm)' }
            }, '⚙️ Studio Einstellungen'),
            React.createElement('p', {
                key: 'subtitle',
                style: { color: 'var(--prism-gray-400)' }
            }, 'Konfigurieren Sie Ihr Studio und Ihre Präferenzen')
        ]),

        React.createElement('div', {
            key: 'settings-form',
            style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-xl)' }
        }, [
            // Basic Information
            React.createElement('div', {
                key: 'basic-info',
                className: 'card-studio'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-lg)',
                        color: 'var(--studio-primary)'
                    }
                }, '🏢 Grundinformationen'),

                React.createElement('div', {
                    key: 'fields',
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
                        }, 'Studio Name'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: settings.name,
                            onChange: (e) => handleInputChange('name', e.target.value),
                            className: 'input-studio',
                            placeholder: 'Ihr Studio Name'
                        })
                    ]),

                    React.createElement('div', { key: 'email' }, [
                        React.createElement('label', {
                            key: 'label',
                            style: { 
                                display: 'block', 
                                marginBottom: 'var(--prism-space-sm)',
                                color: 'var(--prism-gray-300)',
                                fontWeight: '600'
                            }
                        }, 'E-Mail'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'email',
                            value: settings.email,
                            onChange: (e) => handleInputChange('email', e.target.value),
                            className: 'input-studio',
                            placeholder: 'studio@example.com'
                        })
                    ]),

                    React.createElement('div', { key: 'website', style: { gridColumn: 'span 2' } }, [
                        React.createElement('label', {
                            key: 'label',
                            style: { 
                                display: 'block', 
                                marginBottom: 'var(--prism-space-sm)',
                                color: 'var(--prism-gray-300)',
                                fontWeight: '600'
                            }
                        }, 'Website (Optional)'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'url',
                            value: settings.website,
                            onChange: (e) => handleInputChange('website', e.target.value),
                            className: 'input-studio',
                            placeholder: 'https://ihr-studio.com'
                        })
                    ]),

                    React.createElement('div', { key: 'description', style: { gridColumn: 'span 2' } }, [
                        React.createElement('label', {
                            key: 'label',
                            style: { 
                                display: 'block', 
                                marginBottom: 'var(--prism-space-sm)',
                                color: 'var(--prism-gray-300)',
                                fontWeight: '600'
                            }
                        }, 'Beschreibung'),
                        React.createElement('textarea', {
                            key: 'textarea',
                            value: settings.description,
                            onChange: (e) => handleInputChange('description', e.target.value),
                            className: 'input-studio',
                            rows: 4,
                            placeholder: 'Beschreiben Sie Ihr Studio...'
                        })
                    ])
                ])
            ]),

            // Business Settings
            React.createElement('div', {
                key: 'business-settings',
                className: 'card-studio'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-lg)',
                        color: 'var(--studio-primary)'
                    }
                }, '💼 Geschäftseinstellungen'),

                React.createElement('div', {
                    key: 'fields',
                    style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--prism-space-lg)' }
                }, [
                    React.createElement('div', { key: 'default-commission' }, [
                        React.createElement('label', {
                            key: 'label',
                            style: { 
                                display: 'block', 
                                marginBottom: 'var(--prism-space-sm)',
                                color: 'var(--prism-gray-300)',
                                fontWeight: '600'
                            }
                        }, 'Standard Kommission (%)'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'number',
                            min: '0',
                            max: '100',
                            value: settings.defaultCommission,
                            onChange: (e) => handleInputChange('defaultCommission', Number(e.target.value)),
                            className: 'input-studio'
                        }),
                        React.createElement('small', {
                            key: 'help',
                            style: { color: 'var(--prism-gray-500)', marginTop: 'var(--prism-space-xs)', display: 'block' }
                        }, 'Wird für neue Creator verwendet')
                    ]),

                    React.createElement('div', { key: 'auto-approve' }, [
                        React.createElement('label', {
                            key: 'label',
                            style: { 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--prism-space-sm)',
                                color: 'var(--prism-gray-300)',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }
                        }, [
                            React.createElement('input', {
                                key: 'checkbox',
                                type: 'checkbox',
                                checked: settings.autoApprove,
                                onChange: (e) => handleInputChange('autoApprove', e.target.checked),
                                style: { 
                                    width: '18px', 
                                    height: '18px',
                                    accentColor: 'var(--studio-primary)'
                                }
                            }),
                            React.createElement('span', { key: 'text' }, 'Auto-Genehmigung')
                        ]),
                        React.createElement('small', {
                            key: 'help',
                            style: { color: 'var(--prism-gray-500)', marginTop: 'var(--prism-space-xs)', display: 'block' }
                        }, 'Creator automatisch genehmigen')
                    ])
                ])
            ]),

            // Notification Settings
            React.createElement('div', {
                key: 'notifications',
                className: 'card-studio'
            }, [
                React.createElement('h3', {
                    key: 'title',
                    style: { 
                        fontSize: 'var(--prism-text-xl)', 
                        marginBottom: 'var(--prism-space-lg)',
                        color: 'var(--studio-primary)'
                    }
                }, '🔔 Benachrichtigungen'),

                React.createElement('div', {
                    key: 'fields',
                    style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)' }
                }, [
                    React.createElement('label', {
                        key: 'email',
                        style: { 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--prism-space-sm)',
                            color: 'var(--prism-gray-300)',
                            cursor: 'pointer'
                        }
                    }, [
                        React.createElement('input', {
                            key: 'checkbox',
                            type: 'checkbox',
                            checked: settings.notifications.email,
                            onChange: (e) => handleNotificationChange('email', e.target.checked),
                            style: { 
                                width: '18px', 
                                height: '18px',
                                accentColor: 'var(--studio-primary)'
                            }
                        }),
                        React.createElement('span', { key: 'text' }, 'E-Mail Benachrichtigungen')
                    ]),

                    React.createElement('label', {
                        key: 'new-creators',
                        style: { 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--prism-space-sm)',
                            color: 'var(--prism-gray-300)',
                            cursor: 'pointer'
                        }
                    }, [
                        React.createElement('input', {
                            key: 'checkbox',
                            type: 'checkbox',
                            checked: settings.notifications.newCreators,
                            onChange: (e) => handleNotificationChange('newCreators', e.target.checked),
                            style: { 
                                width: '18px', 
                                height: '18px',
                                accentColor: 'var(--studio-primary)'
                            }
                        }),
                        React.createElement('span', { key: 'text' }, 'Neue Creator Anfragen')
                    ]),

                    React.createElement('label', {
                        key: 'payouts',
                        style: { 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--prism-space-sm)',
                            color: 'var(--prism-gray-300)',
                            cursor: 'pointer'
                        }
                    }, [
                        React.createElement('input', {
                            key: 'checkbox',
                            type: 'checkbox',
                            checked: settings.notifications.payouts,
                            onChange: (e) => handleNotificationChange('payouts', e.target.checked),
                            style: { 
                                width: '18px', 
                                height: '18px',
                                accentColor: 'var(--studio-primary)'
                            }
                        }),
                        React.createElement('span', { key: 'text' }, 'Auszahlungs-Updates')
                    ])
                ])
            ]),

            // Save Button
            React.createElement('div', {
                key: 'save-section',
                style: { 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--prism-space-lg)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--prism-radius-lg)',
                    border: '1px solid var(--prism-gray-700)'
                }
            }, [
                saveMessage && React.createElement('div', {
                    key: 'message',
                    style: {
                        padding: 'var(--prism-space-sm) var(--prism-space-md)',
                        borderRadius: 'var(--prism-radius-md)',
                        background: saveMessage.includes('Fehler') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${saveMessage.includes('Fehler') ? 'var(--prism-error)' : 'var(--prism-success)'}`,
                        color: saveMessage.includes('Fehler') ? 'var(--prism-error)' : 'var(--prism-success)'
                    }
                }, saveMessage),

                React.createElement('button', {
                    key: 'save',
                    onClick: handleSave,
                    disabled: isLoading,
                    className: 'btn-studio',
                    style: { 
                        minWidth: '150px',
                        opacity: isLoading ? 0.7 : 1
                    }
                }, isLoading ? 'Speichert...' : '💾 Einstellungen speichern')
            ])
        ])
    ]);
}
