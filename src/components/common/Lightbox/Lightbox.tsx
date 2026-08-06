import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { CatImage } from '../../../services/cat/cat.model.ts';
import { wrapIndex } from '../../../utils/helper.ts';
import { Button } from '../Button/Button.tsx';
import styles from './Lightbox.module.css';

interface LightboxProps {
  images: CatImage[];
  index: number;
  breedName: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({
  images,
  index,
  breedName,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const total = images.length;
  const safeIndex = total > 0 ? wrapIndex(index, total) : 0;
  const current = images[safeIndex];

  useEffect(() => {
    if (total < 2) return;
    for (const step of [-1, 1]) {
      const neighbour = images[wrapIndex(safeIndex + step, total)];
      if (neighbour) new Image().src = neighbour.url;
    }
  }, [images, safeIndex, total]);

  if (!current) return null;

  const go = (step: number) => onIndexChange(wrapIndex(safeIndex + step, total));
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={`${breedName} photos`}
      onClose={onClose}
      onKeyDown={(event) => {
        if (total < 2) return;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          go(-1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          go(1);
        }
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
    >
      <div className={styles.inner}>
        <Button
          variant="bare"
          className={clsx(styles.control, styles.close)}
          onClick={close}
          aria-label="Close photos"
        >
          ✕
        </Button>

        {total > 1 && (
          <Button
            variant="bare"
            className={clsx(styles.control, styles.prev)}
            onClick={() => go(-1)}
            aria-label="Previous photo"
          >
            ←
          </Button>
        )}

        <figure className={styles.figure}>
          <img
            className={styles.image}
            src={current.url}
            alt={`${breedName} photo ${safeIndex + 1} of ${total}`}
          />
          <figcaption className={styles.caption} aria-live="polite">
            {safeIndex + 1} / {total}
          </figcaption>
        </figure>

        {total > 1 && (
          <Button
            variant="bare"
            className={clsx(styles.control, styles.next)}
            onClick={() => go(1)}
            aria-label="Next photo"
          >
            →
          </Button>
        )}
      </div>
    </dialog>
  );
}
