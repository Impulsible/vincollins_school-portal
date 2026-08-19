/* eslint-disable react-hooks/set-state-in-effect */
// app/admin/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser, getRoleColors } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import {
  Users, GraduationCap, Briefcase, Shield, UserPlus,
  FileText, Megaphone, ChevronRight, Settings,
  RefreshCw, School, AlertCircle,
  ArrowUpRight, Calendar,
  BarChart3, Award, Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AdminBanner } from '@/components/admin/AdminBanner'
import AdminLoading from '@/components/admin/AdminLoading'

// ── Types ────────────────────────────────────────────────────────────
interface Stats {
  totalPupils: number
  totalStaff: number
  totalAdmins: number
  totalUsers: number
}

interface SchoolSettings {
  school_name?: string
  logo_path?: string
  current_term?: string
  current_session?: string
}

// ── Constants ────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: UserPlus, label: 'Enroll Pupil', href: '/admin/students/add', tone: 'emerald' },
  { icon: Briefcase, label: 'Add Staff', href: '/admin/staff/add', tone: 'blue' },
  { icon: FileText, label: 'Report Cards', href: '/admin/report-cards', tone: 'amber' },
  { icon: Megaphone, label: 'Announcements', href: '/admin/announcements', tone: 'violet' },
  { icon: School, label: 'Class Assignments', href: '/admin/teacher-classes', tone: 'cyan' },
  { icon: Settings, label: 'Settings', href: '/admin/settings', tone: 'slate' },
] as const

const MANAGEMENT_TILES = [
  {
    href: '/admin/students',
    icon: GraduationCap,
    label: 'Student Registry',
    desc: 'View, edit, and manage all enrolled pupils',
    tone: 'emerald' as const,
    statKey: 'totalPupils' as const,
    statLabel: 'students',
  },
  {
    href: '/admin/staff',
    icon: Briefcase,
    label: 'Staff Directory',
    desc: 'Manage faculty profiles and assignments',
    tone: 'blue' as const,
    statKey: 'totalStaff' as const,
    statLabel: 'staff',
  },
  {
    href: '/admin/report-cards',
    icon: Award,
    label: 'Report Cards',
    desc: 'Review, approve, and publish termly reports',
    tone: 'amber' as const,
    statKey: null,
    statLabel: null,
  },
  {
    href: '/admin/broad-sheet',
    icon: BarChart3,
    label: 'Broad Sheet',
    desc: 'Class-wide performance analytics',
    tone: 'violet' as const,
    statKey: null,
    statLabel: null,
  },
]

