import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

const apiBaseUrl = (import.meta as any).env.VITE_API_BASE_URL as string;
const pyApiBaseUrl = (import.meta as any).env.VITE_PY_API_BASE_URL as string;

let tokenGetter: null | (() => Promise<string | null>) = null;

export function setAuthTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn;
}

function setHeader(headers: any, key: string, value: string) {
  if (!headers) return;
  if (typeof headers.set === "function") {
    headers.set(key, value);
  } else {
    headers[key] = value;
  }
}

function getHeader(headers: any, key: string): string | undefined {
  if (!headers) return undefined;
  if (typeof headers.get === "function") {
    return headers.get(key);
  }
  return headers[key];
}

function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        let headers: any = config.headers as any;
        if (!headers) {
          (config as any).headers = {};
          headers = (config.headers as any);
        }

        if (tokenGetter) {
          const token = await tokenGetter();
          if (token) {
            setHeader(headers, "Authorization", `Bearer ${token}`);
          }
        }

        const cid =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? (crypto as any).randomUUID()
            : Math.random().toString(36).slice(2);

        if (!getHeader(headers, "x-correlation-id")) {
          setHeader(headers, "x-correlation-id", cid);
        }
      } catch {
        // continue without auth header
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (resp) => resp,
    (error: AxiosError) => Promise.reject(error)
  );
}

export const dotnetClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl?.replace(/\/+$/, ""),
  withCredentials: false,
});

export const pythonClient: AxiosInstance = axios.create({
  baseURL: pyApiBaseUrl?.replace(/\/+$/, ""),
  withCredentials: false,
});

attachInterceptors(dotnetClient);
attachInterceptors(pythonClient);

export default dotnetClient;
