const logger = require('../utils/logger');

/**
 * Middleware to restrict access based on user role assignments.
 * Resolves architectural flaw returning 501 Not Implemented on unauthenticated states.
 */
exports.requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    // 1. Handle missing authentication context (Semantic Fix: 401 Unauthorized)
    if (!req.user) {
      logger.error('Access verification failed: Request missing authentication passport tracking frame', {
        path: req.originalUrl,
        ip: req.ip,
        action: 'REJECT_UNAUTHENTICATED'
      });
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Authorization framework could not identify identity context.'
      });
    }

    // 2. Handle role verification mismatch (Semantic Fix: 403 Forbidden)
    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      logger.warn('Role verification rejected access token parameters', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.originalUrl,
        action: 'REJECT_UNAUTHORIZED_ROLE'
      });
      return res.status(403).json({
        success: false,
        message: 'Access Denied. Identity parameters possess insufficient authorization privileges.'
      });
    }

    // Context valid, move downstream
    next();
  };
};
