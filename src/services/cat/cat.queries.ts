import { queryOptions } from '@tanstack/react-query';
import { getBreedById, getBreedImages, getBreeds } from './cat.service.ts';

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
