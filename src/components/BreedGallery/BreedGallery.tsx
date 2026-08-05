import { useEffect, useRef, useState } from 'react';
import type { CatImage } from '../../services/cat/cat.model.ts';
import { wrapIndex } from '../../utils/helper.ts';
import { Button } from '../Button/Button.tsx';
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
      // Walks every photo, including the ones behind the "+N" tile — the
      // strip's last slot follows along to show where you are.
      const step = event.key === 'ArrowLeft' ? -1 : 1;
      const next = wrapIndex(activeIndex + step, total);

      setActiveIndex(next);
      // Every photo past the strip is represented by that last slot.
      if (inStrip) thumbRefs.current[Math.min(next, thumbCount - 1)]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isLoading, lightboxIndex, thumbCount, total]);

  // Warm the neighbours: arrowing reaches photos the strip never rendered, so
  // without this the big photo blanks while the next one downloads.
  useEffect(() => {
    if (total < 2) return;
    for (const step of [-1, 1]) {
      const neighbour = images[wrapIndex(activeIndex + step, total)];
      if (neighbour) new Image().src = neighbour.url;
    }
  }, [activeIndex, images, total]);

  if (!active) return null;

  const hasOverflow = total > THUMB_SLOTS;
  const lastSlot = thumbCount - 1;
  // Sticks at the 4th photo until the active one moves past it.
  const overflowIndex = Math.max(activeIndex, lastSlot);

  return (
    <div className={styles.media}>
      <Button
        variant="bare"
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
      </Button>

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
            {images.slice(0, thumbCount).map((image, slot) => {
              const isOverflowSlot = hasOverflow && slot === lastSlot;
              const photoIndex = isOverflowSlot ? overflowIndex : slot;
              const photo = isOverflowSlot ? images[photoIndex] : image;
              const isActive = photoIndex === activeIndex;
              // "+N" only while the tile still stands in for the rest of the set.
              const showCount = isOverflowSlot && !isActive;

              return (
                // Keyed by slot, not id: slots are positional and fixed-length,
                // so this keeps one <img> per slot and swapping the overflow
                // photo re-points src instead of remounting and re-fetching.
                <li key={slot}>
                  <Button
                    variant="bare"
                    ref={(node) => {
                      thumbRefs.current[slot] = node;
                    }}
                    className={styles.thumb}
                    // Roving tabindex: one Tab stop for the whole strip. Exactly
                    // one slot is active, the overflow one included.
                    tabIndex={isActive ? 0 : -1}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() =>
                      isOverflowSlot
                        ? setLightboxIndex(photoIndex)
                        : setActiveIndex(slot)
                    }
                    aria-label={
                      showCount
                        ? `Show all ${total} photos of ${breedName}`
                        : isOverflowSlot
                          ? `Open photo ${photoIndex + 1} of ${total} of ${breedName} full size`
                          : `Show photo ${photoIndex + 1} of ${total} of ${breedName}`
                    }
                  >
                    <img
                      className={styles.thumbImage}
                      src={photo.url}
                      alt=""
                      loading="lazy"
                    />
                    {showCount && (
                      <span className={styles.more} aria-hidden="true">
                        +{total - THUMB_SLOTS + 1}
                      </span>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
          <p className={styles.hint}>
            {/* Live, because the big photo's alt changing announces nothing. */}
            <span aria-live="polite">
              {activeIndex + 1} / {total}
            </span>
            <span aria-hidden="true"> · ← → to move</span>
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
