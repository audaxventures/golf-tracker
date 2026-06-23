'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'

interface HoleInfo {
  par: number
  yardage: number
  holeNumber: number
}

interface BagClubs {
  bagClubs: string[]
}

interface HoleData {
  par: number
  score: number
  // tee
  teeClub: string
  teeDistance: string
  teeShape: string
  teeResult: string
  teeOnPar3: boolean
  // approach
  approachClub: string
  approachDistance: string
  approachLie: string
  approachResult: string
  approachProximity: string
  // short game
  shortGameShots: string
  shortGameClub: string
  shortGameDistance: string
  shortGameLie: string
  shortGameProximity: string
  // putting
  putts: string
  firstPuttDistance: string
  firstPuttResult: string
  secondPuttDistance: string
  // penalties
  penalties: string
  penaltyType: string
  layUp: boolean
  holeNotes: string
}

const TEE_RESULT_OPTIONS = ['Fairway', 'Rough L', 'Rough R', 'Bunker', 'Hazard', 'OB', 'Trees']
const TEE_RESULT_VALUES = ['fairway', 'rough_left', 'rough_right', 'bunker', 'hazard', 'ob', 'trees']
const SHOT_SHAPES = ['Straight', 'Draw', 'Fade', 'Push', 'Pull', 'Hook', 'Slice']
const APPROACH_LIES = ['Fairway', 'Rough', 'Bunker', 'Uphill', 'Downhill']
const APPROACH_LIE_VALS = ['fairway', 'rough', 'bunker', 'uphill', 'downhill']
const APPROACH_RESULTS = ['GIR', 'Missed short', 'Missed long', 'Missed left', 'Missed right']
const APPROACH_RESULT_VALS = ['gir', 'missed_short', 'missed_long', 'missed_left', 'missed_right']
const SHORT_LIES = ['Tight', 'Rough', 'Fringe', 'Bunker']
const SHORT_LIE_VALS = ['tight', 'rough', 'fringe', 'bunker']
const PUTT_RESULTS = ['Made', 'Left', 'Right', 'Short', 'Long']
const PUTT_RESULT_VALS = ['made', 'left', 'right', 'short', 'long']
const PENALTY_TYPES = ['OB', 'Water', 'Unplayable']
const PENALTY_TYPE_VALS = ['ob', 'water', 'unplayable']

