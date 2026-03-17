import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
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
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const currentPath = window.location.pathname;

        if (status === 401) {
            // Avoid looping redirects if already on auth pages
            const isAuthPage = currentPath.startsWith('/login') || currentPath.startsWith('/register');
            const isAuthRequest = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');

            if (!isAuthPage && !isAuthRequest) {
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
