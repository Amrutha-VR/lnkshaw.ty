// ─── auth.routes.js ───────────────────────────────────────────────────────────
import express from 'express';
import passport from 'passport';
import { signup, login, logout, refreshToken, getMe, googleCallback } from '../controllers/auth.controller.js';
import { signupValidation, loginValidation } from '../middleware/validation.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.post('/refresh', refreshToken);
router.get('/me', protect, getMe);

// Google OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  googleCallback
);

export default router;
