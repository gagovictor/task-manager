import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Header from './Header';
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

describe('Header component', () => {
  const mockStore = configureStore([]);

  it('should render Task Manager title', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  it('should display Login button when not authenticated', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should navigate to /login when Login button is clicked', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Login'));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should display username and Logout button when authenticated', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'testuser' },
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should dispatch logout and navigate to /login when Logout button is clicked', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'testuser' },
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    act(() => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
