import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import SignupForm from './SignupForm';
import { setupStore } from '../../../store';
import { initialState } from '../../../store';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// const mockNavigate = jest.fn();
// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate: () => mockNavigate,
// }));

describe('SignupForm', () => {
    const renderWithProviders = (store: any) => render(
        <Provider store={store}>
            <MemoryRouter>
                <SignupForm />
            </MemoryRouter>
        </Provider>
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('renders the signup form with email and password fields', () => {
        const store = setupStore();
        renderWithProviders(store);
        
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    });
    
    test('allows the user to fill out the form', () => {
        const store = setupStore();
        renderWithProviders(store);

        fireEvent.change(screen.getByLabelText(/Email Address/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });
        
        expect(screen.getByLabelText(/Email Address/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('password123');
    });
    
    test('disables the signup button when auth status is loading', () => {
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
    
    test('displays an error message when signup fails', async () => {
        // const server = setupServer(
        //     http.post('/api/signup', () => {
        //         return new Response(null, {
        //           status: 400,
        //         })
        //     })
        // );
        // server.listen();
        const server = setupServer(
            http.get('https://example.com/user', () => {
              // ...and respond to them using this JSON response.
              return HttpResponse.json({
                id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
                firstName: 'John',
                lastName: 'Maverick',
              })
            })
        );
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

        fireEvent.change(screen.getByLabelText(/Email Address/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

        await waitFor(() => {
            expect(screen.getByText(/Signup failed. Please check your details./i)).toBeInTheDocument();
        });
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    // test('redirects the user to /tasks on successful signup', async () => {
    //     (signupUser as unknown as jest.Mock).mockImplementation((dispatch) => {
    //         dispatch({ type: 'auth/signup/fulfilled', payload: {} });
    //     });
    //     const store = setupStore();
    
    //     renderWithProviders(store);
    //     fireEvent.change(screen.getByLabelText(/Email Address/i), {
    //         target: { value: 'test@example.com' },
    //     });
    //     fireEvent.change(screen.getByLabelText(/Password/i), {
    //         target: { value: 'password123' },
    //     });
    //     fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    //     await waitFor(() => {
    //         expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    //     });
    // });
});