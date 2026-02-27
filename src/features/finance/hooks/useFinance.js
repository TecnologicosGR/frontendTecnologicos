import { useState, useCallback } from 'react';
import { financeService } from '../services/finance.service';
import { useToast } from '../../../components/ui/toast';

export function useFinance() {
  const { toast } = useToast();
  const [preview, setPreview]   = useState(null);
  const [cierres, setCierres]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);

  const fetchPreview = useCallback(async (turno = 'COMPLETO') => {
    setLoading(true);
    try {
      const data = await financeService.preview(turno);
      setPreview(data);
    } catch (e) {
      toast({ title: 'Error', description: e.detail || 'No se pudo cargar la preview', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  const fetchCierres = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await financeService.listCierres(filters);
      setCierres(data);
    } catch (e) {
      toast({ title: 'Error', description: e.detail || 'No se pudo cargar el historial', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [toast]);

  const generateClose = useCallback(async (payload) => {
    setLoading(true);
    try {
      const data = await financeService.closeDay(payload);
      toast({ title: '✅ Cierre Generado', description: `Turno ${data.turno} registrado exitosamente.`, variant: 'success' });
      return { success: true, data };
    } catch (e) {
      const msg = e.response?.data?.detail || e.detail || 'Error al generar cierre';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      return { success: false, error: msg };
    } finally { setLoading(false); }
  }, [toast]);

  const openDetail = useCallback(async (id) => {
    try {
      const data = await financeService.getCierre(id);
      setSelected(data);
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar el detalle', variant: 'destructive' });
    }
  }, [toast]);

  return { preview, cierres, selected, loading, fetchPreview, fetchCierres, generateClose, openDetail, setSelected };
}
