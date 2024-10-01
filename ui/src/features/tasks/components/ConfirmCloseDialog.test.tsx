// ConfirmCloseDialog.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmCloseDialog from './ConfirmCloseDialog';
import userEvent from '@testing-library/user-event';

describe('ConfirmCloseDialog Component', () => {
    it('renders the dialog when open is true', () => {
        render(
            <ConfirmCloseDialog
                open={true}
                onConfirm={jest.fn()}
                onCancel={jest.fn()}
            />
        );
        
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    it('does not render the dialog when open is false', () => {
        render(
            <ConfirmCloseDialog
                open={false}
                onConfirm={jest.fn()}
                onCancel={jest.fn()}
            />
        );
        
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    
    it('displays default title and description when not provided', () => {
        render(
            <ConfirmCloseDialog
                open={true}
                onConfirm={jest.fn()}
                onCancel={jest.fn()}
            />
        );
        
        expect(screen.getByText('Unsaved Changes')).toBeInTheDocument();
        expect(
            screen.getByText('You have unsaved changes. Are you sure you want to close?')
        ).toBeInTheDocument();
    });
    
    it('displays custom title and description when provided', () => {
        const customTitle = 'Confirm Closure';
        const customDescription = 'Are you sure you want to exit without saving?';
        
        render(
            <ConfirmCloseDialog
                open={true}
                title={customTitle}
                description={customDescription}
                onConfirm={jest.fn()}
                onCancel={jest.fn()}
            />
        );
        
        expect(screen.getByText(customTitle)).toBeInTheDocument();
        expect(screen.getByText(customDescription)).toBeInTheDocument();
    });
    
    it('calls onConfirm when "Discard Changes" button is clicked', async () => {
        const onConfirmMock = jest.fn();
        render(
            <ConfirmCloseDialog
                open={true}
                onConfirm={onConfirmMock}
                onCancel={jest.fn()}
            />
        );
        
        const confirmButton = screen.getByRole('button', { name: /Discard Changes/i });
        await userEvent.click(confirmButton);
        
        expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });
    
    it('calls onCancel when "Cancel" button is clicked', async () => {
        const onCancelMock = jest.fn();
        render(
            <ConfirmCloseDialog
                open={true}
                onConfirm={jest.fn()}
                onCancel={onCancelMock}
            />
        );
        
        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        await userEvent.click(cancelButton);
        
        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
    
    it('calls onCancel when pressing the Escape key', async () => {
        const onCancelMock = jest.fn();
        render(
            <ConfirmCloseDialog
                open={true}
                onConfirm={jest.fn()}
                onCancel={onCancelMock}
            />
        );
        
        // Simulate pressing the Escape key
        await userEvent.keyboard('{Escape}');
        
        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
    
    it('calls onCancel when clicking outside the dialog (overlay click)', async () => {
        const onCancelMock = jest.fn();
        render(
            <ConfirmCloseDialog
                open={true}
                onConfirm={jest.fn()}
                onCancel={onCancelMock}
            />
        );
        
        // Material-UI renders the backdrop with role="presentation"
        // Get all elements with role="presentation" and click the last one (the current backdrop)
        const backdrops = screen.getAllByRole('presentation');
        const backdrop = backdrops[backdrops.length - 1];
        
        // Simulate clicking on the backdrop
        await userEvent.click(backdrop);
        
        expect(onCancelMock).toHaveBeenCalledTimes(1);
    });
});
