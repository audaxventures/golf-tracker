export function calculateScoreDifferential(
  grossScore: number,
  courseRating: number,
  slopeRating: number
): number {
  return (113 / slopeRating) * (grossScore - courseRating)
}
