// Authentication utilities and middleware
// This module will handle JWT tokens, password hashing, and authentication middleware

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const auth = {
  // Hash password
  hashPassword: async (password) => {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, rounds);
  },

  // Compare password
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },

  // Generate JWT token
  generateToken: (payload) => {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign(payload, secret, { expiresIn });
  },

  // Verify JWT token
  verifyToken: (token) => {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  // Express middleware for authentication
  authenticate: (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
      const decoded = auth.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  },

  // Middleware for optional authentication
  optionalAuth: (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = auth.verifyToken(token);
          req.user = decoded;
        } catch (error) {
          // Ignore error for optional auth
        }
      }
    }
    
    next();
  }
};

module.exports = auth;
