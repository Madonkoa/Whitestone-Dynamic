// app.js - Main Server File
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Database
const db = require('./config/database');

// Public routes
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/health'];

// Auth middleware
app.use((req, res, next) => {
    if (PUBLIC_ROUTES.some(route => req.path.startsWith(route))) {
        return next();
    }

    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }

    if (!token || token.trim() === '') {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please login to access this resource'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'whitestone_super_secret_key_2026');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid token',
            message: error.message
        });
    }
});

// Routes
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', port: PORT });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
    console.log('Authentication ACTIVE');
});

module.exports = app;
