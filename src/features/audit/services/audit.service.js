import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const auditService = {
  getLogs: async (filters = {}) => {
    const token = localStorage.getItem('token');
    
    // Build query params
    const params = new URLSearchParams();
    if (filters.table) params.append('table', filters.table);
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await axios.get(`${API_URL}/audit?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  }
};
