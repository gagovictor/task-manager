import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Sidebar from './Sidebar';
import { logout } from '../../../features/auth/redux/authSlice';

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('../../../features/auth/redux/authSlice', () => ({
  logout: jest.fn(),
}));

describe('Sidebar component', () => {
  const mockStore = configureStore([]);

  const renderWithProviders = (store) =>
    render(
      <Provider store={store}>
        <Router>
          <Sidebar />
        </Router>
      </Provider>
    );

  it('should render the menu icon', () => {
    const store = mockStore({
      auth: { isAuthenticated: false },
    });

    renderWithProviders(store);

    expect(screen.getByLabelText('menu')).toBeInTheDocument();
  });

  it('should open the drawer when the menu icon is clicked', () => {
    const store = mockStore({
      auth: { isAuthenticated: false },
    });

    renderWithProviders(store);

    act(() => {
      fireEvent.click(screen.getByLabelText('menu'));
    });

    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should navigate to the tasks page when Tasks is clicked', async () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Sidebar />
        </Router>
      </Provider>
    );

    // Open the drawer first
    act(() => {
      fireEvent.click(screen.getByLabelText('menu'));
    });

    // Wait for the Tasks button to appear and then click it
    const tasksButton = await screen.findByText('Tasks');
    fireEvent.click(tasksButton);

    expect(mockNavigate).toHaveBeenCalledWith('/tasks');
  });

  it('should display Logout button when authenticated', async () => {
    const store = mockStore({
      auth: { isAuthenticated: true },
    });

    renderWithProviders(store);

    act(() => {
      fireEvent.click(screen.getByLabelText('menu'));
    });

    const logoutButton = await screen.findByText('Logout');
    expect(logoutButton).toBeInTheDocument();
  });

  it('should dispatch logout and navigate to /login when Logout is clicked', async () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Sidebar />
        </Router>
      </Provider>
    );

    // Open the drawer first
    act(() => {
      fireEvent.click(screen.getByLabelText('menu'));
    });

    // Wait for the Logout button to appear and then click it
    const logoutButton = await screen.findByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  
  it('should display Login button when authenticated', async () => {
    const store = mockStore({
      auth: { isAuthenticated: false },
    });

    renderWithProviders(store);

    act(() => {
      fireEvent.click(screen.getByLabelText('menu'));
    });

    const loginButton = await screen.findByText('Login');
    expect(loginButton).toBeInTheDocument();
  });

  it('should dispatch login and navigate to /login when Login is clicked', async () => {
    const store = mockStore({
      auth: {
        isAuthenticated: false,
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Sidebar />
        </Router>
      </Provider>
    );

    // Open the drawer first
    act(() => {
      fireEvent.click(screen.getByLabelText('menu'));
    });

    // Wait for the Login button to appear and then click it
    const loginButton = await screen.findByText('Login');
    fireEvent.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
