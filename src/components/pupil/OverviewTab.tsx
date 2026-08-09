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
import { Badge } from '@/components/ui/badge'
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
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return parts[0]?.[0]?.toUpperCase() || 'U'
}

const getDisplayName = (classmate: Classmate) =>
  classmate.display_name ||
  classmate.full_name ||
  [classmate.first_name, classmate.last_name].filter(Boolean).join(' ') ||
  'Friend'

const formatCount = (value?: number | null) =>
  typeof value === 'number' ? value.toLocaleString() : '—'

const formatPercent = (value?: number | null) =>
  typeof value === 'number' ? `${value}%` : '—'

const formatDate = (value?: string) => {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-NG', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const getAssignmentStatusColor = (status?: string) => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'submitted':
      return 'bg-cyan-100 text-cyan-700 border-cyan-200'
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

const getAssignmentStatusIcon = (status?: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    case 'submitted':
      return <Clock className="h-4 w-4 text-cyan-600" />
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-amber-600" />
    default:
      return <Clock className="h-4 w-4 text-slate-500" />
  }
}

// ── Reusable UI ────────────────────────────────────────────────────────────────
function SurfaceCard({
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
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
  onViewAll,
  viewAllLabel = 'View all',
}: {
  icon: ElementType
  title: string
  description?: string
  onViewAll?: () => void
  viewAllLabel?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-100 p-2">
          <Icon className="h-4 w-4 text-slate-700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>

      {onViewAll ? (
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  subtitle,
  tone,
  delay = 0,
}: {
  icon: ElementType
  title: string
  value: string
  subtitle: string
  tone: string
  delay?: number
}) {
  return (
    <SurfaceCard delay={delay}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className={cn('shrink-0 rounded-xl p-2.5', tone)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </SurfaceCard>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function OverviewTab({
  profile,
  stats,
  bannerStats,
  handleTabChange,
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
    typeof totalAttendanceDays === 'number' &&
    totalAttendanceDays > 0 &&
    typeof presentDays === 'number'
      ? Math.round((presentDays / totalAttendanceDays) * 100)
      : attendanceSummary?.attendanceRate ?? null

  const attendanceSubtitle =
    typeof presentDays === 'number' || typeof absentDays === 'number'
      ? `${formatCount(presentDays)} present • ${formatCount(absentDays)} absent`
      : 'Recorded by teachers'

  return (
    <div className="space-y-6">
      {/* Top Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={BarChart3}
          title="Attendance"
          value={formatPercent(attendanceRate)}
          subtitle={attendanceSubtitle}
          tone="bg-emerald-50 text-emerald-600"
          delay={0}
        />

        <SummaryCard
          icon={FileText}
          title="My Assignments"
          value={formatPercent(bannerStats.completionRate)}
          subtitle={`${formatCount(bannerStats.completedAssignments)} of ${formatCount(bannerStats.totalAssignments)} done`}
          tone="bg-blue-50 text-blue-600"
          delay={0.04}
        />

        <SummaryCard
          icon={AlertCircle}
          title="To Do"
          value={formatCount(bannerStats.pendingAssignments)}
          subtitle="Tasks waiting for you"
          tone="bg-amber-50 text-amber-600"
          delay={0.08}
        />

        <SummaryCard
          icon={Users}
          title="My Friends"
          value={formatCount(bannerStats.totalClassmates)}
          subtitle={classLabel ? `Friends in ${classLabel}` : 'Friends in your class'}
          tone="bg-violet-50 text-violet-600"
          delay={0.12}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        {/* Recent Assignments */}
        <SurfaceCard delay={0.16}>
          <div className="p-6">
            <SectionHeader
              icon={FileText}
              title="Recent Tasks"
              description="Your latest assignments and deadlines"
              onViewAll={() => handleTabChange('assignments')}
            />

            <div className="mt-6 space-y-3">
              {recentAssignments.length > 0 ? (
                recentAssignments.slice(0, 4).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="mt-0.5 shrink-0">
                      {getAssignmentStatusIcon(assignment.status)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {assignment.title}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>{assignment.subject}</span>

                            {assignment.due_date ? (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="inline-flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(assignment.due_date)}
                                </span>
                              </>
                            ) : null}

                            {typeof assignment.score === 'number' ? (
                              <>
                                <span className="text-slate-300">•</span>
                                <span>Score: {assignment.score}%</span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <Badge
                          className={cn(
                            'shrink-0 border text-xs font-medium capitalize',
                            getAssignmentStatusColor(assignment.status)
                          )}
                        >
                          {assignment.status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No tasks yet"
                  description="Your assignments will appear here when available."
                />
              )}
            </div>
          </div>
        </SurfaceCard>

        {/* Recent Notes */}
        <SurfaceCard delay={0.2}>
          <div className="p-6">
            <SectionHeader
              icon={NotebookPen}
              title="Recent Notes"
              description="New class notes and learning materials"
              onViewAll={() => handleTabChange('notes')}
            />

            <div className="mt-6 space-y-3">
              {recentNotes.length > 0 ? (
                recentNotes.slice(0, 4).map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 rounded-lg bg-violet-100 p-2">
                        <NotebookPen className="h-4 w-4 text-violet-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {note.title}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{note.subject || 'General'}</span>

                          {note.created_at ? (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(note.created_at)}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No notes yet"
                  description="Notes will appear here when they are available."
                />
              )}
            </div>
          </div>
        </SurfaceCard>
      </div>

      {/* Friends Preview */}
      <SurfaceCard delay={0.24}>
        <div className="p-6">
          <SectionHeader
            icon={Users}
            title="My Friends"
            description={
              classLabel
                ? `Friends in ${classLabel}`
                : 'Friends in your class'
            }
            onViewAll={() => handleTabChange('classmates')}
            viewAllLabel={`See all (${bannerStats.totalClassmates})`}
          />

          <div className="mt-6">
            {displayClassmates.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {displayClassmates.map((classmate) => {
                  const displayName = getDisplayName(classmate)

                  return (
                    <div
                      key={classmate.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        {classmate.photo_url ? (
                          <AvatarImage
                            src={classmate.photo_url}
                            alt={displayName}
                          />
                        ) : null}
                        <AvatarFallback className="bg-slate-200 text-sm font-semibold text-slate-700">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {classmate.class || 'Friend'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title="No friends yet"
                description="Your friends will appear here when available."
              />
            )}
          </div>
        </div>
      </SurfaceCard>
    </div>
  )
}

export default OverviewTab