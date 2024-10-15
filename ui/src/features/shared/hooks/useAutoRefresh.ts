import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoRefreshOptions {
    onRefresh: () => Promise<void>;
    interval: number; // in milliseconds
    immediate?: boolean; // whether to refresh immediately on mount
    onlyWhenFocused?: boolean; // fetch only when tab is focused
}

interface AutoRefreshState {
    isRefreshing: boolean;
    start: () => void;
    stop: () => void;
    resetInterval: () => void;
}

export const useAutoRefresh = ({
    onRefresh,
    interval,
    immediate = false,
    onlyWhenFocused = false,
}: AutoRefreshOptions): AutoRefreshState => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
    const onRefreshRef = useRef(onRefresh);
    const isTabFocusedRef = useRef<boolean>(!onlyWhenFocused);

    // Update the onRefresh ref if the onRefresh prop changes
    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    // Handler to update tab focus state
    const handleVisibilityChange = useCallback(() => {
        isTabFocusedRef.current = !document.hidden;
        if (isTabFocusedRef.current && onlyWhenFocused && intervalIdRef.current === null) {
            start(); // Start auto-refresh when tab becomes focused
        } else if (!isTabFocusedRef.current && onlyWhenFocused) {
            stop(); // Stop auto-refresh when tab is not focused
        }
    }, [onlyWhenFocused]);

    useEffect(() => {
        if (onlyWhenFocused) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            // Initialize focus state
            isTabFocusedRef.current = !document.hidden;
        }

        return () => {
            if (onlyWhenFocused) {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            }
        };
    }, [handleVisibilityChange, onlyWhenFocused]);

    const refresh = useCallback(async () => {
        if (onlyWhenFocused && !isTabFocusedRef.current) {
            return; // Do not refresh if the tab is not focused
        }
        setIsRefreshing(true);
        try {
            await onRefreshRef.current();
        } catch (error) {
            console.error('AutoRefresh: onRefresh encountered an error:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [onlyWhenFocused]);

    const start = useCallback(() => {
        if (intervalIdRef.current === null) {
            // If immediate is true and conditions are met, refresh immediately
            if (immediate && (!onlyWhenFocused || isTabFocusedRef.current)) {
                refresh();
            }
            intervalIdRef.current = setInterval(refresh, interval);
        }
    }, [refresh, interval, immediate, onlyWhenFocused]);

    const stop = useCallback(() => {
        if (intervalIdRef.current !== null) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
    }, []);

    const resetInterval = useCallback(() => {
        stop();
        start();
    }, [stop, start]);

    // Start the interval on mount
    useEffect(() => {
        start();
        return () => {
            stop();
        };
    }, [start, stop]);

    return { isRefreshing, start, stop, resetInterval };
};
