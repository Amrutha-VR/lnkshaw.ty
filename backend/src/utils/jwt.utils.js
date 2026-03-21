/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

import jwt from 'jsonwebtoken';

/**
 * Generate access token (short-lived, 15 minutes)
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate refresh token (long-lived, 7 days)
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Set refresh token as HTTP-only cookie
 * HTTP-only cookies are not accessible via JavaScript (XSS protection)
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,             // Not accessible via JS
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',         // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/auth',          // Only sent to auth endpoints
  });
};

/**
 * Clear refresh token cookie
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
  });
};
