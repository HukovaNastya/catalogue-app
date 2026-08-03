 import { Link, useLocation, useParams } from 'react-router-dom'
import { useBreed } from '../../hooks/useBreed.ts'
import { getImageUrl } from '../../utils/helper.ts'
import styles from './BreedPage.module.css'

const RATING_LABELS: Record<string, string> = {
  affection_level: 'Affection',
  child_friendly: 'Good with kids',
  dog_friendly: 'Good with dogs',
  energy_level: 'Energy',
  grooming: 'Grooming',
  vocalisation: 'Vocalisation',
}

export function BreedPage() {
  const { breedId = '' } = useParams()
  const location = useLocation()
  const { data: breed, isLoading, isError, error } = useBreed(breedId)

  const backSearch = (location.state as { from?: string } | null)?.from ?? ''
  const backLink = (
    <Link className={styles.back} to={`/breeds${backSearch}`}>
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

  const imageUrl = getImageUrl(breed)
  const temperament = breed.temperament ? breed.temperament.split(', ') : []

  return (
    <article className={styles.page}>
      {backLink}

      <header className={styles.header}>
        {imageUrl && (
          <img className={styles.image} src={imageUrl} alt={breed.name} />
        )}
        <div className={styles.summary}>
          <h1 className={styles.name}>{breed.name}</h1>
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
        <h2>Living with a {breed.name}</h2>
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
    </article>
  )
}
