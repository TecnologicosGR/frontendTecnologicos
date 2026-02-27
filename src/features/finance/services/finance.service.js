import api from '../../../lib/axios';

const BASE = '/finance';

export const financeService = {
  // Vista previa en tiempo real de un turno (sin guardar)
  preview: async (turno = 'COMPLETO') => {
    const { data } = await api.get(`${BASE}/preview`, { params: { turno } });
    return data;
  },

  // Genera el cierre de un turno
  closeDay: async ({ fecha_cierre, turno, notas }) => {
    const { data } = await api.post(`${BASE}/close-day`, { fecha_cierre, turno, notas });
    return data;
  },

  // Historial de cierres filtrado
  listCierres: async ({ fecha_inicio, fecha_fin, turno } = {}) => {
    const { data } = await api.get(`${BASE}/cierres`, {
      params: { fecha_inicio, fecha_fin, turno },
    });
    return data;
  },

  // Detalle de un cierre
  getCierre: async (id) => {
    const { data } = await api.get(`${BASE}/cierres/${id}`);
    return data;
  },
};
