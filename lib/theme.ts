export const C = {
  bg: '#FAF9F7',
  card: '#FFFFFF',
  ink: '#18181B',
  sub: '#71717A',
  line: '#E4E4E7',
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  orange: '#EA580C',
  red: '#DC2626',
  redSoft: '#FEE2E2',
  purple: '#9333EA',
  dark: '#18181B',
};

export function jarColor(value: number): string {
  if (value < 70) return C.green;
  if (value < 90) return C.orange;
  if (value <= 100) return C.red;
  return C.purple;
}
