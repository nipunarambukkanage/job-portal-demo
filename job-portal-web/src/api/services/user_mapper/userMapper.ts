export type PyUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
  headline?: string | null;
  about?: string | null;
  created_at?: string;
  updated_at?: string;
};

const PY_API = import.meta.env.VITE_PY_API_BASE_URL?.replace(/\/+$/, "") || "";

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = await res.json();
    } catch {
      // ignore
    }
    throw new Error(
      `API ${res.status} ${res.statusText}` +
        (detail ? ` — ${JSON.stringify(detail)}` : "")
    );
  }
  return res.json();
}

export async function getUserByEmail(email: string): Promise<PyUser | null> {
  try {
    return await http<PyUser>(`${PY_API}/v1/users/by-email?email=${encodeURIComponent(email)}`);
  } catch (err: any) {
    // backend returns 404 when not found — treat as null
    if (String(err.message).includes("404")) return null;
    throw err;
  }
}

type EnsureUserBody = {
  email: string;
  full_name?: string | null;
  // IMPORTANT: DON'T SEND role unless your backend enum matches your DB.
  // headline/about are safe to send.
  role?: "org:member";
  headline?: string | null;
  about?: string | null;
};

export async function ensureUser(body: EnsureUserBody): Promise<PyUser> {
  return http<PyUser>(`${PY_API}/v1/users/ensure`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<PyUser, "full_name" | "headline" | "about">>
): Promise<PyUser> {
  return http<PyUser>(`${PY_API}/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
