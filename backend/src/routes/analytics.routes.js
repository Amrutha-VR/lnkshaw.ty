// ─── analytics.routes.js ──────────────────────────────────────────────────────
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getUrlAnalytics, getPublicAnalytics, getUserOverview } from '../controllers/analytics.controller.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/overview', protect, getUserOverview);
analyticsRouter.get('/public/:shortCode', getPublicAnalytics);
analyticsRouter.get('/:shortCode', protect, getUrlAnalytics);

export { analyticsRouter as default };
