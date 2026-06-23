import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const round = await prisma.round.findUnique({
      where: { id },
      include: {
        course: true,
        tee: { include: { holes: { orderBy: { holeNumber: 'asc' } } } },
        holes: { orderBy: { holeNumber: 'asc' } },
      },
    })
    if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    return NextResponse.json(round)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch round' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const round = await prisma.round.update({ where: { id }, data: body })
    return NextResponse.json(round)
  } catch {
    return NextResponse.json({ error: 'Failed to update round' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.round.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete round' }, { status: 500 })
  }
}
