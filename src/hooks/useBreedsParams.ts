import { useCallback } from 'react';
import { useMatchRoute, useNavigate, useSearch } from '@tanstack/react-router';

export function useBreedsParams() {
  const { q, page } = useSearch({ from: '__root__' });
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const onBreedDetail = Boolean(matchRoute({ to: '/breeds/$breedId' }));

  const setQuery = useCallback(
    (next: string) => {
      navigate({
        to: '/breeds',
        search: { q: next.trim(), page: 1 },
        replace: true,
      });
    },
    [navigate],
  );

  const clearQuery = useCallback(() => {
    if (onBreedDetail) {
      navigate({
        to: '.',
        search: (prev) => ({ ...prev, q: '', page: 1 }),
        replace: true,
      });
      return;
    }

    setQuery('');
  }, [navigate, onBreedDetail, setQuery]);

  const setPage = useCallback(
    (next: number) => {
      navigate({
        to: '.',
        search: (prev) => ({ ...prev, page: next }),
        replace: true,
      });
    },
    [navigate],
  );

  return { q, page, setQuery, clearQuery, setPage };
}
