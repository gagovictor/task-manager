import { Container, CosmosClient, SqlQuerySpec } from '@azure/cosmos';
import { User } from '@src/models/user';
import CosmosUserRepository from '@src/repositories/cosmos/userRepository';
import IUserRepository from '@src/abstractions/repositories/IUserRepository';

jest.mock('@azure/cosmos');

describe('CosmosUserRepository', () => {
    let cosmosClientMock: jest.Mocked<CosmosClient>;
    let containerMock: jest.Mocked<Container>;
    let userRepository: IUserRepository;
    
    const databaseId = 'testDatabase';
    const containerId = 'testContainer';
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        cosmosClientMock = new CosmosClient('AccountEndpoint=https://localhost:8081/;AccountKey=your_account_key;') as jest.Mocked<CosmosClient>;
        containerMock = {
            items: {
                query: jest.fn(),
                create: jest.fn(),
            },
            item: jest.fn(),
        } as unknown as jest.Mocked<Container>;
        
        const databaseMock = {
            container: jest.fn().mockReturnValue(containerMock),
        };
        cosmosClientMock.database = jest.fn().mockReturnValue(databaseMock as any);
        
        userRepository = new CosmosUserRepository(cosmosClientMock, databaseId, containerId);
    });
    
    describe('findByUsernameOrEmail', () => {
        it('should return a user when found by username or email', async () => {
            // Arrange
            const mockUser: User = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            const queryResult = { resources: [mockUser] };
            const querySpec: SqlQuerySpec = {
                query: expect.any(String),
                parameters: expect.any(Array),
            };
            
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockResolvedValue(queryResult),
            } as any);
            
            // Act
            const result = await userRepository.findByUsernameOrEmail('testuser', 'test@example.com');
            
            // Assert
            expect(containerMock.items.query).toHaveBeenCalledWith(querySpec);
            expect(result).toEqual(mockUser);
        });
        
        it('should return null when no user is found', async () => {
            // Arrange
            const queryResult = { resources: [] };
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockResolvedValue(queryResult),
            } as any);
            
            // Act
            const result = await userRepository.findByUsernameOrEmail('nonexistent', 'nonexistent@example.com');
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should throw an error when the query fails', async () => {
            // Arrange
            const error = new Error('Query failed');
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockRejectedValue(error),
            } as any);
            
            // Act & Assert
            await expect(userRepository.findByUsernameOrEmail('testuser', 'test@example.com')).rejects.toThrow(
                'Failed to find user by username or email'
            );
        });
    });
    
    describe('createUser', () => {
        it('should create and return a new user', async () => {
            // Arrange
            const userData: Partial<User> = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'hashedpassword',
            };
            const createdUser: User = {
                id: '2',
                username: userData.username!,
                email: userData.email!,
                password: userData.password!,
                passwordResetToken: userData.passwordResetToken!,
                passwordResetExpires: userData.passwordResetExpires!,
            };
            (containerMock.items.create as jest.Mock).mockResolvedValue({ resource: createdUser });
            
            // Act
            const result = await userRepository.createUser(userData);
            
            // Assert
            expect(containerMock.items.create).toHaveBeenCalledWith(userData);
            expect(result).toEqual(createdUser);
        });
        
        it('should throw an error when user creation fails', async () => {
            // Arrange
            const userData: Partial<User> = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'hashedpassword',
            };
            (containerMock.items.create as jest.Mock).mockResolvedValue({ resource: null });
            
            // Act & Assert
            await expect(userRepository.createUser(userData)).rejects.toThrow('User creation failed');
        });
        
        it('should handle exceptions during user creation', async () => {
            // Arrange
            const userData: Partial<User> = {
                username: 'newuser',
                email: 'new@example.com',
                password: 'hashedpassword',
            };
            const error = new Error('Creation failed');
            (containerMock.items.create as jest.Mock).mockRejectedValue(error);
            
            // Act & Assert
            await expect(userRepository.createUser(userData)).rejects.toThrow('User creation failed');
        });
    });
    
    describe('findByUsername', () => {
        it('should return a user when found by username', async () => {
            // Arrange
            const mockUser: User = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            const queryResult = { resources: [mockUser] };
            const querySpec: SqlQuerySpec = {
                query: expect.any(String),
                parameters: expect.any(Array),
            };
            
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockResolvedValue(queryResult),
            } as any);
            
            // Act
            const result = await userRepository.findByUsername('testuser');
            
            // Assert
            expect(containerMock.items.query).toHaveBeenCalledWith(querySpec);
            expect(result).toEqual(mockUser);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const queryResult = { resources: [] };
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockResolvedValue(queryResult),
            } as any);
            
            // Act
            const result = await userRepository.findByUsername('nonexistent');
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should throw an error when the query fails', async () => {
            // Arrange
            const error = new Error('Query failed');
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockRejectedValue(error),
            } as any);
            
            // Act & Assert
            await expect(userRepository.findByUsername('testuser')).rejects.toThrow(
                'Failed to find user by username'
            );
        });
    });
    
    describe('findByEmail', () => {
        it('should return a user when found by username', async () => {
            // Arrange
            const mockUser: User = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            const queryResult = { resources: [mockUser] };
            const querySpec: SqlQuerySpec = {
                query: expect.any(String),
                parameters: expect.any(Array),
            };
            
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockResolvedValue(queryResult),
            } as any);
            
            // Act
            const result = await userRepository.findByEmail('test@example.com');
            
            // Assert
            expect(containerMock.items.query).toHaveBeenCalledWith(querySpec);
            expect(result).toEqual(mockUser);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            const queryResult = { resources: [] };
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockResolvedValue(queryResult),
            } as any);
            
            // Act
            const result = await userRepository.findByEmail('test@example.com');
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should throw an error when the query fails', async () => {
            // Arrange
            const error = new Error('Query failed');
            (containerMock.items.query as jest.Mock).mockReturnValue({
                fetchAll: jest.fn().mockRejectedValue(error),
            } as any);
            
            // Act & Assert
            await expect(userRepository.findByEmail('test@example.com')).rejects.toThrow(
                'Failed to find user by email'
            );
        });
    });
    
    describe('findById', () => {
        it('should return a user when found by ID', async () => {
            // Arrange
            const mockUser: User = {
                id: '1',
                username: 'testuser',
                email: 'test@example.com',
                password: 'hashedpassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            containerMock.item.mockReturnValue({
                read: jest.fn().mockResolvedValue({ resource: mockUser }),
            } as any);
            
            // Act
            const result = await userRepository.findById('1');
            
            // Assert
            expect(containerMock.item).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });
        
        it('should return null when user is not found', async () => {
            // Arrange
            containerMock.item.mockReturnValue({
                read: jest.fn().mockResolvedValue({ resource: null }),
            } as any);
            
            // Act
            const result = await userRepository.findById('nonexistent');
            
            // Assert
            expect(result).toBeNull();
        });
        
        it('should throw an error when reading the item fails', async () => {
            // Arrange
            const error = new Error('Read failed');
            containerMock.item.mockReturnValue({
                read: jest.fn().mockRejectedValue(error),
            } as any);
            
            // Act & Assert
            await expect(userRepository.findById('1')).rejects.toThrow('Failed to find user by ID');
        });
    });
    
    describe('updateUser', () => {
        it('should update and return the user', async () => {
            // Arrange
            const userId = '1';
            const existingUser: User = {
                id: userId,
                username: 'testuser',
                email: 'test@example.com',
                password: 'oldpassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            const updates: Partial<User> = {
                password: 'newpassword',
            };
            const updatedUser: User = { ...existingUser, ...updates };
            
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingUser }),
                replace: jest.fn().mockResolvedValue({ resource: updatedUser }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act
            const result = await userRepository.updateUser(userId, updates);
            
            // Assert
            expect(containerMock.item).toHaveBeenCalledWith(userId);
            expect(itemMock.read).toHaveBeenCalled();
            expect(itemMock.replace).toHaveBeenCalledWith(updatedUser);
            expect(result).toEqual(updatedUser);
        });
        
        it('should throw an error when user is not found', async () => {
            // Arrange
            const userId = 'nonexistent';
            const updates: Partial<User> = {
                password: 'newpassword',
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: null }),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act & Assert
            await expect(userRepository.updateUser(userId, updates)).rejects.toThrow('User not found');
        });
        
        it('should handle exceptions during update', async () => {
            // Arrange
            const userId = '1';
            const existingUser: User = {
                id: userId,
                username: 'testuser',
                email: 'test@example.com',
                password: 'oldpassword',
                passwordResetToken: null,
                passwordResetExpires: null,
            };
            const updates: Partial<User> = {
                password: 'newpassword',
            };
            const itemMock = {
                read: jest.fn().mockResolvedValue({ resource: existingUser }),
                replace: jest.fn().mockRejectedValue(new Error('Replace failed')),
            };
            containerMock.item.mockReturnValue(itemMock as any);
            
            // Act & Assert
            await expect(userRepository.updateUser(userId, updates)).rejects.toThrow('User update failed');
        });
    });
});
