import { useEffect, useRef, useState } from 'react';
import type { CatImage } from '../../services/cat/cat.model.ts';
import { wrapIndex } from '../../utils/helper.ts';
import { Button } from '../common/Button/Button.tsx';
import { PhotoFallback } from '../common/PhotoFallback/PhotoFallback.tsx';
import { Lightbox } from '../common/Lightbox/Lightbox.tsx';
import { buildThumbSlots, THUMB_SLOTS } from './thumbSlots.ts';
import styles from './BreedGallery.module.css';

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
  // Keyed by URL, not by index: the arrows move between photos, so which one
  // is broken has to outlive the selection. The first photo is the reference
  // one galleryImages builds from reference_image_id, whose .jpg guess is the
  // likeliest 404 in the set.
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(new Set());
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stripRef = useRef<HTMLUListElement>(null);

  const total = images.length;
  const active = images[activeIndex] ?? images[0];
  // Above the effects: the keyboard one reads slots.length in its dependency
  // array, which is evaluated at the useEffect call rather than when the
  // handler runs.
  const slots = buildThumbSlots(images, activeIndex, breedName);

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
      if (inStrip) thumbRefs.current[Math.min(next, slots.length - 1)]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isLoading, lightboxIndex, slots.length, total]);

  // Warm the neighbours: arrowing reaches photos the strip never rendered, so
  // without this the big photo blanks while the next one downloads.
  useEffect(() => {
    if (total < 2) return;
    for (const step of [-1, 1]) {
      const neighbour = images[wrapIndex(activeIndex + step, total)];
      if (neighbour) new Image().src = neighbour.url;
    }
  }, [activeIndex, images, total]);

  const markFailed = (url: string) =>
    setFailedUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));

  // Missing and failed collapse to one case: either way there is no photo to
  // show or to open full size. Everything else on the page already no-ops on
  // an empty set, so this needs no separate render path.
  const activePhoto = active && !failedUrls.has(active.url) ? active : null;

  return (
    <div className={styles.media}>
      {activePhoto ? (
        <Button
          variant="bare"
          className={styles.imageButton}
          onClick={() => setLightboxIndex(activeIndex)}
          aria-label={`Open photo ${activeIndex + 1} of ${total} of ${breedName} full size`}
          aria-keyshortcuts={total > 1 ? 'ArrowLeft ArrowRight' : undefined}
        >
          <img
            className={styles.image}
            src={activePhoto.url}
            alt={`${breedName} photo ${activeIndex + 1} of ${total}`}
            onError={() => markFailed(activePhoto.url)}
          />
        </Button>
      ) : isLoading ? (
        // Still fetching: a box, not a verdict.
        <div className={styles.imageSkeleton} />
      ) : (
        // Not a button: "open full size" is a promise the lightbox cannot keep
        // for a photo that would not load here either.
        <PhotoFallback className={styles.imageFallback} label="No photo" />
      )}

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
            {slots.map((slot, position) => (
              // Keyed by position, not id: slots are positional and
              // fixed-length, so this keeps one <img> per slot and swapping the
              // overflow photo re-points src instead of remounting and
              // re-fetching.
              <li key={position}>
                <Button
                  variant="bare"
                  ref={(node) => {
                    thumbRefs.current[position] = node;
                  }}
                  className={styles.thumb}
                  // Roving tabindex: one Tab stop for the whole strip. Exactly
                  // one slot is active, the overflow one included.
                  tabIndex={slot.isActive ? 0 : -1}
                  aria-current={slot.isActive ? 'true' : undefined}
                  aria-label={slot.label}
                  onClick={() =>
                    slot.isOverflow
                      ? setLightboxIndex(slot.index)
                      : setActiveIndex(position)
                  }
                >
                  {failedUrls.has(slot.photo.url) ? (
                    // No label: the button's aria-label already says which
                    // photo this tile stands for.
                    <PhotoFallback className={styles.thumbFallback} />
                  ) : (
                    <img
                      className={styles.thumbImage}
                      src={slot.photo.url}
                      alt=""
                      loading="lazy"
                      onError={() => markFailed(slot.photo.url)}
                    />
                  )}
                  {slot.overflowCount > 0 && (
                    <span className={styles.more} aria-hidden="true">
                      +{slot.overflowCount}
                    </span>
                  )}
                </Button>
              </li>
            ))}
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
