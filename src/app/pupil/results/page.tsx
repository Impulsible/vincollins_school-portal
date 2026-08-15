/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
// app/pupil/results/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Loader2, Award, Search, TrendingUp,
  Target, Trophy, ChevronRight, GraduationCap, BarChart3, Filter,
  ArrowUpDown, RefreshCw, Home, Activity,
  Sparkles, ArrowUpRight, ChevronDown, Calendar, BookOpen,
  CheckCircle2, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────
interface SubjectScore {
  subject: string
  ca_score: number
  exam_score: number
  total_score: number
  remark: string
  term: string
  academic_year: string
  class: string
  teacher_name: string
}

interface SubjectPerformance {
  subject: string
  averageScore: number
  caAverage: number
  examAverage: number
  totalScore: number
  remark: string
  term: string
  academic_year: string
}

// ─── Helper Functions ─────────────────────────────────
const getInitials = (name: string) => {
  if (!name) return 'S'
  const p = name.split(' ')
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[1][0]).toUpperCase()
}

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

// ─── Term & Session ──────────────────────────────────
const TERMS = [
  { value: 'First', label: 'First Term' },
  { value: 'Second', label: 'Second Term' },
  { value: 'Third', label: 'Third Term' }
]

const getTermLabel = (value: string) => {
  const found = TERMS.find(t => t.value === value)
  return found ? found.label : value
}

const getAvailableSessions = (currentSession: string): string[] => {
  if (!currentSession) return ['2025/2026', '2026/2027']
  const year = parseInt(currentSession.split('/')[0])
  return [`${year - 1}/${year}`, `${year}/${year + 1}`, `${year + 1}/${year + 2}`]
}

// ─── Fetch current term ──────────────────────────────
async function fetchCurrentTermAndSession(): Promise<{ term: string; session: string }> {
  try {
    const { data: settings, error } = await supabase
      .from('school_settings')
      .select('current_term, current_session')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching term settings:', error)
      return { term: 'First', session: '2026/2027' }
    }

    if (settings) {
      return {
        term: settings.current_term || 'First',
        session: settings.current_session || '2026/2027'
      }
    }
    
    return { term: 'First', session: '2026/2027' }
  } catch (error) {
    console.error('Error fetching current term:', error)
    return { term: 'First', session: '2026/2027' }
  }
}

