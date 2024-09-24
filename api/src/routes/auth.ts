import { NextFunction, Request, Response, Router } from 'express';
import Container from '../config/container';

const createAuthRouter = async (): Promise<Router> => {
    const router = Router();
    const authController = await Container.getAuthController();
    
    /**
    * @swagger
    * components:
    *   schemas:
    *     SignupRequest:
    *       type: object
    *       required:
    *         - username
    *         - email
    *         - password
    *       properties:
    *         username:
    *           type: string
    *           description: The username of the user
    *         email:
    *           type: string
    *           description: The email address of the user
    *         password:
    *           type: string
    *           description: The password of the user (plain text)
    *       example:
    *         username: johndoe@example.com
    *         email: johndoe@example.com
    *         password: password123
    *
    *     LoginRequest:
    *       type: object
    *       required:
    *         - username
    *         - password
    *       properties:
    *         username:
    *           type: string
    *           description: The username of the user
    *         password:
    *           type: string
    *           description: The password of the user (plain text)
    *       example:
    *         username: johndoe@example.com
    *         password: password123
    *
    *     AuthResponse:
    *       type: object
    *       properties:
    *         token:
    *           type: string
    *           description: The JWT token for authenticated sessions
    *       example:
    *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    */
    
    /**
    * @swagger
    * tags:
    *   name: Users
    *   description: User registration and login
    */
    
    /**
    * @swagger
    * /signup:
    *   post:
    *     summary: Register a new user
    *     tags: [Users]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/SignupRequest'
    *     responses:
    *       201:
    *         description: User signed up successfully
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/AuthResponse'
    *       400:
    *         description: Bad request
    *       409:
    *         description: Conflict (e.g., user already exists)
    */
    router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authController.signup(req, res);
        } catch (error) {
            next(error);
        }
    });
    
    
    /**
    * @swagger
    * /login:
    *   post:
    *     summary: Log in a user
    *     tags: [Users]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/LoginRequest'
    *     responses:
    *       200:
    *         description: User logged in successfully
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/AuthResponse'
    *       401:
    *         description: Unauthorized (e.g., invalid credentials)
    */
    router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
        try {
            await authController.login(req, res);
        } catch (error) {
            next(error);
        }
    });
    
    return router;
};

export default createAuthRouter;
