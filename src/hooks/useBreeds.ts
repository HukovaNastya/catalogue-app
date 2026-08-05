import { useQuery } from '@tanstack/react-query';
import { breedsQuery } from '../services/cat/cat.queries.ts';

export function useBreeds() {
  return useQuery(breedsQuery());
}
