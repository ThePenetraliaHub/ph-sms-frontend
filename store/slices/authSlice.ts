import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/services/auth/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

// Reads token + user from httpOnly cookies via the Next.js session route
export const rehydrateAuth = createAsyncThunk("auth/rehydrate", async () => {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    const { token, user } = await res.json();
    if (!token || !user) return null;
    return { token, user } as { token: string; user: AuthUser };
  } catch {
    return null;
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) => {
      const { token, user } = action.payload;
      if (!token || !user) return;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },

    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(rehydrateAuth.fulfilled, (state, action) => {
      if (!action.payload) return;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
