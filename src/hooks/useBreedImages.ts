import { useQuery } from '@tanstack/react-query';
import { breedImagesQuery } from '../services/cat/cat.queries.ts';

export function useBreedImages(breedId: string) {
  return useQuery(breedImagesQuery(breedId));
}
