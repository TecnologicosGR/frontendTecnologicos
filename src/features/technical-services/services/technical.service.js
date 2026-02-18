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
      const response = await axios.patch(`${BASE_URL}/${id}/status`, statusData);
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
  }
};
