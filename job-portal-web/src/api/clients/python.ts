import axios from "axios";
import { applyInterceptors } from "../interceptors";

/**
 * For Python API, set VITE_PY_API_BASE_URL in .env.
 * Fallbacks to VITE_API_BASE_URL if not provided.
 */
const pyBase =
  (import.meta.env as any).VITE_PY_API_BASE_URL ||
  (import.meta.env as any).VITE_API_BASE_URL ||
  "";

if (!pyBase) {
  // eslint-disable-next-line no-console
  console.warn("[pythonClient] VITE_PY_API_BASE_URL or VITE_API_BASE_URL is not set");
}

export const pythonClient = axios.create({
  baseURL: pyBase,
  timeout: 20_000,
  withCredentials: true,
});

applyInterceptors(pythonClient, { service: "python" });

export default pythonClient;
