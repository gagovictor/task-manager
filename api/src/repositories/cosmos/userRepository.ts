import { Container, CosmosClient } from '@azure/cosmos';
import IUserRepository from './userRepository';
import { User } from '../../models/user';

export default class CosmosUserRepository implements IUserRepository {
    private container: Container;
    
    constructor(cosmosClient: CosmosClient, databaseId: string, containerId: string) {
        this.container = cosmosClient.database(databaseId).container(containerId);
    }
    
    async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
        try {
            const query = `SELECT * FROM c WHERE c.username = @username OR c.email = @email`;
            const parameters = [
                { name: '@username', value: username },
                { name: '@email', value: email }
            ];
            const { resources: users } = await this.container.items.query<User>({ query, parameters }).fetchAll();
            return users.length > 0 ? users[0] : null;
        } catch (error: any) {
            console.error('Error finding user by username or email:', error);
            throw new Error('Failed to find user by username or email');
        }
    }
    
    async createUser(userData: Partial<User>): Promise<User> {
        try {
            const { resource: newUser } = await this.container.items.create(userData as User);
            if (!newUser) throw new Error('Failed to create user');
            return newUser as User;
        } catch (error: any) {
            console.error('User creation error:', error);
            throw new Error('User creation failed');
        }
    }
    
    async findByUsername(username: string): Promise<User | null> {
        try {
            const query = `SELECT * FROM c WHERE c.username = @username`;
            const parameters = [{ name: '@username', value: username }];
            const { resources: users } = await this.container.items.query<User>({ query, parameters }).fetchAll();
            return users.length > 0 ? users[0] : null;
        } catch (error: any) {
            console.error('Error finding user by username:', error);
            throw new Error('Failed to find user by username');
        }
    }
    
    async findByEmail(email: string): Promise<User | null> {
        try {
            const query = `SELECT * FROM c WHERE c.email = @email`;
            const parameters = [{ name: '@email', value: email }];
            const { resources: users } = await this.container.items.query<User>({ query, parameters }).fetchAll();
            return users.length > 0 ? users[0] : null;
        } catch (error: any) {
            console.error('Error finding user by email:', error);
            throw new Error('Failed to find user by email');
        }
    }
    
    async findByResetToken(token: string, currentTime: number): Promise<User | null> {
        const query = `SELECT * FROM c WHERE c.passwordResetToken = @token AND c.passwordResetExpires > @currentTime`;
        const parameters = [
            { name: '@token', value: token },
            { name: '@currentTime', value: currentTime },
        ];
        const { resources: users } = await this.container.items.query<User>({ query, parameters }).fetchAll();
        return users.length > 0 ? users[0] : null;
    }
    
    async findById(userId: string): Promise<User | null> {
        try {
            const { resource: user } = await this.container.item(userId).read<User>();
            return user || null;
        } catch (error: any) {
            console.error('Error finding user by ID:', error);
            throw new Error('Failed to find user by ID');
        }
    }
    
    async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
        try {
            const { resource: existingUser } = await this.container.item(userId).read<User>();
            if (!existingUser) throw new Error('User not found');
            
            const updatedUser = { ...existingUser, ...updates };
            const { resource: result } = await this.container.item(userId).replace(updatedUser as User);
            if (!result) throw new Error('Failed to update user');
            return result as User;
        } catch (error: any) {
            console.error('User update error:', error);
            if (error.message === 'User not found') {
                throw error;
            }
            throw new Error('User update failed');
        }
    }
}
