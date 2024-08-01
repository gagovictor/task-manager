const Task = require('../../../models/task');
const { createTask, getTasksByUser, updateTask, deleteTask } = require('../../../services/taskService');

// Mock dependencies
jest.mock('../../../models/task', () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
}));

describe('Task Service', () => {
    beforeAll(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    beforeEach(() => {
        jest.resetAllMocks();
    });
    
    afterAll(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });
    
    describe('createTask', () => {
        it('should create a task successfully', async () => {
            const taskData = { title: 'Task 1', description: 'Task description', dueDate: new Date(), userId: 1 };
            Task.create.mockResolvedValue(taskData);
            
            const result = await createTask(taskData);
            
            expect(result).toEqual(taskData);
            expect(Task.create).toHaveBeenCalledWith(taskData);
        });
        
        it('should throw an error if task creation fails', async () => {
            Task.create.mockRejectedValue(new Error('Database error'));
            
            await expect(createTask({ title: 'Task 1', description: 'Task description', dueDate: new Date(), userId: 1 }))
            .rejects.toThrow('Task creation failed');
        });
    });
    
    describe('getTasksByUser', () => {
        it('should return tasks for a given user', async () => {
            const userId = 1;
            const tasks = [{ id: 1, title: 'Task 1', userId }, { id: 2, title: 'Task 2', userId }];
            Task.findAll.mockResolvedValue(tasks);
            
            const result = await getTasksByUser(userId);
            
            expect(result).toEqual(tasks);
            expect(Task.findAll).toHaveBeenCalledWith({ where: { userId } });
        });
        
        it('should throw an error if fetching tasks fails', async () => {
            Task.findAll.mockRejectedValue(new Error('Database error'));
            
            await expect(getTasksByUser(1))
            .rejects.toThrow('Failed to fetch tasks');
        });
    });
    
    describe('updateTask', () => {
        it('should update a task successfully', async () => {
            const taskId = 1;
            const userId = 1;
            const updatedData = { title: 'Updated Task', description: 'Updated description', dueDate: new Date(), status: 'completed' };
            const task = { id: taskId, userId, ...updatedData, update: jest.fn().mockResolvedValue(updatedData) };
            Task.findOne.mockResolvedValue(task);
            
            const result = await updateTask(taskId, { ...updatedData, userId });
            
            expect(result.title).toEqual(updatedData.title);
            expect(result.description).toEqual(updatedData.description);
            expect(result.dueData).toEqual(updatedData.dueData);
            expect(result.status).toEqual(updatedData.status);
            expect(Task.findOne).toHaveBeenCalledWith({ where: { id: taskId, userId } });
            expect(task.update).toHaveBeenCalledWith(updatedData);
        });
        
        it('should throw an error if the task is not found', async () => {
            Task.findOne.mockResolvedValue(null);
            
            await expect(updateTask(1, { title: 'Updated Task', description: 'Updated description', dueDate: new Date(), status: 'completed', userId: 1 }))
            .rejects.toThrow('Task not found');
        });
        
        it('should throw an error if updating the task fails', async () => {
            const taskId = 1;
            const userId = 1;
            Task.findOne.mockResolvedValue({ id: taskId, userId, update: jest.fn().mockRejectedValue(new Error('Update error')) });
            
            await expect(updateTask(taskId, { title: 'Updated Task', description: 'Updated description', dueDate: new Date(), status: 'completed', userId }))
            .rejects.toThrow('Task update failed');
        });
    });
    
    describe('deleteTask', () => {
        it('should delete a task successfully', async () => {
            const taskId = 1;
            const userId = 1;
            const task = { id: taskId, userId, destroy: jest.fn().mockResolvedValue() };
            Task.findOne.mockResolvedValue(task);
            
            await deleteTask(taskId, userId);
            
            expect(Task.findOne).toHaveBeenCalledWith({ where: { id: taskId, userId } });
            expect(task.destroy).toHaveBeenCalled();
        });
        
        it('should throw an error if the task is not found', async () => {
            Task.findOne.mockResolvedValue(null);
            
            await expect(deleteTask(1, 1))
            .rejects.toThrow('Task not found');
        });
        
        it('should throw an error if deleting the task fails', async () => {
            const taskId = 1;
            const userId = 1;
            Task.findOne.mockResolvedValue({ id: taskId, userId, destroy: jest.fn().mockRejectedValue(new Error('Delete error')) });
            
            await expect(deleteTask(taskId, userId))
            .rejects.toThrow('Task deletion failed');
        });
    });
});
