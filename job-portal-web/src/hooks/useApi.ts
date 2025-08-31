import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setAuthTokenGetter } from "../api/axios";

/**
 * Hook that registers a token getter with axios once and keeps it fresh.
 * Call this at app bootstrap (e.g., AppProviders) so all API calls carry the Clerk token.
 */
export default function useApi() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(async () => {
      if (!isSignedIn) return null;
      try {
        // If you use a specific JWT template for your backend, set it here:
        //  - Clerk dashboard -> JWT templates -> e.g. "jobportal-api"
        return await getToken({ template: "jobportal-api" }).catch(() => getToken());
      } catch {
        return null;
      }
    });
  }, [getToken, isSignedIn]);
}