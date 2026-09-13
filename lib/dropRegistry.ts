// Bucket drop-zone registry for the week drag.
// Day cards register their Morning/Afternoon/Evening header rows;
// the dragged block measures them once at lift time (scroll is locked
// while dragging, so window coords stay valid for the whole gesture).

import type { View } from 'react-native';

export interface BucketZone {
  key: string; // "Wed:morning"
  y: number;
}

const views = new Map<string, View | null>();

export function regBucket(key: string, el: View | null) {
  if (el) views.set(key, el);
  else views.delete(key);
}

/** Window-space header rows, sorted top to bottom. */
export function measureBuckets(): Promise<BucketZone[]> {
  const entries = [...views.entries()];
  return Promise.all(
    entries.map(
      ([key, el]) =>
        new Promise<BucketZone | null>((res) => {
          if (!el) return res(null);
          try {
            el.measureInWindow((_x, y) => res({ key, y }));
          } catch {
            res(null);
          }
        }),
    ),
  ).then((zs) => zs.filter((z): z is BucketZone => !!z && Number.isFinite(z.y)).sort((a, b) => a.y - b.y));
}

/** Screen Y -> bucket key. Each header owns everything down to the next one. */
export function zoneFor(moveY: number, zones: BucketZone[]): string | null {
  if (zones.length === 0) return null;
  let hit: string | null = null;
  for (const z of zones) {
    if (moveY >= z.y - 8) hit = z.key;
    else break;
  }
  return hit;
}
