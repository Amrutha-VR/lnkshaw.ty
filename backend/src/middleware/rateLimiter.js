/**
 * Rate Limiting Middleware
 * Protects against brute force and DDoS attacks
 */

import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// Standard response when rate limited
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
  });
};

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,   // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
  handler: rateLimitHandler,
  skip: (req) => req.path === '/api/health', // Skip health check
});

/**
 * Stricter auth rate limiter (brute force protection)
 * 10 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Speed limiter for redirect endpoint
 * Slows down responses after 50 requests (anti-spam)
 */
export const redirectSpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => hits * 100, // Add 100ms per request after threshold
});

/**
 * URL creation limiter
 * 20 URLs per hour per user
 */
export const urlCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  handler: rateLimitHandler,
});
