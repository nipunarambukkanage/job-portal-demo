import * as React from "react";

/**
 * Debounce any changing value. Returns the debounced value after `delay` ms.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = React.useState<T>(value);

  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/**
 * Debounced callback creator.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  cb: T,
  delay = 300
): T {
  const ref = React.useRef(cb);
  React.useEffect(() => {
    ref.current = cb;
  }, [cb]);

  // @ts-ignore
  return React.useMemo(
    () =>
      ((...args: any[]) => {
        const id = (useDebouncedCallback as any)._id;
        if (id) window.clearTimeout(id);
        (useDebouncedCallback as any)._id = window.setTimeout(() => ref.current(...args), delay);
      }) as T,
    [delay]
  );
}
