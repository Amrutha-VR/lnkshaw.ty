/**
 * URL Controller
 * Full CRUD for shortened URLs + bulk CSV upload
 */

import URL from '../models/url.model.js';
import Visit from '../models/analytics.model.js';
import {
  generateUniqueShortCode,
  validateCustomAlias,
  generateQRCode,
  sanitizeUrl,
} from '../utils/url.utils.js';
import logger from '../utils/logger.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

/**
 * POST /api/urls
 * Create a new shortened URL
 */
export const createUrl = async (req, res, next) => {
  try {
    let { originalUrl, customAlias, title, expiresAt } = req.body;

    // Sanitize URL (check for dangerous protocols)
    try {
      originalUrl = sanitizeUrl(originalUrl);
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }

    // Determine short code (custom alias or auto-generated)
    let shortCode;
    let isCustomAlias = false;

    if (customAlias) {
      const validation = await validateCustomAlias(customAlias);
      if (!validation.valid) {
        return res.status(409).json({ success: false, message: validation.message });
      }
      shortCode = customAlias.toLowerCase();
      isCustomAlias = true;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    // Generate QR code for the short URL
    const shortUrl = `${process.env.APP_URL}/${shortCode}`;
    const qrCode = await generateQRCode(shortUrl);

    // Create URL document
    const urlDoc = await URL.create({
      originalUrl,
      shortCode,
      userId: req.user._id,
      title: title || '',
      isCustomAlias,
      expiresAt: expiresAt || null,
      qrCode,
    });

    logger.info(`URL created: ${shortCode} -> ${originalUrl} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'Short URL created successfully!',
      data: {
        url: {
          id: urlDoc._id,
          originalUrl: urlDoc.originalUrl,
          shortCode: urlDoc.shortCode,
          shortUrl,
          title: urlDoc.title,
          clickCount: urlDoc.clickCount,
          expiresAt: urlDoc.expiresAt,
          isCustomAlias: urlDoc.isCustomAlias,
          createdAt: urlDoc.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/urls
 * Get all URLs for the authenticated user (with pagination)
 */
export const getUserUrls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = { userId: req.user._id, isActive: true };
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    const [urls, total] = await Promise.all([
      URL.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      URL.countDocuments(query),
    ]);

    // Add full short URL and expiry status
    const enrichedUrls = urls.map((url) => ({
      ...url,
      shortUrl: `${process.env.APP_URL}/${url.shortCode}`,
      isExpired: url.expiresAt ? new Date() > url.expiresAt : false,
    }));

    res.json({
      success: true,
      data: {
        urls: enrichedUrls,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/urls/:id
 * Get a single URL by ID (owner only)
 */
export const getUrlById = async (req, res, next) => {
  try {
    const url = await URL.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true,
    });

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    res.json({
      success: true,
      data: {
        url: {
          ...url.toJSON(),
          shortUrl: `${process.env.APP_URL}/${url.shortCode}`,
          isExpired: url.isExpired,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/urls/:id/qr
 * Get QR code for a URL
 */
export const getQrCode = async (req, res, next) => {
  try {
    const url = await URL.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select('+qrCode');

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    // Generate if not stored
    if (!url.qrCode) {
      const shortUrl = `${process.env.APP_URL}/${url.shortCode}`;
      url.qrCode = await generateQRCode(shortUrl);
      await url.save();
    }

    res.json({ success: true, data: { qrCode: url.qrCode } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/urls/:id
 * Update URL (original URL, title, expiry)
 */
export const updateUrl = async (req, res, next) => {
  try {
    const { originalUrl, title, expiresAt } = req.body;

    const url = await URL.findOne({ _id: req.params.id, userId: req.user._id, isActive: true });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    // Update fields if provided
    if (originalUrl) {
      try {
        url.originalUrl = sanitizeUrl(originalUrl);
      } catch (e) {
        return res.status(400).json({ success: false, message: e.message });
      }
    }
    if (title !== undefined) url.title = title;
    if (expiresAt !== undefined) url.expiresAt = expiresAt || null;

    await url.save();

    res.json({
      success: true,
      message: 'URL updated successfully.',
      data: {
        url: {
          ...url.toJSON(),
          shortUrl: `${process.env.APP_URL}/${url.shortCode}`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/urls/:id
 * Soft-delete a URL (sets isActive to false)
 */
export const deleteUrl = async (req, res, next) => {
  try {
    const url = await URL.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    logger.info(`URL deleted: ${url.shortCode} by user ${req.user._id}`);

    res.json({ success: true, message: 'URL deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/urls/bulk
 * Bulk create URLs from CSV upload
 * CSV format: originalUrl, customAlias (optional), title (optional)
 */
export const bulkCreateUrls = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV file.' });
    }

    const results = [];
    const errors = [];
    const rows = [];

    // Parse CSV from buffer
    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(csv({ headers: ['originalUrl', 'customAlias', 'title'], skipLines: 1 }))
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    // Limit bulk upload size
    if (rows.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'CSV cannot exceed 100 URLs per upload.',
      });
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        let originalUrl = sanitizeUrl(row.originalUrl?.trim());
        const shortCode = row.customAlias?.trim()
          ? row.customAlias.toLowerCase()
          : await generateUniqueShortCode();

        const url = await URL.create({
          originalUrl,
          shortCode,
          userId: req.user._id,
          title: row.title?.trim() || '',
          isCustomAlias: !!row.customAlias?.trim(),
        });

        results.push({
          row: i + 1,
          shortCode,
          shortUrl: `${process.env.APP_URL}/${shortCode}`,
          originalUrl,
        });
      } catch (err) {
        errors.push({ row: i + 1, error: err.message, data: row });
      }
    }

    res.status(207).json({
      success: true,
      message: `Processed ${rows.length} URLs: ${results.length} created, ${errors.length} failed.`,
      data: { created: results, errors },
    });
  } catch (error) {
    next(error);
  }
};
