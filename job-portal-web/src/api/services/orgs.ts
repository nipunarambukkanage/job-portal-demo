import { dotnet } from "../endpoints";
import { dotnetClient } from "../axios";
import { get, post, put, del } from "../client";
import type { Org } from "../types/org";
import type { Paged } from "../types/common";

export const orgsService = {
  list: (query?: { page?: number; pageSize?: number }) =>
    get<Paged<Org>>(dotnetClient, dotnet.orgs.list, query),
  detail: (id: string) => get<Org>(dotnetClient, dotnet.orgs.detail(id)),
  create: (data: Partial<Org>) => post<Org>(dotnetClient, dotnet.orgs.create, data),
  update: (id: string, data: Partial<Org>) => put<Org>(dotnetClient, dotnet.orgs.update(id), data),
  delete: (id: string) => del<void>(dotnetClient, dotnet.orgs.delete(id)),
};
