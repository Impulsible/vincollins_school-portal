/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
// app/admin/broad-sheet/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, RefreshCw, Printer, Search, X, FileSpreadsheet,
  Users, FileDown, Sparkles, FileText, CheckCircle2,
  Eye, Bell, AlertTriangle, Clock, ArrowLeft, Filter,
  ArrowRight, ClipboardCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────
const PRIMARY_SUBJECTS = [
  { id: 'english', name: 'English' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'basic_science', name: 'Basic Science' },
  { id: 'social_studies', name: 'Social Studies' },
  { id: 'phonics', name: 'Phonics' },
  { id: 'yoruba', name: 'Yoruba' },
  { id: 'civic_education', name: 'Civic Education' },
  { id: 'creative_arts', name: 'Creative Arts' },
  { id: 'agriculture', name: 'Agriculture' },
  { id: 'computer_education', name: 'Computer Education' },
  { id: 'crs', name: 'Christian Religious Studies' },
  { id: 'french', name: 'French' },
  { id: 'quantitative_reasoning', name: 'Quantitative Reasoning' },
  { id: 'verbal_reasoning', name: 'Verbal Reasoning' },
  { id: 'music', name: 'Music' },
  { id: 'handwriting', name: 'Handwriting' },
  { id: 'literature', name: 'Literature' },
  { id: 'vocational_aptitude', name: 'Vocational Aptitude' },
  { id: 'history', name: 'History' },
  { id: 'security_education', name: 'Security Education' },
  { id: 'home_economics', name: 'Home Economics' },
  { id: 'phe', name: 'Physical and Health Education' },
] as const

const CLASSES = [
  { id: 'playgroup', name: 'Playgroup', code: 'PG' },
  { id: 'nursery_1', name: 'Nursery 1', code: 'N1' },
  { id: 'nursery_2', name: 'Nursery 2', code: 'N2' },
  { id: 'kindergarten', name: 'Kindergarten', code: 'KG' },
  { id: 'primary_1', name: 'Primary 1', code: 'P1' },
  { id: 'primary_2', name: 'Primary 2', code: 'P2' },
  { id: 'primary_3', name: 'Primary 3', code: 'P3' },
  { id: 'primary_4', name: 'Primary 4', code: 'P4' },
  { id: 'primary_5', name: 'Primary 5', code: 'P5' },
] as const

const SUBJECT_DISPLAY_NAMES: Record<string, string> = {
  'Christian Religious Studies': 'CRS',
  'Physical and Health Education': 'PHE',
  'Computer Education': 'ICT',
  'Quantitative Reasoning': 'Quant',
  'Verbal Reasoning': 'Verbal',
  'Creative Arts': 'Arts',
  'Home Economics': 'Home Econ',
  'Security Education': 'Security',
  'Vocational Aptitude': 'Vocational',
  'Basic Science': 'Science',
  'Social Studies': 'Social',
  'Civic Education': 'Civic',
}

const TERM_MAP: Record<string, string> = { first: 'First', second: 'Second', third: 'Third' }
const MIN_SUBJECTS_FOR_REPORT = 20

const getRemarkColor = (remark: string): string => {
  const colors: Record<string, string> = {
    'Excellent': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Very Good': 'bg-blue-100 text-blue-700 border-blue-200',
    'Good': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Satisfactory': 'bg-amber-100 text-amber-700 border-amber-200',
    'Average': 'bg-orange-100 text-orange-700 border-orange-200',
    'Fair': 'bg-rose-100 text-rose-700 border-rose-200',
    'Not graded': 'bg-slate-100 text-slate-500 border-slate-200',
    'No Score': 'bg-slate-100 text-slate-500 border-slate-200',
  }
  return colors[remark] || 'bg-slate-100 text-slate-600'
}

const getRemarkFromScore = (score: number, completed: number): string => {
  if (completed === 0) return 'Not graded'
  if (score >= 80) return 'Excellent'
  if (score >= 70) return 'Very Good'
  if (score >= 60) return 'Good'
  if (score >= 50) return 'Satisfactory'
  if (score >= 45) return 'Average'
  if (score > 0) return 'Fair'
  return 'Not graded'
}

