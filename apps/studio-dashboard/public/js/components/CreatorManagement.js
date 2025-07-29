// Creator Management Component for Studio Dashboard
function CreatorManagement({ studio }) {
    const [creators, setCreators] = React.useState([]);
    const [filteredCreators, setFilteredCreators] = React.useState([]);
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [filterCategory, setFilterCategory] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCreator, setSelectedCreator] = React.useState(null);
    const [showCreatorDetails, setShowCreatorDetails] = React.useState(false);
    const [showAddCreator, setShowAddCreator] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        loadCreators();
    }, [studio]);

    React.useEffect(() => {
        filterCreators();
    }, [creators, filterStatus, filterCategory, searchTerm]);

    const loadCreators = async () => {
        setIsLoading(true);
        try {
            const result = await window.studioAPI.getStudioPortfolio(studio.id);
            if (result.success) {
                setCreators(result.creators || []);
            }
        } catch (error) {
            console.error('Failed to load creators:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterCreators = () => {
        let filtered = [...creators];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(creator => creator.status === filterStatus);
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter(creator => creator.category === filterCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(creator => 
                creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                creator.stageName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCreators(filtered);
    };

    const handleAddCreator = async (creatorData) => {
        try {
            const response = await fetch(`http://localhost:3004/api/studio/${studio.id}/creators`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studioKey: creatorData.studioKey,
                    creatorName: creatorData.name
                })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                const newCreator = result.data;
                setCreators(prev => [...prev, newCreator]);
                setShowAddCreator(false);
                alert('Creator wurde erfolgreich hinzugefügt! Der Creator muss die Verbindung noch bestätigen.');
            } else {
                throw new Error(result.message || 'Fehler beim Hinzufügen des Creators');
            }
        } catch (error) {
            console.error('Failed to add creator:', error);
            alert(`Fehler beim Hinzufügen des Creators: ${error.message}`);
        }
    };

    const handleCreatorClick = (creator) => {
        setSelectedCreator(creator);
        setShowCreatorDetails(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { class: 'status-active', label: 'Aktiv' },
            pending: { class: 'status-pending', label: 'Ausstehend' },
            inactive: { class: 'status-inactive', label: 'Inaktiv' }
        };
        const config = statusConfig[status] || statusConfig.inactive;
        
        return React.createElement('span', {
            className: `status-badge ${config.class}`
        }, config.label);
    };

    if (isLoading) {
        return React.createElement('div', {
            style: { textAlign: 'center', padding: 'var(--prism-space-3xl)' }
        }, [
            React.createElement('div', { key: 'spinner', className: 'loading-spinner' }),
            React.createElement('p', { 
                key: 'text', 
                style: { marginTop: 'var(--prism-space-lg)', color: 'var(--prism-gray-400)' }
            }, 'Lade Creator Portfolio...')
        ]);
    }

    return React.createElement('div', {
        className: 'animate-in'
    }, [
        React.createElement('div', {
            key: 'header',
            style: { 
                marginBottom: 'var(--prism-space-2xl)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }
        }, [
            React.createElement('div', {
                key: 'title-section'
            }, [
                React.createElement('h1', {
                    key: 'title',
                    className: 'gradient-studio',
                    style: { fontSize: 'var(--prism-text-3xl)', marginBottom: 'var(--prism-space-sm)' }
                }, '👥 Creator Portfolio'),
                React.createElement('p', {
                    key: 'subtitle',
                    style: { color: 'var(--prism-gray-400)' }
                }, `Verwalten Sie Ihre ${creators.length} Creator-Beziehungen`)
            ]),
            
            React.createElement('button', {
                key: 'add-creator-btn',
                onClick: () => setShowAddCreator(true),
                style: {
                    padding: 'var(--prism-space-md) var(--prism-space-lg)',
                    background: 'linear-gradient(135deg, var(--studio-primary), var(--studio-secondary))',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--prism-radius-md)',
                    fontSize: 'var(--prism-text-sm)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--prism-space-sm)',
                    transition: 'all 0.2s ease'
                },
                onMouseEnter: (e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                },
                onMouseLeave: (e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                }
            }, [
                React.createElement('span', { key: 'icon' }, '➕'),
                React.createElement('span', { key: 'text' }, 'Creator hinzufügen')
            ])
        ]),

        React.createElement('div', {
            key: 'filters',
            className: 'card-studio',
            style: { marginBottom: 'var(--prism-space-xl)' }
        }, [
            React.createElement('div', {
                key: 'search',
                style: { marginBottom: 'var(--prism-space-lg)' }
            }, [
                React.createElement('input', {
                    key: 'search-input',
                    type: 'text',
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                    className: 'input-studio',
                    placeholder: 'Creator suchen...',
                    style: { maxWidth: '400px' }
                })
            ]),

            React.createElement('div', {
                key: 'filter-row',
                style: { 
                    display: 'flex', 
                    gap: 'var(--prism-space-lg)',
                    flexWrap: 'wrap'
                }
            }, [
                React.createElement('div', {
                    key: 'status-filter',
                    style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-sm)' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: { color: 'var(--prism-gray-300)', fontWeight: '600' }
                    }, 'Status'),
                    React.createElement('select', {
                        key: 'select',
                        value: filterStatus,
                        onChange: (e) => setFilterStatus(e.target.value),
                        className: 'input-studio',
                        style: { width: '150px' }
                    }, [
                        React.createElement('option', { key: 'all', value: 'all' }, 'Alle'),
                        React.createElement('option', { key: 'active', value: 'active' }, 'Aktiv'),
                        React.createElement('option', { key: 'pending', value: 'pending' }, 'Ausstehend'),
                        React.createElement('option', { key: 'inactive', value: 'inactive' }, 'Inaktiv')
                    ])
                ]),

                React.createElement('div', {
                    key: 'category-filter',
                    style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-sm)' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: { color: 'var(--prism-gray-300)', fontWeight: '600' }
                    }, 'Kategorie'),
                    React.createElement('select', {
                        key: 'select',
                        value: filterCategory,
                        onChange: (e) => setFilterCategory(e.target.value),
                        className: 'input-studio',
                        style: { width: '180px' }
                    }, [
                        React.createElement('option', { key: 'all', value: 'all' }, 'Alle Kategorien'),
                        ...window.creatorCategories.map(cat => 
                            React.createElement('option', { 
                                key: cat.id, 
                                value: cat.id 
                            }, `${cat.icon} ${cat.label}`)
                        )
                    ])
                ])
            ])
        ]),

        React.createElement('div', {
            key: 'creators-grid',
            className: 'feature-grid'
        }, filteredCreators.length > 0 ? 
            filteredCreators.map(creator => 
                React.createElement('div', {
                    key: creator.id,
                    className: 'creator-card',
                    onClick: () => handleCreatorClick(creator),
                    style: { cursor: 'pointer' }
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
                        React.createElement('div', {
                            key: 'name',
                            style: { flex: 1 }
                        }, [
                            React.createElement('h3', {
                                key: 'display-name',
                                style: { 
                                    fontSize: 'var(--prism-text-lg)', 
                                    color: 'var(--studio-primary)',
                                    marginBottom: 'var(--prism-space-xs)'
                                }
                            }, creator.stageName || creator.name),
                            creator.stageName && React.createElement('p', {
                                key: 'real-name',
                                style: { 
                                    fontSize: 'var(--prism-text-sm)', 
                                    color: 'var(--prism-gray-400)'
                                }
                            }, creator.name)
                        ]),
                        getStatusBadge(creator.status)
                    ]),

                    React.createElement('div', {
                        key: 'info',
                        style: { marginBottom: 'var(--prism-space-md)' }
                    }, [
                        React.createElement('div', {
                            key: 'category',
                            style: { 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'var(--prism-space-sm)',
                                marginBottom: 'var(--prism-space-sm)'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'icon',
                                style: { fontSize: 'var(--prism-text-lg)' }
                            }, window.creatorCategories.find(c => c.id === creator.category)?.icon || '👤'),
                            React.createElement('span', {
                                key: 'label',
                                style: { color: 'var(--prism-gray-300)' }
                            }, window.creatorCategories.find(c => c.id === creator.category)?.label || 'Creator')
                        ]),

                        React.createElement('div', {
                            key: 'commission',
                            style: { 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                fontSize: 'var(--prism-text-sm)',
                                color: 'var(--prism-gray-400)'
                            }
                        }, [
                            React.createElement('span', { key: 'label' }, 'Kommission:'),
                            React.createElement('span', { 
                                key: 'value',
                                style: { color: 'var(--studio-accent)', fontWeight: '600' }
                            }, `${creator.commission || 20}%`)
                        ])
                    ]),

                    React.createElement('div', {
                        key: 'stats',
                        style: { 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: 'var(--prism-space-sm)',
                            fontSize: 'var(--prism-text-sm)'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'earnings',
                            style: { textAlign: 'center' }
                        }, [
                            React.createElement('div', {
                                key: 'value',
                                style: { color: 'var(--prism-success)', fontWeight: '600' }
                            }, `€${(creator.monthlyEarnings || 0).toLocaleString()}`),
                            React.createElement('div', {
                                key: 'label',
                                style: { color: 'var(--prism-gray-500)' }
                            }, 'Monat')
                        ]),
                        React.createElement('div', {
                            key: 'join-date',
                            style: { textAlign: 'center' }
                        }, [
                            React.createElement('div', {
                                key: 'value',
                                style: { color: 'var(--prism-info)', fontWeight: '600' }
                            }, new Date(creator.joinDate || Date.now()).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })),
                            React.createElement('div', {
                                key: 'label',
                                style: { color: 'var(--prism-gray-500)' }
                            }, 'Beitritt')
                        ])
                    ])
                ])
            ) : [
                React.createElement('div', {
                    key: 'empty',
                    className: 'card-studio',
                    style: { 
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: 'var(--prism-space-3xl)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'icon',
                        style: { fontSize: '4rem', marginBottom: 'var(--prism-space-lg)' }
                    }, '👥'),
                    React.createElement('h3', {
                        key: 'title',
                        style: { 
                            fontSize: 'var(--prism-text-xl)', 
                            marginBottom: 'var(--prism-space-sm)',
                            color: 'var(--prism-gray-300)'
                        }
                    }, 'Keine Creator gefunden'),
                    React.createElement('p', {
                        key: 'description',
                        style: { color: 'var(--prism-gray-400)' }
                    }, searchTerm ? 'Versuchen Sie andere Suchbegriffe' : 'Fügen Sie Creator zu Ihrem Portfolio hinzu')
                ])
            ]
        ),

        // Creator Details Modal
        showCreatorDetails && selectedCreator && React.createElement(CreatorDetailsModal, {
            key: 'creator-details',
            creator: selectedCreator,
            onClose: () => {
                setShowCreatorDetails(false);
                setSelectedCreator(null);
            },
            onUpdate: loadCreators
        }),
        
        // Add Creator Modal
        showAddCreator && React.createElement(CreatorAddModal, {
            key: 'add-creator-modal',
            onClose: () => setShowAddCreator(false),
            onAddCreator: handleAddCreator,
            studio: studio
        })
    ]);
}

