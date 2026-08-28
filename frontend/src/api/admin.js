import api from './client';

export const listPendingCommunities = async () => {
  const res = await api.get('/admin/communities/pending');
  return res.data;
};

export const reviewCommunity = async (communityId, decision) => {
  const res = await api.patch(`/admin/communities/${communityId}`, { decision });
  return res.data;
};

export const listUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params });
  return res.data;
};

export const updateUser = async (userId, data) => {
  const res = await api.patch(`/admin/users/${userId}`, data);
  return res.data;
};

export const listReports = async (params = {}) => {
  const res = await api.get('/admin/reports', { params });
  return res.data;
};

export const resolveReport = async (reportId, data) => {
  const res = await api.patch(`/admin/reports/${reportId}`, data);
  return res.data;
};
