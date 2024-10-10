
import { useState, useEffect, useCallback, RefObject } from 'react';

interface PullToRefreshOptions {
    onRefresh: () => Promise<void>;
    resistance?: number;
    pullDownThreshold?: number;
    scrollableRef: RefObject<HTMLElement>;
}

interface PullState {
    isPulling: boolean;
    pullDistance: number;
}

export const usePullToRefresh = ({
    onRefresh,
    resistance = 2,
    pullDownThreshold = 70,
    scrollableRef,
}: PullToRefreshOptions): PullState => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const container = scrollableRef.current;
        if (container && container.scrollTop === 0 && !isRefreshing) {
            setStartY(e.touches[0].clientY);
        }
    }, [scrollableRef, isRefreshing]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (startY !== null && !isRefreshing) {
            const currentY = e.touches[0].clientY;
            const distance = (currentY - startY) / resistance;
            if (distance > 0) {
                e.preventDefault(); // Prevent default scroll behavior
                setIsPulling(true);
                setPullDistance(distance);
            }
        }
    }, [startY, resistance, isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (isPulling && pullDistance > pullDownThreshold && !isRefreshing) {
            setIsRefreshing(true);
            await onRefresh();
            setIsRefreshing(false);
        }
        setIsPulling(false);
        setPullDistance(0);
        setStartY(null);
    }, [isPulling, pullDistance, pullDownThreshold, onRefresh, isRefreshing]);

    useEffect(() => {
        const container = scrollableRef.current;
        if (!container) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, scrollableRef]);

    return { isPulling, pullDistance };
};