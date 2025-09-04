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

type Ingest = {
  blob_url: string;
  blob_sas_url?: string;
  file_name?: string;
  mime_type?: string;
  size_bytes?: number;
};

export async function ingestResumeToPython(data: Ingest) {
  return pythonClient.post("/v1/resumes/ingest", data);
}
