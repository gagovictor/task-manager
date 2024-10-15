import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { SignupRequest, LoginRequest, User } from '@src/models/user';
import IUserRepository from '@src/abstractions/repositories/IUserRepository';
import { IEmailNotificationService } from '@src/abstractions/services/IEmailNotificationService';
import AuthService from '@src/services/AuthService';

describe('AuthService', () => {
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockEmailNotificationService: jest.Mocked<IEmailNotificationService>;
    let AuthService: AuthService;
    const jwtSecret = 'test-secret';
    
    beforeEach(() => {
        mockUserRepository = {
            findByUsernameOrEmail: jest.fn<Promise<User | null>, [string, string]>(),
            findByUsername: jest.fn<Promise<User | null>, [string]>(),
            findByEmail: jest.fn<Promise<User>, [string]>(),
            findByResetToken: jest.fn<Promise<User>, [string, number]>(),
            findById: jest.fn<Promise<User>, [string]>(),
            createUser: jest.fn<Promise<User>, [Partial<User>]>(),
            updateUser: jest.fn<Promise<User>, [string, Partial<User>]>(),
        };
        mockEmailNotificationService = {
            sendPasswordResetEmail: jest.fn<Promise<void>, [string, string]>(),
            sendWelcomeEmail: jest.fn<Promise<void>, [string, string]>(),
        };
        
        AuthService = new AuthService(mockUserRepository, mockEmailNotificationService, jwtSecret);
            
        jest.spyOn(bcrypt, 'hash').mockImplementation((password: string, salt: string | number): Promise<string> => {
            return Promise.resolve('hashedPassword');
        });
        jest.spyOn(bcrypt, 'compare').mockImplementation((password: string, hashed: string): Promise<boolean> => {
            return Promise.resolve(true);
        });
        jest.spyOn(jwt, 'sign').mockImplementation((payload, secret, options) => {
            return 'mockToken';
        });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    describe('signup', () => {
        it('should successfully create a new user and return a token', async () => {
            const signupRequest: SignupRequest = {
                username: 'testuser',
                password: 'testpass',
                email: 'test@test.com',
            };
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@test.com',
                password: 'hashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            
            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockResolvedValue(mockUser);

            const result = await AuthService.signup(signupRequest);

            expect(result).toEqual({
                token: 'mockToken',
                user: {
                    id: '1',
                    username: 'testuser',
                    email: 'test@test.com',
                },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(signupRequest.password, 10);
            expect(jwt.sign).toHaveBeenCalledWith({ userId: mockUser.id }, jwtSecret, { expiresIn: '1d' });
            expect(mockUserRepository.createUser).toHaveBeenCalledWith({
                username: signupRequest.username,
                email: signupRequest.email,
                password: 'hashedPassword',
            });
        });
        
        it('should throw an error if the username already exists', async () => {
            const signupRequest: SignupRequest = {
                username: 'testuser',
                password: 'testpass',
                email: 'test@test.com',
            };
            
            const existingUser = {
                id: '1',
                username: 'testuser',
                email: 'existing@test.com',
                password: 'hashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(existingUser);

            await expect(AuthService.signup(signupRequest)).rejects.toThrow('Username already exists');
            expect(mockUserRepository.createUser).not.toHaveBeenCalled();
        });
        
        it('should throw an error if the email is already in use', async () => {
            const signupRequest: SignupRequest = {
                username: 'testuser',
                password: 'testpass',
                email: 'test@test.com',
            };
            
            const existingUser = {
                id: '1',
                username: 'otheruser',
                email: 'test@test.com',
                password: 'hashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(existingUser);

            await expect(AuthService.signup(signupRequest)).rejects.toThrow('Email already in use');
            expect(mockUserRepository.createUser).not.toHaveBeenCalled();
        });
        
        it('should throw a generic error if something goes wrong during signup', async () => {
            const signupRequest: SignupRequest = {
                username: 'testuser',
                password: 'testpass',
                email: 'test@test.com',
            };
            
            mockUserRepository.findByUsernameOrEmail.mockResolvedValue(null);
            mockUserRepository.createUser.mockRejectedValue(new Error('Database error'));
            
            await expect(AuthService.signup(signupRequest)).rejects.toThrow('Registration failed');
            expect(console.error).toHaveBeenCalledWith('Registration error:', new Error('Database error'));
        });
    });
    
    describe('login', () => {
        it('should successfully login a user and return a token', async () => {
            const loginRequest: LoginRequest = {
                username: 'testuser',
                password: 'testpass',
            };
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@test.com',
                password: 'hashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            
            mockUserRepository.findByUsername.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            
            const result = await AuthService.login(loginRequest);
            
            expect(result).toEqual({
                token: 'mockToken',
                user: {
                    id: '1',
                    username: 'testuser',
                    email: 'test@test.com',
                },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginRequest.password, mockUser.password);
            expect(jwt.sign).toHaveBeenCalledWith({ userId: mockUser.id }, jwtSecret, { expiresIn: '1d' });
        });
        
        it('should throw an error if no user is found with the given username', async () => {
            const loginRequest: LoginRequest = {
                username: 'unknownuser',
                password: 'testpass',
            };
            
            mockUserRepository.findByUsername.mockResolvedValue(null);
            
            await expect(AuthService.login(loginRequest)).rejects.toThrow('No user found with this username');
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });
        
        it('should throw an error if the password is incorrect', async () => {
            const loginRequest: LoginRequest = {
                username: 'testuser',
                password: 'wrongpass',
            };
            const mockUser = {
                id: '1',
                username: 'testuser',
                email: 'test@test.com',
                password: 'hashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            
            mockUserRepository.findByUsername.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            
            await expect(AuthService.login(loginRequest)).rejects.toThrow('Incorrect password');
            expect(jwt.sign).not.toHaveBeenCalled();
        });
        
        it('should throw a generic error if something goes wrong during login', async () => {
            const loginRequest: LoginRequest = {
                username: 'testuser',
                password: 'testpass',
            };
            
            mockUserRepository.findByUsername.mockRejectedValue(new Error('Database error'));
            
            await expect(AuthService.login(loginRequest)).rejects.toThrow('Login failed');
            expect(console.error).toHaveBeenCalledWith('Login error:', new Error('Database error'));
        });
    });
});
