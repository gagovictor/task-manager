import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import SignupForm from './SignupForm';
import { setupStore } from '../../../store';
import { initialState } from '../../../store';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SignupRequest, SignupResponse } from '../services/AuthService';
import { User } from '../models/user';
import API_BASE_URL from '../../shared/config/apiConfig';
import userEvent from '@testing-library/user-event';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('SignupForm', () => {
    const renderWithProviders = (store: any) => render(
        <Provider store={store}>
            <MemoryRouter>
                <SignupForm />
            </MemoryRouter>
        </Provider>
    );
    
    const mockUser: User = {
        id: 'userId',
        email: 'test@example.com',
        username: 'test@example.com'
    };
    
    const submitForm = async (request: SignupRequest) => {
        await act(async () => {
            fireEvent.change(screen.getByLabelText(/Email Address/i), {
                target: { value: request.username },
            });
            fireEvent.change(screen.getByLabelText(/Password/i), {
                target: { value: request.password },
            });
            fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        });
    };
    
    it('should render the signup form with email and password fields', () => {
        const store = setupStore();
        renderWithProviders(store);
        
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    });
    
    it('should disable the signup button when auth status is loading', () => {
        const store = setupStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'loading'
            }
        });
        renderWithProviders(store);
        
        const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
        expect(signUpButton).toBeDisabled();
    });
    
    it('allows the user to fill out the form', async () => {
        const store = setupStore();

        renderWithProviders(store);
        await submitForm({
            username: mockUser.username,
            email: mockUser.email,
            password: 'password123'
        });

        await waitFor(() => {
            expect(screen.getByLabelText(/Email Address/i)).toHaveValue(mockUser.username);
            expect(screen.getByLabelText(/Password/i)).toHaveValue('password123');
        });
    });
    
    it('should redirect the user to /tasks on successful signup', async () => {
        const response: SignupResponse = {
            token: 'jwt',
            user: mockUser
        };
        const handlers = [
            http.post(`${API_BASE_URL}/signup`, () => {
                return HttpResponse.json(response)
            }),
            http.options(`${API_BASE_URL}/signup`, () => {
                return new Response(null, {
                    status: 200,
                    headers: {
                        Allow: 'GET,HEAD,POST',
                    },
                })
            })
        ];
        const server = setupServer(...handlers);
        server.listen();
        
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
            email: mockUser.email,
            password: 'password123'
        });
        
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/tasks');
        });
        server.dispose();
    });
    
    it('should display an error message on signup failure', async () => {
        const handlers = [
            http.post(`${API_BASE_URL}/signup`, () => {
                return HttpResponse.json(
                    { message: 'Signup failed.' },
                    { status: 400 }
                )
            }),
            http.options(`${API_BASE_URL}/signup`, () => {
                return new Response(null, {
                    status: 200,
                    headers: {
                        Allow: 'GET,HEAD,POST',
                    },
                })
            })
        ];
        const server = setupServer(...handlers);
        server.listen();
        const store = setupStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'idle',
                error: 'Signup failed'
            }
        });

        renderWithProviders(store);
        await submitForm({
            username: mockUser.username,
            email: mockUser.email,
            password: 'password123'
        });
        
        await waitFor(() => {
            expect(screen.getByTestId('snackbar')).toBeInTheDocument();
            expect(screen.getByTestId('alert')).toBeInTheDocument();
            expect(screen.getByText(/Signup failed. Please check your details./i)).toBeInTheDocument();
        });
        
        await act(() => userEvent.click(screen.getByLabelText('Close')));
        
        await waitFor(() => {
            expect(screen.queryByTestId('snackbar')).toBeNull();
            expect(screen.queryByTestId('alert')).toBeNull();
            expect(screen.queryByText(/Signup failed. Please check your details./i)).toBeNull();
        });
        server.dispose();
    });
});