import axios from 'axios';

const api = axios.create({
    // BUG-FIX: In development, always use relative path to utilize Vite proxy.
    // This prevents cross-origin cookie issues on localhost.
    baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_BASE_URL || '/api'),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// We no longer attach token from localStorage since it's an HTTP-only cookie.
api.interceptors.request.use((config) => {
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
