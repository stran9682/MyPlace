import axios, { AxiosHeaders } from 'axios'
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {

  const token = Cookies.get('token');

  if (token) {
   
    if (!config.headers) {
      config.headers = new AxiosHeaders({});
    }
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
