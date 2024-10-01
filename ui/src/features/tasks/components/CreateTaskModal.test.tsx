import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import userEvent from "@testing-library/user-event";
import { initialState, setupStore } from '../../../redux/store';
import { render, screen, waitFor, within } from '@testing-library/react';
import { CreateTaskRequest } from '../services/TaskService';
import CreateTaskModal from './CreateTaskModal';
import { http } from 'msw';
import { setupServer } from 'msw/lib/node';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

const mockOnClose = jest.fn();

describe('CreateTaskModal component', () => {
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
    });

    afterAll(() => {
        server.dispose();
    });
    
    const renderWithProviders = (store: any, open: boolean) => render(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Provider store={store}>
                <Router>
                    <CreateTaskModal open={open} onClose={mockOnClose} />
                </Router>
            </Provider>
        </LocalizationProvider>
    );
    
    const submitForm = async (task: CreateTaskRequest) => {
        const titleInput = await screen.getByLabelText(/Title/i);
        await userEvent.type(titleInput, task.title);
        
        if(task.dueDate) {
            const dateInput = await screen.getByLabelText(/Due Date/i);
            await userEvent.type(dateInput, task.dueDate);
        }
        
        const descriptionInput = await screen.getByLabelText(/Description/i);
        await userEvent.type(descriptionInput, task.description);
        
        const statusSelect = await screen.getByRole('combobox');
        expect(statusSelect).toBeInTheDocument();
        userEvent.click(statusSelect);
        
        const optionsPopupEl = await screen.findByRole('listbox');
        userEvent.click(within(optionsPopupEl).getByText(task.status.charAt(0).toUpperCase() + task.status.slice(1)));
        
        const submitButton = await screen.getByRole('button', { name: /Create/i });
        await userEvent.click(submitButton);
    };
    
    it('should render modal when open is true', () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true);
        expect(screen.getByText(/Create New Task/i)).toBeInTheDocument();
    });
    
    it('should close modal when onClose is called', async () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true);
        await userEvent.click(screen.getByRole('button', { name: /Close/i }));
        expect(mockOnClose).toHaveBeenCalled();
    });
    
    it('should clear form fields after successful submission', async () => {
        const store = setupStore(initialState);
        renderWithProviders(store, true);
        const task: CreateTaskRequest = {
            title: 'Test Title',
            description: 'Test Description',
            checklist: null,
            dueDate: new Date(),
            status: 'completed',
        };
        
        await submitForm(task);
        
        await waitFor(() => {
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
});
