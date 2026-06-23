import { PageHeader } from '@/components/layout/PageHeader'

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Audax Golf"
        subtitle="Dashboard coming in Phase 6"
      />
      <div className="px-4">
        <div className="bg-white rounded-xl border border-[--border] shadow-sm p-8 text-center">
          <div className="w-3 h-3 rounded-full bg-[--gold] mx-auto mb-4" />
          <p className="font-['DM_Serif_Display'] text-xl text-[--navy] mb-2">Ready to play</p>
          <p className="text-sm text-[--text-muted]">Start a new round to begin tracking your stats.</p>
        </div>
      </div>
    </div>
  )
}
