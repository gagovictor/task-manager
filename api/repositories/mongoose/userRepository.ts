import IUserRepository from '../userRepository';
import { MongooseUser } from '../../models/mongoose/user';
import { User } from '../../models/user';
import { v4 as uuidv4 } from 'uuid';

export default class MongooseUserRepository implements IUserRepository {
    
    async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
        return await MongooseUser.findOne({ $or: [{ username }, { email }] }).exec() as User;
    }
    
    async createUser(userData: Partial<User>): Promise<User> {
        const newUser = new MongooseUser({
            id: uuidv4(),
            ...userData
        });
        return await newUser.save() as User;
    }
    
    async findByUsername(username: string): Promise<User | null> {
        return await MongooseUser.findOne({ username }).exec() as User;
    }
    
    async findById(userId: string): Promise<User | null> {
        return await MongooseUser.findById(userId).exec() as User;
    }
    
    async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
        return await MongooseUser.findByIdAndUpdate(userId, updates, { new: true }).exec() as User;
    }
}
