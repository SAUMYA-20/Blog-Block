import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// ✅ Safely read API URL (with fallback for local dev)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API URL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // include cookies if backend uses them
});

// ✅ Request interceptor — attach token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') { // prevent SSR crash
      const token = localStorage.getItem('token');
      if (token) {
        // Match your backend header name ("x-auth-token" or "Authorization")
        config.headers['x-auth-token'] = token;
        // Or use this if backend expects bearer tokens:
        // config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ✅ Response interceptor — useful logging and error catching
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Optional: handle auth expiration globally
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
