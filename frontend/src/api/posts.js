import api from './client';

export const getCommunityFeed = async (communityId, params = {}) => {
  const res = await api.get(`/communities/${communityId}/posts`, { params });
  return res.data;
};

export const createPost = async (communityId, data) => {
  const res = await api.post(`/communities/${communityId}/posts`, data);
  return res.data;
};

export const listMyAnnouncements = async () => {
  const res = await api.get('/posts/announcements');
  return res.data;
};

export const getPostById = async (postId) => {
  const res = await api.get(`/posts/${postId}`);
  return res.data;
};

export const toggleLike = async (postId) => {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data;
};