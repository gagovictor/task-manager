import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { loginUser } from '../redux/authSlice';
import LoginForm from './LoginForm';
import userEvent from "@testing-library/user-event";
import * as ReactRedux from 'react-redux';
import { initialState, RootState } from '../../../store';

const mockStore = configureStore<RootState>([]);

const mockNavigate = jest.fn();
const mockDispatch = jest.fn(() => ({
    unwrap: jest.fn().mockImplementation(() => async (dispatch) => {
        return { data: 'mocked data' };
    })
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
}));

jest.mock('../redux/authSlice', () => ({
    ...jest.requireActual('../redux/authSlice'),
    loginUser: jest.fn().mockImplementation(() => async (dispatch) => {
        return { data: 'mocked data' };
    })
}));

describe('LoginForm component', () => {

    const renderWithProviders = (store: any) =>
        render(
            <Provider store={store}>
                <Router>
                    <LoginForm />
                </Router>
            </Provider>
        );
    
    const submitForm = async () => {
        const simpleDispatch = jest.fn().mockImplementation(() => ({
            unwrap: jest.fn().mockResolvedValue({ data: {} }),
        }));
        jest.spyOn(ReactRedux, 'useDispatch').mockReturnValue(simpleDispatch);
        const username = await screen.getByTestId('input-username');
        await userEvent.type(username, 'testuser');
        const password = await screen.getByTestId('input-password');
        await userEvent.type(password, 'password');
        await userEvent.click(await screen.getByTestId('submit'));
    };
    
    it('should render the login form', async () => {
        const store = mockStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'idle'
            },
        });
        
        renderWithProviders(store);
        
        expect(await screen.getByTestId('input-username')).toBeInTheDocument();
        expect(await screen.getByTestId('input-password')).toBeInTheDocument();
        expect(await screen.getByTestId('submit')).toBeInTheDocument();
    });
    
    it('should dispatch loginUser action when form is submitted', async () => {
        const store = mockStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'idle'
            },
        });
        
        renderWithProviders(store);
        await submitForm();
        
        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalled();
            expect(loginUser).toHaveBeenCalledWith({ username: 'testuser', password: 'password' });
        });
    });
    
    it('should show loading state when login is in progress', async() => {
        const store = mockStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'loading'
            },
        });
        
        renderWithProviders(store);
        
        expect(await screen.getByText('Logging in...')).toBeInTheDocument();
    });
    
    it('should navigate to tasks page on successful login', async () => {
        const store = mockStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'idle'
            },
        });

        renderWithProviders(store);
        await submitForm();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/tasks');
        });
    });
    
    it('should display error message on login failure', async () => {
        const store = mockStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'idle'
            },
        });
                    
        jest.mock('../redux/authSlice', () => ({
            loginUser: jest.fn().mockImplementation(() => ({
                unwrap: jest.fn().mockRejectedValue(new Error('Login failed')), // Mock failure
            })),
        }));
        
        renderWithProviders(store);
        await submitForm();
        
        await waitFor(() => {
            expect(screen.getByText('Login failed. Please check your username and password.')).toBeInTheDocument();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });
    
    it('should close the Snackbar when the close button is clicked', async () => {
        const store = mockStore({
            ...initialState,
            auth: {
                ...initialState.auth,
                status: 'idle'
            },
        });
        
        renderWithProviders(store);
        await submitForm();
        
        expect(await screen.getByRole('alert')).toBeInTheDocument();
        
        await userEvent.click(screen.getByRole('button', { name: /close/i }));
        
        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
