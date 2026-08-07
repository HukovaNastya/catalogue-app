import type {Breed, CatImage} from "../services/cat/cat.model.ts";

export function getImageUrl(breed: Breed): string | undefined {
    if (breed.image?.url) return breed.image.url;
    if (breed.reference_image_id) {
        return `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
    }
    return undefined;
}

export function parseTemperament(breed: Breed): string[] {
  if (!breed.temperament) return [];

  return breed.temperament
    .split(',')
    .map((trait) => trait.trim())
    .filter(Boolean);
}

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function galleryImages(breed: Breed, images: CatImage[]): CatImage[] {
  const url = getImageUrl(breed);
  if (!url) return images;

  const reference: CatImage = {
    id: breed.reference_image_id ?? breed.id,
    url,
    width: 0,
    height: 0,
  };

  return [reference, ...images.filter((image) => image.id !== reference.id)];
}