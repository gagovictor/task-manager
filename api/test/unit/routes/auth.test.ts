import request from 'supertest';
import express, { ErrorRequestHandler } from 'express';
import createAuthRouter from '@src/routes/auth';
import Container from '@src/config/container';

jest.mock('@src/config/container');

describe('Auth Routes', () => {
    let app: express.Application;
    
    beforeEach(() => {
        const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
            res.status(500).send();
        };
        app = express();
        app.use(express.json());
        app.use('/auth', createAuthRouter());
        app.use(errorHandler);
    });
    
    describe('POST /auth/signup', () => {
        it('should call the signup controller method', async () => {
            const signupMock = jest.fn((req, res) => {
                res.status(200).json({ status: 'success' });
            });
            (Container.getAuthController as jest.Mock).mockResolvedValue({ signup: signupMock });
            
            const response = await request(app).post('/auth/signup').send({
                email: 'test@example.com',
                password: 'password123',
            });
            
            expect(signupMock).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
        
        it('should handle errors from the signup controller', async () => {
            const signupMock = jest.fn((req, res) => {
                throw new Error('Signup error');
            });
            (Container.getAuthController as jest.Mock).mockResolvedValue({ signup: signupMock });
            
            const response = await request(app).post('/auth/signup').send({
                email: 'test@example.com',
                password: 'password123',
            });
            
            expect(signupMock).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
    
    describe('POST /auth/login', () => {
        it('should call the login controller method', async () => {
            const loginMock = jest.fn((req, res) => {
                res.status(200).json({ status: 'success' });
            });
            (Container.getAuthController as jest.Mock).mockResolvedValue({ login: loginMock });
            
            const response = await request(app).post('/auth/login').send({
                email: 'test@example.com',
                password: 'password123',
            });
            
            expect(loginMock).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
        
        it('should handle errors from the login controller', async () => {
            const loginMock = jest.fn((req, res) => {
                throw new Error('Login error');
            });
            (Container.getAuthController as jest.Mock).mockResolvedValue({ login: loginMock });
            
            const response = await request(app).post('/auth/login').send({
                email: 'test@example.com',
                password: 'password123',
            });
            
            expect(loginMock).toHaveBeenCalled();
            expect(response.status).toBe(500);
        });
    });
});
