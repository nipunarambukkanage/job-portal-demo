import pythonClient from "../clients/python";
/** ---------- Types ---------- */
export type CandidateProfile = {
  id?: string | number;
  skills?: string[];
  [k: string]: unknown;
};

export type Job = {
  id: string | number;
  title?: string;
  company?: string;
  location?: string;
  skills?: string[];
  [k: string]: unknown;
};

/** ---------- Candidate ---------- */
export async function getCandidateMe(): Promise<CandidateProfile> {
  const { data } = await pythonClient.get("/v1/candidates/me");
  return data as CandidateProfile;
}

/** ---------- Jobs ---------- */
export async function listJobs(): Promise<Job[]> {
  const { data } = await pythonClient.get("/v1/jobs");
  // Some backends wrap results in { items: [...] }; normalize to array
  return Array.isArray(data) ? (data as Job[]) : (data?.items as Job[]) ?? [];
}

export async function getJobCandidates(
  jobId: string | number
): Promise<CandidateProfile[]> {
  const { data } = await pythonClient.get(`/v1/jobs/${jobId}/candidates`);
  return Array.isArray(data)
    ? (data as CandidateProfile[])
    : (data?.items as CandidateProfile[]) ?? [];
}

/** ---------- Resumes ---------- */
export type ResumeIngestPayload = { text?: string; url?: string };
export type ResumeIngestResponse = {
  resume_id?: string;
  id?: string;
  [k: string]: unknown;
};

export async function ingestResume(
  payload: ResumeIngestPayload
): Promise<ResumeIngestResponse> {
  const { data } = await pythonClient.post("/v1/resumes/ingest", payload);
  return data as ResumeIngestResponse;
}

export async function getResumeFeatures(resumeId: string): Promise<unknown> {
  const { data } = await pythonClient.get(
    `/v1/resumes/${encodeURIComponent(resumeId)}/features`
  );
  return data;
}

/** Helper: ingest then poll features (best-effort). */
export async function ingestAndWaitForFeatures(
  payload: ResumeIngestPayload,
  opts: { pollMs?: number; timeoutMs?: number } = {}
): Promise<{ resumeId: string; features: unknown | null }> {
  const pollMs = opts.pollMs ?? 1500;
  const timeoutMs = opts.timeoutMs ?? 15000;
  const started = Date.now();

  const ingestRes = await ingestResume(payload);
  const resumeId =
    (ingestRes as any).resume_id ??
    (ingestRes as any).id ??
    (ingestRes as any).resumeId;

  if (!resumeId) {
    throw new Error("Resume ingest did not return a resume_id");
  }

  while (true) {
    try {
      const features = await getResumeFeatures(resumeId);
      if (features) return { resumeId, features };
    } catch {
      // swallow until ready or timeout
    }
    if (Date.now() - started > timeoutMs) return { resumeId, features: null };
    await new Promise((r) => setTimeout(r, pollMs));
  }
}

/** ---------- Analytics ---------- */
export async function getEmployerAnalytics(
  employerId: string | number
): Promise<unknown> {
  const { data } = await pythonClient.get(
    `/v1/analytics/employer/${encodeURIComponent(String(employerId))}`
  );
  return data;
}

/** ---------- Local helpers (client-side score) ---------- */
export function overlapScore(a?: string[], b?: string[]): number {
  if (!a?.length || !b?.length) return 0;
  const setB = new Set(b.map((s) => s.toLowerCase()));
  return a.reduce((acc, s) => (setB.has(s.toLowerCase()) ? acc + 1 : acc), 0);
}
