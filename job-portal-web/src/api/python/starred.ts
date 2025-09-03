import axios from "axios";

const PY = axios.create({
  baseURL: import.meta.env.VITE_PYAPI_URL || "/pyapi",
});

export async function listStarred(): Promise<string[]> {
  const { data } = await PY.get("/v1/users/me/starred-jobs");
  return data?.jobIds ?? [];
}
export async function addStar(jobId: string): Promise<void> {
  await PY.post("/v1/users/me/starred-jobs", { jobId });
}
export async function removeStar(jobId: string): Promise<void> {
  await PY.delete(`/v1/users/me/starred-jobs/${jobId}`);
}
