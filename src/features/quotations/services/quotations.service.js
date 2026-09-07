import axios from '../../../lib/axios';

export const quotationsService = {
  create: async (data) => {
    const response = await axios.post('quotations', data);
    return response.data;
  },

  getAll: async (params) => {
    const response = await axios.get('quotations', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`quotations/${id}`);
    return response.data;
  },

  updateStatus: async (id, estado) => {
    const response = await axios.patch(`quotations/${id}/status`, { estado });
    return response.data;
  },

  convertToSale: async (id) => {
    const response = await axios.post(`quotations/${id}/convert-to-sale`);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`quotations/${id}`);
    return response.data;
  },

  downloadPdf: async (id, fileName = 'cotizacion.pdf') => {
    const response = await axios.get(`quotations/${id}/pdf`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
};
