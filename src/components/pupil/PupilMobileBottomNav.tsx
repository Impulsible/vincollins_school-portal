'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  FileCheck,
  NotebookPen,
  MoreHorizontal,
  X,
  Users,
  Megaphone,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PupilMobileBottomNavProps {
  onLogout?: () => void
  unreadNotifications?: number
  accentColor?: string
}

const primaryNav = [
  { name: 'Home', href: '/pupil', icon: LayoutDashboard, id: 'overview' },
  { name: 'Work', href: '/pupil/assignments', icon: BookOpen, id: 'assignments' },
  { name: 'Reports', href: '/pupil/report-cards', icon: FileCheck, id: 'report-cards' },
  { name: 'Notes', href: '/pupil/notes', icon: NotebookPen, id: 'notes' },
]

const moreNav = [
  { name: 'Results', href: '/pupil/results', icon: Award, id: 'results' },
  { name: 'Announcements', href: '/pupil/announcements', icon: Megaphone, id: 'announcements' },
  { name: 'Classmates', href: '/pupil/classmates', icon: Users, id: 'classmates' },
  { name: 'Notifications', href: '/pupil/notifications', icon: Bell, id: 'notifications' },
  { name: 'My Profile', href: '/pupil/profile', icon: User, id: 'profile' },
  { name: 'Settings', href: '/pupil/settings', icon: Settings, id: 'settings' },
  { name: 'Help & Support', href: '/pupil/help', icon: HelpCircle, id: 'help' },
]

export function PupilMobileBottomNav({
  onLogout,
  unreadNotifications = 0,
  accentColor = '#059669', // Pupil Emerald
}: PupilMobileBottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Attach badge to notifications item
  const moreNavWithBadges = moreNav.map((item) =>
    item.id === 'notifications'
      ? { ...item, badge: unreadNotifications }
      : item
  )

  const moreBadgeTotal = moreNavWithBadges.reduce(
    (sum, item) => sum + ((item as { badge?: number }).badge ?? 0),
    0
  )

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMoreOpen])

  // Safer active check — '/pupil' only matches exactly
  const checkIsActive = (href: string) => {
    if (href === '/pupil') return pathname === '/pupil' || pathname === '/pupil/'
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const isMoreActive = moreNavWithBadges.some((item) => checkIsActive(item.href))

  const handleLogout = () => {
    setIsMoreOpen(false)
    if (onLogout) onLogout()
  }

  // ~15% opacity pill background from accent
  const activeBgColor = `${accentColor}25`

  return (
    <>
      {/* ─── Bottom Nav Bar ──────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 lg:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around h-[68px] px-2">
          {primaryNav.map((item) => {
            const isActive = checkIsActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none [-webkit-tap-highlight-color:transparent]"
              >
                {/* Icon Wrapper with Pill */}
                <div className="relative flex items-center justify-center w-14 h-8 rounded-full transition-transform active:scale-95">
                  {isActive && (
                    <motion.div
                      layoutId="pupil-bottom-nav-indicator"
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: activeBgColor }}
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <item.icon
                    className={cn(
                      'relative z-10 h-5 w-5 transition-colors',
                      isActive
                        ? 'stroke-[2.5px]'
                        : 'text-slate-500 dark:text-slate-400 stroke-[2px]'
                    )}
                    style={isActive ? { color: accentColor } : undefined}
                  />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] tracking-wide transition-colors',
                    isActive
                      ? 'font-semibold'
                      : 'font-medium text-slate-500 dark:text-slate-400'
                  )}
                  style={isActive ? { color: accentColor } : undefined}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="group relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none [-webkit-tap-highlight-color:transparent]"
          >
            <div className="relative flex items-center justify-center w-14 h-8 rounded-full transition-transform active:scale-95">
              {isMoreActive && (
                <motion.div
                  layoutId="pupil-bottom-nav-indicator"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: activeBgColor }}
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                />
              )}
              <div className="relative z-10">
                <MoreHorizontal
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isMoreActive
                      ? 'stroke-[2.5px]'
                      : 'text-slate-500 dark:text-slate-400 stroke-[2px]'
                  )}
                  style={isMoreActive ? { color: accentColor } : undefined}
                />
                {/* Aggregate badge on More tab when sheet is closed */}
                {!isMoreOpen && moreBadgeTotal > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
                    {moreBadgeTotal > 99 ? '99+' : moreBadgeTotal}
                  </span>
                )}
              </div>
            </div>

            <span
              className={cn(
                'text-[10px] tracking-wide transition-colors',
                isMoreActive
                  ? 'font-semibold'
                  : 'font-medium text-slate-500 dark:text-slate-400'
              )}
              style={isMoreActive ? { color: accentColor } : undefined}
            >
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
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.05}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.y > 100 || velocity.y > 500) {
                  setIsMoreOpen(false)
                }
              }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 rounded-t-3xl shadow-2xl lg:hidden max-h-[85dvh] flex flex-col pb-[env(safe-area-inset-bottom)] ring-1 ring-slate-200 dark:ring-slate-800"
            >
              {/* Drag Indicator & Header */}
              <div className="flex flex-col items-center pt-3 pb-4 px-5 border-b border-slate-100 dark:border-slate-800/60 shrink-0 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-5" />
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Menu
                  </h3>
                  <button
                    onClick={() => setIsMoreOpen(false)}
                    aria-label="Close menu"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Links */}
              <div className="overflow-y-auto overscroll-contain px-4 py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-1 gap-1">
                  {moreNavWithBadges.map((item) => {
                    const isActive = checkIsActive(item.href)
                    const badge = (item as { badge?: number }).badge
                    const hasBadge = badge !== undefined && badge > 0
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setIsMoreOpen(false)
                          router.push(item.href)
                        }}
                        className={cn(
                          'flex items-center gap-4 w-full p-3 rounded-2xl transition-all text-left outline-none [-webkit-tap-highlight-color:transparent]',
                          isActive
                            ? ''
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-[0.98] text-slate-700 dark:text-slate-300'
                        )}
                        style={
                          isActive
                            ? {
                                backgroundColor: activeBgColor,
                                color: accentColor,
                              }
                            : undefined
                        }
                      >
                        <div
                          className={cn(
                            'relative h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors',
                            isActive
                              ? 'bg-white/60 dark:bg-black/20'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'h-[22px] w-[22px]',
                              !isActive && 'text-slate-500 dark:text-slate-400'
                            )}
                            style={isActive ? { color: accentColor } : undefined}
                          />
                        </div>
                        <span className="flex-1 text-[15px] font-semibold">
                          {item.name}
                        </span>
                        {hasBadge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm mr-1">
                            {badge! > 99 ? '99+' : badge}
                          </span>
                        )}
                        <ChevronRight
                          className={cn(
                            'h-5 w-5 opacity-60',
                            !isActive && 'text-slate-400 dark:text-slate-500'
                          )}
                          style={isActive ? { color: accentColor } : undefined}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* Logout Button */}
                <div className="mt-5 pt-5 mb-2 border-t border-slate-100 dark:border-slate-800/60 px-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full p-3 rounded-2xl transition-all text-left bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 active:scale-[0.98] outline-none [-webkit-tap-highlight-color:transparent]"
                  >
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-red-950/50 shadow-sm border border-red-100 dark:border-red-900/50">
                      <LogOut className="h-[22px] w-[22px] text-red-600 dark:text-red-400" />
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