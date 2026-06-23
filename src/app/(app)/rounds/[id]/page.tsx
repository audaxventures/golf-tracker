'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { formatPct, formatSG, cn } from '@/lib/utils'
import { format } from 'date-fns'

interface HoleStatRow {
  id: string
  holeNumber: number
  par: number
  score: number
  scoreDiff: number
  teeResult: string | null
  approachResult: string | null
  putts: number
  sgTotal: number | null
  sgOffTee: number | null
  sgApproach: number | null
  sgAroundGreen: number | null
  sgPutting: number | null
  firstPuttDistance: number | null
  approachDistance: number | null
  penalties: number
  holeNotes: string | null
}

interface RoundDetail {
  id: string
  datePlayed: string
  isComplete: boolean
  totalScore: number | null
  totalPutts: number | null
  girsHit: number | null
  girsAvailable: number | null
  fairwaysHit: number | null
  fairwaysAvailable: number | null
  sgTotal: number | null
  sgOffTee: number | null
  sgApproach: number | null
  sgAroundGreen: number | null
  sgPutting: number | null
  windSpeed: string | null
  conditions: string | null
  temperature: number | null
  notes: string | null
  course: { name: string; city: string | null; province: string | null }
  tee: { name: string; par: number; rating: number; slope: number }
  holes: HoleStatRow[]
}

function ScoreChip({ diff }: { diff: number }) {
  const label = diff === 0 ? 'E' : diff > 0 ? `+${diff}` : String(diff)
  return (
    <span className={cn(
      'inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium',
      diff <= -2 ? 'bg-[--gold-light] text-[--gold]' :
      diff === -1 ? 'bg-green-50 text-[--green-gain]' :
      diff === 0 ? 'bg-[--navy-muted] text-[--navy]' :
      diff === 1 ? 'bg-orange-50 text-orange-600' :
      'bg-red-50 text-[--red-loss]'
    )}>
      {label}
    </span>
  )
}

function HoleRow({ hole, roundId }: { hole: HoleStatRow; roundId: string }) {
  const [expanded, setExpanded] = useState(false)
  const fir = hole.teeResult === 'fairway' ? '✓' : hole.teeResult ? '✗' : '—'
  const gir = hole.approachResult === 'gir' ? '✓' : hole.approachResult ? '✗' : '—'

  return (
    <>
      <tr
        className="border-b border-[--border] cursor-pointer hover:bg-[--cream] transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <td className="px-3 py-2.5 font-medium text-[--text-primary] text-sm">{hole.holeNumber}</td>
        <td className="px-3 py-2.5 text-[--text-muted] text-sm text-center">{hole.par}</td>
        <td className="px-3 py-2.5 text-center"><ScoreChip diff={hole.scoreDiff} /></td>
        <td className="px-3 py-2.5 text-center text-sm">{fir}</td>
        <td className="px-3 py-2.5 text-center text-sm">{gir}</td>
        <td className="px-3 py-2.5 text-center text-sm text-[--text-muted]">{hole.putts || '—'}</td>
        <td className="px-3 py-2.5 text-right">
          <span className={cn('text-sm font-medium font-[\'JetBrains_Mono\']',
            hole.sgTotal == null ? 'text-[--text-muted]' :
            hole.sgTotal > 0 ? 'text-[--green-gain]' : hole.sgTotal < 0 ? 'text-[--red-loss]' : 'text-[--text-muted]'
          )}>
            {hole.sgTotal != null ? formatSG(hole.sgTotal) : '—'}
          </span>
        </td>
        <td className="px-2 py-2.5 text-[--text-muted]">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[--cream]">
          <td colSpan={8} className="px-3 py-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {hole.approachDistance && <div className="flex justify-between"><span className="text-[--text-muted]">Approach dist</span><span>{hole.approachDistance} yds</span></div>}
              {hole.firstPuttDistance && <div className="flex justify-between"><span className="text-[--text-muted]">1st putt</span><span>{hole.firstPuttDistance} ft</span></div>}
              {hole.sgOffTee != null && <div className="flex justify-between"><span className="text-[--text-muted]">SG: OTT</span><span className={hole.sgOffTee >= 0 ? 'text-[--green-gain]' : 'text-[--red-loss]'}>{formatSG(hole.sgOffTee)}</span></div>}
              {hole.sgApproach != null && <div className="flex justify-between"><span className="text-[--text-muted]">SG: App</span><span className={hole.sgApproach >= 0 ? 'text-[--green-gain]' : 'text-[--red-loss]'}>{formatSG(hole.sgApproach)}</span></div>}
              {hole.sgAroundGreen != null && <div className="flex justify-between"><span className="text-[--text-muted]">SG: ARG</span><span className={hole.sgAroundGreen >= 0 ? 'text-[--green-gain]' : 'text-[--red-loss]'}>{formatSG(hole.sgAroundGreen)}</span></div>}
              {hole.sgPutting != null && <div className="flex justify-between"><span className="text-[--text-muted]">SG: Putt</span><span className={hole.sgPutting >= 0 ? 'text-[--green-gain]' : 'text-[--red-loss]'}>{formatSG(hole.sgPutting)}</span></div>}
              {hole.penalties > 0 && <div className="flex justify-between"><span className="text-[--text-muted]">Penalties</span><span className="text-[--red-loss]">{hole.penalties}</span></div>}
              {hole.holeNotes && <div className="col-span-2 text-[--text-muted] italic">"{hole.holeNotes}"</div>}
            </div>
            <Link href={`/round-entry/${roundId}/${hole.holeNumber}`} className="inline-flex items-center gap-1 text-[10px] text-[--navy] mt-2 underline">
              <Pencil size={10} /> Edit hole
            </Link>
          </td>
        </tr>
      )}
    </>
  )
}