interface SubjectScore {
  subject: string
  ca: number
  exam: number
  total: number
  remark: string
}

interface StudentRecord {
  id: string
  name: string
  admission_number: string
  vin_id: string
  class: string
  subjectMap: Record<string, SubjectScore>
  totalScore: number
  averageScore: number
  overallRemark: string
  completedSubjects: number
  totalSubjects: number
  hasAllSubjects: boolean
  meetsMinimum: boolean
  reportCardStatus?: string | null
  reportCardId?: string | null
  photo_url?: string | null
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-emerald-400 blur-2xl opacity-20 animate-pulse" />
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
          <FileSpreadsheet className="h-10 w-10 text-white" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-700">Loading broad sheet</p>
      <p className="text-xs text-slate-400 mt-1">Fetching student records...</p>
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, tone, subtitle, loading }: {
  label: string
  value: string | number
  icon: React.ElementType
  tone: 'slate' | 'emerald' | 'violet' | 'amber' | 'teal'
  subtitle?: string
  loading?: boolean
}) {
  const tones = {
    slate: { bg: 'bg-slate-50', icon: 'text-slate-600', accent: 'bg-slate-500' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', accent: 'bg-emerald-500' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', accent: 'bg-violet-500' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', accent: 'bg-amber-500' },
    teal: { bg: 'bg-teal-50', icon: 'text-teal-600', accent: 'bg-teal-500' },
  }
  const t = tones[tone]

  return (
    <div className="relative overflow-hidden bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
      <div className={cn('absolute top-0 left-0 right-0 h-0.5', t.accent)} />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight truncate">{label}</p>
          <div className={cn('shrink-0 h-6 w-6 rounded-lg flex items-center justify-center', t.bg)}>
            <Icon className={cn('h-3 w-3', t.icon)} />
          </div>
        </div>
        {loading ? (
          <div className="h-7 w-12 bg-slate-100 rounded-md animate-pulse" />
        ) : (
          <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">{value}</p>
        )}
        {subtitle && !loading && (
          <p className="text-[9px] text-slate-500 font-semibold mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

function ReportStatusChip({ status, hasScores }: { status?: string | null; hasScores?: boolean }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="h-2.5 w-2.5" />Published
      </span>
    )
  }
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
        <ClipboardCheck className="h-2.5 w-2.5" />Approved
      </span>
    )
  }
  if (status === 'generated') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
        <FileText className="h-2.5 w-2.5" />Pending Approval
      </span>
    )
  }
  if (hasScores) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full">
        <Eye className="h-2.5 w-2.5" />Live Preview
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
      —
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function BroadSheetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedTerm, setSelectedTerm] = useState('first')
  const [selectedYear, setSelectedYear] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [profile, setProfile] = useState<{ id: string; full_name: string } | null>(null)
  const [genProgress, setGenProgress] = useState({ current: 0, total: 0 })
  const [newScoreAlert, setNewScoreAlert] = useState<string | null>(null)
  const [isLoadingTerm, setIsLoadingTerm] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [showGenerationSuccess, setShowGenerationSuccess] = useState<{ count: number } | null>(null)

  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isRefreshingRef = useRef(false)

  const fetchCurrentTerm = useCallback(async () => {
    try {
      const { data: settings } = await supabase
        .from('school_settings')
        .select('current_term, current_session')
        .maybeSingle()

      if (settings) {
        if (settings.current_term) setSelectedTerm(settings.current_term.toLowerCase())
        else if (!selectedTerm) setSelectedTerm('first')

        if (settings.current_session) setSelectedYear(settings.current_session)
        else if (!selectedYear) {
          const year = new Date().getFullYear()
          setSelectedYear(`${year}/${year + 1}`)
        }
      } else {
        if (!selectedTerm) setSelectedTerm('first')
        if (!selectedYear) {
          const year = new Date().getFullYear()
          setSelectedYear(`${year}/${year + 1}`)
        }
      }
    } catch {
      if (!selectedTerm) setSelectedTerm('first')
      if (!selectedYear) {
        const year = new Date().getFullYear()
        setSelectedYear(`${year}/${year + 1}`)
      }
    } finally {
      setIsLoadingTerm(false)
    }
  }, [selectedTerm, selectedYear])

  useEffect(() => { fetchCurrentTerm() }, [fetchCurrentTerm])

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setLoading(false); return }

        const { data: pd } = await supabase.from('profiles').select('id, full_name').eq('id', session.user.id).single()
        if (pd) setProfile(pd)

        if (CLASSES.length > 0 && !selectedClass) {
          setSelectedClass(CLASSES[0].id)
        }
        setLoading(false)
      } catch {
        setLoading(false)
        setLoadError(true)
      }
    }
    init()
  }, [])

  const loadBroadSheet = useCallback(async () => {
    if (!selectedClass || !selectedTerm || !selectedYear || isLoadingTerm) return

    setLoading(true)
    setLoadError(false)

    try {
      const classInfo = CLASSES.find(c => c.id === selectedClass)
      const className = classInfo?.name || selectedClass

      const { data: classStudents, error: studentError } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, admission_number, vin_id, class, class_arm, photo_url')
        .in('role', ['pupil', 'student'])
        .eq('class', className)
        .order('display_name', { ascending: true, nullsFirst: false })
        .limit(500)

      if (studentError) throw studentError

      if (!classStudents || classStudents.length === 0) {
        setStudents([]); setLoading(false); setLastRefreshed(new Date()); return
      }

      const studentIds = classStudents.map(s => s.id)
      const dbTerm = TERM_MAP[selectedTerm] || 'First'

      const { data: allScores } = await supabase
        .from('primary_scores')
        .select('*')
        .in('student_id', studentIds)
        .eq('term', dbTerm)
        .eq('academic_year', selectedYear)
        .limit(5000)

      const { data: existingReportCards, error: reportError } = await supabase
        .from('report_cards')
        .select('student_id, status, id')
        .in('student_id', studentIds)
        .eq('term', dbTerm)
        .eq('session_year', selectedYear)

      if (reportError) {
        console.error('Error fetching report cards:', reportError)
      }

      const reportCardStatusMap: Record<string, string> = {}
      const reportCardIdMap: Record<string, string> = {}
      ;(existingReportCards || []).forEach(rc => {
        reportCardStatusMap[rc.student_id] = rc.status
        reportCardIdMap[rc.student_id] = rc.id
      })

      const subjectNameLookup = new Map(PRIMARY_SUBJECTS.map(s => [s.name.toLowerCase(), s.name]))

      const records: StudentRecord[] = classStudents.map(student => {
        const scores = (allScores || []).filter(s => s.student_id === student.id)
        const subjectMap: Record<string, SubjectScore> = {}

        PRIMARY_SUBJECTS.forEach(sub => {
          subjectMap[sub.name] = { subject: sub.name, ca: 0, exam: 0, total: 0, remark: 'Not graded' }
        })

        scores.forEach(score => {
          const matched = subjectNameLookup.get(score.subject?.toLowerCase())
          if (matched) {
            subjectMap[matched] = {
              subject: matched,
              ca: score.ca_score || 0,
              exam: score.exam_score || 0,
              total: score.total_score || 0,
              remark: score.remark || 'Not graded',
            }
          }
        })

        const completedSubjects = Object.values(subjectMap).filter(s => s.total > 0).length
        const totalScore = Object.values(subjectMap).reduce((sum, s) => sum + s.total, 0)

        let averageScore = 0
        if (completedSubjects > 0) {
          const sum = Object.values(subjectMap).filter(s => s.total > 0).reduce((a, s) => a + s.total, 0)
          averageScore = Math.round(sum / completedSubjects)
        }

        return {
          id: student.id,
          name: student.display_name || student.full_name || 'Student',
          admission_number: student.admission_number || '—',
          vin_id: student.vin_id || '—',
          class: student.class || className || '',
          subjectMap,
          totalScore,
          averageScore,
          overallRemark: getRemarkFromScore(averageScore, completedSubjects),
          completedSubjects,
          totalSubjects: PRIMARY_SUBJECTS.length,
          hasAllSubjects: completedSubjects === PRIMARY_SUBJECTS.length,
          meetsMinimum: completedSubjects >= MIN_SUBJECTS_FOR_REPORT,
          reportCardStatus: reportCardStatusMap[student.id] || null,
          reportCardId: reportCardIdMap[student.id] || null,
          photo_url: student.photo_url || null,
        }
      })

      setStudents(records)
      setLastRefreshed(new Date())
    } catch (error) {
      console.error('Error loading broad sheet:', error)
      toast.error('Failed to load broad sheet')
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [selectedClass, selectedTerm, selectedYear, isLoadingTerm])

  useEffect(() => {
    if (!isLoadingTerm && selectedClass && selectedTerm && selectedYear) {
      loadBroadSheet()
    }
  }, [selectedClass, selectedTerm, selectedYear, isLoadingTerm, loadBroadSheet])

  useEffect(() => {
    if (loading || students.length === 0 || isLoadingTerm) return
    if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current)
    autoRefreshTimerRef.current = setInterval(async () => {
      if (isRefreshingRef.current) return
      isRefreshingRef.current = true
      try { await loadBroadSheet() } catch { } finally { isRefreshingRef.current = false }
    }, 30000)
    return () => { if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current) }
  }, [loading, students.length, isLoadingTerm, loadBroadSheet])

  const handleGenerateReportCards = async () => {
    const ready = students.filter(s =>
      s.meetsMinimum &&
      s.completedSubjects >= MIN_SUBJECTS_FOR_REPORT &&
      !s.reportCardId
    )

    if (ready.length === 0) {
      const eligibleButHasCard = students.filter(s => s.meetsMinimum && s.reportCardId).length
      if (eligibleButHasCard > 0) {
        toast.info(`All eligible students already have report cards.`)
      } else {
        toast.warning(`No students meet the minimum ${MIN_SUBJECTS_FOR_REPORT}-subject requirement`)
      }
      return
    }

    setGenerating(true)
    setGenProgress({ current: 0, total: ready.length })
    let successCount = 0
    let errorCount = 0

    try {
      for (const student of ready) {
        try {
          const formattedSubjects = PRIMARY_SUBJECTS.map(sub => {
            const score = student.subjectMap[sub.name]
            return {
              name: sub.name,
              ca: score?.ca || 0,
              exam: score?.exam || 0,
              total: score?.total || 0,
              remark: score?.remark || 'Not graded',
            }
          })

          const dbTerm = TERM_MAP[selectedTerm] || 'First'

          // ✅ Matched to the report_cards schema
          const reportCardData = {
            student_id: student.id,
            term: dbTerm,
            session_year: selectedYear,
            class: student.class || selectedClass,
            subjects: formattedSubjects,
            average: student.averageScore || 0,
            grade: student.overallRemark || 'Not graded',
            teacher_comment: '',
            principal_comment: '',
            status: 'generated',
            generated_by: profile?.id || null,
            generated_at: new Date().toISOString(),
          }

          const { error: insertError } = await supabase.from('report_cards').insert(reportCardData)

          if (insertError) {
            console.error('Failed to insert report card for student:', student.name, insertError)
            errorCount++
          } else {
            successCount++
            setGenProgress({ current: successCount, total: ready.length })
          }
        } catch (err) {
          console.error('Error during student card generation:', err)
          errorCount++
        }
      }

      if (successCount > 0) {
        setShowGenerationSuccess({ count: successCount })
        toast.success(`✅ ${successCount} report cards sent for approval`)
        await loadBroadSheet()
      }
      if (errorCount > 0) toast.warning(`⚠️ ${errorCount} failed to generate`)
    } catch {
      toast.error('Failed to generate report cards')
    } finally {
      setGenerating(false)
      setGenProgress({ current: 0, total: 0 })
    }
  }

  const handleExportCSV = () => {
    if (!students.length) { toast.error('No data to export'); return }
    const headers = ['Student Name', 'Admission No', ...PRIMARY_SUBJECTS.map(s => s.name), 'Total', 'Average', 'Remark', 'Status']
    const rows = students.map(s => [
      s.name, s.admission_number,
      ...PRIMARY_SUBJECTS.map(sub => {
        const sc = s.subjectMap[sub.name]
        return sc && sc.total > 0 ? `${sc.total}(${sc.remark})` : '—'
      }),
      s.totalScore, `${s.averageScore}%`, s.overallRemark, s.reportCardStatus || 'None',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `BroadSheet_${selectedClass}_${selectedTerm}_${selectedYear}.csv`
    a.click()
    toast.success('Exported!')
  }

  const handleViewReportCard = (student: StudentRecord) => {
    const dbTerm = TERM_MAP[selectedTerm] || 'First'
    if (student.reportCardId) {
      router.push(`/admin/report-cards/${student.reportCardId}/view`)
    } else if (student.completedSubjects > 0) {
      router.push(`/admin/report-cards/preview?studentId=${student.id}&term=${dbTerm}&year=${encodeURIComponent(selectedYear)}`)
    } else {
      toast.info(`${student.name} has no scores yet.`)
    }
  }

  const stats = useMemo(() => {
    const ready = students.filter(s => s.meetsMinimum && s.completedSubjects >= MIN_SUBJECTS_FOR_REPORT && !s.reportCardId)
    const pending = students.filter(s => s.reportCardStatus === 'generated')
    const approved = students.filter(s => s.reportCardStatus === 'approved')
    const published = students.filter(s => s.reportCardStatus === 'published')
    return {
      total: students.length,
      complete: students.filter(s => s.hasAllSubjects).length,
      readyForReport: ready.length,
      pending: pending.length,
      approved: approved.length,
      published: published.length,
    }
  }, [students])

  const displayedStudents = useMemo(() => {
    if (!searchQuery) return students
    const q = searchQuery.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.admission_number.toLowerCase().includes(q) ||
      s.vin_id.toLowerCase().includes(q)
    )
  }, [students, searchQuery])

  if (isLoadingTerm || (loading && students.length === 0 && !loadError)) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingState /></div>
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="inline-flex p-4 rounded-2xl bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Failed to Load Data</h3>
            <p className="text-sm text-slate-500 mt-1">There was an error loading the broad sheet.</p>
          </div>
          <Button onClick={loadBroadSheet} className="gap-2"><RefreshCw className="h-4 w-4" /> Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 space-y-4">

        <AnimatePresence>
          {newScoreAlert && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="no-print flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-sm font-semibold text-emerald-700">{newScoreAlert}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setNewScoreAlert(null); loadBroadSheet() }} className="h-7 text-xs text-emerald-600 hover:bg-emerald-100">
                Refresh <RefreshCw className="h-3 w-3 ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGenerationSuccess && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }}
              className="no-print relative overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl" />
              <div className="relative p-4 flex items-center gap-3">
                <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <ClipboardCheck className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-violet-900">
                    {showGenerationSuccess.count} Report Card{showGenerationSuccess.count !== 1 ? 's' : ''} Ready for Approval
                  </p>
                  <p className="text-xs text-violet-700 mt-0.5">
                    Report cards have been generated and sent to the approval queue.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/admin/report-cards">
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 h-9 rounded-lg font-bold text-xs shadow-sm shadow-violet-500/20">
                      Go to Approval <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <button onClick={() => setShowGenerationSuccess(null)} className="h-8 w-8 rounded-lg hover:bg-white/50 flex items-center justify-center">
                    <X className="h-4 w-4 text-violet-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="no-print flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <button onClick={() => router.back()} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 mb-1.5 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shadow-emerald-500/20">
                <FileSpreadsheet className="h-4 w-4 text-white" />
              </div>
              Broad Sheet
            </h1>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span className="text-xs font-semibold text-slate-600">
                {CLASSES.find(c => c.id === selectedClass)?.name || 'Select Class'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 capitalize">{selectedTerm} Term</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{selectedYear}</span>
              {lastRefreshed && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {lastRefreshed.toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {(stats.pending > 0 || stats.approved > 0) && (
              <Link href="/admin/report-cards">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 rounded-lg font-semibold border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Approval Queue
                  {stats.pending > 0 && (
                    <span className="ml-0.5 bg-violet-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{stats.pending}</span>
                  )}
                </Button>
              </Link>
            )}
            <Button size="sm" variant="outline" onClick={handleExportCSV} className="h-8 text-xs gap-1.5 rounded-lg font-semibold">
              <FileDown className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()} className="h-8 text-xs gap-1.5 rounded-lg font-semibold">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button size="sm" variant="ghost" onClick={loadBroadSheet} disabled={loading} className="h-8 text-xs gap-1.5 rounded-lg font-semibold">
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
            </Button>
          </div>
        </div>

        <div className="no-print grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <StatCard label="Students" value={stats.total} icon={Users} tone="slate" loading={loading && students.length === 0} />
          <StatCard label="Complete" value={stats.complete} icon={CheckCircle2} tone="emerald" loading={loading && students.length === 0} subtitle="all subjects" />
          <StatCard label="Ready to Generate" value={stats.readyForReport} icon={Sparkles} tone="violet" loading={loading && students.length === 0} subtitle={`${MIN_SUBJECTS_FOR_REPORT}+ subjects`} />
          <StatCard label="Pending Approval" value={stats.pending} icon={FileText} tone="amber" loading={loading && students.length === 0} subtitle="awaiting review" />
          <StatCard label="Approved" value={stats.approved} icon={ClipboardCheck} tone="teal" loading={loading && students.length === 0} subtitle="not yet published" />
          <StatCard label="Published" value={stats.published} icon={CheckCircle2} tone="emerald" loading={loading && students.length === 0} subtitle="visible to pupils" />
        </div>

        <div className="no-print bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Filter className="h-2.5 w-2.5" /> Class
              </label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-9 text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-lg font-semibold">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map(c => (<SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-9 text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First Term</SelectItem>
                  <SelectItem value="second">Second Term</SelectItem>
                  <SelectItem value="third">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-9 text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-lg font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i
                    return `${year}/${year + 1}`
                  }).map(y => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Name or admission number..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm bg-slate-50/50 border-slate-200 focus-visible:bg-white rounded-lg font-medium" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center">
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {stats.readyForReport > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button onClick={handleGenerateReportCards} disabled={generating}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 gap-2 h-10 px-4 rounded-lg font-bold text-sm shrink-0">
                  {generating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Generating {genProgress.current}/{genProgress.total}</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Generate {stats.readyForReport} Report Card{stats.readyForReport !== 1 ? 's' : ''}</>
                  )}
                </Button>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-violet-100 text-violet-700 font-black flex items-center justify-center text-[9px]">1</span>Generate
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-amber-100 text-amber-700 font-black flex items-center justify-center text-[9px]">2</span>Approve
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
                  <span className="flex items-center gap-1">
                    <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-[9px]">3</span>Publish to Pupils
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden print:shadow-none">
          <div className="no-print flex items-center justify-between px-4 py-2.5 bg-slate-50/70 border-b border-slate-200/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Students</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{displayedStudents.length}</span>
            </div>
            {loading && students.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                <Loader2 className="h-3 w-3 animate-spin" /> Refreshing…
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/30">
                  <th className="sticky left-0 z-20 bg-slate-50 px-3 py-2.5 text-left font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[160px]">Student</th>
                  <th className="px-2 py-2.5 text-left font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[85px]">Adm. No</th>
                  {PRIMARY_SUBJECTS.map(subject => (
                    <th key={subject.id} className="px-1.5 py-2.5 text-center font-black text-slate-500 uppercase tracking-widest text-[9px] whitespace-nowrap min-w-[52px]">
                      {SUBJECT_DISPLAY_NAMES[subject.name] || subject.name}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[48px]">Total</th>
                  <th className="px-2 py-2.5 text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[48px]">Avg</th>
                  <th className="px-2 py-2.5 text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[70px]">Remark</th>
                  <th className="no-print px-2 py-2.5 text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[100px]">Report Status</th>
                  <th className="no-print px-2 py-2.5 text-center font-black text-slate-500 uppercase tracking-widest text-[9px] min-w-[50px]">View</th>
                </tr>
              </thead>

              <tbody>
                {displayedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={PRIMARY_SUBJECTS.length + 7} className="text-center py-16">
                      <div className="inline-flex p-4 rounded-2xl bg-slate-100 mb-3">
                        <Users className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-600">No students found</p>
                      {searchQuery && (<p className="text-xs text-slate-400 mt-1">Try adjusting your search</p>)}
                    </td>
                  </tr>
                ) : (
                  displayedStudents.map((student, idx) => (
                    <tr key={student.id} className={cn(
                      'border-b border-slate-100 transition-colors hover:bg-slate-50/70',
                      idx % 2 !== 0 && 'bg-slate-50/20',
                      !student.meetsMinimum && 'bg-amber-50/30',
                    )}>
                      <td className="sticky left-0 z-10 bg-inherit px-3 py-2.5">
                        <div>
                          <p className="font-bold text-xs text-slate-800 leading-snug">{student.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">{student.vin_id}</p>
                          {!student.meetsMinimum && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full mt-0.5">
                              <AlertTriangle className="h-2 w-2" /> {student.completedSubjects}/{student.totalSubjects}
                            </span>
                          )}
                          {student.meetsMinimum && !student.reportCardId && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full mt-0.5">
                              <Sparkles className="h-2 w-2" /> Ready
                            </span>
                          )}
                          {student.meetsMinimum && student.reportCardId && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full mt-0.5">
                              <CheckCircle2 className="h-2 w-2" /> Card Created
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-2.5 font-mono text-[10px] text-slate-500">{student.admission_number}</td>

                      {PRIMARY_SUBJECTS.map(subject => {
                        const score = student.subjectMap[subject.name]
                        return (
                          <td key={subject.id} className="px-1.5 py-2.5 text-center">
                            {score && score.total > 0 ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="font-bold text-xs text-slate-800">{score.total}</span>
                                <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded border', getRemarkColor(score.remark))}>{score.remark}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                        )
                      })}

                      <td className="px-2 py-2.5 text-center font-black text-xs text-slate-800">{student.totalScore || '—'}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-xs text-slate-700">
                        {student.averageScore > 0 ? `${student.averageScore}%` : '—'}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        {student.overallRemark !== 'Not graded' ? (
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', getRemarkColor(student.overallRemark))}>{student.overallRemark}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="no-print px-2 py-2.5 text-center">
                        <ReportStatusChip status={student.reportCardStatus} hasScores={student.completedSubjects > 0} />
                      </td>

                      <td className="no-print px-2 py-2.5 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReportCard(student)}
                          className={cn(
                            "h-7 w-7 p-0 rounded-lg",
                            student.reportCardId
                              ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              : student.completedSubjects > 0
                                ? "text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                                : "text-slate-300 hover:bg-slate-50"
                          )}
                          title={
                            student.reportCardId
                              ? "View report card"
                              : student.completedSubjects > 0
                                ? "View live preview"
                                : "No scores yet"
                          }
                          disabled={student.completedSubjects === 0}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="no-print pt-4 pb-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/50">
          <p className="font-semibold">Vincollins Schools · Broad Sheet</p>
          <p>&copy; {new Date().getFullYear()} All rights reserved</p>
        </footer>

        <style jsx global>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            @page { size: landscape; margin: 0.5cm; }
            table { font-size: 7pt !important; }
            th, td { padding: 2px 4px !important; }
          }
        `}</style>
      </div>
    </div>
  )
}