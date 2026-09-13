// Single time model for the week planner: every block has a start ("9:00")
// plus durationMin. Rendered in one 12h dialect, days sorted by start.

export type DayPart = 'morning' | 'afternoon' | 'evening';

export const PARTS: { id: DayPart; label: string; time: string }[] = [
  { id: 'morning', label: 'Morning', time: '9:00' },
  { id: 'afternoon', label: 'Afternoon', time: '14:00' },
  { id: 'evening', label: 'Evening', time: '19:00' },
];

/** "9:30" -> 570. */
export function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** 540 -> "9:00". */
export function fromMin(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function twelve(min: number): { h: string; suffix: 'am' | 'pm' } {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const suffix = h24 < 12 ? 'am' : 'pm';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { h: `${h12}:${m.toString().padStart(2, '0')}`, suffix };
}

/** 540 -> "9:00am". */
export function fmtT(min: number): string {
  const t = twelve(min);
  return `${t.h}${t.suffix}`;
}

/** ("14:00", 120) -> "2:00–4:00pm". One dialect everywhere. */
export function fmtRange(start: string, durMin: number): string {
  const s = toMin(start);
  const e = s + durMin;
  const a = twelve(s);
  const b = twelve(e);
  if (a.suffix === b.suffix) return `${a.h}–${b.h}${b.suffix}`;
  return `${a.h}${a.suffix}–${b.h}${b.suffix}`;
}

export function partOf(t: string): DayPart {
  const m = toMin(t);
  if (m < 12 * 60) return 'morning';
  if (m < 17 * 60) return 'afternoon';
  return 'evening';
}

/** 60 -> "1h", 45 -> "45m", 90 -> "1h 30m". */
export function fmtDur(durMin: number): string {
  const h = Math.floor(durMin / 60);
  const m = durMin % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}
