import { Link, useLocation } from 'react-router-dom';
import type { Breed } from '../../services/cat/cat.model.ts';
import styles from './BreedCard.module.css';
import {getImageUrl} from "../../utils/helper.ts";

interface BreedCardProps {
  breed: Breed;
}

export function BreedCard({ breed }: BreedCardProps) {
  const imageUrl = getImageUrl(breed);
  const location = useLocation();

  return (
    <Link
      className={styles.link}
      to={`/breeds/${breed.id}`}
      state={{ from: location.search }}
    >
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <>
            <img
              className={styles.image}
              src={imageUrl}
              alt={breed.name}
              loading="lazy"
            />
          </>
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </div>
      <div>
         <h2 className={styles.name}>{breed.name}</h2>
         <p className={styles.origin}>{breed.origin}</p>
      </div>
      <div className={styles.ratings}>
        <span className={styles.rating}>kids {breed.child_friendly}</span>
        <span className={styles.rating}>energy {breed.energy_level}</span>
      </div>
    </article>
    </Link>
  );
}
