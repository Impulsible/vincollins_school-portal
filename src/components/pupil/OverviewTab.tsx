
'use client'

import type { ElementType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  NotebookPen,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Profile {
  full_name: string
  class?: string
  class_arm?: string
}

interface Assignment {
  id: string
  title: string
  subject: string
  status?: 'pending' | 'completed' | 'submitted'
  due_date?: string
  score?: number
}

interface Note {
  id: string
  title: string
  subject?: string
  created_at?: string
}

interface Classmate {
  id: string
  full_name: string
  email: string
  photo_url?: string
  class: string
  first_name?: string
  last_name?: string
  display_name?: string
  vin_id?: string
}

interface Stats {
  recentAssignments: Assignment[]
  recentNotes: Note[]
  classmates: Classmate[]
}

interface BannerStats {
  totalAssignments: number
  completedAssignments: number
  pendingAssignments: number
  totalNotes: number
  totalClassmates: number
  completionRate: number
}

interface AttendanceSummary {
  attendanceRate?: number | null
  presentDays?: number | null
  absentDays?: number | null
  lateArrivals?: number | null
}

interface OverviewTabProps {
  profile: Profile
  stats: Stats
  bannerStats: BannerStats
  reportCardStatus: string
  termProgress: unknown
  currentTerm: string
  currentSession: string
  handleTabChange: (tab: string) => void
  router: { push: (path: string) => void }
  attendanceSummary?: AttendanceSummary
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const getInitials = (name: string) => {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  return parts[0]?.[0]?.toUpperCase() || 'U'
}

const getDisplayName = (c: Classmate) =>
  c.display_name || c.full_name || [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Friend'

const AVATAR_GRADIENTS = [
  'from-rose-500 to-pink-600',
  'from-orange-500 to-amber-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600',
]

const getAvatarGradient = (name: string) => {
  const hash = (name || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

const formatCount = (v?: number | null) =>
  typeof v === 'number' ? v.toLocaleString() : '—'

const formatPercent = (v?: number | null) =>
  typeof v === 'number' ? `${v}%` : '—'

const formatDate = (v?: string) => {
  if (!v) return null
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  return new Intl.DateTimeFormat('en-NG', { month: 'short', day: 'numeric' }).format(d)
}

const getStatusStyle = (status?: string) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', icon: CheckCircle2, iconColor: 'text-emerald-600', dot: 'bg-emerald-500' }
    case 'submitted':
      return { bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-200', icon: Clock, iconColor: 'text-cyan-600', dot: 'bg-cyan-500' }
    case 'pending':
      return { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', icon: AlertCircle, iconColor: 'text-amber-600', dot: 'bg-amber-500' }
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-200', icon: Clock, iconColor: 'text-slate-500', dot: 'bg-slate-400' }
  }
}

// ── Reusable UI ────────────────────────────────────────────────────────────────
function Card({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white shadow-sm',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  action,
  accent = 'text-slate-700',
  accentBg = 'bg-slate-100',
}: {
  icon: ElementType
  title: string
  description?: string
  action?: ReactNode
  accent?: string
  accentBg?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={cn('rounded-xl p-2 shrink-0', accentBg)}>
          <Icon className={cn('h-4 w-4', accent)} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

function ViewAllButton({ onClick, label = 'View all' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
    >
      <span className="whitespace-nowrap">{label}</span>
      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">{description}</p>
    </div>
  )
}

// ── Stat Tile ──────────────────────────────────────────────────────────────
interface StatTileConfig {
  icon: ElementType
  title: string
  value: string
  subtitle: string
  gradient: string
  iconBg: string
  iconColor: string
  trend?: 'up' | 'down' | 'neutral'
}

function StatTile({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient,
  iconBg,
  iconColor,
  delay = 0,
}: StatTileConfig & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
    >
      {/* Decorative gradient blob */}
      <div className={cn(
        'absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20',
        gradient
      )} />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {title}
            </p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
              {value}
            </p>
            <p className="mt-1.5 text-[11px] sm:text-xs text-slate-500 truncate">
              {subtitle}
            </p>
          </div>
          <div className={cn('shrink-0 rounded-xl p-2 sm:p-2.5', iconBg)}>
            <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', iconColor)} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export function OverviewTab({
  profile,
  stats,
  bannerStats,
  handleTabChange,
  router,
  attendanceSummary,
}: OverviewTabProps) {
  const recentAssignments = stats.recentAssignments || []
  const recentNotes = stats.recentNotes || []
  const classmates = stats.classmates || []
  const displayClassmates = classmates.slice(0, 8)
  const classLabel = [profile.class, profile.class_arm].filter(Boolean).join(' ')

  const presentDays = attendanceSummary?.presentDays ?? null
  const absentDays = attendanceSummary?.absentDays ?? null
  const totalAttendanceDays =
    typeof presentDays === 'number' && typeof absentDays === 'number'
      ? presentDays + absentDays
      : null

  const attendanceRate =
    typeof totalAttendanceDays === 'number' && totalAttendanceDays > 0 && typeof presentDays === 'number'
      ? Math.round((presentDays / totalAttendanceDays) * 100)
      : attendanceSummary?.attendanceRate ?? null

  const attendanceSubtitle =
    typeof presentDays === 'number' || typeof absentDays === 'number'
      ? `${formatCount(presentDays)} present · ${formatCount(absentDays)} absent`
      : 'Recorded by teachers'

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STAT TILES                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
        <StatTile
          icon={BarChart3}
          title="Attendance"
          value={formatPercent(attendanceRate)}
          subtitle={attendanceSubtitle}
          gradient="bg-emerald-500"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          delay={0.05}
        />
        <StatTile
          icon={FileText}
          title="Assignments"
          value={formatPercent(bannerStats.completionRate)}
          subtitle={`${formatCount(bannerStats.completedAssignments)}/${formatCount(bannerStats.totalAssignments)} done`}
          gradient="bg-blue-500"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          delay={0.1}
        />
        <StatTile
          icon={AlertCircle}
          title="To Do"
          value={formatCount(bannerStats.pendingAssignments)}
          subtitle="Tasks pending"
          gradient="bg-amber-500"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          delay={0.15}
        />
        <StatTile
          icon={Users}
          title="Classmates"
          value={formatCount(bannerStats.totalClassmates)}
          subtitle={classLabel || 'Your class'}
          gradient="bg-violet-500"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          delay={0.2}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TASKS + NOTES                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1.35fr_1fr]">

        {/* Recent Tasks */}
        <Card delay={0.25}>
          <div className="p-4 sm:p-5">
            <SectionHeader
              icon={FileText}
              title="Recent Tasks"
              description="Your latest assignments and deadlines"
              accent="text-blue-600"
              accentBg="bg-blue-50"
              action={<ViewAllButton onClick={() => handleTabChange('assignments')} />}
            />

            <div className="mt-4 sm:mt-5 space-y-2">
              {recentAssignments.length > 0 ? (
                recentAssignments.slice(0, 4).map((a, idx) => {
                  const s = getStatusStyle(a.status)
                  const Icon = s.icon
                  return (
                    <motion.button
                      key={a.id}
                      type="button"
                      onClick={() => handleTabChange('assignments')}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.04 }}
                      className="group w-full flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-3 text-left transition-all hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/50 active:scale-[0.99]"
                    >
                      <div className={cn('shrink-0 rounded-lg p-1.5', s.bg)}>
                        <Icon className={cn('h-3.5 w-3.5', s.iconColor)} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                            {a.title}
                          </p>
                          <span className={cn(
                            'shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold capitalize',
                            s.bg,
                            s.text
                          )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
                            {a.status || 'pending'}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="font-medium">{a.subject}</span>
                          {a.due_date && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="inline-flex items-center gap-0.5">
                                <Calendar className="h-2.5 w-2.5" />
                                {formatDate(a.due_date)}
                              </span>
                            </>
                          )}
                          {typeof a.score === 'number' && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="font-semibold text-emerald-600">{a.score}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No tasks yet"
                  description="Your assignments will appear here when your teachers post them."
                />
              )}
            </div>
          </div>
        </Card>

        {/* Recent Notes */}
        <Card delay={0.3}>
          <div className="p-4 sm:p-5">
            <SectionHeader
              icon={NotebookPen}
              title="Recent Notes"
              description="New class materials"
              accent="text-violet-600"
              accentBg="bg-violet-50"
              action={<ViewAllButton onClick={() => handleTabChange('notes')} />}
            />

            <div className="mt-4 sm:mt-5 space-y-2">
              {recentNotes.length > 0 ? (
                recentNotes.slice(0, 4).map((note, idx) => (
                  <motion.button
                    key={note.id}
                    type="button"
                    onClick={() => handleTabChange('notes')}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + idx * 0.04 }}
                    className="group w-full flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-3 text-left transition-all hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/50 active:scale-[0.99]"
                  >
                    <div className="shrink-0 rounded-lg bg-violet-50 p-1.5">
                      <NotebookPen className="h-3.5 w-3.5 text-violet-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                        {note.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-medium">{note.subject || 'General'}</span>
                        {note.created_at && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatDate(note.created_at)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))
              ) : (
                <EmptyState
                  icon={NotebookPen}
                  title="No notes yet"
                  description="Notes will appear here when they are available."
                />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CLASSMATES                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Card delay={0.35}>
        <div className="p-4 sm:p-5">
          <SectionHeader
            icon={Users}
            title="My Classmates"
            description={classLabel ? `Friends in ${classLabel}` : 'Friends in your class'}
            accent="text-violet-600"
            accentBg="bg-violet-50"
            action={
              <ViewAllButton
                onClick={() => router.push('/pupil/classmates')}
                label={`See all${bannerStats.totalClassmates ? ` (${bannerStats.totalClassmates})` : ''}`}
              />
            }
          />

          <div className="mt-4 sm:mt-5">
            {displayClassmates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {displayClassmates.map((c, idx) => {
                  const name = getDisplayName(c)
                  return (
                    <motion.button
                      key={c.id}
                      type="button"
                      onClick={() => router.push('/pupil/classmates')}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.03 }}
                      className="group flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-white p-2.5 transition-all hover:border-slate-300 hover:shadow-sm hover:bg-slate-50/50 active:scale-[0.98] text-left"
                    >
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white shadow-sm">
                        {c.photo_url && <AvatarImage src={c.photo_url} alt={name} />}
                        <AvatarFallback
                          className={cn(
                            'text-white text-xs font-bold bg-gradient-to-br',
                            getAvatarGradient(name)
                          )}
                        >
                          {getInitials(name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {name}
                        </p>
                        <p className="truncate text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                          {c.class || 'Classmate'}
                        </p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={Users}
                title="No classmates yet"
                description="Your classmates will appear here once they've been added."
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default OverviewTab