// routes/customers.js - Customer CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
    db.all('SELECT * FROM customers ORDER BY total_purchases DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(row);
    });
});

router.post('/', (req, res) => {
    const { name, phone, email, address, type } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    
    const query = 
        INSERT INTO customers (name, phone, email, address, type)
        VALUES (?, ?, ?, ?, ?)
    ;
    
    db.run(query, [name, phone, email, address, type || 'regular'], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID, message: 'Customer added' });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, email, address, type, total_purchases, last_purchase } = req.body;
    
    const query = 
        UPDATE customers 
        SET name = ?, phone = ?, email = ?, address = ?, type = ?, total_purchases = ?, last_purchase = ?
        WHERE id = ?
    ;
    
    db.run(query, [name, phone, email, address, type, total_purchases, last_purchase, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ success: true, message: 'Customer updated' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ success: true, message: 'Customer deleted' });
    });
});

router.get('/stats', (req, res) => {
    db.get(\
        SELECT 
            COUNT(*) as total_customers,
            SUM(total_purchases) as total_revenue,
            AVG(total_purchases) as avg_purchase,
            COUNT(CASE WHEN type = 'wholesale' THEN 1 END) as wholesale_count,
            COUNT(CASE WHEN type = 'regular' THEN 1 END) as regular_count,
            COUNT(CASE WHEN type = 'vip' THEN 1 END) as vip_count
        FROM customers
    \, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row || {});
    });
});

module.exports = router;
