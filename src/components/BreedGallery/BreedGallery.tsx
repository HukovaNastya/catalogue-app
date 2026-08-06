import { useEffect, useState } from 'react';
import type { CatImage } from '../../services/cat/cat.model.ts';
import { wrapIndex } from '../../utils/helper.ts';
import { Button } from '../common/Button/Button.tsx';
import { PhotoFallback } from '../common/PhotoFallback/PhotoFallback.tsx';
import { Lightbox } from '../common/Lightbox/Lightbox.tsx';
import { buildThumbSlots } from '../../utils/thumbSlots.ts';
import { ThumbStrip, ThumbStripSkeleton } from './ThumbStrip/ThumbStrip.tsx';
import styles from './BreedGallery.module.css';

interface BreedGalleryProps {
  images: CatImage[];
  breedName: string;
  isLoading?: boolean;
}

export function BreedGallery({
  images,
  breedName,
  isLoading = false,
}: BreedGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(new Set());

  const total = images.length;
  const active = images[activeIndex] ?? images[0];
  const slots = buildThumbSlots(images, activeIndex, breedName);

  useEffect(() => {
    if (total < 2) return;
    for (const step of [-1, 1]) {
      const neighbour = images[wrapIndex(activeIndex + step, total)];
      if (neighbour) new Image().src = neighbour.url;
    }
  }, [activeIndex, images, total]);

  const markFailed = (url: string) =>
    setFailedUrls((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));

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
        <div className={styles.imageSkeleton} />
      ) : (
        <PhotoFallback className={styles.imageFallback} label="No photo" />
      )}

      {isLoading ? (
        <ThumbStripSkeleton />
      ) : (
        total > 1 && (
          <ThumbStrip
            slots={slots}
            activeIndex={activeIndex}
            total={total}
            failedUrls={failedUrls}
            arrowsEnabled={lightboxIndex === null}
            onFail={markFailed}
            onStep={setActiveIndex}
            onOpen={setLightboxIndex}
          />
        )
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          breedName={breedName}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={(index) => {
            setLightboxIndex(index);
            setActiveIndex(index);
          }}
        />
      )}
    </div>
  );
}
