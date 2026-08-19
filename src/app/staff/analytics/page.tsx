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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  BarChart3, TrendingUp, TrendingDown, Users,
  BookOpen, School, Target, Award,
  ArrowUpRight, ArrowDownRight, Minus,
  Loader2, Calendar, Filter,
  Download, RefreshCw, Eye,
  PieChart, Activity, Star,
  AlertCircle, CheckCircle2,
  GraduationCap, FileText, Percent,
  ChevronDown, ChevronUp, Clock
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading analytics...</p>
        <p className="text-sm text-slate-400 mt-1">Analyzing your data</p>
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
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-700' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-700' },
    rose: { bg: 'bg-rose-50', icon: 'bg-rose-500', text: 'text-rose-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-700' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-500', text: 'text-teal-700' },
  }
  const c = colorMap[color]

  const trendIcon = trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
                    trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> :
                    <Minus className="h-3 w-3" />

  return (
    <div className={cn('rounded-2xl p-5 border border-slate-100 shadow-sm', c.bg)}>
      <div className="flex items-center justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm', c.icon)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && trendValue && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold',
            trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
            trend === 'down' ? 'bg-rose-100 text-rose-700' :
            'bg-slate-100 text-slate-600'
          )}>
            {trendIcon}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 mt-3 leading-none">{value}</p>
      <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
    </div>
  )
}

// ── Class Analytics Card ─────────────────────────────────────────────────────

