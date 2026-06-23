import { PageHeader } from '@/components/layout/PageHeader'
import Link from 'next/link'

export default function RoundsPage() {
  return (
    <div>
      <PageHeader title="Rounds" />
      <div className="px-4">
        <div className="bg-white rounded-xl border border-[--border] shadow-sm p-8 text-center">
          <p className="font-['DM_Serif_Display'] text-xl text-[--navy] mb-2">No rounds yet</p>
          <p className="text-sm text-[--text-muted] mb-4">Play your first round to get started.</p>
          <Link
            href="/rounds/new"
            className="inline-block bg-[--navy] text-white hover:bg-[--navy-light] rounded-lg px-4 py-2.5 font-medium text-sm transition-colors"
          >
            Start a round
          </Link>
        </div>
      </div>
    </div>
  )
}
