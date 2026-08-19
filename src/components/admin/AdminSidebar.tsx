/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, GraduationCap, Briefcase,
  Megaphone, Settings, LogOut, ChevronLeft, ChevronRight,
  MessageSquare, TrendingUp, X, Shield, Bell,
  School, FileCheck, HelpCircle, BookOpen, Sparkles,
  Zap, Users, BarChart3,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion as m } from 'framer-motion'
import { useUser, getRoleColors } from '@/contexts/UserContext'

// ── Types ──────────────────────────────────────────────────────────────────────
interface AdminSidebarProps {
  profile?: any
  onLogout: () => void
  collapsed?: boolean
  onToggle?: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
  pendingReports?: number
  pendingInquiries?: number
  pendingExams?: number
  unreadNotifications?: number
  isMobile?: boolean
  onMobileClose?: () => void
}

interface NavItem {
  id: string
  label: string
  description: string
  icon: React.ElementType
  badge?: number
  route: string
  iconColor?: string
  iconBg?: string
}

interface NavSection {
  label: string
  icon: React.ElementType
  items: NavItem[]
}

// ── Navigation Config ──────────────────────────────────────────────────────────
function buildSections(badges: {
  notifications: number
  reports: number
  inquiries: number
}): NavSection[] {
  return [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        {
          id: 'overview',
          label: 'Overview',
          description: 'Analytics & insights',
          icon: LayoutDashboard,
          route: '/admin',
          iconColor: 'text-indigo-600',
          iconBg: 'bg-indigo-50',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          description: 'Updates & alerts',
          icon: Bell,
          badge: badges.notifications || undefined,
          route: '/admin/notifications',
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-50',
        },
        {
          id: 'announcements',
          label: 'Announcements',
          description: 'Broadcast to community',
          icon: Megaphone,
          route: '/admin/announcements',
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-50',
        },
        {
          id: 'broadsheet',
          label: 'Broad Sheet',
          description: 'Generate report cards',
          icon: BookOpen,
          route: '/admin/broadsheet',
          iconColor: 'text-violet-600',
          iconBg: 'bg-violet-50',
        },
      ],
    },
    {
      label: 'Management',
      icon: Users,
      items: [
        {
          id: 'students',
          label: 'Students',
          description: 'Enrolment & records',
          icon: GraduationCap,
          route: '/admin/students',
          iconColor: 'text-emerald-600',
          iconBg: 'bg-emerald-50',
        },
        {
          id: 'staff',
          label: 'Staff',
          description: 'Teachers & employees',
          icon: Briefcase,
          route: '/admin/staff',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-50',
        },
        {
          id: 'teacher-classes',
          label: 'Teacher Classes',
          description: 'Assign classes to staff',
          icon: School,
          route: '/admin/teacher-classes',
          iconColor: 'text-teal-600',
          iconBg: 'bg-teal-50',
        },
      ],
    },
    {
      label: 'Academic',
      icon: BarChart3,
      items: [
        {
          id: 'report-cards',
          label: 'Report Cards',
          description: 'Review & approve',
          icon: FileCheck,
          badge: badges.reports || undefined,
          route: '/admin/report-cards',
          iconColor: 'text-orange-600',
          iconBg: 'bg-orange-50',
        },
        {
          id: 'inquiries',
          label: 'Inquiries',
          description: 'Admissions & contact',
          icon: MessageSquare,
          badge: badges.inquiries || undefined,
          route: '/admin/inquiries',
          iconColor: 'text-pink-600',
          iconBg: 'bg-pink-50',
        },
        {
          id: 'promotions',
          label: 'Promotions',
          description: 'Student progression',
          icon: TrendingUp,
          route: '/admin/promotions',
          iconColor: 'text-cyan-600',
          iconBg: 'bg-cyan-50',
        },
      ],
    },
  ]
}

const ACCOUNT_ITEMS: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    description: 'System preferences',
    icon: Settings,
    route: '/admin/settings',
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
  },
  {
    id: 'help',
    label: 'Help & Support',
    description: 'Get assistance',
    icon: HelpCircle,
    route: '/admin/help',
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
  },
]

