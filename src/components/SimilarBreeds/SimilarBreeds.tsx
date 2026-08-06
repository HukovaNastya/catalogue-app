import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import type { Breed } from '../../services/cat/cat.model.ts';
import { useBreeds } from '../../hooks/useBreeds.ts';
import { getImageUrl } from '../../utils/helper.ts';
import { findSimilarBreeds } from '../../utils/similarBreeds.ts';
import { Typography } from '../common/Typography/Typography.tsx';
import styles from './SimilarBreeds.module.css';

const SIMILAR_LIMIT = 3;

interface SimilarBreedsProps {
  breed: Breed;
}

export function SimilarBreeds({ breed }: SimilarBreedsProps) {
  // Usually a cache hit — anyone arriving from the list already has it. On a
  // deep link this fetches, and the section just stays hidden until it lands.
  const { data: breeds } = useBreeds();

  const matches = useMemo(
    () => (breeds ? findSimilarBreeds(breed, breeds, SIMILAR_LIMIT) : []),
    [breed, breeds],
  );

  if (matches.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <Typography variant="section" className={styles.heading}>
          Similar breeds
        </Typography>
        <p className={styles.by}>by temperament</p>
      </div>

      <ul className={styles.list}>
        {matches.map(({ breed: match, shared }) => {
          const imageUrl = getImageUrl(match);

          return (
            <li key={match.id}>
              <Link
                className={styles.chip}
                to="/breeds/$breedId"
                params={{ breedId: match.id }}
                // No `search` prop: retainSearchParams on the root route
                // carries q and page over, so "Back to results" still lands on
                // the page you came from after hopping between breeds.
              >
                {imageUrl ? (
                  <img
                    className={styles.thumb}
                    src={imageUrl}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.thumb} aria-hidden="true" />
                )}
                <span className={styles.text}>
                  <span className={styles.name}>{match.name}</span>
                  <span className={styles.shared}>
                    Also {shared.slice(0, 2).join(' · ').toLowerCase()}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
