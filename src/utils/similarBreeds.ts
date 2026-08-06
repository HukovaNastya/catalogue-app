import type { Breed } from '../services/cat/cat.model.ts';
import { parseTemperament } from './helper.ts';

export interface SimilarBreed {
  breed: Breed;
  shared: string[];
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

  return breeds
    .filter((candidate) => candidate.id !== breed.id)
    .map((candidate) => {
      const candidateTraits = parseTemperament(candidate);
      const shared = candidateTraits.filter((trait) =>
        traits.has(trait.toLowerCase()),
      );
      const union = traits.size + candidateTraits.length - shared.length;

      return { breed: candidate, shared, ratio: union > 0 ? shared.length / union : 0 };
    })
    .filter((match) => match.shared.length > 0)
    .sort(
      (a, b) =>
        b.shared.length - a.shared.length ||
        b.ratio - a.ratio ||
        a.breed.name.localeCompare(b.breed.name),
    )
    .slice(0, limit)
    .map(({ breed: match, shared }) => ({ breed: match, shared }));
}
