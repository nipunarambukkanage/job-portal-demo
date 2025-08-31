import type { AxiosError } from "axios";

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  source?: "dotnet" | "python" | "network" | "unknown";
}

export const mapError = (err: unknown): ApiError => {
  const base = new Error("Request failed") as ApiError;
  base.source = "unknown";

  // AxiosError
  if (typeof err === "object" && err !== null && (err as any).isAxiosError) {
    const ax = err as AxiosError<any>;
    base.status = ax.response?.status;

    const data = ax.response?.data as any;
    if (data && typeof data === "object") {
      base.message = data.message || data.error || ax.message || base.message;
      base.code = data.code || data.type || undefined;
      base.details = data.details ?? undefined;
    } else {
      base.message = ax.message || base.message;
    }

    const pyBase = (import.meta.env.VITE_PY_API_BASE_URL ?? "").replace(/\/+$/, "");
    const dnBase = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
    const usedBase = (ax.config?.baseURL ?? "").replace(/\/+$/, "");

    if (usedBase && pyBase && usedBase.startsWith(pyBase)) base.source = "python";
    else if (usedBase && dnBase && usedBase.startsWith(dnBase)) base.source = "dotnet";
    else base.source = "network";

    return base;
  }

  if (err instanceof Error) {
    base.message = err.message || base.message;
    return base;
  }

  return base;
};

export default mapError;
