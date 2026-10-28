import { useState, useEffect } from 'react';
import { promotionsService } from '../services/promotions.service';

export function useActivePromotions(tipo = null) {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await promotionsService.getActive(tipo);
        if (isMounted) {
          setPromotions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.detail || err.message || 'Error al cargar promociones activas');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [tipo]);

  return { promotions, loading, error };
}

