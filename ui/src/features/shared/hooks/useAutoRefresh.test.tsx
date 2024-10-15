import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useAutoRefresh } from './useAutoRefresh';

interface AutoRefreshTestComponentProps {
    onRefresh: () => Promise<void>;
    interval: number;
    immediate?: boolean;
    onlyWhenFocused?: boolean;
}

export const AutoRefreshTestComponent: React.FC<AutoRefreshTestComponentProps> = ({
    onRefresh,
    interval,
    immediate = false,
    onlyWhenFocused = false,
}) => {
    const { isRefreshing, start, stop, resetInterval } = useAutoRefresh({
        onRefresh,
        interval,
        immediate,
        onlyWhenFocused,
    });

    return (
        <div>
            <div data-testid="is-refreshing">Is Refreshing: {isRefreshing ? 'Yes' : 'No'}</div>
            <button onClick={start} data-testid="start-button">
                Start
            </button>
            <button onClick={stop} data-testid="stop-button">
                Stop
            </button>
            <button onClick={resetInterval} data-testid="reset-button">
                Reset
            </button>
        </div>
    );
};

// Mock timers using Jest
jest.useFakeTimers();

describe('useAutoRefresh Hook', () => {
    let onRefreshMock: jest.Mock<Promise<void>, []>;

    beforeEach(() => {
        onRefreshMock = jest.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('initializes with isRefreshing as false', () => {
        render(<AutoRefreshTestComponent onRefresh={onRefreshMock} interval={5000} />);
        expect(screen.getByTestId('is-refreshing').textContent).toBe('Is Refreshing: No');
    });

    it('calls onRefresh immediately if immediate is true and conditions are met', async () => {
        await act(async () => {
            render(
                <AutoRefreshTestComponent
                    onRefresh={onRefreshMock}
                    interval={5000}
                    immediate
                />
            );
        });

        expect(onRefreshMock).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('is-refreshing').textContent).toBe('Is Refreshing: No');
    });

    it('does not call onRefresh immediately if immediate is false', () => {
        render(<AutoRefreshTestComponent onRefresh={onRefreshMock} interval={5000} />);
        expect(onRefreshMock).not.toHaveBeenCalled();
    });

    it('calls onRefresh at specified intervals', () => {
        render(<AutoRefreshTestComponent onRefresh={onRefreshMock} interval={5000} />);

        expect(onRefreshMock).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(onRefreshMock).toHaveBeenCalledTimes(1);

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(onRefreshMock).toHaveBeenCalledTimes(2);
    });

    it('can start and stop the auto-refresh', () => {
        render(<AutoRefreshTestComponent onRefresh={onRefreshMock} interval={5000} />);

        act(() => {
            fireEvent.click(screen.getByTestId('stop-button'));
            jest.advanceTimersByTime(5000);
        });

        expect(onRefreshMock).not.toHaveBeenCalled();

        act(() => {
            fireEvent.click(screen.getByTestId('start-button'));
            jest.advanceTimersByTime(5000);
        });

        expect(onRefreshMock).toHaveBeenCalledTimes(1);
    });

    it('can reset the interval', () => {
        render(<AutoRefreshTestComponent onRefresh={onRefreshMock} interval={5000} />);

        act(() => {
            jest.advanceTimersByTime(3000);
            fireEvent.click(screen.getByTestId('reset-button'));
            jest.advanceTimersByTime(5000);
        });

        expect(onRefreshMock).toHaveBeenCalledTimes(1);
    });

    describe('onlyWhenFocused option', () => {
        // Helper function to mock document.hidden
        const setDocumentHidden = (hidden: boolean) => {
            Object.defineProperty(document, 'hidden', {
                configurable: true,
                get: () => hidden,
            });
        };

        beforeEach(() => {
            // Ensure the tab is focused initially
            setDocumentHidden(false);
        });

        it('only calls onRefresh when the tab is focused', async () => {
            await act(async () => {
                render(
                    <AutoRefreshTestComponent
                        onRefresh={onRefreshMock}
                        interval={5000}
                        onlyWhenFocused
                        immediate
                    />
                );
            });

            // 1. Immediate refresh on mount
            expect(onRefreshMock).toHaveBeenCalledTimes(1);

            act(() => {
                // 2. Advance time by 5000ms to trigger the first interval refresh
                jest.advanceTimersByTime(5000);
            });

            expect(onRefreshMock).toHaveBeenCalledTimes(2);

            act(() => {
                // 3. Simulate tab becoming hidden
                setDocumentHidden(true);
                document.dispatchEvent(new Event('visibilitychange'));

                // 4. Advance time by 5000ms (no refresh should occur)
                jest.advanceTimersByTime(5000);
            });

            expect(onRefreshMock).toHaveBeenCalledTimes(2);

            act(() => {
                // 5. Simulate tab becoming visible again
                setDocumentHidden(false);
                document.dispatchEvent(new Event('visibilitychange'));

                // 6. Immediate refresh upon visibility change
                // 7. Advance time by 5000ms to trigger the next interval refresh
                jest.advanceTimersByTime(5000);
            });

            // 3. Immediate refresh on visibility
            // 4. Interval refresh after becoming visible
            expect(onRefreshMock).toHaveBeenCalledTimes(4);
        });

        it('starts auto-refresh when tab becomes focused if onlyWhenFocused is true', async () => {
            await act(async () => {
                render(
                    <AutoRefreshTestComponent
                        onRefresh={onRefreshMock}
                        interval={5000}
                        onlyWhenFocused
                        immediate
                    />
                );
            });

            // 1. Immediate refresh on mount
            expect(onRefreshMock).toHaveBeenCalledTimes(1);

            act(() => {
                // 2. Simulate tab becoming hidden
                setDocumentHidden(true);
                document.dispatchEvent(new Event('visibilitychange'));

                // 3. Advance time by 5000ms (no refresh should occur)
                jest.advanceTimersByTime(5000);
            });

            expect(onRefreshMock).toHaveBeenCalledTimes(1);

            act(() => {
                // 4. Simulate tab becoming visible
                setDocumentHidden(false);
                document.dispatchEvent(new Event('visibilitychange'));

                // 5. Advance time by 5000ms to trigger interval refresh
                jest.advanceTimersByTime(5000);
            });

            // 2. Immediate refresh on visibility
            // 3. Interval refresh after becoming visible
            expect(onRefreshMock).toHaveBeenCalledTimes(3);
        });

        it('stops auto-refresh when tab becomes hidden and onlyWhenFocused is true', async () => {
            await act(async () => {
                render(
                    <AutoRefreshTestComponent
                        onRefresh={onRefreshMock}
                        interval={5000}
                        onlyWhenFocused
                        immediate
                    />
                );
            });

            // 1. Immediate refresh on mount
            expect(onRefreshMock).toHaveBeenCalledTimes(1);

            act(() => {
                // 2. Simulate tab becoming hidden
                setDocumentHidden(true);
                document.dispatchEvent(new Event('visibilitychange'));

                // 3. Advance time by 5000ms (no refresh should occur)
                jest.advanceTimersByTime(5000);
            });

            expect(onRefreshMock).toHaveBeenCalledTimes(1);

            act(() => {
                // 4. Simulate tab remaining hidden
                jest.advanceTimersByTime(5000);
            });

            expect(onRefreshMock).toHaveBeenCalledTimes(1);

            act(() => {
                // 5. Simulate tab becoming visible again
                setDocumentHidden(false);
                document.dispatchEvent(new Event('visibilitychange'));

                // 6. Advance time by 5000ms to trigger interval refresh
                jest.advanceTimersByTime(5000);
            });

            // 2. Immediate refresh on visibility
            // 3. Interval refresh after becoming visible
            expect(onRefreshMock).toHaveBeenCalledTimes(3);
        });
    });
});
