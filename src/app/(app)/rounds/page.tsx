'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { Plus, ChevronRight } from 'lucide-react'
import { formatPct, formatSG, cn } from '@/lib/utils'
import { format } from 'date-fns'

interface RoundListItem {
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
  course: { name: string }
  tee: { par: number; name: string }
}

function GolfFlagIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <line x1="16" y1="8" x2="16" y2="40" stroke="var(--navy)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 10 L34 16 L16 22 Z" fill="var(--gold)" opacity="0.8"/>
      <circle cx="16" cy="40" r="4" fill="var(--navy-muted)" stroke="var(--border)" strokeWidth="1.5"/>
    </svg>
  )
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<RoundListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rounds').then(r => r.json()).then(data => { setRounds(data); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Rounds" action={<Link href="/rounds/new" className="bg-[--navy] text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1"><Plus size={14} />New</Link>} />
        <div className="px-4 space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[--border] shadow-sm p-4 animate-pulse space-y-2">
              <div className="h-5 w-48 bg-[--cream-dark] rounded" />
              <div className="h-4 w-32 bg-[--cream-dark] rounded" />
              <div className="h-8 bg-[--cream-dark] rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Rounds"
        action={
          <Link href="/rounds/new" className="bg-[--navy] text-white rounded-lg px-3 py-2.5 text-sm font-medium flex items-center gap-1 hover:bg-[--navy-light] transition-colors">
            <Plus size={14} /> New
          </Link>
        }
      />
      <div className="px-4">
        {rounds.length === 0 ? (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4"><GolfFlagIcon /></div>
            <p className="font-['DM_Serif_Display'] text-xl text-[--navy] mb-2">No rounds yet</p>
            <p className="text-sm text-[--text-muted] mb-4">Play your first round to start tracking your stats.</p>
            <Link href="/rounds/new" className="inline-block bg-[--navy] text-white hover:bg-[--navy-light] rounded-lg px-4 py-2.5 font-medium text-sm transition-colors">
              Start a round
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rounds.map(round => {
              const scoreVsPar = round.totalScore != null ? round.totalScore - round.tee.par : null
              const girPct = round.girsAvailable ? (round.girsHit ?? 0) / round.girsAvailable * 100 : null
              const fwPct = round.fairwaysAvailable ? (round.fairwaysHit ?? 0) / round.fairwaysAvailable * 100 : null
              return (
                <Link key={round.id} href={`/rounds/${round.id}`}>
                  <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 active:bg-[--cream]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-[--text-primary]">{round.course.name}</p>
                        <p className="text-xs text-[--text-muted]">{format(new Date(round.datePlayed), 'MMM d, yyyy')} · {round.tee.name} tees</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!round.isComplete && (
                          <span className="text-xs bg-[--gold-light] text-[--gold] font-medium px-2 py-0.5 rounded-full">In progress</span>
                        )}
                        {scoreVsPar != null && (
                          <span className={cn('text-xl font-medium font-[\'DM_Serif_Display\']', scoreVsPar < 0 ? 'text-[--green-gain]' : scoreVsPar > 0 ? 'text-[--red-loss]' : 'text-[--navy]')}>
                            {scoreVsPar === 0 ? 'E' : scoreVsPar > 0 ? `+${scoreVsPar}` : scoreVsPar}
                          </span>
                        )}
                        <ChevronRight size={16} className="text-[--text-muted]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'GIR', value: girPct != null ? formatPct(girPct) : '—' },
                        { label: 'FIR', value: fwPct != null ? formatPct(fwPct) : '—' },
                        { label: 'Putts', value: round.totalPutts != null ? String(round.totalPutts) : '—' },
                        { label: 'SG', value: round.sgTotal != null ? formatSG(round.sgTotal) : '—', colored: round.sgTotal != null },
                      ].map(({ label, value, colored }) => (
                        <div key={label} className="text-center">
                          <p className="text-[10px] text-[--text-muted] uppercase tracking-wide">{label}</p>
                          <p className={cn('text-sm font-medium font-[\'JetBrains_Mono\'] mt-0.5',
                            colored && round.sgTotal != null
                              ? round.sgTotal >= 0 ? 'text-[--green-gain]' : 'text-[--red-loss]'
                              : 'text-[--text-primary]'
                          )}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
