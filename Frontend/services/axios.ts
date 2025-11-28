import axios, {AxiosHeaders} from 'axios'; // <-- Fix 1 applied here (type keyword)
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => { // <-- Fix 2 applied here (removed explicit type)
    const token = Cookies.get('token');

    if (token) {
        // This logic ensures headers exist before adding Authorization
        if (!config.headers) {
            config.headers = new AxiosHeaders({});
        }
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;