import { useMemo } from 'react'
import { useBreeds } from '../../hooks/useBreeds.ts'
import { useBreedsParams } from '../../hooks/useBreedsParams.ts'
import { useBreedFilters } from '../../hooks/useBreedFilters.ts'
import { BreedList } from '../../components/breed/BreedList/BreedList.tsx'
import { BreedFilters } from '../../components/breed/BreedFilters/BreedFilters.tsx'
import { FilterChips } from '../../components/common/FilterChips/FilterChips.tsx'
import { EmptyState } from '../../components/breed/EmptyState/EmptyState.tsx'
import { Pagination } from '../../components/common/Pagination/Pagination.tsx'
import { Select } from '../../components/common/Select/Select.tsx'
import { Typography } from '../../components/common/Typography/Typography.tsx'
import { applyBreedFilters, SORT_OPTIONS } from '../../utils/filterBreeds.ts'
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

  const totalCount = matches.length
  const currentPage = clampPage(page, getTotalPages(totalCount, PER_PAGE))
  const visibleBreeds = paginate(matches, currentPage, PER_PAGE)

  return (
    <div className={styles.layout}>
      <Typography variant="heading" srOnly>
        Breeds
      </Typography>

      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <Typography variant="cardTitle" className={styles.sidebarTitle}>
            Filters
          </Typography>
          <BreedFilters
            value={filters}
            onChange={setFilters}
            origins={origins}
          />
        </div>
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
              <EmptyState
                breeds={breeds}
                filters={filters}
                onClearFilter={clearFilter}
                onClearFilters={clearFilters}
                onClearQuery={() => setQuery('')}
              />
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
