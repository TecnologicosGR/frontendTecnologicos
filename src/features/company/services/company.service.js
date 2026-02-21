import axios from '../../../lib/axios';

const BASE = 'company';

export const companyService = {
  getConfig: async () => {
    const res = await axios.get(`${BASE}/config`);
    return res.data;
  },
  updateConfig: async (data) => {
    const res = await axios.patch(`${BASE}/config`, data);
    return res.data;
  },
};
