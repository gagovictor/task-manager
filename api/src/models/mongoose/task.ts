import { Schema, model, Document } from 'mongoose';
import { ChecklistItem } from '../checklist';
import { checklistItemSchema } from './checklist';

export interface IMongooseTask extends Document {
  title: string;
  description?: string;
  checklist?: string;
  dueDate?: Date;
  status: string;
  userId: string;
  createdAt: Date;
  modifiedAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
}

const taskSchema = new Schema<IMongooseTask>({
  title: { type: String, required: true },
  description: { type: String, default: null },
  checklist: { type: String, default: null },
  dueDate: { type: Date, default: null },
  status: { type: String, required: true },
  userId: { type: String, ref: 'User', required: true },
  createdAt: { type: Date, default: null, required: true },
  modifiedAt: { type: Date, default: null },
  archivedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
});

export const MongooseTask = model<IMongooseTask>('Task', taskSchema);
