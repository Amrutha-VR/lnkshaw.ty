/**
 * User Model
 * Stores user accounts for both local and OAuth users
 * Passwords are hashed before saving (via pre-save hook)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },
    googleId: {
      type: String,
      sparse: true, // Allow multiple null values (unique only for non-null)
    },
    avatar: String,
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Track failed login attempts for brute force protection
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    lastLoginAt: Date,
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// INDEXES for performance
// ─────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// ─────────────────────────────────────────────
// VIRTUAL: check if account is locked
// ─────────────────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─────────────────────────────────────────────
// PRE-SAVE HOOK: Hash password before saving
// ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on other updates)
  if (!this.isModified('password') || !this.password) return next();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ─────────────────────────────────────────────
// INSTANCE METHOD: Compare password
// ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// ─────────────────────────────────────────────
// INSTANCE METHOD: Increment login attempts (brute force protection)
// ─────────────────────────────────────────────
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

  // If lock expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

// ─────────────────────────────────────────────
// INSTANCE METHOD: Reset login attempts on success
// ─────────────────────────────────────────────
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLoginAt: new Date() },
    $unset: { lockUntil: 1 },
  });
};

const User = mongoose.model('User', userSchema);
export default User;
