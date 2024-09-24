import TaskService from '../../../src/services/taskService';
import ITaskRepository from '../../../src/repositories/taskRepository';
import { CreateTaskRequestBody, Task } from '../../../src/models/task';

describe('TaskService', () => {
    let mockTaskRepository: jest.Mocked<ITaskRepository>;
    let taskService: TaskService;
    
    beforeEach(() => {
        mockTaskRepository = {
            createTask: jest.fn<Promise<Task>, [Task]>(),
            getTasksByUser: jest.fn<Promise<Task[]>, [string]>(),
            updateTask: jest.fn<Promise<Task>, [string, Partial<Task>]>(),
            deleteTask: jest.fn<Promise<void>, [string, string]>(),
            archiveTask: jest.fn<Promise<void>, [string, string]>(),
            unarchiveTask: jest.fn<Promise<void>, [string, string]>(),
            updateTaskStatus: jest.fn<Promise<Task | null>, [string, string, string]>(),
        };
        
        taskService = new TaskService(mockTaskRepository);

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    describe('createTask', () => {
        it('should call the repository to create a new task', async () => {
            const taskParams: CreateTaskRequestBody = {
                title: 'New Task',
                description: 'Task Description',
                checklist: [],
                dueDate: new Date(),
                status: 'active',
                userId: 'user1',
            };
            
            const mockTask: Task = {
                ...taskParams,
                id: 'task1', 
                createdAt: new Date()
            };

            mockTaskRepository.createTask.mockResolvedValue(mockTask);
            
            const result = await taskService.createTask(taskParams);
            
            expect(mockTaskRepository.createTask).toHaveBeenCalledWith(taskParams);
            expect(result).toEqual(mockTask);
        });
    });
    
    describe('getTasksByUser', () => {
        it('should call the repository to get tasks by user', async () => {
            const userId = 'user1';
            const mockTasks: Task[] = [
                {
                    id: 'task1',
                    title: 'Task 1',
                    description: 'Description 1',
                    checklist: [],
                    dueDate: new Date(),
                    status: 'active',
                    userId,
                    createdAt: new Date(),
                },
                {
                    id: 'task2',
                    title: 'Task 2',
                    description: 'Description 2',
                    checklist: [],
                    dueDate: new Date(),
                    status: 'completed',
                    userId,
                    createdAt: new Date(),
                },
            ];
            
            mockTaskRepository.getTasksByUser.mockResolvedValue(mockTasks);
            
            const result = await taskService.getTasksByUser(userId);
            
            expect(mockTaskRepository.getTasksByUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockTasks);
        });
    });
    
    describe('updateTask', () => {
        it('should call the repository to update a task', async () => {
            const taskId = 'task1';
            const updates: Partial<Task> = { title: 'Updated Task' };
            const updatedTask: Task = {
                id: taskId,
                title: 'Updated Task',
                description: 'Description 1',
                checklist: [],
                dueDate: new Date(),
                status: 'active',
                userId: 'user1',
                createdAt: new Date(),
            };
            
            mockTaskRepository.updateTask.mockResolvedValue(updatedTask);
            
            const result = await taskService.updateTask(taskId, updates);
            
            expect(mockTaskRepository.updateTask).toHaveBeenCalledWith(taskId, updates);
            expect(result).toEqual(updatedTask);
        });
    });
    
    describe('deleteTask', () => {
        it('should call the repository to delete a task', async () => {
            const taskId = 'task1';
            const userId = 'user1';
            
            mockTaskRepository.deleteTask.mockResolvedValue();
            
            await taskService.deleteTask(taskId, userId);
            
            expect(mockTaskRepository.deleteTask).toHaveBeenCalledWith(taskId, userId);
        });
    });
    
    describe('archiveTask', () => {
        it('should call the repository to archive a task', async () => {
            const taskId = 'task1';
            const userId = 'user1';
            
            mockTaskRepository.archiveTask.mockResolvedValue();
            
            await taskService.archiveTask(taskId, userId);
            
            expect(mockTaskRepository.archiveTask).toHaveBeenCalledWith(taskId, userId);
        });
    });
    
    describe('unarchiveTask', () => {
        it('should call the repository to unarchive a task', async () => {
            const taskId = 'task1';
            const userId = 'user1';
            
            mockTaskRepository.unarchiveTask.mockResolvedValue();
            
            await taskService.unarchiveTask(taskId, userId);
            
            expect(mockTaskRepository.unarchiveTask).toHaveBeenCalledWith(taskId, userId);
        });
    });
    
    describe('updateTaskStatus', () => {
        it('should call the repository to update the status of a task', async () => {
            const taskId = 'task1';
            const status = 'completed';
            const userId = 'user1';
            const updatedTask: Task = {
                id: taskId,
                title: 'Task 1',
                description: 'Description 1',
                checklist: [],
                dueDate: new Date(),
                status,
                userId,
                createdAt: new Date(),
            };
            
            mockTaskRepository.updateTaskStatus.mockResolvedValue(updatedTask);
            
            const result = await taskService.updateTaskStatus(taskId, status, userId);
            
            expect(mockTaskRepository.updateTaskStatus).toHaveBeenCalledWith(taskId, status, userId);
            expect(result).toEqual(updatedTask);
        });
    });
});
