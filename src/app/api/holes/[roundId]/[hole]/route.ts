import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateHoleSG } from '@/lib/sg-calculator'

type Params = { params: Promise<{ roundId: string; hole: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { roundId, hole } = await params
    const holeStats = await prisma.holeStats.findUnique({
      where: { roundId_holeNumber: { roundId, holeNumber: parseInt(hole) } },
    })
    return NextResponse.json(holeStats ?? null)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch hole' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { roundId, hole } = await params
    const holeNumber = parseInt(hole)
    const body = await request.json()

    const scoreDiff = (body.score ?? 0) - (body.par ?? 4)

    // Upsert hole stats
    const holeStats = await prisma.holeStats.upsert({
      where: { roundId_holeNumber: { roundId, holeNumber } },
      create: {
        roundId,
        holeNumber,
        par: body.par ?? 4,
        score: body.score ?? body.par ?? 4,
        scoreDiff,
        ...sanitizeHoleData(body),
      },
      update: {
        score: body.score ?? body.par ?? 4,
        scoreDiff,
        ...sanitizeHoleData(body),
      },
    })

    // Calculate SG
    const sg = calculateHoleSG(holeStats, holeStats.par)

    // Update SG on hole
    const updatedHole = await prisma.holeStats.update({
      where: { id: holeStats.id },
      data: {
        sgOffTee: sg.sgOffTee,
        sgApproach: sg.sgApproach,
        sgAroundGreen: sg.sgAroundGreen,
        sgPutting: sg.sgPutting,
        sgTotal: sg.sgTotal,
      },
    })

    // Recompute round totals from all saved holes
    const allHoles = await prisma.holeStats.findMany({ where: { roundId } })

    const totalScore = allHoles.reduce((s, h) => s + h.score, 0)
    const totalPutts = allHoles.reduce((s, h) => s + h.putts, 0)
    const fairwaysHit = allHoles.filter(h => h.teeResult === 'fairway' && h.par >= 4).length
    const fairwaysAvailable = allHoles.filter(h => h.par >= 4).length
    const girsHit = allHoles.filter(h => h.approachResult === 'gir').length
    const girsAvailable = allHoles.length
    const penalties = allHoles.reduce((s, h) => s + h.penalties, 0)
    const sgOffTee = allHoles.reduce((s, h) => s + (h.sgOffTee ?? 0), 0)
    const sgApproach = allHoles.reduce((s, h) => s + (h.sgApproach ?? 0), 0)
    const sgAroundGreen = allHoles.reduce((s, h) => s + (h.sgAroundGreen ?? 0), 0)
    const sgPutting = allHoles.reduce((s, h) => s + (h.sgPutting ?? 0), 0)
    const sgTotal = sgOffTee + sgApproach + sgAroundGreen + sgPutting
    const isComplete = allHoles.length === 18

    const updatedRound = await prisma.round.update({
      where: { id: roundId },
      data: {
        totalScore,
        totalPutts,
        fairwaysHit,
        fairwaysAvailable,
        girsHit,
        girsAvailable,
        penalties,
        sgOffTee,
        sgApproach,
        sgAroundGreen,
        sgPutting,
        sgTotal,
        isComplete,
      },
    })

    return NextResponse.json({ hole: updatedHole, round: updatedRound })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to save hole' }, { status: 500 })
  }
}

function sanitizeHoleData(body: Record<string, unknown>) {
  const fields = [
    'par', 'teeClub', 'teeResult', 'teeShape', 'teeDistance', 'teeOnPar3',
    'approachClub', 'approachDistance', 'approachLie', 'approachResult', 'approachProximity',
    'shortGameShots', 'shortGameClub', 'shortGameDistance', 'shortGameLie', 'shortGameProximity',
    'fromBunker', 'bunkerType', 'bunkerLie', 'bunkerResult', 'bunkerProximity',
    'putts', 'firstPuttDistance', 'firstPuttResult', 'secondPuttDistance', 'threePutt',
    'penalties', 'penaltyType', 'layUp', 'holeNotes',
  ]
  const result: Record<string, unknown> = {}
  for (const f of fields) {
    if (f in body) result[f] = body[f]
  }
  return result
}
