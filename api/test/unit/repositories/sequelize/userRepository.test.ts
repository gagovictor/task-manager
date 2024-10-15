import { SequelizeUser as User } from '@src/models/sequelize/user';
import SequelizeUserRepository from '@src/repositories/sequelize/userRepository';
import { Op } from 'sequelize';

jest.mock('@src/models/sequelize/user');

describe('SequelizeUserRepository', () => {
    let userRepository: SequelizeUserRepository;
    
    beforeEach(() => {
        jest.clearAllMocks();
        userRepository = new SequelizeUserRepository();
    });
    
    describe('findByUsernameOrEmail', () => {
        it('should find a user by username or email', async () => {
            // Arrange
            const username = 'testuser';
            const email = 'test@example.com';
            const user = { id: '1', username, email };
            
            (User.findOne as jest.Mock).mockResolvedValue(user);
            
            // Act
            const result = await userRepository.findByUsernameOrEmail(username, email);
            
            // Assert
            expect(User.findOne).toHaveBeenCalledWith({
                where: {
                    [Op.or]: [{ username }, { email }],
                },
            });
            expect(result).toEqual(user);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const username = 'nonexistentuser';
            const email = 'nonexistent@example.com';
            
            (User.findOne as jest.Mock).mockResolvedValue(null);
            
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
            
            (User.findOne as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(userRepository.findByUsernameOrEmail(username, email)).rejects.toThrow('Query failed');
        });
    });
    
    describe('createUser', () => {
        it('should create and return a new user', async () => {
            // Arrange
            const userData = { username: 'newuser', email: 'newuser@example.com' };
            const createdUser = { id: '1', ...userData };
            
            (User.create as jest.Mock).mockResolvedValue(createdUser);
            
            // Act
            const result = await userRepository.createUser(userData);
            
            // Assert
            expect(User.create).toHaveBeenCalledWith(userData);
            expect(result).toEqual(createdUser);
        });
        
        it('should handle exceptions during user creation', async () => {
            // Arrange
            const userData = { username: 'newuser', email: 'newuser@example.com' };
            const error = new Error('Creation failed');
            
            (User.create as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(userRepository.createUser(userData)).rejects.toThrow('Creation failed');
        });
    });
    
    describe('findByUsername', () => {
        it('should find a user by username', async () => {
            // Arrange
            const username = 'testuser';
            const user = { id: '1', username };
            
            (User.findOne as jest.Mock).mockResolvedValue(user);
            
            // Act
            const result = await userRepository.findByUsername(username);
            
            // Assert
            expect(User.findOne).toHaveBeenCalledWith({ where: { username } });
            expect(result).toEqual(user);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const username = 'nonexistentuser';
            
            (User.findOne as jest.Mock).mockResolvedValue(null);
            
            // Act
            const result = await userRepository.findByUsername(username);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during user retrieval', async () => {
            // Arrange
            const username = 'testuser';
            const error = new Error('Failed to find user by username');
            
            (User.findOne as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow(
                'Failed to find user by username'
            );
        });
    });
    
    describe('findByEmail', () => {
        it('should find a user by email', async () => {
            // Arrange
            const email = 'test@example.com';
            const user = { id: '1', email };
            
            (User.findOne as jest.Mock).mockResolvedValue(user);
            
            // Act
            const result = await userRepository.findByEmail(email);
            
            // Assert
            expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
            expect(result).toEqual(user);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const email = 'test@example.com';
            
            (User.findOne as jest.Mock).mockResolvedValue(null);
            
            // Act
            const result = await userRepository.findByEmail(email);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during user retrieval', async () => {
            // Arrange
            const error = new Error('Failed to find user by email');
            
            (User.findOne as jest.Mock).mockRejectedValue(error);
            
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
            
            (User.findByPk as jest.Mock).mockResolvedValue(user);
            
            // Act
            const result = await userRepository.findById(userId);
            
            // Assert
            expect(User.findByPk).toHaveBeenCalledWith(userId);
            expect(result).toEqual(user);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const userId = 'nonexistent';
            
            (User.findByPk as jest.Mock).mockResolvedValue(null);
            
            // Act
            const result = await userRepository.findById(userId);
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should handle exceptions during user retrieval by ID', async () => {
            // Arrange
            const userId = '1';
            const error = new Error('Failed to find user by ID');
            
            (User.findByPk as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(userRepository.findById(userId)).rejects.toThrow('Failed to find user by ID');
        });
    });
    
    describe('updateUser', () => {
        it('should update and return the user', async () => {
            // Arrange
            const userId = '1';
            const updates = { username: 'updateduser' };
            const user = { 
              id: userId, 
              username: 'olduser', 
              update: jest.fn().mockImplementation((updates) => {
                return { ...user, ...updates };
              })
            };
            
            (User.findByPk as jest.Mock).mockResolvedValue(user);
            
            // Act
            const result = await userRepository.updateUser(userId, updates);
            
            // Assert
            expect(User.findByPk).toHaveBeenCalledWith(userId);
            expect(user.update).toHaveBeenCalledWith(updates);
            expect(result).toEqual({ ...user, ...updates });
        });
        
        it('should return null if user is not found', async () => {
            // Arrange
            const userId = 'nonexistent';
            const updates = { username: 'updateduser' };
            
            (User.findByPk as jest.Mock).mockResolvedValue(null);
            
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
            
            (User.findByPk as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(userRepository.updateUser(userId, updates)).rejects.toThrow('Update failed');
        });
    });
});
