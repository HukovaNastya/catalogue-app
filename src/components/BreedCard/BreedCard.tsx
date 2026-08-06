import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { Breed } from '../../services/cat/cat.model.ts';
import { FavouriteButton } from '../FavouriteButton/FavouriteButton.tsx';
import { Typography } from '../common/Typography/Typography.tsx';
import { CatIcon } from '../../assets/icons/CatIcon.tsx';
import styles from './BreedCard.module.css';
import {getImageUrl} from "../../utils/helper.ts";

interface BreedCardProps {
  breed: Breed;
}

export function BreedCard({ breed }: BreedCardProps) {
  const imageUrl = getImageUrl(breed);
  // getImageUrl guesses a .jpg URL from reference_image_id, which 404s for
  // some breeds — so a present URL is not a present photo.
  const [failed, setFailed] = useState(false);

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageUrl && !failed ? (
          <img
            className={styles.image}
            src={imageUrl}
            alt={breed.name}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <CatIcon className={styles.placeholderIcon} />
            <Typography as="span" variant="small">
              No photo
            </Typography>
          </div>
        )}
      </div>
      <FavouriteButton
        className={styles.favourite}
        breedId={breed.id}
        breedName={breed.name}
      />

      <div>
        <Typography variant="cardTitle">
          <Link
            className={styles.link}
            to="/breeds/$breedId"
            params={{ breedId: breed.id }}
          >
            {breed.name}
          </Link>
        </Typography>
        <p className={styles.origin}>{breed.origin}</p>
      </div>
      <div className={styles.ratings}>
        <Typography as="span" variant="small" tone="muted" className={styles.rating}>
          kids {breed.child_friendly}
        </Typography>
        <Typography as="span" variant="small" tone="muted" className={styles.rating}>
          energy {breed.energy_level}
        </Typography>
      </div>
    </article>
  );
}
