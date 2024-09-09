const { createTask, getTasks, updateTask, deleteTask } = require('../../../controllers/taskController');
const taskService = require('../../../services/taskService');
const httpMocks = require('node-mocks-http');

jest.mock('../../../services/taskService');

jest.mock('sequelize', () => {
  const DataTypes = {
    UUID: 'UUID',
    UUIDV4: 'UUIDV4',
    STRING: 'STRING',
    DATE: 'DATE',
  };

  const Model = {
    belongsTo: jest.fn(),
    hasMany: jest.fn(),
  };

  return {
    Sequelize: jest.fn().mockImplementation(() => ({
      authenticate: jest.fn().mockResolvedValue(true),
      define: jest.fn().mockImplementation(() => Model),
      close: jest.fn(),
    })),
    DataTypes,
    Op: {
      or: 'Op.or',
    },
    Model,
  };
});


describe('TaskController', () => {
  let req, res;
  
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });
  
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });
  
  describe('createTask', () => {
    it('should create a task successfully', async () => {
      // Arrange
      const task = { id: 1, title: 'Test Task', description: 'Test Description', dueDate: new Date().toISOString(), userId: 1 };
      taskService.createTask.mockResolvedValue(task);
      req.body = { title: 'Test Task', description: 'Test Description', dueDate: new Date() };
      req.user = { id: 1 };
      
      // Act
      await createTask(req, res);
      
      // Assert
      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(task);
    });
    
    it('should handle task creation error', async () => {
      // Arrange
      const error = new Error('Task creation failed');
      taskService.createTask.mockRejectedValue(error);
      req.body = { title: 'Test Task', description: 'Test Description', dueDate: new Date() };
      req.user = { id: 1 };
      
      // Act
      await createTask(req, res);
      
      // Assert
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({ error: error.message });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      req.body = { title: 'Test Task', description: 'Test Description', dueDate: new Date() };
      
      // Act
      await createTask(req, res);
      
      // Assert
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'User not authenticated' });
    });
  });
  
  describe('getTasks', () => {
    it('should get tasks successfully', async () => {
      // Arrange
      const tasks = [{ id: 1, title: 'Test Task', description: 'Test Description', dueDate: new Date().toISOString() }];
      taskService.getTasksByUser.mockResolvedValue(tasks);
      req.user = { id: 1 };
      
      // Act
      await getTasks(req, res);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(tasks);
    });
    
    it('should handle error while fetching tasks', async () => {
      // Arrange
      const error = new Error('Fetching tasks failed');
      taskService.getTasksByUser.mockRejectedValue(error);
      req.user = { id: 1 };
      
      // Act
      await getTasks(req, res);
      
      // Assert
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({ error: error.message });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Act
      await getTasks(req, res);
      
      // Assert
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'User not authenticated' });
    });
  });
  
  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      // Arrange
      const task = { id: 1, title: 'Updated Task', description: 'Updated Description', dueDate: new Date().toISOString(), status: 'completed', userId: 1 };
      taskService.updateTask.mockResolvedValue(task);
      req.params = { id: 1 };
      req.body = { title: 'Updated Task', description: 'Updated Description', dueDate: new Date(), status: 'completed' };
      req.user = { id: 1 };
      
      // Act
      await updateTask(req, res);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(task);
    });
    
    it('should handle task update error', async () => {
      // Arrange
      const error = new Error('Task update failed');
      taskService.updateTask.mockRejectedValue(error);
      req.params = { id: 1 };
      req.body = { title: 'Updated Task', description: 'Updated Description', dueDate: new Date(), status: 'completed' };
      req.user = { id: 1 };
      
      // Act
      await updateTask(req, res);
      
      // Assert
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({ error: error.message });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      req.params = { id: 1 };
      req.body = { title: 'Updated Task', description: 'Updated Description', dueDate: new Date(), status: 'completed' };
      
      // Act
      await updateTask(req, res);
      
      // Assert
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'User not authenticated' });
    });
  });
  
  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
        // Arrange
        taskService.deleteTask.mockResolvedValue(); // Simulate successful deletion
        req.params = { id: 1 };
        req.user = { id: 1 };
        
        // Act
        await deleteTask(req, res);
        
        // Assert
        expect(res.statusCode).toBe(204);
        expect(res._getData()).toBe(''); // No content
    });
    
    it('should handle task deletion error', async () => {
      // Arrange
      const error = new Error('Task deletion failed');
      taskService.deleteTask.mockRejectedValue(error);
      req.params = { id: 1 };
      req.user = { id: 1 };
      
      // Act
      await deleteTask(req, res);
      
      // Assert
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({ error: error.message });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Arrange
      req.params = { id: 1 };
      
      // Act
      await deleteTask(req, res);
      
      // Assert
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: 'User not authenticated' });
    });
  });
});
