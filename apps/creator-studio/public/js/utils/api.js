// PRISM Creator Studio API Utilities
// API_BASE is loaded from constants.js

// Authentication utilities
window.auth = {
    // Get stored token
    getToken() {
        return localStorage.getItem('token');
    },
    
    // Set token
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    // Remove token
    removeToken() {
        localStorage.removeItem('token');
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    },
    
    // Get auth headers
    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }
};

// API request helper
window.api = {
    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${window.API_BASE}${endpoint}`;
        const config = {
            headers: window.auth.getHeaders(),
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    // GET request
    get(endpoint) {
        return this.request(endpoint);
    },
    
    // POST request
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT request
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE request
    delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    },
    
    // File upload with progress
    async uploadFiles(files, onProgress) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });
            
            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });
            
            xhr.open('POST', `${API_BASE}/media/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${auth.getToken()}`);
            xhr.send(formData);
        });
    }
};

// Content management utilities
window.contentApi = {
    // Get all content
    getContent() {
        return api.get('/content');
    },
    
    // Get content by ID
    getContentById(id) {
        return api.get(`/content/${id}`);
    },
    
    // Create new content
    createContent(contentData) {
        return api.post('/content', contentData);
    },
    
    // Update content
    updateContent(id, contentData) {
        return api.put(`/content/${id}`, contentData);
    },
    
    // Delete content
    deleteContent(id) {
        return api.delete(`/content/${id}`);
    },
    
    // Publish content
    publishContent(id) {
        return api.put(`/content/${id}/publish`, {});
    },
    
    // Archive content
    archiveContent(id) {
        return api.put(`/content/${id}/archive`, {});
    }
};

// User management utilities
window.userApi = {
    // Get current user profile
    getProfile() {
        return api.get('/auth/me');
    },
    
    // Update user profile
    updateProfile(profileData) {
        return api.put('/auth/profile', profileData);
    },
    
    // Login
    login(credentials) {
        return api.post('/auth/login', credentials);
    },
    
    // Register
    register(userData) {
        return api.post('/auth/register', userData);
    },
    
    // Logout
    logout() {
        auth.removeToken();
        return Promise.resolve();
    }
};

// Analytics utilities
window.analyticsApi = {
    // Get overview analytics
    getOverview(period = '7d') {
        return api.get(`/analytics/overview?period=${period}`);
    },
    
    // Get content analytics
    getContentAnalytics(contentId, period = '7d') {
        return api.get(`/analytics/content/${contentId}?period=${period}`);
    },
    
    // Get audience insights
    getAudienceInsights(period = '30d') {
        return api.get(`/analytics/audience?period=${period}`);
    },
    
    // Get revenue analytics
    getRevenueAnalytics(period = '30d') {
        return api.get(`/analytics/revenue?period=${period}`);
    }
};

// Utility functions
window.utils = {
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Format duration
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Format number
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },
    
    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Format date
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
    },
    
    // Format relative time
    formatRelativeTime(date) {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return this.formatDate(date);
    },
    
    // Generate thumbnail URL
    generateThumbnailUrl(videoId, size = 'medium') {
        const sizes = {
            small: '320x180',
            medium: '640x360',
            large: '1280x720'
        };
        return `/api/media/thumbnails/${videoId}?size=${sizes[size] || sizes.medium}`;
    },
    
    // Validate file type
    isValidFileType(file, allowedTypes) {
        return allowedTypes.includes(file.type);
    },
    
    // Validate file size
    isValidFileSize(file, maxSizeBytes) {
        return file.size <= maxSizeBytes;
    },
    
    // Create debounced function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Create throttled function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    },
    
    // Download file
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
