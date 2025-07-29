// PRISM Creator Studio Constants
window.API_BASE = 'http://localhost:3004/api';

// Navigation Items basierend auf Creator Platform Implementierungsleitfaden
window.navItems = [
    // Core Modules
    { 
        id: 'dashboard', 
        icon: '📊', 
        label: 'Dashboard',
        description: 'Statistiken & Quick Actions'
    },
    { 
        id: 'streaming-studio', 
        icon: '🎥', 
        label: 'Livestreaming Studio',
        description: 'Multi-Cam, Szenen & Chat'
    },
    { 
        id: 'media-library', 
        icon: '📁', 
        label: 'Medienbibliothek',
        description: 'Upload & Content Management'
    },
    { 
        id: 'content-planner', 
        icon: '📅', 
        label: 'Content Planner',
        description: 'Planung & Scheduling'
    },
    { 
        id: 'creator-settings', 
        icon: '⚙️', 
        label: 'Creator Einstellungen',
        description: 'Profile & Studio Keys'
    },
    { 
        id: 'monetization', 
        icon: '💰', 
        label: 'Monetarisierung',
        description: 'Preise, Abos & Einnahmen'
    },
    { 
        id: 'fan-interaction', 
        icon: '💬', 
        label: 'Fan-Interaktion',
        description: 'Nachrichten & Fanclub'
    },
    { 
        id: 'analytics', 
        icon: '📈', 
        label: 'Analytik',
        description: 'Performance & Trends'
    },
    { 
        id: 'team-settings', 
        icon: '👥', 
        label: 'Team & Einstellungen',
        description: 'Rollen & Integrationen'
    },
    
    // Additional Features
    { 
        id: 'mobile-companion', 
        icon: '📱', 
        label: 'Mobile Companion',
        description: 'Mobile App Control'
    },
    { 
        id: 'integrations', 
        icon: '🔗', 
        label: 'Integrationen',
        description: 'OBS, Social & Payments'
    }
];

// Content Categories
window.contentCategories = [
    { id: 'general', label: 'General', icon: '📝' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'art', label: 'Art & Design', icon: '🎨' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '✨' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'fitness', label: 'Fitness', icon: '💪' }
];

// Content Status Options
window.contentStatusOptions = [
    { value: 'draft', label: 'Draft', color: 'var(--prism-gray-400)' },
    { value: 'published', label: 'Published', color: 'var(--prism-success)' },
    { value: 'scheduled', label: 'Scheduled', color: 'var(--prism-warning)' },
    { value: 'archived', label: 'Archived', color: 'var(--prism-gray-500)' }
];

// Monetization Tiers
window.monetizationTiers = [
    {
        id: 'free',
        name: 'Free Tier',
        price: 0,
        features: ['Basic content access', 'Standard video quality', 'Community posts'],
        color: 'var(--prism-gray-500)'
    },
    {
        id: 'supporter',
        name: 'Supporter',
        price: 4.99,
        features: ['HD quality', 'Early access', 'Exclusive posts', 'Member badge'],
        color: 'var(--prism-info)'
    },
    {
        id: 'vip',
        name: 'VIP',
        price: 9.99,
        features: ['4K quality', 'Behind-the-scenes', 'Private Discord', 'Monthly Q&A'],
        color: 'var(--prism-purple)'
    },
    {
        id: 'ultimate',
        name: 'Ultimate',
        price: 19.99,
        features: ['All VIP features', '1-on-1 calls', 'Custom content', 'Merch discounts'],
        color: 'var(--prism-pink)'
    }
];

// Analytics Metrics
window.analyticsMetrics = [
    { key: 'views', label: 'Views', icon: '👁️', color: 'var(--prism-info)' },
    { key: 'likes', label: 'Likes', icon: '❤️', color: 'var(--prism-error)' },
    { key: 'comments', label: 'Comments', icon: '💬', color: 'var(--prism-warning)' },
    { key: 'shares', label: 'Shares', icon: '🔄', color: 'var(--prism-success)' },
    { key: 'subscribers', label: 'Subscribers', icon: '👥', color: 'var(--prism-purple)' },
    { key: 'revenue', label: 'Revenue', icon: '💰', color: 'var(--prism-pink)' }
];

// Live Streaming Settings
window.streamingSettings = {
    quality: [
        { value: '1080p', label: '1080p (Full HD)', bitrate: 6000 },
        { value: '720p', label: '720p (HD)', bitrate: 4000 },
        { value: '480p', label: '480p (SD)', bitrate: 2500 }
    ],
    frameRate: [
        { value: 60, label: '60 FPS' },
        { value: 30, label: '30 FPS' },
        { value: 24, label: '24 FPS' }
    ],
    audio: [
        { value: 320, label: '320 kbps (High)' },
        { value: 256, label: '256 kbps (Medium)' },
        { value: 128, label: '128 kbps (Low)' }
    ]
};

// Team Roles
window.teamRoles = [
    {
        id: 'owner',
        name: 'Owner',
        permissions: ['all'],
        color: 'var(--prism-pink)',
        description: 'Full access to all features'
    },
    {
        id: 'admin',
        name: 'Admin',
        permissions: ['manage_content', 'manage_team', 'view_analytics', 'moderate'],
        color: 'var(--prism-purple)',
        description: 'Manage content and team'
    },
    {
        id: 'editor',
        name: 'Editor',
        permissions: ['manage_content', 'view_analytics'],
        color: 'var(--prism-info)',
        description: 'Create and edit content'
    },
    {
        id: 'moderator',
        name: 'Moderator',
        permissions: ['moderate', 'view_analytics'],
        color: 'var(--prism-warning)',
        description: 'Moderate chat and comments'
    },
    {
        id: 'viewer',
        name: 'Viewer',
        permissions: ['view_content'],
        color: 'var(--prism-gray-500)',
        description: 'View-only access'
    }
];

// Integration Platforms
window.integrationPlatforms = [
    {
        id: 'obs',
        name: 'OBS Studio',
        icon: '🎥',
        category: 'streaming',
        description: 'Professional streaming software integration'
    },
    {
        id: 'discord',
        name: 'Discord',
        icon: '💬',
        category: 'communication',
        description: 'Connect your Discord server'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        icon: '📺',
        category: 'social',
        description: 'Cross-post to YouTube'
    },
    {
        id: 'twitter',
        name: 'Twitter/X',
        icon: '🐦',
        category: 'social',
        description: 'Share updates on Twitter'
    },
    {
        id: 'instagram',
        name: 'Instagram',
        icon: '📸',
        category: 'social',
        description: 'Cross-post to Instagram'
    },
    {
        id: 'stripe',
        name: 'Stripe',
        icon: '💳',
        category: 'payment',
        description: 'Payment processing'
    },
    {
        id: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        category: 'payment',
        description: 'PayPal payments'
    }
];

// Default Analytics Data
window.defaultAnalyticsData = {
    overview: {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        subscribers: 0,
        revenue: 0
    },
    growth: {
        viewsGrowth: 0,
        subscribersGrowth: 0,
        revenueGrowth: 0
    },
    topContent: [],
    audienceInsights: {
        demographics: {
            age: {},
            gender: {},
            location: {}
        },
        engagement: {
            averageViewDuration: 0,
            clickThroughRate: 0,
            engagementRate: 0
        }
    }
};