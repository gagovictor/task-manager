import { Request, Response } from 'express';
import AuthService from '../services/authService';
import { LoginRequestBody, SignupRequestBody } from '../models/user';


export default class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public signup = async (req: Request<{}, {}, SignupRequestBody>, res: Response): Promise<void> => {
    try {
      // Call the signup service with the request body
      const result = await this.authService.signup(req.body);
      // Send a 201 response with the result
      res.status(201).json(result);
    } catch (error) {
      // Log the error and send a 500 response
      console.error('Registration error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public login = async (req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> => {
    try {
      // Call the login service with the request body
      const result = await this.authService.login(req.body);
      // Send a 200 response with the result
      res.json(result);
    } catch (error) {
      // Log the error and send a 401 response
      console.error('Login error:', error);
      res.status(401).json({ error: (error as Error).message });
    }
  };
}
