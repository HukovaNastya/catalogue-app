import { clsx } from 'clsx';
import { useFavourites } from '../../hooks/useFavourites.ts';
import { Button } from '../Button/Button.tsx';
import styles from './FavouriteButton.module.css';

interface FavouriteButtonProps {
  breedId: string;
  breedName: string;
  withLabel?: boolean;
  className?: string;
}

export function FavouriteButton({
  breedId,
  breedName,
  withLabel = false,
  className,
}: FavouriteButtonProps) {
  const { isFavourite, toggle } = useFavourites();
  const isSaved = isFavourite(breedId);

  return (
    <Button
      variant="bare"
      className={clsx(styles.button, className)}
      aria-pressed={isSaved}
      aria-label={
        isSaved
          ? `Remove ${breedName} from favourites`
          : `Add ${breedName} to favourites`
      }
      onClick={() => toggle(breedId)}
    >
      <span className={styles.icon} aria-hidden="true">
        {isSaved ? '♥' : '♡'}
      </span>
      {withLabel && <span>{isSaved ? 'Saved' : 'Save'}</span>}
    </Button>
  );
}
