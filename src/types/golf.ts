export type WindSpeed = 'calm' | 'light' | 'moderate' | 'strong'
export type Conditions = 'dry' | 'wet' | 'soft' | 'firm'
export type TeeResult = 'fairway' | 'rough_left' | 'rough_right' | 'bunker' | 'hazard' | 'ob' | 'trees' | 'other'
export type ShotShape = 'straight' | 'draw' | 'fade' | 'push' | 'pull' | 'hook' | 'slice'
export type ApproachResult = 'gir' | 'missed_short' | 'missed_long' | 'missed_left' | 'missed_right'
export type ApproachLie = 'fairway' | 'rough' | 'bunker' | 'uphill' | 'downhill' | 'sidehill'
export type PuttResult = 'made' | 'left' | 'right' | 'short' | 'long'

export const DEFAULT_BAG_CLUBS = [
  'Driver', '3-Wood', '5-Wood', '4-Hybrid',
  '4-Iron', '5-Iron', '6-Iron', '7-Iron', '8-Iron', '9-Iron',
  'PW', 'GW', 'SW', 'LW', 'Putter',
]
