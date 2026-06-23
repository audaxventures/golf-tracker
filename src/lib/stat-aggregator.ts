import { HoleStats, Round } from '@/generated/prisma/client'

export function scoringAverage(holes: HoleStats[]): number {
  if (!holes.length) return 0
  const totalVsPar = holes.reduce((s, h) => s + h.scoreDiff, 0)
  const rounds = holes.length / 18
  return rounds > 0 ? totalVsPar / rounds : 0
}

export function girPercent(holes: HoleStats[]): number {
  if (!holes.length) return 0
  const girs = holes.filter(h => h.approachResult === 'gir').length
  return (girs / holes.length) * 100
}

export function fairwayPercent(holes: HoleStats[]): number {
  const par45 = holes.filter(h => h.par >= 4 && h.teeResult != null)
  if (!par45.length) return 0
  const hit = par45.filter(h => h.teeResult === 'fairway').length
  return (hit / par45.length) * 100
}

export function scramblingPercent(holes: HoleStats[]): number {
  const missedGir = holes.filter(h => h.approachResult && h.approachResult !== 'gir')
  if (!missedGir.length) return 0
  const upAndDown = missedGir.filter(h => h.scoreDiff <= 0).length
  return (upAndDown / missedGir.length) * 100
}

export function sandSavePercent(holes: HoleStats[]): number {
  const bunker = holes.filter(h => h.fromBunker && h.bunkerType === 'greenside')
  if (!bunker.length) return 0
  const saved = bunker.filter(h => h.scoreDiff <= 0).length
  return (saved / bunker.length) * 100
}

export function puttsPerRound(holes: HoleStats[]): number {
  if (!holes.length) return 0
  const totalPutts = holes.reduce((s, h) => s + h.putts, 0)
  return totalPutts / (holes.length / 18)
}

export function puttsPerGIR(holes: HoleStats[]): number {
  const girHoles = holes.filter(h => h.approachResult === 'gir' && h.putts > 0)
  if (!girHoles.length) return 0
  return girHoles.reduce((s, h) => s + h.putts, 0) / girHoles.length
}

export function threePuttPercent(holes: HoleStats[]): number {
  const withPutts = holes.filter(h => h.putts > 0)
  if (!withPutts.length) return 0
  const threePutts = withPutts.filter(h => h.putts >= 3).length
  return (threePutts / withPutts.length) * 100
}

export function avgFirstPuttDistance(holes: HoleStats[]): number {
  const withDist = holes.filter(h => h.firstPuttDistance != null)
  if (!withDist.length) return 0
  return withDist.reduce((s, h) => s + (h.firstPuttDistance ?? 0), 0) / withDist.length
}

export function avgProximityOnGIR(holes: HoleStats[]): number {
  const gir = holes.filter(h => h.approachResult === 'gir' && h.approachProximity != null)
  if (!gir.length) return 0
  return gir.reduce((s, h) => s + (h.approachProximity ?? 0), 0) / gir.length
}

export function avgApproachDistance(holes: HoleStats[]): number {
  const with_ = holes.filter(h => h.approachDistance != null)
  if (!with_.length) return 0
  return with_.reduce((s, h) => s + (h.approachDistance ?? 0), 0) / with_.length
}

export function parBreakdown(holes: HoleStats[]) {
  return {
    eagles: holes.filter(h => h.scoreDiff <= -2).length,
    birdies: holes.filter(h => h.scoreDiff === -1).length,
    pars: holes.filter(h => h.scoreDiff === 0).length,
    bogeys: holes.filter(h => h.scoreDiff === 1).length,
    doubles: holes.filter(h => h.scoreDiff === 2).length,
    worse: holes.filter(h => h.scoreDiff >= 3).length,
  }
}

export function approachByDistanceBand(holes: HoleStats[]) {
  const bands = [
    { label: '<100', min: 0, max: 99 },
    { label: '100-125', min: 100, max: 125 },
    { label: '125-150', min: 126, max: 150 },
    { label: '150-175', min: 151, max: 175 },
    { label: '175-200', min: 176, max: 200 },
    { label: '200+', min: 201, max: Infinity },
  ]
  return bands.map(({ label, min, max }) => {
    const inBand = holes.filter(h => h.approachDistance != null && h.approachDistance >= min && h.approachDistance <= max)
    const girs = inBand.filter(h => h.approachResult === 'gir')
    const proxHoles = girs.filter(h => h.approachProximity != null)
    return {
      band: label,
      girPct: inBand.length ? (girs.length / inBand.length) * 100 : 0,
      avgProximity: proxHoles.length ? proxHoles.reduce((s, h) => s + (h.approachProximity ?? 0), 0) / proxHoles.length : 0,
      count: inBand.length,
    }
  }).filter(b => b.count > 0)
}

export function puttMakeByDistance(holes: HoleStats[]) {
  const bands = [
    { label: '3-5 ft', min: 3, max: 5 },
    { label: '5-10 ft', min: 6, max: 10 },
    { label: '10-15 ft', min: 11, max: 15 },
    { label: '15-20 ft', min: 16, max: 20 },
    { label: '20-25 ft', min: 21, max: 25 },
    { label: '25+ ft', min: 26, max: Infinity },
  ]
  return bands.map(({ label, min, max }) => {
    const inBand = holes.filter(h => h.firstPuttDistance != null && h.firstPuttDistance >= min && h.firstPuttDistance <= max)
    const made = inBand.filter(h => h.putts === 1 || h.firstPuttResult === 'made').length
    return {
      band: label,
      makePct: inBand.length ? (made / inBand.length) * 100 : 0,
      count: inBand.length,
    }
  }).filter(b => b.count > 0)
}

export function missTendency(holes: HoleStats[]) {
  const teeMisses = holes.filter(h => h.teeResult && h.teeResult !== 'fairway')
  const approaches = holes.filter(h => h.approachResult && h.approachResult !== 'gir')
  const putts = holes.filter(h => h.firstPuttResult && h.firstPuttResult !== 'made')

  return {
    tee: {
      left: teeMisses.filter(h => h.teeResult === 'rough_left').length,
      right: teeMisses.filter(h => h.teeResult === 'rough_right').length,
      other: teeMisses.filter(h => !['rough_left', 'rough_right'].includes(h.teeResult ?? '')).length,
    },
    approach: {
      short: approaches.filter(h => h.approachResult === 'missed_short').length,
      long: approaches.filter(h => h.approachResult === 'missed_long').length,
      left: approaches.filter(h => h.approachResult === 'missed_left').length,
      right: approaches.filter(h => h.approachResult === 'missed_right').length,
    },
    putt: {
      left: putts.filter(h => h.firstPuttResult === 'left').length,
      right: putts.filter(h => h.firstPuttResult === 'right').length,
      short: putts.filter(h => h.firstPuttResult === 'short').length,
      long: putts.filter(h => h.firstPuttResult === 'long').length,
    },
  }
}

export function sgByRound(rounds: (Round & { holes: HoleStats[] })[]) {
  return rounds.map(r => ({
    date: r.datePlayed,
    sgOffTee: r.sgOffTee ?? 0,
    sgApproach: r.sgApproach ?? 0,
    sgAroundGreen: r.sgAroundGreen ?? 0,
    sgPutting: r.sgPutting ?? 0,
    sgTotal: r.sgTotal ?? 0,
  }))
}

export function calculateScoreDifferential(
  grossScore: number,
  courseRating: number,
  slopeRating: number
): number {
  return (113 / slopeRating) * (grossScore - courseRating)
}
