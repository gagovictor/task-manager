import authReducer, { loginUser, signupUser, logout, initialState, AuthState } from './authSlice';
import { AnyAction } from 'redux';
import { LoginResponse, SignupResponse } from '../services/AuthService';
import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';

const store = configureStore({
    reducer: authReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return the initial state', () => {
    expect(authReducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it('should handle logout action', () => {
    const loggedInState: AuthState = {
      isAuthenticated: true,
      token: 'mockToken',
      user: { id: '1', username: 'User', email: 'a@a.com' },
      status: 'idle',
      error: null,
    };

    const state = authReducer(loggedInState, logout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should handle loginUser.pending', () => {
    const action = { type: loginUser.pending.type };
    const state = authReducer(initialState, action);
    expect(state.status).toBe('loading');
  });

  it('should handle loginUser.fulfilled', () => {
    const mockLoginResponse: LoginResponse = {
      token: 'mockToken',
      user: { id: '1', username: 'User', email: 'a@a.com' },
    };

    const action = { type: loginUser.fulfilled.type, payload: mockLoginResponse };
    const state = authReducer(initialState, action);
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('mockToken');
    expect(state.user).toEqual(mockLoginResponse.user);
  });

  it('should handle loginUser.rejected', () => {
    const action = { type: loginUser.rejected.type, error: { message: 'Login failed' } };
    const state = authReducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Login failed');
  });

  it('should handle signupUser.pending', () => {
    const action = { type: signupUser.pending.type };
    const state = authReducer(initialState, action);
    expect(state.status).toBe('loading');
  });

  it('should handle signupUser.fulfilled', () => {
    const mockSignupResponse: SignupResponse = {
      token: 'mockToken',
      user: { id: '1', username: 'User', email: 'a@a.com' },
    };

    const action = { type: signupUser.fulfilled.type, payload: mockSignupResponse };
    const state = authReducer(initialState, action);
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('mockToken');
    expect(state.user).toEqual(mockSignupResponse.user);
  });

  it('should handle signupUser.rejected', () => {
    const action = { type: signupUser.rejected.type, error: { message: 'Signup failed' } };
    const state = authReducer(initialState, action);
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Signup failed');
  });

  it('should store user data in localStorage on loginUser.fulfilled', () => {
    const mockLoginResponse: LoginResponse = {
      token: 'mockToken',
      user: { id: '1', username: 'User', email: 'a@a.com' },
    };

    const action = { type: loginUser.fulfilled.type, payload: mockLoginResponse };
    authReducer(initialState, action);

    expect(localStorage.getItem('token')).toBe('mockToken');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockLoginResponse.user));
  });

  it('should store user data in localStorage on signupUser.fulfilled', () => {
    const mockSignupResponse: SignupResponse = {
      token: 'mockToken',
      user: { id: '1', username: 'User', email: 'a@a.com' },
    };

    const action = { type: signupUser.fulfilled.type, payload: mockSignupResponse };
    authReducer(initialState, action);

    expect(localStorage.getItem('token')).toBe('mockToken');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockSignupResponse.user));
  });
});
