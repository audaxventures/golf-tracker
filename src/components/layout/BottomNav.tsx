'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListOrdered, PlusCircle, MapPin, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rounds', label: 'Rounds', icon: ListOrdered },
  { href: '/rounds/new', label: 'New Round', icon: PlusCircle, accent: true },
  { href: '/courses', label: 'Courses', icon: MapPin },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[--border] safe-bottom">
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon, accent }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 gap-0.5 min-h-[44px] transition-colors duration-150',
                active
                  ? accent ? 'text-[--gold]' : 'text-[--navy]'
                  : 'text-[--text-muted] hover:text-[--navy]'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
