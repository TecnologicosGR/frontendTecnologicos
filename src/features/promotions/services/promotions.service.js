import axios from '../../../lib/axios';

export const promotionsService = {
  // Públicos
  getActive: async (tipo = null) => {
    const params = tipo ? { tipo } : {};
    const response = await axios.get('promotions/active', { params });
    return response.data;
  },

  getDaily: async () => {
    const response = await axios.get('promotions/daily');
    return response.data;
  },

  getMonthly: async () => {
    const response = await axios.get('promotions/monthly');
    return response.data;
  },

  getProducts: async () => {
    const response = await axios.get('promotions/products');
    return response.data;
  },

  getPublicDetail: async (id) => {
    const response = await axios.get(`promotions/${id}/public`);
    return response.data;
  },

  // Administrativos
  getAll: async (params = {}) => {
    const response = await axios.get('promotions', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`promotions/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('promotions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`promotions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`promotions/${id}`);
    return response.data;
  },

  toggleActive: async (id) => {
    const response = await axios.patch(`promotions/${id}/toggle-active`);
    return response.data;
  },

  uploadImages: async (id, files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    const response = await axios.post(`promotions/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  deleteImage: async (id, url) => {
    const response = await axios.delete(`promotions/${id}/images`, {
      params: { url }
    });
    return response.data;
  },

  addProducts: async (id, products) => {
    const response = await axios.post(`promotions/${id}/products`, { productos: products });
    return response.data;
  },

  removeProduct: async (id, productId) => {
    const response = await axios.delete(`promotions/${id}/products/${productId}`);
    return response.data;
  }
};

