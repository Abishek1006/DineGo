import api from './axios';

export const groupsAPI = {
  createGroup: async (tableId, seatIds) => {
    const response = await api.post(`/api/groups/create?tableId=${tableId}`, seatIds);
    return response.data;
  },

  addItemToGroup: async (groupId, foodId, quantity) => {
    const response = await api.post(`/api/groups/${groupId}/add-item?foodId=${foodId}&quantity=${quantity}`);
    return response.data;
  },

  getGroupItems: async (groupId) => {
    const response = await api.get(`/api/groups/${groupId}/items`);
    return response.data;
  },

  submitGroup: async (groupId) => {
    const response = await api.post(`/api/groups/${groupId}/submit`);
    return response.data;
  },

  getSubmittedGroups: async () => {
    const response = await api.get('/api/groups/submitted');
    return response.data;
  },

  getUnsubmittedGroups: async () => {
    const response = await api.get('/api/groups/unsubmitted');
    return response.data;
  },

  getAllGroups: async () => {
    const response = await api.get('/api/groups/all');
    return response.data;
  },

  deleteGroup: async (groupId) => {
    const response = await api.delete(`/api/groups/${groupId}`);
    return response.data;
  },

  updateItemQuantity: async (groupId, itemId, quantity) => {
    const response = await api.put(`/api/groups/${groupId}/items/${itemId}?quantity=${quantity}`);
    return response.data;
  },

  removeItemFromGroup: async (groupId, itemId) => {
    const response = await api.delete(`/api/groups/${groupId}/items/${itemId}`);
    return response.data;
  },

  markGroupAsPaid: async (groupId) => {
    const response = await api.put(`/api/groups/${groupId}/mark-paid`);
    return response.data;
  },
}; 