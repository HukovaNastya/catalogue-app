import type { Breed } from './cat.model.ts';
import {API_BASE_URL, API_KEY} from "../const.ts";

export async function getBreeds(): Promise<Breed[]> {
  const response = await fetch(`${API_BASE_URL}/breeds`, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch breeds: ${response.status}`);
  }

  return response.json();
}

export async function getBreedById(breedId: string): Promise<Breed> {
  const response = await fetch(`${API_BASE_URL}/breeds/${breedId}`, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch breed "${breedId}": ${response.status}`);
  }

  return response.json();
}