function ClassAnalyticsCard({ data }: { data: ClassAnalytics }) {
  const trendColor = data.performanceTrend === 'improving' ? 'emerald' :
                     data.performanceTrend === 'declining' ? 'rose' : 'amber'
  
  const trendIcon = data.performanceTrend === 'improving' ? <ArrowUpRight className="h-4 w-4" /> :
                     data.performanceTrend === 'declining' ? <ArrowDownRight className="h-4 w-4" /> :
                     <Minus className="h-4 w-4" />

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <School className="h-4 w-4 text-blue-600" />
            {data.className}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {data.pupilCount} pupils
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-800">{Math.round(data.averageScore)}%</span>
            <span className="text-xs text-slate-400">average</span>
          </div>
          <div className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
            trendColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
            trendColor === 'rose' ? 'bg-rose-100 text-rose-700' :
            'bg-amber-100 text-amber-700'
          )}>
            {trendIcon}
            {data.trendPercentage > 0 ? '+' : ''}{data.trendPercentage}%
          </div>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              data.averageScore >= 70 ? 'bg-emerald-500' :
              data.averageScore >= 50 ? 'bg-blue-500' :
              data.averageScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
            )}
            style={{ width: `${Math.min(data.averageScore, 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 pt-1">
          <div className="text-center">
            <p className="font-medium text-slate-600">Attendance</p>
            <p className="font-bold text-emerald-600">{Math.round(data.attendanceRate)}%</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-600">Marks</p>
            <p className="font-bold text-slate-600">{data.totalMarksObtained}</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-600">Subjects</p>
            <p className="font-bold text-slate-600">{Object.keys(data.subjectScores).length}</p>
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
    <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">{data.subject}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {data.pupilCount} pupils
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-slate-800">{Math.round(data.averageScore)}%</span>
        <div className="text-right">
          <p className="text-xs text-slate-500">Range: {Math.round(data.minScore)}% - {Math.round(data.maxScore)}%</p>
        </div>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 mb-1.5">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            passRateColor === 'emerald' ? 'bg-emerald-500' :
            passRateColor === 'blue' ? 'bg-blue-500' :
            passRateColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
          )}
          style={{ width: `${Math.min(data.averageScore, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Passing rate</span>
        <span className={cn(
          'font-semibold',
          passRateColor === 'emerald' ? 'text-emerald-600' :
          passRateColor === 'blue' ? 'text-blue-600' :
          passRateColor === 'amber' ? 'text-amber-600' : 'text-rose-600'
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
  
  const trendIcon = data.trend === 'improving' ? <ArrowUpRight className="h-3.5 w-3.5" /> :
                     data.trend === 'declining' ? <ArrowDownRight className="h-3.5 w-3.5" /> :
                     <Minus className="h-3.5 w-3.5" />

  const remarkColor = data.remark === 'Excellent' ? 'emerald' :
                       data.remark === 'Very Good' ? 'blue' :
                       data.remark === 'Good' ? 'teal' :
                       data.remark === 'Satisfactory' ? 'amber' :
                       data.remark === 'Average' ? 'orange' : 'rose'

  return (
    <div className="p-3 rounded-xl bg-white border border-slate-100 hover:shadow-sm transition-all flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[150px]">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-700">{data.name}</p>
        </div>
        <p className="text-xs text-slate-400">{data.class}</p>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="text-center">
          <p className="text-xs text-slate-500">Avg</p>
          <p className="font-bold text-slate-800">{Math.round(data.averageScore)}%</p>
        </div>

        <div className={cn(
          'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
          trendColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
          trendColor === 'rose' ? 'bg-rose-100 text-rose-700' :
          'bg-amber-100 text-amber-700'
        )}>
          {trendIcon}
          {data.trend === 'improving' ? '↑' : data.trend === 'declining' ? '↓' : '–'}
        </div>

        <div className={cn(
          'px-2 py-0.5 rounded-full text-[10px] font-semibold',
          remarkColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
          remarkColor === 'blue' ? 'bg-blue-100 text-blue-700' :
          remarkColor === 'teal' ? 'bg-teal-100 text-teal-700' :
          remarkColor === 'amber' ? 'bg-amber-100 text-amber-700' :
          remarkColor === 'orange' ? 'bg-orange-100 text-orange-700' :
          'bg-rose-100 text-rose-700'
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
            // We'll calculate average per subject later
          }
        })

        // Calculate per-subject averages
        Object.keys(subjectScores).forEach((subject) => {
          const subjectScoresArray = classScores.filter((s: any) => s.subject === subject)
          const total = subjectScoresArray.reduce((sum: number, s: any) => sum + (s.total_score || 0), 0)
          subjectScores[subject] = subjectScoresArray.length > 0 ? total / subjectScoresArray.length : 0
        })

        // Trend (simulated - could be calculated from previous term)
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
          attendanceRate: 85 + Math.random() * 10, // Placeholder - would come from attendance records
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
        const passingRate = scores.filter((s) => s >= 50).length / scores.length * 100

        return {
          subject,
          averageScore: avgScore,
          pupilCount,
          maxScore: Math.max(...scores),
          minScore: Math.min(...scores),
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
          attendanceRate: 85 + Math.random() * 10, // Placeholder
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No Classes Assigned</h3>
          <p className="text-sm text-slate-400">
            You haven't been assigned to any classes yet. Contact your admin to get set up.
          </p>
          <Button
            onClick={() => router.push('/staff')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 leading-none">Analytics</h1>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                  {termInfo?.term_name} · {termInfo?.session_year}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAnalytics()}
                disabled={refreshing}
                className="h-8 text-xs gap-1"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Overall Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total Pupils"
            value={overallStats.totalPupils}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Total Classes"
            value={overallStats.totalClasses}
            icon={School}
            color="purple"
          />
          <StatCard
            label="Average Score"
            value={`${Math.round(overallStats.averageScore)}%`}
            icon={Percent}
            color="emerald"
            trend={overallStats.averageScore >= 70 ? 'up' : 'neutral'}
            trendValue={`${Math.round(overallStats.averageScore)}%`}
          />
          <StatCard
            label="Total Marks"
            value={overallStats.totalMarksObtained}
            icon={Target}
            color="amber"
          />
          <StatCard
            label="Top Class"
            value={overallStats.topPerformingClass}
            icon={Award}
            color="teal"
          />
          <StatCard
            label="Top Subject"
            value={overallStats.topPerformingSubject}
            icon={BookOpen}
            color="rose"
          />
        </div>

        {/* ── View Mode Toggle ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Button
            variant={viewMode === 'classes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('classes')}
            className={cn(
              'h-8 text-xs',
              viewMode === 'classes' ? 'bg-blue-600 text-white' : 'text-slate-600'
            )}
          >
            <School className="h-3.5 w-3.5 mr-1.5" />
            Classes
          </Button>
          <Button
            variant={viewMode === 'subjects' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('subjects')}
            className={cn(
              'h-8 text-xs',
              viewMode === 'subjects' ? 'bg-blue-600 text-white' : 'text-slate-600'
            )}
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Subjects
          </Button>
          <Button
            variant={viewMode === 'pupils' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('pupils')}
            className={cn(
              'h-8 text-xs',
              viewMode === 'pupils' ? 'bg-blue-600 text-white' : 'text-slate-600'
            )}
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Pupils
          </Button>
        </div>

        {/* ── Classes View ────────────────────────────────────────────────── */}
        {viewMode === 'classes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Class Performance
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classAnalytics.map((cls) => (
                <ClassAnalyticsCard key={cls.className} data={cls} />
              ))}
            </div>
          </div>
        )}

        {/* ── Subjects View ───────────────────────────────────────────────── */}
        {viewMode === 'subjects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Subject Performance
              </p>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="h-8 text-xs w-[150px]">
                  <SelectValue placeholder="Filter subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjectAnalytics.map((s) => (
                    <SelectItem key={s.subject} value={s.subject}>
                      {s.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map((subject) => (
                <SubjectPerformanceCard key={subject.subject} data={subject} />
              ))}
            </div>
          </div>
        )}

        {/* ── Pupils View ─────────────────────────────────────────────────── */}
        {viewMode === 'pupils' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pupil Performance
              </p>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="h-8 text-xs w-[150px]">
                  <SelectValue placeholder="Filter class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {teacherClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {filteredPupils.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No pupils found for the selected filter.
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
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff Analytics • Geared Towards Excellence</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>

      {/* ── Refresh Indicator ─────────────────────────────────────────────── */}
      {refreshing && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-xl text-xs font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
          Refreshing...
        </div>
      )}
    </div>
  )
}