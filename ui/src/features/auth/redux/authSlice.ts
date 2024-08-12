import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login, LoginRequest, LoginResponse } from '../services/AuthService';
import { User } from '../models/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const user = localStorage.getItem('user');
const parsedUser = user ? JSON.parse(user) : null;

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('user'),
  user: parsedUser,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk<{ token: string; user: User }, LoginRequest>(
  'auth/loginUser',
  async (loginRequest) => {
    const response = await login(loginRequest);
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.status = 'idle';
        state.isAuthenticated = true;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token || "");
        localStorage.setItem('user', JSON.stringify(action.payload.user  || ""));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
