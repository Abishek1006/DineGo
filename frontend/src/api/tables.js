import api from './axios';

export const tablesAPI = {
  getAllTables: async () => {
    const response = await api.get('/api/tables');
    return response.data;
  },

  getTableSeats: async (tableId) => {
    const response = await api.get(`/api/tables/${tableId}/seats`);
    return response.data;
  },
}; 