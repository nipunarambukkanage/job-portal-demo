import axios, { AxiosInstance } from "axios";
import { applyInterceptors } from "../interceptors";

/**
 * Prefer a dedicated Python base URL if provided, otherwise fall back to VITE_API_BASE_URL.
 * In Azure, set VITE_PY_API_BASE_URL to your api-python Container App ingress URL (e.g., https://api-python.<env>.azurecontainerapps.io/api).
 */
const baseURL =
  (import.meta.env.VITE_PY_API_BASE_URL as string) ||
  (import.meta.env.VITE_API_BASE_URL as string) ||
  "";

export const pythonClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true,
});

applyInterceptors(pythonClient, { service: "python" });

export default pythonClient;
