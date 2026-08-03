import type { Breed } from '../services/cat/cat.model.ts';

export function filterBreeds(breeds: Breed[], query: string): Breed[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return breeds;

  return breeds.filter(
    (breed) =>
      breed.name.toLowerCase().includes(needle) ||
      breed.origin.toLowerCase().includes(needle),
  );
}