// Creator Details Modal
function CreatorDetailsModal({ creator, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editForm, setEditForm] = React.useState({
        commission: creator.commission || 20,
        status: creator.status,
        notes: creator.notes || ''
    });

    const handleSave = async () => {
        try {
            const result = await window.studioAPI.updateCreatorRelationship(
                creator.studioId, 
                creator.id, 
                editForm
            );
            
            if (result.success) {
                onUpdate();
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to update creator:', error);
        }
    };

    return React.createElement('div', {
        className: 'modal-studio'
    }, [
        React.createElement('div', {
            key: 'modal-content',
            className: 'modal-content-studio',
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
                    style: { fontSize: 'var(--prism-text-xl)', color: 'var(--studio-primary)' }
                }, creator.stageName || creator.name),
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

            React.createElement('div', {
                key: 'content',
                style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-lg)' }
            }, [
                React.createElement('div', {
                    key: 'info',
                    className: 'card-studio'
                }, [
                    React.createElement('h4', {
                        key: 'title',
                        style: { marginBottom: 'var(--prism-space-md)', color: 'var(--prism-gray-300)' }
                    }, 'Creator Information'),
                    React.createElement('div', {
                        key: 'details',
                        style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--prism-space-md)' }
                    }, [
                        React.createElement('div', { key: 'category' }, [
                            React.createElement('strong', { key: 'label' }, 'Kategorie: '),
                            React.createElement('span', { key: 'value' }, 
                                window.creatorCategories.find(c => c.id === creator.category)?.label || 'Creator'
                            )
                        ]),
                        React.createElement('div', { key: 'join-date' }, [
                            React.createElement('strong', { key: 'label' }, 'Beitritt: '),
                            React.createElement('span', { key: 'value' }, 
                                new Date(creator.joinDate || Date.now()).toLocaleDateString('de-DE')
                            )
                        ])
                    ])
                ]),

                isEditing ? React.createElement('div', {
                    key: 'edit-form',
                    className: 'card-studio'
                }, [
                    React.createElement('h4', {
                        key: 'title',
                        style: { marginBottom: 'var(--prism-space-md)', color: 'var(--prism-gray-300)' }
                    }, 'Beziehung bearbeiten'),
                    
                    React.createElement('div', {
                        key: 'fields',
                        style: { display: 'flex', flexDirection: 'column', gap: 'var(--prism-space-md)' }
                    }, [
                        React.createElement('div', { key: 'commission' }, [
                            React.createElement('label', {
                                key: 'label',
                                style: { display: 'block', marginBottom: 'var(--prism-space-sm)', fontWeight: '600' }
                            }, 'Kommission (%)'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'number',
                                min: '0',
                                max: '100',
                                value: editForm.commission,
                                onChange: (e) => setEditForm(prev => ({ ...prev, commission: Number(e.target.value) })),
                                className: 'input-studio'
                            })
                        ]),

                        React.createElement('div', { key: 'status' }, [
                            React.createElement('label', {
                                key: 'label',
                                style: { display: 'block', marginBottom: 'var(--prism-space-sm)', fontWeight: '600' }
                            }, 'Status'),
                            React.createElement('select', {
                                key: 'select',
                                value: editForm.status,
                                onChange: (e) => setEditForm(prev => ({ ...prev, status: e.target.value })),
                                className: 'input-studio'
                            }, [
                                React.createElement('option', { key: 'active', value: 'active' }, 'Aktiv'),
                                React.createElement('option', { key: 'pending', value: 'pending' }, 'Ausstehend'),
                                React.createElement('option', { key: 'inactive', value: 'inactive' }, 'Inaktiv')
                            ])
                        ]),

                        React.createElement('div', { key: 'notes' }, [
                            React.createElement('label', {
                                key: 'label',
                                style: { display: 'block', marginBottom: 'var(--prism-space-sm)', fontWeight: '600' }
                            }, 'Notizen'),
                            React.createElement('textarea', {
                                key: 'textarea',
                                value: editForm.notes,
                                onChange: (e) => setEditForm(prev => ({ ...prev, notes: e.target.value })),
                                className: 'input-studio',
                                rows: 3,
                                placeholder: 'Interne Notizen...'
                            })
                        ])
                    ]),

                    React.createElement('div', {
                        key: 'actions',
                        style: { 
                            display: 'flex', 
                            gap: 'var(--prism-space-md)',
                            marginTop: 'var(--prism-space-lg)'
                        }
                    }, [
                        React.createElement('button', {
                            key: 'cancel',
                            onClick: () => setIsEditing(false),
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
                            key: 'save',
                            onClick: handleSave,
                            className: 'btn-studio',
                            style: { flex: 1 }
                        }, 'Speichern')
                    ])
                ]) : React.createElement('div', {
                    key: 'view-details',
                    className: 'card-studio'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        style: { 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: 'var(--prism-space-md)'
                        }
                    }, [
                        React.createElement('h4', {
                            key: 'title',
                            style: { color: 'var(--prism-gray-300)' }
                        }, 'Beziehung Details'),
                        React.createElement('button', {
                            key: 'edit',
                            onClick: () => setIsEditing(true),
                            className: 'btn-studio',
                            style: { fontSize: 'var(--prism-text-sm)', padding: 'var(--prism-space-sm) var(--prism-space-md)' }
                        }, '✏️ Bearbeiten')
                    ]),
                    
                    React.createElement('div', {
                        key: 'details',
                        style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--prism-space-md)' }
                    }, [
                        React.createElement('div', { key: 'commission' }, [
                            React.createElement('strong', { key: 'label' }, 'Kommission: '),
                            React.createElement('span', { 
                                key: 'value',
                                style: { color: 'var(--studio-accent)' }
                            }, `${creator.commission || 20}%`)
                        ]),
                        React.createElement('div', { key: 'status' }, [
                            React.createElement('strong', { key: 'label' }, 'Status: '),
                            React.createElement('span', { key: 'value' }, 
                                creator.status === 'active' ? '✅ Aktiv' :
                                creator.status === 'pending' ? '⏳ Ausstehend' : '❌ Inaktiv'
                            )
                        ])
                    ])
                ])
            ])
        ])
    ]);
}

