/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import {
  LayoutDashboard, BookOpen, FileText, Settings,
  LogOut, ChevronLeft, ChevronRight, GraduationCap,
  Sparkles, User, CalendarDays,
  Bell, HelpCircle, Notebook, Megaphone,
  CalendarCheck, Users, ClipboardCheck,
  Calculator, Wifi, WifiOff
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip, TooltipContent,
  TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ──────────────────────────────────────────────────────────────────────

interface StaffProfile {
  id?: string
  full_name?: string
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string
  photo_url?: string | null
  avatar_url?: string | null
  department?: string
  role?: string
  school_id?: string | null
  class?: string | null
}

interface StaffSidebarProps {
  profile: StaffProfile | null
  onLogout: () => void
  collapsed: boolean
  onToggle: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
  termCode?: string
  sessionYear?: string
}

interface NavigationItem {
  id: string
  name: string
  icon: React.ElementType
  description: string
  route: string
  badge?: string
  color?: string
  bgColor?: string
}

interface SidebarStats {
  studentCount: number
  pupilCount: number
  pendingGradingCount: number
  attendanceCount: number
  assignmentCount: number
  noteCount: number
}

// ── Navigation Config ──────────────────────────────────────────────────────────

const primaryNavigation: NavigationItem[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: LayoutDashboard,
    description: 'Dashboard & Analytics',
    route: '/staff',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'attendance',
    name: 'Attendance',
    icon: CalendarCheck,
    description: 'Mark Daily Attendance',
    route: '/staff/attendance',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'pupils',
    name: 'Pupils',
    icon: Users,
    description: 'Class Roster',
    route: '/staff/pupils',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'assignments',
    name: 'Assignments',
    icon: FileText,
    description: 'Course Work',
    route: '/staff/assignments',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'notes',
    name: 'Study Notes',
    icon: Notebook,
    description: 'Learning Materials',
    route: '/staff/notes',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  {
    id: 'scores',
    name: 'Scores',
    icon: Calculator,
    description: 'CA (40%) & Exam (60%)',
    route: '/staff/scores',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'report-cards',
    name: 'Report Cards',
    icon: ClipboardCheck,
    description: 'Termly Reports',
    route: '/staff/report-cards',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    id: 'announcements',
    name: 'Announcements',
    icon: Megaphone,
    description: 'School Updates',
    route: '/staff/announcements',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
]

const secondaryNavigation: NavigationItem[] = [
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    description: 'Updates & Alerts',
    route: '/staff/notifications',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'profile',
    name: 'My Profile',
    icon: User,
    description: 'Account Details',
    route: '/staff/profile',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    description: 'Preferences',
    route: '/staff/settings',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
  {
    id: 'help',
    name: 'Help & Support',
    icon: HelpCircle,
    description: 'Get assistance',
    route: '/staff/help',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
]

// ── Helper Functions ───────────────────────────────────────────────────────────

const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

const getFirstName = (profile?: StaffProfile | null): string => {
  if (profile?.first_name) return capitalize(profile.first_name.trim())
  if (profile?.full_name) {
    const parts = profile.full_name.replace(/[._]/g, ' ').trim().split(' ')
    return capitalize(parts[0])
  }
  return 'Teacher'
}

const getDisplayName = (profile?: StaffProfile | null): string => {
  if (profile?.display_name?.trim()) return profile.display_name.trim()
  if (profile?.full_name?.trim()) return profile.full_name.trim()
  if (profile?.first_name && profile?.last_name) {
    const first = capitalize(profile.first_name.trim())
    const last = capitalize(profile.last_name.trim())
    return `${first} ${last}`
  }
  return 'Staff Member'
}

const getInitials = (profile?: StaffProfile | null): string => {
  const name = getDisplayName(profile)
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const getRoleDisplay = (role?: string): string => {
  if (role === 'admin') return 'Administrator'
  if (role === 'teacher' || role === 'staff') return 'Teacher'
  return 'Staff'
}

// ── Skeleton Sidebar ───────────────────────────────────────────────────────────

function SidebarSkeleton({ collapsed }: { collapsed: boolean }) {
  return (
    <aside className={cn(
      'hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40',
      'bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800',
      'transition-all duration-500',
      collapsed ? 'w-[72px]' : 'w-[280px]',
    )}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-9 w-9 rounded-xl bg-blue-100 animate-pulse flex-shrink-0" />
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

// ── Nav Item ──────────────────────────────────────────────────────────────────

function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavigationItem
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}) {
  const Icon = item.icon

  const button = (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative flex items-center gap-3 w-full rounded-2xl transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        collapsed ? 'justify-center p-3' : 'px-3 py-2.5',
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100',
      )}
    >
      {isActive && !collapsed && (
        <motion.div
          layoutId="activeBar"
          className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-white/40"
        />
      )}

      <div className={cn(
        'flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0',
        collapsed ? 'h-9 w-9' : 'h-8 w-8',
        isActive
          ? 'bg-white/20'
          : cn(item.bgColor, 'group-hover:scale-110'),
      )}>
        <Icon className={cn(
          'transition-all duration-200',
          collapsed ? 'h-4.5 w-4.5' : 'h-4 w-4',
          isActive ? 'text-white' : item.color,
        )} />
      </div>

      {!collapsed && (
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-semibold truncate',
              isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200',
            )}>
              {item.name}
            </span>
            {item.badge && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-900">
                {item.badge}
              </span>
            )}
          </div>
          <span className={cn(
            'text-[11px] truncate block',
            isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500',
          )}>
            {item.description}
          </span>
        </div>
      )}

      {isActive && collapsed && (
        <motion.div
          layoutId="activeCollapsedDot"
          className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500"
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
          <p className="font-semibold text-sm">{item.name}</p>
          <p className="text-[11px] text-slate-400">{item.description}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

// ── Section Label ─────────────────────────────────────────────────────────────

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div className="my-1 mx-auto w-8 h-px bg-slate-200 dark:bg-slate-700" />
  }
  return (
    <p className="px-4 pt-2 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
      {label}
    </p>
  )
}

// ── Profile Card ──────────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  collapsed,
  isOnline,
  stats,
  isLoading,
}: {
  profile: StaffProfile | null
  collapsed: boolean
  isOnline: boolean
  stats: SidebarStats
  isLoading: boolean
}) {
  const firstName = getFirstName(profile)
  const displayName = getDisplayName(profile)
  const initials = getInitials(profile)
  const avatarUrl = profile?.photo_url || undefined
  const userEmail = profile?.email || ''
  const userRole = profile?.role
  const department = profile?.department

  if (collapsed) {
    return (
      <div className="flex justify-center py-3">
        <div className="relative">
          <Avatar className="h-11 w-11 ring-2 ring-white dark:ring-slate-950 shadow-lg">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-base">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className={cn(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-950',
            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400',
          )} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-3 my-2 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50
                    dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-100/60
                    dark:border-blue-900/30 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-slate-900 shadow-xl">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full',
            'ring-2 ring-white dark:ring-slate-900',
            isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400',
          )} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full',
              isOnline
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
            )}>
              {isOnline ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Welcome back,
          </p>
          <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight truncate">
            {firstName}!
          </h3>
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
          {displayName}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {userEmail || 'staff@vincollins.edu.ng'}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                          text-[10px] px-2 py-0.5 rounded-lg shadow-sm border-0">
          {getRoleDisplay(userRole)}
        </Badge>
        {department && (
          <Badge variant="outline"
            className="text-[10px] border-blue-200 text-blue-700 dark:border-blue-800
                       dark:text-blue-400 rounded-lg px-2 py-0.5">
            {department}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/70 dark:bg-slate-900/50 rounded-xl p-2.5 border
                        border-white dark:border-slate-800 shadow-sm text-center">
          <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400
                        uppercase tracking-wide mb-0.5">
            Pupils
          </p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isLoading ? '...' : stats.pupilCount}
          </p>
        </div>
        <div className="bg-white/70 dark:bg-slate-900/50 rounded-xl p-2.5 border
                        border-white dark:border-slate-800 shadow-sm text-center">
          <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400
                        uppercase tracking-wide mb-0.5">
            Assignments
          </p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isLoading ? '...' : stats.assignmentCount}
          </p>
        </div>
        <div className="bg-white/70 dark:bg-slate-900/50 rounded-xl p-2.5 border
                        border-white dark:border-slate-800 shadow-sm text-center">
          <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400
                        uppercase tracking-wide mb-0.5">
            To Grade
          </p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isLoading ? '...' : stats.pendingGradingCount}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Sign-Out Confirm Dialog ───────────────────────────────────────────────────

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
            className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center
                       justify-center mb-2 shadow-inner"
          >
            <LogOut className="h-8 w-8 text-red-500" />
          </motion.div>
          <AlertDialogTitle className="text-xl font-bold">Sign out?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 text-sm text-center">
            You'll be logged out of your staff portal. Any unsaved changes may be lost.
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

