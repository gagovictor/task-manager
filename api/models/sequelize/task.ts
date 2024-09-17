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
    public deletedAt?: Date;
    public archivedAt?: Date;
}

export default SequelizeTask;