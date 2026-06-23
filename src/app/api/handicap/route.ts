import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.handicapEntry.findMany({
      orderBy: { recordedDate: 'desc' },
    })
    return NextResponse.json(entries)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch handicap history' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const entry = await prisma.handicapEntry.create({
      data: {
        handicapIndex: parseFloat(body.handicapIndex),
        recordedDate: new Date(body.recordedDate),
        notes: body.notes ?? null,
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create handicap entry' }, { status: 500 })
  }
}
