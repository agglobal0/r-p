// frontend/src/services/authService.js
import api from './api';

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  // store userId for attaching to requests
  try {
    const userId = res.data?.user?.id || res.data?.user?._id;
    if (userId) localStorage.setItem('userId', userId);
  } catch (e) {}
  return res;
};

export const register = async (username, email, password) => {
  return await api.post('/auth/register', { username, email, password });
};

export const verifyOTP = async (email, otp) => {
  const res = await api.post('/auth/verify-otp', { email, otp });
  try {
    const userId = res.data?.user?.id || res.data?.user?._id;
    if (userId) localStorage.setItem('userId', userId);
  } catch (e) {}
  return res;
};

export const forgotPassword = async (email) => {
  return await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (email, otp, newPassword) => {
  return await api.post('/auth/reset-password', { email, otp, newPassword });
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('userId');
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get('/auth/me');
    return res.data.user;
  } catch (e) {
    return null;
  }
};
