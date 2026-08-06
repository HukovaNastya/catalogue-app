import type { Breed } from '../services/cat/cat.model.ts';

export type SortKey = 'name' | 'name-desc';
export type Trait = 'hypoallergenic' | 'rare';
export type FilterKey = 'q' | 'kids' | 'grooming' | 'traits' | 'origin';

export interface BreedFilters {
  q: string;
  kids: number;
  grooming: number[];
  traits: Trait[];
  origin: string;
  sort: SortKey;
}

export const KIDS_OPTIONS = [3, 4, 5] as const;

export const GROOMING_BUCKETS = [
  { id: 'low', label: 'Low', levels: [1, 2] },
  { id: 'medium', label: 'Medium', levels: [3] },
  { id: 'high', label: 'High', levels: [4, 5] },
] as const;

export const TRAIT_OPTIONS: { id: Trait; label: string }[] = [
  { id: 'hypoallergenic', label: 'Hypoallergenic' },
  { id: 'rare', label: 'Rare' },
];

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'name', label: 'A–Z' },
  { id: 'name-desc', label: 'Z–A' },
];

export const EMPTY_FILTERS: BreedFilters = {
  q: '',
  kids: 0,
  grooming: [],
  traits: [],
  origin: '',
  sort: 'name',
};

const PREDICATES: Record<
  FilterKey,
  (breed: Breed, filters: BreedFilters) => boolean
> = {
  q: (breed, { q }) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return (
      breed.name.toLowerCase().includes(needle) ||
      breed.origin.toLowerCase().includes(needle)
    );
  },
  kids: (breed, { kids }) => kids === 0 || breed.child_friendly >= kids,
  grooming: (breed, { grooming }) =>
    grooming.length === 0 || grooming.includes(breed.grooming),
  traits: (breed, { traits }) => traits.every((trait) => breed[trait] === 1),
  origin: (breed, { origin }) => origin === '' || breed.origin === origin,
};

const FILTER_KEYS = Object.keys(PREDICATES) as FilterKey[];

export function isFilterActive(filters: BreedFilters, key: FilterKey): boolean {
  const value = filters[key];
  return Array.isArray(value) ? value.length > 0 : value !== EMPTY_FILTERS[key];
}

export function activeFilterKeys(filters: BreedFilters): FilterKey[] {
  return FILTER_KEYS.filter((key) => isFilterActive(filters, key));
}

function sortBreeds(breeds: Breed[], sort: SortKey): Breed[] {
  const direction = sort === 'name-desc' ? -1 : 1;
  return [...breeds].sort(
    (a, b) => a.name.localeCompare(b.name) * direction,
  );
}

export function applyBreedFilters(
  breeds: Breed[],
  filters: BreedFilters,
): Breed[] {
  const matches = breeds.filter((breed) =>
    FILTER_KEYS.every((key) => PREDICATES[key](breed, filters)),
  );

  return sortBreeds(matches, filters.sort);
}

export function findBlockingFilters(
  breeds: Breed[],
  filters: BreedFilters,
): FilterKey[] {
  return activeFilterKeys(filters)
    .filter((key) => key !== 'q')
    .filter(
      (key) =>
        applyBreedFilters(breeds, { ...filters, [key]: EMPTY_FILTERS[key] })
          .length > 0,
    );
}

export function matchesQueryOnly(
  breeds: Breed[],
  filters: BreedFilters,
): boolean {
  return (
    applyBreedFilters(breeds, { ...EMPTY_FILTERS, q: filters.q }).length > 0
  );
}

export function groomingLabel(levels: number[]): string {
  const sorted = [...levels].sort((a, b) => a - b);
  const key = sorted.join(',');

  if (key === '1,2') return '≤2';
  if (key === '4,5') return '4+';
  return sorted.join(' · ');
}

export function filterLabel(filters: BreedFilters, key: FilterKey): string {
  switch (key) {
    case 'q':
      return `“${filters.q}”`;
    case 'kids':
      return `kids ${filters.kids}+`;
    case 'grooming':
      return `grooming ${groomingLabel(filters.grooming)}`;
    case 'traits':
      return filters.traits.join(' · ');
    case 'origin':
      return filters.origin;
  }
}
