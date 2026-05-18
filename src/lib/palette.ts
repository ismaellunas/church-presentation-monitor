export interface Swatch {
  name: string;
  value: string;
}

export const CURRENT_TIME_SWATCHES: Swatch[] = [
  { name: 'Gray', value: '#3f3f46' },
  { name: 'Slate', value: '#1e293b' },
  { name: 'Navy', value: '#0c1e3e' },
  { name: 'Forest', value: '#0f2e1c' },
  { name: 'Maroon', value: '#3b0d12' },
  { name: 'Black', value: '#000000' },
];

export const COUNTDOWN_SWATCHES: Swatch[] = [
  { name: 'Black', value: '#000000' },
  { name: 'Slate', value: '#0f172a' },
  { name: 'Forest', value: '#0f2e1c' },
];

/** Color thresholds and palette for countdown text. */
export const COUNTDOWN_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
} as const;

export const CURRENT_TIME_TEXT_COLOR = '#ef4444';
