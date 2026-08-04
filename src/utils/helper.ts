import type {Breed, CatImage} from "../services/cat/cat.model.ts";

export function getImageUrl(breed: Breed): string | undefined {
    if (breed.image?.url) return breed.image.url;
    if (breed.reference_image_id) {
        return `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
    }
    return undefined;
}

/** Splits the API's comma-joined temperament string, tolerating loose spacing. */
export function parseTemperament(breed: Breed): string[] {
  if (!breed.temperament) return [];

  return breed.temperament
    .split(',')
    .map((trait) => trait.trim())
    .filter(Boolean);
}

/** Wraps out-of-range indexes back into 0..length-1, in both directions. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  // Double modulo: plain `index % length` leaves -1 negative.
  return ((index % length) + length) % length;
}

/**
 * Puts the breed's reference photo at the front of the gallery. It comes from
 * the already-cached breed, so it paints immediately while the images query is
 * still in flight — without it the header collapses and then jumps.
 */
export function galleryImages(breed: Breed, images: CatImage[]): CatImage[] {
  const url = getImageUrl(breed);
  if (!url) return images;

  const reference: CatImage = {
    id: breed.reference_image_id ?? breed.id,
    url,
    width: 0,
    height: 0,
  };

  // Image search usually returns the reference photo too; drop the duplicate.
  return [reference, ...images.filter((image) => image.id !== reference.id)];
}