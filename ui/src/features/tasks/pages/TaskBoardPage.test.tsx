import { render, screen, waitFor, cleanup } from '@testing-library/react';
import TaskBoardPage from './TaskBoardPage';
import { Provider } from 'react-redux';
import { initialState, setupStore } from '../../../store';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { BrowserRouter as Router } from 'react-router-dom';

describe('TaskBoardPage', () => {
    const mockTasks = [
        {
            id: '1',
            title: 'Task 1',
            status: 'new',
            archivedAt: null,
            description: 'Test task 1',
        },
        {
            id: '2',
            title: 'Task 2',
            status: 'active',
            archivedAt: null,
            description: 'Test task 2',
        },
        {
            id: '3',
            title: 'Task 3',
            status: 'completed',
            archivedAt: null,
            description: 'Test task 3',
        },
    ];
    
    const store = setupStore(initialState);

    const handlers = [
        http.get(`${process.env.REACT_APP_API_BASE_URL}/tasks`, () => {
            return HttpResponse.json(mockTasks);
        }),
    ];
    const server = setupServer(...handlers);
    
    beforeAll(() => {
        server.listen();
    });
    
    afterEach(() => {
        server.resetHandlers();
        cleanup();
    });
    
    afterAll(() => {
        server.close();
    });
    
    const renderWithProviders = (store: any) => render(
        <Provider store={store}>
            <Router>
                <TaskBoardPage />
            </Router>
        </Provider>
    );

    it('renders tasks and fetches tasks successfully from the API', async () => {
        renderWithProviders(store);
        
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.getByText('Task 3')).toBeInTheDocument();
        });
        
        expect(screen.getByTestId('heading-new')).toBeInTheDocument();
        expect(screen.getByTestId('heading-active')).toBeInTheDocument();
        expect(screen.getByTestId('heading-completed')).toBeInTheDocument();
    });
    
    it('renders typography and alert on failure', async () => {
        server.use(
            http.get(`${process.env.REACT_APP_API_BASE_URL}/tasks`, () => {
                return new Response(null, {
                    status: 400,
                    headers: {
                        Allow: 'GET,HEAD',
                    },
                })
            })
        );
        
        renderWithProviders(store);
        
        await waitFor(() => {
            expect(screen.getByText(/Failed to load tasks./i)).toBeInTheDocument();
            expect(screen.getByTestId('fetch-error-alert')).toBeInTheDocument();
            expect(screen.queryByRole('progressbar')).toBeNull();
        })
    });
});
