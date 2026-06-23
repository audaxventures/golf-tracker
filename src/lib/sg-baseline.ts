// PGA Tour baseline lookup — derived from Mark Broadie's "Every Shot Counts"
// Values = expected strokes to hole out from that distance/lie

export const PUTTING_BASELINE: Record<number, number> = {
  1: 1.00, 2: 1.01, 3: 1.08, 4: 1.15, 5: 1.20, 6: 1.24, 7: 1.28, 8: 1.32,
  9: 1.36, 10: 1.41, 11: 1.44, 12: 1.47, 13: 1.50, 14: 1.53, 15: 1.55,
  16: 1.58, 17: 1.60, 18: 1.62, 19: 1.64, 20: 1.65, 21: 1.67, 22: 1.68,
  23: 1.70, 24: 1.71, 25: 1.72, 30: 1.77, 35: 1.81, 40: 1.85, 45: 1.88,
  50: 1.91, 60: 1.95, 70: 1.98, 80: 2.01, 90: 2.03, 100: 2.05,
}

export const FAIRWAY_BASELINE: Record<number, number> = {
  50: 2.40, 60: 2.48, 70: 2.55, 80: 2.60, 90: 2.65, 100: 2.70,
  110: 2.74, 120: 2.77, 130: 2.79, 140: 2.81, 150: 2.83, 160: 2.86,
  170: 2.89, 180: 2.92, 190: 2.95, 200: 2.97, 210: 2.99, 220: 3.01,
  230: 3.04, 240: 3.07, 250: 3.10, 260: 3.13, 270: 3.17, 280: 3.20,
  290: 3.23, 300: 3.27, 320: 3.34, 340: 3.41, 360: 3.49, 380: 3.56,
  400: 3.64, 420: 3.72, 440: 3.79, 460: 3.86, 480: 3.92, 500: 3.98,
}

export const ROUGH_BASELINE: Record<number, number> = {
  50: 2.54, 60: 2.62, 70: 2.68, 80: 2.73, 90: 2.78, 100: 2.83,
  110: 2.87, 120: 2.90, 130: 2.93, 140: 2.96, 150: 2.99, 160: 3.02,
  170: 3.05, 180: 3.08, 190: 3.11, 200: 3.14, 210: 3.17, 220: 3.20,
  230: 3.23, 240: 3.26, 250: 3.29, 260: 3.32, 270: 3.35, 280: 3.38,
  290: 3.41, 300: 3.45, 320: 3.52, 340: 3.59, 360: 3.67, 380: 3.74,
  400: 3.81, 420: 3.88, 440: 3.95, 460: 4.01, 480: 4.07, 500: 4.13,
}

export const BUNKER_BASELINE: Record<number, number> = {
  10: 2.60, 15: 2.68, 20: 2.73, 25: 2.78, 30: 2.82, 40: 2.90, 50: 2.97,
  60: 3.05, 70: 3.12, 80: 3.19, 90: 3.26, 100: 3.32, 120: 3.44,
  140: 3.55, 160: 3.66, 180: 3.77, 200: 3.87,
}

export const RECOVERY_BASELINE: Record<number, number> = {
  50: 2.80, 75: 2.95, 100: 3.10, 125: 3.25, 150: 3.40, 175: 3.55, 200: 3.70,
}

export function interpolateBaseline(
  table: Record<number, number>,
  distance: number
): number {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b)
  if (distance <= keys[0]) return table[keys[0]]
  if (distance >= keys[keys.length - 1]) return table[keys[keys.length - 1]]

  const lower = keys.filter(k => k <= distance).pop()!
  const upper = keys.filter(k => k > distance)[0]
  const ratio = (distance - lower) / (upper - lower)
  return table[lower] + ratio * (table[upper] - table[lower])
}

export function getPuttingBaseline(feet: number): number {
  return interpolateBaseline(PUTTING_BASELINE, feet)
}

export function getShotBaseline(
  yards: number,
  lie: 'fairway' | 'rough' | 'bunker' | 'recovery' | 'tee'
): number {
  const table =
    lie === 'fairway' || lie === 'tee' ? FAIRWAY_BASELINE :
    lie === 'rough' ? ROUGH_BASELINE :
    lie === 'bunker' ? BUNKER_BASELINE :
    RECOVERY_BASELINE
  return interpolateBaseline(table, yards)
}
