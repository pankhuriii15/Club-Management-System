import axios from 'axios';

const api = axios.create({
  baseURL: "https://club-management-system-psdw.onrender.com/api",
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token to all API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
