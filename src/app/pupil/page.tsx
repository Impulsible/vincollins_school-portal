/* eslint-disable react/no-unescaped-entities */
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
  List
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
}

function isValidAssignmentStatus(status: string): status is 'pending' | 'completed' | 'submitted' {
  return status === 'pending' || status === 'completed' || status === 'submitted'
}

function convertToAssignment(raw: RawAssignment): Assignment {
  const status = raw.status || 'pending'
  return {
    ...raw,
    status: isValidAssignmentStatus(status) ? status : 'pending'
  }
}

const LOADING_TIMEOUT_MS = 10000

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
const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'assignments', label: 'Assignments', icon: BookOpen },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
  { id: 'report-cards', label: 'Report Cards', icon: Award },
  { id: 'classmates', label: 'Classmates', icon: Users },
]

// ── Tab Navigation ────────────────────────────────────────────────────────────
function TabNavigation({ 
  activeTab, 
  onTabChange,
  viewMode,
  onViewModeChange 
}: { 
  activeTab: string
  onTabChange: (tab: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}) {
  const showViewToggle = ['assignments', 'notes', 'report-cards', 'classmates'].includes(activeTab)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm relative",
              activeTab === id 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            )}
          >
            <Icon className={cn(
              "w-4 h-4",
              activeTab === id ? "text-white" : "text-emerald-600"
            )} />
            <span>{label}</span>
          </motion.button>
        ))}
      </div>

      {showViewToggle && (
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'grid' ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'list' ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      )}
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
        transition={{ type: "spring", duration: 0.6 }}
      >
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
        </div>
      </motion.div>
      <h3 className="text-2xl font-bold text-slate-700 mb-2">Taking too long</h3>
      <p className="text-slate-500 text-center mb-6">We're having trouble loading your dashboard. Please try again.</p>
      <Button onClick={onRetry} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl">
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
  
  const [activeSection, setActiveSection] = useState('overview')
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

        if (error) {
          console.error('❌ Error fetching profile:', error)
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
        console.error('Error:', error)
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
    
    if (!authLoading && contextUser?.role?.toLowerCase() !== 'student') {
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

        let classmates: Classmate[] = []
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, photo_url, class, first_name, last_name, display_name, vin_id')
            .eq('role', 'student')
            .neq('id', userId) as any

          if (!error && data) {
            classmates = data as Classmate[]
          }
        } catch {
          console.log('ℹ️ Error fetching classmates')
        }

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

        const pendingAssignments = assignments.filter((a: Assignment) => a.status === 'pending').length
        const completedAssignments = assignments.filter((a: Assignment) => a.status === 'completed' || a.status === 'submitted').length

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
  }, [contextUser?.id, authLoading, isAuthenticated, loading, profile, profileLoading, isLoadingTerm])

  // ─── Handle Logout ──────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await logout()
    router.push('/portal')
  }, [logout, router])

  const stats = dashboardData?.stats || DEFAULT_STATS
  const termProgress = dashboardData?.termProgress

  const handleRetry = () => {
    dataFetchedRef.current = false
    localStorage.removeItem('pupil_dashboard_cache')
    window.location.reload()
  }

  const handleBackgroundRefresh = useCallback(async () => {
    if (!isAuthenticated || !contextUser?.id || refreshing) return
    
    setRefreshing(true)
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, photo_url, class, first_name, last_name, display_name, vin_id')
        .eq('role', 'student')
        .neq('id', contextUser.id) as any

      if (data) {
        setDashboardData(prev => {
          if (!prev) return prev
          return {
            ...prev,
            stats: {
              ...prev.stats,
              classmates: data as Classmate[],
            }
          }
        })
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
      completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
    }
  }, [stats.totalAssignments, stats.completedAssignments, stats.pendingAssignments, stats.totalNotes, stats.classmates])

  // ─── Loading States ──────────────────────────────────────────────────────────
  const showLoadingSpinner = (loading && !dashboardData && !loadingTimeout) || 
                             authLoading || 
                             isLoadingTerm || 
                             profileLoading

  if (showLoadingSpinner) {
    return <PupilLoadingState profile={contextUser} onLogout={handleLogout} />
  }

  if (loading && loadingTimeout) {
    return <LoadingTimeoutError onRetry={handleRetry} />
  }

  if (!contextUser || contextUser.role !== 'student') {
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

  // ─── Handle Tab Change from Banner ──────────────────────────────────────────
  const handleTabChange = (tab: string) => {
    setActiveSection(tab)
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
            handleTabChange={(tab: string) => setActiveSection(tab)}
            router={router}
          />
        )
      case 'assignments':
        return (
          <AssignmentsTab 
            assignments={stats.assignments}
            profile={profile}
          />
        )
      case 'notes':
        return (
          <NotesTab 
            notes={stats.notes}
            profile={profile}
          />
        )
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
        return (
          <ClassmatesTab 
            classmates={stats.classmates}
            profile={profile}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Refresh Indicator */}
      {refreshing && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 text-sm text-slate-600 border border-slate-200">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>Updating...</span>
        </div>
      )}

      {/* Banner */}
      <PupilBanner
        fullName={profileForTab.full_name || 'Pupil'}
        class={profileForTab.class}
        classArm={profileForTab.class_arm}
        currentTerm={currentTerm}
        currentSession={currentSession}
        photoUrl={profileForTab.photo_url}
        academicStats={{
          termProgress: `${dashboardMetrics.completedAssignments}/${dashboardMetrics.totalAssignments}`,
          completedSubjects: dashboardMetrics.completedAssignments,
          totalSubjects: dashboardMetrics.totalAssignments || 1,
          averagePercentage: dashboardMetrics.completionRate,
          pendingTheoryCount: dashboardMetrics.pendingAssignments,
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
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}