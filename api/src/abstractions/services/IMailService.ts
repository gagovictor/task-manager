/**
* IMailService is an interface for sending emails.
*/
export interface IMailService {
  /**
  * Sends an email to the specified recipient.
  * 
  * @param to - The recipient's email address.
  * @param subject - The subject of the email.
  * @param textContent - The plain text content of the email.
  * @param htmlContent - The HTML content of the email.
  * @returns A promise that resolves once the email is sent.
  */
  sendEmail(to: string, subject: string, textContent: string, htmlContent: string): Promise<void>;
}
