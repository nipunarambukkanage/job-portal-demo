import pythonClient from "../../clients/python";

export type ResumeInsightsRequest = {
  userId?: string;
  resumeUrl?: string;
  text?: string;
};

export type ResumeInsight = {
  key: string;
  value: string;
  score?: number;
};

export async function getResumeInsights(
  body: ResumeInsightsRequest
): Promise<ResumeInsight[]> {
  const { data } = await pythonClient.post("/ai/resume/insights", body);
  return data as ResumeInsight[];
}
