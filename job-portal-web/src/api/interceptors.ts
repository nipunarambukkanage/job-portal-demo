import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import { dotnetClient, pythonClient } from "./axios";
import { mapError } from "./errorMapper";

type TokenGetter = () => string | null | Promise<string | null>;
let tokenGetter: TokenGetter | null = null;

export const setAuthTokenGetter = (fn: TokenGetter) => {
  tokenGetter = fn;
};

const attach = (client: AxiosInstance) => {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      let token: string | null = null;
      if (tokenGetter) {
        token = await Promise.resolve(tokenGetter());
      }
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(mapError(error))
  );

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => Promise.reject(mapError(error))
  );
};

attach(dotnetClient);
attach(pythonClient);

export default { setAuthTokenGetter };