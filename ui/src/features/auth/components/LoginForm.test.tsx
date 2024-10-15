import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginForm from './LoginForm';
import userEvent from "@testing-library/user-event";
import { initialState, setupStore } from '../../../redux/store';
import { act, render, screen, waitFor } from '@testing-library/react';
import { LoginRequest, LoginResponse } from '../services/AuthService';
import { User } from '../models/user';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/lib/node';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('LoginForm component', () => {
    const server = setupServer();

    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    const renderWithProviders = (store: any) => render(
        <Provider store={store}>
            <Router>
                <LoginForm />
            </Router>
        </Provider>
    );
    
    const mockUser: User = {
        id: 'userId',
        email: 'test@example.com',
        username: 'test@example.com'
    };
    
    const submitForm = async (request: LoginRequest) => {
        const username = await screen.findByTestId('input-username');
        await userEvent.type(username, request.username);
        const password = await screen.findByTestId('input-password');
        await userEvent.type(password, request.password);
        await userEvent.click(await screen.findByTestId('submit'));
    };
    
    it('should render the login form', async () => {
        const store = setupStore(initialState);
        
        renderWithProviders(store);
        
        await waitFor(() => {
            expect(screen.getByTestId('input-username')).toBeInTheDocument();
            expect(screen.getByTestId('input-password')).toBeInTheDocument();
            expect(screen.getByTestId('submit')).toBeInTheDocument();
        });
    });

    it('should show loading state when login is in progress', async () => {
        const store = setupStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'loading'
            },
        });
        
        renderWithProviders(store);
        
        expect(await screen.findByText('Logging in...')).toBeInTheDocument();
    });
    
    it('should redirect the user to /tasks on successful login', async () => {
        const response: LoginResponse = {
            token: 'jwt',
            user: mockUser
        };

        // Define handlers for this test
        server.use(
            http.post(`${process.env.REACT_APP_API_BASE_URL}/login`, () => {
                return HttpResponse.json(response);
            }),
            http.options(`${process.env.REACT_APP_API_BASE_URL}/login`, () => {
                return new Response(null, {
                    status: 200,
                    headers: {
                        Allow: 'GET,HEAD,POST',
                    },
                });
            })
        );
        
        const store = setupStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'idle',
                error: null,
                user: mockUser
            }
        });
        renderWithProviders(store);
        
        await submitForm({
            username: mockUser.username,
            password: 'password123'
        });
        
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/tasks');
        });
    });
    
    it('should display error message on login failure', async () => {
        // Define handlers for this test
        server.use(
            http.post(`${process.env.REACT_APP_API_BASE_URL}/login`, () => {
                return HttpResponse.json(
                    { message: 'Login failed.' },
                    { status: 400 }
                );
            }),
            http.options(`${process.env.REACT_APP_API_BASE_URL}/login`, () => {
                return new Response(null, {
                    status: 200,
                    headers: {
                        Allow: 'GET,HEAD,POST',
                    },
                });
            })
        );

        const store = setupStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'idle',
            },
        });

        renderWithProviders(store);
        await submitForm({
            username: mockUser.username,
            password: 'password123'
        });
        
        await waitFor(() => {
            expect(screen.getByTestId('snackbar')).toBeInTheDocument();
            expect(screen.getByTestId('alert')).toBeInTheDocument();
            expect(screen.getByText(/Login failed. Please check your username and password./i)).toBeInTheDocument();
        });
        
        await act(async () => {
            const closeButton = screen.getByLabelText('Close');
            userEvent.click(closeButton);
        });
        
        await waitFor(() => {
            expect(screen.queryByTestId('snackbar')).toBeNull();
            expect(screen.queryByTestId('alert')).toBeNull();
            expect(screen.queryByText(/Login failed. Please check your username and password./i)).toBeNull();
        });
    });
});
