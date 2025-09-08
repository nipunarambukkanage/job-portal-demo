import pythonClient from "../../clients/python";

export type PyApplicationCreate = {
  job_id: string;
  applicant_user_id: string;          // TEXT in Python DB (can be your Python user id or Clerk id you store)
  resume_id?: string | null;
  resume_url?: string | null;         // optional convenience
  cover_letter?: string | null;       // optional
  status?: string | null;             // optional; server default 'submitted'
};

export type PyApplicationRead = {
  id: string;
};

export async function createPyApplication(body: PyApplicationCreate) {
  const { data } = await pythonClient.post<PyApplicationRead>("/v1/applications", body);
  return data;
}
