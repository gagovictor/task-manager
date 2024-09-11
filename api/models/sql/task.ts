import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/db';
import SequelizeUser from './user';

class Task extends Model {
    public id!: string;
    public title!: string;
    public description?: string;
    public dueDate?: Date;
    public status?: string;
    public archivedAt?: Date;
    public deletedAt?: Date;
    public userId?: string;
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
    modelName: 'Task',
    paranoid: true, // To enable soft deletes with Sequelize
});

Task.belongsTo(SequelizeUser, { foreignKey: 'userId' });
SequelizeUser.hasMany(Task, { foreignKey: 'userId' });

export default Task;
