const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes for Studio Management
app.get('/api/studios', (req, res) => {
    // Get studios from database/storage
    res.json({ studios: [] });
});

app.post('/api/studios/add-creator', (req, res) => {
    const { studioKey, creatorId } = req.body;
    // Logic to add creator to studio using studio key
    res.json({ success: true, message: 'Creator added to studio portfolio' });
});

app.listen(PORT, () => {
    console.log(`🏢 Studio Dashboard running on http://localhost:${PORT}`);
    console.log(`🎯 PRISM Studio Management Platform`);
});
