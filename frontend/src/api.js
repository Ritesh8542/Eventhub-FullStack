import axios from 'axios';

// In dev, Vite proxies /api to the backend. In production (Nginx) the
// same /api path is proxied — so a relative base URL works in both.
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('eventhub_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default api;
