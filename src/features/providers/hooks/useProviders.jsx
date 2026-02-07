import { useState, useCallback } from 'react';
import { providersService } from '../services/providers.service';

export function useProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProviders = useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await providersService.getAll(search);
      setProviders(data);
    } catch (err) {
      setError(err.detail || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProvider = async (data) => {
    setLoading(true);
    try {
      await providersService.create(data);
      await fetchProviders();
      return { success: true };
    } catch (err) {
       return { success: false, error: err.detail || 'Error al crear proveedor' };
    } finally {
      setLoading(false);
    }
  };

  const updateProvider = async (id, data) => {
    setLoading(true);
    try {
      await providersService.update(id, data);
      await fetchProviders();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.detail || 'Error al actualizar proveedor' };
    } finally {
      setLoading(false);
    }
  };

  const deleteProvider = async (id) => {
      setLoading(true);
      try {
          await providersService.delete(id);
          setProviders(prev => prev.filter(p => p.id !== id));
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail || 'Error al eliminar proveedor' };
      } finally {
          setLoading(false);
      }
  }

  return {
    providers,
    loading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider
  };
}
