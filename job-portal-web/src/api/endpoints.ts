const trimEnd = (s?: string) => (s ? s.replace(/\/+$/, "") : "");

const API = trimEnd(import.meta.env.VITE_API_BASE_URL);
const PY  = trimEnd(import.meta.env.VITE_PY_API_BASE_URL);
const SIGNALR = import.meta.env.VITE_SIGNALR_URL;

/** .NET backend endpoints */
export const dotnet = {
  base: API,

  jobs: {
    root: `${API}/jobs`,
    list: `${API}/jobs`,
    create: `${API}/jobs`,
    detail: (id: string | number) => `${API}/jobs/${id}`,
    update: (id: string | number) => `${API}/jobs/${id}`,
    delete: (id: string | number) => `${API}/jobs/${id}`,
    search: `${API}/jobs/search`,
  },

  orgs: {
    root: `${API}/orgs`,
    list: `${API}/orgs`,
    create: `${API}/orgs`,
    detail: (id: string | number) => `${API}/orgs/${id}`,
    update: (id: string | number) => `${API}/orgs/${id}`,
    delete: (id: string | number) => `${API}/orgs/${id}`,
  },

  applications: {
    root: `${API}/applications`,
    list: `${API}/applications`,
    create: `${API}/applications`,
    detail: (id: string | number) => `${API}/applications/${id}`,
    update: (id: string | number) => `${API}/applications/${id}`,
    delete: (id: string | number) => `${API}/applications/${id}`,
    status: (id: string | number) => `${API}/applications/${id}/status`,
  },

  auth: {
    me: `${API}/auth/me`,
    refresh: `${API}/auth/refresh`,
  },

  notifications: {
    root: `${API}/notifications`,
    stream: `${API}/notifications/stream`,
    markRead: (id: string | number) => `${API}/notifications/${id}/read`,
  },

  signalR: SIGNALR,
};

/** Python backend endpoints */
export const python = {
  base: PY,

  recommendations: {
    forUser: (userId: string | number) => `${PY}/recommendations/${userId}`,
    forJob: (jobId: string | number) => `${PY}/recommendations/job/${jobId}`,
  },

  resume: {
    upload: `${PY}/resume/upload`,
    parse: `${PY}/resume/parse`,
    analyze: `${PY}/resume/analyze`,
  },

  analytics: {
    kpis: `${PY}/analytics/kpis`,
    trends: `${PY}/analytics/trends`,
    heatmap: `${PY}/analytics/heatmap`,
  },
};

const endpoints = { dotnet, python };
export default endpoints;
