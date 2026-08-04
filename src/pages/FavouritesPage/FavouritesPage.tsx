import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useBreeds } from '../../hooks/useBreeds.ts'
import { useFavourites } from '../../hooks/useFavourites.ts'
import { BreedList } from '../../components/BreedList/BreedList.tsx'
import styles from './FavouritesPage.module.css'

export function FavouritesPage() {
  const { data: breeds, isLoading, isError, error } = useBreeds()
  const { ids, count, clear } = useFavourites()

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

  return (
    <>
      <h1 className={styles.heading}>Favourites</h1>

      {isLoading && <p>Loading breeds…</p>}
      {isError && (
        <p>Something went wrong while loading breeds: {error.message}</p>
      )}

      {breeds && (
        <>
          <div className={styles.bar}>
            <p className={styles.count} aria-live="polite">
              {saved.length} saved {saved.length === 1 ? 'breed' : 'breeds'}
            </p>
            {saved.length > 0 && (
              <button type="button" className={styles.clear} onClick={clear}>
                Clear all
              </button>
            )}
          </div>

          {count === 0 ? (
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
            <BreedList breeds={saved} />
          )}
        </>
      )}
    </>
  )
}
