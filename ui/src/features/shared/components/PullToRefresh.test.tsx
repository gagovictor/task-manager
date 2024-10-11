// PullToRefresh.test.tsx
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PullToRefresh from './PullToRefresh';

interface TestComponentProps {
    onRefresh: () => Promise<void>;
}

const TestComponent: React.FC<TestComponentProps> = ({ onRefresh }) => {
    return (
        <PullToRefresh onRefresh={onRefresh}>
            <div data-testid="child-content">Child Content</div>
        </PullToRefresh>
    );
};

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('PullToRefresh Component', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    
    test('renders children correctly', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        renderWithTheme(<TestComponent onRefresh={onRefresh} />);
        
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toHaveTextContent('Child Content');
    });
    
    test('displays "Pull to refresh" message during pull', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        renderWithTheme(<TestComponent onRefresh={onRefresh} />);
        
        const scrollableContainer = screen.getByTestId('pull-to-refresh-container');
        
        // Simulate touchstart at Y=0 (top of the container)
        act(() => {
            fireEvent.touchStart(scrollableContainer, {
                touches: [{ clientY: 0 }],
            });
            
            // Simulate touchmove to Y=50 (pull distance = 50 / resistance)
            fireEvent.touchMove(scrollableContainer, {
                touches: [{ clientY: 50 }],
            });
        });
        
        expect(screen.getByText('Pull to refresh')).toBeInTheDocument();
    });
    
    test('displays "Release to refresh" message when threshold exceeded', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        renderWithTheme(<TestComponent onRefresh={onRefresh} />);
        
        const scrollableContainer = screen.getByTestId('pull-to-refresh-container');
        
        // Simulate touchstart at Y=0 (top of the container)
        act(() => {
            fireEvent.touchStart(scrollableContainer, {
                touches: [{ clientY: 0 }],
            });
            
            // Simulate touchmove to Y=200 (pull distance = 200 / resistance = 80 > 70)
            fireEvent.touchMove(scrollableContainer, {
                touches: [{ clientY: 200 }],
            });
        });
        
        waitFor(() => expect(screen.getByText('Release to refresh')).toBeInTheDocument());
    });
    
    test('triggers onRefresh when pull threshold is exceeded', async () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        renderWithTheme(<TestComponent onRefresh={onRefresh} />);
        
        const scrollableContainer = screen.getByTestId('pull-to-refresh-container');
        
        // Simulate touchstart at Y=0 (top of the container)
        act(() => {
            fireEvent.touchStart(scrollableContainer, {
                touches: [{ clientY: 0 }],
            });
            
            // Simulate touchmove to Y=200 (pull distance = 200 / 2.5 = 80 > 70)
            fireEvent.touchMove(scrollableContainer, {
                touches: [{ clientY: 200 }],
            });
            
            // Simulate touchend to release
            fireEvent.touchEnd(scrollableContainer);
        });
        
        waitFor(() => expect(onRefresh).toHaveBeenCalledTimes(1));
    });
    
    test('does not trigger onRefresh when pull threshold is not exceeded', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        renderWithTheme(<TestComponent onRefresh={onRefresh} />);
        
        const scrollableContainer = screen.getByTestId('pull-to-refresh-container');
        
        // Simulate touchstart at Y=0 (top of the container)
        act(() => {
            fireEvent.touchStart(scrollableContainer, {
                touches: [{ clientY: 0 }],
            });
            
            // Simulate touchmove to Y=50 (pull distance = 50 / 2.5 = 20 < 70)
            fireEvent.touchMove(scrollableContainer, {
                touches: [{ clientY: 50 }],
            });
            
            // Simulate touchend to release
            fireEvent.touchEnd(scrollableContainer);
        });
        
        expect(onRefresh).not.toHaveBeenCalled();
    });
    
    test('translates content based on pull distance', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        renderWithTheme(<TestComponent onRefresh={onRefresh} />);
        
        const scrollableContainer = screen.getByTestId('pull-to-refresh-container');
        const content = screen.getByTestId('child-content').parentElement;
        
        // Simulate touchstart at Y=0 (top of the container)
        act(() => {
            fireEvent.touchStart(scrollableContainer, {
                touches: [{ clientY: 0 }],
            });
            
            // Simulate touchmove to Y=100 (pull distance = 100 / 2.5 = 40)
            fireEvent.touchMove(scrollableContainer, {
                touches: [{ clientY: 100 }],
            });
        });
        
        waitFor(() => expect(content).toHaveStyle(`transform: translateY(40px)`));
        
        // Simulate touchmove to Y=200 (pull distance = 200 / 2.5 = 80)
        act(() => {
            fireEvent.touchMove(scrollableContainer, {
                touches: [{ clientY: 200 }],
            });
        });
        
        waitFor(() => expect(content).toHaveStyle(`transform: translateY(80px)`));
    });
    
    test('cleans up event listeners on unmount', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        
        // Spy on addEventListener and removeEventListener on HTMLElement prototype
        const addEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'removeEventListener');
        
        const { unmount } = renderWithTheme(<TestComponent onRefresh={onRefresh} />);
        
        const scrollableContainer = screen.getByTestId('pull-to-refresh-container');
        
        // Check that addEventListener was called with 'touchstart', 'touchmove', 'touchend'
        expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: false });
        expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
        expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
        
        // Unmount the component to trigger cleanup
        unmount();
        
        // Check that removeEventListener was called with 'touchstart', 'touchmove', 'touchend'
        expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
        expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
        
        // Restore the original implementations
        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
    });
});
