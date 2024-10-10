import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

const useInfiniteScroll = ({ loading, hasMore, onLoadMore }: UseInfiniteScrollProps) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];
            if (target.isIntersecting && !loading && hasMore) {
                onLoadMore();
            }
        },
        [loading, hasMore, onLoadMore]
    );
    
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();
        
        observerRef.current = new IntersectionObserver(handleObserver, {
            root: null, // viewport
            rootMargin: '20px',
            threshold: 1.0,
        });
        
        const currentSentinel = sentinelRef.current;
        const currentObserver = observerRef.current;
        
        if (currentSentinel) {
            currentObserver.observe(currentSentinel);
        }
        
        return () => {
            if (currentObserver && currentSentinel) {
                currentObserver.unobserve(currentSentinel);
            }
        };
    }, [handleObserver]);
    
    return sentinelRef;
};

export default useInfiniteScroll;
