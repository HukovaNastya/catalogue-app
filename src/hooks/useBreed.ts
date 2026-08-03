import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBreedById } from '../services/cat/cat.service.ts';
import type { Breed } from '../services/cat/cat.model.ts';

export function useBreed(breedId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['breed', breedId],
    queryFn: () => getBreedById(breedId),
    initialData: () =>
      queryClient
        .getQueryData<Breed[]>(['breeds'])
        ?.find((breed) => breed.id === breedId),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(['breeds'])?.dataUpdatedAt,
  });
}
