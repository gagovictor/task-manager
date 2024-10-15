import EmailNotificationService from '@src/services/EmailNotificationService';
import { IEmailNotificationService } from '@src/abstractions/services/IEmailNotificationService';
import { IMailService } from '@src/abstractions/services/IMailService';
import dedent from 'dedent';

describe('EmailNotificationService', () => {
    let mockMailService: jest.Mocked<IMailService>;
    let emailNotificationService: IEmailNotificationService;
    
    beforeEach(() => {
        mockMailService = {
            sendEmail: jest.fn(),
        };
        emailNotificationService = new EmailNotificationService(mockMailService);
    });
    
    describe('sendPasswordResetEmail', () => {
        it('should send a password reset email with correct parameters', async () => {
            const to = 'user@test.com';
            const resetUrl = 'https://example.com/reset?token=abc123';
            
            await expect(
                emailNotificationService.sendPasswordResetEmail(to, resetUrl)
            ).resolves.toBeUndefined();
            
            expect(mockMailService.sendEmail).toHaveBeenCalledWith(
                to,
                'Password Reset Request',
                `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`,
                dedent`
      <p>You requested a password reset.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `
            );
        });
        
        it('should propagate errors from the mail service', async () => {
            const to = 'user@test.com';
            const resetUrl = 'https://example.com/reset?token=abc123';
            const error = new Error('Mail service error');
            mockMailService.sendEmail.mockRejectedValue(error);
            
            await expect(
                emailNotificationService.sendPasswordResetEmail(to, resetUrl)
            ).rejects.toThrow(error);
            
            expect(mockMailService.sendEmail).toHaveBeenCalledWith(
                to,
                'Password Reset Request',
                `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`,
                dedent`
      <p>You requested a password reset.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `
            );
        });
    });
    
    describe('sendWelcomeEmail', () => {
        it('should send a welcome email with correct parameters', async () => {
            const to = 'newuser@test.com';
            const username = 'newuser';
            
            await expect(
                emailNotificationService.sendWelcomeEmail(to, username)
            ).resolves.toBeUndefined();
            
            expect(mockMailService.sendEmail).toHaveBeenCalledWith(
                to,
                'Welcome to Our Service',
                `Hello ${username}, welcome to our service!`,
                dedent`
      <p>Hello <strong>${username}</strong>,</p>
      <p>Welcome to our service!</p>
    `
            );
        });
        
        it('should propagate errors from the mail service', async () => {
            const to = 'newuser@test.com';
            const username = 'newuser';
            const error = new Error('Mail service error');
            mockMailService.sendEmail.mockRejectedValue(error);
            
            await expect(
                emailNotificationService.sendWelcomeEmail(to, username)
            ).rejects.toThrow(error);
            
            expect(mockMailService.sendEmail).toHaveBeenCalledWith(
                to,
                'Welcome to Our Service',
                `Hello ${username}, welcome to our service!`,
                dedent`
      <p>Hello <strong>${username}</strong>,</p>
      <p>Welcome to our service!</p>
    `
            );
        });
    });
});
