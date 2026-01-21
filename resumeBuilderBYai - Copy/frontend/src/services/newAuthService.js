// frontend/src/services/newAuthService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const login = async (email, password) => {
  return await apiClient.post('/auth/login', { email, password });
};

export const register = async (username, email, password) => {
  return await apiClient.post('/auth/register', { username, email, password });
};

export const logout = async () => {
  await apiClient.post('/auth/logout');
};
