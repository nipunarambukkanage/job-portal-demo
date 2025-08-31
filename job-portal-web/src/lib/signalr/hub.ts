import * as signalR from '@microsoft/signalr';
import { SignalREvents } from './events';
import { v4 as uuid } from 'uuid';

export const createHub = (accessTokenFactory?: () => Promise<string | null>) => {
  const url = import.meta.env.VITE_SIGNALR_URL;
  if (!url) return null;
  const conn = new signalR.HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: async () => (accessTokenFactory ? (await accessTokenFactory()) || '' : ''),
      withCredentials: true
    })
    .withAutomaticReconnect()
    .build();

  const start = async () => { if (conn.state === 'Disconnected') await conn.start(); };
  const stop = async () => { if (conn.state !== 'Disconnected') await conn.stop(); };
  const onNotification = (cb: (n: any)=>void) => { conn.on(SignalREvents.Notification, (p)=>cb({ id: uuid(), ...p })); };

  return { conn, start, stop, onNotification };
};
