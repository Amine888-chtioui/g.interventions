import axiosInstance from './axiosInstance';

export const getProfile = () => axiosInstance.get('/api/profile');

export const updateProfile = (data) => axiosInstance.put('/api/profile', data);

export const changePassword = (data) => axiosInstance.put('/api/profile/password', data);
