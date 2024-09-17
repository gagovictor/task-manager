import ITaskRepository from '../taskRepository';
import { IMongooseTask, MongooseTask } from '../../models/mongoose/task';
import { Task } from '../../models/task';
import { v4 as uuidv4 } from 'uuid';

export default class MongooseTaskRepository implements ITaskRepository {
    
    private parseTask(doc: IMongooseTask): Task {
        return {
            id: doc.id.toString(),
            title: doc.title,
            description: doc.description,
            checklist: doc.checklist,
            dueDate: doc.dueDate,
            status: doc.status,
            archivedAt: doc.archivedAt,
            deletedAt: doc.deletedAt,
            userId: doc.userId.toString()
        };
    }

    async createTask(taskData: Partial<Task>): Promise<Task> {
        const newTask = new MongooseTask({
            id: uuidv4(),
            ...taskData
        });
        const result = await newTask.save();
        return this.parseTask(result);
    }
    
    async getTasksByUser(userId: string): Promise<Task[]> {
        const result = await MongooseTask.find({ userId, deletedAt: null }).exec();
        return result.map(taskDoc => this.parseTask(taskDoc));
    }
    
    async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
        const result = await MongooseTask.findByIdAndUpdate(id, updates, { new: true }).exec();
        return this.parseTask(result!);
    }
    
    async deleteTask(id: string, userId: string): Promise<void> {
        await MongooseTask.findOneAndDelete({ _id: id, userId }).exec();
    }
    
    async archiveTask(id: string, userId: string): Promise<void> {
        await MongooseTask.findOneAndUpdate({ _id: id, userId }, { archivedAt: new Date() }).exec();
    }
    
    async unarchiveTask(id: string, userId: string): Promise<void> {
        await MongooseTask.findOneAndUpdate({ _id: id, userId }, { archivedAt: null }).exec();
    }
    
    async updateTaskStatus(taskId: string, status: string, userId: string): Promise<Task | null> {
        const result = await MongooseTask.findOneAndUpdate({ _id: taskId, userId }, { status }, { new: true }).exec();
        return this.parseTask(result!);
    }
}
