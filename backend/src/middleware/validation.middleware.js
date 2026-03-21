/**
 * Validation Middleware
 * Input validation using express-validator
 * Prevents XSS, injection, and bad data from reaching controllers
 */

import { body, param, validationResult } from 'express-validator';
import xss from 'xss';

/**
 * Run validation rules and return errors if any
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Sanitize string against XSS attacks
 */
const sanitizeStr = (value) => (value ? xss(value.trim()) : value);

// ─────────────────────────────────────────────
// AUTH VALIDATION RULES
// ─────────────────────────────────────────────

export const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .customSanitizer(sanitizeStr),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),

  validate,
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate,
];

// ─────────────────────────────────────────────
// URL VALIDATION RULES
// ─────────────────────────────────────────────

export const createUrlValidation = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL (must start with http:// or https://)'),

  body('customAlias')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Custom alias must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Alias can only contain letters, numbers, hyphens, and underscores')
    .customSanitizer(sanitizeStr),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .customSanitizer(sanitizeStr),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),

  validate,
];

export const updateUrlValidation = [
  body('originalUrl')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please provide a valid URL'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .customSanitizer(sanitizeStr),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),

  validate,
];

export const shortCodeParam = [
  param('shortCode')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid short code format'),

  validate,
];
