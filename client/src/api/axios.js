import axios from 'axios';
import { notifyAuthStorageChanged } from '../utils/authStorageSync';

/**
 * Default `/api` — Vite dev proxy or Vercel rewrite (same origin as the app).
 * Works for `*.vercel.app`, preview deploys, and custom domains.
 *
 * Set `VITE_API_BASE_URL` only to an absolute http(s) URL for cross-origin APIs.
 * On Vercel with `vercel.json` rewrites: do not set VITE_API_BASE_URL to your Render URL
 * or cookies and `/auth/me` will break compared to local dev.
 */
function getApiBaseUrl() {
    const raw = import.meta.env.VITE_API_BASE_URL;
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (/^https?:\/\//i.test(trimmed)) {
            return trimmed.replace(/\/$/, '');
        }
    }
    return '/api';
}

const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor: attach Bearer token if present ───────────
// This is the cross-device fallback. Cookies work fine on localhost,
// but on other devices/phones the HTTP-only cookie may not travel through
// the Vite dev proxy correctly. Sending the token in the Authorization
// header solves this — the authMiddleware accepts BOTH cookie and Bearer.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        console.log(`[Axios] Request: ${config.method?.toUpperCase()} ${config.url} - (Auth: Bearer ${token.substring(0, 10)}...)`);
        if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${token}`);
        } else {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    } else {
        console.log(`[Axios] Request: ${config.method?.toUpperCase()} ${config.url} - (Auth: None)`);
    }
    return config;
});

// ── Response interceptor: handle 401s globally ────────────────────
api.interceptors.response.use(
    (response) => {
        // Guard: detect if the API accidentally returned HTML (proxy/rewrite failure)
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            console.error('AXIOS_ERROR: Received HTML instead of JSON. Check your API URL.');
            return Promise.reject(new Error('Invalid API response (received HTML)'));
        }
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const currentPath = window.location.pathname;

        console.error('AXIOS_ERROR:', {
            url: error.config?.url,
            status,
            msg: error.message,
        });

        if (status === 401) {
            const isAuthPage =
                currentPath.startsWith('/login') ||
                currentPath.startsWith('/register') ||
                currentPath === '/';

            const isAuthRequest =
                error.config?.url?.includes('/auth/login') ||
                error.config?.url?.includes('/auth/register') ||
                error.config?.url?.includes('/auth/me');

            // Non-critical background requests shouldn't kill the session on a random 401
            const isNonCriticalRequest = 
                error.config?.url?.includes('/unread-count') ||
                error.config?.url?.includes('/notifications');

            if (!isAuthPage && !isAuthRequest && !isNonCriticalRequest) {
                console.warn('AXIOS_401: Critical session failure. Redirecting to login...', error.config?.url);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                notifyAuthStorageChanged();
                // Use replace to avoid back-button loops
                window.location.replace('/login?expired=1');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
