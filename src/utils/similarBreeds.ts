import type { Breed } from '../services/cat/cat.model.ts';
import { parseTemperament } from './helper.ts';

export interface SimilarBreed {
  breed: Breed;
  shared: string[];
}

interface ScoredBreed extends SimilarBreed {
  ratio: number;
}

function bySimilarity(a: ScoredBreed, b: ScoredBreed): number {
  return (
    b.shared.length - a.shared.length ||
    b.ratio - a.ratio ||
    a.breed.name.localeCompare(b.breed.name)
  );
}

export function findSimilarBreeds(
  breed: Breed,
  breeds: Breed[],
  limit: number,
): SimilarBreed[] {
  const traits = new Set(
    parseTemperament(breed).map((trait) => trait.toLowerCase()),
  );

  if (traits.size === 0) return [];

  const scored = breeds.flatMap<ScoredBreed>((candidate) => {
    if (candidate.id === breed.id) return [];

    const candidateTraits = parseTemperament(candidate);
    const shared = candidateTraits.filter((trait) =>
      traits.has(trait.toLowerCase()),
    );

    if (shared.length === 0) return [];

    const union = traits.size + candidateTraits.length - shared.length;

    return [{ breed: candidate, shared, ratio: shared.length / union }];
  });

  return scored
    .sort(bySimilarity)
    .slice(0, limit)
    .map(({ breed: match, shared }) => ({ breed: match, shared }));
}
