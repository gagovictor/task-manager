import express from 'express';
import createAuthRouter from '@src/routes/auth';

const getPublicRouter = () => {
    const publicRouter = express.Router();
    
    publicRouter.use('/', createAuthRouter());

    return publicRouter;    
};

export default getPublicRouter;