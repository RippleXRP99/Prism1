// Content Planner Component - Comprehensive Content Planning & Scheduling
function ContentPlanner({ setActiveTab }) {
    // State Management
    const [activeView, setActiveView] = React.useState('calendar'); // calendar, timeline, kanban, analytics
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const [contentItems, setContentItems] = React.useState(() => {
        const saved = localStorage.getItem('prism-content-plan');
        return saved ? JSON.parse(saved) : [];
    });
    const [customTemplates, setCustomTemplates] = React.useState(() => {
        const saved = localStorage.getItem('prism-content-templates');
        return saved ? JSON.parse(saved) : [];
    });
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [showTemplateModal, setShowTemplateModal] = React.useState(false);
    const [showCreateTemplateModal, setShowCreateTemplateModal] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState(null);
    const [filterCategory, setFilterCategory] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [draggedItem, setDraggedItem] = React.useState(null);
    const [templateForm, setTemplateForm] = React.useState({
        name: '',
        description: '',
        category: 'video',
        duration: 30,
        checklist: '',
        tags: ''
    });

    // Content Categories and Types
    const contentCategories = [
        { id: 'stream', label: 'Live Streams', icon: '🔴', color: '#ef4444' },
        { id: 'video', label: 'Videos', icon: '🎬', color: '#3b82f6' },
        { id: 'short', label: 'Shorts/Clips', icon: '📱', color: '#10b981' },
        { id: 'podcast', label: 'Podcasts', icon: '🎙️', color: '#8b5cf6' },
        { id: 'post', label: 'Social Posts', icon: '📱', color: '#f59e0b' },
        { id: 'collab', label: 'Kollaborationen', icon: '🤝', color: '#06b6d4' },
        { id: 'tutorial', label: 'Tutorials', icon: '📚', color: '#84cc16' },
        { id: 'review', label: 'Reviews', icon: '⭐', color: '#f97316' }
    ];

    const contentStatus = [
        { id: 'idea', label: 'Idee', color: '#6b7280' },
        { id: 'planned', label: 'Geplant', color: '#3b82f6' },
        { id: 'in_progress', label: 'In Bearbeitung', color: '#f59e0b' },
        { id: 'ready', label: 'Bereit', color: '#10b981' },
        { id: 'published', label: 'Veröffentlicht', color: '#8b5cf6' },
        { id: 'archived', label: 'Archiviert', color: '#6b7280' }
    ];

    const contentTemplates = [
        {
            id: 'gaming-stream',
            name: 'Gaming Stream',
            category: 'stream',
            duration: 180,
            description: 'Live Gaming Session',
            checklist: [
                'Spiel vorbereiten',
                'Stream-Setup testen',
                'Chat-Moderation vorbereiten',
                'Social Media ankündigen'
            ],
            tags: ['gaming', 'live', 'interactive']
        },
        {
            id: 'tutorial-video',
            name: 'Tutorial Video',
            category: 'tutorial',
            duration: 30,
            description: 'Lehrreiches Tutorial',
            checklist: [
                'Konzept erstellen',
                'Materialien vorbereiten',
                'Drehbuch schreiben',
                'Aufnahme planen',
                'Schnitt und Bearbeitung'
            ],
            tags: ['education', 'tutorial', 'howto']
        },
        {
            id: 'product-review',
            name: 'Produkt Review',
            category: 'review',
            duration: 15,
            description: 'Ehrliche Produktbewertung',
            checklist: [
                'Produkt testen',
                'Notizen machen',
                'Pro/Contra Liste',
                'Aufnahme vorbereiten',
                'Upload und Beschreibung'
            ],
            tags: ['review', 'product', 'honest']
        }
    ];

    // Save to localStorage
    React.useEffect(() => {
        localStorage.setItem('prism-content-plan', JSON.stringify(contentItems));
    }, [contentItems]);

    React.useEffect(() => {
        localStorage.setItem('prism-content-templates', JSON.stringify(customTemplates));
    }, [customTemplates]);

    // Pre-fill template form when editing existing content
    React.useEffect(() => {
        if (showCreateTemplateModal && window.templateFormData) {
            setTemplateForm({
                name: window.templateFormData.name || '',
                description: window.templateFormData.description || '',
                category: window.templateFormData.category || 'video',
                duration: window.templateFormData.duration || 30,
                checklist: Array.isArray(window.templateFormData.checklist) 
                    ? window.templateFormData.checklist.join('\n') 
                    : window.templateFormData.checklist || '',
                tags: Array.isArray(window.templateFormData.tags) 
                    ? window.templateFormData.tags.join(', ') 
                    : window.templateFormData.tags || ''
            });
            window.templateFormData = null;
        }
    }, [showCreateTemplateModal]);

    // Helper Functions
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const days = [];
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            days.push(currentDate);
        }
        return days;
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getContentForDate = (date) => {
        const dateStr = formatDate(date);
        return contentItems.filter(item => item.scheduledDate === dateStr);
    };

    const getCategoryConfig = (categoryId) => {
        return contentCategories.find(cat => cat.id === categoryId) || contentCategories[0];
    };

    const getStatusConfig = (statusId) => {
        return contentStatus.find(status => status.id === statusId) || contentStatus[0];
    };

    // Content Management Functions
    const createContentItem = (template = null) => {
        const newItem = {
            id: 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: template ? template.name : 'Neuer Content',
            description: template ? template.description : '',
            category: template ? template.category : 'video',
            status: 'idea',
            scheduledDate: formatDate(selectedDate),
            scheduledTime: '12:00',
            duration: template ? template.duration : 30,
            checklist: template ? [...template.checklist] : [],
            tags: template ? [...template.tags] : [],
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            priority: 'medium',
            estimatedViews: 0,
            actualViews: 0,
            engagement: 0
        };

        setContentItems(prev => [...prev, newItem]);
        setEditingItem(newItem);
        setShowCreateModal(true);
    };

    const updateContentItem = (itemId, updates) => {
        setContentItems(prev => prev.map(item => 
            item.id === itemId 
                ? { ...item, ...updates, updatedAt: new Date().toISOString() }
                : item
        ));
    };

    const deleteContentItem = (itemId) => {
        setContentItems(prev => prev.filter(item => item.id !== itemId));
    };

    const duplicateContentItem = (item) => {
        const newItem = {
            ...item,
            id: 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: item.title + ' (Kopie)',
            status: 'idea',
            scheduledDate: formatDate(selectedDate),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setContentItems(prev => [...prev, newItem]);
    };

    // Template Management Functions
    const createCustomTemplate = (name, description, category, duration, checklist, tags) => {
        const newTemplate = {
            id: 'template_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name,
            description,
            category,
            duration: parseInt(duration) || 30,
            checklist: Array.isArray(checklist) ? checklist : checklist.split('\n').filter(item => item.trim()),
            tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            createdAt: new Date().toISOString(),
            isCustom: true
        };
        setCustomTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
    };

    const deleteCustomTemplate = (templateId) => {
        setCustomTemplates(prev => prev.filter(template => template.id !== templateId));
    };

    const createContentFromExisting = (existingItem) => {
        const template = {
            name: existingItem.title,
            description: existingItem.description,
            category: existingItem.category,
            duration: existingItem.duration,
            checklist: existingItem.checklist || [],
            tags: existingItem.tags || []
        };
        window.templateFormData = template;
        setShowCreateTemplateModal(true);
    };

    const handleSaveTemplate = () => {
        if (!templateForm.name.trim()) return;
        
        createCustomTemplate(
            templateForm.name,
            templateForm.description,
            templateForm.category,
            templateForm.duration,
            templateForm.checklist,
            templateForm.tags
        );
        
        setShowCreateTemplateModal(false);
        setTemplateForm({
            name: '',
            description: '',
            category: 'video',
            duration: 30,
            checklist: '',
            tags: ''
        });
    };

    // Combine default and custom templates
    const getAllTemplates = () => {
        return [...contentTemplates, ...customTemplates];
    };

    // Filter and Search
    const filteredContent = contentItems.filter(item => {
        const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Analytics Data
    const getAnalyticsData = () => {
        const totalContent = contentItems.length;
        const publishedContent = contentItems.filter(item => item.status === 'published').length;
        const scheduledContent = contentItems.filter(item => item.status === 'planned' || item.status === 'ready').length;
        const avgViews = contentItems.reduce((sum, item) => sum + (item.actualViews || 0), 0) / Math.max(publishedContent, 1);
        
        const categoryStats = contentCategories.map(category => ({
            ...category,
            count: contentItems.filter(item => item.category === category.id).length
        }));

        const monthlyStats = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substr(0, 7);
            const monthContent = contentItems.filter(item => 
                item.scheduledDate && item.scheduledDate.startsWith(monthKey)
            );
            monthlyStats.push({
                month: date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }),
                planned: monthContent.filter(item => item.status === 'planned').length,
                published: monthContent.filter(item => item.status === 'published').length,
                total: monthContent.length
            });
        }

        return {
            totalContent,
            publishedContent,
            scheduledContent,
            avgViews: Math.round(avgViews),
            categoryStats,
            monthlyStats,
            completionRate: totalContent > 0 ? Math.round((publishedContent / totalContent) * 100) : 0
        };
    };

    // Drag and Drop
    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetDate) => {
        e.preventDefault();
        if (draggedItem) {
            updateContentItem(draggedItem.id, { 
                scheduledDate: formatDate(targetDate) 
            });
            setDraggedItem(null);
        }
    };

    // Kanban Drag & Drop
    const handleKanbanDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify({
            itemId: item.id,
            sourceStatus: item.status
        }));
    };

    const handleKanbanDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleKanbanDrop = (e, targetStatus) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedItem && draggedItem.status !== targetStatus) {
            updateContentItem(draggedItem.id, { status: targetStatus });
            setDraggedItem(null);
        }
    };

    // Render Functions
    const renderCalendarView = () => {
        const days = getDaysInMonth(currentMonth);
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                           'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        
        return React.createElement('div', {
            style: {
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }
        }, [
            // Calendar Header
            React.createElement('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: 'var(--prism-card)',
                    borderRadius: '12px',
                    marginBottom: '1rem'
                }
            }, [
                React.createElement('button', {
                    key: 'prev',
                    onClick: () => {
                        const newDate = new Date(currentMonth);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCurrentMonth(newDate);
                    },
                    style: {
                        padding: '0.5rem',
                        background: 'var(--prism-gray-700)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'var(--prism-text)',
                        cursor: 'pointer'
                    }
                }, '←'),
                React.createElement('h2', {
                    key: 'title',
                    style: {
                        margin: 0,
                        fontSize: '1.5rem',
                        color: 'var(--prism-text)'
                    }
                }, `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`),
                React.createElement('button', {
                    key: 'next',
                    onClick: () => {
                        const newDate = new Date(currentMonth);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrentMonth(newDate);
                    },
                    style: {
                        padding: '0.5rem',
                        background: 'var(--prism-gray-700)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'var(--prism-text)',
                        cursor: 'pointer'
                    }
                }, '→')
            ]),

            // Weekday Headers
            React.createElement('div', {
                key: 'weekdays',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '1px',
                    marginBottom: '1px',
                    background: 'var(--prism-gray-600)'
                }
            }, ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => 
                React.createElement('div', {
                    key: day,
                    style: {
                        padding: '0.75rem',
                        background: 'var(--prism-gray-700)',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: 'var(--prism-text)'
                    }
                }, day)
            )),

            // Calendar Grid
            React.createElement('div', {
                key: 'calendar',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gridTemplateRows: 'repeat(6, 1fr)',
                    gap: '1px',
                    background: 'var(--prism-gray-600)',
                    minHeight: '600px', // Feste Mindesthöhe ohne flex
                    borderRadius: '8px',
                    overflow: 'hidden'
                }
            }, days.map(day => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = formatDate(day) === formatDate(new Date());
                const isSelected = formatDate(day) === formatDate(selectedDate);
                const dayContent = getContentForDate(day);

                return React.createElement('div', {
                    key: day.toISOString(),
                    style: {
                        background: isCurrentMonth ? 'var(--prism-card)' : 'var(--prism-gray-800)',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--prism-purple)' : 
                               isToday ? '2px solid var(--prism-success)' : 'none',
                        position: 'relative',
                        minHeight: '80px',
                        opacity: isCurrentMonth ? 1 : 0.5
                    },
                    onClick: () => setSelectedDate(day),
                    onDragOver: handleDragOver,
                    onDrop: (e) => handleDrop(e, day)
                }, [
                    React.createElement('div', {
                        key: 'date',
                        style: {
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: isToday ? 'var(--prism-success)' : 'var(--prism-text)',
                            marginBottom: '0.25rem'
                        }
                    }, day.getDate()),
                    
                    // Content items for this day
                    ...dayContent.slice(0, 3).map(item => {
                        const category = getCategoryConfig(item.category);
                        return React.createElement('div', {
                            key: item.id,
                            draggable: true,
                            onDragStart: (e) => handleDragStart(e, item),
                            style: {
                                fontSize: '0.75rem',
                                padding: '2px 4px',
                                marginBottom: '2px',
                                background: category.color + '20',
                                color: category.color,
                                borderRadius: '4px',
                                borderLeft: `3px solid ${category.color}`,
                                cursor: 'grab',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            },
                            onClick: (e) => {
                                e.stopPropagation();
                                setEditingItem(item);
                                setShowCreateModal(true);
                            }
                        }, `${category.icon} ${item.title}`);
                    }),
                    
                    // Show count if more items
                    dayContent.length > 3 && React.createElement('div', {
                        key: 'more',
                        style: {
                            fontSize: '0.75rem',
                            color: 'var(--prism-gray-400)',
                            textAlign: 'center'
                        }
                    }, `+${dayContent.length - 3} mehr`)
                ]);
            }))
        ]);
    };

    const renderTimelineView = () => {
        const sortedContent = [...filteredContent].sort((a, b) => 
            new Date(a.scheduledDate + 'T' + a.scheduledTime) - new Date(b.scheduledDate + 'T' + b.scheduledTime)
        );

        return React.createElement('div', {
            style: {
                width: '100%'
            }
        }, [
            React.createElement('h3', {
                key: 'title',
                style: {
                    margin: '0 0 1rem 0',
                    color: 'var(--prism-text)'
                }
            }, 'Content Timeline'),
            
            React.createElement('div', {
                key: 'timeline',
                style: {
                    position: 'relative',
                    paddingLeft: '2rem'
                }
            }, [
                // Timeline line
                React.createElement('div', {
                    key: 'line',
                    style: {
                        position: 'absolute',
                        left: '1rem',
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        background: 'var(--prism-purple)'
                    }
                }),
                
                // Timeline items
                ...sortedContent.map((item, index) => {
                    const category = getCategoryConfig(item.category);
                    const status = getStatusConfig(item.status);
                    const itemDate = new Date(item.scheduledDate + 'T' + item.scheduledTime);
                    
                    return React.createElement('div', {
                        key: item.id,
                        style: {
                            position: 'relative',
                            marginBottom: '2rem',
                            paddingLeft: '2rem'
                        }
                    }, [
                        // Timeline dot
                        React.createElement('div', {
                            key: 'dot',
                            style: {
                                position: 'absolute',
                                left: '-0.5rem',
                                top: '0.5rem',
                                width: '1rem',
                                height: '1rem',
                                borderRadius: '50%',
                                background: category.color,
                                border: '2px solid var(--prism-card)'
                            }
                        }),
                        
                        // Content card
                        React.createElement('div', {
                            key: 'card',
                            style: {
                                background: 'var(--prism-card)',
                                borderRadius: '12px',
                                padding: '1rem',
                                borderLeft: `4px solid ${category.color}`
                            },
                            onClick: () => {
                                setEditingItem(item);
                                setShowCreateModal(true);
                            }
                        }, [
                            React.createElement('div', {
                                key: 'header',
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.5rem'
                                }
                            }, [
                                React.createElement('div', {
                                    key: 'info'
                                }, [
                                    React.createElement('h4', {
                                        key: 'title',
                                        style: {
                                            margin: '0 0 0.25rem 0',
                                            color: 'var(--prism-text)'
                                        }
                                    }, `${category.icon} ${item.title}`),
                                    React.createElement('p', {
                                        key: 'date',
                                        style: {
                                            margin: 0,
                                            fontSize: '0.875rem',
                                            color: 'var(--prism-gray-400)'
                                        }
                                    }, itemDate.toLocaleDateString('de-DE', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }))
                                ]),
                                React.createElement('span', {
                                    key: 'status',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        background: status.color + '20',
                                        color: status.color,
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }
                                }, status.label)
                            ]),
                            item.description && React.createElement('p', {
                                key: 'description',
                                style: {
                                    margin: '0 0 0.5rem 0',
                                    color: 'var(--prism-gray-300)',
                                    fontSize: '0.875rem'
                                }
                            }, item.description),
                            React.createElement('div', {
                                key: 'meta',
                                style: {
                                    display: 'flex',
                                    gap: '1rem',
                                    fontSize: '0.75rem',
                                    color: 'var(--prism-gray-400)'
                                }
                            }, [
                                React.createElement('span', {
                                    key: 'duration'
                                }, `⏱️ ${item.duration} Min`),
                                React.createElement('span', {
                                    key: 'priority'
                                }, `🔥 ${item.priority}`),
                                item.tags.length > 0 && React.createElement('span', {
                                    key: 'tags'
                                }, `🏷️ ${item.tags.slice(0, 3).join(', ')}`)
                            ].filter(Boolean))
                        ])
                    ]);
                })
            ])
        ]);
    };

    const renderKanbanView = () => {
        const statusColumns = contentStatus.map(status => ({
            ...status,
            items: filteredContent.filter(item => item.status === status.id)
        }));

        return React.createElement('div', {
            style: {
                display: 'flex',
                gap: '1rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                width: '100%'
            }
        }, statusColumns.map(column => 
            React.createElement('div', {
                key: column.id,
                style: {
                    background: 'var(--prism-card)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: `2px solid ${column.color}20`,
                    minWidth: '300px',
                    width: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease'
                },
                onDragOver: handleKanbanDragOver,
                onDrop: (e) => handleKanbanDrop(e, column.id),
                onDragEnter: (e) => {
                    e.preventDefault();
                    e.currentTarget.style.background = 'var(--prism-gray-700)';
                    e.currentTarget.style.borderColor = column.color;
                },
                onDragLeave: (e) => {
                    e.preventDefault();
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        e.currentTarget.style.background = 'var(--prism-card)';
                        e.currentTarget.style.borderColor = column.color + '20';
                    }
                }
            }, [
                React.createElement('div', {
                    key: 'header',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        paddingBottom: '0.5rem',
                        borderBottom: `2px solid ${column.color}`
                    }
                }, [
                    React.createElement('h3', {
                        key: 'title',
                        style: {
                            margin: 0,
                            color: column.color,
                            fontSize: '1.1rem'
                        }
                    }, column.label),
                    React.createElement('span', {
                        key: 'count',
                        style: {
                            padding: '0.25rem 0.5rem',
                            background: column.color + '20',
                            color: column.color,
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                        }
                    }, column.items.length)
                ]),
                
                React.createElement('div', {
                    key: 'items',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        minHeight: '400px', // Mindesthöhe für Inhalte
                        flex: 1
                    }
                }, column.items.map(item => {
                    const category = getCategoryConfig(item.category);
                    
                    return React.createElement('div', {
                        key: item.id,
                        draggable: true,
                        onDragStart: (e) => handleKanbanDragStart(e, item),
                        style: {
                            background: draggedItem?.id === item.id 
                                ? 'var(--prism-gray-600)' 
                                : 'var(--prism-gray-800)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            borderLeft: `4px solid ${category.color}`,
                            cursor: 'grab',
                            userSelect: 'none',
                            transition: 'all 0.2s ease',
                            opacity: draggedItem?.id === item.id ? 0.5 : 1,
                            transform: draggedItem?.id === item.id ? 'scale(0.95)' : 'scale(1)'
                        },
                        onClick: () => {
                            setEditingItem(item);
                            setShowCreateModal(true);
                        },
                        onDragEnd: () => {
                            setDraggedItem(null);
                        }
                    }, [
                        React.createElement('div', {
                            key: 'header',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            React.createElement('h4', {
                                key: 'title',
                                style: {
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: 'var(--prism-text)'
                                }
                            }, `${category.icon} ${item.title}`),
                            React.createElement('div', {
                                key: 'badges',
                                style: {
                                    display: 'flex',
                                    gap: '0.25rem',
                                    alignItems: 'center'
                                }
                            }, [
                                React.createElement('span', {
                                    key: 'priority',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: item.priority === 'high' ? '#ef4444' : 
                                               item.priority === 'medium' ? '#f59e0b' : '#6b7280'
                                    }
                                }, item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢'),
                                React.createElement('span', {
                                    key: 'drag-handle',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: 'var(--prism-gray-500)',
                                        cursor: 'grab'
                                    }
                                }, '⋮⋮')
                            ])
                        ]),
                        item.description && React.createElement('p', {
                            key: 'description',
                            style: {
                                margin: '0 0 0.5rem 0',
                                fontSize: '0.8rem',
                                color: 'var(--prism-gray-400)',
                                lineHeight: '1.4'
                            }
                        }, item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '')),
                        React.createElement('div', {
                            key: 'meta',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.75rem',
                                color: 'var(--prism-gray-500)'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'date'
                            }, new Date(item.scheduledDate).toLocaleDateString('de-DE')),
                            React.createElement('span', {
                                key: 'duration'
                            }, `${item.duration}min`)
                        ])
                    ]);
                }))
            ])
        ));
    };

    const renderAnalyticsView = () => {
        const analytics = getAnalyticsData();
        
        return React.createElement('div', {
            style: {
                width: '100%'
            }
        }, [
            React.createElement('h3', {
                key: 'title',
                style: {
                    margin: '0 0 2rem 0',
                    color: 'var(--prism-text)'
                }
            }, 'Content Analytics'),
            
            // Stats Overview
            React.createElement('div', {
                key: 'stats',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }
            }, [
                React.createElement('div', {
                    key: 'total',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        borderLeft: '4px solid var(--prism-purple)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: 'var(--prism-purple)',
                            marginBottom: '0.5rem'
                        }
                    }, analytics.totalContent),
                    React.createElement('div', {
                        key: 'label',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: '0.9rem'
                        }
                    }, 'Gesamt Content')
                ]),
                React.createElement('div', {
                    key: 'published',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        borderLeft: '4px solid var(--prism-success)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: 'var(--prism-success)',
                            marginBottom: '0.5rem'
                        }
                    }, analytics.publishedContent),
                    React.createElement('div', {
                        key: 'label',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: '0.9rem'
                        }
                    }, 'Veröffentlicht')
                ]),
                React.createElement('div', {
                    key: 'scheduled',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        borderLeft: '4px solid var(--prism-warning)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: 'var(--prism-warning)',
                            marginBottom: '0.5rem'
                        }
                    }, analytics.scheduledContent),
                    React.createElement('div', {
                        key: 'label',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: '0.9rem'
                        }
                    }, 'Geplant')
                ]),
                React.createElement('div', {
                    key: 'completion',
                    style: {
                        background: 'var(--prism-card)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center',
                        borderLeft: '4px solid var(--prism-info)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: 'var(--prism-info)',
                            marginBottom: '0.5rem'
                        }
                    }, analytics.completionRate + '%'),
                    React.createElement('div', {
                        key: 'label',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: '0.9rem'
                        }
                    }, 'Abschlussrate')
                ])
            ]),
            
            // Category Distribution
            React.createElement('div', {
                key: 'categories',
                style: {
                    background: 'var(--prism-card)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }
            }, [
                React.createElement('h4', {
                    key: 'title',
                    style: {
                        margin: '0 0 1rem 0',
                        color: 'var(--prism-text)'
                    }
                }, 'Content nach Kategorien'),
                React.createElement('div', {
                    key: 'chart',
                    style: {
                        display: 'grid',
                        gap: '0.5rem'
                    }
                }, analytics.categoryStats.map(category => {
                    const percentage = analytics.totalContent > 0 
                        ? (category.count / analytics.totalContent) * 100 
                        : 0;
                    
                    return React.createElement('div', {
                        key: category.id,
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'icon',
                            style: {
                                fontSize: '1.2rem',
                                minWidth: '2rem'
                            }
                        }, category.icon),
                        React.createElement('div', {
                            key: 'bar',
                            style: {
                                flex: 1,
                                background: 'var(--prism-gray-700)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                height: '24px',
                                position: 'relative'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'fill',
                                style: {
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: category.color,
                                    transition: 'width 0.3s ease'
                                }
                            }),
                            React.createElement('span', {
                                key: 'label',
                                style: {
                                    position: 'absolute',
                                    left: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '0.8rem',
                                    fontWeight: '500',
                                    color: percentage > 30 ? 'white' : 'var(--prism-text)'
                                }
                            }, `${category.label} (${category.count})`)
                        ])
                    ]);
                }))
            ]),
            
            // Monthly Trend
            React.createElement('div', {
                key: 'monthly',
                style: {
                    background: 'var(--prism-card)',
                    borderRadius: '12px',
                    padding: '1.5rem'
                }
            }, [
                React.createElement('h4', {
                    key: 'title',
                    style: {
                        margin: '0 0 1rem 0',
                        color: 'var(--prism-text)'
                    }
                }, 'Monatlicher Trend'),
                React.createElement('div', {
                    key: 'chart',
                    style: {
                        display: 'flex',
                        alignItems: 'end',
                        gap: '0.5rem',
                        height: '200px'
                    }
                }, analytics.monthlyStats.map((month, index) => {
                    const maxValue = Math.max(...analytics.monthlyStats.map(m => m.total));
                    const height = maxValue > 0 ? (month.total / maxValue) * 150 : 0;
                    
                    return React.createElement('div', {
                        key: index,
                        style: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'bar-container',
                            style: {
                                display: 'flex',
                                alignItems: 'end',
                                gap: '2px',
                                height: '150px'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'published',
                                style: {
                                    width: '8px',
                                    height: `${height}px`,
                                    background: 'var(--prism-success)',
                                    borderRadius: '2px'
                                }
                            }),
                            React.createElement('div', {
                                key: 'planned',
                                style: {
                                    width: '8px',
                                    height: `${maxValue > 0 ? (month.planned / maxValue) * 150 : 0}px`,
                                    background: 'var(--prism-warning)',
                                    borderRadius: '2px'
                                }
                            })
                        ]),
                        React.createElement('span', {
                            key: 'label',
                            style: {
                                fontSize: '0.75rem',
                                color: 'var(--prism-gray-400)',
                                textAlign: 'center',
                                transform: 'rotate(-45deg)',
                                transformOrigin: 'center'
                            }
                        }, month.month)
                    ]);
                }))
            ])
        ]);
    };

    const renderTemplateModal = () => {
        if (!showTemplateModal) return null;

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
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflow: 'auto'
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
                    React.createElement('h3', {
                        key: 'title',
                        style: {
                            margin: 0,
                            color: 'var(--prism-text)'
                        }
                    }, 'Content Templates auswählen'),
                    React.createElement('button', {
                        key: 'close',
                        onClick: () => setShowTemplateModal(false),
                        style: {
                            background: 'none',
                            border: 'none',
                            color: 'var(--prism-gray-400)',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }
                    }, '×')
                ]),

                React.createElement('div', {
                    key: 'templates',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }
                }, [
                    // Add new template button
                    React.createElement('div', {
                        key: 'add-template',
                        style: {
                            background: 'var(--prism-gray-800)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            borderLeft: '4px solid var(--prism-purple)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                            border: '2px dashed var(--prism-purple)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '200px'
                        },
                        onClick: () => {
                            setShowTemplateModal(false);
                            setShowCreateTemplateModal(true);
                        },
                        onMouseEnter: (e) => e.target.style.transform = 'translateY(-2px)',
                        onMouseLeave: (e) => e.target.style.transform = 'translateY(0)'
                    }, [
                        React.createElement('div', {
                            key: 'icon',
                            style: {
                                fontSize: '3rem',
                                marginBottom: '1rem',
                                color: 'var(--prism-purple)'
                            }
                        }, '➕'),
                        React.createElement('h4', {
                            key: 'title',
                            style: {
                                margin: '0 0 0.5rem 0',
                                color: 'var(--prism-text)',
                                fontSize: '1.2rem',
                                textAlign: 'center'
                            }
                        }, 'Neues Template'),
                        React.createElement('p', {
                            key: 'description',
                            style: {
                                margin: 0,
                                color: 'var(--prism-gray-400)',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }
                        }, 'Eigenes Template erstellen')
                    ]),
                    
                    // Show all templates (default + custom)
                    ...getAllTemplates().map(template => {
                    const category = getCategoryConfig(template.category);
                    
                    return React.createElement('div', {
                        key: template.id,
                        style: {
                            background: 'var(--prism-gray-800)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            borderLeft: `4px solid ${category.color}`,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease'
                        },
                        onClick: () => {
                            createContentItem(template);
                            setShowTemplateModal(false);
                        },
                        onMouseEnter: (e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        },
                        onMouseLeave: (e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }
                    }, [
                        React.createElement('div', {
                            key: 'header',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1rem'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'icon',
                                style: {
                                    fontSize: '2rem'
                                }
                            }, category.icon),
                            React.createElement('div', {
                                key: 'title-section',
                                style: {
                                    flex: 1
                                }
                            }, [
                                React.createElement('h4', {
                                    key: 'title',
                                    style: {
                                        margin: 0,
                                        color: 'var(--prism-text)',
                                        fontSize: '1.2rem'
                                    }
                                }, template.name),
                                template.isCustom && React.createElement('span', {
                                    key: 'custom-badge',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: 'var(--prism-purple)',
                                        fontWeight: '500'
                                    }
                                }, 'Eigenes Template')
                            ]),
                            template.isCustom && React.createElement('button', {
                                key: 'delete',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    if (confirm('Template wirklich löschen?')) {
                                        deleteCustomTemplate(template.id);
                                    }
                                },
                                style: {
                                    background: 'var(--prism-danger)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    padding: '0.25rem 0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem'
                                }
                            }, '🗑️')
                        ]),
                        React.createElement('p', {
                            key: 'description',
                            style: {
                                margin: '0 0 1rem 0',
                                color: 'var(--prism-gray-300)',
                                fontSize: '0.9rem',
                                lineHeight: '1.5'
                            }
                        }, template.description),
                        React.createElement('div', {
                            key: 'tags',
                            style: {
                                display: 'flex',
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                            }
                        }, template.tags.map(tag => 
                            React.createElement('span', {
                                key: tag,
                                style: {
                                    padding: '0.25rem 0.5rem',
                                    background: 'var(--prism-purple)' + '20',
                                    color: 'var(--prism-purple)',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem'
                                }
                            }, `#${tag}`)
                        ))
                    ]);
                    })
                ])
            ])
        ]);
    };

    const renderCreateTemplateModal = () => {
        if (!showCreateTemplateModal) return null;

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
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflow: 'auto'
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
                    React.createElement('h3', {
                        key: 'title',
                        style: {
                            margin: 0,
                            color: 'var(--prism-text)'
                        }
                    }, 'Neues Template erstellen'),
                    React.createElement('button', {
                        key: 'close',
                        onClick: () => setShowCreateTemplateModal(false),
                        style: {
                            background: 'none',
                            border: 'none',
                            color: 'var(--prism-gray-400)',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }
                    }, '×')
                ]),

                React.createElement('div', {
                    key: 'form',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }
                }, [
                    // Name
                    React.createElement('div', {
                        key: 'name-group'
                    }, [
                        React.createElement('label', {
                            key: 'label',
                            style: {
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--prism-text)',
                                fontWeight: '500'
                            }
                        }, 'Template Name *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: templateForm.name,
                            onChange: (e) => setTemplateForm(prev => ({ ...prev, name: e.target.value })),
                            placeholder: 'z.B. Gaming Stream, Tutorial Video...',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: '8px',
                                color: 'var(--prism-text)',
                                fontSize: '1rem'
                            }
                        })
                    ]),

                    // Description
                    React.createElement('div', {
                        key: 'description-group'
                    }, [
                        React.createElement('label', {
                            key: 'label',
                            style: {
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--prism-text)',
                                fontWeight: '500'
                            }
                        }, 'Beschreibung'),
                        React.createElement('textarea', {
                            key: 'input',
                            value: templateForm.description,
                            onChange: (e) => setTemplateForm(prev => ({ ...prev, description: e.target.value })),
                            placeholder: 'Kurze Beschreibung des Templates...',
                            rows: 3,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: '8px',
                                color: 'var(--prism-text)',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }
                        })
                    ]),

                    // Category and Duration
                    React.createElement('div', {
                        key: 'meta-group',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'category'
                        }, [
                            React.createElement('label', {
                                key: 'label',
                                style: {
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: 'var(--prism-text)',
                                    fontWeight: '500'
                                }
                            }, 'Kategorie'),
                            React.createElement('select', {
                                key: 'input',
                                value: templateForm.category,
                                onChange: (e) => setTemplateForm(prev => ({ ...prev, category: e.target.value })),
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--prism-gray-800)',
                                    border: '1px solid var(--prism-gray-600)',
                                    borderRadius: '8px',
                                    color: 'var(--prism-text)',
                                    fontSize: '1rem'
                                }
                            }, contentCategories.map(category =>
                                React.createElement('option', {
                                    key: category.id,
                                    value: category.id
                                }, `${category.icon} ${category.label}`)
                            ))
                        ]),
                        React.createElement('div', {
                            key: 'duration'
                        }, [
                            React.createElement('label', {
                                key: 'label',
                                style: {
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: 'var(--prism-text)',
                                    fontWeight: '500'
                                }
                            }, 'Dauer (Min)'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'number',
                                value: templateForm.duration,
                                onChange: (e) => setTemplateForm(prev => ({ ...prev, duration: e.target.value })),
                                min: 1,
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--prism-gray-800)',
                                    border: '1px solid var(--prism-gray-600)',
                                    borderRadius: '8px',
                                    color: 'var(--prism-text)',
                                    fontSize: '1rem'
                                }
                            })
                        ])
                    ]),

                    // Checklist
                    React.createElement('div', {
                        key: 'checklist-group'
                    }, [
                        React.createElement('label', {
                            key: 'label',
                            style: {
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--prism-text)',
                                fontWeight: '500'
                            }
                        }, 'Checkliste (eine pro Zeile)'),
                        React.createElement('textarea', {
                            key: 'input',
                            value: templateForm.checklist,
                            onChange: (e) => setTemplateForm(prev => ({ ...prev, checklist: e.target.value })),
                            placeholder: 'Setup vorbereiten\nMaterialien bereitstellen\nAufnahme starten\n...',
                            rows: 4,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: '8px',
                                color: 'var(--prism-text)',
                                fontSize: '1rem',
                                resize: 'vertical'
                            }
                        })
                    ]),

                    // Tags
                    React.createElement('div', {
                        key: 'tags-group'
                    }, [
                        React.createElement('label', {
                            key: 'label',
                            style: {
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--prism-text)',
                                fontWeight: '500'
                            }
                        }, 'Tags (mit Komma getrennt)'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: templateForm.tags,
                            onChange: (e) => setTemplateForm(prev => ({ ...prev, tags: e.target.value })),
                            placeholder: 'gaming, tutorial, live, stream',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: '8px',
                                color: 'var(--prism-text)',
                                fontSize: '1rem'
                            }
                        })
                    ]),

                    // Buttons
                    React.createElement('div', {
                        key: 'buttons',
                        style: {
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'flex-end',
                            marginTop: '1rem'
                        }
                    }, [
                        React.createElement('button', {
                            key: 'cancel',
                            onClick: () => setShowCreateTemplateModal(false),
                            style: {
                                padding: '0.75rem 1.5rem',
                                background: 'var(--prism-gray-700)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'var(--prism-text)',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }
                        }, 'Abbrechen'),
                        React.createElement('button', {
                            key: 'save',
                            onClick: handleSaveTemplate,
                            disabled: !templateForm.name.trim(),
                            style: {
                                padding: '0.75rem 1.5rem',
                                background: templateForm.name.trim() ? 'var(--prism-purple)' : 'var(--prism-gray-600)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: templateForm.name.trim() ? 'pointer' : 'not-allowed',
                                fontSize: '1rem'
                            }
                        }, 'Template erstellen')
                    ])
                ])
            ])
        ]);
    };

    const renderCreateModal = () => {
        if (!showCreateModal) return null;

        const item = editingItem || {
            title: '',
            description: '',
            category: 'video',
            status: 'idea',
            scheduledDate: formatDate(selectedDate),
            scheduledTime: '12:00',
            duration: 30,
            checklist: [],
            tags: [],
            notes: '',
            priority: 'medium'
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
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflow: 'auto'
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
                    React.createElement('h3', {
                        key: 'title',
                        style: {
                            margin: 0,
                            color: 'var(--prism-text)'
                        }
                    }, editingItem ? 'Content bearbeiten' : 'Neuen Content erstellen'),
                    React.createElement('div', {
                        key: 'header-buttons',
                        style: {
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }
                    }, [
                        editingItem && React.createElement('button', {
                            key: 'save-template',
                            onClick: () => {
                                createContentFromExisting(editingItem);
                                setShowCreateModal(false);
                            },
                            style: {
                                background: 'var(--prism-purple)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }
                        }, '📋 Als Template'),
                        React.createElement('button', {
                            key: 'close',
                            onClick: () => {
                                setShowCreateModal(false);
                                setEditingItem(null);
                            },
                            style: {
                                background: 'none',
                                border: 'none',
                                color: 'var(--prism-gray-400)',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }
                        }, '×')
                    ])
                ]),

                // Form Content will be implemented in next part...
                React.createElement('div', {
                    key: 'form',
                    style: {
                        display: 'grid',
                        gap: '1rem'
                    }
                }, [
                    // Basic Info
                    React.createElement('div', {
                        key: 'basic'
                    }, [
                        React.createElement('label', {
                            key: 'title-label',
                            style: {
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--prism-text)',
                                fontWeight: '500'
                            }
                        }, 'Titel'),
                        React.createElement('input', {
                            key: 'title-input',
                            type: 'text',
                            value: item.title,
                            onChange: (e) => {
                                const newItem = { ...item, title: e.target.value };
                                setEditingItem(newItem);
                            },
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                border: '2px solid var(--prism-gray-600)',
                                borderRadius: '8px',
                                color: 'var(--prism-text)',
                                fontSize: '1rem'
                            },
                            placeholder: 'Content Titel eingeben...'
                        })
                    ]),

                    // Category and Status
                    React.createElement('div', {
                        key: 'meta',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'category'
                        }, [
                            React.createElement('label', {
                                key: 'label',
                                style: {
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: 'var(--prism-text)',
                                    fontWeight: '500'
                                }
                            }, 'Kategorie'),
                            React.createElement('select', {
                                key: 'select',
                                value: item.category,
                                onChange: (e) => {
                                    const newItem = { ...item, category: e.target.value };
                                    setEditingItem(newItem);
                                },
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--prism-gray-800)',
                                    border: '2px solid var(--prism-gray-600)',
                                    borderRadius: '8px',
                                    color: 'var(--prism-text)',
                                    fontSize: '1rem'
                                }
                            }, contentCategories.map(category => 
                                React.createElement('option', {
                                    key: category.id,
                                    value: category.id
                                }, `${category.icon} ${category.label}`)
                            ))
                        ]),
                        React.createElement('div', {
                            key: 'status'
                        }, [
                            React.createElement('label', {
                                key: 'label',
                                style: {
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: 'var(--prism-text)',
                                    fontWeight: '500'
                                }
                            }, 'Status'),
                            React.createElement('select', {
                                key: 'select',
                                value: item.status,
                                onChange: (e) => {
                                    const newItem = { ...item, status: e.target.value };
                                    setEditingItem(newItem);
                                },
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'var(--prism-gray-800)',
                                    border: '2px solid var(--prism-gray-600)',
                                    borderRadius: '8px',
                                    color: 'var(--prism-text)',
                                    fontSize: '1rem'
                                }
                            }, contentStatus.map(status => 
                                React.createElement('option', {
                                    key: status.id,
                                    value: status.id
                                }, status.label)
                            ))
                        ])
                    ]),

                    // Description
                    React.createElement('div', {
                        key: 'description'
                    }, [
                        React.createElement('label', {
                            key: 'label',
                            style: {
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--prism-text)',
                                fontWeight: '500'
                            }
                        }, 'Beschreibung'),
                        React.createElement('textarea', {
                            key: 'textarea',
                            value: item.description,
                            onChange: (e) => {
                                const newItem = { ...item, description: e.target.value };
                                setEditingItem(newItem);
                            },
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--prism-gray-800)',
                                border: '2px solid var(--prism-gray-600)',
                                borderRadius: '8px',
                                color: 'var(--prism-text)',
                                fontSize: '1rem',
                                minHeight: '100px',
                                resize: 'vertical'
                            },
                            placeholder: 'Content Beschreibung...'
                        })
                    ]),

                    // Save Button
                    React.createElement('div', {
                        key: 'actions',
                        style: {
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '1rem'
                        }
                    }, [
                        React.createElement('button', {
                            key: 'save',
                            onClick: () => {
                                if (editingItem && editingItem.id) {
                                    updateContentItem(editingItem.id, editingItem);
                                } else {
                                    const newItem = {
                                        ...item,
                                        id: 'content_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString()
                                    };
                                    setContentItems(prev => [...prev, newItem]);
                                }
                                setShowCreateModal(false);
                                setEditingItem(null);
                            },
                            style: {
                                flex: 1,
                                padding: '0.75rem 1.5rem',
                                background: 'var(--prism-purple)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }
                        }, editingItem ? 'Speichern' : 'Erstellen'),
                        React.createElement('button', {
                            key: 'cancel',
                            onClick: () => {
                                setShowCreateModal(false);
                                setEditingItem(null);
                            },
                            style: {
                                padding: '0.75rem 1.5rem',
                                background: 'var(--prism-gray-700)',
                                color: 'var(--prism-text)',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }
                        }, 'Abbrechen')
                    ])
                ])
            ])
        ]);
    };

    // Main Render
    return React.createElement('div', {
        className: 'animate-in',
        style: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '0',
            margin: '0'
        }
    }, [
        // Header
        React.createElement('div', {
            key: 'header',
            className: 'header'
        }, [
            React.createElement('h1', {
                key: 'title',
                className: 'gradient-text'
            }, '📅 Content Planner'),
            React.createElement('p', {
                key: 'subtitle'
            }, 'Plane und organisiere deinen Content mit verschiedenen Ansichten und Templates')
        ]),

        // Controls Bar
        React.createElement('div', {
            key: 'controls',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '0.75rem',
                background: 'var(--prism-card)',
                borderRadius: '12px'
            }
        }, [
            React.createElement('div', {
                key: 'views',
                style: {
                    display: 'flex',
                    gap: '0.5rem'
                }
            }, [
                React.createElement('button', {
                    key: 'calendar',
                    onClick: () => setActiveView('calendar'),
                    className: activeView === 'calendar' ? 'btn-prism btn-prism-primary' : 'btn-prism btn-prism-dark'
                }, [
                    React.createElement('span', { key: 'icon' }, '📅'),
                    React.createElement('span', { key: 'text' }, 'Kalender')
                ]),
                React.createElement('button', {
                    key: 'timeline',
                    onClick: () => setActiveView('timeline'),
                    className: activeView === 'timeline' ? 'btn-prism btn-prism-primary' : 'btn-prism btn-prism-dark'
                }, [
                    React.createElement('span', { key: 'icon' }, '📈'),
                    React.createElement('span', { key: 'text' }, 'Timeline')
                ]),
                React.createElement('button', {
                    key: 'kanban',
                    onClick: () => setActiveView('kanban'),
                    className: activeView === 'kanban' ? 'btn-prism btn-prism-primary' : 'btn-prism btn-prism-dark'
                }, [
                    React.createElement('span', { key: 'icon' }, '📋'),
                    React.createElement('span', { key: 'text' }, 'Kanban')
                ]),
                React.createElement('button', {
                    key: 'analytics',
                    onClick: () => setActiveView('analytics'),
                    className: activeView === 'analytics' ? 'btn-prism btn-prism-primary' : 'btn-prism btn-prism-dark'
                }, [
                    React.createElement('span', { key: 'icon' }, '📊'),
                    React.createElement('span', { key: 'text' }, 'Analytics')
                ])
            ]),
            React.createElement('div', {
                key: 'actions',
                style: {
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                }
            }, [
                React.createElement('button', {
                    key: 'create',
                    onClick: () => createContentItem(),
                    className: 'btn-prism btn-prism-secondary'
                }, [
                    React.createElement('span', { key: 'icon' }, '+'),
                    React.createElement('span', { key: 'text' }, 'Neuer Content')
                ]),
                React.createElement('button', {
                    key: 'templates',
                    onClick: () => setShowTemplateModal(true),
                    className: 'btn-prism btn-prism-primary'
                }, [
                    React.createElement('span', { key: 'icon' }, '📝'),
                    React.createElement('span', { key: 'text' }, 'Templates')
                ])
            ])
        ]),

        // Main Content
        React.createElement('div', {
            key: 'content',
            style: {
                width: '100%'
            }
        }, [
            activeView === 'calendar' && React.createElement('div', { 
                key: 'calendar-view', 
                style: { width: '100%' } 
            }, renderCalendarView()),
            activeView === 'timeline' && React.createElement('div', { 
                key: 'timeline-view',
                style: { width: '100%' }
            }, renderTimelineView()),
            activeView === 'kanban' && React.createElement('div', { 
                key: 'kanban-view',
                style: { width: '100%' }
            }, renderKanbanView()),
            activeView === 'analytics' && React.createElement('div', { 
                key: 'analytics-view',
                style: { width: '100%' }
            }, renderAnalyticsView())
        ].filter(Boolean)),

        // Modal
        React.createElement('div', { key: 'create-modal' }, renderCreateModal()),
        
        // Template Modal
        React.createElement('div', { key: 'template-modal' }, renderTemplateModal()),
        
        // Create Template Modal
        React.createElement('div', { key: 'create-template-modal' }, renderCreateTemplateModal())
    ]);
}

// Register component globally
window.ContentPlanner = ContentPlanner;
