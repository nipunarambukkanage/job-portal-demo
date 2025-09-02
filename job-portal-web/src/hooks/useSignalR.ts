import { useEffect, useRef } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { createNotificationsHub } from '../api/signalr/hub';
import { useAuth } from '@clerk/clerk-react';

export function useSignalR(
  onReady?: (connection: HubConnection) => void
): HubConnection | null {
  const { getToken, isSignedIn } = useAuth();
  const connRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const enabled = (import.meta.env.VITE_SIGNALR_ENABLED ?? 'true') !== 'false';
    const apiBase = (import.meta.env.VITE_API_BASE_URL ?? 'https://jobportal-api.proudflower-6b0027cb.centralindia.azurecontainerapps.io').replace(/\/+$/, '');
    const hubUrl = `${apiBase}/hubs/notifications`;

    if (!enabled || !apiBase || !isSignedIn) return;

    const connection = createNotificationsHub(hubUrl, async () => (await getToken()) ?? '');

    connRef.current = connection;

    (async () => {
      try {
        await connection.start();
        onReady?.(connection);
      } catch (err) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('[signalr] failed to start (likely CORS on server):', err);
        }
      }
    })();

    return () => {
      if (connRef.current) {
        connRef.current.stop().catch(() => {});
        connRef.current = null;
      }
    };
  }, [getToken, isSignedIn]);

  return connRef.current;
}
