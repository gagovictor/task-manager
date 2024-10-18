import { Response } from 'express';
import httpMocks from 'node-mocks-http';
import TaskController from '@src/controllers/TaskController';
import { AuthenticatedRequest } from '@src/middlewares/auth';
import TaskService from '@src/services/TaskService';
import { Task } from '@src/models/task';
import { PaginatedResponse } from '@src/models/pagination';

describe('TaskController', () => {
    let mockTaskService: Partial<TaskService>;
    let taskController: TaskController;
    let req: httpMocks.MockRequest<AuthenticatedRequest>;
    let res: httpMocks.MockResponse<Response>;
    
    const mockUser = {
        id: 'testuser23',
        username: 'testuser',
        email: 'testuser@domain.com',
        password: '',
        passwordResetToken: null,
        passwordResetExpires: null,
    };
    
    beforeEach(() => {
        mockTaskService = {
            createTask: jest.fn(),
            getTasksByUser: jest.fn(),
            updateTask: jest.fn(),
            deleteTask: jest.fn(),
            archiveTask: jest.fn(),
            unarchiveTask: jest.fn(),
            updateTaskStatus: jest.fn(),
        };
        
        taskController = new TaskController(mockTaskService as TaskService);
        
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        
        req.user = mockUser;

        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    describe('createTask', () => {
        it('should respond with 201 and created task on success', async () => {
            const mockTask = { id: '1', title: 'Test Task', userId: mockUser.id };
            req.body = { title: 'Test Task', description: 'Test description', dueDate: new Date(), status: 'active' };
            
            (mockTaskService.createTask as jest.Mock).mockResolvedValue(mockTask);
            
            await taskController.createTask(req, res);
            
            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockTask);
            expect(mockTaskService.createTask).toHaveBeenCalledWith({
                title: 'Test Task',
                description: 'Test description',
                checklist: undefined,
                dueDate: req.body.dueDate,
                status: 'active',
                userId: mockUser.id
            });
        });
        
        it('should respond with 500 when service throws an error', async () => {
            const mockError = new Error('Task creation failed');
            req.body = { title: 'Test Task' };
            
            (mockTaskService.createTask as jest.Mock).mockRejectedValue(mockError);
            
            await taskController.createTask(req, res);
            
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ error: mockError.message });
        });
    });
    
    describe('getTasks', () => {
        it('should respond with 200 and a list of tasks', async () => {
            const getTasksResponse: PaginatedResponse<any> = {
                totalItems: 2,
                totalPages: 1,
                currentPage: 1,
                items: [{
                    id: '1',
                    title: 'Test Task',
                    userId: mockUser.id,
                    description: null,
                    checklist: null,
                    status: 'active',
                    dueDate: null,
                    createdAt: new Date().toISOString(),
                    archivedAt: null,
                    modifiedAt: null,
                    deletedAt: null
                }]
            };
            
            (mockTaskService.getTasksByUser as jest.Mock).mockResolvedValue(getTasksResponse);
            
            await taskController.getTasks(req, res);
            
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(getTasksResponse);
            expect(mockTaskService.getTasksByUser).toHaveBeenCalledWith(mockUser.id, 1, 10, {});
        });
        
        it('should respond with 500 when service throws an error', async () => {
            const mockError = new Error('Task fetching failed');
            
            (mockTaskService.getTasksByUser as jest.Mock).mockRejectedValue(mockError);
            
            await taskController.getTasks(req, res);
            
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ error: mockError.message });
        });
    });
    
    describe('updateTask', () => {
        it('should respond with 200 and updated task on success', async () => {
            const mockTask = { id: '1', title: 'Updated Task', userId: mockUser.id };
            req.params.id = '1';
            req.body = { title: 'Updated Task' };
            
            (mockTaskService.updateTask as jest.Mock).mockResolvedValue(mockTask);
            
            await taskController.updateTask(req, res);
            
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockTask);
            expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', {
                title: 'Updated Task',
                description: undefined,
                checklist: undefined,
                dueDate: undefined,
                status: undefined,
                userId: mockUser.id
            });
        });
        
        it('should respond with 500 when service throws an error', async () => {
            const mockError = new Error('Task update failed');
            req.params.id = '1';
            
            (mockTaskService.updateTask as jest.Mock).mockRejectedValue(mockError);
            
            await taskController.updateTask(req, res);
            
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ error: mockError.message });
        });
    });
    
    describe('deleteTask', () => {
        it('should respond with 204 on successful deletion', async () => {
            req.params.id = '1';
            
            (mockTaskService.deleteTask as jest.Mock).mockResolvedValue(undefined);
            
            await taskController.deleteTask(req, res);
            
            expect(res.statusCode).toBe(204);
            expect(res._isEndCalled()).toBe(true);
            expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1', mockUser.id);
        });
        
        it('should respond with 500 when service throws an error', async () => {
            const mockError = new Error('Task deletion failed');
            req.params.id = '1';
            
            (mockTaskService.deleteTask as jest.Mock).mockRejectedValue(mockError);
            
            await taskController.deleteTask(req, res);
            
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ error: mockError.message });
        });
    });
    
    describe('archiveTask', () => {
        it('should respond with 204 on successful archive', async () => {
            req.params.id = '1';
            
            (mockTaskService.archiveTask as jest.Mock).mockResolvedValue(undefined);
            
            await taskController.archiveTask(req, res);
            
            expect(res.statusCode).toBe(204);
            expect(res._isEndCalled()).toBe(true);
            expect(mockTaskService.archiveTask).toHaveBeenCalledWith('1', mockUser.id);
        });
        
        it('should respond with 500 when service throws an error', async () => {
            const mockError = new Error('Task archive failed');
            req.params.id = '1';
            
            (mockTaskService.archiveTask as jest.Mock).mockRejectedValue(mockError);
            
            await taskController.archiveTask(req, res);
            
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ error: mockError.message });
        });
    });
    
    describe('unarchiveTask', () => {
        it('should respond with 204 on successful unarchive', async () => {
            req.params.id = '1';
            
            (mockTaskService.unarchiveTask as jest.Mock).mockResolvedValue(undefined);
            
            await taskController.unarchiveTask(req, res);
            
            expect(res.statusCode).toBe(204);
            expect(res._isEndCalled()).toBe(true);
            expect(mockTaskService.unarchiveTask).toHaveBeenCalledWith('1', mockUser.id);
        });
        
        it('should respond with 500 when service throws an error', async () => {
            const mockError = new Error('Task unarchive failed');
            req.params.id = '1';
            
            (mockTaskService.unarchiveTask as jest.Mock).mockRejectedValue(mockError);
            
            await taskController.unarchiveTask(req, res);
            
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ error: mockError.message });
        });
    });
    
    describe('updateTaskStatus', () => {
        it('should respond with 200 and updated task status on success', async () => {
            const mockTask = { id: '1', status: 'completed', userId: mockUser.id };
            req.params.id = '1';
            req.body = { status: 'completed' };
            
            (mockTaskService.updateTaskStatus as jest.Mock).mockResolvedValue(mockTask);
            
            await taskController.updateTaskStatus(req, res);
            
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockTask);
            expect(mockTaskService.updateTaskStatus).toHaveBeenCalledWith('1', 'completed', mockUser.id);
        });
        
        it('should respond with 404 when task is not found', async () => {
            req.params.id = '1';
            req.body = { status: 'completed' };
            
            (mockTaskService.updateTaskStatus as jest.Mock).mockResolvedValue(null);
            
            await taskController.updateTaskStatus(req, res);
            
            expect(res.statusCode).toBe(404);
            expect(res._getJSONData()).toEqual({ error: 'Task not found' });
        });
        
        it('should respond with 500 when service throws an error', async () => {
            const mockError = new Error('Task status update failed');
            req.params.id = '1';
            req.body = { status: 'completed' };
            
            (mockTaskService.updateTaskStatus as jest.Mock).mockRejectedValue(mockError);
            
            await taskController.updateTaskStatus(req, res);
            
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ error: mockError.message });
        });
    });
});
