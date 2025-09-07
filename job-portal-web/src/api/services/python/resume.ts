import { py } from "../../endpoints.python";
import { pythonClient } from "../../axios";

export type IngestResumePayload = {
  blob_url: string;
  blob_sas_url?: string | null;
  file_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  job_id?: string | null;
};

export async function ingestResumeToPython(data: IngestResumePayload, userId?: string) {
  const headers: Record<string, string> = {};
  if (userId) headers["X-User-Id"] = userId;

  const resp = await pythonClient.post<{
    resume_id: string;
    status: string;
    blob_url: string;
    job_id?: string | null;
    application_id?: string | null;
  }>(py.resume.ingest, data, { headers });

  return resp.data;
}