// ═══════════════════════════════════════════════════════
// STAT TILE
// ═══════════════════════════════════════════════════════
function StatTile({
  label, value, icon: Icon, tone, subtitle, delay = 0, trend,
}: {
  label: string
  value: string | number
  icon: any
  tone: 'blue' | 'emerald' | 'red' | 'amber' | 'purple' | 'slate'
  subtitle?: string
  delay?: number
  trend?: 'up' | 'down' | null
}) {
  const tones = {
    blue: { iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valueColor: 'text-slate-900', accent: 'bg-blue-500' },
    emerald: { iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700', accent: 'bg-emerald-500' },
    red: { iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700', accent: 'bg-red-500' },
    amber: { iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valueColor: 'text-amber-700', accent: 'bg-amber-500' },
    purple: { iconBg: 'bg-purple-100', iconColor: 'text-purple-600', valueColor: 'text-purple-700', accent: 'bg-purple-500' },
    slate: { iconBg: 'bg-slate-100', iconColor: 'text-slate-500', valueColor: 'text-slate-700', accent: 'bg-slate-400' },
  }
  const t = tones[tone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="h-full"
    >
      <div className="relative bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden group h-full">
        <div className={cn('h-0.5 w-full', t.accent, 'opacity-60 group-hover:opacity-100 transition-opacity')} />
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-1.5 mb-1.5">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider leading-tight flex-1 min-w-0 truncate">
              {label}
            </p>
            <div className={cn(
              'h-6 w-6 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center shrink-0',
              'group-hover:scale-110 transition-transform duration-200',
              t.iconBg
            )}>
              <Icon className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5', t.iconColor)} />
            </div>
          </div>
          <p className={cn('text-lg sm:text-xl lg:text-2xl font-black leading-none tracking-tight', t.valueColor)}>
            {value}
          </p>
          {subtitle && (
            <div className="flex items-center gap-0.5 mt-1">
              {trend === 'up' && <ArrowUpRight className="h-2.5 w-2.5 text-emerald-500 shrink-0" />}
              <p className="text-[10px] text-slate-500 font-semibold truncate">{subtitle}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// SUBJECT TILE
// ═══════════════════════════════════════════════════════
function SubjectTile({
  perf, index, onClick,
}: {
  perf: SubjectPerformance
  index: number
  onClick?: () => void
}) {
  const remarkColor = getRemarkColor(perf.remark)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.04, duration: 0.3 }}
      onClick={onClick}
      className="group cursor-pointer h-full"
    >
      <div className="relative bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200 overflow-hidden h-full">
        <div className={cn('h-1 w-full', remarkColor)} />
        <div className="p-3">
          <div className="flex items-start justify-between gap-1.5 mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs sm:text-sm text-slate-900 leading-tight line-clamp-2 break-words">
                {perf.subject}
              </p>
              <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap', remarkColor)}>
                {perf.remark}
              </span>
            </div>
            <div className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center border-2 shadow-sm bg-slate-50 border-slate-200">
              <span className="text-[10px] font-black leading-none text-slate-700">
                {perf.averageScore.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="relative w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${perf.averageScore}%` }}
              transition={{ delay: 0.3 + index * 0.04, duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full', remarkColor.replace('bg-', 'bg-').replace('text-', 'bg-').replace('dark:bg-', 'bg-'))}
            />
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold">
            <div className="flex items-center justify-between bg-emerald-50 rounded px-1.5 py-0.5">
              <span className="text-emerald-600">CA</span>
              <span className="text-emerald-700">{perf.caAverage.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between bg-blue-50 rounded px-1.5 py-0.5">
              <span className="text-blue-600">Exam</span>
              <span className="text-blue-700">{perf.examAverage.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// RESULT ROW
// ═══════════════════════════════════════════════════════
function ResultRow({ score, index }: { score: SubjectScore; index: number }) {
  const remarkColor = getRemarkColor(score.remark)

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <div className="relative bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-default group overflow-hidden">
        <div className={cn('w-1 absolute inset-y-0 left-0', remarkColor)} />

        <div className="flex-1 p-3 sm:p-4 pl-4 sm:pl-5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                {score.subject}
              </h3>
              <div className="flex items-center gap-1 flex-wrap mt-0.5">
                <span className={cn('text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap', remarkColor)}>
                  {score.remark}
                </span>
                {score.term && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 whitespace-nowrap">
                    {getTermLabel(score.term)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CA /40</p>
                <p className="text-sm sm:text-base font-black text-emerald-600">{score.ca_score}</p>
              </div>

              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Exam /60</p>
                <p className="text-sm sm:text-base font-black text-blue-600">{score.exam_score}</p>
              </div>

              <div className="w-px h-8 bg-slate-200" />

              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total /100</p>
                <p className="text-base sm:text-lg font-black text-slate-800">{score.total_score}</p>
              </div>
            </div>
          </div>

          <div className="relative w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score.total_score}%` }}
              transition={{ delay: 0.2 + index * 0.03, duration: 0.6, ease: 'easeOut' }}
              className={cn('h-full rounded-full', remarkColor.replace('bg-', 'bg-').replace('text-', 'bg-').replace('dark:bg-', 'bg-'))}
            />
          </div>

          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 flex-wrap mt-1">
            <BookOpen className="h-2.5 w-2.5 shrink-0" />
            <span>{score.class}</span>
            <span className="text-slate-300">·</span>
            <span>Teacher: {score.teacher_name}</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════
export default function PupilResultsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'highest' | 'lowest' | 'a-z' | 'z-a'>('highest')

  const [scores, setScores] = useState<SubjectScore[]>([])
  const [filteredScores, setFilteredScores] = useState<SubjectScore[]>([])
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([])
  const [showAllSubjects, setShowAllSubjects] = useState(false)

  const [currentTerm, setCurrentTerm] = useState('First')
  const [currentSession, setCurrentSession] = useState('2026/2027')
  const [isLoadingTerm, setIsLoadingTerm] = useState(true)
  const [selectedTerm, setSelectedTerm] = useState('First')
  const [selectedSession, setSelectedSession] = useState('2026/2027')
  const [availableSessions, setAvailableSessions] = useState<string[]>(['2025/2026', '2026/2027'])

  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalMarks: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 100,
    caAverage: 0,
    examAverage: 0,
  })

  // ─── Fetch current term ──────────────────────────────
  useEffect(() => {
    const loadTerm = async () => {
      const { term, session } = await fetchCurrentTermAndSession()
      setCurrentTerm(term)
      setCurrentSession(session)
      setSelectedTerm(term)
      setSelectedSession(session)
      setAvailableSessions(getAvailableSessions(session))
      setIsLoadingTerm(false)
    }
    loadTerm()
  }, [])

  // ─── Load Results ────────────────────────────────────
  const loadResults = useCallback(async (showToast = false) => {
    if (!user?.id) return
    if (!selectedTerm || !selectedSession) return

    if (showToast) setRefreshing(true)
    else setLoading(true)

    try {
      console.log('📊 [PupilResults] Fetching scores for:', user.id, selectedTerm, selectedSession)

      const { data: scoresData, error } = await supabase
        .from('primary_scores')
        .select('*')
        .eq('student_id', user.id)
        .eq('term', selectedTerm)
        .eq('academic_year', selectedSession)

      if (error) {
        console.error('Error fetching scores:', error)
        setScores([])
        setFilteredScores([])
        setSubjectPerformance([])
        setAvailableSubjects([])
        setStats({ totalSubjects: 0, totalMarks: 0, averageScore: 0, highestScore: 0, lowestScore: 100, caAverage: 0, examAverage: 0 })
        setLoading(false)
        setRefreshing(false)
        return
      }

      console.log('✅ [PupilResults] Found scores:', scoresData?.length || 0)

      if (!scoresData || scoresData.length === 0) {
        setScores([])
        setFilteredScores([])
        setSubjectPerformance([])
        setAvailableSubjects([])
        setStats({ totalSubjects: 0, totalMarks: 0, averageScore: 0, highestScore: 0, lowestScore: 100, caAverage: 0, examAverage: 0 })
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Map to SubjectScore
      const mappedScores: SubjectScore[] = scoresData.map((s: any) => ({
        subject: s.subject,
        ca_score: s.ca_score || 0,
        exam_score: s.exam_score || 0,
        total_score: s.total_score || 0,
        remark: s.remark || 'Not graded',
        term: s.term,
        academic_year: s.academic_year,
        class: s.class,
        teacher_name: s.teacher_name || 'Unknown',
      }))

      // Calculate stats
      const totalSubjects = mappedScores.length
      const totalMarks = mappedScores.reduce((sum, s) => sum + s.total_score, 0)
      const averageScore = totalSubjects > 0 ? Math.round((totalMarks / totalSubjects) * 100) / 100 : 0
      const highestScore = totalSubjects > 0 ? Math.max(...mappedScores.map(s => s.total_score)) : 0
      const lowestScore = totalSubjects > 0 ? Math.min(...mappedScores.map(s => s.total_score)) : 0
      const caAverage = totalSubjects > 0 ? Math.round((mappedScores.reduce((sum, s) => sum + s.ca_score, 0) / totalSubjects) * 100) / 100 : 0
      const examAverage = totalSubjects > 0 ? Math.round((mappedScores.reduce((sum, s) => sum + s.exam_score, 0) / totalSubjects) * 100) / 100 : 0

      // Calculate subject performance
      const subjectMap: Record<string, { total: number; count: number; caTotal: number; examTotal: number; remark: string }> = {}
      mappedScores.forEach(s => {
        if (!subjectMap[s.subject]) {
          subjectMap[s.subject] = { total: 0, count: 0, caTotal: 0, examTotal: 0, remark: s.remark }
        }
        subjectMap[s.subject].total += s.total_score
        subjectMap[s.subject].count += 1
        subjectMap[s.subject].caTotal += s.ca_score
        subjectMap[s.subject].examTotal += s.exam_score
        subjectMap[s.subject].remark = s.remark
      })

      const performance: SubjectPerformance[] = Object.entries(subjectMap).map(([subject, data]) => ({
        subject,
        averageScore: Math.round((data.total / data.count) * 100) / 100,
        caAverage: Math.round(((data.caTotal / data.count) / 40) * 100) / 100,
        examAverage: Math.round(((data.examTotal / data.count) / 60) * 100) / 100,
        totalScore: data.total,
        remark: data.remark,
        term: selectedTerm,
        academic_year: selectedSession,
      })).sort((a, b) => b.averageScore - a.averageScore)

      setScores(mappedScores)
      setFilteredScores(mappedScores)
      setAvailableSubjects([...new Set(mappedScores.map(s => s.subject))].sort())
      setSubjectPerformance(performance)
      setStats({
        totalSubjects,
        totalMarks,
        averageScore,
        highestScore,
        lowestScore: lowestScore === 100 ? 0 : lowestScore,
        caAverage,
        examAverage,
      })

      if (showToast) toast.success('Results refreshed!')
    } catch (error) {
      console.error('Error loading results:', error)
      toast.error('Failed to load results')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, selectedTerm, selectedSession])

  // ─── Load when dependencies change ──────────────────
  useEffect(() => {
    if (!authLoading && user && selectedTerm && selectedSession && !isLoadingTerm) {
      loadResults()
    }
  }, [authLoading, user, selectedTerm, selectedSession, isLoadingTerm, loadResults])

  // ─── Filter results ─────────────────────────────────
  useEffect(() => {
    let f = [...scores]
    if (subjectFilter !== 'all') f = f.filter((s) => s.subject === subjectFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      f = f.filter((s) => s.subject.toLowerCase().includes(q))
    }
    switch (sortOrder) {
      case 'highest': f.sort((a, b) => b.total_score - a.total_score); break
      case 'lowest': f.sort((a, b) => a.total_score - b.total_score); break
      case 'a-z': f.sort((a, b) => a.subject.localeCompare(b.subject)); break
      case 'z-a': f.sort((a, b) => b.subject.localeCompare(a.subject)); break
    }
    setFilteredScores(f)
  }, [scores, subjectFilter, searchQuery, sortOrder])

  // ─── Loading state ──────────────────────────────────
  if (authLoading || loading || isLoadingTerm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="relative w-fit mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25">
              <Loader2 className="h-7 w-7 text-white animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Loading your results</p>
            <p className="text-xs text-slate-500 mt-0.5">Just a moment...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      {/* ─── Header ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex items-center gap-1.5 text-sm text-slate-400 min-w-0">
          <Link href="/pupil" className="hover:text-slate-700 flex items-center gap-1 transition-colors shrink-0">
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Dashboard</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-slate-800 font-bold text-xs sm:text-sm truncate">My Results</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="h-8 text-xs border-slate-200 rounded-lg w-[110px] font-semibold">
              <Calendar className="h-3 w-3 text-slate-400 mr-1 shrink-0" />
              <SelectValue placeholder="Term" />
            </SelectTrigger>
            <SelectContent>
              {TERMS.map(term => (
                <SelectItem key={term.value} value={term.value} className="text-xs">
                  {term.label}
                  {term.value === currentTerm && ' (current)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="h-8 text-xs border-slate-200 rounded-lg w-[110px] font-semibold">
              <Calendar className="h-3 w-3 text-slate-400 mr-1 shrink-0" />
              <SelectValue placeholder="Session" />
            </SelectTrigger>
            <SelectContent>
              {availableSessions.map(session => (
                <SelectItem key={session} value={session} className="text-xs">
                  {session}
                  {session === currentSession && ' (current)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadResults(true)}
            className="h-8 text-xs gap-1 border-slate-200 hover:border-slate-300 rounded-lg font-semibold px-2 sm:px-3 shrink-0"
          >
            <RefreshCw className={cn('h-3 w-3', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/pupil')}
            className="h-8 text-xs gap-1 border-slate-200 rounded-lg font-semibold px-2 sm:px-3 shrink-0"
          >
            <ArrowLeft className="h-3 w-3" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>
      </motion.div>

      {/* ─── Current Term Info ─────────────────── */}
      {currentTerm && currentSession && (
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <Calendar className="h-3 w-3 text-slate-400" />
          <span className="font-medium">Current:</span>
          <span className="font-semibold text-slate-700">{getTermLabel(currentTerm)}</span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-700">{currentSession}</span>
          {selectedTerm !== currentTerm && (
            <span className="ml-2 text-amber-600 font-medium">
              (Viewing {getTermLabel(selectedTerm)})
            </span>
          )}
        </div>
      )}

      {/* ─── Hero Banner ───────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-5 sm:mb-6">
        <div
          className="relative rounded-2xl overflow-hidden shadow-xl isolate"
          style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', contain: 'paint' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="relative shrink-0">
                  <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-lg sm:text-2xl font-bold ring-2 sm:ring-4 ring-emerald-400/40 shadow-xl">
                    {user?.full_name ? getInitials(user.full_name) : 'P'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-300 shrink-0" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-200/80 truncate">
                      {getTermLabel(selectedTerm)} Results
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                    {user?.first_name || user?.full_name?.split(' ')[0] || 'Hello'}&apos;s{' '}
                    <span className="text-emerald-300">Results</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                    {user?.class && (
                      <span className="flex items-center gap-1 text-xs text-gray-300 font-medium">
                        <GraduationCap className="h-3 w-3 text-emerald-300/60 shrink-0" />
                        <span className="truncate max-w-[120px]">{user.class}</span>
                      </span>
                    )}
                    {user?.class_arm && (
                      <span className="text-xs text-gray-300 font-medium">
                        {user.class_arm}
                      </span>
                    )}
                    <span className="text-xs text-gray-300 font-medium">
                      {stats.totalSubjects} subjects
                    </span>
                  </div>
                </div>
              </div>

              {stats.totalSubjects > 0 && (
                <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 shrink-0">
                  <div className="relative rounded-xl border-2 border-slate-500/30 shadow-xl bg-slate-900/95">
                    <div className="rounded-xl px-4 sm:px-6 py-2 sm:py-3 flex flex-col items-center min-w-[90px] sm:min-w-[110px]">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/50 mb-0.5 sm:mb-1">Average</p>
                      <p className="text-3xl sm:text-4xl font-black leading-none text-emerald-400">{stats.averageScore.toFixed(2)}%</p>
                      <p className="text-[10px] sm:text-xs font-bold mt-0.5 sm:mt-1 text-white/60">
                        {stats.totalSubjects} subjects
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {stats.totalSubjects > 0 && (
              <div className="mt-4 pt-4 border-t border-white/15">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">CA Average</p>
                    <p className="text-lg sm:text-xl font-black text-emerald-300">{stats.caAverage.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Exam Average</p>
                    <p className="text-lg sm:text-xl font-black text-blue-300">{stats.examAverage.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Total Marks</p>
                    <p className="text-lg sm:text-xl font-black text-amber-300">{stats.totalMarks}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Grid ────────────────────────── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 mb-5 sm:mb-6">
        <StatTile label="Subjects" value={stats.totalSubjects} icon={BookOpen} tone="blue" delay={0.05} />
        <StatTile label="Total Marks" value={stats.totalMarks} icon={Target} tone="amber" delay={0.08} />
        <StatTile label="Average" value={`${stats.averageScore.toFixed(2)}%`} icon={TrendingUp} tone="emerald" delay={0.11} />
        <StatTile label="Highest" value={`${stats.highestScore}%`} icon={Trophy} tone="purple" delay={0.14} />
        <StatTile label="Lowest" value={`${stats.lowestScore}%`} icon={Activity} tone="slate" delay={0.17} />
        <StatTile label="CA Avg" value={`${stats.caAverage.toFixed(2)}%`} icon={CheckCircle2} tone="emerald" delay={0.2} />
      </div>

      {/* ─── Subject Performance ────────────────── */}
      {subjectPerformance.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">Subject Performance</h2>
              <span className="text-xs text-slate-400 font-medium shrink-0">({subjectPerformance.length})</span>
            </div>
            {subjectPerformance.length > 8 && (
              <Button variant="ghost" size="sm" onClick={() => setShowAllSubjects(!showAllSubjects)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 gap-1 h-7 px-2 sm:px-3 shrink-0">
                {showAllSubjects ? <>Less <ChevronDown className="h-3 w-3 rotate-180" /></> : <>+{subjectPerformance.length - 8} more <ChevronDown className="h-3 w-3" /></>}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {(showAllSubjects ? subjectPerformance : subjectPerformance.slice(0, 8)).map((perf, i) => (
              <SubjectTile
                key={perf.subject}
                perf={perf}
                index={i}
                onClick={() => {
                  setSubjectFilter(perf.subject)
                  setShowAllSubjects(false)
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Filters ────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mb-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Search subjects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-9 text-sm bg-white border-slate-200 rounded-lg font-medium w-full" />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[100px] sm:w-[130px] h-9 text-xs bg-white border-slate-200 rounded-lg font-semibold shrink-0">
              <Filter className="h-3 w-3 text-slate-400 shrink-0" />
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
            <SelectTrigger className="w-[90px] sm:w-[110px] h-9 text-xs bg-white border-slate-200 rounded-lg font-semibold shrink-0">
              <ArrowUpDown className="h-3 w-3 text-slate-400 shrink-0" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest">Highest</SelectItem>
              <SelectItem value="lowest">Lowest</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
              <SelectItem value="z-a">Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* ─── Results List ───────────────────────── */}
      <AnimatePresence mode="wait">
        {filteredScores.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-12 sm:py-14 text-center px-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                <Award className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-800 mb-2">
                {scores.length === 0 ? 'No results yet' : 'No matching results'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                {scores.length === 0
                  ? 'Your scores will appear here once they are published.'
                  : 'Try adjusting your filters or search query'}
              </p>
              {scores.length > 0 && (
                <Button variant="outline" size="sm" className="mt-4 text-xs h-8 rounded-lg font-semibold" onClick={() => { setSearchQuery(''); setSubjectFilter('all') }}>
                  Clear all filters
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 sm:space-y-2.5">
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-xs text-slate-500 font-semibold">
                <span className="font-black text-slate-800">{filteredScores.length}</span> subject{filteredScores.length !== 1 ? 's' : ''}
              </p>
            </div>
            {filteredScores.map((score, i) => (
              <ResultRow key={`${score.subject}-${i}`} score={score} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}