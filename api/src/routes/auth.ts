import { NextFunction, Request, Response, Router } from 'express';
import Container from '@src/config/container';

// Create Auth Router (now returning the router synchronously)
const createAuthRouter = (): Router => {
    const router = Router();

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
            // Resolve the controller asynchronously here
            const authController = await Container.getAuthController();
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
            const authController = await Container.getAuthController();
            await authController.login(req, res);
        } catch (error) {
            next(error);
        }
    });


    /**
     * @swagger
     * /forgot-password:
     *   post:
     *     summary: Initiate password recovery
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password reset email sent
     *       404:
     *         description: User not found
     */
    router.post('/recover-password', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authController = await Container.getAuthController();
            await authController.recoverPassword(req, res);
        } catch (error) {
            next(error);
        }
    });

    /**
     * @swagger
     * /reset-password:
     *   post:
     *     summary: Reset user password
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *               - password
     *             properties:
     *               token:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Password reset successfully
     *       400:
     *         description: Invalid or expired token
     */
    router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authController = await Container.getAuthController();
            await authController.resetPassword(req, res);
        } catch (error) {
            next(error);
        }
    });

    return router;
};

export default createAuthRouter;
