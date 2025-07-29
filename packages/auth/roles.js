const express = require('express');
const jwt = require('jsonwebtoken');

class RoleManager {
    constructor() {
        // Define roles and their permissions
        this.roles = {
            admin: {
                name: 'Administrator',
                permissions: [
                    'user.create', 'user.read', 'user.update', 'user.delete',
                    'content.create', 'content.read', 'content.update', 'content.delete',
                    'content.moderate', 'content.approve', 'content.reject',
                    'payment.read', 'payment.manage', 'payment.refund',
                    'system.config', 'system.analytics', 'system.backup',
                    'role.manage', 'permission.manage',
                    'report.read', 'report.investigate', 'report.resolve'
                ]
            },
            moderator: {
                name: 'Moderator',
                permissions: [
                    'user.read', 'user.suspend', 'user.warn',
                    'content.read', 'content.moderate', 'content.approve', 'content.reject',
                    'report.read', 'report.investigate', 'report.resolve'
                ]
            },
            creator: {
                name: 'Creator',
                permissions: [
                    'content.create', 'content.read', 'content.update', 'content.delete.own',
                    'stream.create', 'stream.manage.own',
                    'analytics.read.own',
                    'payment.read.own', 'payment.withdraw.own',
                    'profile.read', 'profile.update.own'
                ]
            },
            user: {
                name: 'User',
                permissions: [
                    'content.read', 'content.comment', 'content.like',
                    'profile.read', 'profile.update.own',
                    'payment.create', 'payment.read.own'
                ]
            }
        };

        // Permission categories for better organization
        this.permissionCategories = {
            user: [
                'user.create', 'user.read', 'user.update', 'user.delete',
                'user.suspend', 'user.warn', 'user.ban'
            ],
            content: [
                'content.create', 'content.read', 'content.update', 'content.delete',
                'content.delete.own', 'content.moderate', 'content.approve', 'content.reject'
            ],
            stream: [
                'stream.create', 'stream.read', 'stream.update', 'stream.delete',
                'stream.manage.own', 'stream.moderate'
            ],
            payment: [
                'payment.create', 'payment.read', 'payment.read.own',
                'payment.manage', 'payment.withdraw.own', 'payment.refund'
            ],
            system: [
                'system.config', 'system.analytics', 'system.backup',
                'system.maintenance'
            ],
            role: [
                'role.manage', 'permission.manage'
            ],
            report: [
                'report.read', 'report.investigate', 'report.resolve'
            ],
            analytics: [
                'analytics.read', 'analytics.read.own', 'analytics.export'
            ],
            profile: [
                'profile.read', 'profile.update', 'profile.update.own'
            ]
        };
    }

    // Check if user has specific permission
    hasPermission(userRole, permission) {
        if (!this.roles[userRole]) {
            return false;
        }
        return this.roles[userRole].permissions.includes(permission);
    }

    // Check if user has any of the specified permissions
    hasAnyPermission(userRole, permissions) {
        return permissions.some(permission => this.hasPermission(userRole, permission));
    }

    // Check if user has all specified permissions
    hasAllPermissions(userRole, permissions) {
        return permissions.every(permission => this.hasPermission(userRole, permission));
    }

    // Get all permissions for a role
    getRolePermissions(role) {
        return this.roles[role] ? this.roles[role].permissions : [];
    }

    // Get all available roles
    getAllRoles() {
        return Object.keys(this.roles).map(key => ({
            key,
            name: this.roles[key].name,
            permissions: this.roles[key].permissions
        }));
    }

    // Add permission to role
    addPermissionToRole(role, permission) {
        if (this.roles[role] && !this.roles[role].permissions.includes(permission)) {
            this.roles[role].permissions.push(permission);
            return true;
        }
        return false;
    }

