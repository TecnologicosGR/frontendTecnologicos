import axios from '../../../lib/axios';

const URL = '/providers';

export const providersService = {
  getAll: async (search = '') => {
    try {
      const response = await axios.get(`${URL}/`, { params: { search } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar proveedores' };
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${URL}/`, data);
      return response.data;
    } catch (error) {
       throw error.response?.data || { detail: 'Error al crear proveedor' };
    }
  },

  update: async (id, data) => { // Assuming PUT exists
    try {
      const response = await axios.put(`${URL}/${id}`, data); // Assuming PUT
      return response.data;
    } catch (error) {
        throw error.response?.data || { detail: 'Error al actualizar proveedor' };
    }
  },

  delete: async (id) => { // Assuming DELETE exists
    try {
      await axios.delete(`${URL}/${id}`);
      return true;
    } catch (error) {
       throw error.response?.data || { detail: 'Error al eliminar proveedor' };
    }
  }
};
