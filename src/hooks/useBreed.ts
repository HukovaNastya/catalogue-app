import { useQuery } from '@tanstack/react-query';
import { breedQuery } from '../services/cat/cat.queries.ts';

export function useBreed(breedId: string) {
  return useQuery({
    ...breedQuery(breedId),
  });
}
