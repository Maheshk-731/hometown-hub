import api from './client';

export const listMyEvents = async (filter) => {
  const res = await api.get('/events', { params: filter ? { filter } : {} });
  return res.data;
};

export const listCommunityEvents = async (communityId, params = {}) => {
  const res = await api.get(`/communities/${communityId}/events`, { params });
  return res.data;
};

export const getEventById = async (eventId) => {
  const res = await api.get(`/events/${eventId}`);
  return res.data;
};

export const createEvent = async (communityId, data) => {
  const res = await api.post(`/communities/${communityId}/events`, data);
  return res.data;
};

export const toggleRsvp = async (eventId) => {
  const res = await api.post(`/events/${eventId}/rsvp`);
  return res.data;
};