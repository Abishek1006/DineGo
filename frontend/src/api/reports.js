import api from './axios';

export const reportsAPI = {
  getTopSellingFoods: async () => {
    const response = await api.get('/api/admin/reports/top-selling-foods');
    return response.data;
  },
  
  getLeastSellingFoods: async () => {
    const response = await api.get('/api/admin/reports/least-selling-foods');
    return response.data;
  },
  
  getMonthlySales: async () => {
    const response = await api.get('/api/admin/reports/monthly-sales');
    return response.data;
  },
  
  getTableUsage: async () => {
    const response = await api.get('/api/admin/reports/table-usage');
    return response.data;
  }
}; 