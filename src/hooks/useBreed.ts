import { useQuery, useQueryClient } from '@tanstack/react-query';
import { breedQuery } from '../services/cat/cat.queries.ts';
import type { Breed } from '../services/cat/cat.model.ts';

export function useBreed(breedId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    ...breedQuery(breedId),
    // Stays in the hook rather than in the shared options: it needs the query
    // client, which a plain options object has no access to.
    initialData: () =>
      queryClient
          .getQueryData<Breed[]>(['breeds'])
        ?.find((breed) => breed.id === breedId),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(['breeds'])?.dataUpdatedAt,
  });
}
