import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import SignupForm from './SignupForm';
import authReducer, { signupUser } from '../redux/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { thunk } from 'redux-thunk';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('../redux/authSlice', () => ({
    ...jest.requireActual('../redux/authSlice'),
    signupUser: jest.fn(() => {
        return async (dispatch) => {
            dispatch({ type: 'auth/signup/fulfilled', payload: {} });
        };
    }),
}));

const store = configureStore({
    reducer: authReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
        </Provider>
    );
};

describe('SignupForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('renders the signup form with email and password fields', () => {
        renderWithProviders(<SignupForm />);
        
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    });
    
    test('allows the user to fill out the form', () => {
        renderWithProviders(<SignupForm />);
        
        fireEvent.change(screen.getByLabelText(/Email Address/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });
        
        expect(screen.getByLabelText(/Email Address/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('password123');
    });
    
    test('disables the sign-up button when auth status is loading', () => {
        store.getState().status = 'loading';
        renderWithProviders(<SignupForm />);
        
        const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
        expect(signUpButton).toBeDisabled();
    });
    
    // test('displays an error message when signup fails', async () => {
    //     renderWithProviders(<SignupForm />);
        
    //     fireEvent.change(screen.getByLabelText(/Email Address/i), {
    //         target: { value: 'test@example.com' },
    //     });
    //     fireEvent.change(screen.getByLabelText(/Password/i), {
    //         target: { value: 'password123' },
    //     });
    //     fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    //     await waitFor(() => {
    //         expect(screen.getByText(/Signup failed. Please check your details./i)).toBeInTheDocument();
    //     });
        
    //     expect(screen.getByRole('alert')).toBeInTheDocument();
    // });
    
    // test('redirects the user to /tasks on successful signup', async () => {
    //     (signupUser as unknown as jest.Mock).mockImplementation((dispatch) => {
    //         dispatch({ type: 'auth/signup/fulfilled', payload: {} });
    //     });
    //     renderWithProviders(<SignupForm />);
        
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
