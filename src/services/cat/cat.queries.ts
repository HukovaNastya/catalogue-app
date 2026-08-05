import { queryOptions } from '@tanstack/react-query';
import { getBreedById, getBreedImages, getBreeds } from './cat.service.ts';

// Shared by the hooks and by the route loaders that prefetch them. Keeping the
// keys in one place is what stops a loader from warming a cache entry that no
// component ever reads.

// Breed data is reference material that does not change between sessions, so a
// generous staleTime keeps hover-preloading from refiring on every pass over
// the grid.
const REFERENCE_DATA_STALE_TIME = 5 * 60 * 1000;

export const breedsQuery = () =>
  queryOptions({
    queryKey: ['breeds'],
    queryFn: getBreeds,
    staleTime: REFERENCE_DATA_STALE_TIME,
  });

export const breedQuery = (breedId: string) =>
  queryOptions({
    queryKey: ['breed', breedId],
    queryFn: () => getBreedById(breedId),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });

export const breedImagesQuery = (breedId: string) =>
  queryOptions({
    queryKey: ['breed', breedId, 'images'],
    queryFn: () => getBreedImages(breedId),
    staleTime: REFERENCE_DATA_STALE_TIME,
  });
