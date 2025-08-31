import type { AxiosInstance, AxiosError } from "axios";
import { dotnetClient, pythonClient } from "./axios";
import { mapError } from "./errorMapper";

type TokenGetter = () => string | null | Promise<string | null>;
let tokenGetter: TokenGetter | null = null;

/** Call this once at app bootstrap to provide a token getter (e.g., from Clerk). */
export const setAuthTokenGetter = (fn: TokenGetter) => {
  tokenGetter = fn;
};

const attach = (client: AxiosInstance) => {
  client.interceptors.request.use(async (config) => {
    let token: string | null = null;
    if (tokenGetter) {
      token = await Promise.resolve(tokenGetter());
    }
    if (token) {
      config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${token}` };
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => Promise.reject(mapError(error))
  );
};

attach(dotnetClient);
attach(pythonClient);

export default { setAuthTokenGetter };
