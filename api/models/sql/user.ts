import { Model } from 'sequelize';

export class User extends Model {
    public id!: string;
    public username!: string;
    public password!: string;
    public email!: string;
}

export default User;