function getTabFromPath(path: string): string {
  if (path === '/admin') return 'overview'
  const map: Record<string, string> = {
    '/admin/notifications':   'notifications',
    '/admin/announcements':   'announcements',
    '/admin/broadsheet':     'broadsheet',
    '/admin/students':        'students',
    '/admin/staff':           'staff',
    '/admin/teacher-classes': 'teacher-classes',
    '/admin/report-cards':    'report-cards',
    '/admin/inquiries':       'inquiries',
    '/admin/promotions':      'promotions',
    '/admin/settings':        'settings',
    '/admin/help':            'help',
  }
  for (const [prefix, tab] of Object.entries(map)) {
    if (path.startsWith(prefix)) return tab
  }
  return 'overview'
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function AdminSidebarSkeleton({ collapsed }: { collapsed: boolean }) {
  return (
    <aside className={cn(
      'hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40',
      'bg-white dark:bg-slate-950',
      'border-r border-slate-100 dark:border-slate-800',
      'transition-all duration-300',
      collapsed ? 'w-[72px]' : 'w-[280px]',
    )}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
          {!collapsed && <div className="h-5 w-32 bg-slate-100 rounded-lg animate-pulse" />}
        </div>
        <div className="h-px bg-slate-100" />
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 animate-pulse flex-shrink-0" />
          {!collapsed && (
            <div className="space-y-2 flex-1">
              <div className="h-4 w-28 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          )}
        </div>
        <div className="h-px bg-slate-100" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
            {!collapsed && <div className="h-4 flex-1 bg-slate-100 rounded-lg animate-pulse" />}
          </div>
        ))}
      </div>
    </aside>
  )
}

// ── Section Label — same pattern as PupilSidebar's SectionLabel ───────────────
function SectionLabel({
  label,
  icon: Icon,
  collapsed,
}: {
  label: string
  icon: React.ElementType
  collapsed: boolean
}) {
  if (collapsed) {
    return <div className="my-1 mx-auto w-8 h-px bg-slate-200 dark:bg-slate-700" />
  }
  return (
    <div className="flex items-center gap-2 px-3 pt-3 pb-1">
      <Icon className="h-3 w-3 text-slate-400 flex-shrink-0" />
      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex-1">
        {label}
      </p>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 max-w-[40px]" />
    </div>
  )
}

