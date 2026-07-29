import axiosInstance from './axiosInstance';

export const getRapport = (interventionId) =>
  axiosInstance.get(`/api/interventions/${interventionId}/rapport`);

export const createRapport = (interventionId, data) =>
  axiosInstance.post(`/api/interventions/${interventionId}/rapport`, data);

export const updateRapport = (interventionId, data) =>
  axiosInstance.put(`/api/interventions/${interventionId}/rapport`, data);

export const getRapportPdfBlob = (interventionId) =>
  axiosInstance.get(`/api/interventions/${interventionId}/rapport/pdf`, {
    responseType: 'blob',
  });
