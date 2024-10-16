// AuthController.test.ts
import { Request, Response } from 'express';
import httpMocks from 'node-mocks-http';
import AuthController from '@src/controllers/AuthController';
import { SignupRequestBody, LoginRequestBody, AuthResponse } from '@src/models/user';
import AuthService from '@src/services/AuthService';

describe('AuthController', () => {
  let mockAuthService: Partial<AuthService>;
  let authController: AuthController;
  let req: httpMocks.MockRequest<Request>;
  let res: httpMocks.MockResponse<Response>;
  
  beforeEach(() => {
    mockAuthService = {
      signup: jest.fn<Promise<AuthResponse>, [SignupRequestBody]>(),
      login: jest.fn<Promise<AuthResponse>, [LoginRequestBody]>(),
      recoverPassword: jest.fn<Promise<void>, [string]>(),
      resetPassword: jest.fn<Promise<void>, [string, string]>(),
    };
    
    authController = new AuthController(mockAuthService as AuthService);
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });
  
  describe('signup', () => {
    it('should respond with 201 and the signup result when successful', async () => {
      // Arrange: Mock request body and signup result
      const mockSignupBody: SignupRequestBody = { username: 'testuser', password: 'testpass', email: 'test@test.com' };
      const mockSignupResult = { id: '1', username: 'testuser', token: 'mockToken' };
      req.body = mockSignupBody;
      
      // Type assertion for Jest's mock functions
      (mockAuthService.signup as jest.Mock).mockResolvedValue(mockSignupResult); 
      
      // Act: Call the signup method
      await authController.signup(req, res);
      
      // Assert: Check response status and data
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(mockSignupResult);
      expect(mockAuthService.signup).toHaveBeenCalledWith(mockSignupBody);
      
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    it('should respond with 500 and an error message when signup fails', async () => {
      // Arrange: Mock error thrown by the signup service
      const mockSignupBody: SignupRequestBody = { username: 'testuser', password: 'testpass', email: 'test@test.com' };
      req.body = mockSignupBody;
      const mockError = new Error('Signup error');
      
      // Type assertion for Jest's mock functions
      (mockAuthService.signup as jest.Mock).mockRejectedValue(mockError);
      
      // Act: Call the signup method
      await authController.signup(req, res);
      
      // Assert: Check response status and error message
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ error: mockError.message });
      expect(mockAuthService.signup).toHaveBeenCalledWith(mockSignupBody);
    });
  });
  
  describe('login', () => {
    it('should respond with 200 and the login result when successful', async () => {
      // Arrange: Mock request body and login result
      const mockLoginBody: LoginRequestBody = { username: 'testuser', password: 'testpass' };
      const mockLoginResult = { id: '1', username: 'testuser', token: 'mockToken' };
      req.body = mockLoginBody;
      
      // Type assertion for Jest's mock functions
      (mockAuthService.login as jest.Mock).mockResolvedValue(mockLoginResult);
      
      // Act: Call the login method
      await authController.login(req, res);
      
      // Assert: Check response status and data
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockLoginResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginBody);
    });
    
    it('should respond with 401 and an error message when login fails', async () => {
      // Arrange: Mock error thrown by the login service
      const mockLoginBody: LoginRequestBody = { username: 'testuser', password: 'testpass' };
      req.body = mockLoginBody;
      const mockError = new Error('Login error');
      
      // Type assertion for Jest's mock functions
      (mockAuthService.login as jest.Mock).mockRejectedValue(mockError);
      
      // Act: Call the login method
      await authController.login(req, res);
      
      // Assert: Check response status and error message
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({ error: mockError.message });
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginBody);
    });
  });

  describe('recoverPassword', () => {
    it('should respond with 200 and a success message when recoverPassword is successful', async () => {
      // Arrange
      const mockEmail = 'test@example.com';
      req.body = { email: mockEmail };

      (mockAuthService.recoverPassword as jest.Mock).mockResolvedValue(undefined);

      // Act
      await authController.recoverPassword(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Password reset email sent' });
      expect(mockAuthService.recoverPassword).toHaveBeenCalledWith(mockEmail);
    });

    it('should respond with 500 and an error message when recoverPassword fails', async () => {
      // Arrange
      const mockEmail = 'test@example.com';
      req.body = { email: mockEmail };
      const mockError = new Error('Recover password error');

      (mockAuthService.recoverPassword as jest.Mock).mockRejectedValue(mockError);

      // Act
      await authController.recoverPassword(req, res);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ error: mockError.message });
      expect(mockAuthService.recoverPassword).toHaveBeenCalledWith(mockEmail);
    });
  });

  describe('resetPassword', () => {
    it('should respond with 200 and a success message when resetPassword is successful', async () => {
      // Arrange
      const mockToken = 'mockToken';
      const mockPassword = 'newPassword123';
      req.body = { token: mockToken, password: mockPassword };

      (mockAuthService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      // Act
      await authController.resetPassword(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Password reset successfully' });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(mockToken, mockPassword);
    });

    it('should respond with 400 and an error message when resetPassword fails', async () => {
      // Arrange
      const mockToken = 'mockToken';
      const mockPassword = 'newPassword123';
      req.body = { token: mockToken, password: mockPassword };
      const mockError = new Error('Reset password error');

      (mockAuthService.resetPassword as jest.Mock).mockRejectedValue(mockError);

      // Act
      await authController.resetPassword(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ error: mockError.message });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(mockToken, mockPassword);
    });
  });
});
