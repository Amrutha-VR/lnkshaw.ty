# 🔗 LinkSnap — URL Shortener with Analytics

> A production-grade, full-stack URL shortener with real-time analytics, Google OAuth, QR code generation, and a beautiful Gold + Pink dashboard.

**This project is a part of a hackathon run by https://katomaran.com**

---

## ✨ Features

- **URL Shortening** — Generate short codes (nanoid) or custom aliases
- **Analytics** — Click counts, device/browser/OS/country breakdown, daily trends
- **Google OAuth** — One-click sign-in via Google
- **QR Code** — Auto-generated for every link, downloadable
- **Expiry Dates** — Set links to auto-expire
- **Bulk Upload** — Import up to 100 URLs via CSV
- **Edit Links** — Update destination URL, title, or expiry
- **Public Analytics** — Share a public stats page for any link
- **JWT Auth** — Secure access + refresh token rotation
- **Rate Limiting** — Brute-force and DDoS protection
- **Responsive** — Works beautifully on mobile and desktop

---

## 🛠️ Tech Stack

| Layer        | Technology |
|--------------|-----------|
| Frontend     | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend      | Node.js, Express, Passport.js |
| Database     | MongoDB (Mongoose) |
| Auth         | JWT (access + refresh), Google OAuth2 |
| Security     | Helmet, bcrypt, rate limiting, input sanitization |
| QR           | qrcode npm package |
| Deployment   | Vercel (frontend) + Render (backend) |

---

## 📁 Folder Structure

```
linksnap/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js        # MongoDB connection
│   │   │   └── passport.js        # OAuth + JWT strategies
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── url.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   └── redirect.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT protection + ownership
│   │   │   ├── rateLimiter.js
│   │   │   ├── validation.middleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── url.model.js
│   │   │   └── analytics.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── url.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   └── redirect.routes.js
│   │   ├── utils/
│   │   │   ├── jwt.utils.js
│   │   │   ├── url.utils.js
│   │   │   └── logger.js
│   │   └── index.js               # App entry point
│   ├── .env.example
│   ├── render.yaml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       ├── DashboardLayout.jsx
│   │   │       ├── CreateUrlModal.jsx
│   │   │       └── Modals.jsx     # QR, Edit, Bulk upload
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── hooks/
│   │   │   └── index.js           # useUrls, useAnalytics, useClipboard
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── PublicAnalyticsPage.jsx
│   │   │   ├── OAuthCallbackPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── ExpiredPage.jsx
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance
│   │   │   └── urlService.js      # API call functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind + custom classes
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
│
├── docs/
│   └── API.md
├── .gitignore
└── README.md
```

---

## 🚀 Local Setup (Step by Step)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project (for OAuth)
- VSCode

---

### Step 1 — Clone and Install

```bash
git clone https://github.com/yourname/linksnap.git
cd linksnap

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### Step 2 — Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/linksnap
JWT_SECRET=your-64-char-random-secret
JWT_REFRESH_SECRET=your-other-64-char-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:5000
```

**Generating strong secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Step 3 — Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → Enable "Google+ API"
3. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (dev)
   - `https://your-backend.onrender.com/api/auth/google/callback` (prod)
6. Copy **Client ID** and **Client Secret** to your `.env`

---

### Step 4 — Frontend Environment

```bash
cd frontend
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5000
```

---

### Step 5 — Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → Server on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# → App on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) 🎉

---

## 🔒 Security Architecture

| Threat | Protection |
|--------|-----------|
| Password brute force | Rate limiting (10 req/15min on auth) + account lockout after 5 failures |
| SQL/NoSQL injection | `express-mongo-sanitize` + Mongoose schema validation |
| XSS | Helmet CSP headers + `xss` library sanitization |
| CSRF | `sameSite: strict` cookies + CORS whitelist |
| Token theft | Short-lived access tokens (15min) + HTTP-only refresh cookies |
| Session fixation | Refresh token rotation on every refresh |
| Dangerous URLs | Protocol allowlist (http/https only) |
| DDoS | `express-rate-limit` + `express-slow-down` |
| Secrets exposure | `.env` files, never committed to git |
| Ownership bypass | Ownership check middleware on all resource routes |

---

## ☁️ Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add all environment variables in the Render dashboard
6. Deploy!

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
4. Add environment variables:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
   - `VITE_APP_URL` = `https://your-backend.onrender.com`
5. Deploy!

6. Update your backend `.env` `FRONTEND_URL` with your Vercel URL
7. Update Google OAuth authorized URIs with your Render backend URL

---

## 📊 Database Schema

### Users
```
_id, name, email, password (hashed), googleId, avatar,
authProvider, isVerified, role, loginAttempts, lockUntil,
lastLoginAt, refreshToken, createdAt, updatedAt
```

### URLs
```
_id, originalUrl, shortCode (unique, indexed), userId (indexed),
title, clickCount, expiresAt (indexed), isActive, isCustomAlias,
qrCode, lastVisitedAt, createdAt, updatedAt
```

### Visits (Analytics)
```
_id, urlId (indexed), shortCode (indexed), userId,
ipAddress (anonymized), country, city, deviceType,
browser, os, referrer, userAgent, visitDate (indexed),
visitHour, createdAt
```

---

## 🏗️ Architecture Decisions

- **Soft delete** on URLs (isActive: false) preserves analytics history
- **Refresh token rotation** — each refresh invalidates the previous token
- **Denormalized clickCount** on URL document for fast dashboard queries without aggregation
- **Non-blocking analytics** — redirect happens instantly, analytics recorded async
- **IP anonymization** — only first 3 octets stored (privacy compliance)
- **nanoid** for short codes — URL-safe, no ambiguous characters, collision-resistant
- **QR codes stored as base64** to avoid regenerating on every request

---

## 🎥 Loom Demo Script

**Record a ~3 minute demo covering:**

1. **Open landing page** — show the beautiful UI, explain what the app does (30s)
2. **Sign up** with email, show password strength checker (20s)
3. **Create a short URL** with a custom alias and expiry date (30s)
4. **Show the dashboard** — copy button, QR code, edit modal (30s)
5. **Click the short link** in a new tab — show the redirect (10s)
6. **Open analytics** — show the charts, device breakdown, country map, recent visits (45s)
7. **Bulk CSV upload** — drag and drop CSV, show results (20s)
8. **Sign in with Google** — show OAuth flow (15s)
9. **Public analytics page** — show shareable stats URL (10s)

**Pro tip:** Use a URL that already has some clicks (visit it a few times yourself before recording) so the charts look populated!

---

## 📝 Assumptions

- Users must be authenticated to create/manage URLs (no anonymous shortening)
- Geolocation is best-effort (local/private IPs won't resolve to a country)
- QR codes are generated server-side and cached in the database
- CSV bulk upload processes rows sequentially (not in parallel) to manage DB load
- Refresh tokens are stored in the database (not as signed cookies) to enable logout/revocation
- The app URL (for short links) is the backend URL, not the frontend URL

---

*Built with 💛 for the Katomaran Hackathon*
