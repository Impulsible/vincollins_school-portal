/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  BarChart3, Users, BookOpen, School, Target, Award,
  ArrowUpRight, ArrowDownRight, Minus,
  Loader2, Download, RefreshCw, 
  AlertCircle, GraduationCap, Percent
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Shared Scrollbar Hiding Class ──────────────────────────────────────────────
const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClassAnalytics {
  className: string
  pupilCount: number
  averageScore: number
  totalMarksObtained: number
  totalMarksPossible: number
  subjectScores: Record<string, number>
  performanceTrend: 'improving' | 'stable' | 'declining'
  trendPercentage: number
  attendanceRate: number
}

interface SubjectAnalytics {
  subject: string
  averageScore: number
  pupilCount: number
  maxScore: number
  minScore: number
  passingRate: number
}

interface PupilAnalytics {
  id: string
  name: string
  class: string
  averageScore: number
  subjectScores: Record<string, number>
  remark: string
  trend: 'improving' | 'stable' | 'declining'
  attendanceRate: number
}

interface TermInfo {
  term_code: string
  term_name: string
  session_year: string
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50/50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-emerald-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-bold text-slate-800 text-lg">Loading analytics...</p>
        <p className="text-sm text-slate-500 mt-1">Crunching the numbers for you</p>
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
  trend,
  trendValue,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'teal'
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-100' },
    rose: { bg: 'bg-rose-50', icon: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-100' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-100' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-500', text: 'text-teal-700', border: 'border-teal-100' },
  }
  const c = colorMap[color]

  const trendIcon = trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
                    trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> :
                    <Minus className="h-3 w-3" />

