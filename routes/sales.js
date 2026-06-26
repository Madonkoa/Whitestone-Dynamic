// routes/sales.js - Sales CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Egg Sales
router.get('/eggs', (req, res) => {
    db.all('SELECT * FROM egg_sales ORDER BY sale_date DESC LIMIT 100', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

router.post('/eggs', (req, res) => {
    const { buyer_name, sale_date, egg_size, crates, pieces, price_per_crate, total_eggs, total, notes } = req.body;
    
    if (!buyer_name || !sale_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const query = 
        INSERT INTO egg_sales (buyer_name, sale_date, egg_size, crates, pieces, price_per_crate, total_eggs, total, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ;
    
    db.run(query, [buyer_name, sale_date, egg_size, crates || 0, pieces || 0, price_per_crate || 0, total_eggs || 0, total || 0, notes], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID, message: 'Egg sale recorded' });
    });
});

router.put('/eggs/:id', (req, res) => {
    const { id } = req.params;
    const { buyer_name, sale_date, egg_size, crates, pieces, price_per_crate, total_eggs, total, notes } = req.body;
    
    const query = 
        UPDATE egg_sales 
        SET buyer_name = ?, sale_date = ?, egg_size = ?, crates = ?, pieces = ?, price_per_crate = ?, total_eggs = ?, total = ?, notes = ?
        WHERE id = ?
    ;
    
    db.run(query, [buyer_name, sale_date, egg_size, crates, pieces, price_per_crate, total_eggs, total, notes, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json({ success: true, message: 'Egg sale updated' });
    });
});

router.delete('/eggs/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM egg_sales WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json({ success: true, message: 'Egg sale deleted' });
    });
});

// Chicken Sales
router.get('/chickens', (req, res) => {
    db.all('SELECT * FROM chicken_sales ORDER BY sale_date DESC LIMIT 100', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

router.post('/chickens', (req, res) => {
    const { buyer, sale_date, chicken_type, quantity, price, status, total, notes } = req.body;
    
    if (!buyer || !sale_date || !chicken_type || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const query = 
        INSERT INTO chicken_sales (buyer, sale_date, chicken_type, quantity, price, status, total, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ;
    
    db.run(query, [buyer, sale_date, chicken_type, quantity, price || 0, status || 'undressed', total || 0, notes], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID, message: 'Chicken sale recorded' });
    });
});

router.put('/chickens/:id', (req, res) => {
    const { id } = req.params;
    const { buyer, sale_date, chicken_type, quantity, price, status, total, notes } = req.body;
    
    const query = 
        UPDATE chicken_sales 
        SET buyer = ?, sale_date = ?, chicken_type = ?, quantity = ?, price = ?, status = ?, total = ?, notes = ?
        WHERE id = ?
    ;
    
    db.run(query, [buyer, sale_date, chicken_type, quantity, price, status, total, notes, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json({ success: true, message: 'Chicken sale updated' });
    });
});

router.delete('/chickens/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM chicken_sales WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }
        res.json({ success: true, message: 'Chicken sale deleted' });
    });
});

router.get('/stats', (req, res) => {
    db.get('SELECT SUM(total) as egg_total, COUNT(*) as egg_count FROM egg_sales', (err, eggRow) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        db.get('SELECT SUM(total) as chicken_total, SUM(quantity) as chicken_count FROM chicken_sales', (err, chickenRow) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            db.get(\
                SELECT SUM(total) as month_total FROM (
                    SELECT total FROM egg_sales WHERE strftime('%Y-%m', sale_date) = strftime('%Y-%m', 'now')
                    UNION ALL
                    SELECT total FROM chicken_sales WHERE strftime('%Y-%m', sale_date) = strftime('%Y-%m', 'now')
                )
            \, (err, monthRow) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    eggRevenue: eggRow ? eggRow.egg_total || 0 : 0,
                    eggCount: eggRow ? eggRow.egg_count || 0 : 0,
                    chickenRevenue: chickenRow ? chickenRow.chicken_total || 0 : 0,
                    chickenCount: chickenRow ? chickenRow.chicken_count || 0 : 0,
                    totalRevenue: (eggRow ? eggRow.egg_total || 0 : 0) + (chickenRow ? chickenRow.chicken_total || 0 : 0),
                    monthRevenue: monthRow ? monthRow.month_total || 0 : 0
                });
            });
        });
    });
});

module.exports = router;
