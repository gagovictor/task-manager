import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import IUserRepository from '../repositories/userRepository';
import { SignupRequest, AuthResponse, LoginRequest } from '../models/user';
import { randomBytes, createHash } from 'crypto';

class AuthService {
  private userRepository: IUserRepository;
  private jwtSecret: string;
  private jwtExpirationTime: string = process.env.JWT_EXPIRATION_TIME || '1d';
  
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
      
      const token = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: this.jwtExpirationTime });
      
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
      
      const token = jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: this.jwtExpirationTime });
      
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
  
  public async recoverPassword(email: string): Promise<void> {
    try {
        const user = await this.userRepository.findByEmail(email);

        if (user) {
            const resetToken = randomBytes(32).toString('hex');
            const hashedToken = createHash('sha256').update(resetToken).digest('hex');
            const tokenExpiration = Date.now() + 3600000; // Token valid for 1 hour

            await this.userRepository.updateUser(user.id, {
                passwordResetToken: hashedToken,
                passwordResetExpires: tokenExpiration,
            });

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

            const emailSubject = 'Password Reset Request';
            const emailBody = `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`;
            // await sendEmail(user.email, emailSubject, emailBody);
        }

        // Regardless of whether the user exists, return success
    } catch (error) {
        console.error('Forgot Password error:', error);
        // Do not throw an error to prevent revealing information
    }
    return;
}
  
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = createHash('sha256').update(token).digest('hex');
    console.log(`token`, token, `hashedToken`, hashedToken);
    const user = await this.userRepository.findByResetToken(hashedToken, Date.now());
    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updateUser(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });
  }
}

export default AuthService;
