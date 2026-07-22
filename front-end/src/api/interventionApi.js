import axiosInstance from './axiosInstance';

export const getInterventions = () =>
  axiosInstance.get('/api/admin/interventions');

export const getIntervention = (id) =>
  axiosInstance.get(`/api/admin/interventions/${id}`);

export const createIntervention = (data) =>
  axiosInstance.post('/api/admin/interventions', data);

export const updateIntervention = (id, data) =>
  axiosInstance.put(`/api/admin/interventions/${id}`, data);

export const deleteIntervention = (id) =>
  axiosInstance.delete(`/api/admin/interventions/${id}`);

export const getMyInterventions = () =>
  axiosInstance.get('/api/interventions/mine');

export const updateInterventionStatut = (id, statut) =>
  axiosInstance.put(`/api/interventions/${id}/statut`, { statut });
