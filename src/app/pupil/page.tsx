/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { OverviewTab } from '@/components/pupil/OverviewTab'
import { AssignmentsTab } from '@/components/pupil/AssignmentsTab'
import { NotesTab } from '@/components/pupil/NotesTab'
import { ReportCardTab } from '@/components/pupil/ReportCardTab'
import { ClassmatesTab } from '@/components/pupil/ClassmatesTab'
import { PupilBanner } from '@/components/pupil/banner/PupilBanner'
import { PupilLoadingState } from '@/components/pupil/LoadingState'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  AlertTriangle,
  Loader2,
  LayoutDashboard,
  BookOpen,
  NotebookPen,
  Award,
  Users,
  Grid3x3,
  List,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
interface PupilProfile {
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  class?: string
  class_arm?: string
  phone?: string
  address?: string
  guardian_name?: string
  guardian_phone?: string
  date_of_birth?: string
  gender?: string
  photo_url?: string
  admission_number?: string
  admission_year?: number
}

interface SettingsRow {
  current_term: string
  current_session: string
}

interface ProfileRow {
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  class?: string
  class_arm?: string
  phone?: string
  address?: string
  guardian_name?: string
  guardian_phone?: string
  date_of_birth?: string
  gender?: string
  photo_url?: string
  avatar_url?: string
  admission_number?: string
  admission_year?: number
  role?: string
  first_name?: string
}

interface Assignment {
  id: string
  title: string
  subject: string
  description?: string
  due_date?: string
  status: 'pending' | 'completed' | 'submitted'
  score?: number
}

interface RawAssignment {
  id: string
  title: string
  subject: string
  description?: string
  due_date?: string
  status: string
  score?: number
}

interface Note {
  id: string
  title: string
  subject?: string
  content?: string
  created_at: string
}

interface ReportCard {
  id: string
  term: string
  session_year: string
  status: string
  subjects?: Array<{ name: string; grade: string }>
  average?: number
  grade?: string
  teacher_comment?: string
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
  gender?: string
}

interface DashboardStats {
  assignments: Assignment[]
  recentAssignments: Assignment[]
  notes: Note[]
  recentNotes: Note[]
  classmates: Classmate[]
  reportCards: ReportCard[]
  recentReportCards: ReportCard[]
  pendingAssignments: number
  completedAssignments: number
  totalAssignments: number
  totalNotes: number
}

interface DashboardData {
  stats: DashboardStats
  termProgress: Record<string, unknown> | null
  reportCardStatus: string | null
  subjectStats: {
    completedSubjects: number
    totalSubjects: number
    averagePercentage: number
    totalMarksObtained: number
    totalMarksPossible: number
    subjectScores: Record<string, { ca: number; exam: number; total: number }>
  }
}

function isValidAssignmentStatus(status: string): status is 'pending' | 'completed' | 'submitted' {
  return status === 'pending' || status === 'completed' || status === 'submitted'
}

function convertToAssignment(raw: RawAssignment): Assignment {
  const status = raw.status || 'pending'
  return {
    ...raw,
    status: isValidAssignmentStatus(status) ? status : 'pending',
  }
}

const LOADING_TIMEOUT_MS = 10000

const TOTAL_SUBJECTS = 22

const PRIMARY_SUBJECTS = [
  'English', 'Mathematics', 'Basic Science', 'Social Studies', 'Phonics',
  'Yoruba', 'Civic Education', 'Creative Arts', 'Agriculture',
  'Computer Education', 'Christian Religious Studies', 'French',
  'Quantitative Reasoning', 'Verbal Reasoning', 'Music', 'Handwriting',
  'Literature', 'Vocational Aptitude', 'History', 'Security Education',
  'Home Economics', 'Physical and Health Education',
]

const DEFAULT_STATS: DashboardStats = {
  assignments: [],
  recentAssignments: [],
  notes: [],
  recentNotes: [],
  classmates: [],
  reportCards: [],
  recentReportCards: [],
  pendingAssignments: 0,
  completedAssignments: 0,
  totalAssignments: 0,
  totalNotes: 0,
}

