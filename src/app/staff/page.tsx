/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import StaffWelcomeBanner from '@/components/staff/StaffWelcomeBanner'
import type { StaffProfile, StaffStats } from '@/components/staff/StaffWelcomeBanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FileText, BookOpen, Users, ArrowRight,
  Calculator, Briefcase, ChevronRight, RefreshCw,
  BarChart3, TrendingUp, Award, CalendarCheck,
  Bell, Search, GraduationCap, ClipboardList,
  Sparkles, Clock, Target, Zap, ChevronDown,
  Loader2, AlertCircle, BookMarked, UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StaffStatsData {
  totalPupils: number
  activePupils: number
  totalClasses: number
  totalSubjects: number
  totalAssignments: number
  totalNotes: number
  totalReportCards: number
  pendingGrading: number
  averagePerformance: number
  attendanceToday: number
  attendanceWeek: number
  scoresSubmitted: number
  totalScores: number
  classBreakdown: { name: string; count: number }[]
}

interface StaffData {
  stats: StaffStatsData
  recentAssignments: any[]
  recentNotes: any[]
  recentPupils: any[]
  recentReportCards: any[]
}

const DEFAULT_STATS: StaffStatsData = {
  totalPupils: 0,
  activePupils: 0,
  totalClasses: 0,
  totalSubjects: 0,
  totalAssignments: 0,
  totalNotes: 0,
  totalReportCards: 0,
  pendingGrading: 0,
  averagePerformance: 0,
  attendanceToday: 0,
  attendanceWeek: 0,
  scoresSubmitted: 0,
  totalScores: 0,
  classBreakdown: [],
}

// ── Helper: Calculate current week from term dates ──────────────────────────

function calculateWeekInfo(
  termName: string,
  sessionYear: string,
  startDate?: string,
  endDate?: string
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!startDate || !endDate) {
    return {
      termName, sessionYear, currentWeek: 0, totalWeeks: 0,
      weekProgress: 0, displayWeek: 'Term dates not set',
    }
  }

  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)

  if (today < start) {
    return {
      termName, sessionYear, currentWeek: 0, totalWeeks: 0,
      weekProgress: 0, displayWeek: 'Term starts soon',
    }
  }

  if (today > end) {
    return {
      termName, sessionYear, currentWeek: 0, totalWeeks: 0,
      weekProgress: 100, displayWeek: 'Term ended',
    }
  }

  const diffMs = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const currentWeek = Math.floor(diffDays / 7) + 1

  const diffTotalMs = end.getTime() - start.getTime()
  const diffTotalDays = Math.floor(diffTotalMs / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.ceil(diffTotalDays / 7)

  const weekProgress = Math.round((currentWeek / totalWeeks) * 100)

  return {
    termName, sessionYear,
    currentWeek: Math.min(currentWeek, totalWeeks),
    totalWeeks: Math.max(totalWeeks, 1),
    weekProgress: Math.min(weekProgress, 100),
    displayWeek: `Week ${Math.min(currentWeek, totalWeeks)} of ${totalWeeks}`,
  }
}

// ── Helper: Time-based greeting ──────────────────────────────────────────────

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' }
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' }
  return { text: 'Good evening', emoji: '🌙' }
}

