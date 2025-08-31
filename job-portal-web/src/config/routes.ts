export const ROUTES = {
  home: '/',
  search: '/search',
  jobs: '/jobs',
  job: (id: string | number) => \/jobs/\\,
  orgs: '/orgs',
  applications: '/applications',
  dashboard: '/dashboard',
  admin: '/admin',
  ai: '/ai',
  profile: '/profile',
  settings: '/settings',
  errors: {
    notFound: '/404',
    forbidden: '/403',
    rateLimited: '/429'
  }
} as const;
