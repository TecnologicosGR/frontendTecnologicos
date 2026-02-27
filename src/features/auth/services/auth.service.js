import api from '../../../lib/axios';

export const authService = {
  login: async (email, password) => {
    // API endpoint: POST /auth/login
    // Using application/x-www-form-urlencoded as is standard for OAuth2
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const { data } = await api.post('/auth/login', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /** Fetch current user profile + effective permissions from the backend. */
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;   // { id, email, role, permissions: ['productos:leer', ...] }
  }
};
