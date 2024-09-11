import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/db';

class User extends Model {
    public id!: string;
    public username!: string;
    public password!: string;
    public email!: string;
}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'User',
});

export default User;
