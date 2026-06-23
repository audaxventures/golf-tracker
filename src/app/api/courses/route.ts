import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        tees: true,
        rounds: { select: { id: true, totalScore: true, tee: { select: { par: true } } } },
      },
      orderBy: { name: 'asc' },
    })

    const result = courses.map(course => {
      const completedRounds = course.rounds.filter(r => r.totalScore != null)
      const avgScore = completedRounds.length
        ? completedRounds.reduce((sum, r) => sum + (r.totalScore! - (r.tee.par ?? 72)), 0) / completedRounds.length
        : null
      return {
        id: course.id,
        name: course.name,
        city: course.city,
        province: course.province,
        country: course.country,
        roundsPlayed: course.rounds.length,
        avgScoreVsPar: avgScore,
        tees: course.tees,
      }
    })

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, city, province, country, tee, holes } = body

    const course = await prisma.course.create({
      data: {
        name,
        city,
        province,
        country: country ?? 'Canada',
        tees: {
          create: {
            name: tee.name,
            rating: parseFloat(tee.rating),
            slope: parseInt(tee.slope),
            par: parseInt(tee.par ?? 72),
            yardage: tee.yardage ? parseInt(tee.yardage) : null,
            holes: holes?.length
              ? {
                  create: holes.map((h: { holeNumber: number; par: number; yardage: number; handicap?: number }) => ({
                    holeNumber: h.holeNumber,
                    par: h.par,
                    yardage: h.yardage,
                    handicap: h.handicap,
                  })),
                }
              : undefined,
          },
        },
      },
      include: { tees: { include: { holes: true } } },
    })

    return NextResponse.json(course, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
