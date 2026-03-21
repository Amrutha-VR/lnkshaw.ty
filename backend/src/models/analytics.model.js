/**
 * Analytics Model
 * Tracks individual visits to shortened URLs
 * Stores device, browser, location, and timestamp data
 */

import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema(
  {
    // Reference to the URL being tracked
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'URL',
      required: true,
      index: true,
    },
    // The short code (for quick querying without join)
    shortCode: {
      type: String,
      required: true,
      index: true,
    },
    // Owner of the URL (for authorization checks)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // IP address (hashed/partial for privacy)
    ipAddress: String,
    // Country code from geolocation (e.g., "US", "IN")
    country: String,
    // City from geolocation
    city: String,
    // Device type (mobile, tablet, desktop)
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    // Browser name (e.g., "Chrome", "Safari")
    browser: String,
    // Operating system (e.g., "Windows", "macOS", "Android")
    os: String,
    // Referrer URL (where they came from)
    referrer: String,
    // User agent string (raw, for debugging)
    userAgent: String,
    // Date only (for grouping by day in charts) - YYYY-MM-DD
    visitDate: {
      type: String,
      index: true,
    },
    // Hour of day (0-23) for hourly analytics
    visitHour: Number,
  },
  {
    timestamps: true, // createdAt = exact visit timestamp
  }
);

// ─────────────────────────────────────────────
// COMPOUND INDEXES for analytics queries
// ─────────────────────────────────────────────
visitSchema.index({ urlId: 1, createdAt: -1 });       // Recent visits for a URL
visitSchema.index({ urlId: 1, visitDate: 1 });         // Daily click chart
visitSchema.index({ userId: 1, createdAt: -1 });       // User's overall analytics
visitSchema.index({ shortCode: 1, visitDate: 1 });     // Public analytics page

const Visit = mongoose.model('Visit', visitSchema);
export default Visit;