// ── Nav Item ───────────────────────────────────────────────────────────────────
function NavButton({
  item,
  active,
  collapsed,
  onClick,
  accentColor,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onClick: () => void
  accentColor: string
}) {
  const Icon = item.icon

  const button = (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex items-center gap-3 w-full rounded-2xl transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2',
        collapsed ? 'justify-center p-3' : 'px-3 py-2.5',
        active
          ? 'text-white shadow-lg'
          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
      )}
      style={active ? {
        background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
        boxShadow: `0 6px 20px -6px ${accentColor}55`,
      } : undefined}
    >
      {/* Active left accent bar — same as pupil sidebar */}
      {active && !collapsed && (
        <motion.div
          layoutId="adminActiveBar"
          className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-white/40"
        />
      )}

      {/* Icon container */}
      <div className={cn(
        'flex items-center justify-center rounded-xl flex-shrink-0 transition-all duration-200',
        collapsed ? 'h-9 w-9' : 'h-8 w-8',
        active ? 'bg-white/20' : cn(item.iconBg ?? 'bg-slate-100'),
      )}>
        <Icon className={cn(
          'transition-all duration-200',
          collapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4',
          active ? 'text-white' : (item.iconColor ?? 'text-slate-500'),
        )} />
      </div>

      {/* Label + description */}
      {!collapsed && (
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-semibold truncate',
              active ? 'text-white' : 'text-slate-700 dark:text-slate-200',
            )}>
              {item.label}
            </span>
            {item.badge && item.badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className={cn(
                  'min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black',
                  'flex items-center justify-center',
                  active ? 'bg-white/25 text-white' : 'bg-red-500 text-white',
                )}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </motion.span>
            )}
          </div>
          <span className={cn(
            'text-[11px] truncate block mt-0.5',
            active ? 'text-white/65' : 'text-slate-400 dark:text-slate-500',
          )}>
            {item.description}
          </span>
        </div>
      )}

      {/* Collapsed badge dot */}
      {collapsed && item.badge && item.badge > 0 && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500
                         ring-2 ring-white animate-pulse" />
      )}

      {/* Collapsed active dot */}
      {active && collapsed && (
        <motion.div
          layoutId="adminCollapsedDot"
          className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white"
        />
      )}
    </motion.button>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="rounded-xl border-0 shadow-xl bg-slate-900 text-white px-3 py-2"
        >
          <p className="font-semibold text-sm">{item.label}</p>
          <p className="text-[11px] text-slate-400">{item.description}</p>
          {item.badge && item.badge > 0 && (
            <span className="mt-1 inline-flex px-1.5 py-0.5 rounded-full
                             bg-red-500 text-white text-[9px] font-black">
              {item.badge} pending
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

// ── Logo Header — mirrors PupilSidebar's LogoHeader ───────────────────────────
function LogoHeader({
  collapsed,
  accentColor,
}: {
  collapsed: boolean
  accentColor: string
}) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-5 py-4',
      'border-b border-slate-100 dark:border-slate-800 flex-shrink-0',
      collapsed ? 'justify-center' : '',
    )}>
      <div className="relative flex-shrink-0">
        <div
          className="absolute -inset-1 rounded-2xl blur-md opacity-40"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="relative h-9 w-9 rounded-xl flex items-center justify-center shadow-lg"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
        >
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              Vincollins Schools
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-amber-500" />
              Admin Portal
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Profile Card — mirrors PupilSidebar's ProfileCard ─────────────────────────
function ProfileCard({
  displayName,
  firstName,
  initials,
  avatarSrc,
  userEmail,
  accentColor,
  collapsed,
}: {
  displayName: string
  firstName: string
  initials: string
  avatarSrc?: string
  userEmail: string
  accentColor: string
  collapsed: boolean
}) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-3">
        <div className="relative">
          <Avatar className="h-11 w-11 ring-2 ring-white dark:ring-slate-950 shadow-lg">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback
              className="text-white font-bold text-base"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full
                           bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-slate-950" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-3 my-2 rounded-2xl border p-4 space-y-3 overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, ${accentColor}10 0%, ${accentColor}05 100%)`,
        borderColor: `${accentColor}25`,
      }}
    >
      {/* Decorative orb */}
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Avatar + greeting row */}
      <div className="relative flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-slate-900 shadow-xl"
            style={{ ['--tw-ring-color' as any]: `${accentColor}30` }}>
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback
              className="text-white font-bold text-xl"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full
                           bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-slate-900" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold
                         px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              <Shield className="h-2.5 w-2.5" />
              Admin
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                             px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700
                             dark:bg-emerald-900/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-xs font-medium" style={{ color: accentColor }}>
            Welcome back,
          </p>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight truncate">
            {firstName}!
          </h3>
        </div>
      </div>

      {/* Name + email */}
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {displayName}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {userEmail}
        </p>
      </div>
    </div>
  )
}

// ── Collapse Toggle — same pattern as PupilSidebar ────────────────────────────
function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle?: () => void
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'absolute -right-3.5 top-20 z-50',
        'h-7 w-7 rounded-full flex items-center justify-center',
        'bg-white dark:bg-slate-800 shadow-md',
        'border border-slate-200 dark:border-slate-700',
        'hover:border-blue-300 hover:shadow-blue-100 transition-all duration-200',
      )}
    >
      {collapsed
        ? <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
        : <ChevronLeft  className="h-3.5 w-3.5 text-slate-500" />}
    </motion.button>
  )
}

// ── Sign-Out Button — same pattern as PupilSidebar ────────────────────────────
function SignOutButton({
  collapsed,
  onClick,
}: {
  collapsed: boolean
  onClick: () => void
}) {
  const button = (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'flex items-center gap-3 w-full rounded-2xl transition-all duration-200',
        'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400',
        collapsed ? 'justify-center p-3' : 'px-3 py-2.5',
      )}
    >
      <div className="h-8 w-8 rounded-xl bg-red-50 dark:bg-red-950/30
                      flex items-center justify-center flex-shrink-0">
        <LogOut className="h-4 w-4 text-red-500" />
      </div>
      {!collapsed && (
        <div className="text-left">
          <p className="text-sm font-semibold text-red-600">Sign Out</p>
          <p className="text-[11px] text-slate-400">End your session</p>
        </div>
      )}
    </motion.button>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={12}
          className="rounded-xl border-0 shadow-xl bg-slate-900 text-white"
        >
          <p className="font-semibold text-sm">Sign Out</p>
          <p className="text-[11px] text-slate-400">End your session</p>
        </TooltipContent>
      </Tooltip>
    )
  }
  return button
}

