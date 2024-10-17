import sgMail from '@sendgrid/mail';
import MailService from '@src/services/MailService';

jest.mock('@sendgrid/mail');

describe('MailService', () => {
    const SENDGRID_API_KEY = 'test-sendgrid-api-key';
    const EMAIL_FROM = 'test@example.com';
    
    beforeEach(() => {
        process.env.SENDGRID_API_KEY = SENDGRID_API_KEY;
        process.env.EMAIL_FROM = EMAIL_FROM;
    });
    
    afterEach(() => {
        jest.clearAllMocks();
        delete process.env.SENDGRID_API_KEY;
        delete process.env.EMAIL_FROM;
    });
    
    describe('constructor', () => {
        it('should throw an error if SENDGRID_API_KEY is not defined', () => {
            delete process.env.SENDGRID_API_KEY;
            
            expect(() => new MailService()).toThrow(
                'SendGrid API key is not defined in environment variables'
            );
        });
        
        it('should set the SendGrid API key if SENDGRID_API_KEY is defined', () => {
            const setApiKeyMock = jest.spyOn(sgMail, 'setApiKey');
            
            new MailService();
            
            expect(setApiKeyMock).toHaveBeenCalledWith(SENDGRID_API_KEY);
        });
    });
    
    describe('sendEmail', () => {
        let mailService: MailService;
        
        beforeEach(() => {
            mailService = new MailService();
        });
        
        it('should throw an error if EMAIL_FROM is not defined', async () => {
            delete process.env.EMAIL_FROM;
            
            await expect(
                mailService.sendEmail('to@example.com', 'Subject', 'Text content', '<p>HTML content</p>')
            ).rejects.toThrow('Email From is not defined in environment variables');
        });
        
        it('should send an email with correct parameters', async () => {
            const sendMock = jest.spyOn(sgMail, 'send').mockResolvedValue([{
                statusCode: 200,
                body: {},
                headers: null
            }, {}]);
            
            await mailService.sendEmail(
                'to@example.com',
                'Test Subject',
                'Test text content',
                '<p>Test HTML content</p>'
            );
            
            expect(sendMock).toHaveBeenCalledWith({
                to: 'to@example.com',
                from: EMAIL_FROM,
                subject: 'Test Subject',
                text: 'Test text content',
                html: '<p>Test HTML content</p>',
            });
        });
        
        it('should log a message when email is sent successfully', async () => {
            const consoleLogMock = jest.spyOn(console, 'log').mockImplementation();
            jest.spyOn(sgMail, 'send').mockResolvedValue([{
                statusCode: 200,
                body: {},
                headers: null
            }, {}]);
            
            await mailService.sendEmail(
                'to@example.com',
                'Subject',
                'Text content',
                '<p>HTML content</p>'
            );
            
            expect(consoleLogMock).toHaveBeenCalledWith('Email sent to to@example.com');
        });
        
        it('should throw an error when sgMail.send fails', async () => {
            const error = new Error('SendGrid error');
            jest.spyOn(sgMail, 'send').mockRejectedValue(error);
            const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
            
            await expect(
                mailService.sendEmail('to@example.com', 'Subject', 'Text content', '<p>HTML content</p>')
            ).rejects.toThrow('Failed to send email');
            
            expect(consoleErrorMock).toHaveBeenCalledWith('Error sending email:', error);
        });
    });
});
