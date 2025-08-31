import pythonClient from "../../clients/python";

export type AnalyticsQuery = {
  from?: string; // ISO date
  to?: string;   // ISO date
  cohort?: string;
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