export default function RoundDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [round, setRound] = useState<RoundDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/rounds/${id}`).then(r => r.json()).then(data => { setRound(data); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="px-4 pt-5 space-y-4 animate-pulse">
        <div className="h-7 w-48 bg-[--cream-dark] rounded" />
        <div className="h-24 bg-[--cream-dark] rounded-xl" />
        <div className="h-64 bg-[--cream-dark] rounded-xl" />
      </div>
    )
  }

  if (!round) return <div className="px-4 pt-5 text-[--text-muted]">Round not found.</div>

  const par = round.tee.par
  const scoreVsPar = round.totalScore != null ? round.totalScore - par : null
  const girPct = round.girsAvailable ? (round.girsHit ?? 0) / round.girsAvailable * 100 : null
  const fwPct = round.fairwaysAvailable ? (round.fairwaysHit ?? 0) / round.fairwaysAvailable * 100 : null
  const front9 = round.holes.filter(h => h.holeNumber <= 9).reduce((s, h) => s + h.score, 0)
  const back9 = round.holes.filter(h => h.holeNumber > 9).reduce((s, h) => s + h.score, 0)
  const front9Par = round.holes.filter(h => h.holeNumber <= 9).reduce((s, h) => s + h.par, 0)
  const back9Par = round.holes.filter(h => h.holeNumber > 9).reduce((s, h) => s + h.par, 0)

  return (
    <div className="pb-8">
      <div className="px-4 pt-5 pb-3">
        <Link href="/rounds" className="flex items-center gap-1 text-[--text-muted] text-sm mb-3 hover:text-[--navy]">
          <ArrowLeft size={14} /> Rounds
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['DM_Serif_Display'] text-2xl text-[--navy]">{round.course.name}</h1>
            <p className="text-xs text-[--text-muted] mt-0.5">
              {format(new Date(round.datePlayed), 'MMMM d, yyyy')} · {round.tee.name} tees
              {round.conditions && ` · ${round.conditions}`}
              {round.windSpeed && ` · ${round.windSpeed} wind`}
              {round.temperature != null && ` · ${round.temperature}°C`}
            </p>
          </div>
          {!round.isComplete && (
            <Link href={`/round-entry/${round.id}/1`} className="bg-[--gold] text-white text-xs px-3 py-1.5 rounded-lg font-medium">
              Continue →
            </Link>
          )}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Score summary */}
        {round.totalScore != null && (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-['DM_Serif_Display'] text-4xl text-[--navy]">{round.totalScore}</p>
                <p className={cn('text-lg font-medium mt-0.5',
                  scoreVsPar! < 0 ? 'text-[--green-gain]' : scoreVsPar! > 0 ? 'text-[--red-loss]' : 'text-[--navy]'
                )}>
                  {scoreVsPar === 0 ? 'Even par' : scoreVsPar! > 0 ? `+${scoreVsPar}` : scoreVsPar}
                </p>
              </div>
              <div className="text-right text-sm text-[--text-muted] space-y-1">
                <div>Front: <span className={cn('font-medium', (front9 - front9Par) < 0 ? 'text-[--green-gain]' : (front9 - front9Par) > 0 ? 'text-[--red-loss]' : 'text-[--navy]')}>{front9} ({front9 - front9Par > 0 ? '+' : ''}{front9 - front9Par})</span></div>
                <div>Back: <span className={cn('font-medium', (back9 - back9Par) < 0 ? 'text-[--green-gain]' : (back9 - back9Par) > 0 ? 'text-[--red-loss]' : 'text-[--navy]')}>{back9} ({back9 - back9Par > 0 ? '+' : ''}{back9 - back9Par})</span></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[--border]">
              {[
                { label: 'GIR', value: girPct != null ? formatPct(girPct) : '—' },
                { label: 'FIR', value: fwPct != null ? formatPct(fwPct) : '—' },
                { label: 'Putts', value: round.totalPutts != null ? String(round.totalPutts) : '—' },
                { label: 'Penalties', value: String(round.holes.reduce((s, h) => s + h.penalties, 0)) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] text-[--text-muted] uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium text-[--text-primary] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SG breakdown */}
        {round.sgTotal != null && (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
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
                  <p className={cn('text-xl font-medium font-[\'JetBrains_Mono\']',
                    value == null ? 'text-[--text-muted]' :
                    value > 0 ? 'text-[--green-gain]' : value < 0 ? 'text-[--red-loss]' : 'text-[--text-muted]'
                  )}>
                    {formatSG(value)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-[--border] mt-3 pt-3 flex justify-between items-center">
              <p className="text-sm font-medium text-[--text-primary]">SG total</p>
              <p className={cn('text-base font-medium font-[\'JetBrains_Mono\']',
                round.sgTotal > 0 ? 'text-[--green-gain]' : round.sgTotal < 0 ? 'text-[--red-loss]' : 'text-[--text-muted]'
              )}>
                {formatSG(round.sgTotal)}
              </p>
            </div>
          </div>
        )}

        {/* Hole-by-hole table */}
        {round.holes.length > 0 && (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[--border]">
              <p className="font-medium text-[--text-primary] text-sm">Hole by hole</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[--border]">
                    {['#', 'Par', 'Score', 'FIR', 'GIR', 'Putts', 'SG', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-[10px] text-[--text-muted] uppercase tracking-wide font-medium text-left first:text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {round.holes.map(hole => (
                    <HoleRow key={hole.id} hole={hole} roundId={round.id} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {round.notes && (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
            <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-[--text-primary]">{round.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
