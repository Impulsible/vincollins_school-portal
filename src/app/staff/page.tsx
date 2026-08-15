/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
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
  BarChart3, TrendingUp, Award,
  CalendarCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
// ✅ Import PrimaryScoresTab
import PrimaryScoresTab from '@/components/staff/PrimaryScoresTab'

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

// ── Helper Components ─────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Briefcase className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <p className="text-slate-600 font-medium">Loading Staff Dashboard...</p>
      </div>
    </div>
  )
}

function QuickActionButton({
  icon: Icon,
  label,
  description,
  onClick,
  color
}: {
  icon: React.ElementType
  label: string
  description: string
  onClick: () => void
  color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'teal'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300',
    violet: 'bg-violet-50 text-violet-600 border-violet-200 hover:border-violet-300',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-300',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-300',
    rose: 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300',
    teal: 'bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-300',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex items-start gap-3 p-4 rounded-2xl border transition-all text-left w-full',
        colors[color],
        'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110',
        colors[color].replace('border-', 'bg-')
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
    </button>
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
    currentWeek: 5,
    totalWeeks: 13,
    weekProgress: 38,
    displayWeek: 'Week 5 of 13',
  })
  const [scoresRefreshKey, setScoresRefreshKey] = useState(0)

  // ─── Fetch Term Info from Database ─────────────────────────────────────────
  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('current_term, current_session')
          .maybeSingle()

        if (!error && data) {
          setTermInfo(prev => ({
            ...prev,
            termName: data.current_term || prev.termName,
            sessionYear: data.current_session || prev.sessionYear,
          }))
        }
      } catch (error) {
        console.error('Error fetching term:', error)
      }
    }
    fetchTerm()
  }, [])

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.id) return

    try {
      setRefreshing(true)
      const userId = user.id

      const { data: pupils } = await supabase
        .from('profiles')
        .select('id, full_name, class, is_active')
        .in('role', ['pupil', 'student'])

      const { data: assignments } = await supabase
        .from('assignments')
        .select('id, title, subject, status, created_at')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: notes } = await supabase
        .from('notes')
        .select('id, title, subject, created_at')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: primaryScores } = await supabase
        .from('primary_scores')
        .select('id, student_id, subject, class, term, academic_year, ca_score, exam_score, total_score, remark')
        .eq('teacher_id', userId)
        .eq('term', termInfo.termName)
        .eq('academic_year', termInfo.sessionYear)

      const today = new Date().toISOString().split('T')[0]
      const { data: attendanceTodayData } = await supabase
        .from('attendance')
        .select('id, status')
        .eq('date', today)

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
      const classBreakdown = Array.from(classMap.entries()).map(([name, count]) => ({ name, count }))

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
          pendingGrading: pendingGrading,
          averagePerformance: avgPerformance,
          attendanceToday: totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0,
          attendanceWeek: 0,
          scoresSubmitted: scoresSubmitted,
          totalScores: totalScores,
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

  // ─── Initial Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user?.id && user?.role !== 'student') {
      fetchData()
    }
  }, [authLoading, user, fetchData])

  const stats = data?.stats || DEFAULT_STATS

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  if (!user || user.role === 'student') {
    router.replace('/portal')
    return null
  }

  // ─── Map user to StaffProfile ──────────────────────────────────────────────
  // ✅ FIX: Use full_name instead of name, add optional chaining for missing properties
  const staffProfile: StaffProfile = {
    id: user.id,
    full_name: user.full_name || user.first_name || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    department: (user as any).department || '', // ✅ Use type assertion
    role: user.role || 'staff',
    photo_url: user.photo_url || null,
    avatar_url: user.avatar_url || null,
    title: (user as any).title || '', // ✅ Use type assertion
  }

  console.log('🔍 Staff Profile:', {
    id: staffProfile.id,
    full_name: staffProfile.full_name,
    hasId: !!staffProfile.id
  })

  // ─── Map stats to StaffStats ──────────────────────────────────────────────
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

  const submissionPercentage = stats.totalScores > 0 
    ? Math.round((stats.scoresSubmitted / stats.totalScores) * 100) 
    : 0

  const handleScoresSaved = useCallback(() => {
    console.log('🔄 Scores saved, refreshing dashboard data...')
    setScoresRefreshKey(prev => prev + 1)
    fetchData()
  }, [fetchData])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      <StaffWelcomeBanner
        profile={staffProfile}
        stats={staffStats}
        termInfo={termInfo}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Primary Scores Summary ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-0 shadow-soft bg-gradient-to-r from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                Primary Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">{stats.scoresSubmitted} submitted</span>
                <span className="font-medium text-blue-600">
                  {submissionPercentage}%
                </span>
              </div>
              <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${submissionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats.totalScores - stats.scoresSubmitted} pending grading
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft bg-gradient-to-r from-emerald-50 to-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-emerald-700">
                  {stats.averagePerformance}%
                </span>
                <Badge className={cn(
                  'text-xs',
                  stats.averagePerformance >= 70 ? 'bg-emerald-600 text-white' :
                  stats.averagePerformance >= 50 ? 'bg-amber-500 text-white' :
                  'bg-rose-500 text-white'
                )}>
                  {stats.averagePerformance >= 70 ? '🌟 Excellent' :
                   stats.averagePerformance >= 50 ? '📈 Good' :
                   '⚠️ Needs Improvement'}
                </Badge>
              </div>
              <div className="h-2 bg-emerald-200 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(stats.averagePerformance, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Based on {stats.scoresSubmitted} submitted scores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Actions ────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Actions</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRefreshing(true)
                fetchData().then(() => {
                  toast.success('Dashboard refreshed')
                })
              }}
              disabled={refreshing}
              className="h-7 text-xs"
            >
              <RefreshCw className={cn('h-3 w-3 mr-1.5', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <QuickActionButton
              icon={Users}
              label="Pupils"
              description="View all pupils"
              onClick={() => router.push('/staff/pupils')}
              color="blue"
            />
            <QuickActionButton
              icon={FileText}
              label="Assignments"
              description="Create & manage"
              onClick={() => router.push('/staff/assignments')}
              color="violet"
            />
            <QuickActionButton
              icon={Calculator}
              label="Scores"
              description="Manage pupil scores"
              onClick={() => router.push('/staff/scores')}
              color="amber"
            />
            <QuickActionButton
              icon={CalendarCheck}
              label="Attendance"
              description="Mark & view attendance"
              onClick={() => router.push('/staff/attendance')}
              color="teal"
            />
          </div>
        </div>

        {/* ── Performance Summary ──────────────────────────────────────────── */}
        {stats.averagePerformance > 0 && (
          <Card className="border-0 shadow-soft bg-gradient-to-r from-violet-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-100">
                  <TrendingUp className="h-6 w-6 text-violet-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-700">Average Performance</p>
                    <span className={cn(
                      'text-lg font-bold',
                      stats.averagePerformance >= 70 ? 'text-emerald-600' :
                      stats.averagePerformance >= 50 ? 'text-amber-600' :
                      'text-rose-600'
                    )}>
                      {stats.averagePerformance}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all',
                        stats.averagePerformance >= 70 ? 'bg-emerald-500' :
                        stats.averagePerformance >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      )}
                      style={{ width: `${Math.min(stats.averagePerformance, 100)}%` }}
                    />
                  </div>
                </div>
                <Badge className={cn(
                  'text-xs',
                  stats.averagePerformance >= 70 ? 'bg-emerald-100 text-emerald-700' :
                  stats.averagePerformance >= 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                )}>
                  {stats.averagePerformance >= 70 ? '🌟 Excellent' :
                   stats.averagePerformance >= 50 ? '📈 Good' :
                   '⚠️ Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Class Breakdown ─────────────────────────────────────────────── */}
        {stats.classBreakdown.length > 0 && (
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-600" />
                Class Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.classBreakdown.map((cls) => (
                  <div key={cls.name}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{cls.name}</span>
                      <span className="text-slate-500">{cls.count} pupils</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${stats.totalPupils > 0 ? (cls.count / stats.totalPupils) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Recent Activity ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-600" />
                Recent Assignments
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link href="/staff/assignments">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data?.recentAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data?.recentAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{assignment.title}</p>
                        <p className="text-xs text-slate-500">{assignment.subject}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {assignment.status || 'Draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                Recent Notes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                <Link href="/staff/notes">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data?.recentNotes.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No notes yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data?.recentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{note.title}</p>
                        <p className="text-xs text-slate-500">{note.subject || 'General'}</p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ✅ PRIMARY SCORES TAB - USING THE IMPORTED COMPONENT            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Score Management
            </h2>
            <Badge variant="secondary" className="text-xs font-normal">
              Primary School
            </Badge>
          </div>
          
          {/* ✅ Pass the staffProfile with proper ID */}
          <PrimaryScoresTab 
            key={scoresRefreshKey}
            staffProfile={staffProfile}
            onScoresSaved={handleScoresSaved}
          />
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff Dashboard • Geared Towards Excellence</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}