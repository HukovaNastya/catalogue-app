import type {Breed} from "../services/cat/cat.model.ts";

export function getImageUrl(breed: Breed): string | undefined {
    if (breed.image?.url) return breed.image.url;
    if (breed.reference_image_id) {
        return `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
    }
    return undefined;
}