'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { ArrowLeft } from 'lucide-react'
import { formatScore, cn } from '@/lib/utils'
import { format } from 'date-fns'

interface CourseDetail {
  id: string
  name: string
  city: string | null
  province: string | null
  country: string
  tees: { id: string; name: string; rating: number; slope: number; par: number }[]
  rounds: {
    id: string
    datePlayed: string
    totalScore: number | null
    isComplete: boolean
    tee: { name: string; par: number }
  }[]
  stats: {
    roundsPlayed: number
    bestScore: number | null
    bestScoreVsPar: number | null
    avgScoreVsPar: number | null
  }
  perHoleAverages: { holeNumber: number; avgScore: number; avgVsPar: number; count: number }[]
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then(r => r.json())
      .then(data => { setCourse(data); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="px-4 pt-5 space-y-4 animate-pulse">
        <div className="h-7 w-48 bg-[--cream-dark] rounded" />
        <div className="h-24 bg-[--cream-dark] rounded-xl" />
        <div className="h-48 bg-[--cream-dark] rounded-xl" />
      </div>
    )
  }

  if (!course) return <div className="px-4 pt-5 text-[--text-muted]">Course not found.</div>

  return (
    <div>
      <div className="px-4 pt-5 pb-2">
        <Link href="/courses" className="flex items-center gap-1 text-[--text-muted] text-sm mb-3 hover:text-[--navy]">
          <ArrowLeft size={14} /> Courses
        </Link>
        <h1 className="font-['DM_Serif_Display'] text-2xl text-[--navy]">{course.name}</h1>
        {(course.city || course.province) && (
          <p className="text-sm text-[--text-muted] mt-0.5">{[course.city, course.province].filter(Boolean).join(', ')}</p>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Stats summary */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Rounds played', value: String(course.stats.roundsPlayed) },
            { label: 'Best score', value: course.stats.bestScoreVsPar != null ? formatScore(course.stats.bestScoreVsPar) : '—' },
            { label: 'Avg score', value: course.stats.avgScoreVsPar != null ? formatScore(course.stats.avgScoreVsPar) : '—' },
            { label: 'Tees', value: course.tees.map(t => t.name).join(', ') || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
              <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-1">{label}</p>
              <p className="font-['DM_Serif_Display'] text-2xl text-[--navy]">{value}</p>
            </div>
          ))}
        </div>

        {/* Per-hole averages */}
        {course.perHoleAverages.length > 0 && (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[--border]">
              <p className="font-medium text-[--text-primary] text-sm">Hole averages</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[--border]">
                    <th className="px-3 py-2 text-left text-xs text-[--text-muted] font-medium uppercase tracking-wide">Hole</th>
                    <th className="px-3 py-2 text-right text-xs text-[--text-muted] font-medium uppercase tracking-wide">Avg</th>
                    <th className="px-3 py-2 text-right text-xs text-[--text-muted] font-medium uppercase tracking-wide">vs par</th>
                  </tr>
                </thead>
                <tbody>
                  {course.perHoleAverages.map(h => (
                    <tr key={h.holeNumber} className="border-b border-[--border] last:border-0">
                      <td className="px-3 py-2 text-[--text-primary] font-medium">#{h.holeNumber}</td>
                      <td className="px-3 py-2 text-right font-['JetBrains_Mono'] text-[--text-primary]">{h.avgScore.toFixed(1)}</td>
                      <td className={cn('px-3 py-2 text-right font-medium font-[\'JetBrains_Mono\']', h.avgVsPar > 0 ? 'text-[--red-loss]' : h.avgVsPar < 0 ? 'text-[--green-gain]' : 'text-[--text-muted]')}>
                        {h.avgVsPar > 0 ? '+' : ''}{h.avgVsPar.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rounds at this course */}
        {course.rounds.length > 0 && (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[--border]">
              <p className="font-medium text-[--text-primary] text-sm">Rounds here</p>
            </div>
            <div className="divide-y divide-[--border]">
              {course.rounds.map(round => (
                <Link key={round.id} href={`/rounds/${round.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-[--cream] transition-colors">
                  <div>
                    <p className="text-sm text-[--text-primary]">{format(new Date(round.datePlayed), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-[--text-muted]">{round.tee.name} tees</p>
                  </div>
                  {round.totalScore != null ? (
                    <span className={cn('text-sm font-medium', (round.totalScore - round.tee.par) <= 0 ? 'text-[--green-gain]' : 'text-[--red-loss]')}>
                      {formatScore(round.totalScore - round.tee.par)}
                    </span>
                  ) : (
                    <span className="text-xs text-[--gold] font-medium">In progress</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
