const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Enable JSON parsing
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Creator Studio', 
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes placeholder (can be extended)
app.get('/api/status', (req, res) => {
    res.json({ 
        message: 'Creator Studio API is running',
        modules: ['Dashboard', 'MediaLibrary', 'LivestreamingStudio', 'Monetization']
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Creator Studio Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🎯 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
