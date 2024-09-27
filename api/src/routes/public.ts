import express from 'express';
import createAuthRouter from './auth';

const getPublicRouter = () => {
    const publicRouter = express.Router();
    
    publicRouter.use('/', createAuthRouter());

    return publicRouter;    
};

export default getPublicRouter;