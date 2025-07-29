// Advanced Media Library Interface for PRISM Creator Studio
// Integration with Month 4 advanced media features

function AdvancedMediaLibrary({ content, onContentUpdate }) {
    const [view, setView] = useState('grid'); // grid, list, folders
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        type: [],
        status: [],
        tags: [],
        dateRange: null,
        sizeRange: null,
        monetization: []
    });
    const [sortBy, setSortBy] = useState('createdAt_desc');
    const [currentFolder, setCurrentFolder] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [processingJobs, setProcessingJobs] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [mediaAnalytics, setMediaAnalytics] = useState(null);
    const [folderStructure, setFolderStructure] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    // Advanced upload with processing pipeline
    const handleAdvancedUpload = async (files, options = {}) => {
        const uploadPromises = Array.from(files).map(async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('metadata', JSON.stringify({
                    title: options.title || file.name,
                    description: options.description || '',
                    category: options.category || 'general',
                    folderId: currentFolder,
                    processingProfiles: options.processingProfiles || ['web-720p', 'web-1080p'],
                    priority: options.priority || 'normal',
                    monetizationType: options.monetizationType || 'free'
                }));

                const response = await fetch('/api/media/advanced-upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: formData
                });

                const result = await response.json();
                if (result.success) {
                    // Add processing job to monitoring
                    setProcessingJobs(prev => [...prev, {
                        id: result.processingJobId,
                        mediaId: result.mediaId,
                        filename: file.name,
                        status: 'processing',
                        progress: 0,
                        estimatedTime: result.estimatedProcessingTime
                    }]);
                    
                    return result;
                }
                throw new Error(result.error || 'Upload failed');
            } catch (error) {
                console.error('Upload error:', error);
                throw error;
            }
        });

        try {
            const results = await Promise.all(uploadPromises);
            onContentUpdate(); // Refresh content list
            return results;
        } catch (error) {
            alert('Some uploads failed. Please try again.');
            throw error;
        }
    };

    // Advanced search and filtering
    const handleAdvancedSearch = async () => {
        try {
            const queryParams = new URLSearchParams({
                search: searchQuery,
                sort: sortBy,
                view: view,
                ...(currentFolder && { folderId: currentFolder })
            });

            // Add filters
            Object.entries(filters).forEach(([key, value]) => {
                if (Array.isArray(value) && value.length > 0) {
                    queryParams.append(`filter_${key}`, value.join(','));
                } else if (value && typeof value === 'object') {
                    queryParams.append(`filter_${key}`, JSON.stringify(value));
                }
            });

            const response = await fetch(`/api/media/search?${queryParams.toString()}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            const result = await response.json();
            if (result.success) {
                // Update content state with search results
                onContentUpdate(result.data);
                return result;
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    // Bulk operations
    const handleBulkAction = async (action, options = {}) => {
        if (selectedMedia.length === 0) {
            alert('Please select media files first');
            return;
        }

        try {
            let endpoint = '';
            let payload = { mediaIds: selectedMedia };

            switch (action) {
                case 'delete':
                    endpoint = '/api/media/bulk-delete';
                    break;
                case 'move':
                    endpoint = '/api/media/bulk-move';
                    payload.folderId = options.folderId;
                    break;
                case 'update':
                    endpoint = '/api/media/bulk-update';
                    payload.updates = options.updates;
                    break;
                case 'process':
                    endpoint = '/api/media/bulk-process';
                    payload.profiles = options.profiles;
                    break;
                default:
                    throw new Error('Unknown bulk action');
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                setSelectedMedia([]);
                setShowBulkActions(false);
                onContentUpdate();
                alert(`Bulk ${action} completed: ${result.modifiedCount} items affected`);
            }
        } catch (error) {
            console.error('Bulk action error:', error);
            alert(`Bulk ${action} failed`);
        }
    };

    // Get detailed analytics for selected media
    const handleGetAnalytics = async (mediaId, timeRange = '30d') => {
        try {
            const response = await fetch(`/api/media/${mediaId}/analytics?range=${timeRange}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            const result = await response.json();
            if (result.success) {
                setMediaAnalytics(result.data);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        }
    };

    // CDN management
    const handleCDNAction = async (mediaId, action) => {
        try {
            const response = await fetch(`/api/media/${mediaId}/cdn/${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            const result = await response.json();
            if (result.success) {
                alert(`CDN ${action} completed successfully`);
                onContentUpdate();
            }
        } catch (error) {
            console.error('CDN action error:', error);
            alert(`CDN ${action} failed`);
        }
    };

    // Render functions
    const renderUploadInterface = () => (
        <div className="advanced-upload-interface">
            <h3>📤 Advanced Media Upload</h3>
            <div className="upload-dropzone">
                <input
                    type="file"
                    multiple
                    accept="video/*,audio/*,image/*"
                    onChange={(e) => handleAdvancedUpload(e.target.files)}
                    style={{ display: 'none' }}
                    id="advanced-upload"
                />
                <label htmlFor="advanced-upload" className="upload-dropzone-label">
                    <div className="upload-icon">📁</div>
                    <div className="upload-text">
                        <h4>Drop files here or click to browse</h4>
                        <p>Supports: MP4, AVI, MOV, MP3, WAV, JPG, PNG (Max 10GB per file)</p>
                    </div>
                </label>
            </div>

            {/* Processing Settings */}
            <div className="processing-settings">
                <h4>🔧 Processing Options</h4>
                <div className="form-group">
                    <label>Processing Profiles:</label>
                    <div className="checkbox-group">
                        <label><input type="checkbox" defaultChecked /> Web 720p</label>
                        <label><input type="checkbox" defaultChecked /> Web 1080p</label>
                        <label><input type="checkbox" /> Web 4K</label>
                        <label><input type="checkbox" /> HLS Adaptive</label>
                    </div>
                </div>
                <div className="form-group">
                    <label>Priority:</label>
                    <select>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderProcessingQueue = () => (
        <div className="processing-queue">
            <h3>⚙️ Processing Queue</h3>
            {processingJobs.length === 0 ? (
                <p>No active processing jobs</p>
            ) : (
                <div className="processing-jobs">
                    {processingJobs.map(job => (
                        <div key={job.id} className="processing-job">
                            <div className="job-info">
                                <strong>{job.filename}</strong>
                                <span className={`status ${job.status}`}>{job.status}</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${job.progress}%` }}
                                ></div>
                            </div>
                            <div className="job-details">
                                Progress: {job.progress}% | ETA: {Math.round(job.estimatedTime)}s
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderFilterSidebar = () => (
        <div className="filter-sidebar">
            <h3>🔍 Filters</h3>
            
            {/* Media Type Filter */}
            <div className="filter-group">
                <h4>Media Type</h4>
                <div className="checkbox-group">
                    <label><input type="checkbox" onChange={(e) => updateFilter('type', 'video', e.target.checked)} /> 🎬 Videos</label>
                    <label><input type="checkbox" onChange={(e) => updateFilter('type', 'audio', e.target.checked)} /> 🎵 Audio</label>
                    <label><input type="checkbox" onChange={(e) => updateFilter('type', 'image', e.target.checked)} /> 🖼️ Images</label>
                </div>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
                <h4>Status</h4>
                <div className="checkbox-group">
                    <label><input type="checkbox" onChange={(e) => updateFilter('status', 'published', e.target.checked)} /> ✅ Published</label>
                    <label><input type="checkbox" onChange={(e) => updateFilter('status', 'draft', e.target.checked)} /> 📝 Draft</label>
                    <label><input type="checkbox" onChange={(e) => updateFilter('status', 'processing', e.target.checked)} /> ⚙️ Processing</label>
                    <label><input type="checkbox" onChange={(e) => updateFilter('status', 'private', e.target.checked)} /> 🔒 Private</label>
                </div>
            </div>

            {/* Monetization Filter */}
            <div className="filter-group">
                <h4>Monetization</h4>
                <div className="checkbox-group">
                    <label><input type="checkbox" onChange={(e) => updateFilter('monetization', 'free', e.target.checked)} /> 🆓 Free</label>
                    <label><input type="checkbox" onChange={(e) => updateFilter('monetization', 'premium', e.target.checked)} /> 💎 Premium</label>
                    <label><input type="checkbox" onChange={(e) => updateFilter('monetization', 'subscription', e.target.checked)} /> 📅 Subscription</label>
                    <label><input type="checkbox" onChange={(e) => updateFilter('monetization', 'pay_per_view', e.target.checked)} /> 💰 Pay-per-view</label>
                </div>
            </div>

            <button className="btn-primary" onClick={handleAdvancedSearch}>
                Apply Filters
            </button>
        </div>
    );

    const renderMediaGrid = () => (
        <div className="media-grid">
            {content && content.map(item => (
                <div 
                    key={item._id} 
                    className={`media-card ${selectedMedia.includes(item._id) ? 'selected' : ''}`}
                    onClick={() => toggleMediaSelection(item._id)}
                >
                    <div className="media-thumbnail">
                        {item.mediaType === 'video' && <div className="media-icon">🎬</div>}
                        {item.mediaType === 'audio' && <div className="media-icon">🎵</div>}
                        {item.mediaType === 'image' && <div className="media-icon">🖼️</div>}
                        <div className="media-duration">{formatDuration(item.duration)}</div>
                    </div>
                    
                    <div className="media-info">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        <div className="media-meta">
                            <span className={`status ${item.status}`}>{item.status}</span>
                            <span className="views">{item.analytics?.views || 0} views</span>
                            <span className="size">{formatFileSize(item.fileSize)}</span>
                        </div>
                    </div>

                    <div className="media-actions">
                        <button onClick={(e) => { e.stopPropagation(); handleGetAnalytics(item._id); }}>
                            📊 Analytics
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleCDNAction(item._id, 'purge'); }}>
                            🗑️ Purge CDN
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderBulkActions = () => selectedMedia.length > 0 && (
        <div className="bulk-actions">
            <div className="bulk-info">
                {selectedMedia.length} items selected
            </div>
            <div className="bulk-buttons">
                <button onClick={() => handleBulkAction('delete')}>🗑️ Delete</button>
                <button onClick={() => setShowBulkActions(true)}>📁 Move</button>
                <button onClick={() => setShowBulkActions(true)}>✏️ Edit</button>
                <button onClick={() => handleBulkAction('process', { profiles: ['web-720p'] })}>
                    ⚙️ Reprocess
                </button>
            </div>
        </div>
    );

    // Helper functions
    const updateFilter = (category, value, checked) => {
        setFilters(prev => ({
            ...prev,
            [category]: checked 
                ? [...prev[category], value]
                : prev[category].filter(v => v !== value)
        }));
    };

    const toggleMediaSelection = (mediaId) => {
        setSelectedMedia(prev =>
            prev.includes(mediaId)
                ? prev.filter(id => id !== mediaId)
                : [...prev, mediaId]
        );
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes) => {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="advanced-media-library">
            <div className="library-header">
                <div className="header-controls">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search your media library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAdvancedSearch()}
                        />
                        <button onClick={handleAdvancedSearch}>🔍</button>
                    </div>
                    
                    <div className="view-controls">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="createdAt_desc">Latest First</option>
                            <option value="createdAt_asc">Oldest First</option>
                            <option value="name_asc">Name A-Z</option>
                            <option value="name_desc">Name Z-A</option>
                            <option value="views_desc">Most Viewed</option>
                            <option value="size_desc">Largest First</option>
                        </select>
                        
                        <button 
                            className={view === 'grid' ? 'active' : ''}
                            onClick={() => setView('grid')}
                        >
                            ⊞ Grid
                        </button>
                        <button 
                            className={view === 'list' ? 'active' : ''}
                            onClick={() => setView('list')}
                        >
                            ☰ List
                        </button>
                    </div>

                    <button className="btn-primary" onClick={() => setShowUpload(true)}>
                        📤 Upload Media
                    </button>
                </div>
            </div>

            <div className="library-body">
                <div className="library-sidebar">
                    {renderFilterSidebar()}
                    {renderProcessingQueue()}
                </div>

                <div className="library-content">
                    {renderBulkActions()}
                    {view === 'grid' ? renderMediaGrid() : renderMediaList()}
                </div>
            </div>

            {/* Modals */}
            {showUpload && (
                <div className="modal-overlay" onClick={() => setShowUpload(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {renderUploadInterface()}
                        <button onClick={() => setShowUpload(false)}>Close</button>
                    </div>
                </div>
            )}

            {mediaAnalytics && (
                <div className="modal-overlay" onClick={() => setMediaAnalytics(null)}>
                    <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>📊 Media Analytics</h3>
                        <div className="analytics-dashboard">
                            <div className="metric">
                                <h4>Views</h4>
                                <div className="metric-value">{mediaAnalytics.metrics.views}</div>
                            </div>
                            <div className="metric">
                                <h4>Watch Time</h4>
                                <div className="metric-value">{Math.round(mediaAnalytics.metrics.watchTime / 60)}m</div>
                            </div>
                            <div className="metric">
                                <h4>Completion Rate</h4>
                                <div className="metric-value">{Math.round(mediaAnalytics.metrics.completionRate * 100)}%</div>
                            </div>
                            <div className="metric">
                                <h4>Revenue</h4>
                                <div className="metric-value">${mediaAnalytics.metrics.revenue}</div>
                            </div>
                        </div>
                        <button onClick={() => setMediaAnalytics(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

module.exports = AdvancedMediaLibrary;
