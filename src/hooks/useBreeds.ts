import { useQuery } from '@tanstack/react-query';
import { getBreeds } from '../services/cat/cat.service.ts';

export function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: getBreeds,
  });
}
