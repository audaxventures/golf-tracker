import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rounds = await prisma.round.findMany({
      include: {
        course: true,
        tee: true,
        holes: { select: { approachResult: true, putts: true, teeResult: true, par: true, score: true, scoreDiff: true } },
      },
      orderBy: { datePlayed: 'desc' },
    })

    return NextResponse.json(rounds)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { courseId, teeId, datePlayed, temperature, windSpeed, conditions, notes } = body

    const round = await prisma.round.create({
      data: {
        courseId,
        teeId,
        datePlayed: new Date(datePlayed),
        temperature: temperature ? parseInt(temperature) : null,
        windSpeed,
        conditions,
        notes,
      },
      include: { course: true, tee: true },
    })

    return NextResponse.json(round, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create round' }, { status: 500 })
  }
}
