import { Schema, model, Document } from 'mongoose';

export interface IMongooseTask extends Document {
  title: string;
  description?: string;
  dueDate?: Date;
  status: string;
  userId: string;
  archivedAt?: Date;
  deletedAt?: Date;
}

const taskSchema = new Schema<IMongooseTask>({
  title: { type: String, required: true },
  description: { type: String, default: null },
  dueDate: { type: Date, default: null },
  status: { type: String, required: true },
  userId: { type: String, ref: 'User', required: true },
  archivedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
});

export const MongooseTask = model<IMongooseTask>('Task', taskSchema);
