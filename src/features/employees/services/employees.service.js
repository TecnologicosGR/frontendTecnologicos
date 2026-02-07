import axios from '../../../lib/axios';

const EMPLOYEES_URL = '/employees';

export const employeesService = {
  getAll: async (activeOnly = false) => {
    try {
      const response = await axios.get(`${EMPLOYEES_URL}/?active_only=${activeOnly}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar empleados' };
    }
  },

  create: async (employeeData) => {
    try {
      const response = await axios.post(`${EMPLOYEES_URL}/`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al crear empleado' };
    }
  },

  update: async (id, employeeData) => {
    try {
      const response = await axios.put(`${EMPLOYEES_URL}/${id}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al actualizar empleado' };
    }
  },

  // Soft delete simulation
  toggleStatus: async (id, isActive) => {
    try {
      const response = await axios.put(`${EMPLOYEES_URL}/${id}`, { activo: isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cambiar estado del empleado' };
    }
  }
};
