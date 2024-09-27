import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { initialState, setupStore } from '../../../redux/store';
import { render, screen, waitFor, within } from '@testing-library/react';
import { http } from 'msw';
import { setupServer } from 'msw/lib/node';
import { CreateTaskRequest } from '../services/TaskService';
import { Task } from '../models/task';
import EditTaskModal from './EditTaskModal';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const mockOnClose = jest.fn();

describe('EditTaskModal component', () => {
    const handlers = [
        http.all(`${process.env.REACT_APP_API_BASE_URL}/*`, () => {
            return new Response(null, {
                status: 200,
                headers: {
                    Allow: 'GET,HEAD,POST,PUT,PATCH,DELETE',
                },
            });
        }),
    ];
    const server = setupServer(...handlers);

    beforeAll(() => {
        server.listen();
    });

    afterEach(() => {
        server.resetHandlers();
    });

    afterAll(() => {
        server.close();
    });

    const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        dueDate: new Date().toISOString(),
        status: 'new',
        userId: '1',
        createdAt: new Date().toISOString(),
        archivedAt: null,
        deletedAt: null,
    };
    
    const renderWithProviders = (store: any, open: boolean, task: Task) => render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Provider store={store}>
                <Router>
                    <EditTaskModal open={open} task={task} onClose={mockOnClose} />
                </Router>
            </Provider>
        </LocalizationProvider>
    );

    const extractDateAndTime = (dueDate: string | null) => {
        let formattedDate = '';
        let formattedTime = '';
        if (dueDate) {
            const date = new Date(dueDate);
            formattedDate = date.toISOString().split('T')[0];
            formattedTime = date.toTimeString().split(' ')[0].slice(0, 5);
        }
        return { formattedDate, formattedTime };
    };

    const submitForm = async (task: CreateTaskRequest) => {
        const { formattedDate, formattedTime } = extractDateAndTime(task.dueDate);

        const titleInput = await screen.getByLabelText(/Title/i);
        await userEvent.type(titleInput, task.title);

        const dateInput = await screen.getByLabelText(/Date/i);
        await userEvent.type(dateInput, formattedDate);

        const descriptionInput = await screen.getByLabelText(/Description/i);
        await userEvent.type(descriptionInput, task.description);

        const statusSelect = await screen.getByRole('combobox');
        expect(statusSelect).toBeInTheDocument();
        userEvent.click(statusSelect);
        
        const optionsPopupEl = await screen.findByRole('listbox');
        userEvent.click(within(optionsPopupEl).getByText(task.status.charAt(0).toUpperCase() + task.status.slice(1)));

        const submitButton = await screen.getByRole('button', { name: /Update/i });
        await userEvent.click(submitButton);
    };

    it('should render modal when open is true', () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true, mockTask);
        expect(screen.getByText(/Edit Task/i)).toBeInTheDocument();
    });

    it('should close modal when onClose is called', async () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true, mockTask);
        await userEvent.click(screen.getByRole('button', { name: /Close/i }));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should update task and clear form fields after successful submission', async () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true, mockTask);
        const updatedTask: CreateTaskRequest = {
            title: 'Updated Title',
            description: 'Updated Description',
            checklist: null,
            dueDate: new Date().toISOString(),
            status: 'completed',
        };

        await submitForm(updatedTask);

        await waitFor(() => {
            expect(screen.getByLabelText(/Title/i)).toHaveValue('');
            expect(screen.getByLabelText(/Date/i)).toHaveValue('');
            expect(screen.getByLabelText(/Description/i)).toHaveValue('');
            const statusSelect = screen.getByRole('combobox');
            expect(statusSelect).toHaveTextContent('New');
        });
    });
    
    it('should disable submit button if title is empty', async () => {
        const store = setupStore(initialState);
        
        renderWithProviders(store, true, mockTask);
        const titleInput = await screen.getByLabelText(/Title/i);
        await userEvent.clear(titleInput);
        
        const submitButton = await screen.getByRole('button', { name: /Update/i });
        expect(submitButton).toBeDisabled();
    });
    
    it('should disable submit button when createStatus is loading', async () => {
        const store = setupStore({
            ...initialState,
            tasks: {
                ...initialState.tasks,
                updateStatus: 'loading',
            },
        });

        renderWithProviders(store, true, mockTask);
        const titleInput = await screen.getByLabelText(/Title/i);
        await userEvent.type(titleInput, 'Sample Task');
        
        const submitButton = await screen.getByRole('button', { name: /Update/i });
        expect(submitButton).toBeDisabled();
    });
});
