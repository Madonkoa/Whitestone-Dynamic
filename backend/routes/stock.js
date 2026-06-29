// routes/stock.js - Complete Stock API with FCR
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ===== HELPER FUNCTIONS =====
function getStockStats(products) {
    let totalFeed = 0;
    let totalValue = 0;
    let categories = new Set();
    let feedItems = 0;
    let lowStockItems = 0;
    let categoryCounts = {};

    (products || []).forEach(p => {
        totalValue += p.value || 0;
        categories.add(p.category);
        if (p.category === 'Feed') {
            totalFeed += p.quantity || 0;
            feedItems++;
        }
        if (p.quantity <= p.min_threshold && p.min_threshold > 0) {
            lowStockItems++;
        }
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + (p.quantity || 0);
    });

    return {
        totalFeed, totalValue, itemCount: products ? products.length : 0,
        categories: categories.size, lowStockItems, feedItems
    };
}

// ===== FCR CALCULATION =====
function calculateFCR(callback) {
    // Get total feed consumed in last 30 days
    db.get('SELECT COALESCE(SUM(quantity_kg), 0) as total_feed FROM feed_consumption WHERE date > date("now", "-30 days")', (err, feedRow) => {
        if (err) return callback(err);
        // Get total weight gained in last 30 days
        db.get('SELECT COALESCE(SUM(weight_kg), 0) as total_weight FROM weight_gained WHERE date > date("now", "-30 days")', (err, weightRow) => {
            if (err) return callback(err);
            const feed = feedRow ? feedRow.total_feed : 0;
            const weight = weightRow ? weightRow.total_weight : 0;
            const fcr = weight > 0 ? feed / weight : 0;
            callback(null, { feed, weight, fcr });
        });
    });
}

// ===== SUPPLIER ENDPOINTS =====
router.get('/suppliers', (req, res) => {
    db.all('SELECT * FROM suppliers ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

router.post('/suppliers', (req, res) => {
    const { name, contact_person, phone, email, address, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Supplier name is required' });
    db.run('INSERT INTO suppliers (name, contact_person, phone, email, address, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [name, contact_person || '', phone || '', email || '', address || '', notes || ''],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID, message: 'Supplier added' });
        });
});

router.put('/suppliers/:id', (req, res) => {
    const { id } = req.params;
    const { name, contact_person, phone, email, address, notes } = req.body;
    db.run('UPDATE suppliers SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, notes = ? WHERE id = ?',
        [name, contact_person || '', phone || '', email || '', address || '', notes || '', id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Supplier not found' });
            res.json({ success: true, message: 'Supplier updated' });
        });
});

router.delete('/suppliers/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM suppliers WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Supplier not found' });
        res.json({ success: true, message: 'Supplier deleted' });
    });
});

// ===== STOCK ENDPOINTS =====
router.get('/', (req, res) => {
    db.all(`SELECT s.*, sup.name as supplier_name FROM stock s
        LEFT JOIN suppliers sup ON s.supplier_id = sup.id
        ORDER BY s.category, s.name`, (err, products) => {
        if (err) return res.status(500).json({ error: err.message });
        const stats = getStockStats(products);
        db.all('SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 50', (err, movements) => {
            if (err) return res.status(500).json({ error: err.message });
            // Calculate FCR
            calculateFCR((err, fcrData) => {
                if (err) {
                    console.error('FCR calculation error:', err);
                    fcrData = { feed: 0, weight: 0, fcr: 0 };
                }
                const formattedMovements = (movements || []).map(m => ({
                    id: m.id, stock_id: m.stock_id,
                    product: products.find(p => p.id === m.stock_id)?.name || 'Unknown',
                    type: m.type, quantity: m.type === 'out' ? -m.quantity : m.quantity,
                    reason: m.reason, notes: m.notes, date: m.created_at ? m.created_at.split('T')[0] : null
                }));
                res.json({
                    products: products || [],
                    movements: formattedMovements || [],
                    stats: {
                        ...stats,
                        feedDays: 12,
                        feedConsumed: fcrData.feed,
                        weightGained: fcrData.weight,
                        fcr: fcrData.fcr,
                        feedItems: stats.feedItems
                    },
                    categories: {
                        birds: categoryCounts['Birds'] || 0,
                        eggs: categoryCounts['Eggs'] || 0,
                        feed: categoryCounts['Feed'] || 0,
                        meds: categoryCounts['Meds'] || 0,
                        equipment: categoryCounts['Equipment'] || 0,
                        packaging: categoryCounts['Packaging'] || 0,
                        vaccines: categoryCounts['Vaccines'] || 0
                    }
                });
            });
        });
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT s.*, sup.name as supplier_name FROM stock s LEFT JOIN suppliers sup ON s.supplier_id = sup.id WHERE s.id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Stock item not found' });
        res.json(row);
    });
});

