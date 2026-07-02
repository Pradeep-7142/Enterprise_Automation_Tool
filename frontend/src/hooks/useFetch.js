import { useState, useEffect, useCallback, createElement } from 'react';

/**
 * Fetch data from an async function with loading/error states.
 * @param {() => Promise<any>} fetcher
 * @param {any[]} deps
 * @param {any} initialData
 */
export function useFetch(fetcher, deps = [], initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload, setData };
}

export function PageLoader({ message = 'Loading…' }) {
  return createElement(
    'div',
    { className: 'flex items-center justify-center p-12' },
    createElement(
      'div',
      { className: 'flex flex-col items-center gap-3' },
      createElement('div', { className: 'w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin' }),
      createElement('p', { className: 'text-sm text-muted-foreground' }, message),
    ),
  );
}

export function PageError({ message, onRetry }) {
  return createElement(
    'div',
    { className: 'flex items-center justify-center p-12' },
    createElement(
      'div',
      { className: 'text-center max-w-sm' },
      createElement('p', { className: 'text-sm text-red-600 mb-3' }, message),
      onRetry
        ? createElement(
            'button',
            { onClick: onRetry, className: 'text-sm text-primary font-medium hover:underline' },
            'Try again',
          )
        : null,
    ),
  );
}
