import { useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

export function useBreedsParams() {
  const { q, page } = useSearch({ from: '__root__' });
  const navigate = useNavigate();

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

  return { q, page, setQuery, setPage };
}
