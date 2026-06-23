import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { DEFAULT_BAG_CLUBS } from '@/types/golf'

async function getOrCreateSettings() {
  let settings = await prisma.settings.findFirst()
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        bagClubs: DEFAULT_BAG_CLUBS,
        goalGirPercent: 65,
        goalFairwayPercent: 70,
        goalScramblingPct: 55,
        goalSandSavePct: 50,
        goalPuttsPerRound: 30,
        goalThreePuttPct: 10,
        goalAvgFirstPutt: 20,
        goalSgPutting: 0,
        goalSgApproach: 0,
        goalSgOffTee: 0,
      },
    })
  }
  return settings
}

export async function GET() {
  try {
    const settings = await getOrCreateSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const settings = await getOrCreateSettings()

    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: body,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
