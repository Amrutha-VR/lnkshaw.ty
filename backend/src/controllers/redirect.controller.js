/**
 * Redirect Controller
 * Handles short URL redirects and records visit analytics
 */

import URL from '../models/url.model.js';
import Visit from '../models/analytics.model.js';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import logger from '../utils/logger.js';

/**
 * GET /:shortCode
 * Redirect to original URL and record visit analytics
 */
export const redirectToUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Fast lookup - indexed by shortCode
    const url = await URL.findOne({ shortCode, isActive: true });

    if (!url) {
      // Redirect to frontend 404 page
      return res.redirect(`${process.env.FRONTEND_URL}/not-found`);
    }

    // Check if expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.redirect(`${process.env.FRONTEND_URL}/expired?code=${shortCode}`);
    }

    // ─── Record Analytics (non-blocking) ─────
    // We don't await this so the redirect is instant
    recordVisit(url, req).catch((err) =>
      logger.error('Analytics recording failed:', err)
    );

    // Update click count (non-blocking)
    URL.findByIdAndUpdate(url._id, {
      $inc: { clickCount: 1 },
      lastVisitedAt: new Date(),
    }).catch((err) => logger.error('Click count update failed:', err));

    // 301 = permanent redirect (cached by browsers)
    // 302 = temporary redirect (better for analytics, not cached)
    res.redirect(302, url.originalUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * Record a visit in the analytics collection
 * Extracts device, browser, OS, and location data
 */
const recordVisit = async (url, req) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = getClientIP(req);

    // Parse user agent for device/browser info
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    // Geolocate IP (returns null for private/local IPs)
    const geo = ip && !isPrivateIP(ip) ? geoip.lookup(ip) : null;

    // Get current date for daily aggregation
    const now = new Date();
    const visitDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    await Visit.create({
      urlId: url._id,
      shortCode: url.shortCode,
      userId: url.userId,
      ipAddress: hashIP(ip), // Partial hash for privacy
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      deviceType: getDeviceType(uaResult),
      browser: uaResult.browser?.name || 'Unknown',
      os: uaResult.os?.name || 'Unknown',
      referrer: req.headers.referer || req.headers.referrer || 'Direct',
      userAgent: userAgent.substring(0, 500), // Limit length
      visitDate,
      visitHour: now.getHours(),
    });
  } catch (error) {
    logger.error('Visit recording error:', error);
    throw error;
  }
};

/**
 * Get real client IP (handles proxies and load balancers)
 */
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
};

/**
 * Check if IP is a private/local address
 */
const isPrivateIP = (ip) => {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  );
};

/**
 * Anonymize IP address for privacy (keep first 3 octets only)
 * e.g., "192.168.1.45" -> "192.168.1.xxx"
 */
const hashIP = (ip) => {
  if (!ip) return 'unknown';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return 'unknown';
};

/**
 * Determine device type from parsed UA result
 */
const getDeviceType = (uaResult) => {
  const type = uaResult.device?.type;
  if (type === 'mobile') return 'mobile';
  if (type === 'tablet') return 'tablet';
  if (uaResult.device?.model) return 'mobile'; // Fallback
  return 'desktop';
};
