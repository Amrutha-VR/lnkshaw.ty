/**
 * Authentication Middleware
 * Protects routes requiring authentication
 */

import passport from 'passport';
import { verifyAccessToken } from '../utils/jwt.utils.js';
import User from '../models/user.model.js';

/**
 * Protect routes - requires valid JWT
 * Attaches user to req.user
 */
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;

    // Fetch user (ensures account still exists)
    User.findById(decoded.userId)
      .select('-password -refreshToken')
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found. Please login again.',
          });
        }

        if (user.isLocked) {
          return res.status(423).json({
            success: false,
            message: 'Account temporarily locked due to too many failed login attempts.',
          });
        }

        req.user = user;
        next();
      })
      .catch(next);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.',
    });
  }
};

/**
 * Restrict to specific roles (e.g., admin)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

/**
 * Ownership check middleware
 * Ensures a user can only access their own resources
 */
export const checkOwnership = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    // Admin can access all
    if (req.user.role === 'admin') return next();

    // Check ownership
    if (resource.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only manage your own resources.',
      });
    }

    req.resource = resource;
    next();
  } catch (error) {
    next(error);
  }
};
