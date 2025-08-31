import axios from "axios";
import { applyInterceptors } from "./interceptors";

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || "";

export const api = axios.create({
  baseURL,
  timeout: 20_000,
  withCredentials: true,
});

applyInterceptors(api, { service: "dotnet" });

export default api;
