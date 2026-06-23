import { HoleStats } from '@/generated/prisma/client'
import { getShotBaseline, getPuttingBaseline } from './sg-baseline'

export interface HoleSGResult {
  sgOffTee: number | null
  sgApproach: number | null
  sgAroundGreen: number | null
  sgPutting: number | null
  sgTotal: number
}

export function calculateHoleSG(hole: HoleStats, holePar: number): HoleSGResult {
  let sgOffTee: number | null = null
  let sgApproach: number | null = null
  let sgAroundGreen: number | null = null
  let sgPutting: number | null = null

  // SG: Off the Tee (par 4s and 5s only)
  if (holePar >= 4 && hole.teeDistance && hole.teeResult) {
    const startBaseline = getShotBaseline(
      hole.teeDistance + (hole.approachDistance ?? 0),
      'tee'
    )
    const endLie = teeResultToLie(hole.teeResult)
    const endDistance = hole.approachDistance ?? 150
    const endBaseline = getShotBaseline(endDistance, endLie)
    sgOffTee = startBaseline - endBaseline - 1
  }

  // SG: Approach (50+ yards into green)
  if (hole.approachDistance && hole.approachDistance >= 50 && hole.approachLie) {
    const startBaseline = getShotBaseline(
      hole.approachDistance,
      approachLieToLie(hole.approachLie)
    )
    let endBaseline: number
    if (hole.approachResult === 'gir' && hole.approachProximity) {
      endBaseline = getPuttingBaseline(hole.approachProximity)
    } else {
      const chipDist = hole.shortGameDistance ?? 20
      endBaseline = getShotBaseline(chipDist, 'rough')
    }
    sgApproach = startBaseline - endBaseline - 1
  }

  // SG: Around the Green
  if (hole.shortGameShots && hole.shortGameShots > 0 && hole.shortGameDistance) {
    const startBaseline = getShotBaseline(hole.shortGameDistance, 'rough')
    const endBaseline = hole.shortGameProximity
      ? getPuttingBaseline(hole.shortGameProximity)
      : getPuttingBaseline(15)
    sgAroundGreen = startBaseline - endBaseline - hole.shortGameShots
  }

  // SG: Putting
  if (hole.putts > 0 && hole.firstPuttDistance) {
    const startBaseline = getPuttingBaseline(hole.firstPuttDistance)
    sgPutting = startBaseline - hole.putts
  }

  const sgTotal =
    (sgOffTee ?? 0) +
    (sgApproach ?? 0) +
    (sgAroundGreen ?? 0) +
    (sgPutting ?? 0)

  return { sgOffTee, sgApproach, sgAroundGreen, sgPutting, sgTotal }
}

function teeResultToLie(result: string): 'fairway' | 'rough' | 'bunker' | 'recovery' {
  if (result === 'fairway') return 'fairway'
  if (result === 'bunker') return 'bunker'
  if (['ob', 'hazard', 'trees'].includes(result)) return 'recovery'
  return 'rough'
}

function approachLieToLie(lie: string): 'fairway' | 'rough' | 'bunker' {
  if (lie === 'fairway') return 'fairway'
  if (lie === 'bunker') return 'bunker'
  return 'rough'
}
