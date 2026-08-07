import { useEffect, useRef } from 'react';
import { wrapIndex } from '../../../../utils/helper.ts';
import type { ThumbSlot } from '../../../../utils/thumbSlots.ts';
import { Button } from '../../../common/Button/Button.tsx';
import { PhotoFallback } from '../../../common/PhotoFallback/PhotoFallback.tsx';
import { Typography } from '../../../common/Typography/Typography.tsx';
import styles from './ThumbStrip.module.css';

interface ThumbStripProps {
  slots: ThumbSlot[];
  activeIndex: number;
  total: number;
  failedUrls: ReadonlySet<string>;
  arrowsEnabled: boolean;
  onFail: (url: string) => void;
  onStep: (index: number) => void;
  onOpen: (index: number) => void;
}

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

  useEffect(() => {
    if (!arrowsEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
      }

      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable]')) return;

      event.preventDefault();

      const inStrip = stripRef.current?.contains(target) ?? false;
      const step = event.key === 'ArrowLeft' ? -1 : 1;
      const next = wrapIndex(activeIndex + step, total);

      onStep(next);
      if (inStrip) thumbRefs.current[Math.min(next, slots.length - 1)]?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, arrowsEnabled, onStep, slots.length, total]);

  return (
    <>
      <ul ref={stripRef} className={styles.thumbs}>
        {slots.map((slot, position) => (
          <li key={position}>
            <Button
              variant="bare"
              ref={(node) => {
                thumbRefs.current[position] = node;
              }}
              className={styles.thumb}
              tabIndex={slot.isActive ? 0 : -1}
              aria-current={slot.isActive ? 'true' : undefined}
              aria-label={slot.label}
              onClick={() =>
                slot.isOverflow ? onOpen(slot.index) : onStep(position)
              }
            >
              {failedUrls.has(slot.photo.url) ? (
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
                <Typography
                  as="span"
                  variant="body"
                  className={styles.more}
                  aria-hidden="true"
                >
                  +{slot.overflowCount}
                </Typography>
              )}
            </Button>
          </li>
        ))}
      </ul>
      <Typography variant="small" tone="strong">
        <Typography as="span" variant="small" aria-live="polite">
          {activeIndex + 1} / {total}
        </Typography>
        <Typography as="span" variant="small" aria-hidden="true">
          {' · ← → to move'}
        </Typography>
      </Typography>
    </>
  );
}
