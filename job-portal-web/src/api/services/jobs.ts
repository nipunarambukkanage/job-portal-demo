import { dotnet } from '../endpoints';
import { dotnetClient } from '../axios';
import { get, post, put, del } from '../client';
import type { Job } from '../types/job';
import type { Paged } from '../types/common';

export const jobsService = {
  list: (query?: any) => get<Paged<Job>>(dotnetClient(), dotnet.jobs.list, query),
  detail: (id: string) => get<Job>(dotnetClient(), dotnet.jobs.detail(id)),
  create: (data: Partial<Job>) => post<Job>(dotnetClient(), dotnet.jobs.create, data),
  update: (id: string, data: Partial<Job>) => put<Job>(dotnetClient(), dotnet.jobs.update(id), data),
  delete: (id: string) => del<void>(dotnetClient(), dotnet.jobs.delete(id))
};
