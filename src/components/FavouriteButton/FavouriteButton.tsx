import { useFavourites } from '../../hooks/useFavourites.ts';
import { Button } from '../Button/Button.tsx';
import styles from './FavouriteButton.module.css';

interface FavouriteButtonProps {
  breedId: string;
  breedName: string;
  /** Renders "Save"/"Saved" next to the heart. Icon-only otherwise. */
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
      className={[styles.button, className].filter(Boolean).join(' ')}
      // aria-pressed is what makes a heart icon legible to a screen reader.
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
