import api from './client';

export const createReport = async (data) => {
  const res = await api.post('/reports', data);
  return res.data;
};