// ── Logo Header ───────────────────────────────────────────────────────────────

function LogoHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800',
      collapsed ? 'justify-center' : '',
    )}>
      <div className="relative flex-shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-indigo-400
                        rounded-2xl blur-md opacity-40" />
        <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600
                        flex items-center justify-center shadow-lg">
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
              Staff Portal
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Collapse Toggle Button ────────────────────────────────────────────────────

function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
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
        : <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />}
    </motion.button>
  )
}

// ── Sign-Out Button ────────────────────────────────────────────────────────────

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
      <div className="h-8 w-8 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center
                      justify-center flex-shrink-0">
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

// ── Main Component ─────────────────────────────────────────────────────────────

export function StaffSidebar({
  profile,
  onLogout,
  collapsed,
  onToggle,
  activeTab,
  setActiveTab,
}: StaffSidebarProps) {
  const router = useRouter()

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [stats, setStats] = useState<SidebarStats>({
    studentCount: 0,
    pupilCount: 0,
    pendingGradingCount: 0,
    attendanceCount: 0,
    assignmentCount: 0,
    noteCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // ─── Fetch stats ────────────────────────────────────────────────────────────

  useEffect(() => {
    let mounted = true

    const fetchStats = async () => {
      try {
        const { count: pupilCount, error: pupilError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .in('role', ['student', 'pupil'])

        if (pupilError) {
          console.error('Error fetching pupil count:', pupilError)
        }

        const { count: assignmentCount, error: assignmentError } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', profile?.id || '')

        if (assignmentError) {
          console.error('Error fetching assignment count:', assignmentError)
        }

        let pendingCount = 0
        try {
          const teacherId = profile?.id
          if (teacherId) {
            const { data: teacherExams, error: examsError } = await supabase
              .from('exams')
              .select('id')
              .eq('created_by', teacherId)

            if (!examsError && teacherExams && teacherExams.length > 0) {
              const examIds = teacherExams.map(e => e.id)
              const { count } = await supabase
                .from('exam_attempts')
                .select('*', { count: 'exact', head: true })
                .in('exam_id', examIds)
                .eq('status', 'pending_theory')

              pendingCount = count || 0
            }
          }
        } catch (examError) {
          console.debug('Exams feature not available:', examError)
        }

        if (mounted) {
          setStats({
            pupilCount: pupilCount || 0,
            studentCount: pupilCount || 0,
            assignmentCount: assignmentCount || 0,
            noteCount: 0,
            pendingGradingCount: pendingCount,
            attendanceCount: 0,
          })
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        if (mounted) setIsLoading(false)
      }
    }

    if (profile?.id) {
      fetchStats()
    } else {
      setIsLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [profile?.id])

  // ─── Online status ──────────────────────────────────────────────────────────

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // ─── Sync active tab with pathname ─────────────────────────────────────────

  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      const allNav = [...primaryNavigation, ...secondaryNavigation]
      const matched = allNav.find(item =>
        pathname === item.route || pathname?.startsWith(item.route + '/')
      )
      if (matched) {
        setActiveTab(matched.id)
      }
    }
  }, [pathname, setActiveTab])

  const handleNavClick = (id: string, route: string) => {
    setActiveTab(id)
    router.push(route)
  }

  if (!profile) {
    return <SidebarSkeleton collapsed={collapsed} />
  }

  return (
    <>
      <TooltipProvider>
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 72 : 280 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className={cn(
            'hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40',
            'bg-white dark:bg-slate-950',
            'border-r border-slate-100 dark:border-slate-800',
            'shadow-[2px_0_20px_rgba(0,0,0,0.04)]',
          )}
        >
          <CollapseToggle collapsed={collapsed} onToggle={onToggle} />

          <LogoHeader collapsed={collapsed} />

          <ScrollArea className="flex-1">
            <div className="py-2">
              <ProfileCard
                profile={profile}
                collapsed={collapsed}
                isOnline={isOnline}
                stats={stats}
                isLoading={isLoading}
              />

              <div className="mt-2 px-3 space-y-0.5">
                <SectionLabel label="Main Menu" collapsed={collapsed} />
                {primaryNavigation.map(item => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={activeTab === item.id}
                    collapsed={collapsed}
                    onClick={() => handleNavClick(item.id, item.route)}
                  />
                ))}
              </div>

              <div className="mt-2 px-3 space-y-0.5">
                <SectionLabel label="Account" collapsed={collapsed} />
                {secondaryNavigation.map(item => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={activeTab === item.id}
                    collapsed={collapsed}
                    onClick={() => handleNavClick(item.id, item.route)}
                  />
                ))}
              </div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="mx-3 mt-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50
                               dark:from-amber-950/20 dark:to-orange-950/20
                               border border-amber-100 dark:border-amber-900/30 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-500">🌟</span>
                      <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        Great job today!
                      </p>
                    </div>
                    <p className="text-[10px] text-amber-600/80 dark:text-amber-500/70 leading-snug">
                      You're making a difference in your pupils' lives every day. Keep up the amazing work!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-4" />
            </div>
          </ScrollArea>

          <div className="border-t border-slate-100 dark:border-slate-800 p-3">
            <SignOutButton
              collapsed={collapsed}
              onClick={() => setShowSignOutConfirm(true)}
            />
          </div>
        </motion.aside>
      </TooltipProvider>

      <SignOutDialog
        open={showSignOutConfirm}
        onOpenChange={setShowSignOutConfirm}
        onConfirm={() => {
          setShowSignOutConfirm(false)
          onLogout()
        }}
      />
    </>
  )
}

export default StaffSidebar