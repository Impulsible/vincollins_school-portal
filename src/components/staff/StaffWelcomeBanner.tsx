/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GraduationCap, Quote, Calendar, Flame, 
  Clock, Users, Award, FileText, Sparkles, 
  Timer, TrendingUp, Loader2, School, BookOpen
} from 'lucide-react'
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

const MAX_SESSION_HOURS = 12

// Personalized Quotes for Early Education
const quotes = {
  morning: [
    { text: "Every child is a different kind of flower, and all together, they make this world a beautiful garden.", author: "Unknown" },
    { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" },
    { text: "Children learn more from what you are than what you teach.", author: "W.E.B. Du Bois" },
    { text: "Your work today shapes the leaders of tomorrow.", author: "Educational Wisdom" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  ],
  afternoon: [
    { text: "Play is often talked about as if it were a relief from serious learning. But for children, play is serious learning.", author: "Mr. Rogers" },
    { text: "Teaching is the one profession that creates all other professions.", author: "Unknown" },
    { text: "The greatest sign of success for a teacher is to be able to say, 'The children are now working as if I did not exist.'", author: "Maria Montessori" },
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
  if (profile?.first_name && profile.first_name.trim()) {
    const clean = profile.first_name.trim().split(/\s+/)[0]
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
  }
  const rawName = (profile?.full_name || profile?.name || '').trim()
  if (!rawName) return 'Teacher'
  
  const parts = rawName.split(/\s+/)
  const selected = parts.length >= 2 ? parts[1] : parts[0]
  return selected.charAt(0).toUpperCase() + selected.slice(1).toLowerCase()
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function StaffWelcomeBanner({ profile, stats, termInfo }: StaffWelcomeBannerProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<string>('assignments')
  const [greetingIndex, setGreetingIndex] = useState(0)
  
  // ─── Database-fetched data ──────────────────────────────────────────────────
  const [assignments, setAssignments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [pupils, setPupils] = useState<any[]>([])
  const [performance, setPerformance] = useState(0)
  const [loading, setLoading] = useState(true)

  // ─── Clock Mount ───────────────────────────────────────────────────────────
  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ─── Session Timer (Persists on Reload, Restarts on Login/12h Timeout) ─────
  useEffect(() => {
    if (!profile?.id) return

    const storageKey = `staff_session_${profile.id}`
    const stored = localStorage.getItem(storageKey)
    const now = new Date()

    if (stored) {
      const storedTime = new Date(stored)
      const diffHours = (now.getTime() - storedTime.getTime()) / (1000 * 60 * 60)

      if (diffHours > MAX_SESSION_HOURS) {
        localStorage.setItem(storageKey, now.toISOString())
        setSessionStart(now)
      } else {
        setSessionStart(storedTime)
      }
    } else {
      localStorage.setItem(storageKey, now.toISOString())
      setSessionStart(now)
    }
  }, [profile?.id])

  // ─── Fetch Data from Database ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setAssignments(assignmentData || [])

      const { data: pupilData } = await supabase
        .from('profiles')
        .select('id, full_name, class, class_arm, role')
        .in('role', ['student', 'pupil'])
        .eq('is_active', true)
      setPupils(pupilData || [])

      const pupilIds = (pupilData || []).map((p: any) => p.id)
      let scoresData: any[] = []
      if (pupilIds.length > 0) {
        const { data } = await supabase
          .from('primary_scores')
          .select('student_id, total_score')
          .in('student_id', pupilIds)
        scoresData = data || []
      }

      if (pupilData) {
        const classMap = new Map<string, { pupils: any[]; scores: number[] }>()
        pupilData.forEach((p: any) => {
          const key = p.class || 'Unassigned'
          if (!classMap.has(key)) {
            classMap.set(key, { pupils: [], scores: [] })
          }
          classMap.get(key)!.pupils.push(p)
        })

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
  }, [profile?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ─── Computed Values & 12 Nigerian Language Rotator ────────────────────────
  const currentHour = currentTime.getHours()

  const greetingsList = useMemo(() => {
    if (currentHour < 12) return [
      { text: 'Good Morning', emoji: '🌅', lang: 'English' },
      { text: 'Ẹ kaarọ', emoji: '🍎', lang: 'Yoruba' },
      { text: 'Ina kwana', emoji: '🌻', lang: 'Hausa' },
      { text: 'Ụtụtụ ọma', emoji: '🎨', lang: 'Igbo' },
      { text: 'How far this morning', emoji: '☕', lang: 'Pidgin' },
      { text: 'Emesiere', emoji: '🖍️', lang: 'Efik' },
      { text: "Ob'owia", emoji: '🪁', lang: 'Edo' },
      { text: 'Msugh u nder', emoji: '🧸', lang: 'Tiv' },
      { text: 'Awee', emoji: '🌼', lang: 'Urhobo' },
      { text: 'Na kpere', emoji: '🏫', lang: 'Igala' },
      { text: 'Nua', emoji: '☀️', lang: 'Ijaw' },
      { text: 'Ndawunyo', emoji: '🌟', lang: 'Kanuri' },
    ]
    if (currentHour < 17) return [
      { text: 'Good Afternoon', emoji: '☀️', lang: 'English' },
      { text: 'Ẹ kaasan', emoji: '🍉', lang: 'Yoruba' },
      { text: 'Ina wuni', emoji: '🦋', lang: 'Hausa' },
      { text: 'Ehihie ọma', emoji: '🧩', lang: 'Igbo' },
      { text: 'How far this afternoon', emoji: '😎', lang: 'Pidgin' },
      { text: 'Mesiere', emoji: '📚', lang: 'Efik' },
      { text: "Ob'avan", emoji: '⚽', lang: 'Edo' },
      { text: 'Msugh u pande', emoji: '🌳', lang: 'Tiv' },
      { text: 'Awee', emoji: '✏️', lang: 'Urhobo' },
      { text: 'Na rolu', emoji: '🏕️', lang: 'Igala' },
      { text: 'Nua', emoji: '🎨', lang: 'Ijaw' },
      { text: 'Kiari ndaso', emoji: '🌞', lang: 'Kanuri' },
    ]
    return [
      { text: 'Good Evening', emoji: '🌙', lang: 'English' },
      { text: 'Ẹ kalẹ', emoji: '🦉', lang: 'Yoruba' },
      { text: 'Barka da yamma', emoji: '📖', lang: 'Hausa' },
      { text: 'Mgbede ọma', emoji: '✨', lang: 'Igbo' },
      { text: 'How far this evening', emoji: '🌟', lang: 'Pidgin' },
      { text: 'Esiere', emoji: '🏠', lang: 'Efik' },
      { text: "Ob'ota", emoji: '🌌', lang: 'Edo' },
      { text: 'Msugh u aikeghe', emoji: '⛺', lang: 'Tiv' },
      { text: 'Awee', emoji: '🛋️', lang: 'Urhobo' },
      { text: 'Na rọle', emoji: '🧩', lang: 'Igala' },
      { text: 'Nua', emoji: '🕯️', lang: 'Ijaw' },
      { text: 'Kajiri ndaso', emoji: '🌜', lang: 'Kanuri' },
    ]
  }, [currentHour])

  useEffect(() => {
    const timer = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetingsList.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [greetingsList.length])

  const cycleLanguage = () => {
    setGreetingIndex((prev) => (prev + 1) % greetingsList.length)
  }

  const currentGreeting = greetingsList[greetingIndex]
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
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Recent Assignments</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : assignments.length > 0 ? (
          <div className="space-y-2">
            {assignments.slice(0, 5).map((assignment: any) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{assignment.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{assignment.subject}</p>
                </div>
                <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-700 dark:text-slate-300">
                  {assignment.status || 'Draft'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
            <BookOpen className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No homework or tasks assigned yet.</p>
          </div>
        )}
      </div>
    ),
    classes: (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">My Classes</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classes.slice(0, 4).map((cls) => (
              <div key={cls.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{cls.class_name}</span>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none">
                    {cls.pupil_count} pupils
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Avg: {cls.average_score}%</span>
                  <span>Pending: {cls.pending_grading}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 dark:text-slate-500">
            <School className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No classes assigned yet.</p>
          </div>
        )}
      </div>
    ),
    performance: (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Performance Overview</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl p-4 text-white">
            <p className="text-3xl font-bold">{performance}%</p>
            <p className="text-sm text-white/80">Average Class Performance</p>
          </div>
        )}
      </div>
    ),
    pupils: (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Total Pupils</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center border border-blue-100 dark:border-blue-800/50">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPupils}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Enrolled</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center border border-emerald-100 dark:border-emerald-800/50">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.activeStudents || 0}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Active Today</p>
            </div>
          </div>
        )}
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-row justify-between items-start gap-4 sm:gap-6 w-full">
          <div className="flex-1 min-w-0">
            
            {/* Date & Week Badge Row */}
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium bg-white/15 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm text-white border border-white/10">
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium bg-cyan-400/10 px-2 sm:px-3 py-1 rounded-full text-cyan-200 border border-cyan-400/20">
                <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {formattedTime}
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-medium bg-white/10 px-2 sm:px-3 py-1 rounded-full text-blue-200 border border-white/5">
                <Timer className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Session: {onlineDuration}
              </span>
              {weekDisplay && (
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium bg-amber-400/10 px-2 sm:px-3 py-1 rounded-full text-amber-200 border border-amber-400/20">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {weekDisplay}
                </span>
              )}
            </div>

            {/* Rotator Greeting + Language Chip */}
            <div 
              className="min-h-[52px] sm:min-h-[60px] flex flex-col justify-center cursor-pointer mb-1 sm:mb-2 select-none rounded-lg hover:bg-white/5 transition-colors w-fit p-1 -ml-1 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              onClick={cycleLanguage}
              onKeyDown={(e) => e.key === 'Enter' && cycleLanguage()}
              role="button"
              tabIndex={0}
              aria-label="Switch greeting language"
              title="Tap to switch language"
            >
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentGreeting.text}
                  initial={{ opacity: 0, y: 28, rotateX: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -28, rotateX: 50, scale: 0.9 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 280, 
                    damping: 18,
                    mass: 0.8
                  }}
                  className="flex flex-col gap-1"
                  style={{ transformOrigin: "center center" }}
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-sm flex flex-wrap items-center gap-x-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl mr-1 pb-0.5">{currentGreeting.emoji}</span>
                    <span>{currentGreeting.text},</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                      {displayName}!
                    </span>
                  </div>
                  
                  {/* Language indicator pill */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium tracking-wide uppercase bg-white/10 text-amber-200/90 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      {currentGreeting.lang}
                    </span>
                    <span className="text-[10px] text-white/40 hidden sm:inline">tap to change</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Personalized Quote */}
            {quote.text && (
              <div className="flex items-start gap-2 mb-3 sm:mb-4 max-w-2xl pl-1 mt-1">
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
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pl-1">
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

          {/* Avatar Area Mobile Ready */}
          <div className="relative group shrink-0 mt-1">
            <Avatar className="h-14 w-14 sm:h-20 sm:w-20 md:h-28 md:w-28 ring-4 ring-white/20 shadow-xl">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xl sm:text-2xl md:text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
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
            <div className="group cursor-default bg-white/5 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {assignments.length}
                </p>
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300">Assignments</p>
            </div>

            <div className="group cursor-default bg-white/5 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {classes.length}
                </p>
                <School className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-300 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300">Classes</p>
            </div>

            <div className="group cursor-default bg-white/5 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {performance}%
                </p>
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300">Avg Performance</p>
            </div>

            <div className="group cursor-default bg-white/5 rounded-xl p-2.5 sm:p-3 hover:bg-white/10 transition-colors border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white group-hover:text-amber-200 transition-colors">
                  {totalPupils}
                </p>
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-300 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-300">Total Pupils</p>
            </div>
          </div>

          {/* Term Progress Bar */}
          {termInfo && termInfo.currentWeek > 0 && (
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-xs text-gray-300 font-medium">{termInfo.termName} Term Progress</span>
                <span className="text-[10px] sm:text-xs text-amber-200 font-medium">{termInfo.displayWeek}</span>
              </div>
              <div className="h-2 bg-black/20 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700 relative"
                  style={{ width: `${termInfo.weekProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TABS SECTION                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-none border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-0 h-auto">
            <TabsTrigger 
              value="assignments" 
              className="flex items-center gap-2 py-3 rounded-none text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Assignments</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger 
              value="classes" 
              className="flex items-center gap-2 py-3 rounded-none text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all"
            >
              <School className="h-4 w-4" />
              <span className="hidden sm:inline">Classes</span>
              <span className="sm:hidden">Class</span>
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 py-3 rounded-none text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pupils" 
              className="flex items-center gap-2 py-3 rounded-none text-slate-600 dark:text-slate-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pupils</span>
              <span className="sm:hidden">Class</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 transition-colors">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value={activeTab} className="mt-0 outline-none">
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