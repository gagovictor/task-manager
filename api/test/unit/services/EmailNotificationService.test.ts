
import EmailNotificationService from '@src/services/EmailNotificationService';
import { IMailService } from '@src/abstractions/services/IMailService';

describe('EmailNotificationService', () => {
    let mailServiceMock: jest.Mocked<IMailService>;
    let emailNotificationService: EmailNotificationService;
    
    function normalizeHtml(html: string): string {
        return html.replace(/\s+/g, ' ').trim();
    }
    
    beforeEach(() => {
        mailServiceMock = {
            sendEmail: jest.fn(),
        };
        
        emailNotificationService = new EmailNotificationService(mailServiceMock);
    });
    
    describe('sendPasswordResetEmail', () => {
        it('should send a password reset email with correct parameters', async () => {
            const to = 'user@example.com';
            const resetUrl = 'https://example.com/reset?token=abc123';
            
            await emailNotificationService.sendPasswordResetEmail(to, resetUrl);
            
            const expectedHtml = `
        <p>You requested a password reset.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
      `;
            
            const actualHtml = mailServiceMock.sendEmail.mock.calls[0][3];
            
            expect(normalizeHtml(actualHtml)).toBe(normalizeHtml(expectedHtml));
            
            expect(mailServiceMock.sendEmail).toHaveBeenCalledWith(
                to,
                'Password Reset Request',
                `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`,
                actualHtml
            );
        });
        
        it('should throw an error if sendEmail fails', async () => {
            const to = 'user@example.com';
            const resetUrl = 'https://example.com/reset?token=abc123';
            const error = new Error('Mail service failed');
            
            mailServiceMock.sendEmail.mockRejectedValue(error);
            
            await expect(
                emailNotificationService.sendPasswordResetEmail(to, resetUrl)
            ).rejects.toThrow(error);
            
            expect(mailServiceMock.sendEmail).toHaveBeenCalled();
        });
    });
    
    describe('sendWelcomeEmail', () => {
        it('should send a welcome email with correct parameters', async () => {
            const to = 'user@example.com';
            const username = 'John Doe';
            
            await emailNotificationService.sendWelcomeEmail(to, username);
            
            const expectedHtml = `
        <p>Hello <strong>${username}</strong>,</p>
        <p>Welcome to our service!</p>
      `;
            
            const actualHtml = mailServiceMock.sendEmail.mock.calls[0][3];
            
            expect(normalizeHtml(actualHtml)).toBe(normalizeHtml(expectedHtml));
            
            expect(mailServiceMock.sendEmail).toHaveBeenCalledWith(
                to,
                'Welcome to Our Service',
                `Hello ${username}, welcome to our service!`,
                actualHtml
            );
        });
        
        it('should throw an error if sendEmail fails', async () => {
            const to = 'user@example.com';
            const username = 'John Doe';
            const error = new Error('Mail service failed');
            
            mailServiceMock.sendEmail.mockRejectedValue(error);
            
            await expect(
                emailNotificationService.sendWelcomeEmail(to, username)
            ).rejects.toThrow(error);
            
            expect(mailServiceMock.sendEmail).toHaveBeenCalled();
        });
    });
});