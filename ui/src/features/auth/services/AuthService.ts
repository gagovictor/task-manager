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
  console.log(process.env)
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
