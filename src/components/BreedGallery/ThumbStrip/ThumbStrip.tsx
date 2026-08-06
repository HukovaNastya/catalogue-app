import { useEffect, useRef } from 'react';
import { wrapIndex } from '../../../utils/helper.ts';
import { THUMB_SLOTS } from '../../../utils/thumbSlots.ts';
import type { ThumbSlot } from '../../../utils/thumbSlots.ts';
import { Button } from '../../common/Button/Button.tsx';
import { PhotoFallback } from '../../common/PhotoFallback/PhotoFallback.tsx';
import styles from './ThumbStrip.module.css';

interface ThumbStripProps {
  slots: ThumbSlot[];
  activeIndex: number;
  total: number;
  failedUrls: ReadonlySet<string>;
  /** False while the lightbox is open — it runs its own arrows. */
  arrowsEnabled: boolean;
  onFail: (url: string) => void;
  /** Move the selection, from a tile or from an arrow key. */
  onStep: (index: number) => void;
  /** Open the lightbox on a photo the strip cannot show. */
  onOpen: (index: number) => void;
}

/**
 * The tile strip and its counter. Owns keyboard navigation, because it owns
 * the focus that navigation moves.
 */
export function ThumbStrip({
  slots,
  activeIndex,
  total,
  failedUrls,
  arrowsEnabled,
  onFail,
  onStep,
  onOpen,
}: ThumbStripProps) {
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stripRef = useRef<HTMLUListElement>(null);

  // Arrow keys walk the strip, moving the selection and the big photo together.
  // Bound to the document rather than to this subtree: on load focus is still
  // on <body>, so a handler on the wrapper would not fire until something in
  // here had been clicked or tabbed into focus.
  useEffect(() => {
    if (!arrowsEnabled) return;

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

      onStep(next);
      // Every photo past the strip is represented by that last slot.
      if (inStrip) thumbRefs.current[Math.min(next, slots.length - 1)]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, arrowsEnabled, onStep, slots.length, total]);

  return (
    <>
      <ul ref={stripRef} className={styles.thumbs}>
        {slots.map((slot, position) => (
          // Keyed by position, not id: slots are positional and fixed-length,
          // so this keeps one <img> per slot and swapping the overflow photo
          // re-points src instead of remounting and re-fetching.
          <li key={position}>
            <Button
              variant="bare"
              ref={(node) => {
                thumbRefs.current[position] = node;
              }}
              className={styles.thumb}
              // Roving tabindex: one Tab stop for the whole strip. Exactly one
              // slot is active, the overflow one included.
              tabIndex={slot.isActive ? 0 : -1}
              aria-current={slot.isActive ? 'true' : undefined}
              aria-label={slot.label}
              onClick={() =>
                slot.isOverflow ? onOpen(slot.index) : onStep(position)
              }
            >
              {failedUrls.has(slot.photo.url) ? (
                // No label: the button's aria-label already says which photo
                // this tile stands for.
                <PhotoFallback className={styles.thumbFallback} />
              ) : (
                <img
                  className={styles.thumbImage}
                  src={slot.photo.url}
                  alt=""
                  loading="lazy"
                  onError={() => onFail(slot.photo.url)}
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
  );
}

/** Holds the strip's space while the photos are still loading. */
export function ThumbStripSkeleton() {
  return (
    <ul className={styles.thumbs} aria-hidden="true">
      {Array.from({ length: THUMB_SLOTS }, (_, index) => (
        <li key={index} className={styles.skeleton} />
      ))}
    </ul>
  );
}
