import { useState, useCallback } from 'react';
import { promotionsService } from '../services/promotions.service';

export function usePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPromotions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await promotionsService.getAll(params);
      setPromotions(data.items || []);
      setTotal(data.total || 0);
      return { success: true, data };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al cargar promociones';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const createPromotion = async (data) => {
    setLoading(true);
    try {
      const created = await promotionsService.create(data);
      return { success: true, data: created };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al crear promoción';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const updatePromotion = async (id, data) => {
    setLoading(true);
    try {
      const updated = await promotionsService.update(id, data);
      setPromotions((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al actualizar promoción';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const deletePromotion = async (id) => {
    setLoading(true);
    try {
      await promotionsService.delete(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al eliminar promoción';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      const res = await promotionsService.toggleActive(id);
      setPromotions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, activo: res.activo, esta_vigente: res.activo } : p))
      );
      return { success: true, data: res };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al cambiar estado';
      return { success: false, error: msg };
    }
  };

  const uploadImages = async (id, files) => {
    try {
      const updatedUrls = await promotionsService.uploadImages(id, files);
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                urls_imagenes: updatedUrls,
                url_imagen: p.url_imagen || (updatedUrls.length > 0 ? updatedUrls[0] : null)
              }
            : p
        )
      );
      return { success: true, urls: updatedUrls };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al subir imágenes';
      return { success: false, error: msg };
    }
  };

  const deleteImage = async (id, url) => {
    try {
      const updatedUrls = await promotionsService.deleteImage(id, url);
      const newMain = updatedUrls.length > 0 ? updatedUrls[0] : null;
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                urls_imagenes: updatedUrls,
                url_imagen: newMain
              }
            : p
        )
      );
      return { success: true, urls: updatedUrls };
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error al eliminar imagen';
      return { success: false, error: msg };
    }
  };

  return {
    promotions,
    total,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    toggleActive,
    uploadImages,
    deleteImage
  };
}

