import axiosInstance from './axiosInstance';

export const login = (email, password) =>
  axiosInstance.post('/api/auth/login', { email, password });

export const register = (data) =>
  axiosInstance.post('/api/auth/register', data);
