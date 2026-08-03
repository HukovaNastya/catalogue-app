export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface BreedWeight {
  imperial: string;
  metric: string;
}

export interface Breed {
  id: string;
  name: string;
  origin: string;
  description: string;
  temperament: string;
  life_span: string;
  weight: BreedWeight;
  wikipedia_url?: string;
  cfa_url?: string;
  reference_image_id?: string;
  image?: CatImage;
  affection_level: number;
  child_friendly: number;
  dog_friendly: number;
  energy_level: number;
  grooming: number;
  vocalisation: number;
  hypoallergenic: number;
  rare: number;
}
