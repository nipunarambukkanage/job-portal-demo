import axios from "axios";
import { applyInterceptors } from "../interceptors";

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || "";
if (!baseURL) {
  // eslint-disable-next-line no-console
  console.warn("[dotnetClient] VITE_API_BASE_URL is not set");
}

export const dotnetClient = axios.create({
  baseURL,
  timeout: 20_000,
  withCredentials: true,
});

applyInterceptors(dotnetClient, { service: "dotnet" });

export default dotnetClient;
