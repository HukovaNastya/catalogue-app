import type { Breed } from '../services/cat/cat.model.ts';
import { parseTemperament } from './helper.ts';

export interface SimilarBreed {
  breed: Breed;
  /** The traits both breeds list, in the candidate's own casing. */
  shared: string[];
}

/**
 * Ranks other breeds by how much of their temperament they share with `breed`.
 * Pure list work against the `['breeds']` cache — no extra endpoint exists for
 * this, and the full list is already loaded by the time anyone gets here.
 */
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
      // Overlap as a share of the two lists combined. Used only to break ties,
      // so a breed sharing 4 of its 5 traits ranks above one sharing 4 of 12 —
      // "similar overall" rather than just "has a long temperament list".
      const union = traits.size + candidateTraits.length - shared.length;

      return { breed: candidate, shared, ratio: union > 0 ? shared.length / union : 0 };
    })
    .filter((match) => match.shared.length > 0)
    .sort(
      (a, b) =>
        b.shared.length - a.shared.length ||
        b.ratio - a.ratio ||
        // Last resort, so the order never depends on how the API sorted them.
        a.breed.name.localeCompare(b.breed.name),
    )
    .slice(0, limit)
    .map(({ breed: match, shared }) => ({ breed: match, shared }));
}
