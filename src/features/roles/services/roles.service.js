import axios from '../../../lib/axios';

const ROLE_URL = '/roles';

export const rolesService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${ROLE_URL}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar roles' };
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${ROLE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar detalles del rol' };
    }
  },

  create: async (roleData) => {
    try {
      const response = await axios.post(`${ROLE_URL}/`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al crear rol' };
    }
  },

  update: async (id, roleData) => {
    try {
      const response = await axios.put(`${ROLE_URL}/${id}`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al actualizar rol' };
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${ROLE_URL}/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al eliminar rol' };
    }
  },

  getAllPermissions: async () => {
    try {
      const response = await axios.get(`${ROLE_URL}/permissions/list`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar permisos del sistema' };
    }
  },

  addPermission: async (roleId, permissionId) => {
    try {
      const response = await axios.post(`${ROLE_URL}/${roleId}/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al asignar permiso' };
    }
  },

  removePermission: async (roleId, permissionId) => {
     try {
      await axios.delete(`${ROLE_URL}/${roleId}/permissions/${permissionId}`);
      return true;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al remover permiso' };
    }
  }
};
