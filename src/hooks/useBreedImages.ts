import { useQuery } from '@tanstack/react-query';
import { getBreedImages } from '../services/cat/cat.service.ts';

export function useBreedImages(breedId: string) {
  return useQuery({
    queryKey: ['breed', breedId, 'images'],
    queryFn: () => getBreedImages(breedId),
    staleTime: 5 * 60 * 1000,
  });
}
