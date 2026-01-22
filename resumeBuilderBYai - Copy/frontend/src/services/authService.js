// frontend/src/services/authService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password });
  // store userId for attaching to requests
  try {
    const userId = res.data?.user?.id || res.data?.user?._id;
    if (userId) localStorage.setItem('userId', userId);
  } catch (e) {}
  return res;
};

export const register = async (username, email, password) => {
  return await apiClient.post('/auth/register', { username, email, password });
};

export const verifyOTP = async (email, otp) => {
  const res = await apiClient.post('/auth/verify-otp', { email, otp });
  try {
    const userId = res.data?.user?.id || res.data?.user?._id;
    if (userId) localStorage.setItem('userId', userId);
  } catch (e) {}
  return res;
};

export const forgotPassword = async (email) => {
  return await apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = async (email, otp, newPassword) => {
  return await apiClient.post('/auth/reset-password', { email, otp, newPassword });
};

export const logout = async () => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('userId');
};

export const getCurrentUser = async () => {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  } catch (e) {
    return null;
  }
};
