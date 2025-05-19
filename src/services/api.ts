import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Seu backend URL

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar o token JWT às requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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