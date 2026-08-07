import { useMemo } from 'react';
import { Explanation } from './Explanation/Explanation.tsx';
import {
  findBlockingFilters,
  matchesQueryOnly,
} from '../../../utils/filterBreeds.ts';
import type { EmptyStateProps } from './types.ts';
import styles from './EmptyState.module.css';

export function EmptyState({
  breeds,
  filters,
  onClearFilter,
  onClearFilters,
  onClearQuery,
}: EmptyStateProps) {
  const { blocking, queryMatches } = useMemo(
    () => ({
      blocking: findBlockingFilters(breeds, filters),
      queryMatches: matchesQueryOnly(breeds, filters),
    }),
    [breeds, filters],
  );

  return (
    <div className={styles.root}>
      <Explanation
        filters={filters}
        blocking={blocking}
        queryMatches={queryMatches}
        onClearFilter={onClearFilter}
        onClearFilters={onClearFilters}
        onClearQuery={onClearQuery}
      />
    </div>
  );
}
