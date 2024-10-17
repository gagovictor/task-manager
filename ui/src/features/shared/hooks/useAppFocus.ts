import { useEffect, useRef } from 'react';

function useAppFocus(onFocus: () => void, throttle: number = 300) {
  const lastExecutionTime = useRef<number | null>(null);

  useEffect(() => {
    const handleFocus = (event: Event) => {
      const now = Date.now();
      if (lastExecutionTime.current === null || now - lastExecutionTime.current > throttle) {
        onFocus();
        lastExecutionTime.current = now;
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [onFocus, throttle]);
}

export default useAppFocus;