    // Remove permission from role
    removePermissionFromRole(role, permission) {
        if (this.roles[role]) {
            const index = this.roles[role].permissions.indexOf(permission);
            if (index > -1) {
                this.roles[role].permissions.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    // Create new role
    createRole(roleKey, roleName, permissions = []) {
        if (!this.roles[roleKey]) {
            this.roles[roleKey] = {
                name: roleName,
                permissions: permissions
            };
            return true;
        }
        return false;
    }

    // Delete role
    deleteRole(roleKey) {
        if (this.roles[roleKey] && !['admin', 'user'].includes(roleKey)) {
            delete this.roles[roleKey];
            return true;
        }
        return false; // Can't delete admin or user roles
    }

    // Get permissions by category
    getPermissionsByCategory() {
        return this.permissionCategories;
    }

    // Validate user permissions for resource access
    canAccessResource(userRole, resource, action, resourceOwnerId = null, userId = null) {
        const permission = `${resource}.${action}`;
        const ownPermission = `${resource}.${action}.own`;

        // Check for general permission
        if (this.hasPermission(userRole, permission)) {
            return true;
        }

        // Check for own resource permission
        if (this.hasPermission(userRole, ownPermission) && resourceOwnerId === userId) {
            return true;
        }

        return false;
    }
}

// Middleware for role-based access control
function requirePermission(permission) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const userRole = decoded.role || 'user';
            
            if (roleManager.hasPermission(userRole, permission)) {
                req.user = decoded;
                next();
            } else {
                res.status(403).json({ 
                    error: 'Insufficient permissions',
                    required: permission,
                    userRole: userRole
                });
            }
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
}

// Middleware for multiple permission check (any)
function requireAnyPermission(permissions) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const userRole = decoded.role || 'user';
            
            if (roleManager.hasAnyPermission(userRole, permissions)) {
                req.user = decoded;
                next();
            } else {
                res.status(403).json({ 
                    error: 'Insufficient permissions',
                    required: permissions,
                    userRole: userRole
                });
            }
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
}

// Middleware for role check
function requireRole(roles) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const userRole = decoded.role || 'user';
            
            if (roles.includes(userRole)) {
                req.user = decoded;
                next();
            } else {
                res.status(403).json({ 
                    error: 'Insufficient role level',
                    required: roles,
                    userRole: userRole
                });
            }
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
}

// Create role manager instance
const roleManager = new RoleManager();

// Express router for role management endpoints
const router = express.Router();

// Get all roles and permissions
router.get('/roles', requirePermission('role.manage'), (req, res) => {
    res.json({
        roles: roleManager.getAllRoles(),
        categories: roleManager.getPermissionsByCategory()
    });
});

// Update role permissions
router.put('/roles/:roleKey', requirePermission('role.manage'), (req, res) => {
    const { roleKey } = req.params;
    const { permissions } = req.body;

    if (!roleManager.roles[roleKey]) {
        return res.status(404).json({ error: 'Role not found' });
    }

    // Update permissions
    roleManager.roles[roleKey].permissions = permissions;
    
    res.json({ 
        message: 'Role permissions updated successfully',
        role: roleManager.roles[roleKey]
    });
});

// Create new role
router.post('/roles', requirePermission('role.manage'), (req, res) => {
    const { roleKey, roleName, permissions } = req.body;

    if (roleManager.createRole(roleKey, roleName, permissions)) {
        res.status(201).json({ 
            message: 'Role created successfully',
            role: roleManager.roles[roleKey]
        });
    } else {
        res.status(400).json({ error: 'Role already exists' });
    }
});

// Delete role
router.delete('/roles/:roleKey', requirePermission('role.manage'), (req, res) => {
    const { roleKey } = req.params;

    if (roleManager.deleteRole(roleKey)) {
        res.json({ message: 'Role deleted successfully' });
    } else {
        res.status(400).json({ error: 'Cannot delete this role' });
    }
});

// Check user permission
router.post('/check-permission', (req, res) => {
    const { permission, resource, action, resourceOwnerId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userRole = decoded.role || 'user';
        const userId = decoded.userId;

        let hasAccess = false;

        if (permission) {
            hasAccess = roleManager.hasPermission(userRole, permission);
        } else if (resource && action) {
            hasAccess = roleManager.canAccessResource(userRole, resource, action, resourceOwnerId, userId);
        }

        res.json({ 
            hasAccess,
            userRole,
            userId
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Get user permissions
router.get('/user-permissions', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const userRole = decoded.role || 'user';

        res.json({
            role: userRole,
            permissions: roleManager.getRolePermissions(userRole),
            user: {
                id: decoded.userId,
                email: decoded.email,
                role: userRole
            }
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = {
    RoleManager,
    roleManager,
    requirePermission,
    requireAnyPermission,
    requireRole,
    router
};
