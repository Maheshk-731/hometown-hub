import api from './client';

export const updateProfile = async (data) => {
  const res = await api.patch('/auth/me', data);
  return res.data;
};
