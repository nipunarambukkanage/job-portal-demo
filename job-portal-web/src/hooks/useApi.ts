import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setAuthTokenGetter } from "../api/axios";

/**
 * Registers a token getter so all Axios clients include the Clerk JWT.
 * Call this once near app startup (e.g., in AppProviders).
 */
export function useApiBridge() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    // Provide a stable async getter to axios; it can be called on every request.
    const getter = async (): Promise<string | null> => {
      if (!isLoaded || !isSignedIn) return null;
      try {
        // If you use Clerk JWT templates, set it here; otherwise omit.
        const token = await getToken();
        return token ?? null;
      } catch {
        return null;
      }
    };

    setAuthTokenGetter(getter);
  }, [isLoaded, isSignedIn, getToken]);
}

export default useApiBridge;