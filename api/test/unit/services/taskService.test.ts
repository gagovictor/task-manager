
import TaskService from '@src/services/taskService';
import ITaskRepository from '@src/repositories/taskRepository';
import { CreateTaskDto, Task, TaskStatus, UpdateTaskDto } from '@src/models/task';
import { PaginatedResponse, TaskFilter } from '@src/models/pagination';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

describe('TaskService', () => {
    let mockTaskRepository: jest.Mocked<ITaskRepository>;
    let taskService: TaskService;
    
    beforeEach(() => {
        // Mock the UUID to return a fixed value
        (uuidv4 as jest.Mock).mockReturnValue('0315021b-d135-4403-8929-8b1471365eb2');

        // Use fake timers and set a fixed date
        jest.useFakeTimers({ legacyFakeTimers: false });
        jest.setSystemTime(new Date('2024-10-03T21:33:57.345Z'));

        mockTaskRepository = {
            createTask: jest.fn<Promise<Task>, [Task]>(),
            getTasksByUser: jest.fn<Promise<PaginatedResponse<Task>>, [string, number, number, TaskFilter | undefined]>(),
            updateTask: jest.fn<Promise<Task>, [string, Partial<Task>]>(),
            deleteTask: jest.fn<Promise<void>, [string, string]>(),
            archiveTask: jest.fn<Promise<void>, [string, string]>(),
            unarchiveTask: jest.fn<Promise<void>, [string, string]>(),
            updateTaskStatus: jest.fn<Promise<Task | null>, [string, string, string]>(),
            bulkCreateTasks: jest.fn<Promise<Task[]>, [Task[]]>(),
        };
        
        taskService = new TaskService(mockTaskRepository);

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
        // Restore real timers and mocks
        jest.useRealTimers();
        jest.restoreAllMocks();
    });
    
    describe('createTask', () => {
        it('should call the repository to create a new task', async () => {
            const taskParams: CreateTaskDto = {
                title: 'New Task',
                description: 'Task Description',
                checklist: [],
                dueDate: new Date('2024-10-03T21:33:57.344Z'),
                status: 'active',
                userId: 'testuser',
            };
            
            const mockTask: Task = {
                ...taskParams,
                id: '0315021b-d135-4403-8929-8b1471365eb2', 
                createdAt: new Date('2024-10-03T21:33:57.345Z'),
                modifiedAt: null,
                archivedAt: null,
                deletedAt: null,
            };

            mockTaskRepository.createTask.mockResolvedValue(mockTask);
            
            const result = await taskService.createTask(taskParams);
            
            // Expect the repository to be called with taskParams plus id and createdAt
            expect(mockTaskRepository.createTask).toHaveBeenCalledWith(mockTask);
            expect(result).toEqual(mockTask);
        });
    });
    
    describe('getTasksByUser', () => {
        it('should call the repository to get tasks by user', async () => {
            const userId = 'testuser';
            const mockTasks: PaginatedResponse<Task> = {
                totalItems: 2,
                totalPages: 1,
                currentPage: 1,
                items: [
                    {
                        userId,
                        id: 'task1',
                        title: 'Task 1',
                        description: 'Description 1',
                        checklist: [],
                        dueDate: new Date('2024-10-03T21:33:57.344Z'),
                        status: 'active',
                        createdAt: new Date('2024-10-03T21:33:57.345Z'),
                        modifiedAt: new Date('2024-10-03T21:33:57.346Z'),
                        archivedAt: new Date('2024-10-03T21:33:57.347Z'),
                        deletedAt: new Date('2024-10-03T21:33:57.348Z'),
                    },
                    {
                        userId,
                        id: 'task2',
                        title: 'Task 2',
                        description: 'Description 2',
                        checklist: [],
                        dueDate: new Date('2024-10-03T21:33:57.344Z'),
                        status: 'completed',
                        createdAt: new Date('2024-10-03T21:33:57.345Z'),
                        modifiedAt: new Date('2024-10-03T21:33:57.346Z'),
                        archivedAt: new Date('2024-10-03T21:33:57.347Z'),
                        deletedAt: new Date('2024-10-03T21:33:57.348Z'),
                    },
                ],
            };
            
            mockTaskRepository.getTasksByUser.mockResolvedValue(mockTasks);
            
            const result = await taskService.getTasksByUser(userId, 0, 10, { archived: false });
            
            expect(mockTaskRepository.getTasksByUser).toHaveBeenCalledWith(userId, 0, 10, { archived: false });
            expect(result).toEqual(mockTasks);
        });
    });
    
    describe('updateTask', () => {
        it('should call the repository to update a task', async () => {
            const taskId = 'task1';
            const updates: UpdateTaskDto = {
                userId: 'testuser',
                title: 'Updated Task'
            };
            const updatedTask: Task = {
                id: taskId,
                title: 'Updated Task',
                description: 'Description 1',
                checklist: [],
                dueDate: new Date('2024-10-03T21:33:57.344Z'),
                status: 'active',
                userId: 'testuser',
                createdAt: new Date('2024-10-03T21:33:57.345Z'),
                modifiedAt: new Date('2024-10-03T21:33:57.345Z'),
                archivedAt: null,
                deletedAt: null,
            };
            
            mockTaskRepository.updateTask.mockResolvedValue(updatedTask);
            
            const result = await taskService.updateTask(taskId, updates);
            
            // Expect the repository to be called with taskId and updates plus modifiedAt
            expect(mockTaskRepository.updateTask).toHaveBeenCalledWith(taskId, {
                ...updates,
                modifiedAt: new Date('2024-10-03T21:33:57.345Z'),
            });
            expect(result).toEqual(updatedTask);
        });
    });
    
    describe('deleteTask', () => {
        it('should call the repository to delete a task', async () => {
            const taskId = 'task1';
            const userId = 'testuser';
            
            mockTaskRepository.deleteTask.mockResolvedValue();
            
            await taskService.deleteTask(taskId, userId);
            
            expect(mockTaskRepository.deleteTask).toHaveBeenCalledWith(taskId, userId);
        });
    });
    
    describe('archiveTask', () => {
        it('should call the repository to archive a task', async () => {
            const taskId = 'task1';
            const userId = 'testuser';
            
            mockTaskRepository.archiveTask.mockResolvedValue();
            
            await taskService.archiveTask(taskId, userId);
            
            expect(mockTaskRepository.archiveTask).toHaveBeenCalledWith(taskId, userId);
        });
    });
    
    describe('unarchiveTask', () => {
        it('should call the repository to unarchive a task', async () => {
            const taskId = 'task1';
            const userId = 'testuser';
            
            mockTaskRepository.unarchiveTask.mockResolvedValue();
            
            await taskService.unarchiveTask(taskId, userId);
            
            expect(mockTaskRepository.unarchiveTask).toHaveBeenCalledWith(taskId, userId);
        });
    });
    
    describe('updateTaskStatus', () => {
        it('should call the repository to update the status of a task', async () => {
            const taskId = 'task1';
            const status = 'completed';
            const userId = 'testuser';
            const updatedTask: Task = {
                id: taskId,
                title: 'Task 1',
                description: 'Description 1',
                checklist: [],
                dueDate: new Date('2024-10-03T21:33:57.344Z'),
                status,
                userId,
                createdAt: new Date('2024-10-03T21:33:57.345Z'),
                modifiedAt: new Date('2024-10-03T21:33:57.346Z'),
                archivedAt: null,
                deletedAt: null,
            };
            
            mockTaskRepository.updateTaskStatus.mockResolvedValue(updatedTask);
            
            const result = await taskService.updateTaskStatus(taskId, status, userId);
            
            expect(mockTaskRepository.updateTaskStatus).toHaveBeenCalledWith(taskId, status, userId);
            expect(result).toEqual(updatedTask);
        });
    });

    describe('bulkImportTasks', () => {
        it('should throw an error if tasks array is invalid', async () => {
            // Arrange
            const invalidTasks: any = null; // Invalid input

            // Act & Assert
            await expect(taskService.bulkImportTasks(invalidTasks, 'userId'))
                .rejects.toThrow('Invalid tasks data provided.');
        });

        it('should import tasks and return the imported tasks', async () => {
            // Arrange
            const tasks = [
                { title: 'Task 1', description: 'Description 1', status: 'active' },
                { title: 'Task 2', description: 'Description 2', status: 'completed' }
            ];

            const preparedTasks: Task[] = tasks.map(task => ({
                id: '0315021b-d135-4403-8929-8b1471365eb2',
                userId: 'userId',
                title: task.title!,
                description: task.description!,
                checklist: null,
                dueDate: null,
                status: task.status || TaskStatus.New,
                createdAt: new Date(),
                modifiedAt: new Date(),
                archivedAt: null,
                deletedAt: null,
            }));

            mockTaskRepository.bulkCreateTasks.mockResolvedValue(preparedTasks);

            // Act
            const result = await taskService.bulkImportTasks(tasks, 'userId');

            // Assert
            expect(mockTaskRepository.bulkCreateTasks).toHaveBeenCalledWith(preparedTasks);
            expect(result).toEqual(preparedTasks);
        });
    });
});
