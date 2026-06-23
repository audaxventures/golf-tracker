'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { formatPct, formatSG, formatScore, formatHandicap, cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine,
  LineChart, Line, CartesianGrid, Cell,
} from 'recharts'

interface Stats {
  rounds: number
  scoringAverage: number
  girPercent: number
  fairwayPercent: number
  scramblingPercent: number
  puttsPerRound: number
  threePuttPercent: number
  sgTotals: { offTee: number; approach: number; aroundGreen: number; putting: number; total: number }
  sgByRound: { date: string; sgOffTee: number; sgApproach: number; sgAroundGreen: number; sgPutting: number; sgTotal: number }[]
  parBreakdown: { eagles: number; birdies: number; pars: number; bogeys: number; doubles: number; worse: number }
  approachByDistanceBand: { band: string; girPct: number; avgProximity: number; count: number }[]
  puttMakeByDistance: { band: string; makePct: number; count: number }[]
  missTendency: {
    tee: { left: number; right: number; other: number }
    approach: { short: number; long: number; left: number; right: number }
    putt: { left: number; right: number; short: number; long: number }
  }
}

interface Round {
  id: string
  datePlayed: string
  totalScore: number | null
  course: { name: string }
  tee: { par: number }
  sgTotal: number | null
  girsHit: number | null
  girsAvailable: number | null
}

interface HandicapEntry {
  id: string
  handicapIndex: number
  recordedDate: string
}

interface Settings {
  goalGirPercent: number | null
  goalFairwayPercent: number | null
  goalScramblingPct: number | null
  goalPuttsPerRound: number | null
  goalThreePuttPct: number | null
  goalSgPutting: number | null
  goalSgApproach: number | null
  goalSgOffTee: number | null
}

const RANGES = [5, 10, 20] as const
type Range = typeof RANGES[number]

function TrendIcon({ value }: { value: number }) {
  if (value > 0.05) return <TrendingUp size={14} className="text-[--green-gain]" />
  if (value < -0.05) return <TrendingDown size={14} className="text-[--red-loss]" />
  return <Minus size={14} className="text-[--text-muted]" />
}

