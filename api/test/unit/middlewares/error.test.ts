import { Request, Response, NextFunction } from 'express';
import errorHandler from '../../../src/middlewares/error';

describe('errorHandler', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    
    beforeEach(() => {
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
    
    it('should log the error stack and respond with a 500 status and message', () => {
        const mockError = { stack: 'Error stack', message: 'Error message' };
        
        errorHandler(mockError as Error, req as Request, res as Response, next);
        
        expect(console.error).toHaveBeenCalledWith(mockError.stack);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong!' });
    });
    
    it('should handle errors without a stack trace and respond with a 500 status and message', () => {
        const mockError = { message: 'Error message' }; // No stack trace
        
        errorHandler(mockError as Error, req as Request, res as Response, next);
        
        expect(console.error).toHaveBeenCalledWith(undefined); // Stack is undefined
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Something went wrong!' });
    });
});
