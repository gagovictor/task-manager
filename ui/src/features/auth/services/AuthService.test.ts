import axios from 'axios';
import { login, signup, LoginRequest, LoginResponse, SignupRequest, SignupResponse } from './AuthService';
import API_BASE_URL from '../../shared/config/apiConfig';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('login', () => {
        it('should return login response data when API call is successful', async () => {
            const request: LoginRequest = { username: 'testuser', password: 'password123' };
            const response: LoginResponse = {
                token: 'fake-token',
                user: {
                    id: 'user-id',
                    username: 'testuser',
                    email: 'test@example.com'
                }
            };
            mockedAxios.post.mockResolvedValue({ data: response });

            const result = await login(request);

            expect(result).toEqual(response);
            expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE_URL}/login`, request);
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const request: LoginRequest = { username: 'testuser', password: 'password123' };
            mockedAxios.post.mockRejectedValue(new Error('Network Error'));

            await expect(login(request)).rejects.toThrow('Network Error');
        });
    });

    describe('signup', () => {
        it('should return signup response data when API call is successful', async () => {
            const request: SignupRequest = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            const response: SignupResponse = {
                token: 'fake-token',
                user: {
                    id: 'user-id',
                    username: 'testuser',
                    email: 'test@example.com'
                }
            };
            mockedAxios.post.mockResolvedValue({ data: response });

            const result = await signup(request);

            expect(result).toEqual(response);
            expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE_URL}/signup`, request);
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if the API call fails', async () => {
            const request: SignupRequest = { username: 'testuser', email: 'test@example.com', password: 'password123' };
            mockedAxios.post.mockRejectedValue(new Error('Network Error'));

            await expect(signup(request)).rejects.toThrow('Network Error');
        });
    });
});
