import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { Notification } from '../../api/types/notifications';

interface State { items: Notification[]; }
const initialState: State = { items: [] };

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(s, a: PayloadAction<Notification>) { s.items.unshift(a.payload); },
    markRead(s, a: PayloadAction<string>) { const n = s.items.find(i => i.id === a.payload); if (n) n.read = true; }
  }
});

export const { addNotification, markRead } = slice.actions;
export default slice.reducer;
