import crypto from 'crypto';
import TaskEncryptionService from '@src/services/taskEncryptionService';

describe('TaskEncryptionService', () => {
    const secretKey = crypto.randomBytes(32).toString('base64'); // Generate a valid base64 secret key
    let encryptionService: TaskEncryptionService;
    
    beforeEach(() => {
        encryptionService = new TaskEncryptionService(secretKey);
    });
    
    describe('constructor', () => {
        it('should throw an error if the secret key is not provided', () => {
            expect(() => new TaskEncryptionService('')).toThrow('Encryption key is required');
        });
        
        it('should initialize the encryption service with a valid secret key', () => {
            expect(() => new TaskEncryptionService(secretKey)).not.toThrow();
        });
    });
    
    describe('encrypt', () => {
        it('should encrypt a string and return a valid encrypted format', () => {
            // Arrange
            const plainText = 'Test encryption';
            
            // Act
            const encryptedText = encryptionService.encrypt(plainText);
            
            // Assert
            expect(encryptedText).toMatch(/^[A-Za-z0-9+/]+={0,2}:[A-Za-z0-9+/]+={0,2}$/); // Base64 IV:EncryptedText format
        });
        
        it('should return an empty string when encrypting an empty text', () => {
            // Act
            const encryptedText = encryptionService.encrypt('');
            
            // Assert
            expect(encryptedText).toBe('');
        });
    });
    
    describe('decrypt', () => {
        it('should decrypt an encrypted string and return the original text', () => {
            // Arrange
            const plainText = 'Test decryption';
            const encryptedText = encryptionService.encrypt(plainText);
            
            // Act
            const decryptedText = encryptionService.decrypt(encryptedText);
            
            // Assert
            expect(decryptedText).toBe(plainText);
        });
        
        it('should throw an error if the IV length is invalid', () => {
            // Arrange
            const invalidEncryptedText = 'invalidIV:encryptedText';
            
            // Act & Assert
            expect(() => encryptionService.decrypt(invalidEncryptedText)).toThrow('Invalid IV length: 6');
        });
        
        it('should handle edge cases where the encrypted text is missing IV or encrypted text', () => {
            // Missing IV or encrypted text parts
            expect(() => encryptionService.decrypt('')).toThrow();
            expect(() => encryptionService.decrypt('invalidData')).toThrow();
        });
    });
});
