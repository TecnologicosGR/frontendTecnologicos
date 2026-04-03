import axios from '../../../lib/axios';

const BASE_URL = '/public/catalog';

export const publicCatalogService = {
  async getProducts(params = {}) {
    try {
      const response = await axios.get(`${BASE_URL}/products`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar productos del catalogo publico' };
    }
  },

  async getProductById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar el producto' };
    }
  },

  async getCategories() {
    try {
      const response = await axios.get(`${BASE_URL}/categories`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Error al cargar categorias del catalogo publico' };
    }
  },

  createStockEventSource() {
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
    return new EventSource(`${base}/public/catalog/stock-stream`);
  }
};
