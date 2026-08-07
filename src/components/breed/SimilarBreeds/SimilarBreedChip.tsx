import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { SimilarBreed } from '../../../utils/similarBreeds.ts';
import { getImageUrl } from '../../../utils/helper.ts';
import { PhotoFallback } from '../../common/PhotoFallback/PhotoFallback.tsx';
import { Typography } from '../../common/Typography/Typography.tsx';
import styles from './SimilarBreeds.module.css';

type SimilarBreedChipProps = SimilarBreed;

export function SimilarBreedChip({ breed, shared }: SimilarBreedChipProps) {
  const imageUrl = getImageUrl(breed);
  const [failed, setFailed] = useState(false);

  return (
    <Link
      className={styles.chip}
      to="/breeds/$breedId"
      params={{ breedId: breed.id }}
    >
      {imageUrl && !failed ? (
        <img
          className={styles.thumb}
          src={imageUrl}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <PhotoFallback className={styles.thumbFallback} />
      )}
      <div className={styles.text}>
        <Typography as="span" variant="body" tone="strong">
          {breed.name}
        </Typography>
        <Typography as="span" variant="small" tone="muted">
          Also {shared.slice(0, 2).join(' · ').toLowerCase()}
        </Typography>
      </div>
    </Link>
  );
}
