import axios from '../../../lib/axios';

const BASE_URL = '/products';
const IMPORT_URL = '/import/products';

export const productsService = {
  // ... existing methods ...
  validateImport: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${IMPORT_URL}/clean-validate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error en validación de archivo' };
    }
  },

  uploadImport: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${IMPORT_URL}/clean-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al importar archivo' };
    }
  },

  getAll: async (params = {}) => {
    // params can include search, category_id, subcategory_id, provider_id
    try {
      const response = await axios.get(`${BASE_URL}/`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar productos' };
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
       throw error.response?.data || { detail: 'Error al cargar detalle del producto' };
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al crear producto' };
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.patch(`${BASE_URL}/${id}`, data); // Note: API docs said PATCH for partial updates
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al actualizar producto' };
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      return true;
    } catch (error) {
       throw error.response?.data || { detail: 'Error al eliminar producto' };
    }
  }
};
