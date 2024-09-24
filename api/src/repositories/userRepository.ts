import { User } from "../models/user";

export default interface IUserRepository {
    findByUsernameOrEmail(username: string, email: string): Promise<User | null>;
    createUser(userData: Partial<User>): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
    findById(userId: string): Promise<User | null>;
    updateUser(userId: string, updates: Partial<User>): Promise<User | null>;
}

