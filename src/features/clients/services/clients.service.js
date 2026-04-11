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
    // Si el administrador proveyó email y contraseña, registramos cliente en el sistema auth
    if (clientData.email && clientData.password && clientData.email.trim() !== '') {
      const { data } = await api.post('/auth/register/client', clientData);
      return data;
    } else {
      // Si el email está vacío o nulo, o no hay password, es un cliente rápido
      const payload = { ...clientData };
      delete payload.password;
      if (!payload.email || payload.email.trim() === '') delete payload.email;
      
      const { data } = await api.post('/clients/quick', payload);
      return data;
    }
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
