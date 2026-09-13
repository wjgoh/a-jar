export type BlockKind = 'locked' | 'movable' | 'refill';
export type Weight = 'light' | 'medium' | 'heavy';

export interface Block {
  id: string;
  day: Day;
  time: string;
  label: string;
  kind: BlockKind;
  weight: Weight;
  durationMin: number;
}

export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const INITIAL_BLOCKS: Block[] = [
  // Mon
  { id: 'mon-class', day: 'Mon', time: '9:00', label: 'Class', kind: 'locked', weight: 'medium', durationMin: 120 },
  { id: 'mon-study', day: 'Mon', time: '15:00', label: 'Study', kind: 'movable', weight: 'medium', durationMin: 60 },
  { id: 'mon-sleep', day: 'Mon', time: '23:00', label: 'Sleep', kind: 'refill', weight: 'light', durationMin: 480 },
  // Tue (hero red day)
  { id: 'tue-shift', day: 'Tue', time: '9:00', label: 'Shift', kind: 'locked', weight: 'heavy', durationMin: 360 },
  { id: 'tue-essay', day: 'Tue', time: '14:00', label: 'Essay 2000 words', kind: 'movable', weight: 'heavy', durationMin: 120 },
  { id: 'tue-laundry', day: 'Tue', time: '17:00', label: 'Laundry', kind: 'movable', weight: 'light', durationMin: 45 },
  { id: 'tue-drawing', day: 'Tue', time: '19:00', label: 'Drawing', kind: 'refill', weight: 'light', durationMin: 60 },
  // Wed
  { id: 'wed-class', day: 'Wed', time: '13:00', label: 'Class', kind: 'locked', weight: 'light', durationMin: 60 },
  // Thu
  { id: 'thu-exam', day: 'Thu', time: '10:00', label: 'Exam', kind: 'locked', weight: 'heavy', durationMin: 120 },
  // Sat
  { id: 'sat-hangout', day: 'Sat', time: '14:00', label: 'Hangout', kind: 'refill', weight: 'light', durationMin: 120 },
  { id: 'sat-errand', day: 'Sat', time: '11:00', label: 'Groceries', kind: 'movable', weight: 'light', durationMin: 45 },
  // Sun
  { id: 'sun-hobby', day: 'Sun', time: '16:00', label: 'Sketching', kind: 'refill', weight: 'light', durationMin: 60 },
  { id: 'sun-reading', day: 'Sun', time: '10:00', label: 'Reading', kind: 'movable', weight: 'light', durationMin: 45 },
];

export const JAR_BEFORE = {
  value: 94,
  state: 'full' as const,
  heaviest: 'mental',
  why: 'Full because work + study same day.',
};

export const JAR_AFTER = {
  value: 71,
  state: 'filling' as const,
  heaviest: 'mental',
  why: 'Better — essay moved to green Wed morning, drawing kept.',
};

export const BREAKDOWN: string[] = [
  '2h heavy study = 40',
  '6h shift = 30',
  '-1h drawing = -15',
  'fried yesterday = +10',
  '= 94% mental',
];

export const FIX = {
  trigger: 'Urgent shift cover Tue',
  moves: [{ from: 'Tue 14:00 essay', to: 'Wed 10:00' }, { from: 'Tue laundry', to: 'Fri 11:00' }],
  keep: ['Tue 19:00 drawing'],
  before: 94,
  after: 71,
  reason: 'Heavy essay out of red Tue into green Wed, errand to light Fri, refill protected.',
};

export const SPLIT = [
  { label: 'Outline 30m', day: 'Mon' as Day, time: '16:30' },
  { label: 'Draft 1h', day: 'Wed' as Day, time: '11:30' },
  { label: 'Polish 45m', day: 'Thu' as Day, time: '15:00' },
];

export type MorningTag = 'light' | 'okay' | 'heavy' | 'fried';
export type NightTag = 'drained' | 'meh' | 'good' | 'great';

export interface DotDay {
  morning: MorningTag | null;
  night: NightTag | null;
}

// Static fake history: 2 past weeks (14 nights: 9 green, 3 red, 2 skipped)
export const DOTS_HISTORY: DotDay[] = [
  { morning: 'okay', night: 'good' },
  { morning: 'heavy', night: 'drained' },
  { morning: 'light', night: 'great' },
  { morning: null, night: null },
  { morning: 'okay', night: 'good' },
  { morning: 'heavy', night: 'drained' },
  { morning: 'light', night: 'good' },
  { morning: 'okay', night: 'meh' },
  { morning: 'light', night: 'great' },
  { morning: null, night: null },
  { morning: 'okay', night: 'good' },
  { morning: 'fried', night: 'drained' },
  { morning: 'light', night: 'good' },
  { morning: 'okay', night: 'great' },
];

export const INITIAL_WEEK: DotDay[] = [
  { morning: 'heavy', night: null },
  { morning: 'fried', night: null },
  { morning: null, night: null },
  { morning: null, night: null },
  { morning: null, night: null },
  { morning: null, night: null },
  { morning: null, night: null },
];

export const DOTS_CAPTION = 'You go green after drawing 4/5 times, kept it.';
export const DOTS_RECEIPT = 'work+study drained you 3/3 last times';
