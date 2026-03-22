# LnkShaw.ty — URL Shortener with Analytics

> A full-stack URL shortener with real-time analytics, Google OAuth, QR code generation, custom aliases, and an editorial-style dashboard.

**🎥 Demo Video:** 
[click here](https://www.loom.com/share/510db4b3d41548989b110ee15ce3ced4)
---

## 📋 Project Description

LnkShaw.ty is a production-grade URL shortener built for the Katomaran Hackathon. Users sign up, paste long URLs, and get short trackable links instantly. Every click is recorded with device, browser, geolocation, and timestamp data all visualized in a clean analytics dashboard.

---

## 🗺️ Planning the App

### Problem
Long URLs are ugly, untrackable, and hard to share. Existing shorteners give you no ownership or analytics control.

### Solution
Build a self-hosted shortener where:
- Users own their links
- Every click is tracked in detail
- Analytics are visualized clearly
- Links can expire, have custom aliases, and generate QR codes

### Planning Steps
1. Define user stories — who uses this and why
2. Design database schema — Users, URLs, Visits
3. Plan all API endpoints — auth, CRUD, analytics, redirect
4. Design frontend routes — landing, login, signup, dashboard, analytics
5. Security checklist — hashing, JWT, rate limiting, sanitization
6. Build order — backend → frontend → integration → styling

---

## ✨ Features

### Mandatory
| Feature | Description |
|---|---|
| User signup and login | Email/password with bcrypt hashing |
| Protected routes | JWT middleware on all dashboard routes |
| URL ownership | Users only see and edit their own links |
| URL shortening | nanoid generates unique 7-char codes |
| Unique short codes | Collision detection before saving |
| Server-side redirect | Backend 302 redirect |
| URL validation | Frontend + backend validation |
| Dashboard | Full link management UI |
| Original URL, Short URL, Created date, Total clicks | All shown per link |
| Delete URL | Soft delete (preserves analytics history) |
| Copy short URL | One-click clipboard copy with confirmation |
| Click counting | Incremented on every redirect |
| Visit timestamps | Stored per visit in analytics collection |
| Analytics page | Per-link detailed breakdown |
| Total click count | Shown prominently |
| Last visited time | Shown in analytics |
| Recent visit history | Table of last 20 visits |
| Responsive design | Mobile and desktop |
| Loading / error / success states | Everywhere |
| Form validation | Real-time and on submit |

### Bonus Features
| Feature | Description |
|---|---|
| Google OAuth | Passport.js Google OAuth2 |
| Custom aliases | User-defined short codes |
| QR code generation | Auto-generated PNG per link |
| Expiry dates | Links stop working after set date |
| Geolocation tracking | Country + city via geoip-lite |
| Device tracking | Mobile / tablet / desktop |
| Browser + OS tracking | Chrome, Safari, Windows, Android etc |
| Daily click charts | 30-day area chart via Recharts |
| Public stats page | Shareable — no login needed |
| Edit destination URL | Change where a link points |
| Bulk CSV upload | Create up to 100 links from one file |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CLIENT (React + Vite)                   │
│  Landing → Login/Signup → Dashboard → Analytics         │
│  AuthContext (JWT) → Axios → REST API calls             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│               BACKEND (Node.js + Express)                │
│                                                          │
│  /api/auth      → Auth Controller (JWT + Google OAuth)  │
│  /api/urls      → URL Controller (CRUD + CSV upload)    │
│  /api/analytics → Analytics Controller (aggregations)   │
│  /:shortCode    → Redirect Controller (302 + tracking)  │
│                                                          │
│  Middleware: Helmet · CORS · Rate Limiter               │
│             Validation · Auth Guard · Ownership Check   │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│                    MongoDB Atlas                          │
│                                                          │
│  users   → Auth data, hashed passwords, OAuth IDs       │
│  urls    → Short codes, original URLs, click counts     │
│  visits  → Per-click analytics (device, geo, time)      │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

**Users:** `_id, name, email, password (bcrypt), googleId, avatar, authProvider, role, loginAttempts, lockUntil, refreshToken, createdAt`

**URLs:** `_id, originalUrl, shortCode (unique indexed), userId, title, clickCount, expiresAt, isActive, isCustomAlias, qrCode, lastVisitedAt, createdAt`

**Visits:** `_id, urlId, shortCode, userId, ipAddress (anonymized), country, city, deviceType, browser, os, referrer, visitDate, visitHour, createdAt`

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas free account
- Google Cloud Console project

### Step 1 — Clone
```bash
git clone https://github.com/Amrutha_VR/lnkshawty.git
cd lnkshawty
```

### Step 2 — Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env with your MongoDB URI, JWT secrets, Google OAuth keys
npm run dev
```

### Step 3 — Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api
# Set VITE_APP_URL=http://localhost:5000
npm run dev
```

### Step 4 — Open
```
http://localhost:5173
```

### Environment Variables (backend)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=64_char_random_string
JWT_REFRESH_SECRET=64_char_random_string
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5000
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=any_random_string
```

---

## 🔐 Security

| Threat | Solution |
|---|---|
| Brute force | Rate limiting + account lockout after 5 attempts |
| Weak passwords | Enforced regex validation |
| NoSQL injection | express-mongo-sanitize |
| XSS | Helmet CSP + xss library |
| CSRF | sameSite:strict cookies + CORS whitelist |
| Token theft | 15-min access tokens + HTTP-only refresh cookies |
| Token reuse | Refresh token rotation on every use |
| Dangerous URLs | http/https protocol allowlist |
| Secrets | All in .env, never committed |
| Ownership bypass | Middleware checks on every resource route |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + Google OAuth2 (Passport.js) |
| Short codes | nanoid |
| QR codes | qrcode |
| Analytics | ua-parser-js + geoip-lite |
| Security | Helmet, bcryptjs, express-rate-limit, express-mongo-sanitize, xss |

---

## 📌 Assumptions Made

1. Users must be authenticated to create or manage links — no anonymous shortening
2. Geolocation shows "Unknown" on localhost — works correctly on deployed version
3. Redirect uses HTTP 302 so browsers don't cache it and analytics always record
4. Analytics are recorded asynchronously — redirect speed is not affected
5. IP addresses are partially anonymized (last octet removed) for privacy
6. The short link domain is the backend URL (port 5000 locally)
7. Refresh tokens are stored in the database to allow server-side logout
8. CSV bulk upload is capped at 100 rows per upload to manage load

---

## 📁 Folder Structure

```
lnkshawty/
├── backend/src/
│   ├── config/         # MongoDB + Passport.js setup
│   ├── controllers/    # Auth, URL, Analytics, Redirect logic
│   ├── middleware/     # Auth guard, rate limiter, validation
│   ├── models/         # User, URL, Visit Mongoose schemas
│   ├── routes/         # Express route definitions
│   └── utils/          # JWT helpers, URL utils, Logger
├── frontend/src/
│   ├── components/     # Dashboard layout, modals
│   ├── contexts/       # AuthContext — global auth state
│   ├── hooks/          # useUrls, useAnalytics, useClipboard
│   ├── pages/          # All page components
│   └── services/       # Axios API service layer
└── docs/API.md         # Full REST API documentation
```

---

## 🎥 Demo Video

[Insert your Loom or YouTube link here]

The video demonstrates: signup, creating short links, the redirect working, analytics charts, QR code download, bulk CSV upload, Google OAuth, and the public analytics page.

---

> This project is a part of a hackathon run by https://katomaran.com
