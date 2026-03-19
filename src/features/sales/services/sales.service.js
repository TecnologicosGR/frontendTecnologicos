import axios from '../../../lib/axios';

const BASE = 'sales';
const CLIENTS = 'clients';

export const salesService = {

  // --- CLIENT HELPERS (POS) ---
  searchClients: async (q) => {
    try {
      const res = await axios.get(`${CLIENTS}/search`, { params: { q } });
      return res.data; // array of up to 10 matches
    } catch (err) {
      throw err.response?.data || { detail: 'Error buscando cliente' };
    }
  },

  quickCreateClient: async (data) => {
    try {
      const res = await axios.post(`${CLIENTS}/quick`, data);
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error creando cliente' };
    }
  },

  // --- POS / VENTA ---
  createSale: async (data) => {
    try {
      const res = await axios.post(`${BASE}/`, data);
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error al registrar la venta' };
    }
  },

  listSales: async (params = {}) => {
    try {
      console.log('[salesService.listSales] params →', params);
      const res = await axios.get(`${BASE}/`, { params });
      console.log('[salesService.listSales] response →', res.data);
      return res.data; // { ventas: [], total: N }
    } catch (err) {
      console.error('[salesService.listSales] ERROR →', err.response?.status, err.response?.data);
      throw err.response?.data || { detail: 'Error cargando ventas' };
    }
  },

  getSale: async (id) => {
    try {
      const res = await axios.get(`${BASE}/${id}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error cargando detalle' };
    }
  },

  updateSale: async (id, data) => {
    try {
      const res = await axios.patch(`${BASE}/${id}`, data);
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error actualizando venta' };
    }
  },

  cancelSale: async (id) => {
    try {
      const res = await axios.delete(`${BASE}/${id}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error cancelando venta' };
    }
  },

  getDailySummary: async (fecha = null) => {
    try {
      const res = await axios.get(`${BASE}/summary/daily`, { params: fecha ? { fecha } : {} });
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error cargando resumen' };
    }
  },

  getRangeSummary: async (fecha_desde = null, fecha_hasta = null) => {
    try {
      const params = {};
      if (fecha_desde) params.fecha_desde = fecha_desde;
      if (fecha_hasta) params.fecha_hasta = fecha_hasta;
      const res = await axios.get(`${BASE}/summary/range`, { params });
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error cargando resumen de rango' };
    }
  },

  // --- CART ---
  getCart: async () => {
    try {
      const res = await axios.get(`${BASE}/cart`);
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error cargando carrito' };
    }
  },

  addToCart: async (id_producto, cantidad = 1) => {
    try {
      const res = await axios.post(`${BASE}/cart`, { id_producto, cantidad });
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error agregando al carrito' };
    }
  },

  updateCartItem: async (product_id, cantidad) => {
    try {
      const res = await axios.patch(`${BASE}/cart/${product_id}`, { cantidad });
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error actualizando item' };
    }
  },

  removeFromCart: async (product_id) => {
    try {
      const res = await axios.delete(`${BASE}/cart/${product_id}`);
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error eliminando del carrito' };
    }
  },

  clearCart: async () => {
    try {
      const res = await axios.delete(`${BASE}/cart`);
      return res.data;
    } catch (err) {
      throw err.response?.data || { detail: 'Error limpiando carrito' };
    }
  },
};
