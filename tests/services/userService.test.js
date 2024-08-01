const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const { Op } = require('sequelize');

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../models/user', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

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

const { register, login } = require('../../services/userService');

describe('User Service', () => {
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
  
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock user finding
      User.findOne.mockResolvedValue(null);
      // Mock password hashing
      bcrypt.hash.mockResolvedValue('hashedPassword');
      // Mock user creation
      User.create.mockResolvedValue({ id: 1, username: 'testuser', email: 'test@example.com' });
      
      const result = await register({
        username: 'testuser',
        password: 'password',
        email: 'test@example.com'
      });
      
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      });
      expect(User.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ username: 'testuser' }, { email: 'test@example.com' }]
        }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
    });
    
    it('should throw an error if username already exists', async () => {
      User.findOne.mockResolvedValue({ username: 'testuser', email: 'other@example.com' });
      
      await expect(register({
        username: 'testuser',
        password: 'password',
        email: 'new@example.com'
      })).rejects.toThrow('Username already exists');
    });
    
    it('should throw an error if email already exists', async () => {
      User.findOne.mockResolvedValue({ username: 'otheruser', email: 'test@example.com' });
      
      await expect(register({
        username: 'newuser',
        password: 'password',
        email: 'test@example.com'
      })).rejects.toThrow('Email already in use');
    });
    
    it('should throw a general error if something goes wrong', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      await expect(register({
        username: 'testuser',
        password: 'password',
        email: 'test@example.com'
      })).rejects.toThrow('Registration failed');
    });
  });
  
  describe('login', () => {
    it('should log in a user and return a token', async () => {
      // Mock user finding
      User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com', password: 'hashedPassword' });
      // Mock password comparison
      bcrypt.compare.mockResolvedValue(true);
      // Mock token signing
      jwt.sign.mockReturnValue('token');
      
      const result = await login({
        email: 'test@example.com',
        password: 'password'
      });
      
      expect(result).toBe('token');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });
    
    it('should throw an error if no user is found with the email', async () => {
      User.findOne.mockResolvedValue(null);
      
      await expect(login({
        email: 'nonexistent@example.com',
        password: 'password'
      })).rejects.toThrow('No user found with this email');
    });
    
    it('should throw an error if the password is incorrect', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com', password: 'hashedPassword' });
      bcrypt.compare.mockResolvedValue(false);
      
      await expect(login({
        email: 'test@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow('Incorrect password');
    });
    
    it('should throw a general error if something goes wrong', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      await expect(login({
        email: 'test@example.com',
        password: 'password'
      })).rejects.toThrow('Login failed');
    });
  });
});
