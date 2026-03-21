/**
 * LinkSnap Backend - Main Entry Point
 * Initializes Express app, middleware, routes, and database connection
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import passport from 'passport';

import connectDB from './config/database.js';
import configurePassport from './config/passport.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import urlRoutes from './routes/url.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import redirectRoutes from './routes/redirect.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// SECURITY MIDDLEWARE (applied first)
// ─────────────────────────────────────────────

// Helmet sets secure HTTP headers (XSS, clickjacking, MIME sniffing protection)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS - only allow requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Sanitize MongoDB queries to prevent NoSQL injection
app.use(mongoSanitize());

// ─────────────────────────────────────────────
// GENERAL MIDDLEWARE
// ─────────────────────────────────────────────

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression()); // Gzip responses
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

// Passport initialization
configurePassport();
app.use(passport.initialize());

// ─────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter); // Stricter limit on auth routes

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Short URL redirect (must come after API routes)
app.use('/', redirectRoutes);

// ─────────────────────────────────────────────
// ERROR HANDLING (always last)
// ─────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`🚀 LinkSnap server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

startServer();

export default app;
