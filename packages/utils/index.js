// Shared utility functions
// Common helpers used across the platform

const utils = {
  // Generate unique ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Sanitize string for URL slug
  slugify: (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format duration (seconds to HH:MM:SS)
  formatDuration: (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  // Pagination helper
  paginate: (page = 1, limit = 10) => {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;
    
    return {
      page: pageNum,
      limit: limitNum,
      skip
    };
  },

  // Response formatter
  response: {
    success: (data, message = 'Success') => ({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }),

    error: (message, details = null) => ({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    }),

    paginated: (data, pagination) => ({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit)
      },
      timestamp: new Date().toISOString()
    })
  },

  // Date helpers
  date: {
    now: () => new Date(),
    addDays: (date, days) => new Date(date.getTime() + (days * 24 * 60 * 60 * 1000)),
    addHours: (date, hours) => new Date(date.getTime() + (hours * 60 * 60 * 1000)),
    isExpired: (date) => new Date() > new Date(date),
    formatRelative: (date) => {
      const now = new Date();
      const diff = now - new Date(date);
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    }
  },

  // String helpers
  string: {
    truncate: (str, length = 100) => {
      if (!str || str.length <= length) return str;
      return str.substring(0, length) + '...';
    },
    
    capitalize: (str) => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    extractHashtags: (text) => {
      if (!text) return [];
      const hashtagRegex = /#(\w+)/g;
      const matches = text.match(hashtagRegex);
      return matches ? matches.map(tag => tag.substring(1)) : [];
    }
  },

  // Validation helpers
  validate: {
    required: (value, fieldName) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(`${fieldName} is required`);
      }
      return true;
    },
    
    minLength: (value, min, fieldName) => {
      if (!value || value.length < min) {
        throw new Error(`${fieldName} must be at least ${min} characters`);
      }
      return true;
    },
    
    maxLength: (value, max, fieldName) => {
      if (value && value.length > max) {
        throw new Error(`${fieldName} must be no more than ${max} characters`);
      }
      return true;
    }
  }
};

module.exports = utils;
