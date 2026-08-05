import { useMemo } from 'react'
import { useBreeds } from '../../hooks/useBreeds.ts'
import { useBreedsParams } from '../../hooks/useBreedsParams.ts'
import { useBreedFilters } from '../../hooks/useBreedFilters.ts'
import { BreedList } from '../../components/BreedList/BreedList.tsx'
import { BreedFilters } from '../../components/BreedFilters/BreedFilters.tsx'
import { FilterChips } from '../../components/FilterChips/FilterChips.tsx'
import { Button } from '../../components/Button/Button.tsx'
import { Pagination } from '../../components/Pagination/Pagination.tsx'
import { Select } from '../../components/Select/Select.tsx'
import { Typography } from '../../components/Typography/Typography.tsx'
import {
  applyBreedFilters,
  filterLabel,
  findBlockingFilters,
  matchesQueryOnly,
  SORT_OPTIONS,
} from '../../utils/filterBreeds.ts'
import { clampPage, getTotalPages, paginate } from '../../utils/pagination.ts'
import styles from './BreedsPage.module.css'

const PER_PAGE = 9;

export function BreedsPage() {
  const { data: breeds, isLoading, isError, error } = useBreeds()
  const { page, setQuery, setPage } = useBreedsParams()
  const { filters, setFilters, clearFilter, clearFilters } = useBreedFilters()

  const matches = useMemo(
    () => applyBreedFilters(breeds ?? [], filters),
    [breeds, filters],
  )

  const origins = useMemo(
    () => [...new Set((breeds ?? []).map((breed) => breed.origin))].sort(),
    [breeds],
  )

  // Only worth computing when there is an empty result to explain.
  const explanation = useMemo(() => {
    if (matches.length > 0 || !breeds) return null

    return {
      blocking: findBlockingFilters(breeds, filters),
      queryMatches: matchesQueryOnly(breeds, filters),
    }
  }, [matches, breeds, filters])

  const totalCount = matches.length
  const currentPage = clampPage(page, getTotalPages(totalCount, PER_PAGE))
  const visibleBreeds = paginate(matches, currentPage, PER_PAGE)

  return (
    <div className={styles.layout}>
      <Typography variant="heading" srOnly>
        Breeds
      </Typography>

      <aside className={styles.sidebar}>
        <Typography variant="cardTitle" className={styles.sidebarTitle}>
          Filters
        </Typography>
        <BreedFilters
          value={filters}
          onChange={setFilters}
          origins={origins}
        />
      </aside>

      <div className={styles.results}>
        {isLoading && <p>Loading breeds…</p>}
        {isError && (
          <p>Something went wrong while loading breeds: {error.message}</p>
        )}

        {breeds && (
          <>
            <div className={styles.bar}>
              <Typography className={styles.count} aria-live="polite">
                {totalCount} of {breeds.length} breeds
              </Typography>

              <FilterChips filters={filters} onClear={clearFilter} />

              <label className={styles.sort}>
                Sort
                <Select
                  value={filters.sort}
                  className={styles.sortSelect}
                  onValueChange={(sort) =>
                    setFilters({ sort: sort === 'name-desc' ? sort : 'name' })
                  }
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            {totalCount === 0 ? (
              <div className={styles.empty}>
                <EmptyState
                  filters={filters}
                  blocking={explanation?.blocking ?? []}
                  queryMatches={explanation?.queryMatches ?? false}
                  onClearFilter={clearFilter}
                  onClearFilters={clearFilters}
                  onClearQuery={() => setQuery('')}
                />
              </div>
            ) : (
              <BreedList breeds={visibleBreeds} />
            )}

            <Pagination
              className={styles.pagination}
              totalCount={totalCount}
              currentPage={currentPage}
              perPage={PER_PAGE}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  filters: ReturnType<typeof useBreedFilters>['filters']
  blocking: ReturnType<typeof findBlockingFilters>
  queryMatches: boolean
  onClearFilter: (key: ReturnType<typeof findBlockingFilters>[number]) => void
  onClearFilters: () => void
  onClearQuery: () => void
}

function EmptyState({
  filters,
  blocking,
  queryMatches,
  onClearFilter,
  onClearFilters,
  onClearQuery,
}: EmptyStateProps) {
  // A named filter is only honest when something actually matches the search
  // term — otherwise the term itself is what found nothing.
  if (blocking.length > 0 && (filters.q === '' || queryMatches)) {
    const named = blocking.map((key) => filterLabel(filters, key)).join(' or ')

    return (
      <>
        <p>
          {filters.q
            ? `“${filters.q}” exists, but it is filtered out by ${named}.`
            : `No breeds match ${named}.`}
        </p>
        <div className={styles.emptyActions}>
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
    )
  }

  if (filters.q && !queryMatches) {
    return (
      <>
        <p>No breeds match “{filters.q}”.</p>
        <Button variant="primary" onClick={onClearQuery}>
          Clear search
        </Button>
      </>
    )
  }

  // Nothing single-handedly to blame: only the combination excludes everything.
  return (
    <>
      <p>No breeds match these filters.</p>
      <Button variant="primary" onClick={onClearFilters}>
        Clear filters
      </Button>
    </>
  )
}
