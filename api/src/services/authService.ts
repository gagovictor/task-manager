import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import IUserRepository from '../repositories/userRepository';
import { SignupRequest, AuthResponse, LoginRequest } from '../models/user';

class AuthService {
  private userRepository: IUserRepository;
  private jwtSecret: string;
  
  constructor(userRepository: IUserRepository, jwtSecret: string) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
  }
  
  public async signup({ username, password, email }: SignupRequest): Promise<AuthResponse> {
    try {
      const existingUser = await this.userRepository.findByUsernameOrEmail(username, email);
      
      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error('Username already exists');
        }
        if (existingUser.email === email) {
          throw new Error('Email already in use');
        }
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await this.userRepository.createUser({
        username,
        email,
        password: hashedPassword,
      });
      
      const token = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '1h' });
      
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error: any) {
      if (error.message === 'Username already exists' || error.message === 'Email already in use') {
        throw error;
      }
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  }
  
  public async login({ username, password }: LoginRequest): Promise<AuthResponse> {
    try {
      const user = await this.userRepository.findByUsername(username);
      if (!user) {
        throw new Error('No user found with this username');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Incorrect password');
      }
      
      const token = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '1h' });
      
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error: any) {
      if (error.message === 'No user found with this username' || error.message === 'Incorrect password') {
        throw error;
      }
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }
}

export default AuthService;
