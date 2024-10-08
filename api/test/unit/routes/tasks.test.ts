import request from 'supertest';
import express from 'express';
import createTaskRouter from '@src/routes/tasks';
import Container from '@src/config/container';

jest.mock('@src/config/container');

describe('Task Routes', () => {
    let app: express.Application;
    
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/tasks', createTaskRouter());
    });
    
    // Mock for getTaskController
    const mockTaskController = {
        getTasks: jest.fn(),
        getTask: jest.fn(),
        createTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        archiveTask: jest.fn(),
        unarchiveTask: jest.fn(),
        updateTaskStatus: jest.fn(),
        bulkImportTasks: jest.fn(),
    };
    
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        (Container.getTaskController as jest.Mock).mockResolvedValue(mockTaskController);
    });
    
    describe('GET /tasks', () => {
        it('should call the getTasks method from the controller', async () => {
            mockTaskController.getTasks.mockImplementation((req, res) => {
                res.status(200).json([]);
            });
            
            const response = await request(app).get('/tasks');
            expect(mockTaskController.getTasks).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
        
        it('should handle errors in getTasks', async () => {
            mockTaskController.getTasks.mockImplementation(() => {
                throw new Error('Error fetching tasks');
            });
            
            const response = await request(app).get('/tasks');
            expect(mockTaskController.getTasks).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
    
    describe('POST /tasks', () => {
        it('should call the createTask method from the controller', async () => {
            mockTaskController.createTask.mockImplementation((req, res) => {
                res.status(201).json({ id: 'task-id', ...req.body });
            });
            
            const response = await request(app).post('/tasks').send({
                title: 'Test Task',
                description: 'A test task',
            });
            
            expect(mockTaskController.createTask).toHaveBeenCalled();
            expect(response.status).toBe(201);
        });
        
        it('should handle errors in createTask', async () => {
            mockTaskController.createTask.mockImplementation(() => {
                throw new Error('Creation error');
            });
            
            const response = await request(app).post('/tasks').send({
                title: 'Test Task',
                description: 'A test task',
            });
            
            expect(mockTaskController.createTask).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
    
    describe('PATCH /tasks/:id', () => {
        it('should call the updateTask method from the controller', async () => {
            mockTaskController.updateTask.mockImplementation((req, res) => {
                res.status(200).json({ id: req.params.id, ...req.body });
            });
            
            const response = await request(app).patch('/tasks/123').send({
                title: 'Updated Task',
            });
            
            expect(mockTaskController.updateTask).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
        
        it('should handle errors in updateTask', async () => {
            mockTaskController.updateTask.mockImplementation(() => {
                throw new Error('Update error');
            });
            
            const response = await request(app).patch('/tasks/123').send({
                title: 'Updated Task',
            });
            
            expect(mockTaskController.updateTask).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
    
    describe('DELETE /tasks/:id', () => {
        it('should call the deleteTask method from the controller', async () => {
            mockTaskController.deleteTask.mockImplementation((req, res) => {
                res.status(204).send();
            });
            
            const response = await request(app).delete('/tasks/123');
            
            expect(mockTaskController.deleteTask).toHaveBeenCalled();
            expect(response.status).toBe(204);
        });
        
        it('should handle errors in deleteTask', async () => {
            mockTaskController.deleteTask.mockImplementation(() => {
                throw new Error('Deletion error');
            });
            
            const response = await request(app).delete('/tasks/123');
            
            expect(mockTaskController.deleteTask).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
    
    describe('POST /tasks/:id/archive', () => {
        it('should call the archiveTask method from the controller', async () => {
            mockTaskController.archiveTask.mockImplementation((req, res) => {
                res.status(204).send();
            });
            
            const response = await request(app).post('/tasks/123/archive');
            
            expect(mockTaskController.archiveTask).toHaveBeenCalled();
            expect(response.status).toBe(204);
        });
        
        it('should handle errors in archiveTask', async () => {
            mockTaskController.archiveTask.mockImplementation(() => {
                throw new Error('Archiving error');
            });
            
            const response = await request(app).post('/tasks/123/archive');
            
            expect(mockTaskController.archiveTask).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
    
    describe('POST /tasks/:id/unarchive', () => {
        it('should call the unarchiveTask method from the controller', async () => {
            mockTaskController.unarchiveTask.mockImplementation((req, res) => {
                res.status(204).send();
            });
            
            const response = await request(app).post('/tasks/123/unarchive');
            
            expect(mockTaskController.unarchiveTask).toHaveBeenCalled();
            expect(response.status).toBe(204);
        });
        
        it('should handle errors in unarchiveTask', async () => {
            mockTaskController.unarchiveTask.mockImplementation(() => {
                throw new Error('Unarchiving error');
            });
            
            const response = await request(app).post('/tasks/123/unarchive');
            
            expect(mockTaskController.unarchiveTask).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
    
    describe('POST /tasks/:id/status', () => {
        it('should call the updateTaskStatus method from the controller', async () => {
            mockTaskController.updateTaskStatus.mockImplementation((req, res) => {
                res.status(200).json({ id: req.params.id, status: req.body.status });
            });
            
            const response = await request(app)
            .post('/tasks/123/status')
            .send({ status: 'completed' });
            
            expect(mockTaskController.updateTaskStatus).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
        
        it('should handle errors in updateTaskStatus', async () => {
            mockTaskController.updateTaskStatus.mockImplementation(() => {
                throw new Error('Status update error');
            });
            
            const response = await request(app)
            .post('/tasks/123/status')
            .send({ status: 'completed' });
            
            expect(mockTaskController.updateTaskStatus).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
    
    describe('POST /tasks/bulk-import', () => {
        it('should call the bulkImportTasks method from the controller', async () => {
            mockTaskController.bulkImportTasks.mockImplementation((req, res) => {
                res.status(201).json({ importedCount: req.body.length });
            });
            
            const tasksToImport = [
                { title: 'Task 1' },
                { title: 'Task 2' },
            ];
            
            const response = await request(app)
            .post('/tasks/bulk-import')
            .send(tasksToImport);
            
            expect(mockTaskController.bulkImportTasks).toHaveBeenCalled();
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ importedCount: 2 });
        });
        
        it('should handle errors in bulkImportTasks', async () => {
            mockTaskController.bulkImportTasks.mockImplementation(() => {
                throw new Error('Bulk import error');
            });
            
            const tasksToImport = [
                { title: 'Task 1' },
                { title: 'Task 2' },
            ];
            
            const response = await request(app)
            .post('/tasks/bulk-import')
            .send(tasksToImport);
            
            expect(mockTaskController.bulkImportTasks).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
});
