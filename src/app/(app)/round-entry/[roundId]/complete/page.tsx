import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPct, formatScore, formatSG, cn } from '@/lib/utils'
import { calculateScoreDifferential } from '@/lib/handicap-calculator'
import { Trophy } from 'lucide-react'

export default async function RoundCompletePage({
  params,
}: {
  params: Promise<{ roundId: string }>
}) {
  const { roundId } = await params

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      course: true,
      tee: true,
      holes: true,
    },
  })

  if (!round) notFound()

  const par = round.tee.par
  const score = round.totalScore ?? 0
  const scoreVsPar = score - par
  const girHit = round.girsHit ?? 0
  const girAvail = round.girsAvailable ?? 18
  const girPct = girAvail > 0 ? (girHit / girAvail) * 100 : 0
  const fwHit = round.fairwaysHit ?? 0
  const fwAvail = round.fairwaysAvailable ?? 14
  const fwPct = fwAvail > 0 ? (fwHit / fwAvail) * 100 : 0
  const scoreDiff = score > 0 ? calculateScoreDifferential(score, round.tee.rating, round.tee.slope) : null

  const front9 = round.holes.filter(h => h.holeNumber <= 9).reduce((s, h) => s + h.score, 0)
  const back9 = round.holes.filter(h => h.holeNumber > 9).reduce((s, h) => s + h.score, 0)

  return (
    <div className="min-h-screen bg-[--cream] px-4 pt-8 pb-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[--gold-light] flex items-center justify-center mx-auto mb-4">
          <Trophy size={28} className="text-[--gold]" />
        </div>
        <h1 className="font-['DM_Serif_Display'] text-3xl text-[--navy] mb-1">Round complete</h1>
        <p className="text-[--text-muted]">{round.course.name}</p>
      </div>

      {/* Big score */}
      <div className="bg-white rounded-xl border border-[--border] shadow-sm p-6 text-center mb-4">
        <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-1">Total score</p>
        <p className="font-['DM_Serif_Display'] text-6xl text-[--navy]">{score}</p>
        <p className={cn('text-2xl font-medium mt-1', scoreVsPar < 0 ? 'text-[--green-gain]' : scoreVsPar > 0 ? 'text-[--red-loss]' : 'text-[--text-muted]')}>
          {formatScore(scoreVsPar)}
        </p>
        <div className="flex justify-center gap-6 mt-3 text-sm text-[--text-muted]">
          <span>Front: {front9}</span>
          <span>·</span>
          <span>Back: {back9}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'GIR', value: formatPct(girPct) },
          { label: 'Fairways', value: formatPct(fwPct) },
          { label: 'Putts', value: String(round.totalPutts ?? '—') },
          { label: 'Penalties', value: String(round.penalties ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
            <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-1">{label}</p>
            <p className="font-['DM_Serif_Display'] text-2xl text-[--navy]">{value}</p>
          </div>
        ))}
      </div>

      {/* SG breakdown */}
      {round.sgTotal != null && (
        <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 mb-4">
          <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-3">Strokes gained</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Off the tee', value: round.sgOffTee },
              { label: 'Approach', value: round.sgApproach },
              { label: 'Around green', value: round.sgAroundGreen },
              { label: 'Putting', value: round.sgPutting },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[--text-muted] mb-0.5">{label}</p>
                <p className={cn('text-lg font-medium font-[\'JetBrains_Mono\']',
                  value == null ? 'text-[--text-muted]' :
                  value > 0 ? 'text-[--green-gain]' : value < 0 ? 'text-[--red-loss]' : 'text-[--text-muted]'
                )}>
                  {formatSG(value)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-[--border] mt-3 pt-3 flex justify-between">
            <p className="text-sm font-medium text-[--text-primary]">SG total</p>
            <p className={cn('text-sm font-medium font-[\'JetBrains_Mono\']',
              round.sgTotal > 0 ? 'text-[--green-gain]' : round.sgTotal < 0 ? 'text-[--red-loss]' : 'text-[--text-muted]'
            )}>
              {formatSG(round.sgTotal)}
            </p>
          </div>
        </div>
      )}

      {/* Score differential */}
      {scoreDiff != null && (
        <div className="bg-[--navy-muted] rounded-xl p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs text-[--text-muted] uppercase tracking-wide">Score differential</p>
            <p className="text-xs text-[--text-muted] mt-0.5">Used for handicap calculation</p>
          </div>
          <p className="font-['DM_Serif_Display'] text-2xl text-[--navy]">{scoreDiff.toFixed(1)}</p>
        </div>
      )}

      <div className="space-y-3">
        <Link href={`/rounds/${roundId}`} className="block w-full h-12 bg-[--navy] text-white rounded-xl font-medium text-base hover:bg-[--navy-light] transition-colors flex items-center justify-center">
          View full round →
        </Link>
        <Link href="/dashboard" className="block w-full h-12 border border-[--border] rounded-xl font-medium text-sm text-[--text-muted] hover:bg-white transition-colors flex items-center justify-center">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
