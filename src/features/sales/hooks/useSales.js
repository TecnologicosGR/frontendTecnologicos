import { useState, useCallback } from 'react';
import { salesService } from '../services/sales.service';

export function useSales() {
  const [sales, setSales] = useState([]);
  const [currentSale, setCurrentSale] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0 });

  const fetchSales = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.listSales(params);
      console.log('[useSales.fetchSales] data received →', data);
      console.log('[useSales.fetchSales] data.ventas →', data?.ventas);
      setSales(data.ventas || []);
      setPagination({ total: data.total || 0 });
      return data;
    } catch (err) {
      console.error('[useSales.fetchSales] catch error →', err);
      setError(err.detail || 'Error cargando ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSaleDetail = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await salesService.getSale(id);
      setCurrentSale(data);
      return data;
    } catch (err) {
      setError(err.detail || 'Error cargando detalle');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = useCallback(async (saleData) => {
    setLoading(true);
    try {
      const result = await salesService.createSale(saleData);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.detail || 'Error al crear venta' };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSale = useCallback(async (id) => {
    try {
      const result = await salesService.cancelSale(id);
      setSales(prev => prev.filter(s => s.id !== id));
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.detail || 'Error al cancelar' };
    }
  }, []);

  const updateSale = useCallback(async (id, data) => {
    try {
      const result = await salesService.updateSale(id, data);
      setCurrentSale(result);
      setSales(prev => prev.map(s => s.id === id ? { ...s, ...result } : s));
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.detail || 'Error al actualizar' };
    }
  }, []);

  const fetchDailySummary = useCallback(async (fecha = null) => {
    try {
      const data = await salesService.getDailySummary(fecha);
      setDailySummary(data);
      return data;
    } catch (err) {
      setError(err.detail || 'Error cargando resumen');
    }
  }, []);

  return {
    sales, currentSale, dailySummary, loading, error, pagination,
    fetchSales, fetchSaleDetail, createSale, cancelSale, updateSale, fetchDailySummary,
    setCurrentSale
  };
}
