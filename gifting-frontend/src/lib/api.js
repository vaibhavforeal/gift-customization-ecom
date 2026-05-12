import axios from 'axios';
import { getToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach admin JWT to requests automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public API (no auth needed)
export const publicApi = {
  getProducts: (category) =>
    api.get('/products', { params: category ? { category } : {} }).then((r) => r.data),

  getProduct: (id) =>
    api.get(`/products/${id}`).then((r) => r.data),

  getQuote: (items) =>
    api.post('/quote', { items }).then((r) => r.data),

  createOrder: (orderData) =>
    api.post('/orders', orderData).then((r) => r.data),

  getOrder: (id) =>
    api.get(`/orders/${id}`).then((r) => r.data),

  initiatePayment: (orderId) =>
    api.post(`/orders/${orderId}/pay`).then((r) => r.data),

  verifyPayment: (paymentData) =>
    api.post('/payments/verify', paymentData).then((r) => r.data),
};

// Admin API (auth required)
export const adminApi = {
  login: (email, password) =>
    api.post('/admin/auth/login', { email, password }).then((r) => r.data),

  getStats: () =>
    api.get('/admin/stats').then((r) => r.data),

  getProducts: () =>
    api.get('/admin/products').then((r) => r.data),

  createProduct: (data) =>
    api.post('/admin/products', data).then((r) => r.data),

  updateProduct: (id, data) =>
    api.put(`/admin/products/${id}`, data).then((r) => r.data),

  deleteProduct: (id) =>
    api.delete(`/admin/products/${id}`).then((r) => r.data),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getOrders: (params) =>
    api.get('/admin/orders', { params }).then((r) => r.data),

  getOrder: (id) =>
    api.get(`/admin/orders/${id}`).then((r) => r.data),

  updateOrder: (id, data) =>
    api.patch(`/admin/orders/${id}`, data).then((r) => r.data),
};

export default api;