function PillSelect({
  options, values, value, onChange, cols = 3
}: {
  options: string[]
  values?: string[]
  value: string
  onChange: (v: string) => void
  cols?: number
}) {
  return (
    <div className={cn('grid gap-2', cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
      {options.map((opt, i) => {
        const val = values ? values[i] : opt.toLowerCase()
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(val)}
            className={cn(
              'py-2.5 px-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
              value === val
                ? 'bg-[--navy] text-white'
                : 'bg-[--cream-dark] text-[--text-muted] hover:bg-[--navy-muted]'
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function TapButtons({
  options, value, onChange
}: {
  options: (string | number)[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(String(opt))}
          className={cn(
            'flex-1 h-14 rounded-xl text-lg font-medium transition-colors',
            value === String(opt)
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

function NumberInput({ label, value, onChange, placeholder, unit }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; unit?: string
}) {
  return (
    <div>
      <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-12 px-3 rounded-xl border border-[--border] text-base text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--navy]"
        />
        {unit && <span className="text-sm text-[--text-muted] min-w-[24px]">{unit}</span>}
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return <p className="text-xs text-[--text-muted] uppercase tracking-wide font-medium mb-3">{title}</p>
}

export function HoleEntryWizard({
  roundId, holeNumber, holeInfo, bagClubs
}: {
  roundId: string
  holeNumber: number
  holeInfo: HoleInfo
  bagClubs: string[]
}) {
  const router = useRouter()
  const isPar3 = holeInfo.par === 3
  const [saving, setSaving] = useState(false)
  const [penaltiesOpen, setPenaltiesOpen] = useState(false)
  const [data, setData] = useState<HoleData>({
    par: holeInfo.par,
    score: holeInfo.par,
    teeClub: '', teeDistance: '', teeShape: '', teeResult: '', teeOnPar3: isPar3,
    approachClub: '', approachDistance: '', approachLie: '', approachResult: '', approachProximity: '',
    shortGameShots: '0', shortGameClub: '', shortGameDistance: '', shortGameLie: '', shortGameProximity: '',
    putts: '', firstPuttDistance: '', firstPuttResult: '', secondPuttDistance: '',
    penalties: '0', penaltyType: '', layUp: false, holeNotes: '',
  })

  // Load existing data if any
  useEffect(() => {
    fetch(`/api/holes/${roundId}/${holeNumber}`)
      .then(r => r.json())
      .then(existing => {
        if (existing) {
          setData(prev => ({
            ...prev,
            score: existing.score ?? holeInfo.par,
            teeClub: existing.teeClub ?? '',
            teeDistance: existing.teeDistance != null ? String(existing.teeDistance) : '',
            teeShape: existing.teeShape ?? '',
            teeResult: existing.teeResult ?? '',
            approachClub: existing.approachClub ?? '',
            approachDistance: existing.approachDistance != null ? String(existing.approachDistance) : '',
            approachLie: existing.approachLie ?? '',
            approachResult: existing.approachResult ?? '',
            approachProximity: existing.approachProximity != null ? String(existing.approachProximity) : '',
            shortGameShots: existing.shortGameShots != null ? String(existing.shortGameShots) : '0',
            shortGameClub: existing.shortGameClub ?? '',
            shortGameDistance: existing.shortGameDistance != null ? String(existing.shortGameDistance) : '',
            shortGameLie: existing.shortGameLie ?? '',
            shortGameProximity: existing.shortGameProximity != null ? String(existing.shortGameProximity) : '',
            putts: existing.putts != null ? String(existing.putts) : '',
            firstPuttDistance: existing.firstPuttDistance != null ? String(existing.firstPuttDistance) : '',
            firstPuttResult: existing.firstPuttResult ?? '',
            secondPuttDistance: existing.secondPuttDistance != null ? String(existing.secondPuttDistance) : '',
            penalties: existing.penalties != null ? String(existing.penalties) : '0',
            penaltyType: existing.penaltyType ?? '',
            layUp: existing.layUp ?? false,
            holeNotes: existing.holeNotes ?? '',
          }))
        }
      })
      .catch(() => {})
  }, [roundId, holeNumber, holeInfo.par])

  function set(field: keyof HoleData, value: string | number | boolean) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const missedGir = data.approachResult && data.approachResult !== 'gir'
  const needsShortGame = missedGir
  const puttsNum = parseInt(data.putts) || 0

  async function save() {
    setSaving(true)
    const payload: Record<string, unknown> = {
      par: holeInfo.par,
      score: data.score,
      teeOnPar3: isPar3,
    }

    if (!isPar3) {
      if (data.teeClub) payload.teeClub = data.teeClub
      if (data.teeDistance) payload.teeDistance = parseInt(data.teeDistance)
      if (data.teeShape) payload.teeShape = data.teeShape
      if (data.teeResult) payload.teeResult = data.teeResult
    }

    if (data.approachDistance) payload.approachDistance = parseInt(data.approachDistance)
    if (data.approachClub) payload.approachClub = data.approachClub
    if (data.approachLie) payload.approachLie = data.approachLie
    if (data.approachResult) payload.approachResult = data.approachResult
    if (data.approachResult === 'gir' && data.approachProximity) payload.approachProximity = parseInt(data.approachProximity)

    if (needsShortGame) {
      payload.shortGameShots = parseInt(data.shortGameShots) || 1
      if (data.shortGameClub) payload.shortGameClub = data.shortGameClub
      if (data.shortGameDistance) payload.shortGameDistance = parseInt(data.shortGameDistance)
      if (data.shortGameLie) payload.shortGameLie = data.shortGameLie
      if (data.shortGameProximity) payload.shortGameProximity = parseInt(data.shortGameProximity)
    } else {
      payload.shortGameShots = 0
    }

    if (data.putts) payload.putts = parseInt(data.putts)
    if (data.firstPuttDistance) payload.firstPuttDistance = parseInt(data.firstPuttDistance)
    if (data.firstPuttResult) payload.firstPuttResult = data.firstPuttResult
    if (puttsNum >= 2 && data.secondPuttDistance) payload.secondPuttDistance = parseInt(data.secondPuttDistance)
    payload.threePutt = puttsNum >= 3

    payload.penalties = parseInt(data.penalties) || 0
    if (data.penaltyType) payload.penaltyType = data.penaltyType
    payload.layUp = data.layUp
    if (data.holeNotes) payload.holeNotes = data.holeNotes

    await fetch(`/api/holes/${roundId}/${holeNumber}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)

    if (holeNumber >= 18) {
      router.push(`/round-entry/${roundId}/complete`)
    } else {
      router.push(`/round-entry/${roundId}/${holeNumber + 1}`)
    }
  }

  return (
    <div className="space-y-5 pb-28">

      {/* ── Score (always visible at top) ── */}
      <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4">
        <SectionHeader title="Score" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[--text-muted]">Gross strokes</span>
          <span className={cn(
            "text-lg font-['DM_Serif_Display']",
            data.score < holeInfo.par ? 'text-[--green-gain]' :
            data.score > holeInfo.par ? 'text-[--red-loss]' : 'text-[--navy]'
          )}>
            {data.score > holeInfo.par ? `+${data.score - holeInfo.par}` :
             data.score < holeInfo.par ? `${data.score - holeInfo.par}` : 'E'}
          </span>
        </div>
        <TapButtons
          options={[holeInfo.par - 2, holeInfo.par - 1, holeInfo.par, holeInfo.par + 1, holeInfo.par + 2, holeInfo.par + 3].filter(s => s > 0)}
          value={String(data.score)}
          onChange={v => set('score', parseInt(v))}
        />
      </div>

      {/* ── Tee Shot (par 4 & 5 only) ── */}
      {!isPar3 && (
        <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 space-y-4">
          <SectionHeader title="Tee shot" />

          <div>
            <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Club</label>
            <div className="flex flex-wrap gap-2">
              {['Driver', '3-Wood', '5-Wood', '4-Hybrid', '3-Iron', '4-Iron', '5-Iron'].map(club => (
                <button
                  key={club}
                  type="button"
                  onClick={() => set('teeClub', club)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
                    data.teeClub === club ? 'bg-[--navy] text-white' : 'bg-[--cream-dark] text-[--text-muted] hover:bg-[--navy-muted]'
                  )}
                >
                  {club}
                </button>
              ))}
            </div>
          </div>

          <NumberInput label="Carry distance" value={data.teeDistance} onChange={v => set('teeDistance', v)} placeholder="260" unit="yds" />

          <div>
            <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Shot shape</label>
            <PillSelect options={SHOT_SHAPES} value={data.teeShape} onChange={v => set('teeShape', v)} cols={4} />
          </div>

          <div>
            <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Result</label>
            <PillSelect options={TEE_RESULT_OPTIONS} values={TEE_RESULT_VALUES} value={data.teeResult} onChange={v => set('teeResult', v)} />
          </div>
        </div>
      )}

      {/* ── Approach ── */}
      <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 space-y-4">
        <SectionHeader title={isPar3 ? 'Tee shot (approach)' : 'Approach'} />

        <NumberInput label="Distance to pin" value={data.approachDistance} onChange={v => set('approachDistance', v)} placeholder="150" unit="yds" />

        <div>
          <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-1.5">Club</label>
          <select
            value={data.approachClub}
            onChange={e => set('approachClub', e.target.value)}
            className="w-full h-12 px-3 rounded-xl border border-[--border] text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--navy]"
          >
            <option value="">Select club…</option>
            {bagClubs.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Lie</label>
          <PillSelect options={APPROACH_LIES} values={APPROACH_LIE_VALS} value={data.approachLie} onChange={v => set('approachLie', v)} />
        </div>

        <div>
          <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Result</label>
          <PillSelect options={APPROACH_RESULTS} values={APPROACH_RESULT_VALS} value={data.approachResult} onChange={v => set('approachResult', v)} cols={2} />
        </div>

        {data.approachResult === 'gir' && (
          <NumberInput label="Proximity to hole" value={data.approachProximity} onChange={v => set('approachProximity', v)} placeholder="18" unit="ft" />
        )}
      </div>

      {/* ── Short Game (if GIR missed) ── */}
      {needsShortGame && (
        <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 space-y-4">
          <SectionHeader title="Short game" />

          <div>
            <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Chip / pitch shots</label>
            <TapButtons options={[1, 2, 3]} value={data.shortGameShots} onChange={v => set('shortGameShots', v)} />
          </div>

          <div>
            <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-1.5">Club</label>
            <select
              value={data.shortGameClub}
              onChange={e => set('shortGameClub', e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-[--border] text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--navy]"
            >
              <option value="">Select club…</option>
              {bagClubs.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <NumberInput label="Distance from pin" value={data.shortGameDistance} onChange={v => set('shortGameDistance', v)} placeholder="20" unit="yds" />

          <div>
            <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Lie</label>
            <PillSelect options={SHORT_LIES} values={SHORT_LIE_VALS} value={data.shortGameLie} onChange={v => set('shortGameLie', v)} />
          </div>

          <NumberInput label="Proximity after" value={data.shortGameProximity} onChange={v => set('shortGameProximity', v)} placeholder="6" unit="ft" />
        </div>
      )}

      {/* ── Putting ── */}
      <div className="bg-white rounded-xl border border-[--border] shadow-sm p-4 space-y-4">
        <SectionHeader title="Putting" />

        <NumberInput label="First putt distance" value={data.firstPuttDistance} onChange={v => set('firstPuttDistance', v)} placeholder="15" unit="ft" />

        <div>
          <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Total putts</label>
          <TapButtons options={[1, 2, 3, '4+']} value={data.putts} onChange={v => set('putts', v === '4+' ? '4' : v)} />
        </div>

        {data.putts && (
          <div>
            <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">First putt result</label>
            <PillSelect options={PUTT_RESULTS} values={PUTT_RESULT_VALS} value={data.firstPuttResult} onChange={v => set('firstPuttResult', v)} />
          </div>
        )}

        {puttsNum >= 2 && (
          <NumberInput label="Second putt distance (optional)" value={data.secondPuttDistance} onChange={v => set('secondPuttDistance', v)} placeholder="3" unit="ft" />
        )}
      </div>

      {/* ── Penalties & Notes (collapsible) ── */}
      <div className="bg-white rounded-xl border border-[--border] shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setPenaltiesOpen(p => !p)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-sm text-[--text-muted] hover:bg-[--cream] transition-colors"
        >
          <span>Penalties &amp; notes {parseInt(data.penalties) > 0 ? `(${data.penalties})` : ''}</span>
          {penaltiesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {penaltiesOpen && (
          <div className="px-4 pb-4 space-y-4 border-t border-[--border]">
            <div className="pt-4">
              <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Penalties</label>
              <TapButtons options={[0, 1, 2, '3+']} value={data.penalties} onChange={v => set('penalties', v === '3+' ? '3' : v)} />
            </div>

            {parseInt(data.penalties) > 0 && (
              <div>
                <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Type</label>
                <PillSelect options={PENALTY_TYPES} values={PENALTY_TYPE_VALS} value={data.penaltyType} onChange={v => set('penaltyType', v)} />
              </div>
            )}

            <div>
              <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-2">Lay-up?</label>
              <div className="flex rounded-lg overflow-hidden border border-[--border] w-32">
                {['Yes', 'No'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('layUp', opt === 'Yes')}
                    className={cn(
                      'flex-1 py-2 text-sm font-medium transition-colors',
                      (data.layUp && opt === 'Yes') || (!data.layUp && opt === 'No')
                        ? 'bg-[--navy] text-white'
                        : 'bg-white text-[--text-muted] hover:bg-[--cream]'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-[--text-muted] uppercase tracking-wide mb-1.5">Note</label>
              <textarea
                value={data.holeNotes}
                onChange={e => set('holeNotes', e.target.value)}
                placeholder="Any notes about this hole…"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy] resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[--border] safe-bottom max-w-lg mx-auto">
        <button
          onClick={save}
          disabled={saving}
          className="w-full h-12 bg-[--navy] text-white rounded-xl font-medium text-base hover:bg-[--navy-light] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? 'Saving…' : (
            <>
              <Check size={18} />
              {holeNumber >= 18 ? 'Complete round' : `Save & hole ${holeNumber + 1}`}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