router.post('/', (req, res) => {
    const { name, category, quantity, unit, value, min_threshold, supplier_id, expiry_date, location, batch_number, reorder_point } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category are required' });
    const query = 'INSERT INTO stock (name, category, quantity, unit, value, min_threshold, supplier_id, expiry_date, location, batch_number, reorder_point) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [name, category, quantity || 0, unit || 'units', value || 0, min_threshold || 0, supplier_id || null, expiry_date || null, location || null, batch_number || null, reorder_point || 0];
    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run('INSERT INTO stock_movements (stock_id, type, quantity, reason, notes) VALUES (?, ?, ?, ?, ?)', [this.lastID, 'in', quantity || 0, 'Purchase', 'Initial stock entry']);
        res.json({ success: true, id: this.lastID, message: 'Stock item added successfully' });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, quantity, unit, value, min_threshold, supplier_id, expiry_date, location, batch_number, reorder_point } = req.body;
    const query = 'UPDATE stock SET name = ?, category = ?, quantity = ?, unit = ?, value = ?, min_threshold = ?, supplier_id = ?, expiry_date = ?, location = ?, batch_number = ?, reorder_point = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const values = [name, category, quantity, unit, value, min_threshold, supplier_id || null, expiry_date || null, location || null, batch_number || null, reorder_point || 0, id];
    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Stock item not found' });
        res.json({ success: true, message: 'Stock item updated successfully' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('UPDATE stock SET quantity = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Stock item not found' });
        res.json({ success: true, message: 'Stock item archived' });
    });
});

router.post('/:id/movement', (req, res) => {
    const { id } = req.params;
    const { type, quantity, reason, notes } = req.body;
    if (!type || !quantity) return res.status(400).json({ error: 'Type and quantity are required' });
    if (!['in', 'out', 'adjust'].includes(type)) return res.status(400).json({ error: 'Type must be in, out, or adjust' });
    db.get('SELECT * FROM stock WHERE id = ?', [id], (err, item) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!item) return res.status(404).json({ error: 'Stock item not found' });
        let newQuantity = item.quantity;
        if (type === 'in') newQuantity += quantity;
        else if (type === 'out') newQuantity -= quantity;
        else newQuantity = quantity;
        if (newQuantity < 0) return res.status(400).json({ error: 'Insufficient stock' });
        db.run('UPDATE stock SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQuantity, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run('INSERT INTO stock_movements (stock_id, type, quantity, reason, notes) VALUES (?, ?, ?, ?, ?)', [id, type, quantity, reason || '', notes || '']);
            res.json({ success: true, message: 'Stock movement recorded', newQuantity: newQuantity });
        });
    });
});

router.get('/movements', (req, res) => {
    const { limit = 50, product, type, from, to } = req.query;
    let query = 'SELECT * FROM stock_movements WHERE 1=1';
    let params = [];
    if (product) { query += ' AND stock_id = ?'; params.push(product); }
    if (type) { query += ' AND type = ?'; params.push(type); }
    if (from) { query += ' AND date(created_at) >= ?'; params.push(from); }
    if (to) { query += ' AND date(created_at) <= ?'; params.push(to); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit) || 50);
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

router.get('/low', (req, res) => {
    db.all('SELECT * FROM stock WHERE quantity <= min_threshold AND min_threshold > 0 ORDER BY category', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// ===== FCR ENDPOINTS =====
router.get('/fcr', (req, res) => {
    calculateFCR((err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        let status = 'good';
        let label = '✅ Good';
        if (data.fcr > 2.5) { status = 'poor'; label = '❌ Poor'; }
        else if (data.fcr > 2.2) { status = 'average'; label = '📊 Average'; }
        else if (data.fcr > 1.8) { status = 'good'; label = '✅ Good'; }
        else { status = 'excellent'; label = '⭐ Excellent'; }
        res.json({
            ...data,
            status,
            label,
            thresholds: {
                excellent: { min: 0, max: 1.8, label: '⭐ Excellent' },
                good: { min: 1.8, max: 2.2, label: '✅ Good' },
                average: { min: 2.2, max: 2.5, label: '📊 Average' },
                poor: { min: 2.5, max: Infinity, label: '❌ Poor' }
            }
        });
    });
});

module.exports = router;

