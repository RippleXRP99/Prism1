// Media Library Component - Enhanced with Stream Management
function MediaLibrary({ content, onContentUpdate }) {
    const [filter, setFilter] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [viewMode, setViewMode] = React.useState('grid');
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [isUploading, setIsUploading] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('all');
    const [selectedVideo, setSelectedVideo] = React.useState(null);
    const [showVideoPlayer, setShowVideoPlayer] = React.useState(false);
    
    // Enhanced content with stream recordings - persistent storage
    const [mediaContent, setMediaContent] = React.useState(() => {
        const saved = localStorage.getItem('prism-media-content');
        return saved ? JSON.parse(saved) : [];
    });
    
    // Save to localStorage whenever content changes
    React.useEffect(() => {
        try {
            localStorage.setItem('prism-media-content', JSON.stringify(mediaContent));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            // If quota exceeded, try aggressive cleanup first
            if (error.name === 'QuotaExceededError') {
                console.log('Attempting aggressive storage cleanup...');
                
                // Clear all stored videos first
                const keys = Object.keys(localStorage);
                const videoKeys = keys.filter(key => key.startsWith('prism-video-'));
                videoKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Update mediaContent to use blob URLs for all videos
                const updatedContent = mediaContent.map(item => {
                    if (item.storageMethod === 'base64') {
                        return {
                            ...item,
                            storageMethod: 'blob',
                            storageKey: null,
                            videoUrl: item.videoUrl || '/api/placeholder/video/sample.mp4'
                        };
                    }
                    return item;
                });
                
                // Try to save the cleaned content
                try {
                    localStorage.setItem('prism-media-content', JSON.stringify(updatedContent));
                    // Update state to reflect the cleanup
                    setMediaContent(updatedContent);
                    console.log('Storage cleanup successful');
                } catch (retryError) {
                    console.error('Even cleaned content exceeds quota. Using session storage only.');
                    // Don't update localStorage, keep working with session data only
                }
            }
        }
    }, [mediaContent]);
    
    // Restore video URLs from localStorage on component mount
    React.useEffect(() => {
        setMediaContent(prev => 
            prev.map(item => {
                if (item.storageMethod === 'base64' && item.storageKey) {
                    const storedVideo = localStorage.getItem(item.storageKey);
                    if (storedVideo) {
                        return { ...item, videoUrl: storedVideo };
                    }
                }
                return item;
            })
        );
    }, []);
    
    // Clean up localStorage if needed
    const cleanupStorage = () => {
        const keys = Object.keys(localStorage);
        const videoKeys = keys.filter(key => key.startsWith('prism-video-'));
        
        // Remove orphaned video files
        videoKeys.forEach(key => {
            const isReferenced = mediaContent.some(item => item.storageKey === key);
            if (!isReferenced) {
                localStorage.removeItem(key);
                console.log('Cleaned up orphaned video:', key);
            }
        });
    };
    
    // Run cleanup on mount and reload recordings periodically
    React.useEffect(() => {
        cleanupStorage();
        loadStreamRecordings();
        
        // Reload stream recordings every 10 seconds to catch new uploads
        const interval = setInterval(loadStreamRecordings, 10000);
        
        // Listen for manual reload events
        const handleReload = () => loadStreamRecordings();
        window.addEventListener('reloadMediaLibrary', handleReload);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('reloadMediaLibrary', handleReload);
        };
    }, []);
    
    // Load stream recordings from Recording Server
    const loadStreamRecordings = async () => {
        try {
            const response = await fetch('http://localhost:8081/api/recordings');
            if (response.ok) {
                const data = await response.json();
                
                // Convert Recording Server data to our format and add to existing content
                const streamRecordings = data
                    .filter(item => item.status === 'completed' && item.filePath)
                    .map(item => ({
                        id: item.id,
                        title: item.title || `Recording ${item.id}`,
                        type: 'stream_recording',
                        format: 'MP4',
                        size: formatFileSize(item.fileSize || 0),
                        duration: formatDuration(item.duration || 0),
                        status: 'published',
                        uploadDate: new Date(item.startTime || item.timestamp).toLocaleDateString('de-DE'),
                        videoUrl: `http://localhost:8081/uploads/media/${item.id}.${item.format || 'mp4'}`,
                        thumbnail: item.thumbnailUrl || '/api/placeholder/video/thumbnail.jpg',
                        metadata: {
                            sessionId: item.id,
                            quality: item.quality,
                            format: item.format,
                            startTime: item.startTime,
                            endTime: item.endTime,
                            hasThumbnail: !!item.thumbnailUrl
                        },
                        storageMethod: 'recording-server',
                        apiId: item.id,
                        views: 0,
                        likes: 0,
                        fileSize: formatFileSize(item.fileSize || 0)
                    }));
                
                // Merge with existing content, avoiding duplicates
                setMediaContent(prev => {
                    const existing = prev.filter(item => item.storageMethod !== 'recording-server');
                    return [...existing, ...streamRecordings];
                });
                
                console.log('✅ Loaded', streamRecordings.length, 'recordings from Recording Server');
                
            } else {
                console.warn('⚠️ Failed to load stream recordings from Recording Server');
            }
        } catch (error) {
            console.error('❌ Error loading stream recordings:', error);
            console.log('📝 Note: Make sure Recording Server is running on port 8080');
        }
    };
    
    // Helper functions for formatting
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    const contentTypes = [
        { id: 'all', label: 'Alle Medien', icon: '📁', count: mediaContent.length },
        { id: 'stream_recording', label: 'Stream-Aufzeichnungen', icon: '🎥', count: mediaContent.filter(c => c.type === 'stream_recording').length },
        { id: 'video_upload', label: 'Video-Uploads', icon: '📹', count: mediaContent.filter(c => c.type === 'video_upload').length }
    ];
    
    const statusTypes = [
        { id: 'published', label: 'Veröffentlicht', color: '#10B981', icon: '✅' },
        { id: 'draft', label: 'Entwurf', color: '#F59E0B', icon: '📝' },
        { id: 'processing', label: 'Verarbeitung', color: '#3B82F6', icon: '⚙️' }
    ];
    
    const filteredContent = mediaContent.filter(item => {
        const matchesTab = activeTab === 'all' || item.type === activeTab;
        const matchesFilter = filter === 'all' || item.status === filter;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesFilter && matchesSearch;
    });
    
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        setIsUploading(true);
        
        // Process each file
        for (const file of files) {
            try {
                // Create video element to get duration
                const video = document.createElement('video');
                video.preload = 'metadata';
                
                const getDuration = () => {
                    return new Promise((resolve) => {
                        video.onloadedmetadata = () => {
                            const duration = video.duration;
                            const minutes = Math.floor(duration / 60);
                            const seconds = Math.floor(duration % 60);
                            resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                        };
                        video.onerror = () => resolve('0:00');
                    });
                };
                
                video.src = URL.createObjectURL(file);
                const duration = await getDuration();
                
                // Create a persistent storage key for the file
                const fileKey = `prism-video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                // Convert file to base64 for storage (for smaller files) or keep blob URL
                let videoUrl;
                let storageMethod;
                
                if (file.size < 10 * 1024 * 1024) { // Reduced to 10MB limit for base64 storage
                    try {
                        // Convert to base64 for small files
                        const base64 = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        });
                        
                        // Try to store, catch quota errors
                        try {
                            localStorage.setItem(fileKey, base64);
                            videoUrl = base64;
                            storageMethod = 'base64';
                        } catch (quotaError) {
                            console.warn('localStorage quota exceeded, using blob URL instead');
                            videoUrl = URL.createObjectURL(file);
                            storageMethod = 'blob';
                        }
                    } catch (error) {
                        console.warn('Error converting to base64, using blob URL');
                        videoUrl = URL.createObjectURL(file);
                        storageMethod = 'blob';
                    }
                } else {
                    // Use blob URL for larger files (temporary)
                    videoUrl = URL.createObjectURL(file);
                    storageMethod = 'blob';
                }
                
                const newContent = {
                    id: Date.now() + Math.random(),
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    type: 'video_upload',
                    status: 'processing',
                    views: 0,
                    duration: duration,
                    fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                    thumbnail: '/api/placeholder/320/180',
                    uploadedAt: new Date().toISOString(),
                    category: 'general',
                    auto_recorded: false,
                    videoUrl: videoUrl,
                    storageKey: fileKey,
                    storageMethod: storageMethod,
                    originalFileName: file.name
                };
                
                setMediaContent(prev => [...prev, newContent]);
                
                // Clean up video element
                URL.revokeObjectURL(video.src);
                
            } catch (error) {
                console.error('Error processing file:', error);
            }
        }
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                setUploadProgress(0);
                // Update status to draft after processing
                setMediaContent(prev => 
                    prev.map(item => 
                        item.status === 'processing' && !item.auto_recorded 
                            ? { ...item, status: 'draft' }
                            : item
                    )
                );
            }
        }, 300);
    };
    
    const handleStatusChange = (contentId, newStatus) => {
        setMediaContent(prev => 
            prev.map(item => 
                item.id === contentId 
                    ? { ...item, status: newStatus }
                    : item
            )
        );
    };
    
    const handleDelete = (contentId) => {
        if (confirm('Möchten Sie diesen Inhalt wirklich löschen?')) {
            setMediaContent(prev => {
                const itemToDelete = prev.find(item => item.id === contentId);
                // Clean up stored video data
                if (itemToDelete && itemToDelete.storageKey) {
                    localStorage.removeItem(itemToDelete.storageKey);
                }
                return prev.filter(item => item.id !== contentId);
            });
        }
    };
    
    const addSampleStreamRecording = (title, category = 'gaming') => {
        const newStream = {
            id: Date.now() + Math.random(),
            title: title,
            type: 'stream_recording',
            status: 'published',
            views: Math.floor(Math.random() * 10000),
            duration: `${Math.floor(Math.random() * 3) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            fileSize: `${(Math.random() * 2 + 0.5).toFixed(1)} GB`,
            thumbnail: '/api/placeholder/320/180',
            recordedAt: new Date().toISOString(),
            streamId: `stream_${Date.now()}`,
            category: category,
            auto_recorded: true,
            videoUrl: '/api/placeholder/video/sample_stream.mp4'
        };
        setMediaContent(prev => [newStream, ...prev]);
    };
    
    const openVideoPlayer = (video) => {
        setSelectedVideo(video);
        setShowVideoPlayer(true);
    };
    
    const closeVideoPlayer = () => {
        setSelectedVideo(null);
        setShowVideoPlayer(false);
    };
    
    const getTypeIcon = (type) => {
        switch(type) {
            case 'stream_recording': return '🎥';
            case 'video_upload': return '📹';
            default: return '📁';
        }
    };
    
    const getStatusBadge = (status) => {
        const statusInfo = statusTypes.find(s => s.id === status);
        return React.createElement('span', {
            key: `status-badge-${status}`,
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500',
                background: statusInfo ? statusInfo.color + '20' : '#6B728020',
                color: statusInfo ? statusInfo.color : '#6B7280'
            }
        }, `${statusInfo ? statusInfo.icon : '❓'} ${statusInfo ? statusInfo.label : status}`);
    };
    
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
            }, '📁 Medienbibliothek'),
            React.createElement('p', {
                key: 'subtitle'
            }, 'Streams, Videos & Content-Management')
        ]),
        
        // Content Type Tabs
        React.createElement('div', {
            key: 'content-tabs',
            style: {
                display: 'flex',
                gap: 'var(--prism-space-md)',
                marginBottom: 'var(--prism-space-lg)',
                borderBottom: '1px solid var(--prism-gray-800)',
                paddingBottom: 'var(--prism-space-md)',
                overflowX: 'auto'
            }
        }, contentTypes.map(type => 
            React.createElement('button', {
                key: type.id,
                onClick: () => setActiveTab(type.id),
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--prism-space-sm)',
                    padding: 'var(--prism-space-sm) var(--prism-space-md)',
                    background: activeTab === type.id ? 'var(--prism-purple)' : 'transparent',
                    color: activeTab === type.id ? 'white' : 'var(--prism-gray-400)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 'var(--prism-text-sm)',
                    fontWeight: activeTab === type.id ? '600' : '400',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                }
            }, [
                React.createElement('span', { key: 'icon' }, type.icon),
                React.createElement('span', { key: 'label' }, type.label),
                React.createElement('span', {
                    key: 'count',
                    style: {
                        padding: '2px 6px',
                        background: activeTab === type.id ? 'rgba(255,255,255,0.2)' : 'var(--prism-gray-800)',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                    }
                }, type.count)
            ])
        )),
        
        // Upload Section
        React.createElement('div', {
            key: 'upload-section',
            className: 'card-prism',
            style: { marginBottom: 'var(--prism-space-xl)' }
        }, [
            React.createElement('h3', {
                key: 'upload-title',
                style: {
                    fontSize: 'var(--prism-text-lg)',
                    fontWeight: '600',
                    color: 'var(--prism-gray-100)',
                    marginBottom: 'var(--prism-space-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--prism-space-sm)'
                }
            }, [
                React.createElement('span', { key: 'icon' }, '📤'),
                React.createElement('span', { key: 'text' }, 'Content Upload & Stream-Info')
            ]),
            React.createElement('div', {
                key: 'upload-content',
                style: {
                    display: 'flex',
                    gap: 'var(--prism-space-lg)',
                    flexWrap: 'wrap'
                }
            }, [
                React.createElement('div', {
                    key: 'upload-controls',
                    style: { flex: '1', minWidth: '250px' }
                }, [
                    React.createElement('label', {
                        key: 'video-upload',
                        className: 'btn-prism btn-prism-primary',
                        style: { cursor: 'pointer', marginRight: 'var(--prism-space-md)' }
                    }, [
                        React.createElement('input', {
                            key: 'video-input',
                            type: 'file',
                            accept: 'video/*',
                            multiple: true,
                            onChange: handleFileUpload,
                            style: { display: 'none' }
                        }),
                        React.createElement('span', { key: 'icon' }, '🎬'),
                        React.createElement('span', { key: 'text' }, 'Video Upload')
                    ])
                ]),
                React.createElement('div', {
                    key: 'stream-info',
                    style: { 
                        flex: '1',
                        minWidth: '250px',
                        padding: 'var(--prism-space-md)',
                        background: 'var(--prism-gray-800)',
                        borderRadius: '8px'
                    }
                }, [
                    React.createElement('h4', {
                        key: 'stream-title',
                        style: {
                            color: 'var(--prism-gray-100)',
                            marginBottom: 'var(--prism-space-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--prism-space-sm)'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '🎥'),
                        React.createElement('span', { key: 'text' }, 'Auto-Recording')
                    ]),
                    React.createElement('p', {
                        key: 'stream-desc',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: 'var(--prism-text-sm)',
                            lineHeight: '1.5'
                        }
                    }, 'Streams werden automatisch aufgezeichnet und erscheinen hier nach dem Stream-Ende.')
                ]),
                React.createElement('div', {
                    key: 'storage-info',
                    style: { 
                        flex: '1',
                        minWidth: '250px',
                        padding: 'var(--prism-space-md)',
                        background: 'var(--prism-gray-800)',
                        borderRadius: '8px',
                        marginTop: 'var(--prism-space-md)'
                    }
                }, [
                    React.createElement('h4', {
                        key: 'storage-title',
                        style: {
                            color: 'var(--prism-gray-100)',
                            marginBottom: 'var(--prism-space-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--prism-space-sm)'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, '💾'),
                        React.createElement('span', { key: 'text' }, 'Speicher-Info')
                    ]),
                    React.createElement('p', {
                        key: 'storage-desc',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: 'var(--prism-text-sm)',
                            lineHeight: '1.5'
                        }
                    }, `Videos < 10MB werden dauerhaft gespeichert. Größere Videos nur für diese Session.`),
                    React.createElement('button', {
                        key: 'cleanup-btn',
                        onClick: cleanupStorage,
                        style: {
                            marginTop: 'var(--prism-space-sm)',
                            padding: '4px 8px',
                            background: 'var(--prism-gray-600)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                        }
                    }, '🧹 Speicher bereinigen')
                ])
            ])
        ]),
        
        // Upload Progress
        isUploading && React.createElement('div', {
            key: 'uploadProgress',
            className: 'card-prism',
            style: { marginBottom: 'var(--prism-space-xl)' }
        }, [
            React.createElement('div', {
                key: 'progress-info',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--prism-space-md)',
                    marginBottom: 'var(--prism-space-sm)'
                }
            }, [
                React.createElement('span', { key: 'icon' }, '📤'),
                React.createElement('span', { key: 'text' }, 'Upload läuft...'),
                React.createElement('span', {
                    key: 'percentage',
                    style: { color: 'var(--prism-purple)' }
                }, `${uploadProgress}%`)
            ]),
            React.createElement('div', {
                key: 'progressBar',
                style: {
                    background: 'var(--prism-gray-700)',
                    borderRadius: '10px',
                    height: '8px',
                    overflow: 'hidden'
                }
            }, React.createElement('div', {
                style: {
                    background: 'linear-gradient(90deg, var(--prism-purple), var(--prism-pink))',
                    height: '100%',
                    width: `${uploadProgress}%`,
                    transition: 'width 0.3s ease'
                }
            }))
        ]),
        
        // Filters
        React.createElement('div', {
            key: 'filters',
            className: 'card-prism',
            style: { marginBottom: 'var(--prism-space-xl)' }
        }, [
            React.createElement('div', {
                key: 'filter-controls',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--prism-space-md)'
                }
            }, [
                React.createElement('div', {
                    key: 'status-filters',
                    style: { 
                        display: 'flex', 
                        gap: 'var(--prism-space-sm)',
                        flexWrap: 'wrap'
                    }
                }, statusTypes.map(status =>
                    React.createElement('button', {
                        key: status.id,
                        onClick: () => setFilter(filter === status.id ? 'all' : status.id),
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            background: filter === status.id ? status.color : 'transparent',
                            color: filter === status.id ? 'white' : status.color,
                            border: `1px solid ${status.color}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: 'var(--prism-text-sm)',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, status.icon),
                        React.createElement('span', { key: 'label' }, status.label)
                    ])
                )),
                React.createElement('input', {
                    key: 'search',
                    type: 'text',
                    placeholder: 'Content durchsuchen...',
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                    style: {
                        padding: '8px 12px',
                        background: 'var(--prism-gray-800)',
                        border: '1px solid var(--prism-gray-700)',
                        borderRadius: '8px',
                        color: 'var(--prism-gray-100)',
                        fontSize: 'var(--prism-text-sm)',
                        minWidth: '200px'
                    }
                })
            ])
        ]),
        
        // Content Grid
        React.createElement('div', {
            key: 'content-grid',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--prism-space-lg)'
            }
        }, filteredContent.map(item =>
            React.createElement('div', {
                key: item.id,
                className: 'card-prism',
                style: {
                    background: 'var(--prism-gray-800)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer'
                }
            }, [
                React.createElement('div', {
                    key: 'thumbnail',
                    style: {
                        position: 'relative',
                        aspectRatio: '16/9',
                        background: 'var(--prism-gray-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden'
                    },
                    onClick: () => openVideoPlayer(item)
                }, [
                    // Show actual thumbnail image if available, otherwise show icon
                    item.thumbnail && item.thumbnail !== '/api/placeholder/video/thumbnail.jpg' 
                        ? React.createElement('img', {
                            key: 'thumbnail-img',
                            src: item.thumbnail,
                            alt: `Thumbnail for ${item.title}`,
                            style: {
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'absolute',
                                top: 0,
                                left: 0
                            },
                            onError: (e) => {
                                // Hide image on error, show fallback icon
                                e.target.style.display = 'none';
                            }
                        })
                        : null,
                    React.createElement('span', {
                        key: 'type-icon',
                        style: {
                            fontSize: '2rem',
                            opacity: item.thumbnail && item.thumbnail !== '/api/placeholder/video/thumbnail.jpg' ? 0 : 0.5,
                            position: 'relative',
                            zIndex: 1
                        }
                    }, getTypeIcon(item.type)),
                    // Play button overlay
                    React.createElement('div', {
                        key: 'play-overlay',
                        style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(0, 0, 0, 0.7)',
                            borderRadius: '50%',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            color: 'white',
                            zIndex: 2,
                            opacity: 0.8,
                            transition: 'opacity 0.2s ease'
                        }
                    }, '▶️'),
                    React.createElement('div', {
                        key: 'overlay',
                        style: {
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            display: 'flex',
                            gap: '8px',
                            zIndex: 3
                        }
                    }, [
                        getStatusBadge(item.status),
                        item.auto_recorded && React.createElement('span', {
                            key: `auto-badge-${item.id}`,
                            style: {
                                padding: '2px 6px',
                                background: '#EF4444',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                            }
                        }, '🔴 Auto')
                    ].filter(Boolean)),
                    React.createElement('div', {
                        key: 'duration',
                        style: {
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            padding: '2px 6px',
                            background: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                        }
                    }, item.duration),
                    React.createElement('div', {
                        key: 'play-button',
                        style: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '60px',
                            height: '60px',
                            background: 'rgba(0,0,0,0.7)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }
                    }, '▶️')
                ]),
                React.createElement('div', {
                    key: 'content-info',
                    style: { padding: 'var(--prism-space-md)' }
                }, [
                    React.createElement('h4', {
                        key: 'title',
                        style: {
                            color: 'var(--prism-gray-100)',
                            fontSize: 'var(--prism-text-base)',
                            fontWeight: '600',
                            marginBottom: 'var(--prism-space-sm)',
                            lineHeight: '1.4'
                        }
                    }, item.title),
                    React.createElement('div', {
                        key: 'meta',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 'var(--prism-text-sm)',
                            color: 'var(--prism-gray-400)',
                            marginBottom: 'var(--prism-space-sm)'
                        }
                    }, [
                        React.createElement('span', { key: 'views' }, `${(item.views || 0).toLocaleString()} Aufrufe`),
                        React.createElement('span', { key: 'size' }, item.fileSize || item.size || 'N/A')
                    ]),
                    React.createElement('div', {
                        key: 'actions',
                        style: {
                            display: 'flex',
                            gap: 'var(--prism-space-sm)',
                            flexWrap: 'wrap'
                        }
                    }, [
                        item.status === 'draft' && React.createElement('button', {
                            key: 'publish',
                            onClick: () => handleStatusChange(item.id, 'published'),
                            style: {
                                padding: '4px 8px',
                                background: 'var(--prism-purple)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }
                        }, '📤 Veröffentlichen'),
                        item.status === 'published' && React.createElement('button', {
                            key: 'unpublish',
                            onClick: () => handleStatusChange(item.id, 'draft'),
                            style: {
                                padding: '4px 8px',
                                background: 'var(--prism-gray-600)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }
                        }, '📝 Als Entwurf'),
                        React.createElement('button', {
                            key: 'edit',
                            style: {
                                padding: '4px 8px',
                                background: 'transparent',
                                color: 'var(--prism-gray-400)',
                                border: '1px solid var(--prism-gray-600)',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }
                        }, '✏️ Bearbeiten'),
                        React.createElement('button', {
                            key: 'delete',
                            onClick: (e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                            },
                            style: {
                                padding: '4px 8px',
                                background: 'transparent',
                                color: '#EF4444',
                                border: '1px solid #EF4444',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }
                        }, '🗑️ Löschen')
                    ])
                ])
            ])
        )),
        
        // Empty State
        filteredContent.length === 0 && React.createElement('div', {
            key: 'empty-state',
            className: 'card-prism',
            style: {
                textAlign: 'center',
                padding: 'var(--prism-space-3xl)',
                color: 'var(--prism-gray-400)'
            }
        }, [
            React.createElement('div', {
                key: 'empty-icon',
                style: { fontSize: '3rem', marginBottom: 'var(--prism-space-lg)' }
            }, '📁'),
            React.createElement('h3', {
                key: 'empty-title',
                style: {
                    fontSize: 'var(--prism-text-xl)',
                    fontWeight: '600',
                    marginBottom: 'var(--prism-space-md)',
                    color: 'var(--prism-gray-300)'
                }
            }, 'Keine Inhalte gefunden'),
            React.createElement('p', {
                key: 'empty-desc',
                style: { marginBottom: 'var(--prism-space-md)' }
            }, 'Lade Videos hoch oder starte einen Stream, um Inhalte zu erstellen.'),
            React.createElement('button', {
                key: 'add-sample',
                onClick: () => addSampleStreamRecording('Test Stream Recording'),
                style: {
                    padding: '8px 16px',
                    background: 'var(--prism-purple)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: 'var(--prism-text-sm)',
                    cursor: 'pointer'
                }
            }, '🎥 Test Stream hinzufügen')
        ]),
        
        // Video Player Modal
        showVideoPlayer && selectedVideo && React.createElement('div', {
            key: 'video-modal',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            },
            onClick: closeVideoPlayer
        }, [
            React.createElement('div', {
                key: 'modal-content',
                style: {
                    position: 'relative',
                    width: '90%',
                    maxWidth: '1200px',
                    maxHeight: '90%',
                    background: 'var(--prism-gray-900)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                },
                onClick: (e) => e.stopPropagation()
            }, [
                React.createElement('div', {
                    key: 'modal-header',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--prism-space-md)',
                        borderBottom: '1px solid var(--prism-gray-700)'
                    }
                }, [
                    React.createElement('h3', {
                        key: 'modal-title',
                        style: {
                            color: 'var(--prism-gray-100)',
                            margin: 0,
                            fontSize: 'var(--prism-text-lg)',
                            fontWeight: '600'
                        }
                    }, selectedVideo.title),
                    React.createElement('button', {
                        key: 'close-button',
                        onClick: closeVideoPlayer,
                        style: {
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--prism-gray-400)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'color 0.2s ease'
                        }
                    }, '×')
                ]),
                React.createElement('div', {
                    key: 'video-container',
                    style: {
                        position: 'relative',
                        aspectRatio: '16/9',
                        background: '#000'
                    }
                }, [
                    React.createElement('video', {
                        key: 'video-player',
                        controls: true,
                        autoPlay: true,
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        },
                        src: selectedVideo.videoUrl
                    })
                ]),
                React.createElement('div', {
                    key: 'video-info',
                    style: {
                        padding: 'var(--prism-space-md)',
                        borderTop: '1px solid var(--prism-gray-700)'
                    }
                }, [
                    React.createElement('div', {
                        key: 'video-meta',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--prism-space-sm)'
                        }
                    }, [
                        React.createElement('div', {
                            key: 'meta-left',
                            style: {
                                display: 'flex',
                                gap: 'var(--prism-space-md)',
                                alignItems: 'center'
                            }
                        }, [
                            React.createElement('span', {
                                key: 'type-badge',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    background: 'var(--prism-gray-800)',
                                    borderRadius: '8px',
                                    fontSize: 'var(--prism-text-sm)',
                                    color: 'var(--prism-gray-300)'
                                }
                            }, [
                                React.createElement('span', { key: 'icon' }, getTypeIcon(selectedVideo.type)),
                                React.createElement('span', { key: 'label' }, selectedVideo.type === 'stream_recording' ? 'Stream-Aufzeichnung' : 'Video-Upload')
                            ]),
                            React.createElement('span', {
                                key: 'duration',
                                style: {
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-sm)'
                                }
                            }, selectedVideo.duration),
                            React.createElement('span', {
                                key: 'file-size',
                                style: {
                                    color: 'var(--prism-gray-400)',
                                    fontSize: 'var(--prism-text-sm)'
                                }
                            }, selectedVideo.fileSize)
                        ]),
                        React.createElement('div', {
                            key: 'status-badge'
                        }, getStatusBadge(selectedVideo.status))
                    ]),
                    React.createElement('div', {
                        key: 'view-count',
                        style: {
                            color: 'var(--prism-gray-400)',
                            fontSize: 'var(--prism-text-sm)'
                        }
                    }, `${selectedVideo.views.toLocaleString()} Aufrufe`)
                ])
            ])
        ])
    ]);
}
