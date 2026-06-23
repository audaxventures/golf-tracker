import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        tees: { include: { holes: { orderBy: { holeNumber: 'asc' } } } },
        rounds: {
          include: {
            tee: true,
            holes: { orderBy: { holeNumber: 'asc' } },
          },
          orderBy: { datePlayed: 'desc' },
        },
      },
    })

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    // Per-hole averages across all completed rounds
    const completedRounds = course.rounds.filter(r => r.isComplete)
    const holeAverages: Record<number, { totalScore: number; count: number; totalVsPar: number }> = {}

    for (const round of completedRounds) {
      for (const hole of round.holes) {
        if (!holeAverages[hole.holeNumber]) {
          holeAverages[hole.holeNumber] = { totalScore: 0, count: 0, totalVsPar: 0 }
        }
        holeAverages[hole.holeNumber].totalScore += hole.score
        holeAverages[hole.holeNumber].totalVsPar += hole.scoreDiff
        holeAverages[hole.holeNumber].count += 1
      }
    }

    const perHoleAverages = Object.entries(holeAverages).map(([hole, data]) => ({
      holeNumber: parseInt(hole),
      avgScore: data.totalScore / data.count,
      avgVsPar: data.totalVsPar / data.count,
      count: data.count,
    })).sort((a, b) => a.holeNumber - b.holeNumber)

    const scores = completedRounds.map(r => r.totalScore).filter(Boolean) as number[]
    const pars = completedRounds.map(r => r.tee.par)

    return NextResponse.json({
      ...course,
      stats: {
        roundsPlayed: course.rounds.length,
        bestScore: scores.length ? Math.min(...scores) : null,
        bestScoreVsPar: scores.length
          ? Math.min(...completedRounds.map((r, i) => (r.totalScore ?? 999) - (pars[i] ?? 72)))
          : null,
        avgScoreVsPar: scores.length
          ? scores.reduce((s, score, i) => s + score - (pars[i] ?? 72), 0) / scores.length
          : null,
      },
      perHoleAverages,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}