// ── Tab Configuration ──────────────────────────────────────────────────────────
type TabId = 'overview' | 'assignments' | 'notes' | 'report-cards' | 'classmates'

interface TabConfig {
  id: TabId
  label: string
  shortLabel: string
  icon: React.ElementType
  count?: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// Tab Navigation
// ═══════════════════════════════════════════════════════════════════════════════
function TabNavigation({
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  counts,
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  counts: Record<TabId, number | undefined>
}) {
  const tabs: TabConfig[] = [
    { id: 'overview', label: 'Overview', shortLabel: 'Home', icon: LayoutDashboard },
    { id: 'assignments', label: 'Assignments', shortLabel: 'Tasks', icon: BookOpen, count: counts.assignments },
    { id: 'notes', label: 'Notes', shortLabel: 'Notes', icon: NotebookPen, count: counts.notes },
    { id: 'report-cards', label: 'Reports', shortLabel: 'Reports', icon: Award, count: counts['report-cards'] },
    { id: 'classmates', label: 'Classmates', shortLabel: 'Class', icon: Users, count: counts.classmates },
  ]

  const showViewToggle = ['assignments', 'notes', 'report-cards', 'classmates'].includes(activeTab)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const activeEl = scrollRef.current.querySelector<HTMLButtonElement>(`[data-tab-id="${activeTab}"]`)
    activeEl?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeTab])

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        ref={scrollRef}
        className="flex-1 min-w-0 relative bg-white rounded-2xl border border-slate-200/70 shadow-sm p-1 overflow-x-auto scrollbar-none"
      >
        <div className="flex items-center gap-0.5 min-w-max relative">
          {tabs.map(({ id, label, shortLabel, icon: Icon, count }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                data-tab-id={id}
                type="button"
                onClick={() => onTabChange(id)}
                className={cn(
                  'relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-9 sm:h-10 rounded-xl transition-colors z-10 shrink-0 whitespace-nowrap',
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}

                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 shrink-0" />
                <span className="relative z-10 text-xs sm:text-sm font-semibold">
                  <span className="sm:hidden">{shortLabel}</span>
                  <span className="hidden sm:inline">{label}</span>
                </span>

                {typeof count === 'number' && count > 0 && (
                  <span
                    className={cn(
                      'relative z-10 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors',
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {showViewToggle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 'auto' }}
            exit={{ opacity: 0, scale: 0.9, width: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden sm:flex bg-white rounded-2xl border border-slate-200/70 shadow-sm p-1 shrink-0"
          >
            {(['grid', 'list'] as const).map((mode) => {
              const isActive = viewMode === mode
              const Icon = mode === 'grid' ? Grid3x3 : List
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onViewModeChange(mode)}
                  className={cn(
                    'relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors z-10'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-view-pill"
                      className="absolute inset-0 rounded-xl bg-slate-800 shadow-sm"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'w-4 h-4 relative z-10 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400'
                    )}
                  />
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Loading Timeout Error ────────────────────────────────────────────────────
function LoadingTimeoutError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
        </div>
      </motion.div>
      <h3 className="text-2xl font-bold text-slate-700 mb-2">Taking too long</h3>
      <p className="text-slate-500 text-center mb-6">
        We&apos;re having trouble loading your dashboard. Please try again.
      </p>
      <Button
        onClick={onRetry}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function PupilDashboardPage() {
  const router = useRouter()
  const { user: contextUser, loading: authLoading, isAuthenticated, logout } = useUser()

  const [activeSection, setActiveSection] = useState<TabId>('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [profile, setProfile] = useState<PupilProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const [currentTerm, setCurrentTerm] = useState('')
  const [currentSession, setCurrentSession] = useState('')
  const [isLoadingTerm, setIsLoadingTerm] = useState(true)

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  const [loading, setLoading] = useState(true)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dataFetchedRef = useRef(false)
  const profileFetchedRef = useRef(false)

  // ─── Fetch Current Term ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadTerm = async () => {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('current_term, current_session')
          .maybeSingle() as any

        if (!error && data) {
          const settings = data as SettingsRow
          if (settings.current_term && settings.current_session) {
            setCurrentTerm(settings.current_term)
            setCurrentSession(settings.current_session)
          }
        }
      } catch (error) {
        console.error('Error fetching current term:', error)
      } finally {
        setIsLoadingTerm(false)
      }
    }
    loadTerm()
  }, [])

  // ─── Fetch Profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (profileFetchedRef.current || !contextUser?.id) return

    const fetchProfile = async () => {
      try {
        setProfileLoading(true)

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', contextUser.id)
          .single() as any

        // ✅ FIX: Handle error properly
        if (error) {
          // Check if error is "no rows returned" (PGRST116)
          if (error.code === 'PGRST116') {
            console.log('ℹ️ [Dashboard] No profile found for user, using user data...')
            setProfile(null)
          } else {
            console.error('❌ [Dashboard] Error fetching profile:', error.message || error)
            setProfile(null)
          }
          setProfileLoading(false)
          return
        }

        if (data) {
          const profileData = data as ProfileRow
          setProfile({
            id: profileData.id,
            vin_id: profileData.vin_id,
            full_name: profileData.full_name || profileData.display_name || 'Pupil',
            display_name: profileData.display_name,
            email: profileData.email,
            class: profileData.class,
            class_arm: profileData.class_arm,
            phone: profileData.phone,
            address: profileData.address,
            guardian_name: profileData.guardian_name,
            guardian_phone: profileData.guardian_phone,
            date_of_birth: profileData.date_of_birth,
            gender: profileData.gender,
            photo_url: profileData.photo_url || profileData.avatar_url,
            admission_number: profileData.admission_number,
            admission_year: profileData.admission_year,
          })
          profileFetchedRef.current = true
        }
      } catch (error) {
        console.error('❌ [Dashboard] Error:', error)
        setProfile(null)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [contextUser?.id])

  // ─── Auth Check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !contextUser)) {
      router.replace('/portal')
      return
    }

    // ✅ FIX: Accept both 'student' and 'pupil' roles
    if (!authLoading && contextUser?.role?.toLowerCase() !== 'student' && contextUser?.role?.toLowerCase() !== 'pupil') {
      router.replace('/portal')
    }
  }, [authLoading, isAuthenticated, contextUser, router])

  // ─── Fetch Dashboard Data ──────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || isLoadingTerm || profileLoading) return
    if (!isAuthenticated || !contextUser?.id) return
    if (dataFetchedRef.current) return

    const fetchData = async () => {
      dataFetchedRef.current = true
      setRefreshing(true)

      loadingTimeoutRef.current = setTimeout(() => {
        if (loading) setLoadingTimeout(true)
      }, LOADING_TIMEOUT_MS)

      try {
        const userId = contextUser.id

        // ─── Fetch Classmates ──────────────────────────────────────────────
        let classmates: Classmate[] = []
        try {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('class')
            .eq('id', userId)
            .single()

          const userClass = userProfile?.class || ''

          if (userClass) {
            const { data, error } = await supabase
              .from('profiles')
              .select('id, full_name, email, photo_url, class, first_name, last_name, display_name, vin_id, gender')
              .ilike('class', userClass)
              .in('role', ['student', 'pupil'])
              .neq('id', userId)
              .order('full_name', { ascending: true })

            if (!error && data) {
              classmates = data as Classmate[]
            }
          }
        } catch (error) {
          console.log('ℹ️ Error fetching classmates:', error)
        }

        // ─── Fetch Assignments ─────────────────────────────────────────────
        let assignments: Assignment[] = []
        try {
          const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('status', 'published')
            .limit(10) as any

          if (!error && data) {
            assignments = (data as RawAssignment[]).map(convertToAssignment)
          }
        } catch {
          console.log('ℹ️ Assignments table not found, using empty data')
        }

        // ─── Fetch Notes ───────────────────────────────────────────────────
        let notes: Note[] = []
        try {
          const { data, error } = await supabase
            .from('notes')
            .select('*')
            .limit(10) as any

          if (!error && data) {
            notes = data as Note[]
          }
        } catch {
          console.log('ℹ️ Notes table not found, using empty data')
        }

        // ─── Fetch Report Cards ────────────────────────────────────────────
        let reportCards: ReportCard[] = []
        try {
          const { data, error } = await supabase
            .from('report_cards')
            .select('*')
            .eq('student_id', userId)
            .limit(10) as any

          if (!error && data) {
            reportCards = data as ReportCard[]
          }
        } catch {
          console.log('ℹ️ Report cards table not found, using empty data')
        }

        // ─── Fetch Term Progress ──────────────────────────────────────────
        let progressData: Record<string, unknown> | null = null
        try {
          const { data, error } = await supabase
            .from('student_term_progress')
            .select('*')
            .eq('student_id', userId)
            .maybeSingle() as any

          if (!error && data) {
            progressData = data as Record<string, unknown>
          }
        } catch {
          console.log('ℹ️ Term progress table not found')
        }

        // ─── ✅ Fetch Subject Scores from primary_scores ──────────────────
        let subjectStats = {
          completedSubjects: 0,
          totalSubjects: TOTAL_SUBJECTS,
          averagePercentage: 0,
          totalMarksObtained: 0,
          totalMarksPossible: TOTAL_SUBJECTS * 100,
          subjectScores: {} as Record<string, { ca: number; exam: number; total: number }>
        }

        try {
          console.log('📊 [Dashboard] Fetching subject scores for pupil:', userId)
          
          const { data: scores, error: scoresError } = await supabase
            .from('primary_scores')
            .select('subject, ca_score, exam_score, total_score')
            .eq('student_id', userId)
            .eq('term', currentTerm)
            .eq('academic_year', currentSession)

          if (!scoresError && scores) {
            console.log('✅ [Dashboard] Found scores:', scores.length)
            
            const subjectMap: Record<string, { ca: number; exam: number; total: number }> = {}
            PRIMARY_SUBJECTS.forEach(sub => {
              subjectMap[sub] = { ca: 0, exam: 0, total: 0 }
            })
            
            scores.forEach((score: any) => {
              const subject = score.subject
              if (subjectMap[subject]) {
                subjectMap[subject].ca = score.ca_score || 0
                subjectMap[subject].exam = score.exam_score || 0
                subjectMap[subject].total = score.total_score || 0
              } else {
                const match = PRIMARY_SUBJECTS.find(s => s.toLowerCase() === subject.toLowerCase())
                if (match && subjectMap[match]) {
                  subjectMap[match].ca = score.ca_score || 0
                  subjectMap[match].exam = score.exam_score || 0
                  subjectMap[match].total = score.total_score || 0
                }
              }
            })
            
            let completed = 0
            let totalMarks = 0
            
            Object.values(subjectMap).forEach(({ ca, exam, total }) => {
              if (ca > 0 && exam > 0) {
                completed++
                totalMarks += total
              }
            })
            
            const avgPercentage = completed > 0 ? Math.round((totalMarks / completed) * 100) / 100 : 0
            
            subjectStats = {
              completedSubjects: completed,
              totalSubjects: TOTAL_SUBJECTS,
              averagePercentage: avgPercentage,
              totalMarksObtained: totalMarks,
              totalMarksPossible: TOTAL_SUBJECTS * 100,
              subjectScores: subjectMap
            }
            
            console.log('📊 [Dashboard] Subject stats:', subjectStats)
          } else {
            console.log('ℹ️ No scores found or error fetching:', scoresError)
          }
        } catch (error) {
          console.error('Error fetching subject scores:', error)
        }

        const pendingAssignments = assignments.filter((a: Assignment) => a.status === 'pending').length
        const completedAssignments = assignments.filter(
          (a: Assignment) => a.status === 'completed' || a.status === 'submitted'
        ).length

        const newData: DashboardData = {
          stats: {
            assignments,
            recentAssignments: assignments.slice(0, 5),
            notes,
            recentNotes: notes.slice(0, 5),
            classmates,
            reportCards,
            recentReportCards: reportCards.slice(0, 3),
            pendingAssignments,
            completedAssignments,
            totalAssignments: assignments.length,
            totalNotes: notes.length,
          },
          termProgress: progressData,
          reportCardStatus: reportCards.length > 0 ? 'available' : 'pending',
          subjectStats: subjectStats,
        }

        setDashboardData(newData)
        setLoading(false)

        localStorage.setItem('pupil_dashboard_cache', JSON.stringify(newData))
      } catch (error) {
        console.error('Error fetching dashboard:', error)
        toast.error('Failed to load dashboard')
        setLoading(false)
      } finally {
        setRefreshing(false)
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
      }
    }

    fetchData()

    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current)
    }
  }, [contextUser?.id, authLoading, isAuthenticated, loading, profile, profileLoading, isLoadingTerm, currentTerm, currentSession])

  // ─── Handle Logout ──────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await logout()
    router.push('/portal')
  }, [logout, router])

  const stats = dashboardData?.stats || DEFAULT_STATS
  const termProgress = dashboardData?.termProgress
  const subjectStats = dashboardData?.subjectStats || {
    completedSubjects: 0,
    totalSubjects: TOTAL_SUBJECTS,
    averagePercentage: 0,
    totalMarksObtained: 0,
    totalMarksPossible: TOTAL_SUBJECTS * 100,
    subjectScores: {}
  }

  const handleRetry = () => {
    dataFetchedRef.current = false
    localStorage.removeItem('pupil_dashboard_cache')
    window.location.reload()
  }

  const handleBackgroundRefresh = useCallback(async () => {
    if (!isAuthenticated || !contextUser?.id || refreshing) return

    setRefreshing(true)

    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', contextUser.id)
        .single()

      const userClass = userProfile?.class || ''

      if (userClass) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, photo_url, class, first_name, last_name, display_name, vin_id, gender')
          .ilike('class', userClass)
          .in('role', ['student', 'pupil'])
          .neq('id', contextUser.id)
          .order('full_name', { ascending: true }) as any

        if (data) {
          setDashboardData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              stats: {
                ...prev.stats,
                classmates: data as Classmate[],
              },
            }
          })
        }
      }
    } catch (error) {
      console.error('Background refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }, [contextUser, isAuthenticated, refreshing])

  useEffect(() => {
    if (!isAuthenticated || !contextUser) return

    const interval = setInterval(() => {
      handleBackgroundRefresh()
    }, 60000)

    return () => clearInterval(interval)
  }, [isAuthenticated, contextUser, handleBackgroundRefresh])

  const dashboardMetrics = useMemo(() => {
    const totalAssignments = stats.totalAssignments || 0
    const completedAssignments = stats.completedAssignments || 0
    const pendingAssignments = stats.pendingAssignments || 0
    const totalNotes = stats.totalNotes || 0
    const totalClassmates = stats.classmates?.length || 0

    return {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      totalNotes,
      totalClassmates,
      completionRate:
        totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
    }
  }, [
    stats.totalAssignments,
    stats.completedAssignments,
    stats.pendingAssignments,
    stats.totalNotes,
    stats.classmates,
  ])

  // ─── Tab counts ─────────────────────────────────────────────────────────────
  const tabCounts = useMemo<Record<TabId, number | undefined>>(() => ({
    overview: undefined,
    assignments: stats.totalAssignments || undefined,
    notes: stats.totalNotes || undefined,
    'report-cards': stats.reportCards?.length || undefined,
    classmates: stats.classmates?.length || undefined,
  }), [stats])

  // ─── Loading States ──────────────────────────────────────────────────────────
  const showLoadingSpinner =
    (loading && !dashboardData && !loadingTimeout) || authLoading || isLoadingTerm || profileLoading

  if (showLoadingSpinner) {
    return <PupilLoadingState profile={contextUser} onLogout={handleLogout} />
  }

  if (loading && loadingTimeout) {
    return <LoadingTimeoutError onRetry={handleRetry} />
  }

  // ✅ FIXED: Accept both 'student' and 'pupil' roles
  if (!contextUser || (contextUser.role !== 'student' && contextUser.role !== 'pupil')) {
    console.log('🚫 [Dashboard] User not valid, returning null')
    return null
  }

  const profileForTab: PupilProfile = {
    id: profile?.id || contextUser.id,
    vin_id: profile?.vin_id || contextUser.vin_id || '',
    full_name: profile?.full_name || contextUser.full_name || contextUser.first_name || 'Pupil',
    display_name: profile?.display_name || contextUser.full_name || contextUser.first_name || 'Pupil',
    email: profile?.email || contextUser.email || '',
    class: profile?.class || contextUser.class || '',
    class_arm: profile?.class_arm || contextUser.class_arm || '',
    phone: profile?.phone,
    address: profile?.address,
    guardian_name: profile?.guardian_name,
    guardian_phone: profile?.guardian_phone,
    date_of_birth: profile?.date_of_birth,
    gender: profile?.gender,
    photo_url: profile?.photo_url ?? contextUser.photo_url ?? undefined,
    admission_number: profile?.admission_number,
    admission_year: profile?.admission_year,
  }

  const reportCardStatus = dashboardData?.reportCardStatus || 'pending'

  const handleTabChange = (tab: string) => {
    setActiveSection(tab as TabId)
  }

  // ─── Render Tab Content ──────────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewTab
            profile={profileForTab}
            stats={stats}
            bannerStats={{
              totalAssignments: dashboardMetrics.totalAssignments,
              completedAssignments: dashboardMetrics.completedAssignments,
              pendingAssignments: dashboardMetrics.pendingAssignments,
              totalNotes: dashboardMetrics.totalNotes,
              totalClassmates: dashboardMetrics.totalClassmates,
              completionRate: dashboardMetrics.completionRate,
            }}
            reportCardStatus={reportCardStatus}
            termProgress={termProgress || null}
            currentTerm={currentTerm}
            currentSession={currentSession}
            handleTabChange={(tab: string) => setActiveSection(tab as TabId)}
            router={router}
          />
        )
      case 'assignments':
        return <AssignmentsTab assignments={stats.assignments} profile={profile} />
      case 'notes':
        return <NotesTab notes={stats.notes} profile={profile} />
      case 'report-cards':
        return (
          <ReportCardTab
            reportCards={stats.reportCards}
            profile={profile}
            currentTerm={currentTerm}
            currentSession={currentSession}
          />
        )
      case 'classmates':
        return <ClassmatesTab classmates={stats.classmates} profile={profile} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* Refresh Indicator */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-full shadow-xl px-4 py-2.5 flex items-center gap-2 text-sm text-slate-600 border border-slate-200/60"
          >
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span className="font-semibold">Updating...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Banner - Now passing marksObtained */}
      <PupilBanner
        fullName={profileForTab.full_name || 'Pupil'}
        pupilId={profileForTab.id}
        class={profileForTab.class}
        classArm={profileForTab.class_arm}
        currentTerm={currentTerm}
        currentSession={currentSession}
        photoUrl={profileForTab.photo_url}
        academicStats={{
          termProgress: `${subjectStats.completedSubjects}/${subjectStats.totalSubjects}`,
          completedSubjects: subjectStats.completedSubjects,
          totalSubjects: subjectStats.totalSubjects,
          averagePercentage: subjectStats.averagePercentage,
          marksObtained: subjectStats.totalMarksObtained, // ✅ ADD THIS
          pendingTheoryCount: 0,
        }}
        onTabChange={handleTabChange}
        onRefresh={handleRetry}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeSection}
        onTabChange={setActiveSection}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        counts={tabCounts}
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}