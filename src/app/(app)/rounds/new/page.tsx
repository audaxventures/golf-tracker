'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Course {
  id: string
  name: string
  city: string | null
  province: string | null
  tees: { id: string; name: string; rating: number; slope: number; par: number }[]
}

type Step = 1 | 2 | 3

const WIND_OPTIONS = ['Calm', 'Light', 'Moderate', 'Strong']
const CONDITION_OPTIONS = ['Dry', 'Wet', 'Soft', 'Firm']

function PillSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt.toLowerCase())}
          className={cn(
            'px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px]',
            value === opt.toLowerCase()
              ? 'bg-[--navy] text-white'
              : 'bg-[--cream-dark] text-[--text-muted] hover:bg-[--navy-muted]'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function NewRoundPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState('')
  const [showNewCourse, setShowNewCourse] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedTeeId, setSelectedTeeId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // New course form
  const [newCourse, setNewCourse] = useState({
    name: '', city: '', province: '',
    tee: { name: 'Blue', rating: '', slope: '', par: '72', yardage: '' }
  })

  // Conditions
  const [conditions, setConditions] = useState({
    datePlayed: format(new Date(), 'yyyy-MM-dd'),
    temperature: '',
    windSpeed: '',
    conditions: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(setCourses)
  }, [])

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function createNewCourse() {
    if (!newCourse.name || !newCourse.tee.rating || !newCourse.tee.slope) return
    setLoading(true)
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCourse, tee: { ...newCourse.tee, rating: parseFloat(newCourse.tee.rating), slope: parseInt(newCourse.tee.slope) } }),
    })
    const course = await res.json()
    setCourses(prev => [...prev, course])
    setSelectedCourse(course)
    setSelectedTeeId(course.tees[0]?.id ?? '')
    setShowNewCourse(false)
    setLoading(false)
    setStep(2)
  }

  async function startRound() {
    if (!selectedCourse || !selectedTeeId) return
    setLoading(true)
    const res = await fetch('/api/rounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: selectedCourse.id,
        teeId: selectedTeeId,
        datePlayed: conditions.datePlayed,
        temperature: conditions.temperature || null,
        windSpeed: conditions.windSpeed || null,
        conditions: conditions.conditions || null,
        notes: conditions.notes || null,
      }),
    })
    const round = await res.json()
    setLoading(false)
    router.push(`/round-entry/${round.id}/1`)
  }

  return (
    <div className="min-h-screen bg-[--cream]">
      <div className="px-4 pt-5 pb-2">
        <Link href="/rounds" className="flex items-center gap-1 text-[--text-muted] text-sm mb-4 hover:text-[--navy]">
          <ArrowLeft size={14} /> Rounds
        </Link>
        <h1 className="font-['DM_Serif_Display'] text-2xl text-[--navy]">New round</h1>
        {/* Step indicator */}
        <div className="flex gap-2 mt-3">
          {([1,2,3] as Step[]).map(s => (
            <div key={s} className={cn('h-1 flex-1 rounded-full transition-colors', s <= step ? 'bg-[--navy]' : 'bg-[--cream-dark]')} />
          ))}
        </div>
        <p className="text-xs text-[--text-muted] mt-1">
          {step === 1 ? 'Step 1 — Select course' : step === 2 ? 'Step 2 — Conditions' : 'Step 3 — Confirm'}
        </p>
      </div>

      <div className="px-4 space-y-4 pb-24">

        {/* ── Step 1: Course ── */}
        {step === 1 && !showNewCourse && (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-muted]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses…"
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-[--border] bg-white text-sm text-[--text-primary] focus:outline-none focus:ring-2 focus:ring-[--navy]"
              />
            </div>

            <button
              onClick={() => setShowNewCourse(true)}
              className="w-full h-11 flex items-center justify-center gap-2 border-2 border-dashed border-[--border] rounded-xl text-sm text-[--text-muted] hover:border-[--navy] hover:text-[--navy] transition-colors"
            >
              <Plus size={16} /> Add new course
            </button>

            <div className="bg-white rounded-xl border border-[--border] shadow-sm divide-y divide-[--border]">
              {filteredCourses.length === 0 ? (
                <p className="px-4 py-6 text-sm text-[--text-muted] text-center">No courses found</p>
              ) : filteredCourses.map(course => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course)
                    setSelectedTeeId(course.tees[0]?.id ?? '')
                    setStep(2)
                  }}
                  className="w-full px-4 py-3.5 text-left hover:bg-[--cream] transition-colors"
                >
                  <p className="font-medium text-[--text-primary]">{course.name}</p>
                  <p className="text-xs text-[--text-muted]">{[course.city, course.province].filter(Boolean).join(', ')}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── New course form ── */}
        {step === 1 && showNewCourse && (
          <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 space-y-4">
            <h2 className="font-['DM_Serif_Display'] text-lg text-[--navy]">Add course</h2>

            {[
              { label: 'Course name *', key: 'name', placeholder: 'Elmhurst Golf & Country Club' },
              { label: 'City', key: 'city', placeholder: 'Winnipeg' },
              { label: 'Province / State', key: 'province', placeholder: 'MB' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-1">{label}</label>
                <input
                  type="text"
                  value={newCourse[key as keyof typeof newCourse] as string}
                  onChange={e => setNewCourse(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full h-11 px-3 rounded-lg border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy]"
                />
              </div>
            ))}

            <div className="border-t border-[--border] pt-3">
              <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-3">Tee details</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tee name', key: 'name', placeholder: 'Blue' },
                  { label: 'Par', key: 'par', placeholder: '72', numeric: true },
                  { label: 'Course rating *', key: 'rating', placeholder: '71.4', numeric: true },
                  { label: 'Slope rating *', key: 'slope', placeholder: '131', numeric: true },
                  { label: 'Yardage', key: 'yardage', placeholder: '6850', numeric: true },
                ].map(({ label, key, placeholder, numeric }) => (
                  <div key={key}>
                    <label className="block text-xs text-[--text-muted] mb-1">{label}</label>
                    <input
                      type="text"
                      inputMode={numeric ? 'decimal' : 'text'}
                      value={newCourse.tee[key as keyof typeof newCourse.tee]}
                      onChange={e => setNewCourse(p => ({ ...p, tee: { ...p.tee, [key]: e.target.value } }))}
                      placeholder={placeholder}
                      className="w-full h-11 px-3 rounded-lg border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowNewCourse(false)} className="flex-1 h-11 border border-[--border] rounded-lg text-sm text-[--text-muted] hover:bg-[--cream] transition-colors">
                Cancel
              </button>
              <button
                onClick={createNewCourse}
                disabled={loading || !newCourse.name || !newCourse.tee.rating || !newCourse.tee.slope}
                className="flex-1 h-11 bg-[--navy] text-white rounded-lg text-sm font-medium hover:bg-[--navy-light] transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding…' : 'Add course'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Conditions ── */}
        {step === 2 && (
          <div className="space-y-4">
            {selectedCourse && (
              <div className="bg-[--navy-muted] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[--navy] text-sm">{selectedCourse.name}</p>
                  {selectedCourse.tees.length > 1 && (
                    <select
                      value={selectedTeeId}
                      onChange={e => setSelectedTeeId(e.target.value)}
                      className="mt-1 text-xs text-[--text-muted] bg-transparent border-none outline-none"
                    >
                      {selectedCourse.tees.map(t => (
                        <option key={t.id} value={t.id}>{t.name} tees (par {t.par}, rating {t.rating}, slope {t.slope})</option>
                      ))}
                    </select>
                  )}
                  {selectedCourse.tees.length === 1 && (
                    <p className="text-xs text-[--text-muted]">{selectedCourse.tees[0].name} tees · par {selectedCourse.tees[0].par} · {selectedCourse.tees[0].rating}/{selectedCourse.tees[0].slope}</p>
                  )}
                </div>
                <button onClick={() => setStep(1)} className="text-xs text-[--navy] underline">Change</button>
              </div>
            )}

            <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 space-y-4">
              <div>
                <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-1">Date</label>
                <input
                  type="date"
                  value={conditions.datePlayed}
                  onChange={e => setConditions(p => ({ ...p, datePlayed: e.target.value }))}
                  className="w-full h-11 px-3 rounded-lg border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy]"
                />
              </div>

              <div>
                <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-1">Temperature (°C)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={conditions.temperature}
                  onChange={e => setConditions(p => ({ ...p, temperature: e.target.value }))}
                  placeholder="20"
                  className="w-full h-11 px-3 rounded-lg border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy]"
                />
              </div>

              <div>
                <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Wind</label>
                <PillSelect options={WIND_OPTIONS} value={conditions.windSpeed} onChange={v => setConditions(p => ({ ...p, windSpeed: v }))} />
              </div>

              <div>
                <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Conditions</label>
                <PillSelect options={CONDITION_OPTIONS} value={conditions.conditions} onChange={v => setConditions(p => ({ ...p, conditions: v }))} />
              </div>

              <div>
                <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-1">Notes (optional)</label>
                <textarea
                  value={conditions.notes}
                  onChange={e => setConditions(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any notes about today's round…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy] resize-none"
                />
              </div>
            </div>

            <button onClick={() => setStep(3)} className="w-full h-11 bg-[--navy] text-white rounded-lg font-medium text-sm hover:bg-[--navy-light] transition-colors">
              Continue
            </button>
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && selectedCourse && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 space-y-3">
              <h2 className="font-['DM_Serif_Display'] text-lg text-[--navy]">Ready to start</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[--text-muted]">Course</span>
                  <span className="text-[--text-primary] font-medium">{selectedCourse.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--text-muted]">Tees</span>
                  <span className="text-[--text-primary]">{selectedCourse.tees.find(t => t.id === selectedTeeId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[--text-muted]">Date</span>
                  <span className="text-[--text-primary]">{format(new Date(conditions.datePlayed + 'T12:00:00'), 'MMMM d, yyyy')}</span>
                </div>
                {conditions.windSpeed && (
                  <div className="flex justify-between">
                    <span className="text-[--text-muted]">Wind</span>
                    <span className="text-[--text-primary] capitalize">{conditions.windSpeed}</span>
                  </div>
                )}
                {conditions.conditions && (
                  <div className="flex justify-between">
                    <span className="text-[--text-muted]">Conditions</span>
                    <span className="text-[--text-primary] capitalize">{conditions.conditions}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={startRound}
              disabled={loading}
              className="w-full h-12 bg-[--gold] text-white rounded-xl font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Starting…' : 'Start round →'}
            </button>

            <button onClick={() => setStep(2)} className="w-full text-sm text-[--text-muted] hover:text-[--navy]">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
