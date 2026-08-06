import { useMemo } from 'react';
import type { Breed } from '../../services/cat/cat.model.ts';
import { useBreeds } from '../../hooks/useBreeds.ts';
import { findSimilarBreeds } from '../../utils/similarBreeds.ts';
import { Typography } from '../common/Typography/Typography.tsx';
import { SimilarBreedChip } from './SimilarBreedChip.tsx';
import styles from './SimilarBreeds.module.css';

const SIMILAR_LIMIT = 3;

interface SimilarBreedsProps {
  breed: Breed;
}

export function SimilarBreeds({ breed }: SimilarBreedsProps) {
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
        {matches.map(({ breed: match, shared }) => (
          <li key={match.id}>
            <SimilarBreedChip breed={match} shared={shared} />
          </li>
        ))}
      </ul>
    </section>
  );
}
