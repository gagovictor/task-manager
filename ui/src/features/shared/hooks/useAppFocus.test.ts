import { renderHook } from '@testing-library/react';
import useAppFocus from './useAppFocus';

describe('useAppFocus', () => {
    let addEventListenerSpy: jest.SpyInstance;
    let removeEventListenerSpy: jest.SpyInstance;
    let focusHandler: (event: Event) => void;
    
    beforeEach(() => {
        jest.useFakeTimers();
        
        // Initialize focusHandler
        focusHandler = jest.fn();
        
        // Mock addEventListener to capture the focus handler
        addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation(
            (type: string, listener: EventListenerOrEventListenerObject) => {
                if (type === 'focus' && typeof listener === 'function') {
                    focusHandler = listener as (event: Event) => void;
                }
            }
        );
        
        // Mock removeEventListener
        removeEventListenerSpy = jest.spyOn(window, 'removeEventListener').mockImplementation(() => {
            // No implementation needed for this test
        });
    });
    
    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });
    
    it('should call onFocus immediately when the app gains focus', () => {
        const onFocusMock = jest.fn();
        
        renderHook(() => useAppFocus(onFocusMock, 1000));
        
        // Simulate focus event by invoking the handler directly
        focusHandler(new Event('focus'));
        
        expect(onFocusMock).toHaveBeenCalledTimes(1);
    });
    
    it('should throttle onFocus and not call it again within the throttle period', () => {
        const onFocusMock = jest.fn();
        
        renderHook(() => useAppFocus(onFocusMock, 1000));
        
        focusHandler(new Event('focus'));
        expect(onFocusMock).toHaveBeenCalledTimes(1);
        
        jest.advanceTimersByTime(250);
        focusHandler(new Event('focus'));
        expect(onFocusMock).toHaveBeenCalledTimes(1);
        
        jest.advanceTimersByTime(5000);
        focusHandler(new Event('focus'));
        expect(onFocusMock).toHaveBeenCalledTimes(2);
    });
    
    it('should clean up event listeners on unmount', () => {
        const onFocusMock = jest.fn();
        
        const { unmount } = renderHook(() => useAppFocus(onFocusMock, 1000));
        
        expect(addEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
        
        // Unmount the hook
        unmount();
        
        expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    });
});
