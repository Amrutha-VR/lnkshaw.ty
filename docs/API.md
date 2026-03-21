# LinkSnap API Documentation

Base URL: `https://your-backend.onrender.com/api`

All protected routes require:
```
Authorization: Bearer <access_token>
```

---

## Authentication

### POST /auth/signup
Register a new user.

**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass1"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "user": { "id": "...", "name": "Jane Smith", "email": "jane@example.com" }
  }
}
```

---

### POST /auth/login
Login with email and password.

**Body:** `{ "email": "...", "password": "..." }`

**Response 200:** Same as signup

---

### POST /auth/refresh
Get new access token using refresh token (HTTP-only cookie).

**Response 200:** `{ "success": true, "data": { "accessToken": "eyJ..." } }`

---

### POST /auth/logout  🔒
Clear session and refresh token.

---

### GET /auth/me  🔒
Get current user profile.

---

### GET /auth/google
Redirect to Google OAuth flow.

### GET /auth/google/callback
Google OAuth callback — redirects to frontend with token in hash.

---

## URL Management  🔒 (all protected)

### POST /urls
Create a short URL.

**Body:**
```json
{
  "originalUrl": "https://very-long-url.com/path",
  "customAlias": "my-link",        // optional
  "title": "My Campaign Link",     // optional
  "expiresAt": "2025-12-31T23:59:00.000Z" // optional ISO8601
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "url": {
      "id": "...",
      "originalUrl": "https://...",
      "shortCode": "my-link",
      "shortUrl": "https://your-app.onrender.com/my-link",
      "clickCount": 0,
      "createdAt": "..."
    }
  }
}
```

---

### GET /urls
Get all user's URLs with pagination.

**Query params:**
- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `search` — filter by URL/title/code
- `sortBy` — `createdAt | clickCount`
- `sortOrder` — `asc | desc`

---

### GET /urls/:id
Get single URL by ID.

---

### GET /urls/:id/qr
Get QR code data URL (base64 PNG).

---

### PATCH /urls/:id
Update URL.

**Body:** `{ "originalUrl": "...", "title": "...", "expiresAt": "..." }`

---

### DELETE /urls/:id
Soft-delete URL (sets isActive: false).

---

### POST /urls/bulk/csv
Upload CSV to create multiple URLs.

**Content-Type:** `multipart/form-data`
**Field:** `file` (CSV max 1MB, max 100 rows)

**CSV Format:**
```
originalUrl,customAlias,title
https://example.com,my-link,My Link
https://other.com,,Another Link
```

**Response 207:**
```json
{
  "success": true,
  "message": "Processed 2 URLs: 2 created, 0 failed.",
  "data": {
    "created": [{ "row": 1, "shortCode": "my-link", "shortUrl": "..." }],
    "errors": []
  }
}
```

---

## Analytics  🔒

### GET /analytics/overview
Dashboard overview for authenticated user.

**Response:**
```json
{
  "data": {
    "totalUrls": 42,
    "totalClicks": 1337,
    "topUrls": [...],
    "recentActivity": [...],
    "dailyClicksOverall": [{ "date": "2024-01-01", "count": 15 }]
  }
}
```

---

### GET /analytics/:shortCode  🔒
Full analytics for a specific URL (owner only).

**Response:**
```json
{
  "data": {
    "url": { ... },
    "analytics": {
      "totalClicks": 500,
      "dailyClicks": [{ "date": "...", "count": 12 }],
      "deviceBreakdown": [{ "name": "mobile", "value": 320 }],
      "browserBreakdown": [{ "name": "Chrome", "value": 250 }],
      "countryBreakdown": [{ "country": "US", "count": 180 }],
      "recentVisits": [...],
      "osBreakdown": [...],
      "hourlyBreakdown": [{ "hour": 14, "count": 45 }]
    }
  }
}
```

---

### GET /analytics/public/:shortCode
Public analytics (no auth required).

---

## Redirect

### GET /:shortCode
Redirects to original URL (302). Records analytics.

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [{ "field": "email", "message": "Invalid email" }]  // validation only
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 207  | Multi-Status (bulk operations) |
| 302  | Redirect |
| 400  | Bad Request / Validation error |
| 401  | Unauthenticated |
| 403  | Forbidden (wrong owner) |
| 404  | Not Found |
| 409  | Conflict (duplicate) |
| 423  | Locked (account brute-force locked) |
| 429  | Rate limited |
| 500  | Internal Server Error |
