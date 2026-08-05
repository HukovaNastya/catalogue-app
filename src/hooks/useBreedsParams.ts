import { useCallback } from 'react';
import { useMatchRoute, useNavigate, useSearch } from '@tanstack/react-router';

export function useBreedsParams() {
  const { q, page } = useSearch({ from: '__root__' });
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const onBreedDetail = Boolean(matchRoute({ to: '/breeds/$breedId' }));

  const setQuery = useCallback(
    (next: string) => {
      // Searching from anywhere — including a detail page — lands on the list.
      navigate({
        to: '/breeds',
        search: { q: next.trim(), page: 1 },
        replace: true,
      });
    },
    [navigate],
  );

  const clearQuery = useCallback(() => {
    // On a detail page the search box only filters the list behind it, so
    // emptying it shouldn't kick the user off the breed they are reading.
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
      // Relative, so both the breeds list and favourites page in place.
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
