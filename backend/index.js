// index.js - Main Server File
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database
const db = require('./config/database');

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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});

module.exports = app;