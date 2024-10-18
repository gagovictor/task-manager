import { Model } from 'sequelize';
import { ChecklistItem } from '@src/models/checklist';

export class SequelizeTask extends Model {
    public id!: string;
    public title!: string;
    public description: string | null = null;
    public checklist: string | null = null;
    public dueDate: Date | null = null;
    public status!: string;
    public userId!: string;
    public createdAt: Date;
    public modifiedAt: Date | null = null;
    public deletedAt: Date | null = null;
    public archivedAt: Date | null = null;

    constructor() {
        super();
        this.createdAt = new Date();
    }
}

export default SequelizeTask;