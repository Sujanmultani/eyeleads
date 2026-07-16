import axios from 'axios';

export let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auto-resolve to the current LAN hostname when the app itself is accessed
// over LAN/IP (e.g. testing on a phone) rather than localhost — keeps
// VITE_API_URL safely pinned to 'localhost' in .env at all times.
if (import.meta.env.DEV) {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    baseURL = baseURL.replace(/localhost|127\.0\.0\.1/, window.location.hostname);
  }
}

// Deeply replaces 'localhost:5000' with the network hostname in any URL strings returned from the API
const replaceLocalhostInUrls = (data, targetHost) => {
  if (!data) return data;
  if (typeof data === 'string') {
    return data.replace(/http:\/\/localhost:5000/g, `http://${targetHost}:5000`);
  }
  if (Array.isArray(data)) {
    return data.map(item => replaceLocalhostInUrls(item, targetHost));
  }
  if (typeof data === 'object') {
    const updated = {};
    for (const key of Object.keys(data)) {
      updated[key] = replaceLocalhostInUrls(data[key], targetHost);
    }
    return updated;
  }
  return data;
};

const api = axios.create({
  baseURL,
  withCredentials: true,    // ← HttpOnly cookies automatically sent
  timeout: 15000,           // 15 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — strip duplicate /api prefix if VITE_API_URL already ends with /api
api.interceptors.request.use(
  (config) => {
    if (config.baseURL?.endsWith('/api') && config.url?.startsWith('/api')) {
      config.url = config.url.replace(/^\/api/, '');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally and rewrite localhost asset URLs for LAN
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      if (response.data && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        response.data = replaceLocalhostInUrls(response.data, window.location.hostname);
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isVerifyRoute = error.config?.url?.endsWith('/auth/me') || error.config?.url?.endsWith('/me');
      const isAuthActionRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      const isLoginRoute = window.location.pathname.includes('/login');
      if (!isVerifyRoute && !isAuthActionRoute && !isLoginRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
