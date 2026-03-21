import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import { urlCreationLimiter } from '../middleware/rateLimiter.js';
import { createUrlValidation, updateUrlValidation } from '../middleware/validation.middleware.js';
import {
  createUrl, getUserUrls, getUrlById, updateUrl,
  deleteUrl, bulkCreateUrls, getQrCode,
} from '../controllers/url.controller.js';

const router = express.Router();
// Store CSV in memory (max 1MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } });

// All URL routes require authentication
router.use(protect);

router.post('/', urlCreationLimiter, createUrlValidation, createUrl);
router.get('/', getUserUrls);
router.get('/:id', getUrlById);
router.get('/:id/qr', getQrCode);
router.patch('/:id', updateUrlValidation, updateUrl);
router.delete('/:id', deleteUrl);
router.post('/bulk/csv', upload.single('file'), bulkCreateUrls);

export default router;
