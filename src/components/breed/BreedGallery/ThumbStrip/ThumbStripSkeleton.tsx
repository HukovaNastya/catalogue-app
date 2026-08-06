import { THUMB_SLOTS } from '../../../../utils/thumbSlots.ts';
import styles from './ThumbStrip.module.css';

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
