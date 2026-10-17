import axios from 'axios';

const TOKEN_KEY = 'ste_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => (response.config.responseType === 'blob' ? response : response.data),
  (error) => {
    const message = error.response?.data?.message || 'Không thể kết nối tới máy chủ';
    const details = error.response?.data?.details || null;
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, details, status: error.response?.status });
  }
);

export default client;
