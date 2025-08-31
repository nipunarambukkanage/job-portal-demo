import { dotnet } from "../endpoints";
import { dotnetClient } from "../axios";
import { get, post, put } from "../client";
import type { Application } from "../types/application";
import type { Paged } from "../types/common";

export type ApplicationsQuery = {
  page?: number;
  pageSize?: number;
  jobId?: string;
  status?: Application["status"];
};

export const applicationsService = {
  list: (query?: ApplicationsQuery) =>
    get<Paged<Application>>(dotnetClient, dotnet.applications.list, query),
  detail: (id: string) => get<Application>(dotnetClient, dotnet.applications.detail(id)),
  create: (data: Partial<Application>) =>
    post<Application>(dotnetClient, dotnet.applications.create, data),
  update: (id: string, data: Partial<Application>) =>
    put<Application>(dotnetClient, dotnet.applications.update(id), data),
  setStatus: (id: string, status: Application["status"]) =>
    put<Application>(dotnetClient, dotnet.applications.status(id), { status }),
};
