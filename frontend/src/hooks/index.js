/**
 * Custom React Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { urlService, analyticsService } from '../services/urlService.js';
import toast from 'react-hot-toast';

// ─── useUrls: fetch and manage URL list ──────────────────────────────────────
export const useUrls = (params = {}) => {
  const [urls, setUrls]         = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  const fetchUrls = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await urlService.getAll(params);
      setUrls(res.data.data.urls);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch URLs');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const deleteUrl = useCallback(async (id) => {
    try {
      await urlService.delete(id);
      setUrls((prev) => prev.filter((u) => u._id !== id));
      toast.success('URL deleted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }, []);

  const addUrl = useCallback((newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  }, []);

  const updateUrl = useCallback((id, updated) => {
    setUrls((prev) => prev.map((u) => (u._id === id ? { ...u, ...updated } : u)));
  }, []);

  return { urls, pagination, isLoading, error, refetch: fetchUrls, deleteUrl, addUrl, updateUrl };
};

// ─── useAnalyticsOverview ────────────────────────────────────────────────────
export const useAnalyticsOverview = () => {
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsService.getOverview()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load overview'))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
};

// ─── useUrlAnalytics ─────────────────────────────────────────────────────────
export const useUrlAnalytics = (shortCode) => {
  const [data, setData]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!shortCode) return;
    setIsLoading(true);
    analyticsService.getUrlAnalytics(shortCode)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setIsLoading(false));
  }, [shortCode]);

  return { data, isLoading, error };
};

// ─── useClipboard ─────────────────────────────────────────────────────────────
export const useClipboard = (timeout = 2000) => {
  const [copiedId, setCopiedId] = useState(null);

  const copy = useCallback(async (text, id = 'default') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), timeout);
    } catch {
      toast.error('Failed to copy');
    }
  }, [timeout]);

  return { copy, copiedId, isCopied: (id) => copiedId === id };
};

// ─── useDebounce ─────────────────────────────────────────────────────────────
export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
