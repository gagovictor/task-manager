import { User } from '../../models/sql/user';
import IUserRepository from '../userRepository';
import { Op } from 'sequelize';

export class SequelizeUserRepository implements IUserRepository {
    async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
        return User.findOne({
            where: {
                [Op.or]: [{ username }, { email }],
            },
        });
    }
    
    async createUser(userData: Partial<User>): Promise<User> {
        return User.create(userData);
    }
    
    async findByUsername(username: string): Promise<User | null> {
        return User.findOne({ where: { username } });
    }
    
    async findById(userId: string): Promise<User | null> {
        return User.findByPk(userId);
    }
    
    async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
        const user = await User.findByPk(userId);
        if (!user) return null;
        return user.update(updates);
    }
}
