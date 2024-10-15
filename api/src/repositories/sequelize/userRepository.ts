import { SequelizeUser as User } from '../../models/sequelize/user';
import IUserRepository from '../userRepository';
import { Op } from 'sequelize';

export default class SequelizeUserRepository implements IUserRepository {
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
    
    async findByEmail(email: string): Promise<User | null> {
        return User.findOne({ where: { email } });
    }
    
    async findByResetToken(token: string, currentTime: number): Promise<User | null> {
        return await User.findOne({ where: {
            passwordResetToken: token,
            passwordResetExpires: { $gt: currentTime },
        }});
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
