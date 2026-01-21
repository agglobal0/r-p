// frontend/src/services/authService.js
import api from './api';

export const login = async (email, password) => {
  return await api.post('/auth/login', { email, password });
};

export const register = async (username, email, password) => {
  return await api.post('/auth/register', { username, email, password });
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getCurrentUser = () => {
  // The backend now handles the user session via cookies,
  // so we might not need to store user info in localStorage anymore.
  // If you still need user info on the client-side, you can have
  // a dedicated endpoint to fetch user data.
  return null;
};