// ── Tone Palette (single source of truth) ────────────────────────────
const TONES = {
  emerald: { icon: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', accent: 'bg-emerald-500', from: 'from-emerald-500', to: 'to-teal-600', hover: 'hover:border-emerald-200' },
  blue: { icon: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', accent: 'bg-blue-500', from: 'from-blue-500', to: 'to-indigo-600', hover: 'hover:border-blue-200' },
  amber: { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', accent: 'bg-amber-500', from: 'from-amber-500', to: 'to-orange-600', hover: 'hover:border-amber-200' },
  violet: { icon: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', accent: 'bg-violet-500', from: 'from-violet-500', to: 'to-purple-600', hover: 'hover:border-violet-200' },
  cyan: { icon: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100', accent: 'bg-cyan-500', from: 'from-cyan-500', to: 'to-blue-600', hover: 'hover:border-cyan-200' },
  slate: { icon: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', accent: 'bg-slate-500', from: 'from-slate-500', to: 'to-slate-600', hover: 'hover:border-slate-300' },
} as const

// ── Animations ───────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

// ── Section Header ───────────────────────────────────────────────────
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
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        <h2 className="text-sm font-black text-slate-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  tone,
  loading,
  delay = 0,
}: {
  title: string
  value: number
  icon: React.ElementType
  tone: keyof typeof TONES
  loading: boolean
  delay?: number
}) {
  const t = TONES[tone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className={cn('absolute top-0 left-0 right-0 h-0.5', t.accent)} />
      <div className={cn('absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity bg-gradient-to-br', t.from, t.to)} />

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </p>
          <div className={cn('shrink-0 h-8 w-8 rounded-xl flex items-center justify-center', t.bg)}>
            <Icon className={cn('h-4 w-4', t.icon)} />
          </div>
        </div>

        {loading ? (
          <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
            {value.toLocaleString()}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── Quick Action Chip ────────────────────────────────────────────────
function QuickActionChip({
  icon: Icon,
  label,
  href,
  tone,
}: {
  icon: React.ElementType
  label: string
  href: string
  tone: keyof typeof TONES
}) {
  const t = TONES[tone]

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border transition-all cursor-pointer',
          t.border, t.hover,
          'hover:shadow-sm'
        )}
      >
        <div className={cn('shrink-0 h-8 w-8 rounded-lg flex items-center justify-center', t.bg)}>
          <Icon className={cn('h-4 w-4', t.icon)} />
        </div>
        <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 flex-1 truncate">
          {label}
        </span>
        <ArrowUpRight className={cn('h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity', t.icon)} />
      </motion.div>
    </Link>
  )
}

// ── Management Tile ──────────────────────────────────────────────────
function ManagementTile({
  href,
  icon: Icon,
  label,
  desc,
  tone,
  stat,
  statLabel,
  loading,
}: {
  href: string
  icon: React.ElementType
  label: string
  desc: string
  tone: keyof typeof TONES
  stat: number | null
  statLabel: string | null
  loading: boolean
}) {
  const t = TONES[tone]

  return (
    <Link href={href}>
      <motion.div
        variants={fadeInUp}
        whileHover={{ y: -2 }}
        className={cn(
          'group bg-white rounded-2xl border border-slate-200/60 transition-all p-4 h-full cursor-pointer',
          t.hover, 'hover:shadow-md'
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', t.bg)}>
            <Icon className={cn('h-5 w-5', t.icon)} />
          </div>
          {stat !== null && (
            <div className="text-right">
              {loading ? (
                <div className="h-6 w-10 bg-slate-100 rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-xl font-black text-slate-800 tabular-nums leading-none">
                    {stat.toLocaleString()}
                  </p>
                  {statLabel && (
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                      {statLabel}
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
            {label}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{desc}</p>
        </div>
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
          <span className={cn('text-[10px] font-bold uppercase tracking-widest', t.icon)}>
            Open
          </span>
          <ArrowUpRight className={cn('h-3 w-3 transition-transform group-hover:translate-x-0.5', t.icon)} />
        </div>
      </motion.div>
    </Link>
  )
}

// ── User Breakdown ───────────────────────────────────────────────────
function UserBreakdown({ stats, loading }: { stats: Stats; loading: boolean }) {
  const segments = useMemo(() => {
    const total = stats.totalUsers || 1
    return [
      { label: 'Pupils', value: stats.totalPupils, pct: Math.round((stats.totalPupils / total) * 100), tone: 'emerald' as const },
      { label: 'Staff', value: stats.totalStaff, pct: Math.round((stats.totalStaff / total) * 100), tone: 'blue' as const },
      { label: 'Admins', value: stats.totalAdmins, pct: Math.round((stats.totalAdmins / total) * 100), tone: 'amber' as const },
    ]
  }, [stats])

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-50 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
        {segments.map(({ label, pct, tone }) => (
          <motion.div
            key={label}
            className={cn('h-full', TONES[tone].accent)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-1.5">
        {segments.map(({ label, value, pct, tone }) => (
          <div key={label} className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full shrink-0', TONES[tone].accent)} />
            <span className="text-[11px] font-semibold text-slate-600 flex-1">{label}</span>
            <span className="text-[11px] font-bold text-slate-800 tabular-nums">
              {value.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-slate-400 tabular-nums w-8 text-right">
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const { user, loading: userLoading } = useUser()
  const [stats, setStats] = useState<Stats>({
    totalPupils: 0,
    totalStaff: 0,
    totalAdmins: 0,
    totalUsers: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Auth guard
  useEffect(() => {
    if (!mounted || userLoading || redirecting) return
    if (!user || user.role !== 'admin') {
      setRedirecting(true)
      window.location.href = '/portal'
    }
  }, [mounted, user, userLoading, redirecting])

  const roleColors = getRoleColors(user?.role)
  const primaryColor = roleColors?.primary || '#0A2472'

  const fetchSchoolSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('school_settings')
        .select('school_name,logo_path,current_term,current_session')
        .maybeSingle()
      if (data) setSchoolSettings(data)
    } catch { /* silent */ }
  }, [])

  const fetchStats = useCallback(async () => {
    if (!user) return
    try {
      setStatsLoading(true)
      setError(null)
      const res = await fetch('/api/admin/users')
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      const users = result.data || []
      setStats({
        totalPupils: users.filter((u: any) => u.role === 'pupil' || u.role === 'student').length,
        totalStaff: users.filter((u: any) => u.role === 'staff' || u.role === 'teacher').length,
        totalAdmins: users.filter((u: any) => u.role === 'admin').length,
        totalUsers: users.length,
      })
    } catch {
      setError('Failed to load statistics')
      toast.error('Failed to load statistics')
    } finally {
      setStatsLoading(false)
    }
  }, [user])

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    await Promise.all([fetchStats(), fetchSchoolSettings()])
    setIsRefreshing(false)
    toast.success('Dashboard refreshed')
  }, [fetchStats, fetchSchoolSettings, isRefreshing])

  useEffect(() => {
    if (user && mounted) {
      fetchStats()
      fetchSchoolSettings()
    }
  }, [user, mounted, fetchStats, fetchSchoolSettings])

  // ── Loading State ────────────────────────────────────────────────────
  if (!mounted || userLoading || redirecting) {
    return (
      <AdminLoading
        profile={user}
        onLogout={() => { window.location.href = '/auth/logout' }}
      />
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50/60">

      {/* Refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-2.5 border border-slate-100"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span className="text-xs font-semibold text-slate-600">Refreshing…</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
      >

        {/* ═══ Banner ═══════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <AdminBanner
            userName={user?.full_name || user?.first_name || 'Admin'}
            termInfo={{
              term: schoolSettings?.current_term || 'Not Set',
              session: schoolSettings?.current_session || 'Not Set',
            }}
            onDismiss={() => { }}
          />
        </motion.div>

        {/* ═══ Row 1: Stats + Refresh ══════════════════════════════════ */}
        <section>
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-black text-slate-800 tracking-tight">Overview</h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                System-wide user statistics
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={statsLoading || isRefreshing}
              className="text-xs text-slate-500 hover:text-slate-700 gap-1.5 rounded-xl h-8"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', (statsLoading || isRefreshing) && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          {error ? (
            <motion.div
              variants={fadeInUp}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
            >
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-600 font-semibold mb-3 text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="rounded-xl">
                Try Again
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard title="Pupils" value={stats.totalPupils} icon={GraduationCap} tone="emerald" loading={statsLoading} delay={0.05} />
              <StatCard title="Staff" value={stats.totalStaff} icon={Briefcase} tone="blue" loading={statsLoading} delay={0.1} />
              <StatCard title="Admins" value={stats.totalAdmins} icon={Shield} tone="amber" loading={statsLoading} delay={0.15} />
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} tone="violet" loading={statsLoading} delay={0.2} />
            </div>
          )}
        </section>

        {/* ═══ Row 2: Quick Actions ═══════════════════════════════════ */}
        <section>
          <SectionHeader
            title="Quick Actions"
            subtitle="Common tasks and shortcuts"
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
          >
            {QUICK_ACTIONS.map(a => (
              <motion.div key={a.href} variants={fadeInUp}>
                <QuickActionChip {...a} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ═══ Row 3: Two-column layout ═══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* ─── LEFT: Management ────────────────────────────────────── */}
          <section>
            <SectionHeader
              title="Management"
              subtitle="Key administration areas"
            />
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {MANAGEMENT_TILES.map(tile => (
                <ManagementTile
                  key={tile.href}
                  href={tile.href}
                  icon={tile.icon}
                  label={tile.label}
                  desc={tile.desc}
                  tone={tile.tone}
                  stat={tile.statKey ? stats[tile.statKey] : null}
                  statLabel={tile.statLabel}
                  loading={statsLoading}
                />
              ))}
            </motion.div>
          </section>

          {/* ─── RIGHT: School Info Panel ────────────────────────────── */}
          <aside className="space-y-4">

            {/* School Info Card */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {/* Header with logo */}
                <div
                  className="relative h-20"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                    }}
                  />

                  <div className="absolute -bottom-6 left-5">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden ring-4 ring-white">
                      {schoolSettings?.logo_path ? (
                        <div className="relative h-full w-full">
                          <Image src={schoolSettings.logo_path} alt="Logo" fill className="object-contain p-1.5" />
                        </div>
                      ) : (
                        <GraduationCap className="h-6 w-6" style={{ color: primaryColor }} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-9 px-5 pb-5">
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {schoolSettings?.school_name || 'Vincollins Schools'}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">
                    Administration Portal
                  </p>

                  {/* Term info inline */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Current Term
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-800">
                        {schoolSettings?.current_term || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Session
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-800">
                        {schoolSettings?.current_session || '—'}
                      </span>
                    </div>
                  </div>

                  <Link href="/admin/settings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl text-xs h-9 border-slate-200 hover:border-slate-300 gap-1.5 mt-4 font-semibold"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Manage Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* User Breakdown */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800">User Distribution</h3>
                  <Link
                    href="/admin/students"
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-0.5 transition-colors"
                  >
                    View all
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <UserBreakdown stats={stats} loading={statsLoading} />
              </div>
            </motion.div>

          </aside>
        </div>

        {/* ═══ Footer ══════════════════════════════════════════════════ */}
        <motion.div variants={fadeInUp}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              {schoolSettings?.logo_path && (
                <div className="relative h-4 w-4 opacity-40">
                  <Image src={schoolSettings.logo_path} alt="logo" fill className="object-contain" />
                </div>
              )}
              <p className="text-[10px] text-slate-400 font-semibold">
                {schoolSettings?.school_name || 'Vincollins Schools'} · Admin Panel
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} · All rights reserved
            </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}