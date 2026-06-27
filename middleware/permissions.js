// middleware/permissions.js - Permission checking middleware
const db = require('../config/database');

// Check if user has a specific permission
function hasPermission(userId, permissionName) {
    return new Promise((resolve, reject) => {
        // Check user_permissions first (custom override)
        db.get(`
            SELECT up.granted, p.name 
            FROM user_permissions up
            JOIN permissions p ON up.permission_id = p.id
            WHERE up.user_id = ? AND p.name = ?
        `, [userId, permissionName], (err, userPerm) => {
            if (err) return reject(err);
            
            // If user has custom permission, use that
            if (userPerm) {
                return resolve(userPerm.granted === 1);
            }
            
            // Check role_permissions
            db.get(`
                SELECT rp.granted
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = ? AND p.name = ?
            `, [userId, permissionName], (err, rolePerm) => {
                if (err) return reject(err);
                resolve(rolePerm ? rolePerm.granted === 1 : false);
            });
        });
    });
}

// Check if user has any of the given permissions
async function hasAnyPermission(userId, permissions) {
    for (const perm of permissions) {
        if (await hasPermission(userId, perm)) {
            return true;
        }
    }
    return false;
}

// Check if user has all of the given permissions
async function hasAllPermissions(userId, permissions) {
    for (const perm of permissions) {
        if (!(await hasPermission(userId, perm))) {
            return false;
        }
    }
    return true;
}

// Middleware for route protection
function requirePermission(permissionName) {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            const hasPerm = await hasPermission(userId, permissionName);
            if (!hasPerm) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
            
            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

// Middleware for role-based access
function requireRole(roleName) {
    return async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            db.get(`
                SELECT r.name
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = ? AND r.name = ?
            `, [userId, roleName], (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!result) {
                    return res.status(403).json({ error: 'Forbidden: Required role not found' });
                }
                next();
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

// Get user's permissions (for frontend)
function getUserPermissions(userId) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT DISTINCT p.name, p.module, p.description
            FROM permissions p
            LEFT JOIN user_permissions up ON p.id = up.permission_id AND up.user_id = ? AND up.granted = 1
            LEFT JOIN role_permissions rp ON p.id = rp.permission_id AND rp.granted = 1
            LEFT JOIN user_roles ur ON rp.role_id = ur.role_id AND ur.user_id = ?
            WHERE up.user_id IS NOT NULL OR ur.user_id IS NOT NULL
        `, [userId, userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

// Get user's roles
function getUserRoles(userId) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT r.id, r.name, r.display_name, r.description, r.level
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
        `, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
}

module.exports = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    requirePermission,
    requireRole,
    getUserPermissions,
    getUserRoles
};
