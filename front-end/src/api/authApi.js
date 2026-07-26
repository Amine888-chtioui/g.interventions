import axiosInstance from './axiosInstance';

export const login = (email, password) =>
  axiosInstance.post('/api/auth/login', { email, password });

export const register = (data) =>
  axiosInstance.post('/api/auth/register', data);

export const forgotPassword = (email) =>
  axiosInstance.post('/api/auth/forgot-password', { email });

export const verifyResetCode = (email, code) =>
  axiosInstance.post('/api/auth/verify-reset-code', { email, code });

export const resetPassword = (email, code, newPassword, confirmPassword) =>
  axiosInstance.post('/api/auth/reset-password', { email, code, newPassword, confirmPassword });
