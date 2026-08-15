/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { 
  GraduationCap, Quote, Calendar, Flame, 
  Clock, CheckCircle2, Users, Award,
  FileText, BookOpen, FileCheck, Sparkles, Timer,
  TrendingUp, BarChart3, AlertCircle, Loader2,
  School, Target, Zap, Sun, Sunrise, Sunset, Moon,
  ChevronRight, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface StaffProfile {
  id?: string
  full_name?: string
  name?: string
  first_name?: string
  last_name?: string
  department?: string
  role?: string
  photo_url?: string | null
  avatar_url?: string | null
  title?: string
}

export interface StaffStats {
  totalExams?: number
  publishedExams?: number
  totalStudents?: number
  activeStudents?: number
  pendingGrading?: number
  totalAssignments?: number
  totalNotes?: number
  reportCardsGenerated?: number
  averagePerformance?: number
  totalPupils?: number
  totalClasses?: number
  attendanceToday?: number
}

export interface TermInfo {
  termName: string
  sessionYear: string
  currentWeek: number
  totalWeeks: number
  weekProgress: number
  startDate?: string
  endDate?: string
  displayWeek?: string
}

export interface StaffWelcomeBannerProps {
  profile: StaffProfile | null
  stats: StaffStats | null
  termInfo?: TermInfo
}

const STORAGE_KEY = 'staff_session_start'

// Personalized Quotes
const quotes = {
  morning: [
    { text: "Every student can learn, just not on the same day, or in the same way.", author: "George Evans" },
    { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
    { text: "The influence of a good teacher can never be erased.", author: "Unknown" },
    { text: "Your work today shapes the leaders of tomorrow.", author: "Educational Wisdom" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  ],
  afternoon: [
    { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "William Butler Yeats" },
    { text: "Teaching is the one profession that creates all other professions.", author: "Unknown" },
    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
    { text: "Intelligence plus character — that is the goal of true education.", author: "Martin Luther King Jr." },
    { text: "The great teacher inspires.", author: "William Arthur Ward" },
  ],
  evening: [
    { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
    { text: "The dream begins with a teacher who believes in you.", author: "Dan Rather" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { text: "Develop a passion for learning. If you do, you will never cease to grow.", author: "Anthony J. D'Angelo" },
  ],
}

const getPersonalizedQuote = (hour: number, firstName: string) => {
  let quoteSet = quotes.morning
  if (hour >= 12 && hour < 17) quoteSet = quotes.afternoon
  if (hour >= 17) quoteSet = quotes.evening

  const dayOfMonth = new Date().getDate()
  const index = dayOfMonth % quoteSet.length
  const quote = quoteSet[index]
  
  return {
    text: quote.text.replace(/you/g, firstName),
    author: quote.author
  }
}

// ─── Helper Functions ──────────────────────────────────────────────────────────
const getFirstName = (profile?: StaffProfile | null): string => {
  if (profile?.first_name) return profile.first_name
  if (profile?.full_name) return profile.full_name.split(' ')[0]
  if (profile?.name) return profile.name.split(' ')[0]
  return 'Teacher'
}

const getInitials = (profile?: StaffProfile | null): string => {
  const fullName = profile?.full_name || profile?.name || ''
  if (!fullName) return 'T'
  const parts = fullName.split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : fullName.slice(0, 2).toUpperCase()
}

const getTitleLabel = (title?: string) => {
  const map: Record<string, string> = {
    mr: 'Mr.', mrs: 'Mrs.', ms: 'Ms.', dr: 'Dr.', prof: 'Prof.',
  }
  return title ? map[title.toLowerCase()] ?? '' : ''
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'N/A'
    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return 'N/A'
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function StaffWelcomeBanner({ profile, stats, termInfo }: StaffWelcomeBannerProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<string>('assignments')
  const [assignments, setAssignments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [pupils, setPupils] = useState<any[]>([])
  const [performance, setPerformance] = useState(0)
  const [loading, setLoading] = useState(true)

  // ─── Session Timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSessionStart(new Date(stored))
    } else {
      const start = new Date()
      localStorage.setItem(STORAGE_KEY, start.toISOString())
      setSessionStart(start)
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleClear = () => localStorage.removeItem(STORAGE_KEY)
    window.addEventListener('beforeunload', handleClear)
    return () => window.removeEventListener('beforeunload', handleClear)
  }, [])

  // ─── Fetch Data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch assignments
        const { data: assignmentData } = await supabase
          .from('assignments')
          .select('*')
          .eq('teacher_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setAssignments(assignmentData || [])

        // Fetch pupils
        const { data: pupilData } = await supabase
          .from('profiles')
          .select('id, full_name, class, class_arm, role')
          .in('role', ['student', 'pupil'])

        setPupils(pupilData || [])

        // Build class data
        if (pupilData) {
          const classMap = new Map<string, { pupils: any[]; scores: number[] }>()
          pupilData.forEach((p: any) => {
            const key = p.class || 'Unassigned'
            if (!classMap.has(key)) {
              classMap.set(key, { pupils: [], scores: [] })
            }
            classMap.get(key)!.pupils.push(p)
          })

          const pupilIds = pupilData.map((p: any) => p.id)
          let scoresData: any[] = []
          if (pupilIds.length > 0) {
            const { data } = await supabase
              .from('primary_scores')
              .select('student_id, total_score')
              .in('student_id', pupilIds)
            scoresData = data || []
          }

          const classData: any[] = []
          classMap.forEach((data, className) => {
            const pupilIdsInClass = data.pupils.map((p: any) => p.id)
            const classScores = scoresData.filter((s: any) => pupilIdsInClass.includes(s.student_id))
            
            const avgScore = classScores.length > 0
              ? Math.round(classScores.reduce((acc: number, s: any) => acc + (s.total_score || 0), 0) / classScores.length)
              : 0

            const pendingGrading = data.pupils.filter((p: any) => {
              const pupilScores = scoresData.filter((s: any) => s.student_id === p.id)
              return pupilScores.length === 0 || pupilScores.some((s: any) => !s.total_score)
            }).length

            classData.push({
              id: className,
              class_name: className,
              class_arm: data.pupils[0]?.class_arm || undefined,
              pupil_count: data.pupils.length,
              average_score: avgScore,
              pending_grading: pendingGrading,
            })
          })

          classData.sort((a, b) => a.class_name.localeCompare(b.class_name))
          setClasses(classData)

          if (scoresData.length > 0) {
            const total = scoresData.reduce((acc: number, s: any) => acc + (s.total_score || 0), 0)
            setPerformance(Math.round(total / scoresData.length))
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [profile?.id])

  // ─── Computed Values ─────────────────────────────────────────────────────────
  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours()
    if (hour < 12) return { text: 'Good Morning', emoji: '🌅' }
    if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' }
    return { text: 'Good Evening', emoji: '🌙' }
  }, [currentTime])

  const firstName = getFirstName(profile)
  const initials = getInitials(profile)
  const avatarUrl = profile?.photo_url || profile?.avatar_url || undefined
  const titleLabel = getTitleLabel(profile?.title)
  const displayName = titleLabel ? `${titleLabel} ${firstName}` : firstName

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }, [currentTime])

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, [currentTime])

  const onlineDuration = useMemo(() => {
    if (!sessionStart) return '00:00:00'
    const diffMs = currentTime.getTime() - sessionStart.getTime()
    const totalSeconds = Math.floor(diffMs / 1000)
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
    const s = String(totalSeconds % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }, [currentTime, sessionStart])

  const quote = useMemo(() => {
    return getPersonalizedQuote(currentTime.getHours(), firstName)
  }, [currentTime, firstName])

  const greeting = getGreeting()
  const weekDisplay = termInfo?.displayWeek || ''
  const roleDisplay = profile?.role === 'admin' ? 'Administrator' : 
                      profile?.role === 'staff' || profile?.role === 'teacher' ? 'Teacher' : 
                      profile?.role || 'Staff'

  const pendingGrading = stats?.pendingGrading || 0
  const totalPupils = stats?.totalPupils || pupils.length || 0

  // ─── Tab Content ─────────────────────────────────────────────────────────────
  const tabContent: Record<string, React.ReactNode> = {
    assignments: (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Recent Assignments</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : assignments.length > 0 ? (
          <div className="space-y-2">
            {assignments.slice(0, 5).map((assignment: any) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
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
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No assignments yet</p>
        )}
      </div>
    ),
    classes: (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">My Classes</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classes.slice(0, 4).map((cls) => (
              <div key={cls.id} className="p-3 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{cls.class_name}</span>
                  <Badge className="bg-blue-100 text-blue-700">{cls.pupil_count} pupils</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>Avg: {cls.average_score}%</span>
                  <span>Pending: {cls.pending_grading}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No classes assigned</p>
        )}
      </div>
    ),
    performance: (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Performance Overview</h3>
        <div className="bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl p-4 text-white">
          <p className="text-3xl font-bold">{performance}%</p>
          <p className="text-sm text-white/80">Average Performance</p>
        </div>
      </div>
    ),
    pupils: (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800">Total Pupils</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalPupils}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats?.activeStudents || 0}</p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
        </div>
      </div>
    ),
  }

  return (
    <div className="space-y-4">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO BANNER — Dark Navy Blue Theme                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-2xl"
        suppressHydrationWarning
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="flex-1">
            {/* Date & Week Badge Row */}
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <span className="text-xl sm:text-2xl">{greeting.emoji}</span>
              <span className="text-xs sm:text-sm font-medium bg-white/15 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm text-white">
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-cyan-400/10 px-2 sm:px-3 py-1 rounded-full text-cyan-200 border border-cyan-400/20">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {formattedTime}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-medium bg-white/10 px-2 sm:px-3 py-1 rounded-full text-blue-200">
                <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {onlineDuration}
              </span>
              {weekDisplay && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium bg-amber-400/10 px-2 sm:px-3 py-1 rounded-full text-amber-200 border border-amber-400/20">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {weekDisplay}
                </span>
              )}
            </div>

            {/* Main Greeting */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-white drop-shadow-sm">
              {greeting.text}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">{displayName}</span>!
            </h1>

            {/* Personalized Quote */}
            {quote.text && (
              <div className="flex items-start gap-2 mb-3 sm:mb-4 max-w-2xl">
                <Quote className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400/60 shrink-0 mt-0.5 sm:mt-1" />
                <div>
                  <p className="text-gray-200 text-xs sm:text-sm md:text-base italic leading-relaxed line-clamp-2">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium">
                    — {quote.author}
                  </p>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <Badge className="bg-white/15 text-white border-0 text-xs sm:text-sm">
                <GraduationCap className="h-3 w-3 mr-1" />
                {profile?.department || 'General Department'}
              </Badge>
              <Badge className="bg-white/15 text-white border-0 text-xs sm:text-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                {roleDisplay}
              </Badge>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative group hidden sm:block">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 ring-4 ring-white/20 shadow-xl">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl sm:text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Pending Grading Alert */}
        {pendingGrading > 0 && (
          <div className="relative z-10 mt-3 sm:mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm text-amber-200 font-medium">
                {pendingGrading} submission{pendingGrading !== 1 ? 's' : ''} waiting for grading
              </p>
              <p className="text-[10px] sm:text-xs text-amber-300/80">Review and grade pending submissions</p>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="relative z-10 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/15">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="group cursor-default bg-white/5 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {assignments.length}
                </p>
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 opacity-60" />
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300">Assignments</p>
            </div>

            <div className="group cursor-default bg-white/5 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {classes.length}
                </p>
                <School className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-300 opacity-60" />
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300">Classes</p>
            </div>

            <div className="group cursor-default bg-white/5 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {performance}%
                </p>
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 opacity-60" />
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300">Avg Performance</p>
            </div>

            <div className="group cursor-default bg-white/5 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {totalPupils}
                </p>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-300 opacity-60" />
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300">Total Pupils</p>
            </div>
          </div>

          {/* Term Progress Bar */}
          {termInfo && termInfo.currentWeek > 0 && (
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs text-gray-300">{termInfo.termName} Term Progress</span>
                <span className="text-[10px] sm:text-xs text-gray-300">{termInfo.displayWeek}</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${termInfo.weekProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TABS SECTION                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-none border-b border-slate-200 bg-slate-50/50 p-0 h-auto">
            <TabsTrigger 
              value="assignments" 
              className="flex items-center gap-2 py-3 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Assignments</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger 
              value="classes" 
              className="flex items-center gap-2 py-3 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
            >
              <School className="h-4 w-4" />
              <span className="hidden sm:inline">Classes</span>
              <span className="sm:hidden">Class</span>
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 py-3 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pupils" 
              className="flex items-center gap-2 py-3 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pupils</span>
              <span className="sm:hidden">Class</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value={activeTab} className="mt-0">
                  {tabContent[activeTab]}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </div>
  )
}