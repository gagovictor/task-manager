export interface IEmailNotificationService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
  sendWelcomeEmail(to: string, username: string): Promise<void>;
}