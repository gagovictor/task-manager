import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PasswordField from './PasswordField';
import userEvent from '@testing-library/user-event';

describe('PasswordField Component', () => {
    const defaultProps = {
        value: '',
        onChange: jest.fn(),
        label: 'Password',
        id: 'password',
        testId: 'input-password'
    };
    
    it('should render correctly with given props', () => {
        render(<PasswordField {...defaultProps} />);
        
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
    
    it('should toggle password visibility on icon click', () => {
        render(<PasswordField {...defaultProps} />);
        
        const input = screen.getByLabelText('Password');
        expect(input).toHaveAttribute('type', 'password');
        
        const toggleButton = screen.getByRole('button', { name: /Toggle password visibility/i });
        userEvent.click(toggleButton);
        
        expect(input).toHaveAttribute('type', 'text');
        
        userEvent.click(toggleButton);
        
        expect(input).toHaveAttribute('type', 'password');
    });
    
    it('should call onChange handler when input value changes', () => {
        const handleChange = jest.fn();
        render(<PasswordField {...defaultProps} value="test" onChange={handleChange} />);
        
        waitFor(() => {
            const input = screen.getByLabelText('Password');
            userEvent.type(input, 'new password');
            expect(input).toHaveValue('new password');
            expect(handleChange).toHaveBeenCalled();
            expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ target: { value: 'new password' } }));
        });
    });
});
