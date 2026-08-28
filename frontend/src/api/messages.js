import api from './client';

export const listMessages = async (communityId, since) => {
  const res = await api.get(`/communities/${communityId}/messages`, {
    params: since ? { since } : {},
  });
  return res.data;
};

export const sendMessage = async (communityId, content) => {
  const res = await api.post(`/communities/${communityId}/messages`, { content });
  return res.data;
};