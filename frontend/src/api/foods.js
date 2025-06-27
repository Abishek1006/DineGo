import api from './axios';

export const foodsAPI = {
  getAllFoods: async () => {
    const response = await api.get('/api/foods');
    return response.data;
  },

  addFood: async (foodData) => {
    const response = await api.post('/api/foods', foodData);
    return response.data;
  },

  updateFood: async (id, foodData) => {
    const response = await api.put(`/api/foods/${id}`, foodData);
    return response.data;
  },

  deleteFood: async (id) => {
    const response = await api.delete(`/api/foods/${id}`);
    return response.data;
  },
}; 