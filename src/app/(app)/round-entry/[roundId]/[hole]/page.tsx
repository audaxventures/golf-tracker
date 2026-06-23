import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { HoleEntryWizard } from '@/components/round-entry/HoleEntryWizard'
import { ArrowLeft } from 'lucide-react'

export default async function HoleEntryPage({
  params,
}: {
  params: Promise<{ roundId: string; hole: string }>
}) {
  const { roundId, hole } = await params
  const holeNumber = parseInt(hole)

  if (isNaN(holeNumber) || holeNumber < 1 || holeNumber > 18) notFound()

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      tee: { include: { holes: { orderBy: { holeNumber: 'asc' } } } },
    },
  })

  if (!round) notFound()

  const settings = await prisma.settings.findFirst()
  const bagClubs = settings?.bagClubs ?? ['Driver', '3-Wood', '5-Wood', '4-Hybrid', '4-Iron', '5-Iron', '6-Iron', '7-Iron', '8-Iron', '9-Iron', 'PW', 'GW', 'SW', 'LW', 'Putter']

  const holeInfo = round.tee.holes.find(h => h.holeNumber === holeNumber)
  const par = holeInfo?.par ?? 4
  const yardage = holeInfo?.yardage ?? 0

  // Count completed holes
  const savedHoles = await prisma.holeStats.findMany({
    where: { roundId },
    select: { holeNumber: true },
  })
  const completedHoleNums = new Set(savedHoles.map(h => h.holeNumber))

  return (
    <div className="min-h-screen bg-[--cream]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[--border] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {holeNumber > 1 && (
              <Link href={`/round-entry/${roundId}/${holeNumber - 1}`} className="text-[--text-muted] hover:text-[--navy] p-1">
                <ArrowLeft size={18} />
              </Link>
            )}
            <div>
              <p className="font-['DM_Serif_Display'] text-xl text-[--navy] leading-none">
                Hole {holeNumber} <span className="text-[--text-muted] text-base font-normal">of 18</span>
              </p>
              <p className="text-xs text-[--text-muted]">Par {par}{yardage > 0 ? ` · ${yardage} yds` : ''}</p>
            </div>
          </div>
          <Link href={`/rounds/${roundId}`} className="text-xs text-[--text-muted] hover:text-[--navy] underline">
            Exit
          </Link>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: 18 }, (_, i) => i + 1).map(h => (
            <Link key={h} href={`/round-entry/${roundId}/${h}`} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${
                h === holeNumber ? 'bg-[--gold]' :
                completedHoleNums.has(h) ? 'bg-[--navy]' :
                'bg-[--cream-dark]'
              }`} />
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <HoleEntryWizard
          roundId={roundId}
          holeNumber={holeNumber}
          holeInfo={{ par, yardage, holeNumber }}
          bagClubs={bagClubs}
        />
      </div>
    </div>
  )
}
