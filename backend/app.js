// app.js - Main Server File
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger-config');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5500;

// ============================================
// MIDDLEWARE (must be first!)
// ============================================
app.use(cors({
    origin: ['http://localhost:5501', 'http://127.0.0.1:5501', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================
// AUTHENTICATION MIDDLEWARE - BEFORE ROUTES
// ============================================
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/health'];

// THIS MUST BE BEFORE app.use('/api/...') calls!
app.use((req, res, next) => {
    console.log(req.method + ' ' + req.path);

    // Skip auth for public routes
    if (PUBLIC_ROUTES.some(route => req.path.startsWith(route))) {
        console.log('PUBLIC: ' + req.path);
        return next();
    }

    // Get token
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }

    // NO TOKEN OR EMPTY TOKEN = BLOCK
    if (!token || token.trim() === '') {
        console.log('BLOCKED: ' + req.method + ' ' + req.path + ' - No valid token');
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please login to access this resource'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'whitestone_super_secret_key_2026');
        req.user = decoded;
        console.log('ALLOWED: ' + req.method + ' ' + req.path + ' - User: ' + decoded.username);
        next();
    } catch (error) {
        console.log('BLOCKED: ' + req.method + ' ' + req.path + ' - ' + error.message);
        return res.status(401).json({
            error: 'Invalid token',
            message: error.message
        });
    }
});

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// DATABASE
// ============================================
const db = require('./config/database');

// ============================================
// ROUTES (loaded AFTER auth middleware)
// ============================================
console.log('Loading routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/coops', require('./routes/coops'));
app.use('/api/eggs', require('./routes/eggs'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/chickens', require('./routes/chickens'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/security', require('./routes/security'));
app.use('/api/equipment', require('./routes/equipment'));

// ============================================
// HEALTH CHECK (public)
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// ============================================
// 404 & ERROR HANDLERS
// ============================================
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
    console.log('http://localhost:' + PORT);
    console.log('AUTHENTICATION ACTIVE');
    console.log('Public routes: ' + PUBLIC_ROUTES.join(', '));
});

module.exports = app;



