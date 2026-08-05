import { useMemo } from 'react'
import { useBreeds } from '../../hooks/useBreeds.ts'
import { useBreedsParams } from '../../hooks/useBreedsParams.ts'
import { BreedList } from '../../components/BreedList/BreedList.tsx'
import { Button } from '../../components/Button/Button.tsx'
import { Pagination } from '../../components/Pagination/Pagination.tsx'
import { filterBreeds } from '../../utils/filterBreeds.ts'
import { clampPage, getTotalPages, paginate } from '../../utils/pagination.ts'
import styles from './BreedsPage.module.css'

const PER_PAGE = 12

export function BreedsPage() {
  const { data: breeds, isLoading, isError, error } = useBreeds()
  const { q, page, setQuery, setPage } = useBreedsParams()

  const matches = useMemo(
    () => (breeds ? filterBreeds(breeds, q) : []),
    [breeds, q],
  )

  const totalCount = matches.length
  const currentPage = clampPage(page, getTotalPages(totalCount, PER_PAGE))
  const visibleBreeds = paginate(matches, currentPage, PER_PAGE)

  return (
    <>
      <h1 className={styles.heading}>Breeds</h1>

      {isLoading && <p>Loading breeds…</p>}
      {isError && (
        <p>Something went wrong while loading breeds: {error.message}</p>
      )}

      {breeds && (
        <>
          <p className={styles.count} aria-live="polite">
            {totalCount} of {breeds.length} breeds
          </p>

          {totalCount === 0 ? (
            <div className={styles.empty}>
              <p>No breeds match “{q}”.</p>
              <Button variant="primary" onClick={() => setQuery('')}>
                Clear search
              </Button>
            </div>
          ) : (
            <BreedList breeds={visibleBreeds} />
          )}

          <Pagination
            totalCount={totalCount}
            currentPage={currentPage}
            perPage={PER_PAGE}
            onChange={setPage}
          />
        </>
      )}
    </>
  )
}
