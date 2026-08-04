import { useEffect, useRef, useState } from 'react';
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
  const thumbCount = Math.min(total, THUMB_SLOTS);

  // Arrow keys walk the strip, moving the selection and the big photo together.
  // Bound to the document rather than to this subtree: on load focus is still
  // on <body>, so a handler on the wrapper would not fire until something in
  // here had been clicked or tabbed into focus.
  useEffect(() => {
    // The lightbox runs its own arrows while it is open.
    if (isLoading || total < 2 || lightboxIndex !== null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      // Alt+← is browser-back; leave every modifier combination alone.
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      const target = event.target instanceof HTMLElement ? event.target : null;
      // The header search box is on this page too — it needs its caret keys.
      if (target?.closest('input, textarea, select, [contenteditable]')) return;

      event.preventDefault();

      // Focus only follows when it is already on a thumb: arrowing from
      // elsewhere on the page should not yank focus into the strip.
      const inStrip = stripRef.current?.contains(target) ?? false;
      const step = event.key === 'ArrowLeft' ? -1 : 1;
      const from = activeIndex < thumbCount ? activeIndex : 0;
      const next = wrapIndex(from + step, thumbCount);

      setActiveIndex(next);
      if (inStrip) thumbRefs.current[next]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isLoading, lightboxIndex, thumbCount, total]);

  if (!active) return null;

  const hasOverflow = total > THUMB_SLOTS;

  return (
    <div className={styles.media}>
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
