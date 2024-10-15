import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login, LoginRequest, LoginResponse, RecoverPasswordRequest, RecoverPasswordResponse, ResetPasswordRequest, ResetPasswordResponse, signup, SignupRequest, SignupResponse } from '../services/AuthService';
import { User } from '../models/user';
import { saveTasksToLocalStorage } from '../../tasks/redux/persistTasks';
import { recoverPassword as recoverPasswordAsync } from '../services/AuthService';
import { resetPassword as resetPasswordAsync } from '../services/AuthService';

export interface AuthState {
  isAuthenticated: boolean;
  token: string;
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const user = localStorage.getItem('user');
const parsedUser = user ? JSON.parse(user) : null;

export const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('user'),
  token: localStorage.getItem('token') || '',
  user: parsedUser,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.setItem('token', "");
      localStorage.setItem('user', "");
      saveTasksToLocalStorage([]);
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
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token || "");
      localStorage.setItem('user', JSON.stringify(action.payload.user  || ""));
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Login failed';
    })
    .addCase(signupUser.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(signupUser.fulfilled, (state, action: PayloadAction<SignupResponse>) => {
      state.status = 'idle';
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token || "");
      localStorage.setItem('user', JSON.stringify(action.payload.user  || ""));
    })
    .addCase(signupUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.error.message || 'Login failed';
    });
  },
});

export const loginUser = createAsyncThunk<LoginResponse, LoginRequest>(
  'auth/loginUser',
  async (loginRequest) => {
    const response = await login(loginRequest);
    return response;
  }
);

export const signupUser = createAsyncThunk<SignupResponse, SignupRequest>(
  'auth/signupUser',
  async (signupRequest) => {
    const response = await signup(signupRequest);
    return response;
  }
);


export const recoverPassword = createAsyncThunk<RecoverPasswordResponse, RecoverPasswordRequest>(
  'auth/sendPasswordResetEmail',
  async (recovrPasswordRequest, { rejectWithValue }) => {
    try {
      await recoverPasswordAsync(recovrPasswordRequest);
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const resetPassword = createAsyncThunk<ResetPasswordResponse, ResetPasswordRequest>(
  'auth/resetPassword',
  async ( resetPasswordRequest, { rejectWithValue }) => {
    try {
      const response = await resetPasswordAsync(resetPasswordRequest);
      return response; // Ensure resetPasswordAsync returns ResetPasswordResponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
export default authSlice;

