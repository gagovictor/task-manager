import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';
import store from '../../../redux/store';

describe('ResetPasswordPage', () => {
    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <Provider store={store}>
                <MemoryRouter>
                    {component}
                </MemoryRouter>
            </Provider>
        );
    };

    it('should render ResetPasswordPage component', () => {
        const { getByRole } = renderWithProviders(<ResetPasswordPage />);
        
        const container = getByRole('main');
        expect(container).toBeInTheDocument();
    });

    it('should have correct styling for the container', () => {
        const { getByRole } = renderWithProviders(<ResetPasswordPage />);
        
        const container = getByRole('main');
        expect(container).toHaveStyle({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            paddingTop: '64px',
            paddingBottom: '64px',
        });
    });

    it('should render the form component by text content', () => {
        const { getAllByText } = renderWithProviders(<ResetPasswordPage />);
        
        const RecoverPasswordFormText = getAllByText(/Reset Password/i); 
        expect(RecoverPasswordFormText.length).toBe(2);
    });
});
