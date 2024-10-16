import axios from 'axios';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: { 
    id: string;
    username: string;
    email: string;
  }
}

export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/login`, request);
  return response.data;
};

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  token: string;
  user: { 
    id: string;
    username: string;
    email: string;
  }
}

export const signup = async (request: SignupRequest): Promise<SignupResponse> => {
  const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/signup`, request);
  return response.data;
};

export interface RecoverPasswordRequest {
  email: string;
}

export interface RecoverPasswordResponse {
  message: string;
}

export const recoverPassword = async (request: RecoverPasswordRequest): Promise<RecoverPasswordResponse> => {
  const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/recover-password`, request);
  return response.data;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = async (request: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/reset-password`, request);
  return response.data;
}