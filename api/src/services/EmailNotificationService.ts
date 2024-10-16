import { IEmailNotificationService } from "@src/abstractions/services/IEmailNotificationService";
import { IMailService } from "@src/abstractions/services/IMailService";

class EmailNotificationService implements IEmailNotificationService {
  private mailService: IMailService;

  constructor(mailService: IMailService) {
    this.mailService = mailService;
  }

  public async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const subject = 'Password Reset Request';
    const text = `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`;
    const html = `
      <p>You requested a password reset.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `;

    await this.mailService.sendEmail(to, subject, text, html);
  }

  public async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const subject = 'Welcome to Our Service';
    const text = `Hello ${username}, welcome to our service!`;
    const html = `
      <p>Hello <strong>${username}</strong>,</p>
      <p>Welcome to our service!</p>
    `;

    await this.mailService.sendEmail(to, subject, text, html);
  }
}

export default EmailNotificationService;
