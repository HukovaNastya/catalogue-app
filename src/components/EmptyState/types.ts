import type { Breed } from '../../services/cat/cat.model.ts';
import type { BreedFilters, FilterKey } from '../../utils/filterBreeds.ts';

export interface ClearHandlers {
  onClearFilter: (key: FilterKey) => void;
  onClearFilters: () => void;
  onClearQuery: () => void;
}

export interface EmptyStateProps extends ClearHandlers {
  breeds: Breed[];
  filters: BreedFilters;
}

export interface ExplanationProps extends ClearHandlers {
  filters: BreedFilters;
  blocking: FilterKey[];
  queryMatches: boolean;
}
