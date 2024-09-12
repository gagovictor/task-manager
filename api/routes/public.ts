import express from 'express';
import createAuthRouter from './auth';

const publicRouter = express.Router();

publicRouter.use('/', createAuthRouter());

export default publicRouter;
