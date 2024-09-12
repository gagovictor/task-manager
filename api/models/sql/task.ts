import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/db';
import User from './user';

export class Task extends Model {
    public id!: string;
    public title!: string;
    public description?: string;
    public dueDate?: Date;
    public status!: string;
    public userId!: string;
    public deletedAt?: Date;
    public archivedAt?: Date;
}

Task.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    status: {
        type: DataTypes.STRING,
    },
    archivedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize,
    tableName: 'Tasks',
    modelName: 'Task',
});

Task.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Task, { foreignKey: 'userId' });