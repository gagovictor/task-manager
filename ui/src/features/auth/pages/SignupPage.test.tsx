import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import SignupPage from './SignupPage';
import store from '../../../store';

describe('SignupPage', () => {
    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <Provider store={store}>
                <MemoryRouter>
                    {component}
                </MemoryRouter>
            </Provider>
        );
    };

    it('should render SignupPage component', () => {
        const { getByRole } = renderWithProviders(<SignupPage />);
        
        const container = getByRole('main');
        expect(container).toBeInTheDocument();
    });

    it('should have correct styling for the container', () => {
        const { getByRole } = renderWithProviders(<SignupPage />);
        
        const container = getByRole('main');
        expect(container).toHaveStyle({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 64px)',
            paddingTop: '64px',
            paddingBottom: '64px',
        });
    });

    it('should render the SignupForm component by text content', () => {
        const { getAllByText } = renderWithProviders(<SignupPage />);
        
        const loginFormText = getAllByText('Sign Up'); 
        expect(loginFormText.length).toBe(2);
    });
});
