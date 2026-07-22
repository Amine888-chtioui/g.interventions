import axiosInstance from './axiosInstance';

export const getUsers = () =>
  axiosInstance.get('/api/admin/users');

export const getUser = (id) =>
  axiosInstance.get(`/api/admin/users/${id}`);

export const createUser = (data) =>
  axiosInstance.post('/api/admin/users', data);

export const updateUser = (id, data) =>
  axiosInstance.put(`/api/admin/users/${id}`, data);

export const deleteUser = (id) =>
  axiosInstance.delete(`/api/admin/users/${id}`);
