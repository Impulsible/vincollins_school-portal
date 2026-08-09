// app/admin/page.tsx
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser, getRoleColors } from '@/contexts/UserContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users, GraduationCap, Briefcase, Shield, UserPlus,
  FileText, Megaphone, ChevronRight, Settings,
  RefreshCw, School, AlertCircle, TrendingUp,
  ArrowUpRight, Zap, Calendar, BookOpen,
  PieChart, BarChart3, Clock, Award,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AdminBanner } from '@/components/admin/AdminBanner'
import AdminLoading from '@/components/admin/AdminLoading'

// ── Animation Variants ─────────────────────────────────────────────────────────
const fadeInUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}
const fadeInRight = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}
const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  from: string
  to: string
  loading: boolean
  subtitle: string
  trend?: string
}

function StatCard({ title, value, icon: Icon, from, to, loading, subtitle, trend }: StatCardProps) {
  return (
    <motion.div variants={fadeInUp} className="group">
      <div className={cn(
        'relative overflow-hidden rounded-2xl p-5 h-full',
        'bg-gradient-to-br text-white',
        from, to,
      )}>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col h-full gap-3">
          <div className="flex items-start justify-between">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
              <Icon className="h-5 w-5 text-white" />
            </div>
            {trend && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold
                               bg-white/20 text-white px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </span>
            )}
          </div>

          <div>
            {loading ? (
              <div className="h-9 w-16 bg-white/20 rounded-xl animate-pulse" />
            ) : (
              <p className="text-4xl font-black tabular-nums leading-none">{value}</p>
            )}
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mt-1">
              {title}
            </p>
          </div>

          <p className="text-[11px] text-white/60 font-medium mt-auto">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Quick Action ───────────────────────────────────────────────────────────────
interface QuickActionProps {
  icon: React.ElementType
  label: string
  description: string
  href: string
  iconColor: string
  iconBg: string
  accent: string
}

function QuickAction({ icon: Icon, label, description, href, iconColor, iconBg, accent }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        variants={fadeInUp}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100
                   hover:border-slate-200 hover:shadow-lg transition-all duration-300 p-4 h-full cursor-pointer"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top right, ${accent}08, transparent 70%)` }}
        />
        <div className="relative flex flex-col gap-3 h-full">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 group-hover:text-slate-900">{label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
          </div>
          <div
            className="self-end w-7 h-7 rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ backgroundColor: `${accent}15` }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" style={{ color: accent }} />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────────
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
    <motion.div variants={fadeInUp} className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-black text-slate-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  )
}

