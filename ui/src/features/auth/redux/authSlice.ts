import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login, LoginRequest, LoginResponse } from '../services/AuthService';
import { User } from '../models/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk<LoginResponse, LoginRequest>(
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
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.status = 'idle';
        state.isAuthenticated = true;
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email,
        };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
