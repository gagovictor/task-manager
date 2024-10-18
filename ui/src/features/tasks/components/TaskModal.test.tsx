import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from "@testing-library/user-event";
import { initialState, setupStore } from '../../../redux/store';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import { CreateTaskRequest, UpdateTaskRequest } from '../services/TaskService';
import TaskModal, { TaskModalMode } from './TaskModal';
import { http } from 'msw';
import { setupServer } from 'msw/lib/node';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { Task } from '../models/task';
// import { createTaskAsync } from '../redux/tasksSlice';

// jest.mock('../redux/tasksSlice', () => {
//     const originalModule = jest.requireActual('../redux/tasksSlice');
//     return {
//         __esModule: true,
//         ...originalModule,
//         createTaskAsync: jest.fn(),
//         updateTaskAsync: jest.fn(),
//     };
// });

const mockOnClose = jest.fn();

describe('TaskModal component', () => {
    const handlers = [
        http.all(`${process.env.REACT_APP_API_BASE_URL}/*`, () => {
            return new Response(null, {
                status: 200,
                headers: {
                    Allow: 'GET,HEAD,POST,PUT,PATCH,DELETE',
                },
            })
        }),
    ];
    const server = setupServer(...handlers);
    
    beforeAll(() => {
        server.listen();
    });
    
    afterEach(() => {
        server.resetHandlers();
        jest.clearAllMocks();
    });
    
    afterAll(() => {
        server.dispose();
    });
    
    const renderWithProviders = (store: any, open: boolean, mode: TaskModalMode = 'create', task?: Task) => render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Provider store={store}>
                <Router>
                    <TaskModal open={open} onClose={mockOnClose} mode={mode} task={task} />
                </Router>
            </Provider>
        </LocalizationProvider>
    );

    const submitForm = async (task: CreateTaskRequest|UpdateTaskRequest, mode) => {
        const titleInput = await screen.getByLabelText(/Title/i);
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, task.title);
        
        if(task.dueDate) {
            const dateInput = await screen.getByLabelText(/Due Date/i);
            await userEvent.clear(dateInput);
            await userEvent.type(dateInput, task.dueDate);
        }
        
        const statusSelect = await screen.getByRole('combobox');
        expect(statusSelect).toBeInTheDocument();
        await userEvent.click(statusSelect);
        const optionsPopupEl = await screen.findByRole('listbox');
        await userEvent.click(within(optionsPopupEl).getByText(task.status.charAt(0).toUpperCase() + task.status.slice(1)));
        
        const descriptionInput = await screen.getByLabelText(/Description/i);
        await userEvent.clear(descriptionInput);
        await userEvent.type(descriptionInput, task.description);
        
        const submitButton = await screen.getByRole('button', {
            name: mode == 'edit' ? /Update/i : /Create/i
        });
        await userEvent.click(submitButton);
    };
    
    it('should render modal when open is true', () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true);
        expect(screen.getByText(/New Task/i)).toBeInTheDocument();
    });
    
    it('should close modal when onClose is called', async () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true);
        await userEvent.click(screen.getByRole('button', { name: /Close/i }));
        expect(mockOnClose).toHaveBeenCalled();
    });
    
    it('should clear form fields after successful submission', async () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true, 'create');
        const request: CreateTaskRequest = {
            title: 'Test Title',
            description: 'Test Description',
            checklist: null,
            dueDate: '10/01/2024 12:00 AM',
            status: 'completed',
        };
        
        await submitForm(request, 'create');
        
        waitFor(() => {
            expect(screen.getByLabelText(/Title/i)).toHaveValue('');
            expect(screen.getByLabelText(/Due Date/i)).toHaveValue('');
            expect(screen.getByLabelText(/Description/i)).toHaveValue('');
            const statusSelect = screen.getByRole('combobox');
            expect(statusSelect).toHaveTextContent('New');
        });
    });
    
    it('should disable submit button if title is empty', async () => {
        const store = setupStore(initialState);
        
        renderWithProviders(store, true);
        const titleInput = await screen.getByLabelText(/Title/i);
        await userEvent.clear(titleInput);
        
        const submitButton = await screen.getByRole('button', { name: /Create/i });
        expect(submitButton).toBeDisabled();
    });
    
    it('should disable submit button when createStatus is loading', async () => {
        const store = setupStore({
            ...initialState,
            tasks: {
                ...initialState.tasks,
                createStatus: 'loading',
            },
        });
        
        renderWithProviders(store, true);
        const titleInput = await screen.getByLabelText(/Title/i);
        await userEvent.type(titleInput, 'Sample Task');
        
        const submitButton = await screen.getByRole('button', { name: /Create/i });
        expect(submitButton).toBeDisabled();
    });
    
    it('should clear and disable description field in checklist mode', () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true);
        
        const descriptionInput = screen.getByLabelText(/Description/i);
        
        act(() => {
            userEvent.type(descriptionInput, 'This should be cleared in checklist mode');
            const checklistToggle = screen.getByTestId('toggle-checklist');
            userEvent.click(checklistToggle);
        });
        
        waitFor(() => expect(screen.queryByLabelText(/Description/i)).not.toBeInTheDocument());
        
        act(() => {
            const textToggle = screen.getByTestId('toggle-text');
            userEvent.click(textToggle);
        });
        
        waitFor(() => expect(screen.getByLabelText(/Description/i)).toHaveValue(''));
    });
    
    it('should render modal with pre-filled data in edit mode', async () => {
        const store = setupStore({
            ...initialState,
            tasks: {
                ...initialState.tasks,
                createStatus: 'idle',
                updateStatus: 'idle',
            },
        });
        
        const task = {
            id: '1',
            title: 'Existing Task',
            description: 'Existing Description',
            dueDate: '2024-10-01T00:00:00Z',
            status: 'active',
            checklist: null,
        };
        
        renderWithProviders(store, true, 'edit', task as Task);
        
        await waitFor(() => {
            expect(screen.getByText(/Edit Task/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Title/i)).toHaveValue('Existing Task');
            expect(screen.getByLabelText(/Description/i)).toHaveValue('Existing Description');
            expect(screen.getByLabelText(/Due Date/i)).toHaveValue('10/01/2024 12:00 AM');
            const statusSelect = screen.getByRole('combobox');
            expect(statusSelect).toHaveTextContent('Active');
        });
    });
    
    it('should successfully handle form submission in create mode', async () => {
        const store = setupStore(initialState);
        const task: CreateTaskRequest = {
            title: 'Test Title',
            description: 'Test Description',
            checklist: null,
            dueDate: '10/01/2024 12:00 AM',
            status: 'completed',
        };
        
        renderWithProviders(store, true, 'create');
        await submitForm(task, 'create');
        
        await waitFor(() => expect(screen.getByText(/Task created successfully/i)).toBeInTheDocument());
    });
    
    it('should successfully handle form submission in edit mode', async () => {
        const store = setupStore(initialState);
        const task: Partial<Task> = {
            id: '1',
            title: 'Existing Task',
            description: 'Existing Description',
            dueDate: '2024-10-01T00:00:00Z',
            status: 'active',
            checklist: null,
        };
        const request: UpdateTaskRequest = {
            id: '1',
            title: 'Updated Task',
            description: 'Updated Description',
            checklist: null,
            dueDate: '10/01/2024 12:00 AM',
            status: 'completed',
        };
        
        renderWithProviders(store, true, 'edit', task as Task);
        await submitForm(request, 'edit');
        
        await waitFor(() => expect(screen.getByText(/Task updated successfully/i)).toBeInTheDocument());
    });
});
