import crypto from 'crypto';

class TaskEncryptionService {
    private secretKey: string;

    constructor(secretKey: string) {
        if (!secretKey) {
            throw new Error("Encryption key is required");
        }
        // Validate secretKey length for AES-256 (32 bytes => 44 base64 characters with padding)
        // Alternatively, ensure the raw bytes are 32 bytes if not using base64
        this.secretKey = secretKey;
    }

    encrypt(text: string): string {
        if (!text) {
            return '';
        }
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.secretKey, 'base64'), iv);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return `${iv.toString('base64')}:${encrypted}`; // IV:EncryptedText
    }

    decrypt(encryptedText: string): string {
        const [ivBase64, encryptedBase64] = encryptedText.split(':');
        const ivBuffer = Buffer.from(ivBase64, 'base64');
        if (ivBuffer.length !== 16) {
            throw new Error(`Invalid IV length: ${ivBuffer.length}`);
        }

        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.secretKey, 'base64'), ivBuffer);
        let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

export default TaskEncryptionService;
