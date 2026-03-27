import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
    (response) => {
        // BUG-FIX: Detect if the API returned HTML (common when proxy/rewrites fail in production)
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            console.error("AXIOS_PROD_ERROR: Received HTML instead of JSON. Check your API URL and Vercel rewrites.");
            return Promise.reject(new Error("Invalid JSON response from API (received HTML)"));
        }
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const currentPath = window.location.pathname;

        console.error("AXIOS_ERROR:", {
            url: error.config?.url,
            status: status,
            msg: error.message
        });

        if (status === 401) {
            // Avoid looping redirects if already on auth pages
            const isAuthPage = currentPath.startsWith('/login') || currentPath.startsWith('/register') || currentPath === '/';
            // Also check if the request itself was an auth request
            const isAuthRequest = error.config.url.includes('/auth/login') || 
                                 error.config.url.includes('/auth/register') || 
                                 error.config.url.includes('/auth/me');

            if (!isAuthPage && !isAuthRequest) {
                console.warn("AXIOS_401: Redirecting to login...");
                // Clear state
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
