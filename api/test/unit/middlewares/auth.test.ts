import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import authMiddleware, { AuthenticatedRequest } from '@src/middlewares/auth';
import IUserRepository from '@src/abstractions/repositories/IUserRepository';
import { User } from '@src/models/user';

describe('authMiddleware', () => {
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;
    let next: NextFunction;
    
    beforeEach(() => {
        mockUserRepository = {
            findByUsernameOrEmail: jest.fn<Promise<User | null>, [string, string]>(),
            findByUsername: jest.fn<Promise<User | null>, [string]>(),
            findByEmail: jest.fn<Promise<User>, [string]>(),
            findByResetToken: jest.fn<Promise<User>, [string, number]>(),
            findById: jest.fn<Promise<User>, [string]>(),
            createUser: jest.fn<Promise<User>, [Partial<User>]>(),
            updateUser: jest.fn<Promise<User>, [string, Partial<User>]>(),
        };
        
        req = {
            headers: {},
        };
        res = {
            status: jest.fn(() => res as Response),
            json: jest.fn(),
        };
        next = jest.fn();
        
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
    
    it('should return 401 if no token is provided', async () => {
        req.headers = {};
        
        const middleware = authMiddleware(mockUserRepository);
        await middleware(req as AuthenticatedRequest, res as Response, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if the token is invalid', async () => {
        req.headers = {
            authorization: 'Bearer invalidtoken',
        };
        
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            throw new Error('Invalid token');
        });
        
        // Act
        const middleware = authMiddleware(mockUserRepository);
        await middleware(req as AuthenticatedRequest, res as Response, next);
        
        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
        expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if no user is found for the provided token', async () => {
        const token = jwt.sign({ userId: 'testuser' }, 'test-secret');
        req.headers = {
            authorization: `Bearer ${token}`,
        };
        
        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return { userId: 'testuser' } as JwtPayload;
        });
        
        mockUserRepository.findById.mockResolvedValue(null);  // No user found
        
        // Act
        const middleware = authMiddleware(mockUserRepository);
        await middleware(req as AuthenticatedRequest, res as Response, next);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized - user not found' });
        expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next if a valid token and user are provided', async () => {
        const token = jwt.sign({ userId: 'testuser' }, 'test-secret');
        const mockUser: User = {
            id: 'testuser',
            username: 'testuser',
            email: 'test@test.com',
            password: 'hashedPassword',
            passwordResetToken: null,
            passwordResetExpires: null,
        };
        
        req.headers = {
            authorization: `Bearer ${token}`,
        };

        jest.spyOn(jwt, 'verify').mockImplementation(() => {
            return { userId: 'testuser' } as JwtPayload;
        });
        
        mockUserRepository.findById.mockResolvedValue(mockUser);
        
        const middleware = authMiddleware(mockUserRepository);
        await middleware(req as AuthenticatedRequest, res as Response, next);
        
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();  // Make sure no error response is sent
    });
});
