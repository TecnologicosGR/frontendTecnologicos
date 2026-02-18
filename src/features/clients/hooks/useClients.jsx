import { useState, useEffect, useCallback } from 'react';
import { clientsService } from '../services/clients.service';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Always fetch all clients (empty search)
      const data = await clientsService.getAll();
      setClients(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = async (clientData) => {
    setLoading(true);
    setError(null);
    try {
      await clientsService.create(clientData);
      // Refresh list
      await fetchClients();
      return { success: true };
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Error al crear cliente';
      return { success: false, error: typeof msg === 'object' ? JSON.stringify(msg) : msg };
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (id, clientData) => {
    setLoading(true);
    setError(null);
    try {
      await clientsService.update(id, clientData);
      // Refresh list
      await fetchClients();
      return { success: true };
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Error al actualizar cliente';
      return { success: false, error: typeof msg === 'object' ? JSON.stringify(msg) : msg };
    } finally {
      setLoading(false);
    }
  };

  const deleteClient = async (id) => {
      setLoading(true);
      setError(null);
      try {
          await clientsService.remove(id);
          await fetchClients();
          return { success: true };
      } catch (err) {
          console.error(err);
          const msg = err.response?.data?.detail || 'Error al eliminar cliente';
          return { success: false, error: typeof msg === 'object' ? JSON.stringify(msg) : msg };
      } finally {
          setLoading(false);
      }
  }

  const searchClients = useCallback(async (query) => {
    try {
        const data = await clientsService.getAll(query);
        return data;
    } catch (err) {
        console.error(err);
        return [];
    }
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    searchClients, 
    createClient,
    updateClient,
    deleteClient
  };
};
