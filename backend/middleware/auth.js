// middleware/auth.js - JWT verification middleware
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'whitestone_super_secret_key_2026');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function isOwner(req, res, next) {
    if (req.user.position === 'Owner' || req.user.role === 'owner' || req.user.username === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Owner only.' });
    }
}

function checkPermission(permission) {
    return function (req, res, next) {
        const user = req.user;

        // Owner has all permissions
        if (user.position === 'Owner' || user.role === 'owner' || user.username === 'admin') {
            return next();
        }

        const permissions = {
            owner: ['*'],
            manager: ['employees_view', 'stock_crud', 'feed_crud', 'coops_crud', 'eggs_crud', 'sales_crud', 'chickens_crud', 'customers_crud', 'batches_crud', 'security_crud', 'equipment_crud'],
            foreman: ['stock_view', 'feed_crud', 'coops_crud', 'eggs_crud', 'chickens_crud', 'batches_crud', 'equipment_crud'],
            farmer: ['feed_view', 'coops_view', 'eggs_view', 'chickens_view', 'batches_view'],
            sales: ['sales_crud', 'customers_crud'],
            accountant: ['sales_view', 'customers_view', 'pricing_crud']
        };

        const userPermissions = permissions[user.role] || [];

        if (userPermissions.includes('*') || userPermissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
    };
}

module.exports = { verifyToken, isOwner, checkPermission };