import { http } from 'msw';
import { setupServer } from 'msw/node';
import apiClient from './ApiService';

const handlers = [
    http.get(`${process.env.REACT_APP_API_BASE_URL}/test-success`, () => {
        return new Response(
            JSON.stringify({ message: 'Success' }), 
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }),
    http.get(`${process.env.REACT_APP_API_BASE_URL}/test-unauthorized`, () => {
        return new Response(
            JSON.stringify({ message: 'Unauthorized' }), 
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }),
];

const server = setupServer(...handlers);


describe('apiClient', () => {
    beforeAll(() => server.listen());
    
    afterEach(() => server.resetHandlers());
    
    afterAll(() => server.close());
    
    it('should return data for a successful request', async () => {
        const response = await apiClient.get(`test-success`);
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: 'Success' });
    });
    
    it('should redirect to login on a 401 response', async () => {
        const realLocation = window.location;
        const mockLocation = { ...realLocation, assign: jest.fn() };
        Object.defineProperty(window, 'location', {
            value: mockLocation,
            writable: true
        });
        
        await apiClient.get(`test-unauthorized`).catch(error => {
            expect(error.status).toBe(401);
            expect(window.location.assign).toHaveBeenCalledWith('/login');
        });

        Object.defineProperty(window, 'location', {
            value: realLocation,
            writable: true
        });
    });
});