import axios from '../../../lib/axios';

const CAT_URL = '/categories';
const SUBCAT_URL = '/subcategories';

export const categoriesService = {
  // Categories
  getAll: async (search = '') => {
    try {
      const response = await axios.get(`${CAT_URL}/`, { params: { search } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar categorías' };
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${CAT_URL}/`, data);
      return response.data;
    } catch (error) {
       throw error.response?.data || { detail: 'Error al crear categoría' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${CAT_URL}/${id}`, data);
      return response.data;
    } catch (error) {
        throw error.response?.data || { detail: 'Error al actualizar categoría' };
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${CAT_URL}/${id}`);
      return true;
    } catch (error) {
       throw error.response?.data || { detail: 'Error al eliminar categoría' };
    }
  },

  // Subcategories
  getAllSubcategories: async (search = '') => {
    try {
        const response = await axios.get(`${SUBCAT_URL}/`, { params: { search } });
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: 'Error al cargar subcategorías' };
    }
  },

  createSubcategory: async (data) => {
      try {
          const response = await axios.post(`${SUBCAT_URL}/`, data);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al crear subcategoría' };
      }
  },

  updateSubcategory: async (id, data) => {
    try {
        const response = await axios.put(`${SUBCAT_URL}/${id}`, data); // Assuming PUT based on pattern
        return response.data;
    } catch (error) {
        throw error.response?.data || { detail: 'Error al actualizar subcategoría' };
    }
  },

  deleteSubcategory: async (id) => {
      try {
          await axios.delete(`${SUBCAT_URL}/${id}`); // Assuming DELETE
          return true;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al eliminar subcategoría' };
      }
  }
};
