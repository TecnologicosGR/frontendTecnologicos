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
  uploadImage: async (file, field) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('field', field);
    const res = await axios.post(`${BASE}/config/upload-image`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
