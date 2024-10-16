import { Model } from 'sequelize';

export class SequelizeUser extends Model {
    public id!: string;
    public username!: string;
    public password!: string;
    public email!: string;
    public passwordResetToken!: string | null;
    public passwordResetExpires!: number | null;
}

export default SequelizeUser;
