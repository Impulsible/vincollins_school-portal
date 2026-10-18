/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Calculator, CalendarCheck, BarChart3, 
  MoreHorizontal, X, FileText, Users, Notebook, 
  ClipboardCheck, Megaphone, UserCog, Settings, LogOut,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StaffMobileBottomNavProps {
  activeTab?: string
  onLogout?: () => void
}

const primaryNav = [
  { name: 'Dashboard', href: '/staff', icon: LayoutDashboard, id: 'overview' },
  { name: 'Scores', href: '/staff/scores', icon: Calculator, id: 'scores' },
  { name: 'Attendance', href: '/staff/attendance', icon: CalendarCheck, id: 'attendance' },
  { name: 'Analytics', href: '/staff/analytics', icon: BarChart3, id: 'analytics' },
]

const moreNav = [
  { name: 'Pupils', href: '/staff/pupils', icon: Users, id: 'pupils' },
  { name: 'Assignments', href: '/staff/assignments', icon: FileText, id: 'assignments' },
  { name: 'Study Notes', href: '/staff/notes', icon: Notebook, id: 'notes' },
  { name: 'Report Cards', href: '/staff/report-cards', icon: ClipboardCheck, id: 'report-cards' },
  { name: 'Announcements', href: '/staff/announcements', icon: Megaphone, id: 'announcements' },
  { name: 'Profile', href: '/staff/profile', icon: UserCog, id: 'profile' },
  { name: 'Settings', href: '/staff/settings', icon: Settings, id: 'settings' },
]

export function StaffMobileBottomNav({ activeTab, onLogout }: StaffMobileBottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Check if the current path is in the "More" menu to highlight the More button
  const isMoreActive = moreNav.some(item => 
    pathname === item.href || pathname?.startsWith(item.href + '/')
  )

  const handleLogout = () => {
    setIsMoreOpen(false)
    if (onLogout) onLogout()
  }

  return (
    <>
      {/* ─── Bottom Nav Bar ──────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/staff' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isMoreActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            )}
          >
            <MoreHorizontal className={cn("h-5 w-5", isMoreActive && "stroke-[2.5px]")} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* ─── "More" Bottom Sheet ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl lg:hidden max-h-[85vh] flex flex-col pb-[env(safe-area-inset-bottom)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">More Options</h3>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Links */}
              <div className="overflow-y-auto p-3">
                <div className="grid grid-cols-1 gap-1">
                  {moreNav.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setIsMoreOpen(false)
                          router.push(item.href)
                        }}
                        className={cn(
                          "flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left",
                          isActive 
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                          isActive ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-slate-100 dark:bg-slate-800"
                        )}>
                          <item.icon className={cn("h-4 w-4", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500")} />
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        <ChevronRight className={cn("h-4 w-4", isActive ? "text-emerald-400" : "text-slate-300")} />
                      </button>
                    )
                  })}
                </div>

                {/* Logout Button */}
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-xl transition-all text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                  >
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-red-100 dark:bg-red-900/50">
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="flex-1 text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}