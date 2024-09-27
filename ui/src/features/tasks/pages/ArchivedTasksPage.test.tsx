import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/lib/node';
import { initialState, setupStore } from '../../../redux/store';
import ArchivedTasksPage from './ArchivedTasksPage';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers';

describe('ArchivedTasksPage component', () => {
    const store = setupStore(initialState);
    
    const mockTasks = [
        {
            id: '1',
            userId: 'userId',
            title: 'Task 1',
            description: 'Mock Task',
            status: 'new',
            dueDate: new Date().toISOString(),
            archivedAt: null,
            deletedAt: null,
        },
        {
            id: '2',
            userId: 'userId',
            title: 'Task 2',
            description: 'Mock Task',
            status: 'new',
            dueDate: new Date().toISOString(),
            archivedAt: new Date().toISOString(),
            deletedAt: null,
        },
        {
            id: '3',
            userId: 'userId',
            title: 'Task 3',
            description: 'Mock Task',
            status: 'completed',
            dueDate: new Date().toISOString(),
            archivedAt: new Date().toISOString(),
            deletedAt: null,
        },
        {
            id: '4',
            userId: 'userId',
            title: 'Task 4',
            description: 'Mock Task',
            status: 'new',
            dueDate: new Date().toISOString(),
            archivedAt: null,
            deletedAt: new Date().toISOString(),
        },
    ];
    
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Provider store={store}>
                <Router>
                    <ArchivedTasksPage />
                </Router>
            </Provider>
        </LocalizationProvider>
    );

    it('renders only archived tasks after successful fetching', async () => {
        renderWithProviders(store);

        await waitFor(() => {
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.getByText('Task 3')).toBeInTheDocument();
            expect(screen.queryByText('Task 1')).toBeNull(); // Not archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
        });
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
    
    it('shows "No tasks archived" if no tasks are archived', async () => {
        server.use(
            http.get(`${process.env.REACT_APP_API_BASE_URL}/tasks`, () => {
                return HttpResponse.json([
                    {
                        id: '1',
                        userId: 'userId',
                        title: 'Task 1',
                        description: 'Mock Task',
                        status: 'new',
                        dueDate: new Date().toISOString(),
                        archivedAt: null,
                        deletedAt: null,
                    }
                ]);
            })
        );

        renderWithProviders(store);

        await waitFor(() => {
            expect(screen.getByText(/No tasks archived/i)).toBeInTheDocument();
        });
    });
});
