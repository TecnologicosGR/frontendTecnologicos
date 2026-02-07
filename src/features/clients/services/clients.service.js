import api from '../../../lib/axios';

export const clientsService = {
  getAll: async (search = '') => {
    // GET /clients/?search=...
    const params = {};
    if (search) params.search = search;
    
    const { data } = await api.get('/clients/', { params });
    return data;
  },

  getById: async (id) => {
    // GET /clients/{id}
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },

  create: async (clientData) => {
    // POST /auth/register/client
    // Payload from docs: email, password, documento_identidad, nombres, apellidos, telefono, direccion
    const { data } = await api.post('/auth/register/client', clientData);
    return data;
  },

  update: async (id, clientData) => {
    // PUT /clients/{id}
    // Body: info to update (e.g. telefono, direccion)
    const { data } = await api.put(`/clients/${id}`, clientData);
    return data;
  },

  remove: async (id) => {
      // DELETE /clients/{id}
      const { data } = await api.delete(`/clients/${id}`);
      return data;
  }
};
