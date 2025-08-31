import axios, { AxiosError } from "axios";

export type ApiError = {
  status?: number;
  code: string;
  message: string;
  details?: unknown;
  correlationId?: string;
  retryAfterMs?: number;
  raw?: unknown;
};

function parseRetryAfter(headers?: Record<string, string | number | boolean>): number | undefined {
  if (!headers) return;
  const h = (headers["retry-after"] ?? headers["Retry-After"]) as string | undefined;
  if (!h) return;
  const asInt = parseInt(h, 10);
  if (!Number.isNaN(asInt)) return asInt * 1000;
  // HTTP-date format
  const d = Date.parse(h);
  if (!Number.isNaN(d)) return d - Date.now();
}

export function mapAxiosError(err: unknown): ApiError {
  if (!axios.isAxiosError(err)) {
    return { code: "UNKNOWN", message: "Unknown error", raw: err };
  }
  const ax = err as AxiosError<any>;
  const status = ax.response?.status;
  const correlationId =
    (ax.response?.headers?.["x-correlation-id"] as string) ||
    (ax.response?.headers?.["X-Correlation-Id"] as string);

  const data = ax.response?.data;

  // .NET ProblemDetails
  if (data && typeof data === "object" && ("title" in data || "detail" in data || "errors" in data)) {
    const pd = data as {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      traceId?: string;
      errors?: Record<string, string[]>;
    };
    const message =
      pd.detail ||
      pd.title ||
      ax.message ||
      `HTTP ${status ?? ""}`.trim();
    const details = pd.errors ?? undefined;

    return {
      status,
      code: (pd.type || "PROBLEM_DETAILS").toString(),
      message,
      details,
      correlationId: correlationId || pd.traceId,
      retryAfterMs: status === 429 ? parseRetryAfter(ax.response?.headers as any) : undefined,
      raw: data,
    };
  }

  // Common custom error shapes
  if (data && typeof data === "object") {
    if ("errorCode" in data || "code" in data || "message" in data) {
      const code = (data.errorCode || data.code || "API_ERROR") as string;
      const message = (data.message || ax.message || "Request failed") as string;
      return {
        status,
        code,
        message,
        details: (data.details ?? data) as unknown,
        correlationId,
        retryAfterMs: status === 429 ? parseRetryAfter(ax.response?.headers as any) : undefined,
        raw: data,
      };
    }
  }

  // FastAPI typical: { detail: "..." } or { detail: [{ msg, type, loc }...] }
  if (data && typeof data === "object" && "detail" in data) {
    const d: any = (data as any).detail;
    const message =
      typeof d === "string"
        ? d
        : Array.isArray(d)
        ? d.map((i: any) => i?.msg || i?.type || "validation error").join("; ")
        : ax.message || "Request failed";
    return {
      status,
      code: "FASTAPI_ERROR",
      message,
      details: d,
      correlationId,
      retryAfterMs: status === 429 ? parseRetryAfter(ax.response?.headers as any) : undefined,
      raw: data,
    };
  }

  // Network / timeout / fallback
  if (ax.code === "ECONNABORTED") {
    return { status, code: "TIMEOUT", message: "The request timed out.", correlationId, raw: data };
  }
  if (ax.message?.toLowerCase().includes("network")) {
    return { status, code: "NETWORK", message: "Network error. Check your connection.", correlationId, raw: data };
  }

  return {
    status,
    code: ax.code || "HTTP_ERROR",
    message: ax.message || `Request failed${status ? ` (HTTP ${status})` : ""}`,
    correlationId,
    retryAfterMs: status === 429 ? parseRetryAfter(ax.response?.headers as any) : undefined,
    raw: data,
  };
}
