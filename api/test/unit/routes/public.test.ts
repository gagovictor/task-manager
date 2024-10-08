import request from 'supertest';
import express from 'express';
import getPublicRouter from '@src/routes/public';
import createAuthRouter from '@src/routes/auth';

jest.mock('@src/routes/auth', () => jest.fn());

describe('Public Routes', () => {
    let app: express.Application;
    
    beforeEach(() => {
        app = express();
        app.use(express.json());
    });
    
    it('should call auth routes', async () => {
        (createAuthRouter as jest.Mock).mockReturnValue(express.Router());
        
        app.use('/public', getPublicRouter());
        
        const response = await request(app).post('/public/auth/signup').send({
            email: 'test@example.com',
            password: 'password123',
        });
        
        expect(createAuthRouter).toHaveBeenCalled();
        expect(response.status).toBe(404);
    });
});
