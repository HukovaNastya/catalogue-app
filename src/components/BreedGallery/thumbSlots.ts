import type { CatImage } from '../../services/cat/cat.model.ts';

/** Tiles in the strip. The last one doubles as the "+N" overflow tile. */
export const THUMB_SLOTS = 4;

/** One tile in the strip, with every decision about it already made. */
export interface ThumbSlot {
  photo: CatImage;
  /** Index into `images` — not the tile's position, for the overflow tile. */
  index: number;
  isActive: boolean;
  isOverflow: boolean;
  /** How many photos the "+N" tile stands for; 0 when it shows a photo. */
  overflowCount: number;
  label: string;
}

/**
 * Lays out the strip: one entry per visible tile, with the overflow tile
 * standing in for every photo past the fourth.
 */
export function buildThumbSlots(
  images: CatImage[],
  activeIndex: number,
  breedName: string,
): ThumbSlot[] {
  const total = images.length;
  const count = Math.min(total, THUMB_SLOTS);

  return images.slice(0, count).map((image, position) => {
    const isOverflow = total > THUMB_SLOTS && position === count - 1;
    // The overflow tile sticks at the 4th photo until the active one moves
    // past it.
    const index = isOverflow ? Math.max(activeIndex, count - 1) : position;
    const isActive = index === activeIndex;
    // "+N" only while the tile still stands in for the rest of the set.
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
