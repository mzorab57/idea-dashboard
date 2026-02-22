import api from '../api/axiosConfig';

export const getCategories = async () => {
  const res = await api.get('/api/categories');
  return res.data;
};
