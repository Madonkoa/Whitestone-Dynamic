const express = require('express');
const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Accept any credentials for demo
    if (username && username.length > 0) {
        return res.json({
            success: true,
            message: 'Login successful',
            user: { 
                id: 1, 
                username: username, 
                name: 'Admin User',
                role: 'admin'
            },
            token: 'demo-token-' + Date.now()
        });
    }
    
    res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
    });
});

// Check auth status
router.get('/me', (req, res) => {
    res.json({ 
        authenticated: true, 
        user: { 
            id: 1, 
            username: 'admin', 
            name: 'Admin User',
            role: 'admin' 
        } 
    });
});

// Logout
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

module.exports = router;
