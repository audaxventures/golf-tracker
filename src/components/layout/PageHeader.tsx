import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between px-4 pt-5 pb-3', className)}>
      <div>
        <h1 className="font-['DM_Serif_Display'] text-2xl text-[--navy] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[--text-muted] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}
