import { dotnet } from "../endpoints";
import { dotnetClient } from "../axios";

export type SearchParams = { q: string; page?: number; pageSize?: number };

export async function searchJobsApi({ q, page = 1, pageSize = 20 }: SearchParams) {
  const resp = await dotnetClient.get(dotnet.jobs.search, { params: { q, page, pageSize } });
  const data = resp.data;
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  const total = typeof data?.total === "number" ? data.total : items.length;
  return { items, total };
}

export const searchService = { search: searchJobsApi };
export default searchService;
