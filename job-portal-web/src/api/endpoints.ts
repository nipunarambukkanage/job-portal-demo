export const dotnet = {
  auth: { me: '/auth/me' },
  jobs: {
    list: '/jobs',
    detail: (id: string | number) => \/jobs/\\,
    create: '/jobs',
    update: (id: string | number) => \/jobs/\\,
    delete: (id: string | number) => \/jobs/\\
  },
  orgs: {
    list: '/orgs',
    detail: (id: string | number) => \/orgs/\\
  },
  applications: {
    list: '/applications',
    detail: (id: string | number) => \/applications/\\
  },
  notifications: { list: '/notifications' }
} as const;
