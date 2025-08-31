export type RoutePath = string | ((...args: any[]) => string);

export const ROUTES = {
  home: "/",
  search: "/search",

  jobs: {
    root: "/jobs",
    list: "/jobs",
    create: "/jobs/create",
    detail: (id: string | number) => `/jobs/${id}`,
    edit: (id: string | number) => `/jobs/${id}/edit`,
  },

  orgs: {
    root: "/orgs",
    list: "/orgs",
    create: "/orgs/create",
    detail: (id: string | number) => `/orgs/${id}`,
    edit: (id: string | number) => `/orgs/${id}/edit`,
  },

  applications: {
    root: "/applications",
    list: "/applications",
    detail: (id: string | number) => `/applications/${id}`,
    status: (id: string | number) => `/applications/${id}/status`,
  },

  dashboard: {
    user: "/dashboard",
    admin: "/admin",
  },

  ai: {
    recommendations: "/ai/recommendations",
    resume: "/ai/resume",
    analytics: "/ai/analytics",
  },

  profile: "/profile",
  settings: "/settings",

  errors: {
    notFound: "/404",
    forbidden: "/403",
    rateLimited: "/429",
  },
} as const;

export default ROUTES;
