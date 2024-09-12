import { Model } from 'sequelize';

export class SequelizeTask extends Model {
    public id!: string;
    public title!: string;
    public description?: string;
    public dueDate?: Date;
    public status!: string;
    public userId!: string;
    public deletedAt?: Date;
    public archivedAt?: Date;
}

export default SequelizeTask;