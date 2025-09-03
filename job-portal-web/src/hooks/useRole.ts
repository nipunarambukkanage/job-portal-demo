import { useUser, useSession } from "@clerk/clerk-react";

export type AppRole = "org:admin" | "org:member";

export default function useRole(): AppRole {
  const { user } = useUser();
  const { session } = useSession();

  // 1) Prefer Clerk publicMetadata.role if you�re setting it
  const metaRole = (user?.organizationMemberships[0]?.role as string | undefined)?.toLowerCase();
  if (metaRole === "org:admin" || metaRole === "org:member") return metaRole;

  // 2) Fallback: token claim "org_role" if present
  const orgRole = (session?.user?.organizationMemberships?.[0]?.role as string | undefined)?.toLowerCase();
  if (orgRole === "org:admin" || orgRole === "org:member") return orgRole;

  // Default
  return "org:member";
}
