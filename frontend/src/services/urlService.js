/**
 * URL Service
 * All API calls related to URL management
 */

import api from './api.js';

export const urlService = {
  // Create a new short URL
  create: (data) => api.post('/urls', data),

  // Get all user's URLs with optional filters
  getAll: (params = {}) => api.get('/urls', { params }),

  // Get single URL by ID
  getById: (id) => api.get(`/urls/${id}`),

  // Get QR code for URL
  getQrCode: (id) => api.get(`/urls/${id}/qr`),

  // Update a URL
  update: (id, data) => api.patch(`/urls/${id}`, data),

  // Delete (soft-delete) a URL
  delete: (id) => api.delete(`/urls/${id}`),

  // Bulk upload via CSV
  bulkUpload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/urls/bulk/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const analyticsService = {
  // Get overview stats for dashboard
  getOverview: () => api.get('/analytics/overview'),

  // Get detailed analytics for a specific URL
  getUrlAnalytics: (shortCode) => api.get(`/analytics/${shortCode}`),

  // Get public analytics (no auth)
  getPublicAnalytics: (shortCode) => api.get(`/analytics/public/${shortCode}`),
};
