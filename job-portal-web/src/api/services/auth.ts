import { dotnet } from '../endpoints';
import { dotnetClient } from '../axios';
import { get } from '../client';
import type { User } from '../types/user';

export const authService = {
  me: () => get<User>(dotnetClient, dotnet.auth.me)
};