// Creator Add Modal Component (for CreatorManagement)
function CreatorAddModal({ onClose, onAddCreator, studio }) {
    // Debug props
    console.log('CreatorAddModal props:', { onClose: typeof onClose, onAddCreator: typeof onAddCreator, studio });
    
    const [studioKey, setStudioKey] = React.useState('');
    const [creatorName, setCreatorName] = React.useState('');
    const [permissions, setPermissions] = React.useState('view');
    const [isValidatingKey, setIsValidatingKey] = React.useState(false);
    const [keyInfo, setKeyInfo] = React.useState(null);

    const validateStudioKey = async (key) => {
        if (!key || !key.startsWith('sk_')) {
            setKeyInfo(null);
            return;
        }

        setIsValidatingKey(true);
        try {
            const response = await fetch('http://localhost:3004/api/studio/validate-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ studioKey: key })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                const keyData = result.data;
                setKeyInfo({
                    valid: true,
                    creatorName: keyData.creatorName,
                    permission: keyData.permission,
                    created: new Date(keyData.created).toLocaleDateString('de-DE'),
                    active: keyData.active
                });
            } else {
                setKeyInfo({ 
                    valid: false, 
                    error: result.message || 'Ungültiger Studio Key' 
                });
            }
        } catch (error) {
            console.error('Key validation error:', error);
            setKeyInfo({ 
                valid: false, 
                error: 'Fehler bei der Key-Validierung' 
            });
        } finally {
            setIsValidatingKey(false);
        }
    };

    React.useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (studioKey) {
                validateStudioKey(studioKey);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [studioKey, creatorName]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('handleSubmit called, onAddCreator type:', typeof onAddCreator);
        console.log('onAddCreator function:', onAddCreator);
        
        if (!keyInfo || !keyInfo.valid) {
            alert('Bitte geben Sie einen gültigen Studio Key ein');
            return;
        }

        const creatorData = {
            name: creatorName || keyInfo.creatorName,
            studioKey: studioKey,
            permission: keyInfo.permission,
            category: 'general',
            commission: 20,
            status: 'pending'
        };

        if (typeof onAddCreator === 'function') {
            onAddCreator(creatorData);
        } else {
            console.error('onAddCreator is not a function:', onAddCreator);
            alert('Fehler: onAddCreator Funktion nicht verfügbar');
        }
    };

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
            zIndex: 9999
        },
        onClick: (e) => {
            if (e.target === e.currentTarget) onClose();
        }
    }, [
        React.createElement('div', {
            style: {
                background: 'var(--prism-bg-primary)',
                borderRadius: 'var(--prism-radius-lg)',
                padding: '2rem',
                width: '90%',
                maxWidth: '500px',
                border: '1px solid var(--prism-border)',
                maxHeight: '90vh',
                overflowY: 'auto'
            },
            onClick: (e) => e.stopPropagation()
        }, [
            // Modal Header
            React.createElement('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--prism-border)'
                }
            }, [
                React.createElement('h2', {
                    key: 'title',
                    style: {
                        color: 'var(--prism-text-primary)',
                        margin: 0,
                        fontSize: '1.5rem',
                        fontWeight: '600'
                    }
                }, '➕ Creator hinzufügen'),
                React.createElement('button', {
                    key: 'close',
                    onClick: onClose,
                    style: {
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: 'var(--prism-text-secondary)',
                        padding: '0.25rem'
                    }
                }, '✕')
            ]),

            // Form
            React.createElement('form', {
                key: 'form',
                onSubmit: handleSubmit
            }, [
                // Studio Key Input
                React.createElement('div', {
                    key: 'studio-key-section',
                    style: { marginBottom: '1.5rem' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--prism-text-primary)',
                            fontWeight: '500',
                            fontSize: '0.95rem'
                        }
                    }, '🔑 Studio Management Key'),
                    React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: studioKey,
                        onChange: (e) => setStudioKey(e.target.value),
                        placeholder: 'sk_1722268800_abc123...',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: `2px solid ${keyInfo ? (keyInfo.valid ? '#10b981' : '#ef4444') : 'var(--prism-border)'}`,
                            borderRadius: 'var(--prism-radius-md)',
                            background: 'var(--prism-bg-secondary)',
                            color: 'var(--prism-text-primary)',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace'
                        },
                        required: true
                    }),
                    React.createElement('p', {
                        key: 'help',
                        style: {
                            fontSize: '0.8rem',
                            color: 'var(--prism-text-secondary)',
                            margin: '0.5rem 0 0 0'
                        }
                    }, 'Geben Sie den Studio Key ein, den der Creator in seinen Einstellungen generiert hat')
                ]),

                // Key Validation Status
                isValidatingKey && React.createElement('div', {
                    key: 'validating',
                    style: {
                        padding: '0.75rem',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: 'var(--prism-radius-md)',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    React.createElement('span', { key: 'spinner' }, '🔄'),
                    React.createElement('span', { key: 'text' }, 'Validiere Studio Key...')
                ]),

                // Key Info Display
                keyInfo && React.createElement('div', {
                    key: 'key-info',
                    style: {
                        padding: '1rem',
                        background: keyInfo.valid ? '#10b98120' : '#ef444420',
                        border: `1px solid ${keyInfo.valid ? '#10b981' : '#ef4444'}`,
                        borderRadius: 'var(--prism-radius-md)',
                        marginBottom: '1.5rem'
                    }
                }, keyInfo.valid ? [
                    React.createElement('div', {
                        key: 'valid-header',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                            color: '#10b981',
                            fontWeight: '600'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '✅'),
                        React.createElement('span', { key: 'text' }, 'Gültiger Studio Key')
                    ]),
                    React.createElement('div', {
                        key: 'key-details',
                        style: {
                            fontSize: '0.9rem',
                            color: 'var(--prism-text-secondary)',
                            display: 'grid',
                            gap: '0.25rem'
                        }
                    }, [
                        React.createElement('div', { key: 'created' }, `📅 Erstellt: ${keyInfo.created}`),
                        React.createElement('div', { key: 'permission' }, `🎯 Berechtigung: ${keyInfo.permission}`),
                        React.createElement('div', { key: 'status' }, `⚡ Status: ${keyInfo.active ? 'Aktiv' : 'Inaktiv'}`)
                    ])
                ] : [
                    React.createElement('div', {
                        key: 'invalid-header',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#ef4444',
                            fontWeight: '600'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '❌'),
                        React.createElement('span', { key: 'text' }, keyInfo.error || 'Ungültiger Studio Key')
                    ])
                ]),

                // Creator Name Input (optional)
                React.createElement('div', {
                    key: 'creator-name-section',
                    style: { marginBottom: '1.5rem' }
                }, [
                    React.createElement('label', {
                        key: 'label',
                        style: {
                            display: 'block',
                            marginBottom: '0.5rem',
                            color: 'var(--prism-text-primary)',
                            fontWeight: '500',
                            fontSize: '0.95rem'
                        }
                    }, '👤 Creator Name (optional)'),
                    React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        value: creatorName,
                        onChange: (e) => setCreatorName(e.target.value),
                        placeholder: 'z.B. "Anna Schmidt" oder leer lassen für automatische Erkennung',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid var(--prism-border)',
                            borderRadius: 'var(--prism-radius-md)',
                            background: 'var(--prism-bg-secondary)',
                            color: 'var(--prism-text-primary)',
                            fontSize: '0.95rem'
                        }
                    })
                ]),

                // Submit Buttons
                React.createElement('div', {
                    key: 'actions',
                    style: {
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--prism-border)'
                    }
                }, [
                    React.createElement('button', {
                        key: 'cancel',
                        type: 'button',
                        onClick: onClose,
                        style: {
                            padding: '0.75rem 1.5rem',
                            background: 'var(--prism-bg-secondary)',
                            color: 'var(--prism-text-secondary)',
                            border: '1px solid var(--prism-border)',
                            borderRadius: 'var(--prism-radius-md)',
                            fontSize: '0.95rem',
                            cursor: 'pointer'
                        }
                    }, 'Abbrechen'),
                    React.createElement('button', {
                        key: 'submit',
                        type: 'submit',
                        disabled: !keyInfo || !keyInfo.valid,
                        style: {
                            padding: '0.75rem 1.5rem',
                            background: (!keyInfo || !keyInfo.valid) ? '#6b7280' : 'linear-gradient(135deg, var(--studio-primary), var(--studio-secondary))',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--prism-radius-md)',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            cursor: (!keyInfo || !keyInfo.valid) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '➕'),
                        React.createElement('span', { key: 'text' }, 'Creator hinzufügen')
                    ])
                ])
            ])
        ])
    ]);
}

// Export to global scope
window.CreatorManagement = CreatorManagement;
window.CreatorAddModal = CreatorAddModal;