// ── User Breakdown Bar ─────────────────────────────────────────────────────────
function UserBreakdown({
  stats,
  loading,
}: {
  stats: { totalPupils: number; totalStaff: number; totalAdmins: number; totalUsers: number }
  loading: boolean
}) {
  const segments = useMemo(() => {
    const total = stats.totalUsers || 1
    return [
      { label: 'Pupils', value: stats.totalPupils, pct: Math.round((stats.totalPupils / total) * 100), color: 'bg-emerald-500', icon: GraduationCap, bg: 'bg-emerald-50', text: 'text-emerald-600' },
      { label: 'Staff',  value: stats.totalStaff,  pct: Math.round((stats.totalStaff / total) * 100),  color: 'bg-blue-500',    icon: Briefcase,     bg: 'bg-blue-50',    text: 'text-blue-600' },
      { label: 'Admins', value: stats.totalAdmins, pct: Math.round((stats.totalAdmins / total) * 100), color: 'bg-amber-500',   icon: Shield,        bg: 'bg-amber-50',   text: 'text-amber-600' },
    ]
  }, [stats])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-2 w-full bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
        {segments.map(({ label, pct, color }) => (
          <motion.div
            key={label}
            className={cn('h-full first:rounded-l-full last:rounded-r-full', color)}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {segments.map(({ label, value, pct, icon: Icon, bg, text }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={cn('h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
              <Icon className={cn('h-4 w-4', text)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-700">{label}</span>
                <span className="text-[12px] font-bold text-slate-500 tabular-nums">
                  {value} <span className="text-slate-400">({pct}%)</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Term Info Panel ────────────────────────────────────────────────────────────
function TermInfoPanel({ schoolSettings }: { schoolSettings: any }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: 'Current Term',    value: schoolSettings?.current_term    || '—', icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Session',         value: schoolSettings?.current_session || '—', icon: Clock,    color: 'text-blue-600',   bg: 'bg-blue-50' },
      ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={cn('h-5 w-5 rounded-md flex items-center justify-center', bg)}>
              <Icon className={cn('h-3 w-3', color)} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {label}
            </p>
          </div>
          <p className="text-sm font-bold text-slate-700 truncate">{value}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user, loading: userLoading } = useUser()
  const [stats, setStats] = useState({
    totalPupils: 0,
    totalStaff: 0,
    totalAdmins: 0,
    totalUsers: 0,
  })
  const [statsLoading,   setStatsLoading]   = useState(true)
  const [schoolSettings, setSchoolSettings] = useState<any>(null)
  const [isRefreshing,   setIsRefreshing]   = useState(false)
  const [mounted,        setMounted]        = useState(false)
  const [redirecting,    setRedirecting]    = useState(false)
  const [error,          setError]          = useState<string | null>(null)

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
      const res    = await fetch('/api/admin/users')
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      const users = result.data || []
      setStats({
        totalPupils: users.filter((u: any) => u.role === 'pupil' || u.role === 'student').length,
        totalStaff:  users.filter((u: any) => u.role === 'staff'  || u.role === 'teacher').length,
        totalAdmins: users.filter((u: any) => u.role === 'admin').length,
        totalUsers:  users.length,
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

  // Quick actions
  const quickActions: QuickActionProps[] = [
    { icon: UserPlus,  label: 'Enroll Pupil',    description: 'Register a new student',      href: '/admin/students/add',    iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', accent: '#059669' },
    { icon: Briefcase, label: 'Add Staff',        description: 'Onboard a teacher or staff',  href: '/admin/staff/add',       iconColor: 'text-blue-600',    iconBg: 'bg-blue-50',    accent: '#2563EB' },
    { icon: FileText,  label: 'Report Cards',     description: 'Generate and manage reports', href: '/admin/report-cards',    iconColor: 'text-amber-600',   iconBg: 'bg-amber-50',   accent: '#D97706' },
    { icon: Megaphone, label: 'Announcements',    description: 'Broadcast updates to all',    href: '/admin/announcements',   iconColor: 'text-violet-600',  iconBg: 'bg-violet-50',  accent: '#7C3AED' },
    { icon: School,    label: 'Teacher Classes',  description: 'Manage class assignments',    href: '/admin/teacher-classes', iconColor: 'text-cyan-600',    iconBg: 'bg-cyan-50',    accent: '#0891B2' },
    { icon: Settings,  label: 'Settings',         description: 'School and system config',    href: '/admin/settings',        iconColor: 'text-rose-600',    iconBg: 'bg-rose-50',    accent: '#E11D48' },
  ]

  // ── Loading State ──────────────────────────────────────────────────────────────
  if (!mounted || userLoading || redirecting) {
    return (
      <AdminLoading 
        profile={user} 
        onLogout={() => {
          // Handle logout
          window.location.href = '/auth/logout'
        }} 
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
            className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-xl
                       shadow-xl px-4 py-2.5 flex items-center gap-2.5 border border-slate-100"
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
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >

        {/* ── Banner ──────────────────────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <AdminBanner
            userName={user?.full_name || user?.first_name || 'Admin'}
            termInfo={{
              term:    schoolSettings?.current_term    || 'Not Set',
              session: schoolSettings?.current_session || 'Not Set',
            }}
            onDismiss={() => {}}
          />
        </motion.div>

        {/*
          ══════════════════════════════════════════════════════════════════
           MAIN GRID — 3-column on xl, 1 col mobile
           Row 1: 4 stat cards (full width)
           Row 2: Quick Actions (2 cols) + Right Panel (1 col)
          ══════════════════════════════════════════════════════════════════
        */}

        {/* ── Row 1: Stats ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Overview"
            subtitle="System-wide statistics"
            action={
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
            }
          />

          {error ? (
            <motion.div
              variants={fadeInUp}
              className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
            >
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 font-semibold mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="rounded-xl">
                Try Again
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard
                title="Total Pupils"
                value={stats.totalPupils}
                icon={GraduationCap}
                from="from-emerald-500"
                to="to-teal-600"
                loading={statsLoading}
                subtitle="Enrolled students"
                trend="+12%"
              />
              <StatCard
                title="Teachers & Staff"
                value={stats.totalStaff}
                icon={Briefcase}
                from="from-blue-500"
                to="to-indigo-600"
                loading={statsLoading}
                subtitle="Faculty members"
                trend="+3%"
              />
              <StatCard
                title="Administrators"
                value={stats.totalAdmins}
                icon={Shield}
                from="from-amber-500"
                to="to-orange-600"
                loading={statsLoading}
                subtitle="Full system access"
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={Users}
                from="from-violet-500"
                to="to-purple-600"
                loading={statsLoading}
                subtitle="All registered accounts"
                trend="+8%"
              />
            </motion.div>
          )}
        </section>

        {/* ── Row 2: Two-column layout ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── LEFT: Quick Actions (spans 2) ──────────────────────────────── */}
          <div className="xl:col-span-2 space-y-6">

            {/* Quick Actions */}
            <section>
              <SectionHeader
                title="Quick Actions"
                subtitle="Common tasks at your fingertips"
              />
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {quickActions.map(a => (
                  <QuickAction key={a.href} {...a} />
                ))}
              </motion.div>
            </section>

            {/* Management shortcuts — wide cards */}
            <section>
              <SectionHeader
                title="Management"
                subtitle="Key administration areas"
              />
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {[
                  {
                    href: '/admin/students',
                    icon: GraduationCap,
                    label: 'Student Registry',
                    desc: 'View all enrolled pupils, manage records, and track student data across classes.',
                    stat: stats.totalPupils,
                    statLabel: 'students',
                    iconColor: 'text-emerald-600',
                    iconBg: 'bg-emerald-50',
                    accent: '#059669',
                    loading: statsLoading,
                  },
                  {
                    href: '/admin/staff',
                    icon: Briefcase,
                    label: 'Staff Directory',
                    desc: 'Manage faculty profiles, assign roles, and oversee teaching staff.',
                    stat: stats.totalStaff,
                    statLabel: 'staff members',
                    iconColor: 'text-blue-600',
                    iconBg: 'bg-blue-50',
                    accent: '#2563EB',
                    loading: statsLoading,
                  },
                  {
                    href: '/admin/report-cards',
                    icon: Award,
                    label: 'Report Cards',
                    desc: 'Review, approve, and publish termly academic reports for all classes.',
                    stat: null,
                    statLabel: null,
                    iconColor: 'text-amber-600',
                    iconBg: 'bg-amber-50',
                    accent: '#D97706',
                    loading: false,
                  },
                  {
                    href: '/admin/broad-sheet',
                    icon: BarChart3,
                    label: 'Broad Sheet',
                    desc: 'Generate comprehensive result summaries and class-wide performance analytics.',
                    stat: null,
                    statLabel: null,
                    iconColor: 'text-violet-600',
                    iconBg: 'bg-violet-50',
                    accent: '#7C3AED',
                    loading: false,
                  },
                ].map(({ href, icon: Icon, label, desc, stat, statLabel, iconColor, iconBg, accent, loading }) => (
                  <Link key={href} href={href}>
                    <motion.div
                      variants={fadeInUp}
                      whileHover={{ y: -2 }}
                      className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200
                                 hover:shadow-lg transition-all duration-300 p-5 h-full cursor-pointer relative overflow-hidden"
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at bottom left, ${accent}06, transparent 70%)` }}
                      />

                      <div className="relative space-y-3">
                        <div className="flex items-start justify-between">
                          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
                            <Icon className={cn('h-5 w-5', iconColor)} />
                          </div>
                          {stat !== null && (
                            <div className="text-right">
                              {loading ? (
                                <div className="h-6 w-10 bg-slate-100 rounded-lg animate-pulse" />
                              ) : (
                                <p className="text-2xl font-black text-slate-800 tabular-nums leading-none">
                                  {stat}
                                </p>
                              )}
                              {statLabel && (
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{statLabel}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{label}</h3>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ color: accent }}>
                            Open
                          </span>
                          <ArrowUpRight
                            className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ color: accent }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </section>
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* School card */}
            <motion.div variants={fadeInRight}>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div
                  className="h-20 relative"
                  style={{
                    background: `linear-gradient(135deg, ${roleColors?.primary || '#0A2472'} 0%, ${roleColors?.primary || '#0A2472'}cc 100%)`,
                  }}
                >
                  <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                  <div className="absolute -bottom-5 left-5">
                    <div className="h-12 w-12 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
                      {schoolSettings?.logo_path ? (
                        <div className="relative h-full w-full">
                          <Image src={schoolSettings.logo_path} alt="logo" fill className="object-contain p-1.5" />
                        </div>
                      ) : (
                        <GraduationCap className="h-6 w-6 text-slate-600" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-8 px-5 pb-5 space-y-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">
                      {schoolSettings?.school_name || 'Vincollins Schools'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Administration Portal
                    </p>
                  </div>

                  <TermInfoPanel schoolSettings={schoolSettings} />

                  <Link href="/admin/settings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl text-xs h-9 border-slate-200
                                 hover:border-slate-300 gap-2 mt-2"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Manage Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* User breakdown */}
            <motion.div variants={fadeInRight}>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800">User Breakdown</h3>
                  <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center">
                    <PieChart className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
                <UserBreakdown stats={stats} loading={statsLoading} />
                <Link href="/admin/students">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-slate-500 hover:text-slate-700 gap-1 rounded-xl h-8 mt-1"
                  >
                    View all users
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Help card */}
            <motion.div variants={fadeInRight}>
              <div
                className="rounded-2xl p-5 text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${roleColors?.primary || '#0A2472'} 0%, ${roleColors?.primary || '#0A2472'}bb 100%)`,
                }}
              >
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-2 w-16 h-16 rounded-full bg-white/5" />
                <div className="relative space-y-3">
                  <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Need help?</p>
                    <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                      Access guides, docs and support resources for the admin panel.
                    </p>
                  </div>
                  <Link href="/admin/help">
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-0
                                 rounded-xl text-xs h-8 gap-1.5 backdrop-blur-sm w-full mt-1"
                    >
                      Open Help Centre
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3
                          pt-6 border-t border-slate-200/80">
            <div className="flex items-center gap-3">
              {schoolSettings?.logo_path && (
                <div className="relative h-5 w-5 opacity-40">
                  <Image src={schoolSettings.logo_path} alt="logo" fill className="object-contain" />
                </div>
              )}
              <p className="text-[11px] text-slate-400 font-medium">
                {schoolSettings?.school_name || 'Vincollins Schools'} · Admin Panel
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              &copy; {new Date().getFullYear()} · All rights reserved
            </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}