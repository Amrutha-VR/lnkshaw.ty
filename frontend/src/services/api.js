/**
 * Axios API Instance
 * Centralized HTTP client with base URL and credential support
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Send cookies (for refresh token)
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export default api;
