/**
 * Passport.js Configuration
 * Handles Google OAuth2 and JWT strategies
 */
import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.model.js';
import logger from '../utils/logger.js';

const configurePassport = () => {
  // ─── JWT Strategy ─────────────────────────────
  // Extracts JWT from Authorization Bearer header
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          const user = await User.findById(jwtPayload.userId).select('-password');
          if (!user) return done(null, false);
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // ─── Google OAuth Strategy ────────────────────
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last login
            user.lastLoginAt = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if email already registered (merge accounts)
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });
            if (user) {
              // Link Google account to existing email account
              user.googleId = profile.id;
              user.avatar = profile.photos?.[0]?.value;
              user.lastLoginAt = new Date();
              await user.save();
              return done(null, user);
            }
          }

          // Create new user from Google profile
          user = await User.create({
            googleId: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            isVerified: true, // Google accounts are pre-verified
            authProvider: 'google',
          });

          logger.info(`New Google OAuth user registered: ${email}`);
          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
};

export default configurePassport;
