import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  trend?: number // positive = good, negative = bad
  trendLabel?: string
  className?: string
}

export function StatCard({ label, value, trend, trendLabel, className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-[--border] shadow-sm p-4', className)}>
      <p className="text-xs text-[--text-muted] uppercase tracking-wide mb-1">{label}</p>
      <p className="font-['DM_Serif_Display'] text-3xl text-[--navy] leading-none">{value}</p>
      {trend != null && (
        <div className={cn(
          'flex items-center gap-1 mt-1.5 text-sm font-medium',
          trend > 0 ? 'text-[--green-gain]' : trend < 0 ? 'text-[--red-loss]' : 'text-[--text-muted]'
        )}>
          {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
          <span>{trendLabel ?? (trend > 0 ? `+${trend}` : trend)}</span>
        </div>
      )}
    </div>
  )
}
