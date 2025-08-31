import axios, { AxiosInstance } from 'axios';
import { errorMapper } from './errorMapper';

let tokenGetter: (() => Promise<string | null>) | null = null;
export const setAuthTokenGetter = (fn: () => Promise<string | null>) => { tokenGetter = fn; };

const withInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(async (config) => {
    if (tokenGetter) {
      const t = await tokenGetter();
      if (t) config.headers = { ...config.headers, Authorization: \Bearer \\ };
    }
    return config;
  });
  client.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(errorMapper(err))
  );
  return client;
};

export const dotnetClient = () =>
  withInterceptors(axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL }));

export const pythonClient = () =>
  withInterceptors(axios.create({ baseURL: import.meta.env.VITE_PY_API_BASE_URL || '' }));
