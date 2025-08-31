import { dotnet } from "../endpoints";
import { dotnetClient } from "../axios";
import { get, put } from "../client";
import type { Notification } from "../types/notifications";

export const notificationsService = {
  list: () => get<Notification[]>(dotnetClient, dotnet.notifications.root),
  markRead: (id: string) => put<void>(dotnetClient, dotnet.notifications.markRead(id), {}),
};
