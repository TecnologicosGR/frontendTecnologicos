import api from '../../../lib/axios';

export const auditService = {
  getLogs: async (filters = {}) => {
    const params = {};
    if (filters.table) params.table = filters.table;
    if (filters.user_id) params.user_id = filters.user_id;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get('audit', { params });
    return response.data;
  }
};
