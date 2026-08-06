import { Link, getRouteApi } from '@tanstack/react-router'
import { useBreed } from '../../hooks/useBreed.ts'
import { useBreedImages } from '../../hooks/useBreedImages.ts'
import { FavouriteButton } from '../../components/FavouriteButton/FavouriteButton.tsx'
import { BreedGallery } from '../../components/BreedGallery/BreedGallery.tsx'
import { SimilarBreeds } from '../../components/SimilarBreeds/SimilarBreeds.tsx'
import { Typography } from '../../components/common/Typography/Typography.tsx'
import { galleryImages, parseTemperament } from '../../utils/helper.ts'
import styles from './BreedPage.module.css'

const RATING_LABELS: Record<string, string> = {
  affection_level: 'Affection',
  child_friendly: 'Good with kids',
  dog_friendly: 'Good with dogs',
  energy_level: 'Energy',
  grooming: 'Grooming',
  vocalisation: 'Vocalisation',
}

const route = getRouteApi('/breeds/$breedId')

export function BreedPage() {
  const { breedId } = route.useParams()
  const { data: breed, isLoading, isError, error } = useBreed(breedId)
  // Fires alongside the breed query rather than after it. Failures stay silent:
  // the reference photo still shows, and the rest of the page is unaffected.
  const { data: images, isLoading: imagesLoading } = useBreedImages(breedId)

  const backLink = (
    <Link className={styles.back} to="/breeds" search={(prev) => prev}>
      ← Back to results
    </Link>
  )

  if (isLoading) {
    return (
      <>
        {backLink}
        <p>Loading breed…</p>
      </>
    )
  }

  if (isError || !breed) {
    return (
      <>
        {backLink}
        <p>Could not load this breed: {error?.message ?? 'not found'}</p>
      </>
    )
  }

  const photos = galleryImages(breed, images ?? [])
  const temperament = parseTemperament(breed)

  return (
    <article className={styles.page}>
      {backLink}

      <header className={styles.header}>
        <BreedGallery
          // Resets back to the first photo when you move between breeds.
          key={breed.id}
          images={photos}
          breedName={breed.name}
          isLoading={imagesLoading}
        />

        <div className={styles.summary}>
          <div className={styles.titleRow}>
            <Typography variant="title">{breed.name}</Typography>
            <FavouriteButton
              breedId={breed.id}
              breedName={breed.name}
              withLabel
            />
          </div>
          <p className={styles.meta}>
            {breed.origin} · {breed.life_span} years · {breed.weight.metric} kg
          </p>
          <p className={styles.description}>{breed.description}</p>

          <ul className={styles.temperament}>
            {temperament.map((trait) => (
              <li key={trait} className={styles.trait}>
                {trait}
              </li>
            ))}
          </ul>

          <p className={styles.links}>
            {breed.wikipedia_url && (
              <a href={breed.wikipedia_url} target="_blank" rel="noreferrer">
                Wikipedia ↗
              </a>
            )}
            {breed.cfa_url && (
              <a href={breed.cfa_url} target="_blank" rel="noreferrer">
                CFA ↗
              </a>
            )}
          </p>
        </div>
      </header>

      <section className={styles.ratings}>
        <Typography variant="section">Living with a {breed.name}</Typography>
        <dl className={styles.ratingList}>
          {Object.entries(RATING_LABELS).map(([key, label]) => {
            const value = breed[key as keyof typeof breed] as number
            return (
              <div key={key} className={styles.rating}>
                <dt className={styles.ratingLabel}>{label}</dt>
                <dd className={styles.ratingValue}>
                  <span
                    className={styles.bar}
                    role="img"
                    aria-label={`${value} out of 5`}
                  >
                    <span
                      className={styles.barFill}
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </span>
                  {value}
                </dd>
              </div>
            )
          })}
        </dl>
        <p className={styles.footnote}>
          Rated 1–5 by The Cat API · higher is more
        </p>
      </section>

      <SimilarBreeds breed={breed} />
    </article>
  )
}