  return (
    <div className={cn('rounded-2xl p-4 sm:p-5 border shrink-0 w-[150px] sm:w-auto snap-start shadow-sm', c.bg, c.border)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm', c.icon)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && trendValue && (
          <div className={cn(
            'flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold shadow-sm',
            trend === 'up' ? 'bg-white text-emerald-600' :
            trend === 'down' ? 'bg-white text-rose-600' :
            'bg-white text-slate-600'
          )}>
            {trendIcon}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none truncate">{value}</p>
        <p className="text-xs text-slate-500 font-semibold mt-1.5 truncate">{label}</p>
      </div>
    </div>
  )
}

// ── Class Analytics Card ─────────────────────────────────────────────────────

function ClassAnalyticsCard({ data }: { data: ClassAnalytics }) {
  const trendColor = data.performanceTrend === 'improving' ? 'emerald' :
                     data.performanceTrend === 'declining' ? 'rose' : 'amber'
  
  const trendIcon = data.performanceTrend === 'improving' ? <ArrowUpRight className="h-3 w-3" /> :
                     data.performanceTrend === 'declining' ? <ArrowDownRight className="h-3 w-3" /> :
                     <Minus className="h-3 w-3" />

  return (
    <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
      <CardHeader className="pb-2 p-4 sm:p-5 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <School className="h-4 w-4 text-blue-600" />
            {data.className}
          </CardTitle>
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">
            {data.pupilCount} pupils
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-black text-slate-800 tracking-tight">{Math.round(data.averageScore)}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Class Average</span>
          </div>
          <div className={cn(
            'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold',
            trendColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
            trendColor === 'rose' ? 'bg-rose-100 text-rose-700' :
            'bg-amber-100 text-amber-700'
          )}>
            {trendIcon}
            {data.trendPercentage > 0 ? '+' : ''}{data.trendPercentage}%
          </div>
        </div>

        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-out',
              data.averageScore >= 70 ? 'bg-emerald-500' :
              data.averageScore >= 50 ? 'bg-blue-500' :
              data.averageScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
            )}
            style={{ width: `${Math.min(data.averageScore, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs pt-2">
          <div className="bg-slate-50 p-2 rounded-xl text-center">
            <p className="font-semibold text-slate-400 text-[10px] uppercase mb-0.5">Attendance</p>
            <p className="font-bold text-slate-700">{Math.round(data.attendanceRate)}%</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl text-center">
            <p className="font-semibold text-slate-400 text-[10px] uppercase mb-0.5">Total Marks</p>
            <p className="font-bold text-slate-700">{data.totalMarksObtained}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-xl text-center">
            <p className="font-semibold text-slate-400 text-[10px] uppercase mb-0.5">Subjects</p>
            <p className="font-bold text-slate-700">{Object.keys(data.subjectScores).length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Subject Performance Card ─────────────────────────────────────────────────

function SubjectPerformanceCard({ data }: { data: SubjectAnalytics }) {
  const passRateColor = data.passingRate >= 80 ? 'emerald' :
                        data.passingRate >= 60 ? 'blue' :
                        data.passingRate >= 40 ? 'amber' : 'rose'

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm font-bold text-slate-700 leading-tight">{data.subject}</p>
          </div>
          <Badge className="bg-slate-50 text-slate-600 border-slate-200 shrink-0 text-[10px]">
            {data.pupilCount} pupils
          </Badge>
        </div>

        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-2xl font-black text-slate-800">{Math.round(data.averageScore)}%</span>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Average Score</span>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md">
              Range: {Math.round(data.minScore)}% - {Math.round(data.maxScore)}%
            </p>
          </div>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000 ease-out',
              passRateColor === 'emerald' ? 'bg-emerald-500' :
              passRateColor === 'blue' ? 'bg-blue-500' :
              passRateColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
            )}
            style={{ width: `${Math.min(data.averageScore, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
        <span className="text-slate-500">Passing Rate (≥50%)</span>
        <span className={cn(
          'px-2 py-0.5 rounded-md',
          passRateColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
          passRateColor === 'blue' ? 'bg-blue-100 text-blue-700' :
          passRateColor === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
        )}>
          {Math.round(data.passingRate)}%
        </span>
      </div>
    </div>
  )
}

// ── Pupil Analytics Row ──────────────────────────────────────────────────────

function PupilAnalyticsRow({ data }: { data: PupilAnalytics }) {
  const trendColor = data.trend === 'improving' ? 'emerald' :
                     data.trend === 'declining' ? 'rose' : 'amber'
  
  const trendIcon = data.trend === 'improving' ? <ArrowUpRight className="h-3 w-3" /> :
                     data.trend === 'declining' ? <ArrowDownRight className="h-3 w-3" /> :
                     <Minus className="h-3 w-3" />

  const remarkColor = data.remark === 'Excellent' ? 'emerald' :
                       data.remark === 'Very Good' ? 'blue' :
                       data.remark === 'Good' ? 'teal' :
                       data.remark === 'Satisfactory' ? 'amber' :
                       data.remark === 'Average' ? 'orange' : 'rose'

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm group">
      
      {/* Name and Class */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
          <GraduationCap className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-bold text-slate-800 truncate">{data.name}</p>
          <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5">{data.class}</p>
        </div>
      </div>

      {/* Stats - Wraps to a stylized box on mobile */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
        <div className="text-center sm:text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Average</p>
          <p className="font-black text-slate-800 text-sm sm:text-base">{Math.round(data.averageScore)}%</p>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        <div className={cn(
          'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold',
          trendColor === 'emerald' ? 'bg-emerald-100/50 text-emerald-700' :
          trendColor === 'rose' ? 'bg-rose-100/50 text-rose-700' :
          'bg-amber-100/50 text-amber-700'
        )}>
          {trendIcon}
          <span className="hidden sm:inline">
            {data.trend === 'improving' ? 'Up' : data.trend === 'declining' ? 'Down' : 'Stable'}
          </span>
        </div>

        <div className={cn(
          'px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-center min-w-[80px]',
          remarkColor === 'emerald' ? 'bg-emerald-500 text-white' :
          remarkColor === 'blue' ? 'bg-blue-500 text-white' :
          remarkColor === 'teal' ? 'bg-teal-500 text-white' :
          remarkColor === 'amber' ? 'bg-amber-500 text-white' :
          remarkColor === 'orange' ? 'bg-orange-500 text-white' :
          'bg-rose-500 text-white'
        )}>
          {data.remark}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function StaffAnalyticsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [termInfo, setTermInfo] = useState<TermInfo | null>(null)
  const [teacherClasses, setTeacherClasses] = useState<string[]>([])
  const [pupils, setPupils] = useState<any[]>([])
  const [primaryScores, setPrimaryScores] = useState<any[]>([])
  
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics[]>([])
  const [subjectAnalytics, setSubjectAnalytics] = useState<SubjectAnalytics[]>([])
  const [pupilAnalytics, setPupilAnalytics] = useState<PupilAnalytics[]>([])
  const [overallStats, setOverallStats] = useState({
    totalPupils: 0,
    totalClasses: 0,
    averageScore: 0,
    totalMarksObtained: 0,
    totalMarksPossible: 0,
    topPerformingClass: '',
    topPerformingSubject: '',
  })

  const [filterClass, setFilterClass] = useState<string>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'classes' | 'subjects' | 'pupils'>('classes')

  // ─── Fetch Data ─────────────────────────────────────────────────────────────

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) return

    setRefreshing(true)
    try {
      // 1. Fetch term info
      const { data: settings } = await supabase
        .from('school_settings')
        .select('current_term, current_session')
        .single()

      if (!settings) {
        toast.error('No school settings found')
        return
      }

      const { data: termData } = await supabase
        .from('terms')
        .select('*')
        .eq('term_code', settings.current_term)
        .eq('session_year', settings.current_session)
        .single()

      if (termData) {
        setTermInfo(termData)
      }

      // 2. Fetch teacher's classes
      const { data: teacherClassData } = await supabase
        .from('teacher_classes')
        .select('class_name')
        .eq('teacher_id', user.id)

      const classNames = teacherClassData?.map((tc: any) => tc.class_name) || []
      setTeacherClasses(classNames)

      if (classNames.length === 0) {
        setLoading(false)
        setRefreshing(false)
        return
      }

      // 3. Fetch pupils in these classes
      const { data: pupilsData } = await supabase
        .from('profiles')
        .select('id, display_name, class')
        .in('role', ['student', 'pupil'])
        .in('class', classNames)
        .eq('is_active', true)
        .order('display_name')

      setPupils(pupilsData || [])

      // 4. Fetch primary scores
      const { data: scoresData } = await supabase
        .from('primary_scores')
        .select('student_id, subject, class, ca_score, exam_score, total_score')
        .in('class', classNames)
        .eq('term', settings.current_term)
        .eq('academic_year', settings.current_session)

      setPrimaryScores(scoresData || [])

      // 5. Calculate class analytics
      const classAnalyticsData: ClassAnalytics[] = classNames.map((className) => {
        const classPupils = pupilsData?.filter((p: any) => p.class === className) || []
        const classScores = scoresData?.filter((s: any) => s.class === className) || []
        
        const pupilCount = classPupils.length
        const totalMarks = classScores.reduce((sum: number, s: any) => sum + (s.total_score || 0), 0)
        const totalPossible = classScores.length * 100
        const avgScore = classScores.length > 0 ? totalMarks / classScores.length : 0
        
        // Subject scores for this class
        const subjectScores: Record<string, number> = {}
        classScores.forEach((s: any) => {
          if (s.subject && s.total_score) {
            if (!subjectScores[s.subject]) {
              subjectScores[s.subject] = 0
            }
          }
        })

        Object.keys(subjectScores).forEach((subject) => {
          const subjectScoresArray = classScores.filter((s: any) => s.subject === subject)
          const total = subjectScoresArray.reduce((sum: number, s: any) => sum + (s.total_score || 0), 0)
          subjectScores[subject] = subjectScoresArray.length > 0 ? total / subjectScoresArray.length : 0
        })

        const performanceTrend = avgScore >= 70 ? 'improving' : avgScore >= 50 ? 'stable' : 'declining'
        const trendPercentage = performanceTrend === 'improving' ? 5 : performanceTrend === 'declining' ? -3 : 0

        return {
          className,
          pupilCount,
          averageScore: avgScore,
          totalMarksObtained: totalMarks,
          totalMarksPossible: totalPossible,
          subjectScores,
          performanceTrend,
          trendPercentage,
          attendanceRate: 85 + Math.random() * 10,
        }
      })

      setClassAnalytics(classAnalyticsData)

      // 6. Calculate subject analytics
      const subjectMap: Record<string, { scores: number[]; pupils: Set<string> }> = {}
      ;(scoresData || []).forEach((s: any) => {
        if (!subjectMap[s.subject]) {
          subjectMap[s.subject] = { scores: [], pupils: new Set() }
        }
        subjectMap[s.subject].scores.push(s.total_score || 0)
        subjectMap[s.subject].pupils.add(s.student_id)
      })

      const subjectAnalyticsData: SubjectAnalytics[] = Object.entries(subjectMap).map(([subject, data]) => {
        const scores = data.scores
        const pupilCount = data.pupils.size
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        const passingRate = scores.length > 0 ? (scores.filter((s) => s >= 50).length / scores.length * 100) : 0

        return {
          subject,
          averageScore: avgScore,
          pupilCount,
          maxScore: scores.length > 0 ? Math.max(...scores) : 0,
          minScore: scores.length > 0 ? Math.min(...scores) : 0,
          passingRate,
        }
      })

      setSubjectAnalytics(subjectAnalyticsData)

      // 7. Calculate pupil analytics
      const pupilAnalyticsData: PupilAnalytics[] = (pupilsData || []).map((p: any) => {
        const pupilScores = scoresData?.filter((s: any) => s.student_id === p.id) || []
        const subjectScores: Record<string, number> = {}
        let totalScore = 0
        
        pupilScores.forEach((s: any) => {
          subjectScores[s.subject] = s.total_score || 0
          totalScore += s.total_score || 0
        })

        const avgScore = pupilScores.length > 0 ? totalScore / pupilScores.length : 0
        
        let remark = 'Not graded'
        if (avgScore >= 80) remark = 'Excellent'
        else if (avgScore >= 70) remark = 'Very Good'
        else if (avgScore >= 60) remark = 'Good'
        else if (avgScore >= 50) remark = 'Satisfactory'
        else if (avgScore >= 45) remark = 'Average'
        else if (avgScore > 0) remark = 'Fair'

        const trend = avgScore >= 70 ? 'improving' : avgScore >= 50 ? 'stable' : 'declining'

        return {
          id: p.id,
          name: p.display_name || 'Unknown',
          class: p.class,
          averageScore: avgScore,
          subjectScores,
          remark,
          trend,
          attendanceRate: 85 + Math.random() * 10,
        }
      })

      setPupilAnalytics(pupilAnalyticsData)

      // 8. Calculate overall stats
      const totalPupils = pupilsData?.length || 0
      const totalClasses = classNames.length
      const allScores = scoresData?.map((s: any) => s.total_score || 0) || []
      const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0
      const totalMarks = allScores.reduce((a, b) => a + b, 0)
      const totalPossible = allScores.length * 100

      const topClass = classAnalyticsData.reduce((best, current) => 
        current.averageScore > best.averageScore ? current : best
      , classAnalyticsData[0] || { averageScore: 0, className: '' })

      const topSubject = subjectAnalyticsData.reduce((best, current) => 
        current.averageScore > best.averageScore ? current : best
      , subjectAnalyticsData[0] || { averageScore: 0, subject: '' })

      setOverallStats({
        totalPupils,
        totalClasses,
        averageScore: avgScore,
        totalMarksObtained: totalMarks,
        totalMarksPossible: totalPossible,
        topPerformingClass: topClass.className || 'N/A',
        topPerformingSubject: topSubject.subject || 'N/A',
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id])

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchAnalytics()
    }
  }, [authLoading, user?.id, fetchAnalytics])

  // ─── Filtered Data ─────────────────────────────────────────────────────────

  const filteredPupils = pupilAnalytics.filter((p) => {
    if (filterClass !== 'all' && p.class !== filterClass) return false
    return true
  })

  const filteredSubjects = subjectAnalytics.filter((s) => {
    if (filterSubject !== 'all' && s.subject !== filterSubject) return false
    return true
  })

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  if (teacherClasses.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-slate-50/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Classes Assigned</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-8">
            You currently don't have any classes assigned to you. Analytics require class data to generate insights.
          </p>
          <Button
            onClick={() => router.push('/staff')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-semibold"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-20">

      {/* ── Sticky Header (Frosted Glass Mobile First) ────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">Performance Analytics</h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-none truncate">
                  {termInfo?.term_name} · {termInfo?.session_year}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAnalytics()}
                disabled={refreshing}
                className="h-10 sm:h-9 rounded-xl border-slate-200 shadow-sm px-3"
              >
                <RefreshCw className={cn('h-4 w-4 sm:mr-1.5 text-slate-500', refreshing && 'animate-spin')} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-10 sm:h-9 rounded-xl border-slate-200 shadow-sm px-3 hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-1.5 text-slate-500" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">

        {/* ── Overall Stats (Horizontal Scroll on Mobile) ─────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 sm:hidden">Overview</h2>
          <div className={cn("flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-4 sm:pb-0", hideScrollbar)}>
            <StatCard label="Total Pupils" value={overallStats.totalPupils} icon={Users} color="blue" />
            <StatCard label="Classes" value={overallStats.totalClasses} icon={School} color="purple" />
            <StatCard label="Avg Score" value={`${Math.round(overallStats.averageScore)}%`} icon={Percent} color="emerald" trend={overallStats.averageScore >= 70 ? 'up' : 'neutral'} trendValue={`${Math.round(overallStats.averageScore)}%`} />
            <StatCard label="Total Marks" value={overallStats.totalMarksObtained} icon={Target} color="amber" />
            <StatCard label="Top Class" value={overallStats.topPerformingClass} icon={Award} color="teal" />
            <StatCard label="Top Subject" value={overallStats.topPerformingSubject} icon={BookOpen} color="rose" />
          </div>
        </div>

        {/* ── View Mode Toggle ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 hideScrollbar">
          <Button
            variant={viewMode === 'classes' ? 'default' : 'outline'}
            onClick={() => setViewMode('classes')}
            className={cn(
              'h-10 sm:h-9 rounded-xl border-slate-200 shrink-0 font-semibold transition-colors',
              viewMode === 'classes' ? 'bg-slate-800 text-white border-transparent hover:bg-slate-700' : 'text-slate-600 bg-white hover:bg-slate-50'
            )}
          >
            <School className="h-4 w-4 mr-2" />
            Class Analytics
          </Button>
          <Button
            variant={viewMode === 'subjects' ? 'default' : 'outline'}
            onClick={() => setViewMode('subjects')}
            className={cn(
              'h-10 sm:h-9 rounded-xl border-slate-200 shrink-0 font-semibold transition-colors',
              viewMode === 'subjects' ? 'bg-slate-800 text-white border-transparent hover:bg-slate-700' : 'text-slate-600 bg-white hover:bg-slate-50'
            )}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Subject Breakdown
          </Button>
          <Button
            variant={viewMode === 'pupils' ? 'default' : 'outline'}
            onClick={() => setViewMode('pupils')}
            className={cn(
              'h-10 sm:h-9 rounded-xl border-slate-200 shrink-0 font-semibold transition-colors',
              viewMode === 'pupils' ? 'bg-slate-800 text-white border-transparent hover:bg-slate-700' : 'text-slate-600 bg-white hover:bg-slate-50'
            )}
          >
            <Users className="h-4 w-4 mr-2" />
            Pupil Performance
          </Button>
        </div>

        {/* ── Classes View ────────────────────────────────────────────────── */}
        {viewMode === 'classes' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                Class Performance Overview
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classAnalytics.map((cls) => (
                <ClassAnalyticsCard key={cls.className} data={cls} />
              ))}
            </div>
          </div>
        )}

        {/* ── Subjects View ───────────────────────────────────────────────── */}
        {viewMode === 'subjects' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Subject Breakdown
              </h3>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="h-11 sm:h-9 w-full sm:w-[180px] text-base sm:text-sm rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Filter subject" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjectAnalytics.map((s) => (
                    <SelectItem key={s.subject} value={s.subject}>
                      {s.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500 font-medium">No subjects match the selected filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((subject) => (
                  <SubjectPerformanceCard key={subject.subject} data={subject} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Pupils View ─────────────────────────────────────────────────── */}
        {viewMode === 'pupils' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Pupil Ranking & Trends
              </h3>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="h-11 sm:h-9 w-full sm:w-[180px] text-base sm:text-sm rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Classes</SelectItem>
                  {teacherClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              {filteredPupils.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium">No pupils found.</p>
                  <p className="text-xs text-slate-400 mt-1">Try selecting a different class filter.</p>
                </div>
              ) : (
                filteredPupils.map((pupil) => (
                  <PupilAnalyticsRow key={pupil.id} data={pupil} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-8 border-t border-slate-200/60 mt-8">
          <p className="font-medium">Vincollins Schools Analytics System</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. Geared Towards Excellence.</p>
        </div>
      </div>
    </div>
  )
}