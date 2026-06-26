// server.js - Main Express server
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const stockRoutes = require('./routes/stock');
const feedRoutes = require('./routes/feed');
const coopRoutes = require('./routes/coops');
const eggRoutes = require('./routes/eggs');
const salesRoutes = require('./routes/sales');
const chickenRoutes = require('./routes/chickens');
const customerRoutes = require('./routes/customers');
const batchRoutes = require('./routes/batches');
const pricingRoutes = require('./routes/pricing');
const securityRoutes = require('./routes/security');
const equipmentRoutes = require('./routes/equipment');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/coops', coopRoutes);
app.use('/api/eggs', eggRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/chickens', chickenRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/equipment', equipmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📊 API Base URL: http://localhost:${port}/api`);
    console.log('✅ Ready to accept requests!');
});