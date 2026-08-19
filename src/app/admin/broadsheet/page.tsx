/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
// app/admin/broad-sheet/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Loader2, RefreshCw, Printer, Search, X, FileSpreadsheet,
  Users, FileDown, Sparkles, FileText, CheckCircle2,
  Eye, Bell, Send, BookOpen, AlertTriangle, GraduationCap,
  School, Calendar, Clock, Award, BarChart3, TrendingUp,
  Copy, Check, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIMARY_SUBJECTS = [
  { id: 'english', name: 'English', category: 'Core' },
  { id: 'mathematics', name: 'Mathematics', category: 'Core' },
  { id: 'basic_science', name: 'Basic Science', category: 'Core' },
  { id: 'social_studies', name: 'Social Studies', category: 'Core' },
  { id: 'phonics', name: 'Phonics', category: 'Core' },
  { id: 'yoruba', name: 'Yoruba', category: 'Languages' },
  { id: 'civic_education', name: 'Civic Education', category: 'Core' },
  { id: 'creative_arts', name: 'Creative Arts', category: 'Arts' },
  { id: 'agriculture', name: 'Agriculture', category: 'Sciences' },
  { id: 'computer_education', name: 'Computer Education', category: 'Sciences' },
  { id: 'crs', name: 'Christian Religious Studies', category: 'Core' },
  { id: 'french', name: 'French', category: 'Languages' },
  { id: 'quantitative_reasoning', name: 'Quantitative Reasoning', category: 'Core' },
  { id: 'verbal_reasoning', name: 'Verbal Reasoning', category: 'Core' },
  { id: 'music', name: 'Music', category: 'Arts' },
  { id: 'handwriting', name: 'Handwriting', category: 'Core' },
  { id: 'literature', name: 'Literature', category: 'Arts' },
  { id: 'vocational_aptitude', name: 'Vocational Aptitude', category: 'Vocational' },
  { id: 'history', name: 'History', category: 'Core' },
  { id: 'security_education', name: 'Security Education', category: 'Core' },
  { id: 'home_economics', name: 'Home Economics', category: 'Vocational' },
  { id: 'phe', name: 'Physical and Health Education', category: 'Core' },
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

// ── Grading System ──────────────────────────────────────────────────────────
const getRemarkColor = (remark: string): string => {
  const colors: Record<string, string> = {
    'Excellent': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    'Very Good': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'Good': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
    'Satisfactory': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    'Average': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'Fair': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    'Not graded': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    'No Score': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  }
  return colors[remark] || 'bg-slate-100 text-slate-600'
}

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Loading State ─────────────────────────────────────────────────────────────

function LoadingState({ type = 'initial' }: { type?: 'initial' | 'refresh' }) {
  if (type === 'refresh') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-sm text-slate-500">Refreshing data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 blur-2xl opacity-20 animate-pulse" />
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
          <FileSpreadsheet className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Loading Broad Sheet</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500">Fetching student records and scores...</p>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, icon: Icon, sub, loading }: { 
  label: string
  value: string | number
  accent: string
  icon: React.ElementType
  sub?: string 
  loading?: boolean
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-white dark:bg-slate-900">
      <div className={cn('absolute inset-y-0 left-0 w-1 rounded-l-lg', accent)} />
      <CardContent className="p-4 pl-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-1" />
            ) : (
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
            )}
            {sub && !loading && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
            <Icon className={cn('h-4 w-4', accent.replace('bg-', 'text-'))} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Report Status Chip ──────────────────────────────────────────────────────
function ReportStatusChip({ status }: { status?: string | null }) {
  if (status === 'published') {
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="h-2.5 w-2.5" />Published
    </span>
  }
  if (status === 'generated') {
    return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
      <FileText className="h-2.5 w-2.5" />Generated
    </span>
  }
  return <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full">None</span>
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-sm">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Vincollins Schools
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Broad Sheet Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <span className="hidden sm:inline">•</span>
          <span>v2.0.0</span>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          &copy; {currentYear} Vincollins Schools. All rights reserved.
        </p>
      </div>
      
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Geared Towards Excellence
        </span>
        <span>•</span>
        <span>Data refreshed automatically every 30s</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Users className="h-2.5 w-2.5" />
          {PRIMARY_SUBJECTS.length} Subjects
        </span>
      </div>
    </footer>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function BroadSheetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
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

  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isRefreshingRef = useRef(false)

  // ─── Fetch current term and session ──────────────────────────────────────
  const fetchCurrentTerm = useCallback(async () => {
    try {
      const { data: settings, error } = await supabase
        .from('school_settings')
        .select('current_term, current_session')
        .maybeSingle()

      if (error) {
        console.error('Error fetching settings:', error)
        if (!selectedTerm) setSelectedTerm('first')
        setIsLoadingTerm(false)
        return
      }

      if (settings) {
        if (settings.current_term) {
          setSelectedTerm(settings.current_term.toLowerCase())
        } else if (!selectedTerm) {
          setSelectedTerm('first')
        }
        
        if (settings.current_session) {
          setSelectedYear(settings.current_session)
        } else if (!selectedYear) {
          const year = new Date().getFullYear()
          setSelectedYear(`${year}/${year + 1}`)
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      if (!selectedTerm) setSelectedTerm('first')
      const year = new Date().getFullYear()
      if (!selectedYear) setSelectedYear(`${year}/${year + 1}`)
    } finally {
      setIsLoadingTerm(false)
    }
  }, [selectedTerm, selectedYear])

  useEffect(() => {
    fetchCurrentTerm()
  }, [fetchCurrentTerm])

  // ─── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLoading(false)
          return
        }

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

  // ─── Load broad sheet from primary_scores ─────────────────────────────────
  const loadBroadSheet = useCallback(async () => {
    if (!selectedClass || !selectedTerm || !selectedYear || isLoadingTerm) return
    
    setLoading(true)
    setLoadError(false)
    
    try {
      console.log('📊 [BroadSheet] Loading data for class:', selectedClass)
      
      const classInfo = CLASSES.find(c => c.id === selectedClass)
      const className = classInfo?.name || selectedClass
      
      // Fetch students
      const { data: classStudents, error: studentError } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, admission_number, vin_id, class, class_arm, photo_url')
        .in('role', ['pupil', 'student'])
        .eq('class', className)
        .order('display_name', { ascending: true, nullsFirst: false })
        .limit(500)

      if (studentError) {
        console.error('Student fetch error:', studentError)
        throw studentError
      }
      
      if (!classStudents || classStudents.length === 0) {
        setStudents([])
        setLoading(false)
        setLastRefreshed(new Date())
        return
      }

      console.log(`✅ Found ${classStudents.length} students in ${className}`)

      const studentIds = classStudents.map(s => s.id)
      
      // Fetch scores - Map term correctly
      const termMap: Record<string, string> = {
        'first': 'First',
        'second': 'Second',
        'third': 'Third'
      }
      const dbTerm = termMap[selectedTerm] || 'First'
      
      const { data: allScores, error: scoreError } = await supabase
        .from('primary_scores')
        .select('*')
        .in('student_id', studentIds)
        .eq('term', dbTerm)
        .eq('academic_year', selectedYear)
        .limit(5000)
      
      if (scoreError) {
        console.error('Score fetch error:', scoreError)
      }

      console.log(`✅ Found ${allScores?.length || 0} scores from primary_scores for term: ${dbTerm}`)
      
      // DEBUG: Log subjects
      if (allScores && allScores.length > 0) {
        const uniqueSubjects = [...new Set(allScores.map(s => s.subject))];
        console.log('🔍 UNIQUE SUBJECTS IN DATABASE:', uniqueSubjects);
        console.log('📝 SAMPLE SCORES:', allScores.slice(0, 3));
      }

      // Fetch report cards
      const { data: existingReportCards } = await supabase
        .from('report_cards')
        .select('student_id, status, id')
        .in('student_id', studentIds)
        .eq('term', dbTerm)
        .eq('academic_year', selectedYear)
      
      const reportCardStatusMap: Record<string, string> = {}
      const reportCardIdMap: Record<string, string> = {}
      ;(existingReportCards || []).forEach(rc => {
        reportCardStatusMap[rc.student_id] = rc.status
        reportCardIdMap[rc.student_id] = rc.id
      })

      // Build records
      const records: StudentRecord[] = classStudents.map(student => {
        const scores = (allScores || []).filter(s => s.student_id === student.id)
        const subjectMap: Record<string, SubjectScore> = {}
        const subjectNames = PRIMARY_SUBJECTS.map(s => s.name)
        
        // Initialize all subjects with empty scores
        subjectNames.forEach(sub => {
          subjectMap[sub] = {
            subject: sub,
            ca: 0,
            exam: 0,
            total: 0,
            remark: 'Not graded'
          }
        })
        
        // Fill in scores that exist
        scores.forEach(score => {
          // Find the subject in PRIMARY_SUBJECTS by matching the name exactly
          const matchedSubject = subjectNames.find(sub => sub === score.subject)
          if (matchedSubject) {
            subjectMap[matchedSubject] = {
              subject: matchedSubject,
              ca: score.ca_score || 0,
              exam: score.exam_score || 0,
              total: score.total_score || 0,
              remark: score.remark || 'Not graded'
            }
          } else {
            // If the subject doesn't match exactly, try case-insensitive
            const caseInsensitiveMatch = subjectNames.find(sub => 
              sub.toLowerCase() === score.subject.toLowerCase()
            )
            if (caseInsensitiveMatch) {
              subjectMap[caseInsensitiveMatch] = {
                subject: caseInsensitiveMatch,
                ca: score.ca_score || 0,
                exam: score.exam_score || 0,
                total: score.total_score || 0,
                remark: score.remark || 'Not graded'
              }
            } else {
              console.warn(`⚠️ Subject "${score.subject}" not found in PRIMARY_SUBJECTS for student ${student.display_name || student.full_name}`)
            }
          }
        })
        
        // ✅ Calculate completed subjects (subjects with total > 0)
        const completedSubjects = Object.values(subjectMap).filter(s => s.total > 0).length
        
        // ✅ Calculate total score (sum of all subject totals)
        const totalScore = Object.values(subjectMap).reduce((sum, s) => sum + s.total, 0)
        
        // ✅ FIXED: Average = Average percentage across completed subjects
        let averageScore = 0
        if (completedSubjects > 0) {
          const completedScores = Object.values(subjectMap)
            .filter(s => s.total > 0)
            .map(s => s.total)
          
          const sumCompletedScores = completedScores.reduce((a, b) => a + b, 0)
          averageScore = Math.round(sumCompletedScores / completedSubjects)
        }
        
        // Get overall remark based on average score
        let overallRemark = 'Not graded'
        if (completedSubjects > 0) {
          if (averageScore >= 80) overallRemark = 'Excellent'
          else if (averageScore >= 70) overallRemark = 'Very Good'
          else if (averageScore >= 60) overallRemark = 'Good'
          else if (averageScore >= 50) overallRemark = 'Satisfactory'
          else if (averageScore >= 45) overallRemark = 'Average'
          else if (averageScore > 0) overallRemark = 'Fair'
        }
        
        const studentClass = student.class || className || ''
        
        return {
          id: student.id,
          name: student.display_name || student.full_name || 'Student',
          admission_number: student.admission_number || '—',
          vin_id: student.vin_id || '—',
          class: studentClass,
          subjectMap,
          totalScore,
          averageScore,
          overallRemark: overallRemark,
          completedSubjects,
          totalSubjects: PRIMARY_SUBJECTS.length,
          hasAllSubjects: completedSubjects === PRIMARY_SUBJECTS.length,
          meetsMinimum: completedSubjects >= 20,
          reportCardStatus: reportCardStatusMap[student.id] || null,
          reportCardId: reportCardIdMap[student.id] || null,
          photo_url: student.photo_url || null
        }
      })

      setStudents(records)
      setLastRefreshed(new Date())
      console.log(`✅ Processed ${records.length} student records`)
      
      // Log sample student's subjects
      if (records.length > 0) {
        const sample = records[0]
        const subjectsWithScores = Object.keys(sample.subjectMap)
          .filter(key => sample.subjectMap[key].total > 0)
          .map(key => ({ subject: key, total: sample.subjectMap[key].total }))
        console.log('📝 Sample student subjects with scores:', {
          name: sample.name,
          completed: sample.completedSubjects,
          averageScore: sample.averageScore,
          overallRemark: sample.overallRemark,
          subjectsWithScores: subjectsWithScores
        })
      }
      
    } catch (error) {
      console.error('Error loading broad sheet:', error)
      toast.error('Failed to load broad sheet')
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [selectedClass, selectedTerm, selectedYear, isLoadingTerm])

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoadingTerm && selectedClass && selectedTerm && selectedYear) {
      loadBroadSheet()
    }
  }, [selectedClass, selectedTerm, selectedYear, isLoadingTerm, loadBroadSheet])

  // ─── Auto-refresh ──────────────────────────────────────────────────────────
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

  // ─── Generate Report Cards ────────────────────────────────────────────────
  const handleGenerateReportCards = async () => {
    const ready = students.filter(s => s.meetsMinimum && s.hasAllSubjects)
    
    if (ready.length === 0) {
      toast.warning('No students meet the minimum subject requirement (20 out of 22 subjects).')
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
              ca: score.ca,
              exam: score.exam,
              total: score.total,
              remark: score.remark
            }
          })

          const allAverages = students.map(s => s.averageScore).filter(s => s > 0)
          const sortedAverages = [...allAverages].sort((a, b) => b - a)
          const position = sortedAverages.findIndex(avg => avg === student.averageScore) + 1

          const termMap: Record<string, string> = {
            'first': 'First',
            'second': 'Second',
            'third': 'Third'
          }
          const dbTerm = termMap[selectedTerm] || 'First'

          const { data: existingCards } = await supabase
            .from('report_cards')
            .select('id')
            .eq('student_id', student.id)
            .eq('term', dbTerm)
            .eq('academic_year', selectedYear)

          if (existingCards && existingCards.length > 0) {
            await supabase
              .from('report_cards')
              .delete()
              .eq('student_id', student.id)
              .eq('term', dbTerm)
              .eq('academic_year', selectedYear)
          }

          const reportCardData = {
            student_id: student.id,
            student_name: student.name,
            student_vin: student.vin_id || 'N/A',
            student_admission_number: student.admission_number || 'N/A',
            term: dbTerm,
            academic_year: selectedYear,
            class: student.class || selectedClass,
            class_teacher: profile?.full_name || 'Class Teacher',
            principal_name: 'Principal',
            school_name: 'VINCOLLINS SCHOOLS',
            total_score: student.totalScore || 0,
            average_score: student.averageScore || 0,
            overall_remark: student.overallRemark,
            class_highest: allAverages.length > 0 ? Math.max(...allAverages) : 0,
            class_lowest: allAverages.length > 0 ? Math.min(...allAverages) : 0,
            class_average: allAverages.length > 0 ? Math.round(allAverages.reduce((a, b) => a + b, 0) / allAverages.length) : 0,
            position: position || 0,
            total_students: students.length || 1,
            subjects_data: formattedSubjects,
            teacher_comments: 'Good performance. Keep it up!',
            principal_comments: 'Promoted to next class.',
            status: 'generated',
            generated_by: profile?.id || null,
            generated_at: new Date().toISOString(),
            session_year: selectedYear,
            submitted_at: new Date().toISOString(),
            published_at: null
          }

          const { error: insertError } = await supabase
            .from('report_cards')
            .insert(reportCardData)

          if (insertError) {
            console.error('Insert error for', student.name, ':', insertError)
            errorCount++
          } else {
            successCount++
            setGenProgress({ current: successCount, total: ready.length })
          }

        } catch (studentError) {
          console.error(`Error processing ${student.name}:`, studentError)
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`✅ Generated ${successCount} report cards successfully!`)
        await loadBroadSheet()
      }

      if (errorCount > 0) {
        toast.warning(`⚠️ ${errorCount} report cards failed to generate.`)
      }

    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate report cards')
    } finally {
      setGenerating(false)
      setGenProgress({ current: 0, total: 0 })
    }
  }

  // ─── Publish Report Cards ─────────────────────────────────────────────────
  const handlePublishReportCards = async () => {
    const gen = students.filter(s => s.reportCardStatus === 'generated')
    if (gen.length === 0) { 
      toast.warning('No generated report cards to publish.') 
      return 
    }
    
    setPublishing(true)
    try {
      const termMap: Record<string, string> = {
        'first': 'First',
        'second': 'Second',
        'third': 'Third'
      }
      const dbTerm = termMap[selectedTerm] || 'First'

      const { error } = await supabase
        .from('report_cards')
        .update({ 
          status: 'published', 
          published_at: new Date().toISOString() 
        })
        .in('student_id', gen.map(s => s.id))
        .eq('term', dbTerm)
        .eq('academic_year', selectedYear)
        .eq('status', 'generated')
      
      if (error) throw error
      
      toast.success(`Published ${gen.length} report cards!`)
      await loadBroadSheet()
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Failed to publish report cards')
    } finally {
      setPublishing(false)
    }
  }

  // ─── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!students.length) { toast.error('No data to export'); return }
    const headers = ['Student Name', 'Admission No', ...PRIMARY_SUBJECTS.map(s => s.name), 'Total', 'Average', 'Remark', 'Status']
    const rows = students.map(s => [
      s.name, 
      s.admission_number,
      ...PRIMARY_SUBJECTS.map(sub => {
        const sc = s.subjectMap[sub.name]; 
        return sc && sc.total > 0 ? `${sc.total}(${sc.remark})` : '—' 
      }), 
      s.totalScore, 
      `${s.averageScore}%`, 
      s.overallRemark, 
      s.reportCardStatus || 'None'
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `BroadSheet_${selectedClass}_${selectedTerm}_${selectedYear}.csv`
    a.click()
    toast.success('Exported!')
  }

  // ─── View Report Card ─────────────────────────────────────────────────────
  const handleViewReportCard = async (student: StudentRecord) => {
    if (student.reportCardId) {
      router.push(`/admin/report-cards/${student.reportCardId}/view`)
    } else {
      toast.info('No report card generated for this student yet.')
    }
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const ready = students.filter(s => s.meetsMinimum && s.hasAllSubjects)
    const generated = students.filter(s => s.reportCardStatus === 'generated')
    const published = students.filter(s => s.reportCardStatus === 'published')
    const avgs = ready.map(s => s.averageScore).filter(a => a > 0)
    return {
      total: students.length,
      complete: students.filter(s => s.hasAllSubjects).length,
      readyForReport: ready.length,
      generated: generated.length,
      published: published.length,
      incomplete: students.filter(s => !s.meetsMinimum).length,
      classAvg: avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : 0,
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

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isLoadingTerm || (loading && students.length === 0 && !loadError)) {
    return (
      <>
        <LoadingState type="initial" />
        <Footer />
      </>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-2xl bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Failed to Load Data</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">There was an error loading the broad sheet data.</p>
          <Button onClick={loadBroadSheet} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 min-h-screen print:bg-white">
      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-4 max-w-[1800px] mx-auto">

        {/* ── Alert banner ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {newScoreAlert && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="no-print flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{newScoreAlert}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setNewScoreAlert(null); loadBroadSheet() }}
                className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 flex-shrink-0">
                Refresh <RefreshCw className="h-3 w-3 ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="no-print flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-2 transition-colors">
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Broad Sheet
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {CLASSES.find(c => c.id === selectedClass)?.name || 'Select Class'} · {selectedTerm} Term · {selectedYear}
            </p>
            {lastRefreshed && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExportCSV} className="h-8 text-xs gap-1.5">
              <FileDown className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()} className="h-8 text-xs gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button size="sm" variant="ghost" onClick={loadBroadSheet} disabled={loading} className="h-8 text-xs gap-1.5">
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
            </Button>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="no-print grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard 
            label="Total Students" 
            value={stats.total} 
            icon={Users} 
            accent="bg-slate-500"
            loading={loading && students.length === 0}
          />
          <StatCard 
            label="All Subjects Submitted" 
            value={stats.complete} 
            icon={CheckCircle2} 
            accent="bg-emerald-500"
            loading={loading && students.length === 0}
          />
          <StatCard 
            label="Ready for Report (20+ Subjects)" 
            value={stats.readyForReport} 
            icon={FileText} 
            accent="bg-violet-500"
            loading={loading && students.length === 0}
          />
          <StatCard 
            label="Generated" 
            value={stats.generated} 
            icon={FileText} 
            accent="bg-amber-500" 
            sub="not yet visible"
            loading={loading && students.length === 0}
          />
          <StatCard 
            label="Published" 
            value={stats.published} 
            icon={Send} 
            accent="bg-teal-500" 
            sub="visible to students"
            loading={loading && students.length === 0}
          />
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <Card className="no-print border-0 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-9 text-sm bg-slate-50 dark:bg-slate-800">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="h-9 text-sm bg-slate-50 dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Term</SelectItem>
                    <SelectItem value="second">Second Term</SelectItem>
                    <SelectItem value="third">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Session</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="h-9 text-sm bg-slate-50 dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - 5 + i
                      return `${year}/${year + 1}`
                    }).map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input placeholder="Search by name or admission number..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-sm bg-slate-50 dark:bg-slate-800" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button onClick={handleGenerateReportCards} disabled={generating || publishing || stats.readyForReport === 0}
                className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm gap-2 h-9">
                {generating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating… {genProgress.current}/{genProgress.total}</>
                  : <><Sparkles className="h-4 w-4" /> Generate Reports</>}
              </Button>

              {stats.generated > 0 && (
                <Button onClick={handlePublishReportCards} disabled={generating || publishing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2 h-9">
                  {publishing
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
                    : <><Send className="h-4 w-4" /> Publish</>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900 overflow-hidden print:shadow-none">
          <div className="no-print flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Students</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                {displayedStudents.length}
              </span>
            </div>
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refreshing…
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {loading && students.length > 0 ? (
              <LoadingState type="refresh" />
            ) : (
              <table className="w-full border-collapse text-xs min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] min-w-[160px]">
                      Student
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] min-w-[90px]">
                      Admission No
                    </th>
                    {PRIMARY_SUBJECTS.map(subject => (
                      <th key={subject.id} className="px-2 py-3 text-center font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] whitespace-nowrap min-w-[56px]">
                        <span className="block">{SUBJECT_DISPLAY_NAMES[subject.name] || subject.name}</span>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] min-w-[50px]">Total</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] min-w-[50px]">Avg</th>
                    <th className="px-3 py-3 text-center font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] min-w-[50px]">Remark</th>
                    <th className="no-print px-3 py-3 text-center font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] min-w-[80px]">Report</th>
                    <th className="no-print px-3 py-3 text-center font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px] min-w-[60px]">View</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={PRIMARY_SUBJECTS.length + 7} className="text-center py-16">
                        <div className="inline-flex p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No students found</p>
                        {searchQuery && (
                          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    displayedStudents.map((student, idx) => (
                      <tr key={student.id}
                        className={cn(
                          'border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40',
                          idx % 2 !== 0 && 'bg-slate-50/30 dark:bg-slate-800/10',
                          !student.meetsMinimum && 'bg-amber-50/40 dark:bg-amber-950/10',
                        )}>
                        <td className="sticky left-0 z-10 bg-inherit px-4 py-3">
                          <div>
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug">{student.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{student.vin_id}</p>
                            {!student.hasAllSubjects && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full mt-0.5">
                                <AlertTriangle className="h-2.5 w-2.5" /> {student.completedSubjects}/{student.totalSubjects}
                              </span>
                            )}
                            {student.completedSubjects >= 20 && student.hasAllSubjects && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full mt-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Ready
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{student.admission_number}</td>

                        {PRIMARY_SUBJECTS.map(subject => {
                          const score = student.subjectMap[subject.name]
                          return (
                            <td key={subject.id} className="px-2 py-3 text-center">
                              {score && score.total > 0 ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="font-bold text-xs text-slate-800 dark:text-slate-100">{score.total}</span>
                                  <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full', getRemarkColor(score.remark))}>
                                    {score.remark}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                              )}
                            </td>
                          )
                        })}

                        <td className="px-3 py-3 text-center font-bold text-sm text-slate-800 dark:text-slate-100">{student.totalScore || '—'}</td>
                        <td className="px-3 py-3 text-center font-semibold text-sm text-slate-700 dark:text-slate-200">
                          {student.averageScore > 0 ? `${student.averageScore}%` : '—'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {student.overallRemark !== 'Not graded' ? (
                            <span className={cn('text-xs font-bold px-2 py-1 rounded-full', getRemarkColor(student.overallRemark))}>
                              {student.overallRemark}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>

                        <td className="no-print px-3 py-3 text-center">
                          <ReportStatusChip status={student.reportCardStatus} />
                        </td>

                        <td className="no-print px-3 py-3 text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewReportCard(student)}
                            className="h-7 px-2.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 gap-1"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <Footer />

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