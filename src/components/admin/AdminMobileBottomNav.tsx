'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, GraduationCap, Briefcase, BookOpen, 
  MoreHorizontal, X, FileCheck, MessageSquare, 
  TrendingUp, Megaphone, Bell, Settings, HelpCircle, 
  LogOut, ChevronRight, School
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminMobileBottomNavProps {
  onLogout?: () => void
  pendingReports?: number
  pendingInquiries?: number
  unreadNotifications?: number
  accentColor?: string
}

const primaryNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, id: 'overview' },
  { name: 'Students', href: '/admin/students', icon: GraduationCap, id: 'students' },
  { name: 'Staff', href: '/admin/staff', icon: Briefcase, id: 'staff' },
  { name: 'Broadsheet', href: '/admin/broadsheet', icon: BookOpen, id: 'broadsheet' },
]

export function AdminMobileBottomNav({ 
  onLogout, 
  pendingReports = 0, 
  pendingInquiries = 0, 
  unreadNotifications = 0,
  accentColor = '#0A2472' 
}: AdminMobileBottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const moreNav = [
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, id: 'notifications', badge: unreadNotifications },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone, id: 'announcements' },
    { name: 'Teacher Classes', href: '/admin/teacher-classes', icon: School, id: 'teacher-classes' },
    { name: 'Report Cards', href: '/admin/report-cards', icon: FileCheck, id: 'report-cards', badge: pendingReports },
    { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare, id: 'inquiries', badge: pendingInquiries },
    { name: 'Promotions', href: '/admin/promotions', icon: TrendingUp, id: 'promotions' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, id: 'settings' },
    { name: 'Help & Support', href: '/admin/help', icon: HelpCircle, id: 'help' },
  ]

  // Aggregate badge count for the "More" tab indicator
  const moreBadgeTotal = moreNav.reduce((sum, item) => sum + (item.badge ?? 0), 0)

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMoreOpen])

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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 lg:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around h-16 px-1">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none rounded-xl"
                style={isActive ? { color: accentColor } : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-bottom-nav-indicator"
                    className="absolute inset-0 opacity-10 rounded-xl"
                    style={{ backgroundColor: accentColor }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon 
                  className={cn(
                    'h-[22px] w-[22px] transition-transform group-active:scale-95',
                    isActive ? 'stroke-[2.5px]' : 'text-slate-500 dark:text-slate-400 stroke-[2px]'
                  )} 
                />
                <span className={cn(
                  'text-[10px] tracking-wide transition-colors',
                  isActive ? 'font-semibold' : 'font-medium text-slate-500 dark:text-slate-400'
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="group relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none rounded-xl"
            style={isMoreActive ? { color: accentColor } : undefined}
          >
            {isMoreActive && (
              <motion.div
                layoutId="admin-bottom-nav-indicator"
                className="absolute inset-0 opacity-10 rounded-xl"
                style={{ backgroundColor: accentColor }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative">
              <MoreHorizontal 
                className={cn(
                  'h-[22px] w-[22px] transition-transform group-active:scale-95',
                  isMoreActive ? 'stroke-[2.5px]' : 'text-slate-500 dark:text-slate-400 stroke-[2px]'
                )} 
              />
              {/* Aggregate badge on More tab when sheet is closed */}
              {!isMoreOpen && moreBadgeTotal > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {moreBadgeTotal > 99 ? '99+' : moreBadgeTotal}
                </span>
              )}
            </div>
            <span className={cn(
              'text-[10px] tracking-wide transition-colors',
              isMoreActive ? 'font-semibold' : 'font-medium text-slate-500 dark:text-slate-400'
            )}>
              More
            </span>
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.y > 100 || velocity.y > 500) {
                  setIsMoreOpen(false)
                }
              }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl lg:hidden max-h-[85dvh] flex flex-col pb-[env(safe-area-inset-bottom)]"
            >
              {/* Drag Indicator & Header */}
              <div className="flex flex-col items-center pt-3 pb-2 px-4 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4" />
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Admin Menu</h3>
                  <button
                    onClick={() => setIsMoreOpen(false)}
                    aria-label="Close menu"
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Links */}
              <div className="overflow-y-auto overscroll-contain px-4 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-1 gap-1.5">
                  {moreNav.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                    const hasBadge = item.badge !== undefined && item.badge > 0
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setIsMoreOpen(false)
                          router.push(item.href)
                        }}
                        className={cn(
                          'flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left outline-none focus-visible:ring-2',
                          isActive
                            ? ''
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 active:scale-[0.98]'
                        )}
                        style={isActive ? { 
                          backgroundColor: `${accentColor}15`,
                          color: accentColor 
                        } : undefined}
                      >
                        <div 
                          className={cn(
                            'relative h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                            isActive
                              ? ''
                              : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
                          )}
                          style={isActive ? { backgroundColor: `${accentColor}25` } : undefined}
                        >
                          <item.icon 
                            className={cn('h-5 w-5', !isActive && 'text-slate-500 dark:text-slate-400')} 
                            style={isActive ? { color: accentColor } : undefined}
                          />
                        </div>
                        <span className="flex-1 text-[15px] font-semibold">{item.name}</span>
                        {hasBadge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm mr-1">
                            {item.badge! > 99 ? '99+' : item.badge}
                          </span>
                        )}
                        <ChevronRight 
                          className={cn('h-4 w-4', !isActive && 'text-slate-300 dark:text-slate-600')} 
                          style={isActive ? { color: accentColor } : undefined}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* Logout Button */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-2xl transition-all text-left bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-red-900/40 border border-red-100 dark:border-red-900/50 shadow-sm">
                      <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="flex-1 text-[15px] font-semibold">Sign Out</span>
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