function GoalBar({ label, current, target, higherIsBetter = true, unit = '' }: {
  label: string; current: number; target: number; higherIsBetter?: boolean; unit?: string
}) {
  const pct = higherIsBetter
    ? Math.min(100, (current / target) * 100)
    : Math.min(100, (target / Math.max(current, 0.01)) * 100)
  const onTrack = higherIsBetter ? current >= target : current <= target
  return (
    <div className="py-2.5 border-b border-[--border] last:border-0">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-[--text-primary]">{label}</span>
        <span className="text-xs text-[--text-muted]">
          <span className={cn('font-medium', onTrack ? 'text-[--green-gain]' : 'text-[--red-loss]')}>
            {unit === '%' ? formatPct(current) : unit === 'putts' ? current.toFixed(1) : formatSG(current)}
          </span>
          {' / '}
          {unit === '%' ? formatPct(target) : unit === 'putts' ? target.toFixed(0) : formatSG(target)}
        </span>
      </div>
      <div className="h-1.5 bg-[--cream-dark] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', onTrack ? 'bg-[--gold]' : 'bg-[--navy]')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

const sgBarColors = {
  'OTT': 'var(--navy)',
  'App': 'var(--gold)',
  'ARG': '#4A7C6F',
  'Putt': '#7B6EA0',
}

export default function DashboardPage() {
  const [range, setRange] = useState<Range>(10)
  const [stats, setStats] = useState<Stats | null>(null)
  const [prevStats, setPrevStats] = useState<Stats | null>(null)
  const [rounds, setRounds] = useState<Round[]>([])
  const [handicap, setHandicap] = useState<HandicapEntry[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/stats?range=${range}`).then(r => r.json()),
      fetch(`/api/stats?range=${range * 2}`).then(r => r.json()),
      fetch('/api/rounds').then(r => r.json()),
      fetch('/api/handicap').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]).then(([s, prev, r, h, set]) => {
      setStats(s)
      setPrevStats(prev)
      setRounds(r.slice(0, 3))
      setHandicap(h)
      setSettings(set)
      setLoading(false)
    })
  }, [range])

  const currentHandicap = handicap[0]?.handicapIndex ?? null

  // Generate insight text
  function generateInsight(): string | null {
    if (!stats || !prevStats || stats.rounds === 0) return null
    const improvements: string[] = []
    const opportunities: string[] = []

    const sgDiff = stats.sgTotals.approach - prevStats.sgTotals.approach
    if (sgDiff > 0.2) improvements.push(`SG: Approach improved ${formatSG(sgDiff)} over last ${range} rounds`)
    if (sgDiff < -0.2) opportunities.push(`SG: Approach down ${formatSG(Math.abs(sgDiff))}`)

    const girDiff = stats.girPercent - prevStats.girPercent
    if (girDiff > 3) improvements.push(`GIR% up ${girDiff.toFixed(1)} points`)

    if (stats.threePuttPercent > 15) opportunities.push(`3-putt rate is ${formatPct(stats.threePuttPercent)} — a key area to improve`)
    if (settings?.goalThreePuttPct && stats.threePuttPercent > settings.goalThreePuttPct) {
      opportunities.push(`3-putt rate ${formatPct(stats.threePuttPercent)} (goal: ${formatPct(settings.goalThreePuttPct)})`)
    }

    if (improvements.length === 0 && opportunities.length === 0) return null

    const parts: string[] = []
    if (improvements[0]) parts.push(improvements[0] + '.')
    if (opportunities[0]) parts.push(`Biggest opportunity: ${opportunities[0]}.`)
    return parts.join(' ')
  }

  const insight = generateInsight()

  const sgChartData = [
    { name: 'OTT', value: stats?.sgTotals.offTee ?? 0, fill: stats?.sgTotals.offTee ?? 0 >= 0 ? 'var(--green-gain)' : 'var(--red-loss)' },
    { name: 'App', value: stats?.sgTotals.approach ?? 0, fill: stats?.sgTotals.approach ?? 0 >= 0 ? 'var(--green-gain)' : 'var(--red-loss)' },
    { name: 'ARG', value: stats?.sgTotals.aroundGreen ?? 0, fill: stats?.sgTotals.aroundGreen ?? 0 >= 0 ? 'var(--green-gain)' : 'var(--red-loss)' },
    { name: 'Putt', value: stats?.sgTotals.putting ?? 0, fill: stats?.sgTotals.putting ?? 0 >= 0 ? 'var(--green-gain)' : 'var(--red-loss)' },
  ]

  const handicapChartData = handicap.slice(0, 12).reverse().map(h => ({
    date: format(new Date(h.recordedDate), 'MMM d'),
    value: h.handicapIndex,
  }))

  if (loading) {
    return (
      <div className="px-4 pt-5 space-y-4 animate-pulse">
        <div className="h-10 flex justify-between items-center">
          <div className="h-7 w-36 bg-[--cream-dark] rounded" />
          <div className="h-7 w-12 bg-[--cream-dark] rounded-full" />
        </div>
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[--cream-dark] rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-start justify-between">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-3xl text-[--navy] flex items-center gap-2">
            Audax Golf
            <span className="w-2 h-2 rounded-full bg-[--gold] inline-block mt-1" />
          </h1>
          <p className="text-xs text-[--text-muted] mt-0.5">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        {currentHandicap != null && (
          <div className="bg-[--navy] text-white text-sm font-medium px-3 py-1.5 rounded-full">
            {formatHandicap(currentHandicap)}
          </div>
        )}
      </div>

      {/* Range selector */}
      <div className="px-4 mb-5">
        <div className="inline-flex bg-[--cream-dark] rounded-xl p-1 gap-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                range === r ? 'bg-white text-[--navy] shadow-sm' : 'text-[--text-muted] hover:text-[--navy]'
              )}
            >
              Last {r}
            </button>
          ))}
        </div>
      </div>

      {stats && stats.rounds === 0 ? (
        <div className="px-4">
          <div className="bg-white rounded-xl border border-[--border] shadow-sm p-8 text-center">
            <div className="w-3 h-3 rounded-full bg-[--gold] mx-auto mb-4" />
            <p className="font-['DM_Serif_Display'] text-xl text-[--navy] mb-2">Ready to play</p>
            <p className="text-sm text-[--text-muted] mb-4">Complete a round to see your stats here.</p>
            <Link href="/rounds/new" className="inline-block bg-[--navy] text-white hover:bg-[--navy-light] rounded-lg px-4 py-2.5 font-medium text-sm transition-colors">
              Start a round
            </Link>
          </div>
        </div>
      ) : (
        <div className="px-4 space-y-4">

          {/* Key stats 2×2 */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Scoring avg',
                  value: formatScore(stats.scoringAverage),
                  trend: prevStats ? prevStats.scoringAverage - stats.scoringAverage : 0,
                },
                {
                  label: 'GIR %',
                  value: formatPct(stats.girPercent),
                  trend: prevStats ? stats.girPercent - prevStats.girPercent : 0,
                },
                {
                  label: 'Putts / round',
                  value: stats.puttsPerRound.toFixed(1),
                  trend: prevStats ? prevStats.puttsPerRound - stats.puttsPerRound : 0,
                },
                {
                  label: 'Scrambling',
                  value: formatPct(stats.scramblingPercent),
                  trend: prevStats ? stats.scramblingPercent - prevStats.scramblingPercent : 0,
                },
              ].map(({ label, value, trend }) => (
                <div key={label} className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
                  <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-1">{label}</p>
                  <p className="font-['DM_Serif_Display'] text-3xl text-[--navy]">{value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendIcon value={trend} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SG Breakdown chart */}
          {stats && (
            <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
              <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-4">Strokes gained breakdown</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={sgChartData} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                  <XAxis type="number" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-primary)' }} width={30} />
                  <ReferenceLine x={0} stroke="var(--navy)" strokeWidth={1.5} />
                  <Tooltip
                    formatter={(v) => [formatSG(v as number), 'SG']}
                    contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {sgChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Goal progress */}
          {settings && stats && (() => {
            const goals = [
              { label: 'GIR %', current: stats.girPercent, target: settings.goalGirPercent, unit: '%' as const },
              { label: 'Fairway %', current: stats.fairwayPercent, target: settings.goalFairwayPercent, unit: '%' as const },
              { label: 'Scrambling %', current: stats.scramblingPercent, target: settings.goalScramblingPct, unit: '%' as const },
              { label: 'Putts / round', current: stats.puttsPerRound, target: settings.goalPuttsPerRound, unit: 'putts' as const, higherIsBetter: false },
              { label: '3-putt %', current: stats.threePuttPercent, target: settings.goalThreePuttPct, unit: '%' as const, higherIsBetter: false },
              { label: 'SG: Putting', current: stats.sgTotals.putting, target: settings.goalSgPutting, unit: 'sg' as const },
              { label: 'SG: Approach', current: stats.sgTotals.approach, target: settings.goalSgApproach, unit: 'sg' as const },
            ].filter(g => g.target != null) as { label: string; current: number; target: number; unit: '%' | 'putts' | 'sg'; higherIsBetter?: boolean }[]

            if (!goals.length) return null

            return (
              <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
                <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-1">Goal progress</p>
                <div>
                  {goals.map(g => (
                    <GoalBar
                      key={g.label}
                      label={g.label}
                      current={g.current}
                      target={g.target}
                      unit={g.unit}
                      higherIsBetter={g.higherIsBetter ?? true}
                    />
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Handicap trend */}
          {handicapChartData.length > 1 && (
            <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
              <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-4">Handicap trend</p>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={handicapChartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} reversed domain={['auto', 'auto']} />
                  <Tooltip
                    formatter={(v) => [formatHandicap(v as number), 'Handicap']}
                    contentStyle={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--navy)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--gold)', r: 4, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent rounds */}
          {rounds.length > 0 && (
            <div className="bg-white rounded-xl border border-[--border] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[--border] flex justify-between items-center">
                <p className="text-sm font-medium text-[--text-primary]">Recent rounds</p>
                <Link href="/rounds" className="text-xs text-[--navy] hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-[--border]">
                {rounds.map(round => {
                  const scoreVsPar = round.totalScore != null ? round.totalScore - round.tee.par : null
                  const girPct = round.girsAvailable ? (round.girsHit ?? 0) / round.girsAvailable * 100 : null
                  return (
                    <Link key={round.id} href={`/rounds/${round.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-[--cream] transition-colors">
                      <div>
                        <p className="text-sm font-medium text-[--text-primary]">{round.course.name}</p>
                        <p className="text-xs text-[--text-muted]">{format(new Date(round.datePlayed), 'MMM d, yyyy')}{girPct != null ? ` · GIR ${formatPct(girPct)}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {round.sgTotal != null && (
                          <span className={cn('text-xs font-medium font-[\'JetBrains_Mono\']', round.sgTotal >= 0 ? 'text-[--green-gain]' : 'text-[--red-loss]')}>
                            SG {formatSG(round.sgTotal)}
                          </span>
                        )}
                        {scoreVsPar != null && (
                          <span className={cn('text-base font-medium', scoreVsPar < 0 ? 'text-[--green-gain]' : scoreVsPar > 0 ? 'text-[--red-loss]' : 'text-[--navy]')}>
                            {scoreVsPar === 0 ? 'E' : scoreVsPar > 0 ? `+${scoreVsPar}` : scoreVsPar}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Approach by distance band */}
          {stats && stats.approachByDistanceBand?.length > 0 && (
            <div className="bg-white rounded-xl border border-[--border] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[--border]">
                <p className="text-sm font-medium text-[--text-primary]">Approach by distance</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[--border]">
                    <th className="px-3 py-2 text-left text-xs text-[--text-muted] font-medium">Distance</th>
                    <th className="px-3 py-2 text-right text-xs text-[--text-muted] font-medium">GIR %</th>
                    <th className="px-3 py-2 text-right text-xs text-[--text-muted] font-medium">Proximity</th>
                    <th className="px-3 py-2 text-right text-xs text-[--text-muted] font-medium">Shots</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.approachByDistanceBand.map(b => (
                    <tr key={b.band} className="border-b border-[--border] last:border-0">
                      <td className="px-3 py-2 text-[--text-primary]">{b.band} yds</td>
                      <td className={cn('px-3 py-2 text-right font-medium', b.girPct >= 60 ? 'text-[--green-gain]' : b.girPct < 40 ? 'text-[--red-loss]' : 'text-[--text-primary]')}>
                        {formatPct(b.girPct)}
                      </td>
                      <td className="px-3 py-2 text-right text-[--text-muted]">{b.avgProximity > 0 ? `${b.avgProximity.toFixed(0)} ft` : '—'}</td>
                      <td className="px-3 py-2 text-right text-[--text-muted]">{b.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Putt make % by distance */}
          {stats && stats.puttMakeByDistance?.length > 0 && (
            <div className="bg-white rounded-xl border border-[--border] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[--border]">
                <p className="text-sm font-medium text-[--text-primary]">Putt make %</p>
              </div>
              <div className="p-4 space-y-2">
                {stats.puttMakeByDistance.map(b => (
                  <div key={b.band}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[--text-muted]">{b.band}</span>
                      <span className={cn('font-medium', b.makePct >= 70 ? 'text-[--green-gain]' : b.makePct < 40 ? 'text-[--red-loss]' : 'text-[--text-primary]')}>
                        {formatPct(b.makePct)} ({b.count})
                      </span>
                    </div>
                    <div className="h-1.5 bg-[--cream-dark] rounded-full overflow-hidden">
                      <div className="h-full bg-[--navy] rounded-full" style={{ width: `${b.makePct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Miss tendency */}
          {stats && stats.missTendency && (
            (() => {
              const { tee, approach, putt } = stats.missTendency
              const teeTotal = (tee.left + tee.right + tee.other) || 1
              const appTotal = (approach.short + approach.long + approach.left + approach.right) || 1
              const puttTotal = (putt.left + putt.right + putt.short + putt.long) || 1
              if (teeTotal === 1 && appTotal === 1 && puttTotal === 1) return null
              return (
                <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
                  <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-3">Miss tendency</p>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div>
                      <p className="text-[--text-muted] font-medium mb-2">Tee</p>
                      {tee.left > 0 && <div className="text-[--red-loss]">← Left {Math.round(tee.left/teeTotal*100)}%</div>}
                      {tee.right > 0 && <div className="text-[--red-loss]">→ Right {Math.round(tee.right/teeTotal*100)}%</div>}
                      {tee.other > 0 && <div className="text-[--text-muted]">Other {Math.round(tee.other/teeTotal*100)}%</div>}
                    </div>
                    <div>
                      <p className="text-[--text-muted] font-medium mb-2">Approach</p>
                      {approach.short > 0 && <div className="text-[--red-loss]">↓ Short {Math.round(approach.short/appTotal*100)}%</div>}
                      {approach.long > 0 && <div className="text-[--text-muted]">↑ Long {Math.round(approach.long/appTotal*100)}%</div>}
                      {approach.left > 0 && <div className="text-[--text-muted]">← Left {Math.round(approach.left/appTotal*100)}%</div>}
                      {approach.right > 0 && <div className="text-[--text-muted]">→ Right {Math.round(approach.right/appTotal*100)}%</div>}
                    </div>
                    <div>
                      <p className="text-[--text-muted] font-medium mb-2">Putting</p>
                      {putt.short > 0 && <div className="text-[--red-loss]">Short {Math.round(putt.short/puttTotal*100)}%</div>}
                      {putt.left > 0 && <div className="text-[--text-muted]">Left {Math.round(putt.left/puttTotal*100)}%</div>}
                      {putt.right > 0 && <div className="text-[--text-muted]">Right {Math.round(putt.right/puttTotal*100)}%</div>}
                    </div>
                  </div>
                </div>
              )
            })()
          )}

          {/* Insight card */}
          {insight && (
            <div className="bg-[--cream] border-l-4 border-[--navy] rounded-r-xl p-4">
              <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-1">Insight</p>
              <p className="text-sm text-[--text-primary]">{insight}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
