import { PageHeader } from '@/components/layout/PageHeader'
import Link from 'next/link'

export default function CoursesPage() {
  return (
    <div>
      <PageHeader title="Courses" />
      <div className="px-4">
        <div className="bg-white rounded-xl border border-[--border] shadow-sm p-8 text-center">
          <p className="font-['DM_Serif_Display'] text-xl text-[--navy] mb-2">No courses yet</p>
          <p className="text-sm text-[--text-muted] mb-4">Add a course when you start your first round.</p>
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
