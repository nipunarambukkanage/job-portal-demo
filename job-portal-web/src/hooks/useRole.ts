import { useUser, useSession } from "@clerk/clerk-react";

export type AppRole = "org:admin" | "org:member";

export default function useRole(): AppRole {
  const { user } = useUser();
  const { session } = useSession();

  const metaRole = (user?.organizationMemberships[0]?.role as string | undefined)?.toLowerCase();
  if (metaRole === "org:admin" || metaRole === "org:member") return metaRole;

  const orgRole = (session?.user?.organizationMemberships?.[0]?.role as string | undefined)?.toLowerCase();
  if (orgRole === "org:admin" || orgRole === "org:member") return orgRole;

  return "org:member";
}
