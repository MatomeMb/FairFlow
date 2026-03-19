import { useEffect, useRef } from 'react';

export function useVisibilityAwareInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  const mountedRef = useRef(true);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    mountedRef.current = true;
    if (delay === null) return;

    const tick = () => {
      if (document.visibilityState === 'visible' && mountedRef.current) {
        savedCallback.current();
      }
    };

    const id = window.setInterval(tick, delay);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mountedRef.current) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mountedRef.current = false;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay]);
}
