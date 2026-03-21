/**
 * Analytics Controller
 * Provides click stats, daily trends, device breakdown, and recent visits
 */

import URL from '../models/url.model.js';
import Visit from '../models/analytics.model.js';

/**
 * GET /api/analytics/:shortCode
 * Get full analytics for a specific URL (owner only)
 */
export const getUrlAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await URL.findOne({ shortCode, userId: req.user._id, isActive: true });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    const [
      totalClicks,
      dailyClicks,
      deviceBreakdown,
      browserBreakdown,
      countryBreakdown,
      recentVisits,
      osBreakdown,
      hourlyBreakdown,
    ] = await Promise.all([
      // Total click count
      Visit.countDocuments({ urlId: url._id }),

      // Daily clicks for the last 30 days
      Visit.aggregate([
        {
          $match: {
            urlId: url._id,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        { $group: { _id: '$visitDate', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),

      // Device type breakdown
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
      ]),

      // Browser breakdown
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
      ]),

      // Country breakdown
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { country: '$_id', count: 1, _id: 0 } },
      ]),

      // Recent 20 visits
      Visit.find({ urlId: url._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .select('country city browser deviceType os referrer createdAt visitDate')
        .lean(),

      // OS breakdown
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
      ]),

      // Hourly distribution (which hours get most clicks)
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$visitHour', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { hour: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    // Fill in missing days with 0 clicks (for complete chart)
    const filledDailyClicks = fillMissingDays(dailyClicks, 30);

    res.json({
      success: true,
      data: {
        url: {
          originalUrl: url.originalUrl,
          shortCode: url.shortCode,
          shortUrl: `${process.env.APP_URL}/${url.shortCode}`,
          title: url.title,
          createdAt: url.createdAt,
          expiresAt: url.expiresAt,
          lastVisitedAt: url.lastVisitedAt,
        },
        analytics: {
          totalClicks,
          dailyClicks: filledDailyClicks,
          deviceBreakdown,
          browserBreakdown,
          countryBreakdown,
          recentVisits,
          osBreakdown,
          hourlyBreakdown,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/public/:shortCode
 * Public analytics page (no auth required)
 */
export const getPublicAnalytics = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await URL.findOne({ shortCode, isActive: true });
    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    const [totalClicks, dailyClicks, deviceBreakdown, countryBreakdown] = await Promise.all([
      Visit.countDocuments({ urlId: url._id }),
      Visit.aggregate([
        {
          $match: {
            urlId: url._id,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        { $group: { _id: '$visitDate', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
      ]),
      Visit.aggregate([
        { $match: { urlId: url._id } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { country: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        shortCode: url.shortCode,
        shortUrl: `${process.env.APP_URL}/${url.shortCode}`,
        createdAt: url.createdAt,
        totalClicks,
        dailyClicks: fillMissingDays(dailyClicks, 30),
        deviceBreakdown,
        countryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/overview
 * Dashboard overview stats for the current user
 */
export const getUserOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      totalUrls,
      totalClicks,
      topUrls,
      recentActivity,
      dailyClicksOverall,
    ] = await Promise.all([
      URL.countDocuments({ userId, isActive: true }),
      Visit.countDocuments({ userId }),
      URL.find({ userId, isActive: true })
        .sort({ clickCount: -1 })
        .limit(5)
        .select('shortCode originalUrl title clickCount lastVisitedAt'),
      Visit.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('shortCode country browser deviceType createdAt'),
      Visit.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        { $group: { _id: '$visitDate', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { date: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalUrls,
        totalClicks,
        topUrls: topUrls.map((u) => ({
          ...u.toJSON(),
          shortUrl: `${process.env.APP_URL}/${u.shortCode}`,
        })),
        recentActivity,
        dailyClicksOverall: fillMissingDays(dailyClicksOverall, 7),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fill missing days with 0 clicks for a complete chart dataset
 */
const fillMissingDays = (data, days) => {
  const result = [];
  const map = Object.fromEntries(data.map((d) => [d.date, d.count]));

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({ date: dateStr, count: map[dateStr] || 0 });
  }

  return result;
};