// ── Skeleton Components ──────────────────────────────────────────────────────

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800',
      className
    )} />
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5">
              <SkeletonPulse className="h-4 w-28" />
              <SkeletonPulse className="h-3 w-20" />
            </div>
          </div>
          <SkeletonPulse className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Welcome skeleton */}
        <SkeletonPulse className="h-32 sm:h-40 w-full rounded-2xl" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[1, 2, 3, 4].map(i => (
            <SkeletonPulse key={i} className="h-24 sm:h-28 rounded-xl" />
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {[1, 2, 3, 4].map(i => (
            <SkeletonPulse key={i} className="h-20 sm:h-24 rounded-xl" />
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonPulse className="h-32 rounded-xl" />
          <SkeletonPulse className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── Stat Pill (mobile-optimized compact stat) ────────────────────────────────

function StatPill({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'teal'
  trend?: string
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
      text: 'text-blue-700 dark:text-blue-300',
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      icon: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
      text: 'text-violet-700 dark:text-violet-300',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
      text: 'text-amber-700 dark:text-amber-300',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
      text: 'text-rose-700 dark:text-rose-300',
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/30',
      icon: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400',
      text: 'text-teal-700 dark:text-teal-300',
    },
  }

  const c = colorMap[color]

  return (
    <Card className={cn(
      'border-0 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.98]',
      c.bg
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
              {label}
            </p>
            <p className={cn('text-xl sm:text-2xl font-bold tracking-tight tabular-nums', c.text)}>
              {value}
            </p>
            {trend && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                {trend}
              </p>
            )}
          </div>
          <div className={cn('p-2 sm:p-2.5 rounded-xl shrink-0', c.icon)}>
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Quick Action Tile ────────────────────────────────────────────────────────

function QuickActionTile({
  icon: Icon,
  label,
  description,
  onClick,
  color,
  badge,
}: {
  icon: React.ElementType
  label: string
  description: string
  onClick: () => void
  color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'teal'
  badge?: string | number
}) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    rose: 'from-rose-500 to-rose-600 shadow-rose-500/20',
    teal: 'from-teal-500 to-teal-600 shadow-teal-500/20',
  }

  const bgMap = {
    blue: 'hover:bg-blue-50/80 dark:hover:bg-blue-950/30 active:bg-blue-100/80',
    violet: 'hover:bg-violet-50/80 dark:hover:bg-violet-950/30 active:bg-violet-100/80',
    emerald: 'hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 active:bg-emerald-100/80',
    amber: 'hover:bg-amber-50/80 dark:hover:bg-amber-950/30 active:bg-amber-100/80',
    rose: 'hover:bg-rose-50/80 dark:hover:bg-rose-950/30 active:bg-rose-100/80',
    teal: 'hover:bg-teal-50/80 dark:hover:bg-teal-950/30 active:bg-teal-100/80',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col sm:flex-row items-center sm:items-start gap-2.5 sm:gap-3',
        'p-3 sm:p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60',
        'bg-white dark:bg-slate-900 text-left w-full',
        'transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
        'active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        bgMap[color]
      )}
    >
      {badge !== undefined && badge !== 0 && (
        <span className="absolute -top-1.5 -right-1.5 sm:top-1 sm:right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-sm z-10">
          {badge}
        </span>
      )}
      <div className={cn(
        'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0',
        'bg-gradient-to-br shadow-md transition-transform duration-200 group-hover:scale-110 group-active:scale-95',
        colorMap[color]
      )}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
          {label}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block truncate">
          {description}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all hidden sm:block shrink-0 mt-1" />
    </button>
  )
}

// ── Animated Progress Bar ────────────────────────────────────────────────────

function AnimatedProgress({
  value,
  className,
  color = 'emerald',
}: {
  value: number
  className?: string
  color?: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose'
}) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.min(100, Math.max(0, value))), 100)
    return () => clearTimeout(timer)
  }, [value])

  const colorMap = {
    emerald: 'from-emerald-500 to-emerald-400',
    blue: 'from-blue-500 to-blue-400',
    violet: 'from-violet-500 to-violet-400',
    amber: 'from-amber-500 to-amber-400',
    rose: 'from-rose-500 to-rose-400',
  }

  return (
    <div
      ref={ref}
      className={cn('w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden', className)}
    >
      <div
        className={cn('h-full bg-gradient-to-r rounded-full transition-all duration-1000 ease-out', colorMap[color])}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

// ── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3 sm:mb-4">
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StaffDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const [data, setData] = useState<StaffData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [termInfo, setTermInfo] = useState({
    termName: 'First',
    sessionYear: '2025/2026',
    currentWeek: 0,
    totalWeeks: 0,
    weekProgress: 0,
    displayWeek: 'Loading...',
  })
  const [showAllClasses, setShowAllClasses] = useState(false)

  const greeting = getGreeting()

  // ─── Fetch Term Info ──────────────────────────────────────────────────────
  const fetchTermInfo = useCallback(async () => {
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('school_settings')
        .select('current_term, current_session')
        .maybeSingle()

      if (settingsError || !settings) return

      const { data: termData, error: termError } = await supabase
        .from('terms')
        .select('*')
        .eq('term_code', settings.current_term)
        .eq('session_year', settings.current_session)
        .maybeSingle()

      if (termError || !termData) return

      const weekInfo = calculateWeekInfo(
        termData.term_name || termData.term_code || 'First',
        termData.session_year || '2025/2026',
        termData.start_date,
        termData.end_date
      )

      setTermInfo(weekInfo)
    } catch (error) {
      console.error('Error fetching term info:', error)
    }
  }, [])

  // ─── Fetch Data ───────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.id) return

    try {
      setRefreshing(true)
      const userId = user.id

      const [
        { data: pupils },
        { data: assignments },
        { data: notes },
        { data: primaryScores },
        { data: attendanceTodayData },
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, class, is_active')
          .in('role', ['pupil', 'student']),
        supabase
          .from('assignments')
          .select('id, title, subject, status, created_at')
          .eq('teacher_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('notes')
          .select('id, title, subject, created_at')
          .eq('teacher_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('primary_scores')
          .select('id, student_id, subject, class, term, academic_year, ca_score, exam_score, total_score, remark')
          .eq('teacher_id', userId)
          .eq('term', termInfo.termName)
          .eq('academic_year', termInfo.sessionYear),
        supabase
          .from('attendance')
          .select('id, status')
          .eq('date', new Date().toISOString().split('T')[0]),
      ])

      const totalScores = primaryScores?.length || 0
      const scoresSubmitted = primaryScores?.filter(s => s.total_score !== null && s.total_score > 0).length || 0

      const allScores = primaryScores
        ?.map(s => s.total_score)
        .filter(score => score !== null && score > 0) || []

      const avgPerformance = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0

      const pendingGrading = primaryScores?.filter(s => s.total_score === null || s.total_score === 0).length || 0

      const activePupils = pupils?.filter(p => p.is_active !== false).length || 0
      const classes = new Set(pupils?.map(p => p.class).filter(Boolean))
      const subjects = new Set([
        ...(assignments?.map(a => a.subject) || []),
        ...(notes?.map(n => n.subject) || [])
      ])

      const classMap = new Map<string, number>()
      pupils?.forEach(p => {
        if (p.class) classMap.set(p.class, (classMap.get(p.class) || 0) + 1)
      })
      const classBreakdown = Array.from(classMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      const presentToday = attendanceTodayData?.filter(a => a.status === 'present').length || 0
      const totalToday = attendanceTodayData?.length || 0

      setData({
        stats: {
          totalPupils: pupils?.length || 0,
          activePupils,
          totalClasses: classes.size,
          totalSubjects: subjects.size,
          totalAssignments: assignments?.length || 0,
          totalNotes: notes?.length || 0,
          totalReportCards: 0,
          pendingGrading,
          averagePerformance: avgPerformance,
          attendanceToday: totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0,
          attendanceWeek: 0,
          scoresSubmitted,
          totalScores,
          classBreakdown,
        },
        recentAssignments: assignments || [],
        recentNotes: notes || [],
        recentPupils: pupils?.slice(0, 5) || [],
        recentReportCards: [],
      })
    } catch (error) {
      console.error('Error fetching staff data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user, termInfo.termName, termInfo.sessionYear])

  // ─── Initial Load ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user?.id && user?.role !== 'student') {
      const loadAll = async () => {
        await fetchTermInfo()
        await fetchData()
      }
      loadAll()
    }
  }, [authLoading, user, fetchTermInfo, fetchData])

  const stats = data?.stats || DEFAULT_STATS
  const staffName = user?.full_name || user?.first_name || 'Teacher'
  const staffInitial = staffName.charAt(0).toUpperCase()

  const submissionPercentage = stats.totalScores > 0
    ? Math.round((stats.scoresSubmitted / stats.totalScores) * 100)
    : 0

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchTermInfo(), fetchData()])
    toast.success('Dashboard refreshed')
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return <DashboardSkeleton />
  }

  // ─── Auth Guard ───────────────────────────────────────────────────────────
  if (!user || user.role === 'student') {
    router.replace('/portal')
    return null
  }

  // ─── Profile & Stats Mapping ──────────────────────────────────────────────
  const staffProfile: StaffProfile = {
    id: user.id,
    full_name: user.full_name || user.first_name || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    department: (user as any).department || '',
    role: user.role || 'staff',
    photo_url: user.photo_url || null,
    avatar_url: user.avatar_url || null,
    title: (user as any).title || '',
  }

  const staffStats: StaffStats = {
    totalPupils: stats.totalPupils,
    totalAssignments: stats.totalAssignments,
    totalNotes: stats.totalNotes,
    pendingGrading: stats.pendingGrading,
    averagePerformance: stats.averagePerformance,
    activeStudents: stats.activePupils,
    totalClasses: stats.totalClasses,
    attendanceToday: stats.attendanceToday,
  }

  const visibleClasses = showAllClasses
    ? stats.classBreakdown
    : stats.classBreakdown.slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* ═══ Sticky Header ═══ */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">

            {/* Left: Avatar + Greeting */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-emerald-500/20">
                  {staffInitial}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                  {greeting.emoji} {greeting.text}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                  {staffName} · {termInfo.displayWeek}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-9 w-9 sm:h-9 sm:w-auto sm:px-3 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Refresh dashboard"
              >
                <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
                <span className="hidden sm:inline text-xs font-medium ml-1.5">Refresh</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                {stats.pendingGrading > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-7">

        {/* ── Welcome Banner ── */}
        <section>
          <StaffWelcomeBanner
            profile={staffProfile}
            stats={staffStats}
            termInfo={termInfo}
          />
        </section>

        {/* ── Key Stats Grid ── */}
        <section>
          <SectionHeader
            title="Overview"
            subtitle={`${termInfo.termName} Term · ${termInfo.sessionYear}`}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <StatPill
              label="Pupils"
              value={stats.activePupils}
              icon={Users}
              color="blue"
              trend={`${stats.totalClasses} classes`}
            />
            <StatPill
              label="Attendance"
              value={`${stats.attendanceToday}%`}
              icon={UserCheck}
              color="teal"
              trend="Today"
            />
            <StatPill
              label="Graded"
              value={stats.scoresSubmitted}
              icon={ClipboardList}
              color="emerald"
              trend={`of ${stats.totalScores} total`}
            />
            <StatPill
              label="Pending"
              value={stats.pendingGrading}
              icon={Clock}
              color={stats.pendingGrading > 10 ? 'rose' : 'amber'}
              trend="Need grading"
            />
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section>
          <SectionHeader title="Quick Actions" subtitle="Jump to common tasks" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <QuickActionTile
              icon={Calculator}
              label="Scores"
              description="Enter & manage pupil scores"
              onClick={() => router.push('/staff/scores')}
              color="amber"
              badge={stats.pendingGrading > 0 ? stats.pendingGrading : undefined}
            />
            <QuickActionTile
              icon={Users}
              label="Pupils"
              description="View all enrolled pupils"
              onClick={() => router.push('/staff/pupils')}
              color="blue"
            />
            <QuickActionTile
              icon={FileText}
              label="Assignments"
              description="Create & manage tasks"
              onClick={() => router.push('/staff/assignments')}
              color="violet"
              badge={stats.totalAssignments > 0 ? stats.totalAssignments : undefined}
            />
            <QuickActionTile
              icon={CalendarCheck}
              label="Attendance"
              description="Mark daily attendance"
              onClick={() => router.push('/staff/attendance')}
              color="teal"
            />
          </div>
        </section>

        {/* ── Performance & Submission Cards ── */}
        <section>
          <SectionHeader title="Performance" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

            {/* Score Submission */}
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Score Submission
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {stats.scoresSubmitted} of {stats.totalScores} graded
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-2xl font-bold tabular-nums',
                    submissionPercentage >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                    submissionPercentage >= 50 ? 'text-amber-600 dark:text-amber-400' :
                    'text-rose-600 dark:text-rose-400'
                  )}>
                    {submissionPercentage}%
                  </span>
                </div>
                <AnimatedProgress
                  value={submissionPercentage}
                  color={submissionPercentage >= 80 ? 'emerald' : submissionPercentage >= 50 ? 'amber' : 'rose'}
                />
                {stats.totalScores - stats.scoresSubmitted > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    {stats.totalScores - stats.scoresSubmitted} scores pending
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Average Performance */}
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Avg. Performance
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Based on {stats.scoresSubmitted} scores
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    'text-2xl font-bold tabular-nums',
                    stats.averagePerformance >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                    stats.averagePerformance >= 50 ? 'text-amber-600 dark:text-amber-400' :
                    'text-rose-600 dark:text-rose-400'
                  )}>
                    {stats.averagePerformance}%
                  </span>
                </div>
                <AnimatedProgress
                  value={stats.averagePerformance}
                  color={stats.averagePerformance >= 70 ? 'emerald' : stats.averagePerformance >= 50 ? 'amber' : 'rose'}
                />
                <Badge className={cn(
                  'text-[10px] font-semibold border-0 w-fit',
                  stats.averagePerformance >= 70
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                    : stats.averagePerformance >= 50
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                )}>
                  {stats.averagePerformance >= 70 ? '🌟 Excellent' :
                   stats.averagePerformance >= 50 ? '📈 Good' :
                   stats.averagePerformance > 0 ? '⚠️ Needs Attention' : '— No data'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Class Breakdown ── */}
        {stats.classBreakdown.length > 0 && (
          <section>
            <SectionHeader
              title="Class Breakdown"
              subtitle={`${stats.totalClasses} classes · ${stats.totalPupils} total pupils`}
              action={
                stats.classBreakdown.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllClasses(!showAllClasses)}
                    className="h-7 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 gap-1"
                  >
                    {showAllClasses ? 'Show less' : `Show all (${stats.classBreakdown.length})`}
                    <ChevronDown className={cn('h-3 w-3 transition-transform', showAllClasses && 'rotate-180')} />
                  </Button>
                )
              }
            />
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="p-4 sm:p-5">
                <div className="space-y-3">
                  {visibleClasses.map((cls) => {
                    const pct = stats.totalPupils > 0
                      ? Math.round((cls.count / stats.totalPupils) * 100)
                      : 0
                    return (
                      <div key={cls.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                              <GraduationCap className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {cls.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                              {cls.count} pupils
                            </span>
                            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 tabular-nums w-8 text-right">
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <AnimatedProgress value={pct} color="violet" className="h-1.5" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ── Recent Activity ── */}
        <section>
          <SectionHeader title="Recent Activity" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

            {/* Assignments */}
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/40">
                    <FileText className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  Assignments
                </CardTitle>
                <Link
                  href="/staff/assignments"
                  className={cn(
                    "inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] text-slate-600 transition-colors hover:bg-muted hover:text-foreground dark:text-slate-300 dark:hover:bg-muted/50"
                  )}
                >
                  All <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="pt-0">
                {data?.recentAssignments.length === 0 ? (
                  <div className="text-center py-8 sm:py-10">
                    <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                      <FileText className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No assignments yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first assignment</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {data?.recentAssignments.map((assignment) => (
                      <button
                        key={assignment.id}
                        onClick={() => router.push('/staff/assignments')}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {assignment.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {assignment.subject}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium shrink-0 ml-2"
                        >
                          {assignment.status || 'Draft'}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Notes
                </CardTitle>
                <Link
                  href="/staff/notes"
                  className="inline-flex h-7 items-center justify-center gap-1 rounded-md px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                >
                  All <ArrowRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="pt-0">
                {data?.recentNotes.length === 0 ? (
                  <div className="text-center py-8 sm:py-10">
                    <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                      <BookMarked className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No notes yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start creating lesson notes</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {data?.recentNotes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => router.push('/staff/notes')}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full text-left group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {note.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {note.subject || 'General'}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 ml-2 tabular-nums">
                          {new Date(note.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center pt-4 sm:pt-6 pb-6 sm:pb-8 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <Sparkles className="h-3 w-3" />
              <p className="text-[11px] font-semibold">Vincollins Schools</p>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Geared Towards Excellence · &copy; {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}