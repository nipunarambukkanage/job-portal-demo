/**
 * REST endpoints for the .NET API (and a few Python AI routes if they are proxied under the same base).
 * Adjust paths here to match your backend.
 */
export const endpoints = {
  auth: {
    me: "/auth/me",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
  },
  search: "/search",
  jobs: {
    root: "/jobs",
    list: "/jobs",
    detail: (id: string | number) => `/jobs/${id}`,
    create: "/jobs",
    update: (id: string | number) => `/jobs/${id}`,
    delete: (id: string | number) => `/jobs/${id}`,
  },
  orgs: {
    root: "/orgs",
    list: "/orgs",
    detail: (id: string | number) => `/orgs/${id}`,
    create: "/orgs",
    update: (id: string | number) => `/orgs/${id}`,
    delete: (id: string | number) => `/orgs/${id}`,
  },
  applications: {
    root: "/applications",
    list: "/applications",
    detail: (id: string | number) => `/applications/${id}`,
    create: "/applications",
    update: (id: string | number) => `/applications/${id}`,
    delete: (id: string | number) => `/applications/${id}`,
  },
  notifications: {
    list: "/notifications",
    markRead: (id: string | number) => `/notifications/${id}/read`,
  },
  // If your Python AI endpoints are exposed via the same API base path:
  ai: {
    recommendations: "/ai/recommendations",
    resumeInsights: "/ai/resume/insights",
    analytics: "/ai/analytics",
  },
} as const;

export type Endpoints = typeof endpoints;
export default endpoints;
