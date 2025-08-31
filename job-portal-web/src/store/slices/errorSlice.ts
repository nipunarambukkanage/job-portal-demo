import { createSlice } from '@reduxjs/toolkit';
interface ErrorState { lastError?: string | null; }
const initial: ErrorState = { lastError: null };
const slice = createSlice({
  name: 'errors',
  initialState: initial,
  reducers: { setError(s, a: { payload: string | null }) { s.lastError = a.payload; } }
});
export const { setError } = slice.actions;
export default slice.reducer;
