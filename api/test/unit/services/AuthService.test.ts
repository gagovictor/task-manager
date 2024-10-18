jest.mock('bcryptjs');

import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '@src/models/user';
import IUserRepository from '@src/abstractions/repositories/IUserRepository';
import { IEmailNotificationService } from '@src/abstractions/services/IEmailNotificationService';
import AuthService from '@src/services/AuthService';

describe('AuthService', () => {
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockEmailNotificationService: jest.Mocked<IEmailNotificationService>;
    let authService: AuthService;
    
    const jwtSecret = 'test-secret';
    
    const bcryptHashMock = bcrypt.hash as jest.Mock;
    const bcryptCompareMock = bcrypt.compare as jest.Mock;
    let createHashSpy: jest.SpyInstance;
    let randomBytesSpy: jest.SpyInstance;
    
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
        
        authService = new AuthService(mockUserRepository, mockEmailNotificationService, jwtSecret);
        
        bcryptHashMock.mockResolvedValue('hashedPassword');
        bcryptCompareMock.mockResolvedValue(true);
        
        jest.spyOn(jwt, 'sign').mockImplementation(() => 'mockToken');
        jest.spyOn(console, 'error').mockImplementation(() => {});

        randomBytesSpy = jest.spyOn(crypto, 'randomBytes').mockImplementation(() => {
            return {
                toString: jest.fn(() => 'mockResetToken')
            } as unknown as Buffer;
        });

        createHashSpy = jest.spyOn(crypto, 'createHash').mockImplementation((algorithm: string) => {
            return {
                update: jest.fn().mockReturnThis(),
                digest: jest.fn(() => 'mockHashedResetToken'),
            } as unknown as crypto.Hash;
        });
    });
    
    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });
    
    describe('recoverPassword', () => {
        beforeEach(() => {
            jest.spyOn(Date, 'now').mockImplementation(() => 1620000000000);
        });
        
        it('should send a password reset email if user exists', async () => {
            const email = 'test@example.com';
            const mockUser: User = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            mockUserRepository.updateUser.mockResolvedValue(mockUser);
            const expectedExpiration = 1620000000000 + 3600000;
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/mockResetToken`;
            
            await authService.recoverPassword(email);
            
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockUserRepository.updateUser).toHaveBeenCalledWith(mockUser.id, {
                passwordResetToken: 'mockHashedResetToken',
                passwordResetExpires: expectedExpiration,
            });
            expect(mockEmailNotificationService.sendPasswordResetEmail).toHaveBeenCalledWith(mockUser.email, resetUrl);
        });
        
        it('should complete successfully even if user does not exist', async () => {
            const email = 'nonexistent@example.com';
            mockUserRepository.findByEmail.mockResolvedValue(null);
            
            await expect(authService.recoverPassword(email)).resolves.toBeUndefined();
            
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
            expect(mockEmailNotificationService.sendPasswordResetEmail).not.toHaveBeenCalled();
        });
        
        it('should log and rethrow errors', async () => {
            const email = 'test@example.com';
            const error = new Error('Database error');
            
            mockUserRepository.findByEmail.mockRejectedValue(error);
            
            await expect(authService.recoverPassword(email)).rejects.toThrow(error);
            expect(console.error).toHaveBeenCalledWith('Recover Password error:', error);
        });
    });
    
    describe('resetPassword', () => {
        beforeEach(() => {
            bcryptHashMock.mockResolvedValue('newHashedPassword');
        });
        
        it('should reset the password if token is valid', async () => {
            const token = 'validResetToken';
            const newPassword = 'newPassword';
            const mockUser: User = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: 'oldHashedPassword',
                passwordResetToken: 'mockHashedResetToken',
                passwordResetExpires: Date.now() + 3600000,
            };
            
            mockUserRepository.findByResetToken.mockResolvedValue(mockUser);
            mockUserRepository.updateUser.mockResolvedValue({
                ...mockUser,
                password: 'newHashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            });
            
            await authService.resetPassword(token, newPassword);
            
            expect(crypto.createHash).toHaveBeenCalledWith('sha256');
            expect(mockUserRepository.findByResetToken).toHaveBeenCalledWith('mockHashedResetToken', expect.any(Number));
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(mockUserRepository.updateUser).toHaveBeenCalledWith(mockUser.id, {
                password: 'newHashedPassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            });
        });
        
        it('should throw an error if token is invalid or expired', async () => {
            const token = 'invalidResetToken';
            const newPassword = 'newPassword';
            
            mockUserRepository.findByResetToken.mockResolvedValue(null);
            
            await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(
                'Invalid or expired password reset token'
            );
            
            expect(mockUserRepository.findByResetToken).toHaveBeenCalledWith('mockHashedResetToken', expect.any(Number));
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.updateUser).not.toHaveBeenCalled();
        });
        
        it('should rethrow errors that occur during password reset', async () => {
            const token = 'validResetToken';
            const newPassword = 'newPassword';
            const error = new Error('Database error');
            
            mockUserRepository.findByResetToken.mockRejectedValue(error);
            
            await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(error);
        });
    });
});
