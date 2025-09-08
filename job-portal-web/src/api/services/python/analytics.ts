import pythonClient from "../../clients/python";

export type AnalyticsQuery = {
  from?: string;    // ISO date (YYYY-MM-DD)
  to?: string;      // ISO date (YYYY-MM-DD)
  user_id?: string; // Python users.id (candidate)
  job_id?: string;  // Job id (python jobs.id)
};

export type AnalyticsSeries = {
  name: string;
  data: Array<{ x: string | number | Date; y: number }>;
};

export async function getAiAnalytics(
  params: AnalyticsQuery = {}
): Promise<AnalyticsSeries[]> {
  const { data } = await pythonClient.get("/ai/analytics", { params });
  return data as AnalyticsSeries[];
}
