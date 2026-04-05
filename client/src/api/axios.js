import axios from 'axios';

// In production on Vercel, use relative '/api' so Vercel's proxy rewrite
// forwards requests to Render — this keeps everything on the same domain
// and ensures cookies are set correctly (no cross-origin cookie rejections).
// Only use VITE_API_BASE_URL directly if running outside of Vercel (e.g. self-hosted).
const isVercelProd = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
const BASE_URL = isVercelProd ? '/api' : (import.meta.env.VITE_API_BASE_URL || '/api');

const api = axios.create({
    baseURL: BASE_URL,
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
        if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${token}`);
        } else {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
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
                // Use replace to avoid back-button loops
                window.location.replace('/login?expired=1');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
