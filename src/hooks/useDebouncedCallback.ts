import { useCallback, useEffect, useRef } from 'react';

/**
 * Debounces a one-argument callback and hands back a `cancel` so imperative
 * actions (clear, submit) can drop a pending call instead of racing it.
 */
export function useDebouncedCallback<A>(
  callback: (arg: A) => void,
  delay = 250,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  const cancel = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  useEffect(() => cancel, [cancel]);

  const run = useCallback(
    (arg: A) => {
      cancel();
      timerRef.current = setTimeout(() => callbackRef.current(arg), delay);
    },
    [cancel, delay],
  );

  return { run, cancel };
}
