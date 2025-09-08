import { pythonClient } from "../../axios";

const PY_BASE = import.meta.env.VITE_PY_API_BASE_URL as string;

export type PyUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role: "org:member" | "org:admin";
  headline?: string | null;
  about?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateUserPayload = {
  email: string;
  full_name?: string | null;
  headline?: string | null;
  about?: string | null;
  role?: "org:member" | "org:admin";
};

export async function getUserByEmail(email: string): Promise<PyUser | null> {
  const url = `${PY_BASE}/v1/users/by-email?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`getUserByEmail failed: ${res.status} ${text}`);
  }
  return (await res.json()) as PyUser;
}

export async function createUser(
  payload: CreateUserPayload,
  externalUserId?: string, // Clerk id if it’s a GUID
): Promise<PyUser> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (externalUserId) headers["X-External-User-Id"] = externalUserId;

  const res = await fetch(`${PY_BASE}/v1/users`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`createUser failed: ${res.status} ${text}`);
  }
  return (await res.json()) as PyUser;
}


export type PyUserForAnalytics = {
  id: string;
  email: string;
  full_name?: string | null;
  role: "org:member" | "org:admin";
};

export async function listUsers(limit = 100, offset = 0): Promise<PyUserForAnalytics[]> {
  const { data } = await pythonClient.get("/v1/users", { params: { limit, offset } });
  return data as PyUser[];
}
