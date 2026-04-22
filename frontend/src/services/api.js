import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Request interceptor: attach JWT ────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: global 401 logout ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      // Redirect to login without full reload via event
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
