import axios from '../../../lib/axios';

const BASE_URL = '/technical-services';

export const technicalService = {
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar servicios técnicos' };
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar detalle del servicio' };
    }
  },

  create: async (ticketData) => {
    try {
      const response = await axios.post(`${BASE_URL}/`, ticketData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al crear ticket' };
    }
  },

  updateStatus: async (id, statusData) => {
    try {
      const { status, note, payment_method } = statusData;
      const params = { status };
      if (note) params.note = note;
      if (payment_method) params.payment_method = payment_method;
      const response = await axios.patch(`${BASE_URL}/${id}/status`, null, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al actualizar estado' };
    }
  },

  uploadEvidence: async (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    try {
      const response = await axios.post(`${BASE_URL}/${id}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al subir evidencia' };
    }
  },

  getTrackingPublic: async (token) => {
      try {
          const response = await axios.get(`${BASE_URL}/tracking/${token}`);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'No se encontró el ticket' };
      }
  },

  getTrackingLogs: async (token) => {
      try {
          const response = await axios.get(`${BASE_URL}/tracking/${token}/logs`);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al cargar historial' };
      }
  },

  getTrackingAppliedServices: async (token) => {
      try {
          const response = await axios.get(`${BASE_URL}/tracking/${token}/applied-services`);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al cargar servicios aplicados' };
      }
  },

  getAppliedServices: async (ticketId) => {
      try {
          const response = await axios.get(`${BASE_URL}/${ticketId}/applied-services`);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al cargar servicios aplicados' };
      }
  },

  addAppliedService: async (data) => {
      try {
          const response = await axios.post(`${BASE_URL}/applied-services`, data);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al agregar servicio' };
      }
  },

  updateTicket: async (id, data) => {
      try {
          const response = await axios.put(`${BASE_URL}/${id}`, data);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al actualizar ticket' };
      }
  },

  getRepuestos: async (ticketId) => {
      try {
          const response = await axios.get(`${BASE_URL}/${ticketId}/repuestos`);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al cargar repuestos' };
      }
  },

  addRepuesto: async (ticketId, data) => {
      try {
          const response = await axios.post(`${BASE_URL}/${ticketId}/repuestos`, data);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al agregar repuesto' };
      }
  },

  deleteRepuesto: async (repuestoId) => {
      try {
          const response = await axios.delete(`${BASE_URL}/repuestos/${repuestoId}`);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al eliminar repuesto' };
      }
  },

  delete: async (id) => {
      try {
          const response = await axios.delete(`${BASE_URL}/${id}`);
          return response.data;
      } catch (error) {
          throw error.response?.data || { detail: 'Error al eliminar el ticket' };
      }
  }
};
