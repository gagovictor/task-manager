import sgMail from '@sendgrid/mail';
import MailService from '@src/services/MailService';
import { IMailService } from '@src/abstractions/services/IMailService';

jest.mock('@sendgrid/mail');

describe('MailService', () => {
    const originalEnv = process.env;
    
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });
    
    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });
    
    describe('constructor', () => {
        it('should set the SendGrid API key if SENDGRID_API_KEY is defined', () => {
            process.env.SENDGRID_API_KEY = 'test-sendgrid-api-key';
            const setApiKeyMock = jest.spyOn(sgMail, 'setApiKey').mockImplementation(() => {});
            
            const mailService = new MailService();
            
            expect(setApiKeyMock).toHaveBeenCalledWith('test-sendgrid-api-key');
        });
        
        it('should throw an error if SENDGRID_API_KEY is not defined', () => {
            delete process.env.SENDGRID_API_KEY;
            
            expect(() => new MailService()).toThrow('SendGrid API key is not defined in environment variables');
        });
    });
    
    describe('sendEmail', () => {
        let mailService: IMailService;
        const mockSend = sgMail.send as jest.Mock;
        
        beforeEach(() => {
            process.env.SENDGRID_API_KEY = 'test-sendgrid-api-key';
            process.env.EMAIL_FROM = 'no-reply@test.com';
            mailService = new MailService();
        });
        
        it('should send an email successfully', async () => {
            mockSend.mockResolvedValue([{ statusCode: 202, body: '', headers: {} }]);
            
            const to = 'user@test.com';
            const subject = 'Test Subject';
            const textContent = 'Test email content';
            const htmlContent = '<p>Test email content</p>';
            
            await expect(mailService.sendEmail(to, subject, textContent, htmlContent)).resolves.toBeUndefined();
            
            expect(mockSend).toHaveBeenCalledWith({
                to,
                from: 'no-reply@test.com',
                subject,
                text: textContent,
                html: htmlContent,
            });
            expect(console.log).toHaveBeenCalledWith(`Email sent to ${to}`);
        });
        
        it('should throw an error if EMAIL_FROM is not defined', async () => {
            delete process.env.EMAIL_FROM;
            
            const to = 'user@test.com';
            const subject = 'Test Subject';
            const textContent = 'Test email content';
            const htmlContent = '<p>Test email content</p>';
            
            await expect(mailService.sendEmail(to, subject, textContent, htmlContent)).rejects.toThrow(
                'Email From is not defined in environment variables'
            );
            
            expect(mockSend).not.toHaveBeenCalled();
        });
        
        it('should handle errors from sgMail.send and throw a generic error', async () => {
            const error = new Error('SendGrid error');
            mockSend.mockRejectedValue(error);
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            const to = 'user@test.com';
            const subject = 'Test Subject';
            const textContent = 'Test email content';
            const htmlContent = '<p>Test email content</p>';
            
            await expect(mailService.sendEmail(to, subject, textContent, htmlContent)).rejects.toThrow(
                'Failed to send email'
            );
            
            expect(mockSend).toHaveBeenCalledWith({
                to,
                from: 'no-reply@test.com',
                subject,
                text: textContent,
                html: htmlContent,
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending email:', error);
        });
    });
});