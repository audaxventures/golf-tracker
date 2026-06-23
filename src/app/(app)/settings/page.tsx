'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Plus, X, Check } from 'lucide-react'
import { DEFAULT_BAG_CLUBS } from '@/types/golf'
import { cn } from '@/lib/utils'

interface Settings {
  id: string
  bagClubs: string[]
  goalGirPercent: number | null
  goalFairwayPercent: number | null
  goalScramblingPct: number | null
  goalSandSavePct: number | null
  goalPuttsPerRound: number | null
  goalThreePuttPct: number | null
  goalAvgFirstPutt: number | null
  goalSgPutting: number | null
  goalSgApproach: number | null
  goalSgOffTee: number | null
  distanceUnit: string
  sgBaseline: string
  defaultTeeColor: string | null
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 mb-6">
      <h2 className="font-['DM_Serif_Display'] text-lg text-[--navy] mb-3">{title}</h2>
      <div className="bg-white rounded-xl border border-[--border] shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-[--border] last:border-0">
      <span className="text-sm text-[--text-primary]">{label}</span>
      <div className="ml-4">{children}</div>
    </div>
  )
}

function GoalInput({
  label, value, onChange, unit = '', placeholder
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
  unit?: string
  placeholder?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[--border] last:border-0">
      <span className="text-sm text-[--text-primary] flex-1">{label}</span>
      <div className="flex items-center gap-1.5 ml-4">
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
          placeholder={placeholder}
          className="w-20 h-9 px-2 text-right rounded-lg border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy]"
        />
        {unit && <span className="text-xs text-[--text-muted] min-w-[24px]">{unit}</span>}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newClub, setNewClub] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { setSettings(data); setLoading(false) })
  }, [])

  const save = useCallback(async (patch: Partial<Settings>) => {
    if (!settings) return
    setSaving(true)
    const updated = { ...settings, ...patch }
    setSettings(updated)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [settings])

  function addClub() {
    if (!newClub.trim() || !settings) return
    const clubs = [...settings.bagClubs, newClub.trim()]
    save({ bagClubs: clubs })
    setNewClub('')
  }

  function removeClub(club: string) {
    if (!settings) return
    save({ bagClubs: settings.bagClubs.filter(c => c !== club) })
  }

  if (loading) {
    return (
      <div className="px-4 pt-5">
        <div className="h-8 w-36 bg-[--cream-dark] rounded animate-pulse mb-6" />
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-[--border] shadow-sm p-4 mb-4 space-y-3">
            {[1,2,3].map(j => <div key={j} className="h-10 bg-[--cream-dark] rounded animate-pulse" />)}
          </div>
        ))}
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="font-['DM_Serif_Display'] text-2xl text-[--navy]">Settings</h1>
        {(saving || saved) && (
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-medium transition-colors',
            saved ? 'text-[--green-gain]' : 'text-[--text-muted]'
          )}>
            {saved ? <><Check size={12} /> Saved</> : 'Saving…'}
          </div>
        )}
      </div>

      {/* My Bag */}
      <Section title="My bag">
        <div className="p-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            {settings.bagClubs.map(club => (
              <div
                key={club}
                className="flex items-center gap-1.5 bg-[--navy-muted] text-[--navy] text-xs font-medium rounded-full px-3 py-1.5"
              >
                {club}
                <button
                  onClick={() => removeClub(club)}
                  className="text-[--text-muted] hover:text-[--red-loss] transition-colors ml-0.5"
                  aria-label={`Remove ${club}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newClub}
              onChange={e => setNewClub(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addClub()}
              placeholder="Add club…"
              className="flex-1 h-9 px-3 rounded-lg border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy]"
            />
            <button
              onClick={addClub}
              className="h-9 w-9 flex items-center justify-center bg-[--navy] text-white rounded-lg hover:bg-[--navy-light] transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={() => save({ bagClubs: DEFAULT_BAG_CLUBS })}
            className="text-xs text-[--text-muted] hover:text-[--navy] underline underline-offset-2 transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </Section>

      {/* Stat goals */}
      <Section title="Stat goals">
        <GoalInput label="GIR %" value={settings.goalGirPercent} onChange={v => save({ goalGirPercent: v })} unit="%" placeholder="65" />
        <GoalInput label="Fairway %" value={settings.goalFairwayPercent} onChange={v => save({ goalFairwayPercent: v })} unit="%" placeholder="70" />
        <GoalInput label="Scrambling %" value={settings.goalScramblingPct} onChange={v => save({ goalScramblingPct: v })} unit="%" placeholder="55" />
        <GoalInput label="Sand save %" value={settings.goalSandSavePct} onChange={v => save({ goalSandSavePct: v })} unit="%" placeholder="50" />
        <GoalInput label="Putts per round" value={settings.goalPuttsPerRound} onChange={v => save({ goalPuttsPerRound: v })} placeholder="30" />
        <GoalInput label="3-putt %" value={settings.goalThreePuttPct} onChange={v => save({ goalThreePuttPct: v })} unit="%" placeholder="10" />
        <GoalInput label="Avg first putt distance" value={settings.goalAvgFirstPutt} onChange={v => save({ goalAvgFirstPutt: v })} unit="ft" placeholder="20" />
        <GoalInput label="SG: Putting" value={settings.goalSgPutting} onChange={v => save({ goalSgPutting: v })} placeholder="0.0" />
        <GoalInput label="SG: Approach" value={settings.goalSgApproach} onChange={v => save({ goalSgApproach: v })} placeholder="0.0" />
        <GoalInput label="SG: Off the tee" value={settings.goalSgOffTee} onChange={v => save({ goalSgOffTee: v })} placeholder="0.0" />
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <SettingRow label="Distance unit">
          <div className="flex rounded-lg overflow-hidden border border-[--border]">
            {['yards', 'metres'].map(unit => (
              <button
                key={unit}
                onClick={() => save({ distanceUnit: unit })}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  settings.distanceUnit === unit
                    ? 'bg-[--navy] text-white'
                    : 'bg-white text-[--text-muted] hover:bg-[--cream]'
                )}
              >
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="SG baseline">
          <select
            value={settings.sgBaseline}
            onChange={e => save({ sgBaseline: e.target.value })}
            className="h-9 px-2 rounded-lg border border-[--border] text-sm text-[--text-primary] bg-white focus:outline-none focus:ring-2 focus:ring-[--navy]"
          >
            <option value="pga_tour">PGA Tour</option>
            <option value="scratch">Scratch golfer</option>
            <option value="plus2">5-handicap</option>
          </select>
        </SettingRow>
        <SettingRow label="Default tee color">
          <input
            type="text"
            value={settings.defaultTeeColor ?? ''}
            onChange={e => save({ defaultTeeColor: e.target.value || null })}
            placeholder="e.g. Blue"
            className="w-28 h-9 px-3 rounded-lg border border-[--border] text-sm text-[--text-primary] bg-[--cream] focus:outline-none focus:ring-2 focus:ring-[--navy]"
          />
        </SettingRow>
      </Section>
    </div>
  )
}
