import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/lib/node';
import API_BASE_URL from '../../shared/config/apiConfig';
import TasksPage from './TasksPage';
import { initialState, setupStore } from '../../../store';
import userEvent from '@testing-library/user-event';

describe('TasksPage component', () => {
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
            archivedAt: null,
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
        {
            id: '5',
            userId: 'userId',
            title: 'Task 5',
            description: 'Mock Task',
            status: 'removed',
            dueDate: null,
            archivedAt: null,
            deletedAt: null,
        }
    ];
    
    const handlers = [
        http.get(`${API_BASE_URL}/tasks`, () => {
            return HttpResponse.json(mockTasks)
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
        <TasksPage />
        </Router>
        </Provider>
    );
    
    it('renders the loading spinner when loading', async () => {
        renderWithProviders(store);
        await waitFor(() => {
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByText(/Failed to load tasks./i)).toBeNull();
            expect(screen.queryByTestId('fetch-error-alert')).toBeNull();
        })
    });
    
    it('renders typography and alert on failure', async () => {
        server.use(
            http.get(`${API_BASE_URL}/tasks`, () => {
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
    
    it('renders non-archived, non-deleted tasks after successful fetching', async () => {
        renderWithProviders(store);
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
        });
    });
    
    it('shows "No tasks match the filter criteria" when filtered tasks are not found', async () => {
        renderWithProviders(store);
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
        });
        
        waitFor(() => {
            const statusSelect = screen.getByRole('combobox');
            expect(statusSelect).toBeInTheDocument();
            userEvent.click(statusSelect);
            
            const optionsPopupEl = screen.getByRole('listbox');
            userEvent.click(within(optionsPopupEl).getByText('Completed'));
        });
        
        await waitFor(() => {
            expect(screen.getByText('No tasks match the filter criteria.')).toBeInTheDocument();
            expect(screen.queryByText('Task 1')).toBeNull(); // New
            expect(screen.queryByText('Task 2')).toBeNull(); // New
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
        });
    });

    it('shows filtered tasks', async () => {
        renderWithProviders(store);
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
        });
        
        waitFor(() => {
            const searchInput = screen.getByLabelText(/Search/i);
            userEvent.type(searchInput, '2');
        })
        
        await waitFor(() => {
            expect(screen.queryByText('No tasks match the filter criteria.')).toBeNull();
            expect(screen.queryByText('Task 1')).toBeNull(); // No match
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
        });
    });
    
    it('clears filters when the clear button is clicked', async () => {
        renderWithProviders(store);
     
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
        });

        waitFor(() => {
            const searchInput = screen.getByLabelText(/Search/i);
            userEvent.type(searchInput, '1');
        });
    
        await waitFor(() => {
            expect(screen.queryByText('No tasks match the filter criteria.')).toBeNull();
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.queryByText('Task 2')).toBeNull(); // No text match
        });

        waitFor(() => {
            const clearButton = screen.getByText(/Clear Filters/i);
            userEvent.click(clearButton);
        });
    
        await waitFor(() => {
            expect(screen.queryByText('No tasks match the filter criteria.')).toBeNull();
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
    });
    
    it('opens and closes the CreateTaskModal', async () => {
        const store = setupStore({
            ...initialState,
            tasks: {
                ...initialState.tasks,
            }
        });
        renderWithProviders(store);
        
        await waitFor(() => {
            const createTaskButton = screen.getByLabelText('add');
            userEvent.click(createTaskButton);
            expect(screen.getByText('Create New Task')).toBeInTheDocument();
            
            userEvent.click(screen.getByRole('button', { name: /Close/i }));
            expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
        })
    });
});
