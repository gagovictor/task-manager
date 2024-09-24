import { Model } from 'sequelize';
import { ChecklistItem } from '../checklist';

export class SequelizeTask extends Model {
    public id!: string;
    public title!: string;
    public description?: string;
    public checklist?: ChecklistItem[];
    public dueDate?: Date;
    public status!: string;
    public userId!: string;
    public createdAt: Date;
    public modifiedAt?: Date;
    public deletedAt?: Date;
    public archivedAt?: Date;

    constructor() {
        super();
        this.createdAt = new Date();
    }
}

export default SequelizeTask;