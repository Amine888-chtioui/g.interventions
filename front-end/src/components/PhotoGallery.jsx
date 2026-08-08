import { useEffect, useRef, useState } from 'react';
import { FiTrash2, FiUpload, FiX, FiImage } from 'react-icons/fi';
import { getPhotos, uploadPhotos, deletePhoto, getPhotoFileBlob } from '../api/photoApi';

export default function PhotoGallery({ interventionId, canManage = false, onClose }) {
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPhotos();
    return () => {
      setPreviews((prev) => {
        Object.values(prev).forEach((url) => url && URL.revokeObjectURL(url));
        return prev;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interventionId]);

  async function fetchPhotos() {
    setLoading(true);
    setError('');
    try {
      const { data } = await getPhotos(interventionId);
      setPhotos(data);
      await loadPreviews(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des photos.');
    } finally {
      setLoading(false);
    }
  }

  async function loadPreviews(photoList) {
    const entries = await Promise.all(
      photoList.map(async (photo) => {
        try {
          const { data: blob } = await getPhotoFileBlob(interventionId, photo.id);
          return [photo.id, URL.createObjectURL(blob)];
        } catch {
          return [photo.id, null];
        }
      })
    );
    setPreviews((prev) => {
      Object.values(prev).forEach((url) => url && URL.revokeObjectURL(url));
      return Object.fromEntries(entries);
    });
  }

  async function handleFilesSelected(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      await uploadPhotos(interventionId, files);
      await fetchPhotos();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi des photos.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(photoId) {
    setDeletingId(photoId);
    setError('');
    try {
      await deletePhoto(interventionId, photoId);
      await fetchPhotos();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression de la photo.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="dash-photo-gallery">
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {(canManage || onClose) && (
        <div className="dash-photo-upload">
          {canManage && (
            <>
              <label className="btn btn-sm btn-outline-primary mb-0">
                <FiUpload className="me-1" />
                Ajouter des photos
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFilesSelected}
                  disabled={uploading}
                />
              </label>
              {uploading && <span className="text-muted">Envoi en cours...</span>}
            </>
          )}
          {onClose && (
            <button type="button" className="btn btn-sm btn-outline-secondary ms-auto" onClick={onClose}>
              Fermer
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="dash-empty">Chargement des photos...</div>
      ) : photos.length === 0 ? (
        <div className="dash-empty">
          <FiImage className="dash-photo-empty-icon" />
          Aucune photo pour cette intervention
        </div>
      ) : (
        <div className="dash-photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="dash-photo-thumb">
              {previews[photo.id] ? (
                <img
                  src={previews[photo.id]}
                  alt={photo.nomOriginal || 'Photo intervention'}
                  onClick={() => setLightboxUrl(previews[photo.id])}
                />
              ) : (
                <div className="dash-photo-loading">...</div>
              )}
              {canManage && (
                <button
                  type="button"
                  className="dash-photo-delete"
                  title="Supprimer la photo"
                  disabled={deletingId === photo.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo.id);
                  }}
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxUrl && (
        <div className="dash-photo-lightbox" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Aperçu" />
          <button type="button" className="dash-photo-lightbox-close" onClick={() => setLightboxUrl(null)}>
            <FiX />
          </button>
        </div>
      )}
    </div>
  );
}
