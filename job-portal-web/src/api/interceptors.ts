import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { mapAxiosError } from "./errorMapper";

// Minimal typing to access Clerk from window when using <ClerkProvider />
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (opts?: any) => Promise<string | null>;
      } | null;
    };
  }
}

type Options = {
  service?: string;
};

function generateCorrelationId(): string {
  // RFC4122-ish
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function tryGetClerkToken(): Promise<string | null> {
  try {
    if (window?.Clerk?.session?.getToken) {
      return await window.Clerk.session.getToken();
    }
  } catch {
    /* no-op */
  }
  return null;
}

export function applyInterceptors(client: AxiosInstance, opts?: Options): AxiosInstance {
  // REQUEST
  client.interceptors.request.use(async (config: AxiosRequestConfig) => {
    config.headers = config.headers ?? {};

    // Correlation
    (config.headers as any)["X-Correlation-Id"] =
      (config.headers as any)["X-Correlation-Id"] || generateCorrelationId();

    // Accept
    (config.headers as any)["Accept"] = "application/json";

    // Auth (Clerk, if available)
    const token = await tryGetClerkToken();
    if (token) {
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }

    // Service hint (useful for server logs)
    if (opts?.service) {
      (config.headers as any)["X-Client-Service"] = `web:${opts.service}`;
    }

    return config;
  });

  // RESPONSE
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: any) => {
      const mapped = mapAxiosError(error);

      // Handle rate limiting globally by routing to a friendly page
      if (mapped.status === 429) {
        const ms = mapped.retryAfterMs ?? 0;
        const secs = Math.max(0, Math.round(ms / 1000));
        const url = `/rate-limited?retryAfter=${secs}`;
        // Avoid infinite loops
        if (typeof window !== "undefined" && window.location.pathname !== "/rate-limited") {
          setTimeout(() => {
            window.location.assign(url);
          }, 0);
        }
      }

      return Promise.reject(mapped);
    }
  );

  return client;
}
