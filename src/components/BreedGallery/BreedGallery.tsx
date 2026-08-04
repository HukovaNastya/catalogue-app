import { useRef, useState } from 'react';
import type { CatImage } from '../../services/cat/cat.model.ts';
import { wrapIndex } from '../../utils/helper.ts';
import { Lightbox } from '../Lightbox/Lightbox.tsx';
import styles from './BreedGallery.module.css';

/** Tiles in the strip. The last one doubles as the "+N" overflow tile. */
const THUMB_SLOTS = 4;

interface BreedGalleryProps {
  images: CatImage[];
  breedName: string;
  isLoading?: boolean;
}

/**
 * Owns which photo is showing. Mount it with `key={breed.id}` so switching
 * breeds resets back to the first photo.
 */
export function BreedGallery({
  images,
  breedName,
  isLoading = false,
}: BreedGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stripRef = useRef<HTMLUListElement>(null);

  const total = images.length;
  const active = images[activeIndex] ?? images[0];

  if (!active) return null;

  const thumbCount = Math.min(total, THUMB_SLOTS);
  const hasOverflow = total > THUMB_SLOTS;

  // Arrow keys walk the strip, moving the selection and the big photo together.
  // Focus only follows when it is already on a thumb: arrowing from the big
  // photo should leave you there, so Enter still opens what you are looking at.
  const moveActive = (step: number, moveFocus: boolean) => {
    const from = activeIndex < thumbCount ? activeIndex : 0;
    const next = wrapIndex(from + step, thumbCount);
    setActiveIndex(next);
    if (moveFocus) thumbRefs.current[next]?.focus();
  };

  return (
    // Listening here rather than on the strip is what lets the arrows work
    // while the big photo has focus, which is where Tab lands you first.
    <div
      className={styles.media}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        // The lightbox sits inside this div, so its own arrow keys would
        // bubble up here and advance the photo a second time.
        if (lightboxIndex !== null || isLoading || total < 2) return;

        event.preventDefault();
        const inStrip = stripRef.current?.contains(event.target as Node) ?? false;
        moveActive(event.key === 'ArrowLeft' ? -1 : 1, inStrip);
      }}
    >
      <button
        type="button"
        className={styles.imageButton}
        onClick={() => setLightboxIndex(activeIndex)}
        aria-label={`Open photo ${activeIndex + 1} of ${total} of ${breedName} full size`}
        aria-keyshortcuts={total > 1 ? 'ArrowLeft ArrowRight' : undefined}
      >
        <img
          className={styles.image}
          src={active.url}
          alt={`${breedName} photo ${activeIndex + 1} of ${total}`}
        />
      </button>

      {isLoading && (
        <ul className={styles.thumbs} aria-hidden="true">
          {Array.from({ length: THUMB_SLOTS }, (_, index) => (
            <li key={index} className={styles.skeleton} />
          ))}
        </ul>
      )}

      {!isLoading && total > 1 && (
        <>
          <ul ref={stripRef} className={styles.thumbs}>
            {images.slice(0, THUMB_SLOTS).map((image, index) => {
              const isOverflowTile = hasOverflow && index === THUMB_SLOTS - 1;
              const isActive = index === activeIndex;

              return (
                <li key={image.id}>
                  <button
                    type="button"
                    ref={(node) => {
                      thumbRefs.current[index] = node;
                    }}
                    className={styles.thumb}
                    // Roving tabindex: one Tab stop for the whole strip.
                    tabIndex={
                      isActive || (activeIndex >= thumbCount && index === 0)
                        ? 0
                        : -1
                    }
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() =>
                      isOverflowTile
                        ? setLightboxIndex(index)
                        : setActiveIndex(index)
                    }
                    aria-label={
                      isOverflowTile
                        ? `Show all ${total} photos of ${breedName}`
                        : `Show photo ${index + 1} of ${total} of ${breedName}`
                    }
                  >
                    <img
                      className={styles.thumbImage}
                      src={image.url}
                      alt=""
                      loading="lazy"
                    />
                    {isOverflowTile && (
                      <span className={styles.more} aria-hidden="true">
                        +{total - THUMB_SLOTS + 1}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className={styles.hint} aria-hidden="true">
            ← → to move
          </p>
        </>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          breedName={breedName}
          onClose={() => setLightboxIndex(null)}
          // Closing leaves the big photo on whatever the lightbox ended on.
          onIndexChange={(index) => {
            setLightboxIndex(index);
            setActiveIndex(index);
          }}
        />
      )}
    </div>
  );
}
