import sgMail from '@sendgrid/mail';
import { IMailService } from '@src/abstractions/services/IMailService';

class MailService implements IMailService {
    constructor() {
        const sendGridApiKey = process.env.SENDGRID_API_KEY;
        if (!sendGridApiKey) {
            throw new Error('SendGrid API key is not defined in environment variables');
        }
        sgMail.setApiKey(sendGridApiKey);
    }
    
    public async sendEmail(
        to: string,
        subject: string,
        textContent: string,
        htmlContent: string
    ): Promise<void> {
        const emailFrom = process.env.EMAIL_FROM;
        if(!emailFrom) {
            throw new Error('Email From is not defined in environment variables');
        }

        const msg = {
            to,
            from: emailFrom,
            subject,
            text: textContent,
            html: htmlContent,
        };

        try {
            await sgMail.send(msg);
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}

export default MailService;