import { Button } from '../../../common/Button/Button.tsx';
import { filterLabel } from '../../../../utils/filterBreeds.ts';
import type { ExplanationProps } from '../types.ts';
import styles from './Explanation.module.css';

export function Explanation({
  filters,
  blocking,
  queryMatches,
  onClearFilter,
  onClearFilters,
  onClearQuery,
}: ExplanationProps) {
  if (blocking.length > 0 && (filters.q === '' || queryMatches)) {
    const named = blocking.map((key) => filterLabel(filters, key)).join(' or ');

    return (
      <>
        <p>
          {filters.q
            ? `“${filters.q}” exists, but it is filtered out by ${named}.`
            : `No breeds match ${named}.`}
        </p>
        <div className={styles.actions}>
          {blocking.map((key) => (
            <Button
              key={key}
              variant="primary"
              onClick={() => onClearFilter(key)}
            >
              Clear {filterLabel(filters, key)}
            </Button>
          ))}
        </div>
      </>
    );
  }

  if (filters.q && !queryMatches) {
    return (
      <>
        <p>No breeds match “{filters.q}”.</p>
        <Button variant="primary" onClick={onClearQuery}>
          Clear search
        </Button>
      </>
    );
  }

  return (
    <>
      <p>No breeds match these filters.</p>
      <Button variant="primary" onClick={onClearFilters}>
        Clear filters
      </Button>
    </>
  );
}
