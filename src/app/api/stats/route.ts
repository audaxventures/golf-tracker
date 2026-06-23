import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  scoringAverage, girPercent, fairwayPercent, scramblingPercent,
  sandSavePercent, puttsPerRound, puttsPerGIR, threePuttPercent,
  avgFirstPuttDistance, avgProximityOnGIR, parBreakdown,
  approachByDistanceBand, puttMakeByDistance, missTendency, sgByRound,
} from '@/lib/stat-aggregator'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = parseInt(searchParams.get('range') ?? '10')

    const rounds = await prisma.round.findMany({
      where: { isComplete: true },
      include: { holes: true, tee: true, course: true },
      orderBy: { datePlayed: 'desc' },
      take: range,
    })

    const allHoles = rounds.flatMap(r => r.holes)

    return NextResponse.json({
      rounds: rounds.length,
      scoringAverage: scoringAverage(allHoles),
      girPercent: girPercent(allHoles),
      fairwayPercent: fairwayPercent(allHoles),
      scramblingPercent: scramblingPercent(allHoles),
      sandSavePercent: sandSavePercent(allHoles),
      puttsPerRound: puttsPerRound(allHoles),
      puttsPerGIR: puttsPerGIR(allHoles),
      threePuttPercent: threePuttPercent(allHoles),
      avgFirstPuttDistance: avgFirstPuttDistance(allHoles),
      avgProximityOnGIR: avgProximityOnGIR(allHoles),
      parBreakdown: parBreakdown(allHoles),
      approachByDistanceBand: approachByDistanceBand(allHoles),
      puttMakeByDistance: puttMakeByDistance(allHoles),
      missTendency: missTendency(allHoles),
      sgByRound: sgByRound(rounds),
      sgTotals: {
        offTee: rounds.reduce((s, r) => s + (r.sgOffTee ?? 0), 0) / (rounds.length || 1),
        approach: rounds.reduce((s, r) => s + (r.sgApproach ?? 0), 0) / (rounds.length || 1),
        aroundGreen: rounds.reduce((s, r) => s + (r.sgAroundGreen ?? 0), 0) / (rounds.length || 1),
        putting: rounds.reduce((s, r) => s + (r.sgPutting ?? 0), 0) / (rounds.length || 1),
        total: rounds.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / (rounds.length || 1),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
