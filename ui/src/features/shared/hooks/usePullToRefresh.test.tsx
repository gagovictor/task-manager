// usePullToRefresh.test.tsx
import React, { useRef } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { usePullToRefresh } from './usePullToRefresh'; // Adjust the import path accordingly

interface TestComponentProps {
    onRefresh: () => Promise<void>;
}

const TestComponent: React.FC<TestComponentProps> = ({ onRefresh }) => {
    const scrollableRef = useRef<HTMLDivElement>(null);
    const { isPulling, pullDistance } = usePullToRefresh({
        onRefresh,
        scrollableRef,
    });
    
    return (
        <div>
        <div
        ref={scrollableRef}
        data-testid="scrollable-container"
        style={{
            height: '200px',
            overflow: 'auto',
            border: '1px solid black',
        }}
        >
        <div style={{ height: '400px' }}>Scrollable Content</div>
        </div>
        <div data-testid="is-pulling">Is Pulling: {isPulling ? 'Yes' : 'No'}</div>
        <div data-testid="pull-distance">Pull Distance: {pullDistance}</div>
        </div>
    );
};

describe('usePullToRefresh Hook', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });
    
    it('Hook initializes with default state', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        render(<TestComponent onRefresh={onRefresh} />);
        
        expect(screen.getByTestId('is-pulling').textContent).toBe('Is Pulling: No');
        expect(screen.getByTestId('pull-distance').textContent).toBe('Pull Distance: 0');
    });
    
    it('Sets startY on touchstart when at top and not refreshing', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        render(<TestComponent onRefresh={onRefresh} />);
        
        const container = screen.getByTestId('scrollable-container');
        
        act(() => {
            fireEvent.touchStart(container, {
                touches: [{ clientY: 100 }],
            });
        });
        
        // Since pull hasn't started yet, isPulling should still be false
        expect(screen.getByTestId('is-pulling').textContent).toBe('Is Pulling: No');
        expect(screen.getByTestId('pull-distance').textContent).toBe('Pull Distance: 0');
    });
    
    it('Updates isPulling and pullDistance on touchmove with positive distance', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        render(<TestComponent onRefresh={onRefresh} />);
        
        const container = screen.getByTestId('scrollable-container');
        
        act(() => {
            fireEvent.touchStart(container, {
                touches: [{ clientY: 100 }],
            });
        });
        
        act(() => {
            fireEvent.touchMove(container, {
                touches: [{ clientY: 150 }],
            });
        });
        
        expect(screen.getByTestId('is-pulling').textContent).toBe('Is Pulling: Yes');
        expect(screen.getByTestId('pull-distance').textContent).toBe('Pull Distance: 25');
    });
    
    it('Calls onRefresh when pullDistance exceeds threshold on touchend', async () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        render(<TestComponent onRefresh={onRefresh} />);
        
        const container = screen.getByTestId('scrollable-container');
        
        // Start touching at Y=100
        act(() => {
            fireEvent.touchStart(container, {
                touches: [{ clientY: 100 }],
            });
        });
        
        // Move to Y=300 => distance = (300 - 100) / 2 = 100 > 70 threshold
        act(() => {
            fireEvent.touchMove(container, {
                touches: [{ clientY: 300 }],
            });
        });
        
        // touchEnd to trigger refresh
        await act(async () => {
            fireEvent.touchEnd(container);
        });
        
        expect(onRefresh).toHaveBeenCalledTimes(1);
        
        // After refresh, isPulling should be false and pullDistance reset
        expect(screen.getByTestId('is-pulling').textContent).toBe('Is Pulling: No');
        expect(screen.getByTestId('pull-distance').textContent).toBe('Pull Distance: 0');
    });
    
    it('Does not call onRefresh when pullDistance does not exceed threshold on touchend', async () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        render(<TestComponent onRefresh={onRefresh} />);
        
        const container = screen.getByTestId('scrollable-container');
        
        // Start touching at Y=100
        act(() => {
            fireEvent.touchStart(container, {
                touches: [{ clientY: 100 }],
            });
        });
        
        // Move to Y=150 => distance = (150 - 100) / 2 = 25 < 70 threshold
        act(() => {
            fireEvent.touchMove(container, {
                touches: [{ clientY: 150 }],
            });
        });
        
        // touchEnd to potentially trigger refresh
        await act(async () => {
            fireEvent.touchEnd(container);
        });
        
        expect(onRefresh).not.toHaveBeenCalled();
        
        // isPulling should be false and pullDistance reset
        expect(screen.getByTestId('is-pulling').textContent).toBe('Is Pulling: No');
        expect(screen.getByTestId('pull-distance').textContent).toBe('Pull Distance: 0');
    });
    
    it('Does not set startY on touchstart when not at top', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        render(<TestComponent onRefresh={onRefresh} />);
        
        const container = screen.getByTestId('scrollable-container');
        
        // Mock scrollTop to 100 (not at top)
        Object.defineProperty(container, 'scrollTop', {
            configurable: true,
            get: () => 100,
        });
        
        act(() => {
            fireEvent.touchStart(container, {
                touches: [{ clientY: 100 }],
            });
        });
        
        // Attempt to move touch
        act(() => {
            fireEvent.touchMove(container, {
                touches: [{ clientY: 200 }],
            });
        });
        
        // Since not at top, isPulling should remain false
        expect(screen.getByTestId('is-pulling').textContent).toBe('Is Pulling: No');
        expect(screen.getByTestId('pull-distance').textContent).toBe('Pull Distance: 0');
    });
    
    it('Cleans up event listeners on unmount', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        
        // Spy on addEventListener and removeEventListener on HTMLElement prototype
        const addEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(HTMLElement.prototype, 'removeEventListener');
        
        const { unmount } = render(<TestComponent onRefresh={onRefresh} />);
        
        const container = screen.getByTestId('scrollable-container');
        
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
