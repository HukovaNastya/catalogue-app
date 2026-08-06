import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useBreeds } from '../../hooks/useBreeds.ts'
import { useBreedsParams } from '../../hooks/useBreedsParams.ts'
import { useFavourites } from '../../hooks/useFavourites.ts'
import { BreedList } from '../../components/BreedList/BreedList.tsx'
import { Button } from '../../components/common/Button/Button.tsx'
import { Pagination } from '../../components/common/Pagination/Pagination.tsx'
import { Typography } from '../../components/common/Typography/Typography.tsx'
import { clampPage, getTotalPages, paginate } from '../../utils/pagination.ts'
import styles from './FavouritesPage.module.css'

const PER_PAGE = 10

export function FavouritesPage() {
  const { data: breeds, isLoading, isError, error } = useBreeds()
  const { ids, clear } = useFavourites()
  const { page, setPage } = useBreedsParams()

  // Mapping over `ids` rather than filtering `breeds` keeps the store's order —
  // most recently saved first — and drops ids the API no longer returns.
  const saved = useMemo(() => {
    if (!breeds) return []
    const byId = new Map(breeds.map((breed) => [breed.id, breed]))
    return ids.flatMap((id) => {
      const breed = byId.get(id)
      return breed ? [breed] : []
    })
  }, [breeds, ids])

  const totalCount = saved.length
  const currentPage = clampPage(page, getTotalPages(totalCount, PER_PAGE))
  const visibleBreeds = paginate(saved, currentPage, PER_PAGE)

  return (
    <>
      <Typography variant="heading" className={styles.heading}>
        Favourites
      </Typography>

      {isLoading && <p>Loading breeds…</p>}
      {isError && (
        <p>Something went wrong while loading breeds: {error.message}</p>
      )}

      {breeds && (
        <>
          <div className={styles.bar}>
            <p className={styles.count} aria-live="polite">
              {totalCount} saved {totalCount === 1 ? 'breed' : 'breeds'}
            </p>
            {totalCount > 0 && (
              <Button className={styles.clear} onClick={clear}>
                Clear all
              </Button>
            )}
          </div>

          {totalCount === 0 ? (
            <div className={styles.empty}>
              <p>No favourites yet.</p>
              <p className={styles.hint}>
                Tap the ♡ on any breed to save it here.
              </p>
              <Link className={styles.browse} to="/breeds">
                Browse breeds
              </Link>
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
    </>
  )
}
