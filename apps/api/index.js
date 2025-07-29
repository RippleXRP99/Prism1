const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'prism-super-secret-key-2025';

// Database file path
const DB_PATH = path.join(__dirname, '../data/users.json');
const MEDIA_DB_PATH = path.join(__dirname, '../data/media.json');
const RECORDINGS_DB_PATH = path.join(__dirname, '../data/recordings.json');
const MEDIA_UPLOAD_PATH = path.join(__dirname, '../data/uploads');
const RECORDINGS_PATH = path.join(__dirname, '../data/recordings');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.mkdir(MEDIA_UPLOAD_PATH, { recursive: true });
            cb(null, MEDIA_UPLOAD_PATH);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${timestamp}_${originalName}`);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow video and audio files
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video and audio files are allowed'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory and users file exist
const initDatabase = async () => {
    try {
        const dataDir = path.dirname(DB_PATH);
        const mediaDir = path.dirname(MEDIA_DB_PATH);
        
        await fs.mkdir(dataDir, { recursive: true });
        await fs.mkdir(mediaDir, { recursive: true });
        await fs.mkdir(MEDIA_UPLOAD_PATH, { recursive: true });
        
        try {
            await fs.access(DB_PATH);
        } catch {
            // File doesn't exist, create it with empty array
            await fs.writeFile(DB_PATH, JSON.stringify([], null, 2));
        }
        
        try {
            await fs.access(MEDIA_DB_PATH);
        } catch {
            // Media DB doesn't exist, create it with empty array
            await fs.writeFile(MEDIA_DB_PATH, JSON.stringify([], null, 2));
        }
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

// Database helpers
const readUsers = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
};

const writeUsers = async (users) => {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing users:', error);
        return false;
    }
};

// Media database helpers
const readMedia = async () => {
    try {
        const data = await fs.readFile(MEDIA_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading media:', error);
        return [];
    }
};

const writeMedia = async (media) => {
    try {
        await fs.writeFile(MEDIA_DB_PATH, JSON.stringify(media, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing media:', error);
        return false;
    }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Auth Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, username, displayName } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const users = await readUsers();

        // Check if user already exists
        const existingUser = users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() || 
            user.username.toLowerCase() === username.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({ 
                error: existingUser.email.toLowerCase() === email.toLowerCase() 
                    ? 'Email already registered' 
                    : 'Username already taken' 
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            displayName: displayName || username,
            password: hashedPassword,
            avatar: `/assets/avatars/default-${Math.floor(Math.random() * 6) + 1}.png`,
            role: 'user',
            status: 'active',
            isVerified: false,
            plan: 'free',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
            totalContent: 0,
            totalRevenue: 0,
            preferences: {
                notifications: true,
                darkMode: false,
                language: 'en'
            },
            stats: {
                loginCount: 0,
                contentViewed: 0,
                subscriptions: 0
            }
        };

        users.push(newUser);
        await writeUsers(users);

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email, 
                username: newUser.username,
                role: newUser.role 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const { password: _, ...userResponse } = newUser;
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const users = await readUsers();

        // Find user by email or username
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() || 
            u.username.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'Account is suspended. Please contact support.' });
        }

        // Update login stats
        user.lastLogin = new Date().toISOString();
        user.stats.loginCount += 1;
        user.updatedAt = new Date().toISOString();

        await writeUsers(users);

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                username: user.username,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password)
        const { password: _, ...userResponse } = user;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Verify token and get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === req.user.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data (without password)
        const { password: _, ...userResponse } = user;
        
        res.json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout (client-side token removal, but we can track it)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        // In a real app, you might maintain a blacklist of tokens
        // For now, we just confirm the logout
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Management Routes (for admin)

// Get all users (admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const users = await readUsers();
        
        // Remove passwords from response
        const usersResponse = users.map(({ password: _, ...user }) => user);
        
        res.json({
            success: true,
            users: usersResponse,
            total: usersResponse.length
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users (public route for admin panel)
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await readUsers();
        
        // Remove passwords from response
        const usersResponse = users.map(({ password: _, ...user }) => user);
        
        res.json({
            success: true,
            users: usersResponse,
            total: usersResponse.length
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user status (admin only)
app.put('/api/users/:userId/status', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[userIndex].status = status;
        users[userIndex].updatedAt = new Date().toISOString();

        await writeUsers(users);

        const { password: _, ...userResponse } = users[userIndex];

        res.json({
            success: true,
            message: `User status updated to ${status}`,
            user: userResponse
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user role (public route for admin panel)
app.put('/api/admin/users/:userId/role', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['user', 'creator', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be user, creator, admin, or moderator' });
        }

        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[userIndex].role = role;
        users[userIndex].updatedAt = new Date().toISOString();

        await writeUsers(users);

        const { password: _, ...userResponse } = users[userIndex];

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            user: userResponse
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user status (public route for admin panel)
app.put('/api/admin/users/:userId/status', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['active', 'suspended', 'banned'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const users = await readUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        users[userIndex].status = status;
        users[userIndex].updatedAt = new Date().toISOString();

        await writeUsers(users);

        const { password: _, ...userResponse } = users[userIndex];

        res.json({
            success: true,
            message: `User status updated to ${status}`,
            user: userResponse
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Media Upload API for Stream Recordings
app.post('/api/media/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { type, source, title, duration, metadata } = req.body;
        
        // Create media entry
        const mediaEntry = {
            id: Date.now().toString(),
            filename: req.file.filename,
            originalName: req.file.originalname,
            filepath: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            type: type || 'video',
            source: source || 'upload',
            title: title || req.file.originalname,
            duration: duration ? parseInt(duration) : null,
            metadata: metadata ? JSON.parse(metadata) : {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            status: 'active'
        };

        // Add to media database
        const media = await readMedia();
        media.push(mediaEntry);
        await writeMedia(media);

        res.json({
            success: true,
            message: 'Media uploaded successfully',
            media: mediaEntry
        });

    } catch (error) {
        console.error('Media upload error:', error);
        res.status(500).json({ error: 'Failed to upload media' });
    }
});

// Get all media for library
app.get('/api/media', async (req, res) => {
    try {
        const media = await readMedia();
        
        res.json({
            success: true,
            media: media.filter(m => m.status === 'active'),
            total: media.length
        });

    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({ error: 'Failed to retrieve media' });
    }
});

// Serve uploaded media files
app.use('/api/media/files', express.static(MEDIA_UPLOAD_PATH));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Recording Server Integration Routes
app.post('/api/recordings/session', async (req, res) => {
    try {
        const sessionId = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const session = {
            id: sessionId,
            userId: req.body.userId || 'anonymous',
            quality: req.body.quality || '1080p',
            format: req.body.format || 'mp4',
            autoSave: req.body.autoSave || true,
            liveStream: req.body.liveStream || false,
            timestamp: req.body.timestamp || new Date().toISOString(),
            status: 'created',
            filePath: null,
            fileSize: 0,
            duration: 0
        };

        // Save to recordings database
        const recordingsDb = await loadRecordingsDb();
        recordingsDb[sessionId] = session;
        await saveRecordingsDb(recordingsDb);
        
        console.log('📝 Created recording session:', sessionId);
        res.json(session);
    } catch (error) {
        console.error('❌ Error creating recording session:', error);
        res.status(500).json({ error: 'Failed to create recording session' });
    }
});

app.post('/api/recordings/:sessionId/finalize', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const recordingsDb = await loadRecordingsDb();
        const session = recordingsDb[sessionId];

        if (!session) {
            return res.status(404).json({ error: 'Recording session not found' });
        }

        // For demo purposes, create a completed recording entry
        session.status = 'completed';
        session.fileSize = Math.floor(Math.random() * 50000000) + 10000000; // 10-60MB
        session.duration = Math.floor(Math.random() * 300) + 60; // 1-6 minutes
        session.filePath = `/uploads/recordings/${sessionId}.mp4`;

        // Add to media library
        const mediaDb = await loadMediaDb();
        const mediaEntry = {
            id: sessionId,
            title: `Stream Recording ${new Date().toLocaleDateString()}`,
            description: 'Automatically recorded stream',
            filename: `${sessionId}.mp4`,
            type: 'video',
            size: session.fileSize,
            duration: session.duration,
            uploadDate: new Date().toISOString(),
            url: session.filePath,
            source: 'server-recording'
        };
        
        mediaDb.push(mediaEntry);
        
        await saveRecordingsDb(recordingsDb);
        await saveMediaDb(mediaDb);

        console.log('✅ Recording finalized and added to media library:', sessionId);
        
        res.json({
            success: true,
            sessionId: sessionId,
            filePath: session.filePath,
            fileSize: session.fileSize,
            duration: session.duration,
            downloadUrl: `http://localhost:${PORT}${session.filePath}`
        });
    } catch (error) {
        console.error('❌ Error finalizing recording:', error);
        res.status(500).json({ error: 'Failed to finalize recording' });
    }
});

app.get('/api/recordings/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const recordingsDb = await loadRecordingsDb();
        const session = recordingsDb[sessionId];

        if (!session) {
            return res.status(404).json({ error: 'Recording session not found' });
        }

        res.json(session);
    } catch (error) {
        console.error('❌ Error getting recording session:', error);
        res.status(500).json({ error: 'Failed to get recording session' });
    }
});

app.get('/api/recordings', async (req, res) => {
    try {
        const recordingsDb = await loadRecordingsDb();
        const allRecordings = Object.values(recordingsDb);
        res.json(allRecordings);
    } catch (error) {
        console.error('❌ Error getting recordings:', error);
        res.status(500).json({ error: 'Failed to get recordings' });
    }
});

// Recordings database functions
async function loadRecordingsDb() {
    try {
        const data = await fs.readFile(RECORDINGS_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

async function saveRecordingsDb(data) {
    await fs.writeFile(RECORDINGS_DB_PATH, JSON.stringify(data, null, 2));
}

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 PRISM API Server running on http://localhost:${PORT}`);
        console.log(`📁 Database: ${DB_PATH}`);
        console.log(`🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
        console.log(`✨ Features: Authentication, User Management, Admin Panel Integration`);
    });
}).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

module.exports = app;
