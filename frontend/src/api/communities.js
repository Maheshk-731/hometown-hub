import api from './client';

export const listCommunities = async (params = {}) => {
  const res = await api.get('/communities', { params });
  return res.data;
};

export const listMyCommunities = async () => {
  const res = await api.get('/communities/mine');
  return res.data;
};

export const getCommunityBySlug = async (slug) => {
  const res = await api.get(`/communities/${slug}`);
  return res.data;
};

export const createCommunity = async (data) => {
  const res = await api.post('/communities', data);
  return res.data;
};

export const joinCommunity = async (communityId) => {
  const res = await api.post(`/communities/${communityId}/join`);
  return res.data;
};

export const getMembershipStatus = async (communityId) => {
  const res = await api.get(`/communities/${communityId}/membership`);
  return res.data;
};

export const listJoinRequests = async (communityId) => {
  const res = await api.get(`/communities/${communityId}/requests`);
  return res.data;
};

export const respondToJoinRequest = async (communityId, membershipId, decision) => {
  const res = await api.patch(`/communities/${communityId}/requests/${membershipId}`, { decision });
  return res.data;
};

export const leaveCommunity = async (communityId) => {
  const res = await api.delete(`/communities/${communityId}/leave`);
  return res.data;

};

export const updateCommunity = async (communityId, data) => {
  const res = await api.patch(`/communities/${communityId}`, data);
  return res.data;
};

export const deleteCommunity = async (communityId, confirmName) => {
  const res = await api.delete(`/communities/${communityId}`, { data: { confirmName } });
  return res.data;
};