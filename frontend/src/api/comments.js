import api from './client';

export const listComments = async (postId) => {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
};

export const addComment = async (postId, content) => {
  const res = await api.post(`/posts/${postId}/comments`, { content });
  return res.data;
};
