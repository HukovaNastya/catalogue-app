import { Button } from '../Button/Button.tsx';
import { CloseIcon } from '../../../assets/icons/CloseIcon.tsx';
import { activeFilterKeys, filterLabel } from '../../../utils/filterBreeds.ts';
import type { BreedFilters, FilterKey } from '../../../utils/filterBreeds.ts';
import styles from './FilterChips.module.css';

interface FilterChipsProps {
  filters: BreedFilters;
  onClear: (key: FilterKey) => void;
}

export function FilterChips({ filters, onClear }: FilterChipsProps) {
  const keys = activeFilterKeys(filters).filter((key) => key !== 'q');

  if (keys.length === 0) return null;

  return (
    <ul className={styles.list}>
      {keys.map((key) => (
        <li key={key} className={styles.chip}>
          {filterLabel(filters, key)}
          <Button
            variant="bare"
            className={styles.remove}
            aria-label={`Remove ${filterLabel(filters, key)} filter`}
            onClick={() => onClear(key)}
          >
            <CloseIcon />
          </Button>
        </li>
      ))}
    </ul>
  );
}
