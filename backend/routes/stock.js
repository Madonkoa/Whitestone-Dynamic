// routes/stock.js - Stock CRUD + Movements
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ============================================
// STOCK CRUD
// ============================================

router.get('/', (req, res) => {
    db.all('SELECT * FROM stock ORDER BY id', (err, rows) => {
        if (err) {
            console.error('Stock GET error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

router.post('/', (req, res) => {
    const { item_type, category, quantity, unit, price, supplier, threshold, expiry } = req.body;
    if (!item_type || quantity === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const query = 'INSERT INTO stock (item_type, category, quantity, unit, price, supplier, threshold, expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(query, [item_type, category || 'feed', quantity, unit || '', price || 0, supplier || '', threshold || 10, expiry || null], function(err) {
        if (err) {
            console.error('Stock POST error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID, message: 'Stock added' });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { item_type, category, quantity, unit, price, supplier, threshold, expiry } = req.body;
    const query = 'UPDATE stock SET item_type = ?, category = ?, quantity = ?, unit = ?, price = ?, supplier = ?, threshold = ?, expiry = ? WHERE id = ?';
    db.run(query, [item_type, category, quantity, unit, price, supplier, threshold, expiry, id], function(err) {
        if (err) {
            console.error('Stock PUT error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Stock not found' });
        res.json({ success: true, message: 'Stock updated' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM stock WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Stock DELETE error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Stock not found' });
        res.json({ success: true, message: 'Stock deleted' });
    });
});

// ============================================
// STOCK MOVEMENTS
// ============================================

// GET all movements
router.get('/movements', (req, res) => {
    console.log('📊 Fetching stock movements...');
    // Simple query to check if table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='stock_movements'", (err, tableCheck) => {
        if (err) {
            console.error('Table check error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!tableCheck) {
            console.log('⚠️ stock_movements table does not exist');
            return res.json([]);
        }
        
        const sql = "SELECT sm.*, s.item_type as stock_item_name FROM stock_movements sm LEFT JOIN stock s ON sm.stock_item_id = s.id ORDER BY sm.created_at DESC LIMIT 50";
        db.all(sql, (err, rows) => {
            if (err) {
                console.error('Movements GET error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log('✅ Found ' + (rows ? rows.length : 0) + ' movements');
            res.json(rows || []);
        });
    });
});

// GET a specific movement
router.get('/movements/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT sm.*, s.item_type as stock_item_name FROM stock_movements sm LEFT JOIN stock s ON sm.stock_item_id = s.id WHERE sm.id = ?";
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('Movement GET error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!row) return res.status(404).json({ error: 'Movement not found' });
        res.json(row);
    });
});

// POST record a movement
router.post('/movements', (req, res) => {
    const { stock_item_id, movement_type, quantity, from_location, to_location, notes } = req.body;
    
    console.log('📝 Recording movement:', { stock_item_id, movement_type, quantity });
    
    if (!stock_item_id || !movement_type || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const validTypes = ['purchase', 'consumption', 'transfer', 'sale', 'adjustment', 'waste'];
    if (!validTypes.includes(movement_type)) {
        return res.status(400).json({ error: 'Invalid movement_type' });
    }
    
    db.get('SELECT * FROM stock WHERE id = ?', [stock_item_id], (err, stockItem) => {
        if (err) {
            console.error('Stock check error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!stockItem) {
            return res.status(404).json({ error: 'Stock item not found' });
        }
        
        const query = "INSERT INTO stock_movements (stock_item_id, movement_type, quantity, from_location, to_location, notes) VALUES (?, ?, ?, ?, ?, ?)";
        
        db.run(
            query,
            [stock_item_id, movement_type, quantity, from_location || null, to_location || null, notes || null],
            function(err) {
                if (err) {
                    console.error('Movement INSERT error:', err.message);
                    return res.status(500).json({ error: err.message });
                }
                
                let qtyChange = 0;
                if (movement_type === 'purchase' || movement_type === 'adjustment') {
                    qtyChange = quantity;
                } else if (movement_type === 'consumption' || movement_type === 'sale' || movement_type === 'waste') {
                    qtyChange = -quantity;
                }
                
                if (qtyChange !== 0) {
                    db.run(
                        'UPDATE stock SET quantity = quantity + ? WHERE id = ?',
                        [qtyChange, stock_item_id],
                        function(err) {
                            if (err) console.error('Stock quantity update error:', err.message);
                        }
                    );
                }
                
                console.log('✅ Movement recorded, ID:', this.lastID);
                res.json({ 
                    success: true, 
                    id: this.lastID, 
                    message: 'Movement recorded successfully'
                });
            }
        );
    });
});

// DELETE a movement
router.delete('/movements/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM stock_movements WHERE id = ?', [id], (err, movement) => {
        if (err) {
            console.error('Movement check error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!movement) {
            return res.status(404).json({ error: 'Movement not found' });
        }
        
        let qtyChange = 0;
        if (movement.movement_type === 'purchase' || movement.movement_type === 'adjustment') {
            qtyChange = -movement.quantity;
        } else if (movement.movement_type === 'consumption' || movement.movement_type === 'sale' || movement.movement_type === 'waste') {
            qtyChange = movement.quantity;
        }
        
        db.run('DELETE FROM stock_movements WHERE id = ?', [id], function(err) {
            if (err) {
                console.error('Movement DELETE error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            
            if (qtyChange !== 0) {
                db.run(
                    'UPDATE stock SET quantity = quantity + ? WHERE id = ?',
                    [qtyChange, movement.stock_item_id],
                    function(err) {
                        if (err) console.error('Stock reversal error:', err.message);
                    }
                );
            }
            
            res.json({ success: true, message: 'Movement deleted successfully' });
        });
    });
});

module.exports = router;
