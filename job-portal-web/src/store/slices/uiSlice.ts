import { createSlice } from '@reduxjs/toolkit';

interface UIState { theme: 'light'|'dark'; globalLoading: boolean; }
const initialState: UIState = { theme: 'light', globalLoading: false };

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(s, a: { payload: 'light'|'dark' }) { s.theme = a.payload; },
    setGlobalLoading(s, a: { payload: boolean }) { s.globalLoading = a.payload; }
  }
});

export const { setTheme, setGlobalLoading } = slice.actions;
export default slice.reducer;
