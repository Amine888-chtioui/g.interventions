import axiosInstance from './axiosInstance';

export const getPhotos = (interventionId) =>
  axiosInstance.get(`/api/interventions/${interventionId}/photos`);

export const uploadPhotos = (interventionId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  return axiosInstance.post(`/api/interventions/${interventionId}/photos`, formData);
};

export const deletePhoto = (interventionId, photoId) =>
  axiosInstance.delete(`/api/interventions/${interventionId}/photos/${photoId}`);

export const getPhotoFileBlob = (interventionId, photoId) =>
  axiosInstance.get(`/api/interventions/${interventionId}/photos/${photoId}/fichier`, {
    responseType: 'blob',
  });
