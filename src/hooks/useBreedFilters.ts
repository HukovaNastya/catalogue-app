import { useCallback, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { EMPTY_FILTERS } from '../utils/filterBreeds.ts';
import type { BreedFilters, FilterKey, Trait } from '../utils/filterBreeds.ts';

function serialise(next: Partial<BreedFilters>) {
  const patch: Record<string, unknown> = { ...next };

  if (next.grooming) patch.grooming = next.grooming.join(',');
  if (next.traits) patch.traits = next.traits.join(',');

  return patch;
}

export function useBreedFilters() {
  const search = useSearch({ from: '__root__' });
  const navigate = useNavigate();

  const filters = useMemo<BreedFilters>(
    () => ({
      q: search.q,
      kids: search.kids,
      grooming: search.grooming
        ? search.grooming.split(',').map(Number)
        : [],
      traits: search.traits ? (search.traits.split(',') as Trait[]) : [],
      origin: search.origin,
      sort: search.sort,
    }),
    [
      search.q,
      search.kids,
      search.grooming,
      search.traits,
      search.origin,
      search.sort,
    ],
  );

  const setFilters = useCallback(
    (next: Partial<BreedFilters>) => {
      navigate({
        to: '.',
        search: (prev) => ({ ...prev, ...serialise(next), page: 1 }),
        replace: true,
      });
    },
    [navigate],
  );

  const clearFilter = useCallback(
    (key: FilterKey) => {
      setFilters({ [key]: EMPTY_FILTERS[key] } as Partial<BreedFilters>);
    },
    [setFilters],
  );

  const clearFilters = useCallback(() => {
    setFilters({
      q: EMPTY_FILTERS.q,
      kids: EMPTY_FILTERS.kids,
      grooming: EMPTY_FILTERS.grooming,
      traits: EMPTY_FILTERS.traits,
      origin: EMPTY_FILTERS.origin,
    });
  }, [setFilters]);

  return { filters, setFilters, clearFilter, clearFilters };
}
