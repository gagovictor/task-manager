import { Request, Response } from 'express';
import { LoginRequestBody, SignupRequestBody } from '@src/models/user';
import AuthService from '@src/services/AuthService';

export default class AuthController {
  private AuthService: AuthService;
  
  constructor(AuthService: AuthService) {
    this.AuthService = AuthService;
  }
  
  public signup = async (req: Request<{}, {}, SignupRequestBody>, res: Response): Promise<void> => {
    try {
      const result = await this.AuthService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };
  
  public login = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
    try {
      const result = await this.AuthService.login(req.body);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: (error as Error).message });
    }
  };
  
  public recoverPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      await this.AuthService.recoverPassword(email);
      res.status(200).json({ message: 'Password reset email sent' });
    } catch (error: any) {
      console.error('Forgot Password error:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;
      await this.AuthService.resetPassword(token, password);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('Reset Password error:', error);
      res.status(400).json({ error: error.message });
    }
  };
}
