import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import { initialState, setupStore } from '../../../store';

describe('AuthGuard component', () => {
  const renderWithProviders = (store: any, initialRoute: string = '/') =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/protected" element={<AuthGuard />}>
              <Route path="/protected" element={<div>Protected Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

  it('should render protected content when authenticated', () => {
    const store = setupStore({
      ...initialState,
      auth: {
        ...initialState.auth,
        isAuthenticated: true
      },
    });

    const { getByText } = renderWithProviders(store, '/protected');

    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    const store = setupStore({
      ...initialState,
      auth: {
        ...initialState.auth,
        isAuthenticated: false
      },
    });

    const { getByText } = renderWithProviders(store, '/protected');

    expect(getByText('Login Page')).toBeInTheDocument();
  });

  it('should redirect to the specified path when not authenticated', () => {
    const store = setupStore({
      ...initialState,
      auth: {
        ...initialState.auth,
        isAuthenticated: false
      },
    });

    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/protected" element={<AuthGuard redirectPath="/custom-login" />}>
              <Route path="/protected" element={<div>Protected Content</div>} />
            </Route>
            <Route path="/custom-login" element={<div>Custom Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(getByText('Custom Login Page')).toBeInTheDocument();
  });
});
