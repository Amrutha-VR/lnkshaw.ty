/**
 * URL Utilities
 * Short code generation, URL validation, QR code generation
 */

import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import URLModel from '../models/url.model.js';

// Reserved short codes that can't be used as aliases
const RESERVED_CODES = [
  'api', 'auth', 'admin', 'dashboard', 'login', 'signup',
  'register', 'logout', 'health', 'docs', 'help', 'about',
  'contact', 'privacy', 'terms', 'analytics',
];

/**
 * Validate if a string is a valid URL
 */
export const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

/**
 * Generate a unique short code using nanoid
 * Retries up to 5 times to avoid collisions
 */
export const generateUniqueShortCode = async (length = 7) => {
  const MAX_RETRIES = 5;

  for (let i = 0; i < MAX_RETRIES; i++) {
    // nanoid generates URL-safe random strings
    const code = nanoid(length);

    // Check database for collision
    const existing = await URLModel.findOne({ shortCode: code });
    if (!existing) return code;
  }

  // If all retries fail (extremely unlikely), increase length
  return nanoid(length + 2);
};

/**
 * Validate a custom alias
 * Returns { valid: boolean, message: string }
 */
export const validateCustomAlias = async (alias) => {
  // Check reserved words
  if (RESERVED_CODES.includes(alias.toLowerCase())) {
    return { valid: false, message: 'This alias is reserved. Please choose another.' };
  }

  // Check format (alphanumeric, hyphens, underscores only)
  if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
    return { valid: false, message: 'Alias can only contain letters, numbers, hyphens, and underscores.' };
  }

  if (alias.length < 3 || alias.length > 50) {
    return { valid: false, message: 'Alias must be between 3 and 50 characters.' };
  }

  // Check if already taken
  const existing = await URLModel.findOne({ shortCode: alias.toLowerCase() });
  if (existing) {
    return { valid: false, message: 'This alias is already taken. Please choose another.' };
  }

  return { valid: true, message: 'Alias is available!' };
};

/**
 * Generate QR code as base64 data URL
 */
export const generateQRCode = async (url) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',  // Dark color
        light: '#ffffff', // Background
      },
      errorCorrectionLevel: 'M',
    });
    return qrDataUrl;
  } catch (error) {
    throw new Error('QR code generation failed');
  }
};

/**
 * Sanitize URL - prevent javascript: and other dangerous protocols
 */
export const sanitizeUrl = (url) => {
  const trimmed = url.trim();
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lower = trimmed.toLowerCase();

  if (dangerousProtocols.some((p) => lower.startsWith(p))) {
    throw new Error('URL protocol not allowed');
  }

  // Ensure http/https
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return 'https://' + trimmed;
  }

  return trimmed;
};
