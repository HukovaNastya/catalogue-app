import type { Breed, CatImage } from '../../src/services/cat/cat.model.ts'

interface BreedRow {
  id: string
  name: string
  origin: string
  kids: number
  grooming: number
  hypoallergenic?: 1
  rare?: 1
}

const ROWS: BreedRow[] = [
  { id: 'abys', name: 'Abyssinian', origin: 'Egypt', kids: 4, grooming: 1 },
  { id: 'aege', name: 'Aegean', origin: 'Greece', kids: 4, grooming: 2, rare: 1 },
  { id: 'abob', name: 'American Bobtail', origin: 'United States', kids: 4, grooming: 2 },
  { id: 'bali', name: 'Balinese', origin: 'United States', kids: 4, grooming: 1, hypoallergenic: 1 },
  { id: 'beng', name: 'Bengal', origin: 'United States', kids: 4, grooming: 1 },
  { id: 'birm', name: 'Birman', origin: 'France', kids: 3, grooming: 2 },
  { id: 'bomb', name: 'Bombay', origin: 'Burma', kids: 4, grooming: 2 },
  { id: 'bsho', name: 'British Shorthair', origin: 'United Kingdom', kids: 4, grooming: 3 },
  { id: 'bure', name: 'Burmese', origin: 'Burma', kids: 4, grooming: 1 },
  { id: 'char', name: 'Chartreux', origin: 'France', kids: 3, grooming: 3, rare: 1 },
  { id: 'crex', name: 'Cornish Rex', origin: 'United Kingdom', kids: 4, grooming: 1, hypoallergenic: 1 },
  { id: 'cypr', name: 'Cyprus', origin: 'Cyprus', kids: 5, grooming: 2 },
  { id: 'drex', name: 'Devon Rex', origin: 'United Kingdom', kids: 4, grooming: 1, hypoallergenic: 1 },
  { id: 'dons', name: 'Donskoy', origin: 'Russia', kids: 5, grooming: 1, hypoallergenic: 1 },
  { id: 'emau', name: 'Egyptian Mau', origin: 'Egypt', kids: 4, grooming: 3, rare: 1 },
  { id: 'ebur', name: 'European Burmese', origin: 'Burma', kids: 4, grooming: 2 },
  { id: 'hbro', name: 'Havana Brown', origin: 'United Kingdom', kids: 3, grooming: 2, rare: 1 },
  { id: 'jbob', name: 'Japanese Bobtail', origin: 'Japan', kids: 5, grooming: 2 },
  { id: 'kora', name: 'Korat', origin: 'Thailand', kids: 3, grooming: 2, rare: 1 },
  { id: 'mcoo', name: 'Maine Coon', origin: 'United States', kids: 5, grooming: 3 },
  { id: 'manx', name: 'Manx', origin: 'Isle of Man', kids: 4, grooming: 4 },
  { id: 'nfor', name: 'Norwegian Forest Cat', origin: 'Norway', kids: 3, grooming: 4 },
  { id: 'pers', name: 'Persian', origin: 'Iran', kids: 3, grooming: 5 },
  { id: 'ragd', name: 'Ragdoll', origin: 'United States', kids: 5, grooming: 3 },
  { id: 'sibe', name: 'Siberian', origin: 'Russia', kids: 5, grooming: 2, hypoallergenic: 1 },
]

const TEMPERAMENTS = [
  'Active, Energetic, Intelligent, Gentle',
  'Affectionate, Intelligent, Loyal, Curious',
  'Calm, Gentle, Loyal, Quiet',
]

function toBreed(row: BreedRow, index: number): Breed {
  return {
    id: row.id,
    name: row.name,
    origin: row.origin,
    description: `${row.name} is a fixture breed used by the end-to-end tests.`,
    temperament: TEMPERAMENTS[index % TEMPERAMENTS.length],
    life_span: '12 - 15',
    weight: { imperial: '7 - 10', metric: '3 - 5' },
    wikipedia_url: `https://en.wikipedia.org/wiki/${row.name.replace(/ /g, '_')}`,
    reference_image_id: `${row.id}-ref`,
    affection_level: 5,
    child_friendly: row.kids,
    dog_friendly: 4,
    energy_level: 4,
    grooming: row.grooming,
    vocalisation: 3,
    hypoallergenic: row.hypoallergenic ?? 0,
    rare: row.rare ?? 0,
  }
}

export const BREEDS: Breed[] = ROWS.map(toBreed)

export const TOTAL_BREEDS = BREEDS.length

export function breedById(id: string): Breed | undefined {
  return BREEDS.find((breed) => breed.id === id)
}

export const NAMES_ASC = [...BREEDS]
  .map((breed) => breed.name)
  .sort((a, b) => a.localeCompare(b))

export function breedImages(breedId: string): CatImage[] {
  return Array.from({ length: 4 }, (_, index) => ({
    id: `${breedId}-img-${index}`,
    url: `https://cdn2.thecatapi.com/images/${breedId}-img-${index}.jpg`,
    width: 800,
    height: 600,
  }))
}

export const TWELVE_FAVOURITE_IDS = BREEDS.slice(0, 12).map((breed) => breed.id)
