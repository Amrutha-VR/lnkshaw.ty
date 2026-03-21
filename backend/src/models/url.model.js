/**
 * URL Model
 * Stores shortened URLs with metadata
 * Supports custom aliases, expiry dates, and click tracking
 */

import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    // The original long URL
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    // Short code (e.g., "abc123") or custom alias (e.g., "my-blog")
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Short code must be at least 3 characters'],
      maxlength: [50, 'Short code too long'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Short code can only contain letters, numbers, hyphens, underscores'],
    },
    // The user who created this URL (null for anonymous if allowed)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Optional title/label for the URL
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title too long'],
    },
    // Total number of clicks (denormalized for performance)
    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Optional expiry date (null = never expires)
    expiresAt: {
      type: Date,
      default: null,
      index: true, // Index for expiry queries
    },
    // Is this URL active? (soft delete support)
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Custom alias flag (to distinguish from auto-generated)
    isCustomAlias: {
      type: Boolean,
      default: false,
    },
    // QR code data URL (base64 stored for quick retrieval)
    qrCode: {
      type: String,
      select: false, // Don't return by default (large field)
    },
    // Last time this URL was visited
    lastVisitedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// INDEXES for performance
// ─────────────────────────────────────────────
urlSchema.index({ shortCode: 1 });           // Fast redirect lookup
urlSchema.index({ userId: 1, createdAt: -1 }); // Dashboard listing
urlSchema.index({ expiresAt: 1 }, { sparse: true }); // Expiry cleanup

// ─────────────────────────────────────────────
// VIRTUAL: Full short URL
// ─────────────────────────────────────────────
urlSchema.virtual('shortUrl').get(function () {
  return `${process.env.APP_URL}/${this.shortCode}`;
});

// ─────────────────────────────────────────────
// VIRTUAL: Is this URL expired?
// ─────────────────────────────────────────────
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// ─────────────────────────────────────────────
// INSTANCE METHOD: Increment click count
// ─────────────────────────────────────────────
urlSchema.methods.recordClick = async function () {
  this.clickCount += 1;
  this.lastVisitedAt = new Date();
  await this.save();
};

const URL = mongoose.model('URL', urlSchema);
export default URL;
