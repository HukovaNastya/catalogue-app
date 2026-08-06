import type { CatImage } from '../services/cat/cat.model.ts';

export const THUMB_SLOTS = 4;

export interface ThumbSlot {
  photo: CatImage;
  index: number;
  isActive: boolean;
  isOverflow: boolean;
  overflowCount: number;
  label: string;
}

export function buildThumbSlots(
  images: CatImage[],
  activeIndex: number,
  breedName: string,
): ThumbSlot[] {
  const total = images.length;
  const count = Math.min(total, THUMB_SLOTS);

  return images.slice(0, count).map((image, position) => {
    const isOverflow = total > THUMB_SLOTS && position === count - 1;
    const index = isOverflow ? Math.max(activeIndex, count - 1) : position;
    const isActive = index === activeIndex;
    const showCount = isOverflow && !isActive;

    return {
      photo: isOverflow ? images[index] : image,
      index,
      isActive,
      isOverflow,
      overflowCount: showCount ? total - THUMB_SLOTS + 1 : 0,
      label: showCount
        ? `Show all ${total} photos of ${breedName}`
        : isOverflow
          ? `Open photo ${index + 1} of ${total} of ${breedName} full size`
          : `Show photo ${index + 1} of ${total} of ${breedName}`,
    };
  });
}
