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

  // Assuming standard CRUD exists or will be needed
  update: async (id, data) => {
      // Logic placeholder if API supports it
      return { success: true }; 
  }
};
