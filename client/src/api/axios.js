import axios from 'axios';

const api = axios.create({
    // Always use a relative /api path so Vite proxy handles it in dev,
    // and the production env variable handles it in prod.
    baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || '/api'),
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
        config.headers['Authorization'] = `Bearer ${token}`;
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

            if (!isAuthPage && !isAuthRequest) {
                console.warn('AXIOS_401: Session expired. Redirecting to login...');
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login?expired=1';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
