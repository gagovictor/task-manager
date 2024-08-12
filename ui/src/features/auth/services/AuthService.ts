import axios from 'axios';
import API_BASE_URL from '../../shared/config/apiConfig';

export interface LoginRequest {
    username: string;
    password: string;
  }

  export interface LoginResponse {
    id: string;
    username: string;
    email: string;
  }
    
export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/login`, request);
  return response.data;
};
