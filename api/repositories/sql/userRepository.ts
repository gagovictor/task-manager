import User from '../../models/sql/user';
import UserRepository from '../userRepository';

class SqlUserRepository implements UserRepository {
    async createUser(user: User): Promise<User> {
        return User.create(user);
    }
    
    async getUserById(id: string): Promise<User | null> {
        return User.findByPk(id);
    }
    
    async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
        const user = await User.findByPk(id);
        if (!user) return null;
        return user.update(userData);
    }
    
    async deleteUser(id: string): Promise<User | null> {
        const user = await User.findByPk(id);
        if (!user) return null;
        await user.destroy();
        return user;
    }
    
    async getAllUsers(): Promise<User[]> {
        return User.findAll();
    }
}

export default SqlUserRepository;
