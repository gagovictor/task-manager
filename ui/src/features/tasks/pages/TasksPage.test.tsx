import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/lib/node';
import TasksPage from './TasksPage';
import { initialState, setupStore } from '../../../redux/store';
import userEvent from '@testing-library/user-event';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { act } from 'react';

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
        },
        {
            id: '6',
            userId: 'userId',
            title: 'Task 6',
            description: 'Mock Task',
            status: 'completed',
            dueDate: null,
            archivedAt: null,
            deletedAt: null,
        }
    ];
    
    const handlers = [
        http.get(`${process.env.REACT_APP_API_BASE_URL}/tasks`, () => {
            return HttpResponse.json({
                currentPage: 1,
                totalPages: 1,
                items: mockTasks,
                totalItems: mockTasks
            })
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
                    <TasksPage />
                </Router>
            </Provider>
        </LocalizationProvider>
    );

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
    
    it('renders non-archived, non-deleted, non-completed tasks after successful fetching', async () => {
        renderWithProviders(store);
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
            expect(screen.queryByText('Task 6')).toBeNull(); // Completed
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
            expect(screen.queryByText('Task 6')).toBeNull(); // Completed
        });
        
        const statusSelect = screen.getByRole('combobox');
        waitFor(() => expect(statusSelect).toBeInTheDocument());
        
        act(() => userEvent.click(statusSelect));
            
        const optionsPopupEl = screen.getByRole('listbox');
        act(() => userEvent.click(within(optionsPopupEl).getByText('Active')));

        await waitFor(() => {
            expect(screen.getByText('No tasks match the filter criteria.')).toBeInTheDocument();
            expect(screen.queryByText('Task 1')).toBeNull(); // New
            expect(screen.queryByText('Task 2')).toBeNull(); // New
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
            expect(screen.queryByText('Task 6')).toBeNull(); // Completed
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
            expect(screen.queryByText('Task 6')).toBeNull(); // Completed
        });
        
        waitFor(() => {
            const searchInput = screen.getByLabelText(/Search/i);
            act(() => userEvent.type(searchInput, '2'));
        })
        
        await waitFor(() => {
            expect(screen.queryByText('No tasks match the filter criteria.')).toBeNull();
            expect(screen.queryByText('Task 1')).toBeNull(); // No match
            expect(screen.getByText('Task 2')).toBeInTheDocument();
            expect(screen.queryByText('Task 3')).toBeNull(); // Archived
            expect(screen.queryByText('Task 4')).toBeNull(); // Deleted
            expect(screen.queryByText('Task 5')).toBeNull(); // Removed
            expect(screen.queryByText('Task 6')).toBeNull(); // Completed
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
        
        const searchInput = screen.getByLabelText(/Search/i);
        act(() => userEvent.type(searchInput, '1'));

        await waitFor(() => {
            expect(screen.queryByText('No tasks match the filter criteria.')).toBeNull();
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.queryByText('Task 2')).toBeNull(); // No text match
        });
        
        const clearSearchButton = screen.getByLabelText('clear search');
        act(() => userEvent.click(clearSearchButton));
        
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
            act(() => userEvent.click(createTaskButton));
            expect(screen.getByText('New Task')).toBeInTheDocument();
            
            act(() => userEvent.click(screen.getByRole('button', { name: /Close/i })));
            expect(screen.queryByText('New Task')).not.toBeInTheDocument();
        })
    });

    it('renders an alert when fetch fails', async () => {
        server.use(
            http.get(`${process.env.REACT_APP_API_BASE_URL}/tasks`, () => {
                return new Response(null, {
                    status: 400,
                });
            })
        );
        
        renderWithProviders(store);
        
        await waitFor(() => {
            expect(screen.getByTestId('fetch-error-alert')).toBeInTheDocument();
        });
    });

    it('renders tasks correctly after fetch', async () => {
        renderWithProviders(store);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });
    });

    it('toggles the visibility of filters', async () => {
        renderWithProviders(store);
    
        const toggleButton = screen.getByRole('button', { name: /Show Filters/i });
        act(() => userEvent.click(toggleButton));
    
        waitFor(() => expect(screen.getByLabelText('Search')).toBeInTheDocument());
    
        act(() => userEvent.click(screen.getByRole('button', { name: /Hide Filters/i })));
    
        waitFor(() => expect(screen.queryByLabelText('Search')).toBeNull());
    });

    it('renders no tasks when there are no tasks', async () => {
        server.use(
            http.get(`${process.env.REACT_APP_API_BASE_URL}/tasks`, () => {
                return HttpResponse.json({
                    currentPage: 1,
                    totalPages: 1,
                    items: 0,
                    totalItems: []
                });
            })
        );

        renderWithProviders(store);

        await waitFor(() => {
            expect(screen.getByText(/No tasks match the filter criteria/)).toBeInTheDocument();
        });
    });

    it('opens and closes the TaskModal when creating a task', async () => {
        renderWithProviders(store);
        
        const createTaskButton = screen.getByLabelText('add');
        act(() => userEvent.click(createTaskButton));

        await waitFor(() => {
            expect(screen.getByText('New Task')).toBeInTheDocument();
        });

        act(() => userEvent.click(screen.getByRole('button', { name: /Close/i })));
        await waitFor(() => {
            expect(screen.queryByText('New Task')).not.toBeInTheDocument();
        });
    });

    it('filters tasks by status', async () => {
        renderWithProviders(store);

        const statusSelect = await screen.findByRole('combobox');
        act(() => userEvent.click(statusSelect));

        const optionsPopupEl = screen.getByRole('listbox');
        act(() => userEvent.click(within(optionsPopupEl).getByText('Completed')));

        await waitFor(() => {
            expect(screen.queryByText('Task 1')).toBeNull(); // Only 'Completed' tasks should appear
            expect(screen.queryByText('Task 2')).toBeNull();
            expect(screen.getByText('Task 6')).toBeInTheDocument();
        });
    });

    it('clears filters and shows all tasks again', async () => {
        renderWithProviders(store);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText(/Search/i);
        act(() => userEvent.type(searchInput, 'Task 1'));
        
        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        const clearSearchButton = screen.getByLabelText('clear search');
        act(() => userEvent.click(clearSearchButton));

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
    });
});
