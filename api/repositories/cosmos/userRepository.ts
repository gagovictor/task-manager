import { CosmosClient } from '@azure/cosmos';
import UserRepository from '../userRepository';
import User from '../../models/user';

const cosmosClient = new CosmosClient(process.env.COSMOSDB_CONNECTION_STRING!);
const userContainer = cosmosClient.database(process.env.COSMOSDB_DATABASE!).container('users');

class CosmosUserRepository implements UserRepository {
    async createUser(user: User): Promise<User> {
        const { resource } = await userContainer.items.create(user);
        return resource;
    }
    
    async getUserById(id: string): Promise<User | null> {
        const { resource } = await userContainer.item(id).read();
        return resource || null;
    }
    
    async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
        const { resource } = await userContainer.item(id).read();
        if (!resource) return null;
        const updated = { ...resource, ...userData };
        await userContainer.item(id).replace(updated);
        return updated;
    }
    
    async deleteUser(id: string): Promise<User | null> {
        const { resource } = await userContainer.item(id).read();
        if (!resource) return null;
        await userContainer.item(id).delete();
        return resource;
    }
    
    async getAllUsers(): Promise<User[]> {
        const { resources } = await userContainer.items.query('SELECT * FROM users').fetchAll();
        return resources;
    }
}

export default CosmosUserRepository;
