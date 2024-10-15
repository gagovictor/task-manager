import { MongooseUser } from '@src/models/mongoose/user';
import MongooseUserRepository from '@src/repositories/mongoose/userRepository';
import { User } from '@src/models/user';
import { v4 as uuidv4 } from 'uuid';

jest.mock('@src/models/mongoose/user');
jest.mock('uuid');

describe('MongooseUserRepository', () => {
    let userRepository: MongooseUserRepository;
    
    beforeEach(() => {
        jest.clearAllMocks();
        userRepository = new MongooseUserRepository();
    });
    
    describe('findByUsernameOrEmail', () => {
        it('should find a user by username or email', async () => {
            // Arrange
            const username = 'testuser';
            const email = 'test@example.com';
            const user = { id: '1', username, email };
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(user),
            });
            
            // Act
            const result = await userRepository.findByUsernameOrEmail(username, email);
            
            // Assert
            expect(MongooseUser.findOne).toHaveBeenCalledWith({ $or: [{ username }, { email }] });
            expect(result).toEqual(user);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const username = 'nonexistentuser';
            const email = 'nonexistent@example.com';
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            
            // Act
            const result = await userRepository.findByUsernameOrEmail(username, email);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during the query', async () => {
            // Arrange
            const username = 'testuser';
            const email = 'test@example.com';
            const error = new Error('Query failed');
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });
            
            // Act & Assert
            await expect(userRepository.findByUsernameOrEmail(username, email)).rejects.toThrow('Query failed');
        });
    });
    
    describe('createUser', () => {
        it('should create and return a new user', async () => {
            // Arrange
            const userData = { username: 'newuser', email: 'newuser@example.com' };
            const createdUser = { id: '1', ...userData };
            
            (uuidv4 as jest.Mock).mockReturnValue('1');
            (MongooseUser.prototype.save as jest.Mock).mockResolvedValue(createdUser);
            
            // Act
            const result = await userRepository.createUser(userData);
            
            // Assert
            expect(MongooseUser).toHaveBeenCalledWith({
                id: '1',
                ...userData,
            });
            expect(result).toEqual(createdUser);
        });
        
        it('should handle exceptions during user creation', async () => {
            // Arrange
            const userData = { username: 'newuser', email: 'newuser@example.com' };
            const error = new Error('Creation failed');
            
            (MongooseUser.prototype.save as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(userRepository.createUser(userData)).rejects.toThrow('Creation failed');
        });
    });
    
    describe('findByUsername', () => {
        it('should find a user by username', async () => {
            // Arrange
            const username = 'testuser';
            const user = { id: '1', username };
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(user),
            });
            
            // Act
            const result = await userRepository.findByUsername(username);
            
            // Assert
            expect(MongooseUser.findOne).toHaveBeenCalledWith({ username });
            expect(result).toEqual(user);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const username = 'nonexistentuser';
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            
            // Act
            const result = await userRepository.findByUsername(username);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during user retrieval', async () => {
            // Arrange
            const error = new Error('Failed to find user by username');
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });
            
            // Act & Assert
            await expect(userRepository.findByUsername('test@example.com')).rejects.toThrow(
                'Failed to find user by username'
            );
        });
    });
    
    describe('findByEmail', () => {
        it('should find a user by email', async () => {
            // Arrange
            const email = 'test@example.com';
            const user = { id: '1', email };
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(user),
            });
            
            // Act
            const result = await userRepository.findByEmail(email);
            
            // Assert
            expect(MongooseUser.findOne).toHaveBeenCalledWith({ email });
            expect(result).toEqual(user);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const email = 'test@example.com';
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            
            // Act
            const result = await userRepository.findByEmail(email);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during user retrieval', async () => {
            // Arrange
            const error = new Error('Failed to find user by email');
            
            (MongooseUser.findOne as jest.Mock).mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });
            
            // Act & Assert
            await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow(
                'Failed to find user by email'
            );
        });
    });
    
    describe('findById', () => {
        it('should find a user by ID', async () => {
            // Arrange
            const userId = '1';
            const user = { id: userId, username: 'testuser' };
            
            (MongooseUser.findById as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(user),
            });
            
            // Act
            const result = await userRepository.findById(userId);
            
            // Assert
            expect(MongooseUser.findById).toHaveBeenCalledWith(userId);
            expect(result).toEqual(user);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const userId = 'nonexistent';
            
            (MongooseUser.findById as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            
            // Act
            const result = await userRepository.findById(userId);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during user retrieval by ID', async () => {
            // Arrange
            const userId = '1';
            const error = new Error('Failed to find user by ID');
            
            (MongooseUser.findById as jest.Mock).mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });
            
            // Act & Assert
            await expect(userRepository.findById(userId)).rejects.toThrow('Failed to find user by ID');
        });
    });
    
    describe('updateUser', () => {
        it('should update and return the user', async () => {
            // Arrange
            const userId = '1';
            const updates = { username: 'updateduser' };
            const updatedUser = { id: userId, ...updates };
            
            (MongooseUser.findByIdAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedUser),
            });
            
            // Act
            const result = await userRepository.updateUser(userId, updates);
            
            // Assert
            expect(MongooseUser.findByIdAndUpdate).toHaveBeenCalledWith(userId, updates, { new: true });
            expect(result).toEqual(updatedUser);
        });
        
        it('should return null if user is not found', async () => {
            // Arrange
            const userId = 'nonexistent';
            const updates = { username: 'updateduser' };
            
            (MongooseUser.findByIdAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            
            // Act
            const result = await userRepository.updateUser(userId, updates);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during user update', async () => {
            // Arrange
            const userId = '1';
            const updates = { username: 'updateduser' };
            const error = new Error('Update failed');
            
            (MongooseUser.findByIdAndUpdate as jest.Mock).mockReturnValue({
                exec: jest.fn().mockRejectedValue(error),
            });
            
            // Act & Assert
            await expect(userRepository.updateUser(userId, updates)).rejects.toThrow('Update failed');
        });
    });
});
