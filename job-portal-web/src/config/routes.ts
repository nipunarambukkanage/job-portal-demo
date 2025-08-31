/**
 * Client-side routes/path builders.
 */
const routes = {
  home: "/",
  search: "/search",
  jobs: "/jobs",
  job: (id: string | number) => `/jobs/${id}`,
  orgs: "/orgs",
  org: (id: string | number) => `/orgs/${id}`,
  applications: "/applications",
  application: (id: string | number) => `/applications/${id}`,
  dashboard: "/dashboard",
  admin: "/admin",
  profile: "/profile",
  settings: "/settings",
  rateLimited: "/rate-limited",
  notFound: "*",
} as const;

export type AppRoutes = typeof routes;
export default routes;
