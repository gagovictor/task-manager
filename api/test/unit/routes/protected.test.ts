import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import createTaskRouter from '@src/routes/tasks';

jest.mock('@src/routes/tasks', () => jest.fn());
jest.mock('@src/config/container');
jest.mock('@src/middlewares/auth', () => ({
    __esModule: true,
    default: jest.fn(),
}));

import Container from '@src/config/container';
import authMiddleware from '@src/middlewares/auth';
import getProtectedRouter from '@src/routes/protected';

const authMiddlewareMock = authMiddleware as jest.Mock;

describe('Protected Routes', () => {
    let app: express.Application;
    
    beforeEach(async () => {
        app = express();
        app.use(express.json());
    });
    
    it('should apply auth middleware and return 401 if not authenticated', async () => {
        authMiddlewareMock.mockImplementation((userRepository: any) => {
            return (req: Request, res: Response, next: NextFunction) => {
                res.status(401).send();
            };
        });
        
        (createTaskRouter as jest.Mock).mockReturnValue(express.Router());
        (Container.getUserRepository as jest.Mock).mockResolvedValue({});
        
        app.use('/protected', await getProtectedRouter());
        
        const response = await request(app).get('/protected/tasks');
        expect(response.status).toBe(401);
    });
    
    it('should proceed to tasks routes if authenticated', async () => {
        const taskRouterMock = express.Router();
        taskRouterMock.get('/', (req, res) => res.status(200).send());
        
        authMiddlewareMock.mockImplementation((userRepository: any) => {
            return (req: Request, res: Response, next: NextFunction) => {
                next();
            };
        });
        
        (createTaskRouter as jest.Mock).mockReturnValue(taskRouterMock);
        (Container.getUserRepository as jest.Mock).mockResolvedValue({});
        
        app.use('/protected', await getProtectedRouter());
        
        const response = await request(app).get('/protected/tasks');
        expect(response.status).toBe(200);
    });
});
