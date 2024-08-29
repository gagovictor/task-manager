import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginForm from './LoginForm';
import userEvent from "@testing-library/user-event";
import { initialState, setupStore } from '../../../store';
import { render, screen } from '@testing-library/react';

// const mockDispatch = jest.fn();

// jest.mock('react-redux', () => ({
//     ...jest.requireActual('react-redux'),
//     useDispatch: () => mockDispatch,
// }));

// jest.mock('../redux/authSlice', () => ({
//     ...jest.requireActual('../redux/authSlice'),
//     loginUser: jest.fn().mockImplementation(() => async () => {
//         return { data: 'mocked data', unwrap: () => Promise.resolve({ data: {} }) }; // Ensure unwrap exists and returns a promise
//     }),
// }));

describe('LoginForm component', () => {
    const renderWithProviders = (store: any) => render(
        <Provider store={store}>
            <Router>
                <LoginForm />
            </Router>
        </Provider>
    );
    
    const submitForm = async () => {
        const username = await screen.getByTestId('input-username');
        await userEvent.type(username, 'testuser');
        const password = await screen.getByTestId('input-password');
        await userEvent.type(password, 'password');
        await userEvent.click(await screen.getByTestId('submit'));
    };
    
    it('should render the login form', async () => {
        const store = setupStore(initialState);
        
        renderWithProviders(store);
        
        expect(await screen.getByTestId('input-username')).toBeInTheDocument();
        expect(await screen.getByTestId('input-password')).toBeInTheDocument();
        expect(await screen.getByTestId('submit')).toBeInTheDocument();
    });
    
    // it('should dispatch loginUser action when form is submitted', async () => {
    //     const store = setupStore({
    //         ...initialState,
    //         auth: {
    //             ...initialState.auth,
    //             status: 'idle'
    //         },
    //     });
        
    //     renderWithProviders(store);
    //     await submitForm();
        
    //     await waitFor(() => {
    //         expect(mockDispatch).toHaveBeenCalled();
    //         expect(loginUser).toHaveBeenCalledWith({ username: 'testuser', password: 'password' });
    //     });
    // });
    
    // it('should show loading state when login is in progress', async() => {
    //     const store = setupStore({
    //         ...initialState,
    //         auth: {
    //             ...initialState.auth,
    //             status: 'loading'
    //         },
    //     });
        
    //     renderWithProviders(store);
        
    //     expect(await screen.getByText('Logging in...')).toBeInTheDocument();
    // });
    
    // it('should display error message on login failure', async () => {
    //     const store = setupStore({
    //         ...initialState,
    //         auth: {
    //             ...initialState.auth,
    //             status: 'idle',
    //         },
    //     });
        
    //     jest.mock('../redux/authSlice', () => ({
    //         ...jest.requireActual('../redux/authSlice'),
    //         loginUser: jest.fn().mockImplementation(() => ({
    //             unwrap: jest.fn().mockRejectedValue(new Error('Login failed')), // Mock failure
    //         })),
    //     }));
        
    //     renderWithProviders(store);
    //     await submitForm();
        
    //     // Await the loginUser mock to resolve before checking for error message
    //     await waitFor(() => {
    //         expect(screen.getByText('Login failed. Please check your username and password.')).toBeInTheDocument();
    //         expect(screen.getByRole('alert')).toBeInTheDocument();
    //     });
    // });
    
    // it('should close the Snackbar when the close button is clicked', async () => {
    //     const store = setupStore({
    //         ...initialState,
    //         auth: {
    //             ...initialState.auth,
    //             status: 'idle'
    //         },
    //     });
    //     renderWithProviders(store);

    //     await submitForm();
    //     expect(await screen.getByRole('alert')).toBeInTheDocument();
        
    //     await userEvent.click(screen.getByRole('button', { name: /close/i }));        
    //     await waitFor(() => {
    //         expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    //     });
    // });
});
