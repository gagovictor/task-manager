
const { signup, login } = require('../../../controllers/authController');
const authService = require('../../../services/authService');
const httpMocks = require('node-mocks-http');

jest.mock('../../../services/authService');

jest.mock('sequelize', () => {
  const DataTypes = {
    UUID: 'UUID',
    UUIDV4: 'UUIDV4',
    STRING: 'STRING',
  };
  
  return {
    Sequelize: jest.fn().mockImplementation(() => ({
      authenticate: jest.fn().mockResolvedValue(true),
      define: jest.fn().mockReturnValue({
      }),
      close: jest.fn(),
    })),
    DataTypes,
    Op: {
      or: 'Op.or',
    }
  };
});

describe('AuthController', () => {
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
    req = {
      body: {}
    };
    res = {
      statusCode: 200,
      data: '',
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = JSON.stringify(data); // Store as JSON string
      },
      _getData: function() {
        return this.data;
      }
    };
  });
  
  describe('login', () => {
    it('should log in a user successfully', async () => {
      // Arrange
      const token = 'fake-jwt-token';
      authService.login.mockResolvedValue(token);
      
      req.body = { username: 'testuser', password: 'password' };
      
      // Act
      await login(req, res);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(token);
    });
    
    it('should handle login error', async () => {
      // Arrange
      const error = new Error('Login failed');
      authService.login.mockRejectedValue(error);
      
      req.body = { username: 'testuser', password: 'password' };
      
      // Act
      await login(req, res);
      
      // Assert
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: error.message }); // Parse response data
    });
  });
});