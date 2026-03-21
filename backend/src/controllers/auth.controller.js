/**
 * Auth Controller
 * Handles all authentication: signup, login, Google OAuth, refresh tokens, logout
 */

import User from '../models/user.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from '../utils/jwt.utils.js';
import logger from '../utils/logger.js';

/**
 * POST /api/auth/signup
 * Register a new user with email and password
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user (password hashed via pre-save hook in model)
    const user = await User.create({ name, email, password, authProvider: 'local' });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token for rotation
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Send refresh token as HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password (not selected by default)
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check account lock
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account locked due to too many failed attempts. Try again in 2 hours.',
      });
    }

    // Google-only accounts can't use password login
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google login. Please sign in with Google.',
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Reset attempts on successful login
    await user.resetLoginAttempts();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Issue new access token using refresh token (cookie)
 */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found.',
      });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token. Please login again.',
      });
    }

    // Rotate refresh token (token rotation for security)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Clear tokens and invalidate session
 */
export const logout = async (req, res, next) => {
  try {
    // Clear stored refresh token
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    }

    clearRefreshTokenCookie(res);

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role,
        authProvider: req.user.authProvider,
        createdAt: req.user.createdAt,
      },
    },
  });
};

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback - issue JWT tokens
 */
export const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    // Redirect to frontend with access token in URL hash
    // Frontend will extract and store it, then remove from URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback#token=${accessToken}`);
  } catch (error) {
    next(error);
  }
};
