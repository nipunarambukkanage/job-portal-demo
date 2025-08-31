import axios, { type AxiosInstance } from "axios";

const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

export const dotnetClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default dotnetClient;
