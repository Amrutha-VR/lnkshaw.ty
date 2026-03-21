import express from 'express';
import { redirectToUrl } from '../controllers/redirect.controller.js';
import { redirectSpeedLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Short code redirect - must match alphanumeric + hyphens/underscores
router.get('/:shortCode([a-zA-Z0-9_-]+)', redirectSpeedLimiter, redirectToUrl);

export default router;
