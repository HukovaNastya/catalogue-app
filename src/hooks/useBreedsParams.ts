import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Owns every URL param the breed list reads. Keeping `q` and `page` in one
 * place is what guarantees a new query resets pagination — filtering down to
 * 3 results while sitting on page 4 would otherwise render an empty grid.
 */
export function useBreedsParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const rawPage = Number(searchParams.get('page'));
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.trunc(rawPage) : 1;

  const setQuery = useCallback(
    (next: string) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const trimmed = next.trim();

          if (trimmed) {
            params.set('q', trimmed);
          } else {
            params.delete('q');
          }
          params.delete('page');

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (next: number) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);

          if (next <= 1) {
            params.delete('page');
          } else {
            params.set('page', String(next));
          }

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { q, page, setQuery, setPage };
}
