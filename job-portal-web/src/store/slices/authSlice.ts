import { createSlice } from "@reduxjs/toolkit";
import type { Role } from '../../utils/roles';

interface AuthState { isSignedIn: boolean; role: Role | null; email?: string | null; name?: string | null; }
const initialState: AuthState = { isSignedIn: false, role: null, email: null, name: null };

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn(s, a: { payload: { role: Role; email?: string; name?: string } }) {
      s.isSignedIn = true; s.role = a.payload.role; s.email = a.payload.email ?? null; s.name = a.payload.name ?? null;
    },
    signedOut(s) { Object.assign(s, initialState); }
  }
});

export const { signedIn, signedOut } = slice.actions;
export default slice.reducer;
