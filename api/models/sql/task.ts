import { Model } from 'sequelize';

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
