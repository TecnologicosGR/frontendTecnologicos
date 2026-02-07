import { useState, useCallback } from 'react';
import { catalogService } from '../services/catalog.service';

export function useServiceCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCatalog = useCallback(async (params) => {
    setLoading(true);
    try {
      const data = await catalogService.getAll(params);
      setCatalog(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCatalogItem = async (data) => {
      setLoading(true);
      try {
          await catalogService.create(data);
          await fetchCatalog();
          return { success: true };
      } catch (err) {
          return { success: false, error: err.detail };
      } finally {
          setLoading(false);
      }
  };

  return {
    catalog,
    loading,
    fetchCatalog,
    createCatalogItem
  };
}
