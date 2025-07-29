const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// API routes for Creator Studio
app.get('/api/creator/profile', (req, res) => {
    res.json({
        name: 'Alex Creator',
        username: '@alexcreates',
        avatar: '/api/placeholder/64/64',
        followers: 15234,
        following: 892,
        totalEarnings: 12847.50,
        isVerified: true,
        tier: 'Pro Creator'
    });
});

app.get('/api/creator/analytics', (req, res) => {
    res.json({
        views: { current: 145234, change: 12.5 },
        revenue: { current: 2847.50, change: 8.2 },
        subscribers: { current: 1247, change: 15.3 },
        engagement: { current: 89, change: -2.1 }
    });
});

app.get('/api/creator/content', (req, res) => {
    res.json([
        {
            id: 1,
            title: 'Advanced Photography Tutorial',
            type: 'video',
            status: 'published',
            views: 12543,
            duration: '15:30',
            thumbnail: '/api/placeholder/320/180',
            publishedAt: '2024-01-15',
            earnings: 125.50
        },
        {
            id: 2,
            title: 'Behind the Scenes: Studio Setup',
            type: 'photo_set',
            status: 'draft',
            views: 0,
            images: 24,
            thumbnail: '/api/placeholder/320/180',
            createdAt: '2024-01-20',
            earnings: 0
        },
        {
            id: 3,
            title: 'Live Q&A Session',
            type: 'livestream',
            status: 'scheduled',
            scheduledFor: '2024-01-25T19:00:00Z',
            thumbnail: '/api/placeholder/320/180',
            expectedViewers: 500
        }
    ]);
});

app.get('/api/creator/earnings', (req, res) => {
    res.json({
        thisMonth: 2847.50,
        lastMonth: 2156.30,
        subscriptions: 1890.45,
        tips: 657.20,
        ppv: 299.85,
        breakdown: [
            { date: '2024-01-01', amount: 95.30, type: 'subscription' },
            { date: '2024-01-02', amount: 25.00, type: 'tip' },
            { date: '2024-01-03', amount: 150.00, type: 'ppv' },
            { date: '2024-01-04', amount: 75.50, type: 'subscription' }
        ]
    });
});

app.get('/api/creator/streaming/status', (req, res) => {
    res.json({
        isLive: false,
        streamKey: 'cr_abc123_live',
        viewers: 0,
        platforms: {
            prism: { connected: true, status: 'ready' },
            twitch: { connected: true, status: 'ready' },
            youtube: { connected: false, status: 'disconnected' },
            facebook: { connected: true, status: 'ready' },
            tiktok: { connected: false, status: 'disconnected' }
        }
    });
});

app.post('/api/creator/streaming/start', (req, res) => {
    const { platforms, title, description } = req.body;
    res.json({
        success: true,
        streamId: 'stream_' + Date.now(),
        message: 'Stream started successfully',
        platforms: platforms
    });
});

app.post('/api/creator/streaming/stop', (req, res) => {
    res.json({
        success: true,
        message: 'Stream stopped successfully',
        duration: '01:23:45',
        peakViewers: 342
    });
});

app.get('/api/creator/collaboration/teams', (req, res) => {
    res.json([
        {
            id: 1,
            name: 'Main Content Team',
            members: [
                { name: 'Sarah Editor', role: 'Video Editor', avatar: '/api/placeholder/32/32' },
                { name: 'Mike Designer', role: 'Graphic Designer', avatar: '/api/placeholder/32/32' },
                { name: 'Lisa Manager', role: 'Content Manager', avatar: '/api/placeholder/32/32' }
            ],
            activeProjects: 3
        },
        {
            id: 2,
            name: 'Photography Team',
            members: [
                { name: 'John Photographer', role: 'Photographer', avatar: '/api/placeholder/32/32' },
                { name: 'Emma Retoucher', role: 'Photo Editor', avatar: '/api/placeholder/32/32' }
            ],
            activeProjects: 1
        }
    ]);
});

app.get('/api/creator/mobile/devices', (req, res) => {
    res.json([
        { 
            id: 1, 
            name: 'iPhone 14 Pro', 
            type: 'iOS', 
            lastSeen: '2 minutes ago', 
            status: 'online',
            features: ['streaming', 'notifications', 'chat_moderation']
        },
        { 
            id: 2, 
            name: 'Galaxy S23', 
            type: 'Android', 
            lastSeen: '1 hour ago', 
            status: 'offline',
            features: ['streaming', 'notifications']
        }
    ]);
});

// Serve the main Creator Studio app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎨 PRISM Creator Studio running on http://localhost:${PORT}`);
    console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║                    🎨 PRISM CREATOR STUDIO                   ║
    ║                                                              ║
    ║  ✨ Multi-Platform Streaming     📊 Advanced Analytics       ║
    ║  🎬 Professional Stream Tools    💰 Enhanced Monetization    ║
    ║  📅 Content Planning            👥 Team Collaboration       ║
    ║  📱 Mobile Companion            🤖 AI-Powered Insights      ║
    ║                                                              ║
    ║              Professional Creator Management Platform         ║
    ╚══════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
