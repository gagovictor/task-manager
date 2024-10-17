
import React, { useRef } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { usePullToRefresh } from '../../shared/hooks/usePullToRefresh';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    pullThreshold?: number;
    resistance?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    pullThreshold = 70,
    resistance = 2.5,
}) => {
    const theme = useTheme();
    const scrollableRef = useRef<HTMLDivElement>(null);
    const { isPulling, pullDistance } = usePullToRefresh({
        onRefresh,
        resistance,
        pullDownThreshold: pullThreshold,
        scrollableRef,
    });

    const getMessage = () => {
        if (pullDistance > pullThreshold) {
            return 'Release to refresh';
        }
        return 'Pull to refresh';
    };

    const translateY = isPulling ? pullDistance / resistance : 0;
    const releaseToRefresh = pullDistance > pullThreshold;

    return (
        <Box
            ref={scrollableRef}
            sx={{
                position: 'relative',
                overflow: 'auto',
                height: '100vh',
            }}
            data-testid="pull-to-refresh-container"
        >
            {/* Pull to Refresh Indicator */}
            <Box
                sx={{
                    marginTop: '56px',
                    position: 'absolute',
                    top: 0, // Show indicator when pulling
                    opacity: isPulling ? 1 : 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '50px',
                    backgroundColor: releaseToRefresh ? theme.palette.success.main : theme.palette.info.main,
                    color: theme.palette.info.contrastText,
                    zIndex: 1000,
                    transition: 'all 0.3s ease-in-out',
                }}
                role="status"
                aria-live="polite"
            >
                {releaseToRefresh ? (
                    <>
                        <Typography variant="body2">Release to refresh</Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="body2">{getMessage()}</Typography>
                    </>
                )}
            </Box>

            {/* Content Container */}
            <Box
                sx={{
                    transform: `translateY(${translateY}px)`,
                    transition: isPulling ? 'none' : 'transform 0.3s ease',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default PullToRefresh;