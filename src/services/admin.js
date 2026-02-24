import api from '../api/axiosConfig';

export const getDashboardStats = async () => {
  const res = await api.get('/api/admin/stats');
  return res.data;
};

export const getDashboardActivity = async () => {
  const res = await api.get('/api/admin/stats/activity');
  return res.data;
};
export const getDashboardMetrics = async (type = 'downloads', period = '1d') => {
  const res = await api.get('/api/admin/stats/metrics', { params: { period, type } });
  return res.data;
};

export const getDashboardOverview = async (days = 30) => {
  const res = await api.get('/api/admin/stats/overview', { params: { days } });
  return res.data;
};
export const getAdminBooks = async (params = {}) => {
  const res = await api.get('/api/admin/books', { params });
  return res.data;
};

export const uploadStorage = async (file, type = 'uploads', key) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('type', type);
  if (key) fd.append('key', key);
  const res = await api.post('/api/admin/storage/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const createBook = async (payload) => {
  const res = await api.post('/api/admin/books', payload);
  return res.data;
};



export const getBookById = async (id) => {
  const res = await api.get(`/api/admin/books/${id}`);
  return res.data;
};

export const updateBook = async (id, payload) => {
  const res = await api.put(`/api/admin/books/${id}`, payload);
  return res.data;
};

export const deleteBook = async (id, { deleteFile = false } = {}) => {
  const params = deleteFile ? { delete_file: 1 } : {};
  const res = await api.delete(`/api/admin/books/${id}`, { params });
  return res.data;
};

export const getAdminAuthors = async (params = {}) => {
  const res = await api.get('/api/admin/authors', { params });
  return res.data;
};

export const createAuthor = async (payload) => {
  const res = await api.post('/api/admin/authors', payload);
  return res.data;
};

export const getAuthorById = async (id) => {
  const res = await api.get(`/api/admin/authors/${id}`);
  return res.data;
};

export const updateAuthor = async (id, payload) => {
  const res = await api.put(`/api/admin/authors/${id}`, payload);
  return res.data;
};

export const deleteAuthor = async (id) => {
  const res = await api.delete(`/api/admin/authors/${id}`);
  return res.data;
};

export const getAdminCategories = async (params = {}) => {
  const res = await api.get('/api/admin/categories', { params });
  return res.data;
};

export const createCategory = async (payload) => {
  const res = await api.post('/api/admin/categories', payload);
  return res.data;
};

export const getCategoryById = async (id) => {
  const res = await api.get(`/api/admin/categories/${id}`);
  return res.data;
};

export const updateCategory = async (id, payload) => {
  const res = await api.put(`/api/admin/categories/${id}`, payload);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await api.delete(`/api/admin/categories/${id}`);
  return res.data;
};

export const getAdminSubcategories = async (params = {}) => {
  const res = await api.get('/api/admin/subcategories', { params });
  return res.data;
};

export const createSubcategory = async (payload) => {
  const res = await api.post('/api/admin/subcategories', payload);
  return res.data;
};

export const getSubcategoryById = async (id) => {
  const res = await api.get(`/api/admin/subcategories/${id}`);
  return res.data;
};

export const updateSubcategory = async (id, payload) => {
  const res = await api.put(`/api/admin/subcategories/${id}`, payload);
  return res.data;
};

export const deleteSubcategory = async (id) => {
  const res = await api.delete(`/api/admin/subcategories/${id}`);
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await api.get('/api/admin/users');
  return res.data;
};

export const createUser = async (payload) => {
  const res = await api.post('/api/admin/users', payload);
  return res.data;
};

export const updateUser = async (id, payload) => {
  const res = await api.put(`/api/admin/users/${id}`, payload);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/api/admin/users/${id}`);
  return res.data;
};

export const getAdminSettings = async () => {
  const res = await api.get('/api/admin/settings');
  return res.data;
};

export const updateAdminSettings = async (payload) => {
  const res = await api.put('/api/admin/settings', payload);
  return res.data;
};

export const deleteAdminSetting = async (key) => {
  const res = await api.delete('/api/admin/settings', { params: { key } });
  return res.data;
};

export const getStorageUrl = async (key) => {
  const res = await api.get('/api/admin/storage/url', { params: { key } });
  return res.data;
};
