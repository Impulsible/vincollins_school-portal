/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import {
  Users, CheckCircle2, Clock, Loader2,
  Calendar, AlertCircle, RefreshCw,
  ArrowRight, Briefcase,
  School, ClipboardCheck, Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClassAttendance {
  name: string
  studentCount: number
  totalStudentsSaved: number
  totalPresentDays: number
  totalAbsentDays: number
  averagePercentage: number
}

interface TermInfo {
  term_code: string
  term_name: string
  session_year: string
  start_date: string
  end_date: string
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading Termly Attendance...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your classes</p>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'slate'
}) {
  const map = {
    blue:    { bg: 'bg-blue-50',    icon: 'bg-blue-500',    text: 'text-blue-700'    },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-700' },
    rose:    { bg: 'bg-rose-50',    icon: 'bg-rose-500',    text: 'text-rose-700'    },
    amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-500',   text: 'text-amber-700'   },
    indigo:  { bg: 'bg-indigo-50',  icon: 'bg-indigo-500',  text: 'text-indigo-700'  },
    slate:   { bg: 'bg-slate-100',  icon: 'bg-slate-500',   text: 'text-slate-700'   },
  }
  const c = map[color]

  return (
    <div className={cn('rounded-2xl p-4 border border-white/60 shadow-sm', c.bg)}>
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shadow-sm mb-3', c.icon)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  )
}

// ── Class Card ────────────────────────────────────────────────────────────────

function ClassCard({
  cls,
  onMark,
}: {
  cls: ClassAttendance
  onMark: (name: string) => void
}) {
  const pct = Math.round(cls.averagePercentage)
  const barColor =
    pct >= 85 ? 'bg-emerald-500' :
    pct >= 70 ? 'bg-blue-500' :
    pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'

  const isComplete  = cls.totalStudentsSaved === cls.studentCount && cls.studentCount > 0
  const isInProgress = cls.totalStudentsSaved > 0 && cls.totalStudentsSaved < cls.studentCount
  const isPending   = cls.totalStudentsSaved === 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className={cn(
        'h-1 w-full',
        isComplete   ? 'bg-emerald-500' :
        isInProgress ? 'bg-blue-500' : 'bg-slate-200'
      )} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <School className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-none">{cls.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{cls.studentCount} active pupils</p>
            </div>
          </div>

          <div className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold',
            isComplete
              ? 'bg-emerald-100 text-emerald-700'
              : isInProgress
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-500'
          )}>
            {isComplete   && <><CheckCircle2 className="h-3 w-3" /> Ready</>}
            {isInProgress && <><Clock className="h-3 w-3" /> In Progress</>}
            {isPending    && <><Clock className="h-3 w-3" /> Unsubmitted</>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-emerald-50/50 rounded-xl border border-emerald-50">
            <p className="text-sm font-bold text-emerald-700 leading-none">
              {cls.totalStudentsSaved > 0 ? Math.round(cls.totalPresentDays / cls.totalStudentsSaved) : 0}d
            </p>
            <p className="text-[9px] text-emerald-600 font-medium mt-1">Avg Present</p>
          </div>
          <div className="text-center p-2 bg-rose-50/50 rounded-xl border border-rose-50">
            <p className="text-sm font-bold text-rose-600 leading-none">
              {cls.totalStudentsSaved > 0 ? Math.round(cls.totalAbsentDays / cls.totalStudentsSaved) : 0}d
            </p>
            <p className="text-[9px] text-rose-500 font-medium mt-1">Avg Absent</p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-bold text-slate-600 leading-none">
              {cls.studentCount - cls.totalStudentsSaved}
            </p>
            <p className="text-[9px] text-slate-400 font-medium mt-1">Unmarked</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-medium">Record Entry rate</span>
            <span className="text-xs font-bold text-slate-700">
              {cls.studentCount > 0 ? Math.round((cls.totalStudentsSaved / cls.studentCount) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={cn('h-1.5 rounded-full transition-all', barColor)}
              style={{ width: `${cls.studentCount > 0 ? (cls.totalStudentsSaved / cls.studentCount) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px] text-slate-400">
              {cls.totalStudentsSaved} of {cls.studentCount} students logged
            </p>
            {cls.totalStudentsSaved > 0 && (
              <p className="text-[10px] font-bold text-indigo-600">{pct}% Class Attendance</p>
            )}
          </div>
        </div>

        <button
          onClick={() => onMark(cls.name)}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
            isPending
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200'
              : 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm'
          )}
        >
          {isPending ? (
            <><ClipboardCheck className="h-4 w-4" /> Begin Term Summary</>
          ) : (
            <><RefreshCw className="h-4 w-4" /> Update Term Summary</>
          )}
          <ArrowRight className="h-3.5 w-3.5 ml-auto" />
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StaffAttendancePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [classes, setClasses] = useState<ClassAttendance[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [termInfo, setTermInfo] = useState<TermInfo | null>(null)
  const [teacherClasses, setTeacherClasses] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRecordsLoaded: 0,
    totalUnmarked: 0,
    overallAttendanceRate: 0,
  })

  // ─── Fetch Teacher's Assigned Classes ───────────────────────────────────────

  const fetchTeacherClasses = useCallback(async () => {
    if (!user?.id) return []

    try {
      const { data: teacherClassData, error: teacherError } = await supabase
        .from('teacher_classes')
        .select('class_name')
        .eq('teacher_id', user.id)

      if (teacherError) {
        console.error('Error fetching teacher classes:', teacherError.message || teacherError)
        return []
      }

      const classNames = teacherClassData?.map((tc: any) => tc.class_name) || []
      setTeacherClasses(classNames)
      return classNames
    } catch (error) {
      console.error('Error fetching teacher assigned classes:', error)
      return []
    }
  }, [user?.id])

  // ─── Fetch Term Info ────────────────────────────────────────────────────────

  const fetchTermInfo = useCallback(async () => {
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('school_settings')
        .select('current_term, current_session')
        .maybeSingle()

      if (settingsError || !settings) {
        return null
      }

      const { data: termData, error: termError } = await supabase
        .from('terms')
        .select('*')
        .eq('term_code', settings.current_term)
        .eq('session_year', settings.current_session)
        .maybeSingle()

      if (termError || !termData) {
        return null
      }

      setTermInfo(termData as TermInfo)
      return termData as TermInfo
    } catch (error) {
      console.error('Error fetching term info:', error)
      return null
    }
  }, [])

  // ─── Fetch Attendance Data ──────────────────────────────────────────────────

  const fetchAttendanceData = useCallback(async (
    classNames: string[],
    term: TermInfo | null
  ) => {
    if (classNames.length === 0) {
      setClasses([])
      return
    }

    try {
      // Fetch students in these classes
      const { data: students, error: studentError } = await supabase
        .from('profiles')
        .select('id, display_name, class')
        .in('role', ['student', 'pupil'])
        .eq('is_active', true)
        .in('class', classNames)

      if (studentError) {
        console.error('Error fetching students:', studentError.message || studentError)
        return
      }

      // Group students by class
      const classStudentsMap: Record<string, any[]> = {}
      classNames.forEach(cn => { classStudentsMap[cn] = [] })
      students?.forEach((s: any) => {
        if (s.class && classStudentsMap[s.class]) {
          classStudentsMap[s.class].push(s)
        }
      })

      // Fetch aggregate term records
      const studentIds = students?.map(s => s.id) || []
      let termRecords: any[] = []

      if (studentIds.length > 0 && term?.term_code) {
        const { data: fetchedLogs, error: logError } = await supabase
          .from('term_attendance')
          .select('student_id, days_present, days_absent')
          .in('student_id', studentIds)
          .eq('term_code', term.term_code)
          .eq('session_year', term.session_year)

        if (logError) {
          console.error('Error fetching termly logs:', logError.message || logError)
        } else {
          termRecords = fetchedLogs || []
        }
      }

      const termMap: Record<string, any> = {}
      termRecords.forEach(r => {
        termMap[r.student_id] = r
      })

      // Map metrics per class
      const classData: ClassAttendance[] = classNames.map((className) => {
        const classStudents = classStudentsMap[className] || []
        const studentCount = classStudents.length

        let totalStudentsSaved = 0
        let totalPresentDays = 0
        let totalAbsentDays = 0

        classStudents.forEach(stu => {
          const rec = termMap[stu.id]
          if (rec) {
            totalStudentsSaved++
            totalPresentDays += Number(rec.days_present || 0)
            totalAbsentDays += Number(rec.days_absent || 0)
          }
        })

        const totalClassDays = totalPresentDays + totalAbsentDays
        const averagePercentage = totalClassDays > 0 ? (totalPresentDays / totalClassDays) * 100 : 0

        return {
          name: className,
          studentCount,
          totalStudentsSaved,
          totalPresentDays,
          totalAbsentDays,
          averagePercentage,
        }
      })

      setClasses(classData)

      // Overall aggregates calculation
      const totalStudents = classData.reduce((s, c) => s + c.studentCount, 0)
      const totalRecordsLoaded = classData.reduce((s, c) => s + c.totalStudentsSaved, 0)
      const overallPresent = classData.reduce((s, c) => s + c.totalPresentDays, 0)
      const overallAbsent = classData.reduce((s, c) => s + c.totalAbsentDays, 0)
      
      const overallSumDays = overallPresent + overallAbsent

      setStats({
        totalStudents,
        totalRecordsLoaded,
        totalUnmarked: totalStudents - totalRecordsLoaded,
        overallAttendanceRate: overallSumDays > 0 ? (overallPresent / overallSumDays) * 100 : 0,
      })

    } catch (error) {
      console.error('Error processing attendance records:', error)
      toast.error('Failed to parse aggregate attendance datasets')
    }
  }, [])

  // ─── Fetch All Data ─────────────────────────────────────────────────────────

  const fetchAllData = useCallback(async (showToast = false) => {
    if (!user?.id) return

    if (showToast) setRefreshing(true)
    else setLoading(true)

    try {
      const classNames = await fetchTeacherClasses()

      if (classNames.length === 0) {
        setClasses([])
        setStats({
          totalStudents: 0,
          totalRecordsLoaded: 0,
          totalUnmarked: 0,
          overallAttendanceRate: 0,
        })
        if (showToast) toast.warning('No classes assigned to you')
        return
      }

      const term = await fetchTermInfo()
      await fetchAttendanceData(classNames, term)

      if (showToast) toast.success('Term statistics updated')

    } catch (error) {
      console.error('Error fetching records:', error)
      if (showToast) toast.error('Failed to reload current dashboard state')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, fetchTeacherClasses, fetchTermInfo, fetchAttendanceData])

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchAllData()
    }
  }, [authLoading, user?.id, fetchAllData])

  // ─── Constants & Derived State ──────────────────────────────────────────────

  const pct = Math.round(stats.overallAttendanceRate)
  const hasNoClasses = classes.length === 0 && !loading

  // ─── Auth Guard & Layout Guards ─────────────────────────────────────────────

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  if (loading) {
    return <LoadingScreen />
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ── Sticky Top Bar ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-none">Termly Attendance Logs</p>
                {termInfo && (
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                    {termInfo.term_name} · {termInfo.session_year}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-100 bg-blue-50/50 text-blue-700 text-xs font-semibold">
                <Calendar className="h-3.5 w-3.5" />
                <span>Term Active Mode</span>
              </div>

              <button
                onClick={() => fetchAllData(true)}
                disabled={refreshing}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition-colors shadow-sm"
              >
                <RefreshCw className={cn('h-3.5 w-3.5 text-slate-500', refreshing && 'animate-spin')} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Summary Hero Banner ────────────────────────────────────────── */}
        {classes.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-5 shadow-lg">
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-indigo-400/10 blur-2xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1 bg-white/10 text-white rounded-full px-2 py-0.5 text-[10px] font-bold w-fit mb-2">
                  <Sparkles className="h-3 w-3 text-amber-300" /> TERMLY AGGREGATION SUITE
                </div>
                <h2 className="text-white text-xl font-bold mb-1">
                  Classroom Attendance Summaries
                </h2>
                <p className="text-blue-200 text-sm">
                  {classes.length} class{classes.length !== 1 ? 'es' : ''} assigned ·{' '}
                  {stats.totalStudents} total student files
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[180px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-200">Overall Term Rate</span>
                  <span className="text-base font-bold text-white">{pct}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                  <div
                    className="h-1.5 rounded-full bg-white transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-blue-300">
                  {stats.totalRecordsLoaded} of {stats.totalStudents} files updated
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Overview Metrics Cards ─────────────────────────────────────── */}
        {classes.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Pupils Assigned" value={stats.totalStudents} icon={Users} color="blue" />
            <StatCard label="Summaries Logged" value={stats.totalRecordsLoaded} icon={CheckCircle2} color="emerald" />
            <StatCard label="Pending Submission" value={stats.totalUnmarked} icon={Clock} color="amber" />
            <StatCard label="Average Term Rate" value={`${pct}%`} icon={Sparkles} color="indigo" />
          </div>
        )}

        {/* ── No Classes Assigned State ───────────────────────────────────── */}
        {hasNoClasses && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Classes Assigned</h3>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              You haven't been assigned to any classrooms yet. Contact your school administrator to get set up.
            </p>
            <button
              onClick={() => router.push('/staff')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Briefcase className="h-4 w-4" /> Go to Dashboard
            </button>
          </div>
        )}

        {/* ── Classroom Summaries Grid ───────────────────────────────────── */}
        {classes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <ClassCard
                key={cls.name}
                cls={cls}
                onMark={(name) => router.push(`/staff/attendance/${encodeURIComponent(name)}`)}
              />
            ))}
          </div>
        )}

        {/* ── Footer Stats Banner ────────────────────────────────────────── */}
        {classes.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 bg-white rounded-xl border border-slate-100 shadow-sm text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{classes.filter(c => c.totalStudentsSaved === c.studentCount).length} Fully Saved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>{classes.filter(c => c.totalStudentsSaved > 0 && c.totalStudentsSaved < c.studentCount).length} In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>{classes.filter(c => c.totalStudentsSaved === 0).length} Unmarked</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>
                Overall: {stats.totalRecordsLoaded} of {stats.totalStudents} pupils logged this term
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 pt-4 pb-6 border-t border-slate-200/50">
        <p>Vincollins Schools Staff • Attendance Summary Suite</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>

      {refreshing && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-xl text-xs font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
          Refreshing term statistics...
        </div>
      )}
    </div>
  )
}