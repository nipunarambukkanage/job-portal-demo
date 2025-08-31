import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createHub } from '../lib/signalr/hub';
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';

export const useSignalR = () => {
  const { getToken } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hub = createHub(() => getToken());
    if (!hub) return;
    hub.onNotification((n)=>dispatch(addNotification(n)));
    hub.start();

    return () => { hub.stop(); };
  }, [getToken, dispatch]);
};
