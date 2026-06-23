'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { MapPin, ChevronRight } from 'lucide-react'
import { formatScore } from '@/lib/utils'

interface CourseListItem {
  id: string
  name: string
  city: string | null
  province: string | null
  roundsPlayed: number
  avgScoreVsPar: number | null
}

function GolfFlagIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="8" x2="16" y2="40" stroke="var(--navy)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 10 L34 16 L16 22 Z" fill="var(--gold)" opacity="0.8"/>
      <circle cx="16" cy="40" r="4" fill="var(--navy-muted)" stroke="var(--border)" strokeWidth="1.5"/>
    </svg>
  )
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(data => { setCourses(data); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Courses" />
        <div className="px-4 space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-[--border] shadow-sm p-4 animate-pulse">
              <div className="h-5 w-40 bg-[--cream-dark] rounded mb-2" />
              <div className="h-4 w-24 bg-[--cream-dark] rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Courses" />
      <div className="px-4">
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4"><GolfFlagIcon /></div>
            <p className="font-['DM_Serif_Display'] text-xl text-[--navy] mb-2">No courses yet</p>
            <p className="text-sm text-[--text-muted] mb-4">Add a course when you start your first round.</p>
            <Link href="/rounds/new" className="inline-block bg-[--navy] text-white hover:bg-[--navy-light] rounded-lg px-4 py-2.5 font-medium text-sm transition-colors">
              Start a round
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map(course => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 flex items-center justify-between active:bg-[--cream]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[--navy-muted] flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-[--navy]" />
                    </div>
                    <div>
                      <p className="font-medium text-[--text-primary]">{course.name}</p>
                      <p className="text-xs text-[--text-muted]">
                        {[course.city, course.province].filter(Boolean).join(', ') || 'No location'} · {course.roundsPlayed} {course.roundsPlayed === 1 ? 'round' : 'rounds'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.avgScoreVsPar != null && (
                      <span className={`text-sm font-medium font-['JetBrains_Mono'] ${course.avgScoreVsPar <= 0 ? 'text-[--green-gain]' : 'text-[--red-loss]'}`}>
                        {formatScore(course.avgScoreVsPar)}
                      </span>
                    )}
                    <ChevronRight size={16} className="text-[--text-muted]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
