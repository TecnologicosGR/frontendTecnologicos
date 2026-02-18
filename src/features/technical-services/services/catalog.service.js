import axios from '../../../lib/axios';

const BASE_URL = '/service-catalog';

export const catalogService = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar catálogo' };
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al crear servicio' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al actualizar servicio' };
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al eliminar servicio' };
    }
  }
};
