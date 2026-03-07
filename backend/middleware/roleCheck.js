const logger = require('../utils/logger');

const roleCheck = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Role check failed: User ${req.user.email} (${req.user.role}) tried to access ${allowedRoles.join('/')}-only route`);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

module.exports = roleCheck;
