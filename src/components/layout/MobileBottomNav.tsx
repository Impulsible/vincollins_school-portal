/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/layout/MobileBottomNav.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Megaphone,
  FileSpreadsheet,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomNavProps {
  onSignOut?: () => void
}

export function MobileBottomNav({ onSignOut }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Staff', href: '/admin/staff', icon: Briefcase },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { name: 'Report Cards', href: '/admin/report-cards', icon: FileSpreadsheet },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors",
                isActive 
                  ? "text-amber-600" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
        <button
          onClick={onSignOut}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}