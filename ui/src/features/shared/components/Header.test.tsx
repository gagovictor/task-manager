import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Header from './Header';
import { logout } from '../../../features/auth/redux/authSlice';
import userEvent from '@testing-library/user-event';

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

  it('should render Tasks title', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
      },
      loading: {
        activeRequests: 0
      }
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('should display Login button when not authenticated', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: false,
        user: null,
      },
      loading: {
        activeRequests: 0
      }
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
      loading: {
        activeRequests: 0
      }
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    act(() => {
      userEvent.click(screen.getByText('Login'));
    });

    waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should dispatch logout and navigate to /logout when Logout menu item is clicked', async () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'testuser' },
      },
      loading: {
        activeRequests: 0,
      },
      preferences: {
        theme: 'light',
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
      const avatarButton = screen.getByRole('button', { name: /account settings/i });
      expect(avatarButton).toBeInTheDocument();

      userEvent.click(avatarButton);
    });
  
    waitFor(() => {
      const logoutMenuItem = screen.getByText('Logout');
      userEvent.click(logoutMenuItem);
    });

    expect(mockDispatch).toHaveBeenCalledWith(logout());
    expect(mockNavigate).toHaveBeenCalledWith('/logout');
  });
  
  it('should open menu when avatar is clicked and display Logout option', async () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'testuser' },
      },
      loading: {
        activeRequests: 0,
      },
      preferences: {
        theme: 'light',
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
      const avatarButton = screen.getByRole('button', { name: /account settings/i });
      expect(avatarButton).toBeInTheDocument();
  
      userEvent.click(avatarButton);
    });

    const logoutMenuItem = await screen.findByText('Logout');
    expect(logoutMenuItem).toBeInTheDocument();
  });

  it('should display avatar when authenticated', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'testuser' },
      },
      loading: {
        activeRequests: 0,
      },
      preferences: {
        theme: 'light',
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    const avatarButton = screen.getByRole('button', { name: /account settings/i });
    expect(avatarButton).toBeInTheDocument();

    const avatar = screen.getByText('T'); // 'T' from 'testuser'
    expect(avatar).toBeInTheDocument();
  });

  it('should display spinner when there are active API requests', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'testuser' },
      },
      loading: {
        activeRequests: 1
      },
      preferences: {
        theme: 'light',
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    // CircularProgress has role 'progressbar'
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should not display spinner when there are no active API requests', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'testuser' },
      },
      loading: {
        activeRequests: 0
      },
      preferences: {
        theme: 'light',
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should display spinner when there are multiple active API requests', () => {
    const store = mockStore({
      auth: {
        isAuthenticated: true,
        user: { username: 'testuser' },
      },
      loading: {
        activeRequests: 3
      },
      preferences: {
        theme: 'light',
      },
    });

    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
