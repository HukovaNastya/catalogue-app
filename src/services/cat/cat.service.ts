import type { Breed, CatImage } from './cat.model.ts';
import { API_BASE_URL } from '../const.ts';

const IMAGES_PER_BREED = 8;

export async function getBreeds(): Promise<Breed[]> {
  const response = await fetch(`${API_BASE_URL}/breeds`);

  if (!response.ok) {
    throw new Error(`Failed to fetch breeds: ${response.status}`);
  }

  return response.json();
}

export async function getBreedById(breedId: string): Promise<Breed> {
  const response = await fetch(`${API_BASE_URL}/breeds/${breedId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch breed "${breedId}": ${response.status}`);
  }

  return response.json();
}

export async function getBreedImages(breedId: string): Promise<CatImage[]> {
  const params = new URLSearchParams({
    breed_ids: breedId,
    limit: String(IMAGES_PER_BREED),
    order: 'ASC',
  });

  const response = await fetch(`${API_BASE_URL}/images/search?${params}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch images for "${breedId}": ${response.status}`,
    );
  }

  return response.json();
}