// ── Mobile Header ──────────────────────────────────────────────────────────────
function MobileHeader({
  accentColor,
  onClose,
}: {
  accentColor: string
  onClose?: () => void
}) {
  return (
    <div className="flex items-center justify-between h-16 px-5
                    border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className="absolute -inset-0.5 rounded-xl blur-sm opacity-40"
            style={{ backgroundColor: accentColor }}
          />
          <div
            className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ backgroundColor: accentColor }}
          >
            <span className="text-white font-black text-xs">VS</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-black leading-none" style={{ color: accentColor }}>
            Vincollins
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Admin Panel</p>
        </div>
      </div>
      <motion.button
        onClick={onClose}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 rounded-xl flex items-center justify-center
                   bg-slate-50 hover:bg-slate-100 border border-slate-200
                   dark:bg-slate-800 dark:border-slate-700 transition-colors"
      >
        <X className="h-4 w-4 text-slate-500" />
      </motion.button>
    </div>
  )
}

// ── Sign-Out Dialog ────────────────────────────────────────────────────────────
function SignOutDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-sm border-0 shadow-2xl">
        <AlertDialogHeader className="items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/30
                       flex items-center justify-center mb-2 shadow-inner"
          >
            <LogOut className="h-8 w-8 text-red-500" />
          </motion.div>
          <AlertDialogTitle className="text-xl font-bold">Sign out?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 text-sm text-center">
            Are you sure you want to end your admin session?
            Any unsaved changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full rounded-xl bg-gradient-to-r from-red-500 to-red-600
                       hover:from-red-600 hover:to-red-700 text-white font-semibold
                       shadow-lg shadow-red-500/20 border-0 h-11"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Yes, sign me out
          </AlertDialogAction>
          <AlertDialogCancel
            className="w-full rounded-xl border-slate-200 text-slate-600
                       hover:bg-slate-50 h-11 mt-0"
          >
            Stay logged in
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function AdminSidebar({
  profile,
  onLogout,
  collapsed = false,
  onToggle,
  activeTab,
  setActiveTab,
  pendingReports = 0,
  pendingInquiries = 0,
  unreadNotifications = 0,
  isMobile = false,
  onMobileClose,
}: AdminSidebarProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user } = useUser()

  const roleColors  = getRoleColors(user?.role || profile?.role || 'admin')
  const accentColor = roleColors.primary

  const [showConfirm, setShowConfirm] = useState(false)
  const [mounted,     setMounted]     = useState(false)
  const updatingRef                   = useRef(false)
  const prevTabRef                    = useRef(activeTab)

  useEffect(() => { setMounted(true) }, [])

  // Sync active tab from pathname
  useEffect(() => {
    if (updatingRef.current) return
    const tab = getTabFromPath(pathname || '/admin')
    if (tab !== prevTabRef.current && tab !== activeTab) {
      updatingRef.current = true
      prevTabRef.current  = tab
      setActiveTab(tab)
      setTimeout(() => { updatingRef.current = false }, 50)
    }
  }, [pathname, activeTab, setActiveTab])

  const sections = useMemo(() => buildSections({
    notifications: unreadNotifications,
    reports:       pendingReports,
    inquiries:     pendingInquiries,
  }), [unreadNotifications, pendingReports, pendingInquiries])

  const displayName = profile?.display_name || profile?.full_name || 'Administrator'
  const firstName   = displayName.split(' ')[0] || 'Admin'
  const initials    = displayName.split(' ')
                        .map((n: string) => n[0]).join('')
                        .toUpperCase().slice(0, 2)
  const avatarSrc   = profile?.photo_url || profile?.avatar_url || undefined
  const userEmail   = profile?.email || ''

  const handleNav = useCallback((item: NavItem) => {
    if (updatingRef.current) return
    updatingRef.current = true
    setActiveTab(item.id)
    if (pathname !== item.route) router.push(item.route)
    if (isMobile && onMobileClose) onMobileClose()
    setTimeout(() => { updatingRef.current = false }, 50)
  }, [pathname, router, setActiveTab, isMobile, onMobileClose])

  if (!mounted) return <AdminSidebarSkeleton collapsed={collapsed} />

  // On mobile the sidebar is always "expanded"
  const isExpanded = !collapsed || isMobile

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <TooltipProvider>
        {/*
          ── EXACT same shell as PupilSidebar ──────────────────────────────────
          motion.aside  →  h-screen, flex-col, fixed left-0 top-0
          Logo          →  flex-shrink-0  (never scrolls)
          ScrollArea    →  flex-1         (scrollable middle)
          Footer        →  flex-shrink-0  (never scrolls, pinned to bottom)
        */}
        <motion.aside
          initial={false}
          animate={{ width: isMobile ? 280 : (collapsed ? 72 : 280) }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className={cn(
            'flex flex-col h-screen fixed left-0 top-0 z-40',
            'bg-white dark:bg-slate-950',
            'border-r border-slate-100 dark:border-slate-800',
            'shadow-[2px_0_20px_rgba(0,0,0,0.04)]',
            // Hidden on mobile unless isMobile prop triggers it
            isMobile ? 'flex' : 'hidden lg:flex',
          )}
        >
          {/* Collapse toggle (desktop only) */}
          {!isMobile && (
            <CollapseToggle collapsed={collapsed} onToggle={onToggle} />
          )}

          {/* ── FIXED TOP: mobile header OR logo ─────────────────────────── */}
          {isMobile
            ? <MobileHeader accentColor={accentColor} onClose={onMobileClose} />
            : <LogoHeader   collapsed={collapsed} accentColor={accentColor} />
          }

          {/* ── SCROLLABLE MIDDLE ─────────────────────────────────────────── */}
          <ScrollArea className="flex-1">
            <div className="py-2">

              {/* Profile card */}
              <ProfileCard
                displayName={displayName}
                firstName={firstName}
                initials={initials}
                avatarSrc={avatarSrc}
                userEmail={userEmail}
                accentColor={accentColor}
                collapsed={!isExpanded}
              />

              {/* Primary sections */}
              {sections.map((section) => (
                <div key={section.label} className="mt-2 px-3 space-y-0.5">
                  <SectionLabel
                    label={section.label}
                    icon={section.icon}
                    collapsed={!isExpanded}
                  />
                  {section.items.map((item) => (
                    <NavButton
                      key={item.id}
                      item={item}
                      active={activeTab === item.id}
                      collapsed={!isExpanded}
                      onClick={() => handleNav(item)}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              ))}

              {/* Account section */}
              <div className="mt-2 px-3 space-y-0.5">
                <SectionLabel label="Account" icon={Settings} collapsed={!isExpanded} />
                {ACCOUNT_ITEMS.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={activeTab === item.id}
                    collapsed={!isExpanded}
                    onClick={() => handleNav(item)}
                    accentColor={accentColor}
                  />
                ))}
              </div>

              {/* Quick-stats strip (expanded only) — same idea as pupil's achievement strip */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="mx-3 mt-4 rounded-2xl border border-slate-100
                               dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-3"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400
                                   uppercase tracking-wider">
                        Quick Stats
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { label: 'Reports',  value: pendingReports,      color: 'text-orange-600' },
                        { label: 'Queries',  value: pendingInquiries,    color: 'text-pink-600'   },
                        { label: 'Alerts',   value: unreadNotifications, color: 'text-rose-600'   },
                      ].map(({ label, value, color }) => (
                        <div key={label}
                          className="bg-white dark:bg-slate-800 rounded-xl p-2 text-center
                                     border border-slate-100 dark:border-slate-700">
                          <p className={cn('text-base font-black leading-none', color)}>
                            {value}
                          </p>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spacer — same as pupil sidebar */}
              <div className="h-4" />
            </div>
          </ScrollArea>

          {/* ── FIXED BOTTOM: sign-out footer ─────────────────────────────── */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-3 flex-shrink-0">
            <SignOutButton
              collapsed={!isExpanded}
              onClick={() => setShowConfirm(true)}
            />
            <AnimatePresence>
              {isExpanded && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-[9px] text-slate-300 dark:text-slate-600
                             font-bold mt-1 tracking-widest uppercase"
                >
                  Vincollins Admin · v1.0
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      </TooltipProvider>

      <SignOutDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={() => { setShowConfirm(false); onLogout() }}
      />
    </>
  )
}

export default AdminSidebar