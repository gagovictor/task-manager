export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
}

export interface SignupRequestBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserPayload;
}
