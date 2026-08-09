/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Rocket,
  Clock,
  Timer,
  Wifi,
  WifiOff,
  CheckCircle2,
  RefreshCw,
  GraduationCap,
  TrendingUp,
  Award,
  Quote,
  BookOpen,
  Star,
  PartyPopper,
  Smile,
  FileText,
  Pencil,
  Heart,
  Zap,
  Trophy,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────────────────
interface PupilBannerProps {
  fullName: string
  className?: string
  class?: string
  classArm?: string
  currentTerm: string
  currentSession: string
  photoUrl?: string
  academicStats?: {
    termProgress: string
    completedSubjects: number
    totalSubjects: number
    averagePercentage: number
    marksObtained?: number
    totalMarks?: number
    pendingTheoryCount?: number
  }
  onTabChange?: (tab: string) => void
  onRefresh?: () => void
}

// ── Constants ──────────────────────────────────────────────────────────────────
const TOTAL_SUBJECTS = 22
const TOTAL_MARKS_PER_SUBJECT = 100
const TOTAL_POSSIBLE_MARKS = TOTAL_SUBJECTS * TOTAL_MARKS_PER_SUBJECT

// ── Expanded Quotes Collection ──────────────────────────────────────────────
const QUOTES = {
  morning: [
    { text: "Every morning is a new chance to shine, {name}! 🌟", author: "School Motto" },
    { text: "Today is a great day to learn something amazing, {name}!", author: "Your Teacher" },
    { text: "You are smart, kind, and capable, {name}. Believe it!", author: "Vincollins" },
    { text: "Learning is a superpower, {name}. Use it every day!", author: "School Motto" },
    { text: "Rise and shine, {name}! The world is waiting for your brilliance!", author: "Vincollins" },
    { text: "Every expert was once a beginner, {name}. Keep going!", author: "Your Teacher" },
    { text: "Your potential is limitless, {name}. Today is your day!", author: "School Motto" },
    { text: "Dream big, {name}! You're capable of amazing things.", author: "Vincollins" },
    { text: "The best way to predict your future is to create it, {name}!", author: "Your Teacher" },
    { text: "Be a rainbow in someone else's cloud, {name}. ☀️", author: "School Motto" },
  ],
  afternoon: [
    { text: "You're doing amazing, {name}! Keep going strong!", author: "Your Teacher" },
    { text: "Every page you read makes you smarter, {name}!", author: "Vincollins" },
    { text: "Hard work + fun = success! You've got this, {name}!", author: "School Motto" },
    { text: "Keep trying, {name}! The best is yet to come.", author: "Your Teacher" },
    { text: "You're a star, {name}! Never forget how bright you shine!", author: "Vincollins" },
    { text: "Progress, not perfection, {name}. You're growing every day!", author: "School Motto" },
    { text: "You're stronger than you think, {name}. Keep pushing!", author: "Your Teacher" },
    { text: "The future belongs to those who believe in themselves, {name}!", author: "Vincollins" },
    { text: "Your effort today is building tomorrow's success, {name}. 💪", author: "School Motto" },
    { text: "Stay curious, {name}! The world is full of wonders to discover!", author: "Your Teacher" },
  ],
  evening: [
    { text: "You did great today, {name}! Rest and dream big!", author: "Your Teacher" },
    { text: "Every day you learn is a day you grow, {name}. Well done!", author: "Vincollins" },
    { text: "Sleep well, {name}. Tomorrow brings new adventures!", author: "School Motto" },
    { text: "You are a star, {name}! Shine bright always.", author: "Your Teacher" },
    { text: "Today was a good day, {name}! Tomorrow will be even better!", author: "Vincollins" },
    { text: "Rest your mind, {name}. You've earned it. Tomorrow is a new beginning!", author: "School Motto" },
    { text: "The best part of learning is that it never ends, {name}. Good night!", author: "Your Teacher" },
    { text: "You're one day closer to your dreams, {name}. Keep believing!", author: "Vincollins" },
    { text: "End each day with a grateful heart, {name}. You're doing wonderfully!", author: "School Motto" },
    { text: "Sleep tight, {name}! Tomorrow you'll wake up even stronger!", author: "Your Teacher" },
  ],
}

// ── Helper Functions ──────────────────────────────────────────────────────────
const getFirstName = (fullName: string): string => {
  if (!fullName) return 'Student'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) {
    const firstPart = parts[0].toLowerCase()
    if (['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms'].includes(firstPart)) {
      return parts[1] || parts[0]
    }
    const firstPartLength = parts[0].length
    const secondPartLength = parts[1].length
    if (secondPartLength <= firstPartLength) {
      return parts[1]
    }
    return parts[0]
  }
  return parts[0] || 'Student'
}

const getPersonalizedQuote = (hour: number, firstName: string) => {
  let quoteSet = QUOTES.morning
  if (hour >= 12 && hour < 17) quoteSet = QUOTES.afternoon
  if (hour >= 17) quoteSet = QUOTES.evening

  const now = new Date()
  const seed = now.getDate() + now.getHours() + now.getMinutes()
  const index = seed % quoteSet.length

  const quote = quoteSet[index]
  return {
    text: quote.text.replace(/\{name\}/g, firstName),
    author: quote.author,
  }
}

const getGreeting = (hour: number) => {
  if (hour < 6) return { text: 'Good Night', emoji: '🌙', sub: 'Rest well, champion!' }
  if (hour < 12) return { text: 'Good Morning', emoji: '☀️', sub: 'Ready to be amazing today?' }
  if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤️', sub: "You're doing so well!" }
  if (hour < 21) return { text: 'Good Evening', emoji: '🌅', sub: 'Time to review your day!' }
  return { text: 'Good Night', emoji: '🌙', sub: 'Sweet dreams, superstar!' }
}

const getRemarkData = (avg: number) => {
  if (avg >= 80) return { remark: 'Excellent', emoji: '🏆', gradient: 'from-yellow-500 to-amber-600', text: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-400/40' }
  if (avg >= 70) return { remark: 'Very Good', emoji: '🌟', gradient: 'from-green-500 to-emerald-600', text: 'text-emerald-300', bg: 'bg-emerald-500/20 border-emerald-400/40' }
  if (avg >= 60) return { remark: 'Good', emoji: '⭐', gradient: 'from-blue-500 to-cyan-600', text: 'text-cyan-300', bg: 'bg-cyan-500/20 border-cyan-400/40' }
  if (avg >= 50) return { remark: 'Satisfactory', emoji: '📚', gradient: 'from-indigo-500 to-violet-600', text: 'text-violet-300', bg: 'bg-violet-500/20 border-violet-400/40' }
  if (avg >= 45) return { remark: 'Average', emoji: '📖', gradient: 'from-purple-500 to-pink-600', text: 'text-pink-300', bg: 'bg-pink-500/20 border-pink-400/40' }
  return { remark: 'Fair', emoji: '💪', gradient: 'from-orange-500 to-red-600', text: 'text-orange-300', bg: 'bg-orange-500/20 border-orange-400/40' }
}

// ── Animated Background Shapes ──────────────────────────────────────────────
const BgShapes = () => {
  const shapes = useMemo(() => [
    { shape: 'circle', w: 280, h: 280, top: '-80px', left: '-80px', color: 'bg-emerald-500/5', delay: 0 },
    { shape: 'circle', w: 200, h: 200, top: '60%', left: '-60px', color: 'bg-violet-500/5', delay: 0.5 },
    { shape: 'circle', w: 250, h: 250, top: '-60px', right: '10%', color: 'bg-amber-500/5', delay: 1 },
    { shape: 'circle', w: 150, h: 150, bottom: '-30px', right: '5%', color: 'bg-cyan-500/5', delay: 1.5 },
    { shape: 'star', w: 30, h: 30, top: '15%', left: '8%', color: 'text-yellow-300/20', delay: 0.2 },
    { shape: 'star', w: 25, h: 25, top: '75%', left: '20%', color: 'text-pink-300/20', delay: 0.8 },
    { shape: 'star', w: 28, h: 28, top: '35%', right: '15%', color: 'text-cyan-300/20', delay: 1.2 },
    { shape: 'star', w: 20, h: 20, bottom: '25%', left: '50%', color: 'text-white/15', delay: 0.6 },
    { shape: 'star', w: 22, h: 22, top: '55%', right: '25%', color: 'text-violet-300/20', delay: 0.9 },
    { shape: 'star', w: 18, h: 18, bottom: '15%', right: '40%', color: 'text-amber-300/20', delay: 1.4 },
  ], [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) =>
        s.shape === 'circle' ? (
          <motion.div
            key={i}
            className={cn('absolute rounded-full', s.color)}
            style={{ width: s.w, height: s.h, top: s.top, left: (s as any).left, right: (s as any).right, bottom: (s as any).bottom }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 8 + i * 1.5, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <motion.div
            key={i}
            className={cn('absolute', s.color)}
            style={{ top: s.top, left: (s as any).left, right: (s as any).right, bottom: (s as any).bottom }}
            animate={{ rotate: [0, 25, -25, 0], scale: [1, 1.3, 1], y: [0, -10, 0] }}
            transition={{ duration: 5 + i * 0.8, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star size={s.w} fill="currentColor" />
          </motion.div>
        )
      )}
    </div>
  )
}

// ── Confetti ──────────────────────────────────────────────────────────────────
// Fixed: Removed Math.random from useMemo and used deterministic values
const CONFETTI_COLORS = [
  'bg-pink-400', 'bg-yellow-400', 'bg-cyan-400',
  'bg-violet-400', 'bg-emerald-400', 'bg-orange-400',
]

const ConfettiPiece = ({ delay, color, x, rot, duration }: { 
  delay: number; 
  color: string; 
  x: number; 
  rot: number;
  duration: number;
}) => {
  return (
    <motion.div
      initial={{ x: `${x}%`, y: -20, rotate: rot, opacity: 1, scale: 0 }}
      animate={{ y: '110vh', rotate: rot + 720, opacity: 0, scale: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={cn('absolute w-2.5 h-2.5 rounded-sm', color)}
    />
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  gradient: string
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  sub?: string
  pulse?: boolean
  delay?: number
}

const StatCard = ({ gradient, icon, value, label, sub, pulse, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 15, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 200 }}
    whileHover={{ y: -2, scale: 1.01 }}
    className="relative overflow-hidden rounded-xl shadow-lg cursor-default"
  >
    <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
    <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
    <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />

    <div className="relative z-10 p-3">
      <div className="flex items-start justify-between mb-1.5">
        <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        {pulse && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-white"
          />
        )}
      </div>
      <p className="text-xl md:text-2xl font-extrabold text-white drop-shadow-sm leading-none mb-0.5">
        {value}
      </p>
      <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[9px] text-white/60 mt-0.5 truncate">{sub}</p>}
    </div>
  </motion.div>
)

// ── Term Progress Bar ──────────────────────────────────────────────────────────
const TermProgressBar = ({ value, isComplete }: { value: number; isComplete: boolean }) => {
  const pct = Math.min(Math.round(value), 100)

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wide flex items-center gap-1">
          <Target className="h-3 w-3" />
          Term Progress
        </span>
        <span className="text-[10px] font-bold text-white">
          {isComplete ? '🎉 100% Complete!' : `${pct}%`}
        </span>
      </div>

      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.8, delay: 0.6, type: 'spring', stiffness: 60 }}
          className={cn(
            'h-full rounded-full relative overflow-hidden',
            isComplete
              ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400'
              : 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400'
          )}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />
        </motion.div>
        {pct > 15 && (
          <div className="absolute inset-0 flex items-center pl-2">
            <span className="text-[8px] font-bold text-white drop-shadow-sm">{pct}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Animated Ring Around Avatar ──────────────────────────────────────────────
const AnimatedRing = ({ isOnline, isTermComplete }: { isOnline: boolean; isTermComplete: boolean }) => {
  const colors = isTermComplete
    ? 'from-yellow-400 via-amber-400 to-orange-400'
    : isOnline
    ? 'from-emerald-400 via-teal-400 to-cyan-400'
    : 'from-gray-400 via-gray-500 to-gray-600'

  return (
    <div className="absolute -inset-2.5">
      {/* Outer ring - rotates slowly */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-r opacity-70',
          colors
        )}
        style={{ borderRadius: '50%' }}
      />
      
      {/* Middle ring - rotates opposite direction */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'absolute inset-1 rounded-full bg-gradient-to-r opacity-50',
          colors
        )}
        style={{ borderRadius: '50%' }}
      />
      
      {/* Inner ring - pulses */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'absolute inset-2 rounded-full bg-gradient-to-r opacity-40',
          colors
        )}
        style={{ borderRadius: '50%' }}
      />

      {/* Sparkle dots that orbit around */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/60 shadow-lg"
          animate={{
            rotate: 360,
            translateX: ['-50%', '-50%'],
            translateY: ['-50%', '-50%'],
          }}
          transition={{
            duration: 6 + i * 0.5,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            left: '50%',
            top: '50%',
            transform: `rotate(${deg}deg) translateX(45px)`,
          }}
        />
      ))}
    </div>
  )
}

// ── Main Banner ───────────────────────────────────────────────────────────────
export function PupilBanner({
  fullName,
  className,
  class: pupilClass,
  classArm,
  currentTerm,
  currentSession,
  photoUrl,
  academicStats = {
    termProgress: '0/22',
    completedSubjects: 0,
    totalSubjects: TOTAL_SUBJECTS,
    averagePercentage: 0,
    marksObtained: 0,
    totalMarks: TOTAL_POSSIBLE_MARKS,
    pendingTheoryCount: 0,
  },
  onTabChange,
  onRefresh,
}: PupilBannerProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [avatarError, setAvatarError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showTermComplete, setShowTermComplete] = useState(false)
  const [quoteKey, setQuoteKey] = useState(0)
  const prevAvg = useRef(0)

  const STORAGE_KEY = 'pupil_session_start'

  // ─── Mount ──────────────────────────────────────────────────────────────────
  // Fixed: Use useCallback for initialization
  const initializeSession = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSessionStart(new Date(stored))
    } else {
      const now = new Date()
      localStorage.setItem(STORAGE_KEY, now.toISOString())
      setSessionStart(now)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    initializeSession()
    
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [initializeSession])

  // ─── Rotate quotes every 15 seconds ────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteKey((prev) => prev + 1)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // ─── Online/offline ────────────────────────────────────────────────────────
  useEffect(() => {
    const up = () => { setIsOnline(true); toast.info('🌐 Back online!', { duration: 3000 }) }
    const down = () => { setIsOnline(false); toast.warning('📡 You\'re offline.', { duration: 3000 }) }
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  // ─── Grade celebration ─────────────────────────────────────────────────────
  useEffect(() => {
    const cur = academicStats.averagePercentage
    if (cur > 0 && prevAvg.current > 0 && cur > prevAvg.current) {
      const { remark, emoji } = getRemarkData(cur)
      setShowCelebration(true)
      toast.success(`${emoji} You're doing ${remark.toLowerCase()}! Amazing!`, { duration: 5000, position: 'top-center' })
      setTimeout(() => setShowCelebration(false), 3500)
    }
    prevAvg.current = cur
  }, [academicStats.averagePercentage])

  // ─── Term complete ─────────────────────────────────────────────────────────
  // Fixed: Moved setShowTermComplete to a callback to avoid setState in effect
  const handleTermComplete = useCallback(() => {
    if (academicStats.completedSubjects === TOTAL_SUBJECTS && !showTermComplete) {
      setShowTermComplete(true)
      toast.success(`🎉 All ${TOTAL_SUBJECTS} subjects complete! 100% Term Progress!`, { duration: 8000, position: 'top-center' })
    }
  }, [academicStats.completedSubjects, showTermComplete])

  useEffect(() => {
    handleTermComplete()
  }, [handleTermComplete])

  // ─── Welcome toast ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (mounted && fullName) {
      const fn = getFirstName(fullName)
      setTimeout(() => toast.success(`👋 Welcome back, ${fn}! Ready to shine?`, { duration: 3000, icon: '🎒', position: 'top-center' }), 600)
    }
  }, [mounted, fullName])

  // ─── Refresh ───────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    if (!onRefresh || refreshing) return
    setRefreshing(true)
    toast.loading('🔄 Refreshing…', { duration: 1000 })
    onRefresh()
    setTimeout(() => { setRefreshing(false); toast.success('✅ Updated!', { duration: 2000 }) }, 1200)
  }

  // ── Generate deterministic confetti values ──────────────────────────────
  const confettiItems = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      delay: i * 0.04,
      color: CONFETTI_COLORS[i % 6],
      x: ((i * 137.5) % 100),
      rot: ((i * 73.7) % 360),
      duration: 2 + ((i * 31.3) % 3),
    }))
  }, [])

  // ─── Computed ──────────────────────────────────────────────────────────────
  const hour = currentTime?.getHours() ?? 9
  const greeting = useMemo(() => getGreeting(hour), [hour])
  const firstName = getFirstName(fullName || 'Student')

  const quote = useMemo(() => {
    const hourNow = new Date().getHours()
    return getPersonalizedQuote(hourNow, firstName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, quoteKey])

  const formattedDate = useMemo(() =>
    currentTime?.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) ?? '',
    [currentTime]
  )

  const formattedTime = useMemo(() =>
    currentTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) ?? '',
    [currentTime]
  )

  const onlineDuration = useMemo(() => {
    if (!currentTime || !sessionStart) return '00:00:00'
    const secs = Math.floor((currentTime.getTime() - sessionStart.getTime()) / 1000)
    const h = String(Math.floor(secs / 3600)).padStart(2, '0')
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }, [currentTime, sessionStart])

  const completed = academicStats.completedSubjects || 0
  const avg = academicStats.averagePercentage || 0
  const marksObtained = academicStats.marksObtained || 0
  const totalMarks = academicStats.totalMarks || TOTAL_POSSIBLE_MARKS
  const marksPercent = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0
  const isTermComplete = completed === TOTAL_SUBJECTS
  const termProgress = Math.round((completed / TOTAL_SUBJECTS) * 100)
  const showRemark = avg > 0
  const remarkData = getRemarkData(avg)
  const avatarLetter = firstName.charAt(0).toUpperCase()
  const StatusIcon = isOnline ? Wifi : WifiOff

  // ─── Skeleton ──────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 md:p-8 shadow-2xl mb-8">
        <div className="h-72 animate-pulse rounded-2xl bg-white/5" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, type: 'spring', stiffness: 100 }}
      className={cn(
        'relative overflow-hidden rounded-3xl shadow-2xl mb-8',
        'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
        className
      )}
      suppressHydrationWarning
    >
      {/* ── Confetti ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {(showCelebration || showTermComplete) && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {confettiItems.map((item) => (
              <ConfettiPiece 
                key={item.id}
                delay={item.delay}
                color={item.color}
                x={item.x}
                rot={item.rot}
                duration={item.duration}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Animated Background ─────────────────────────────────────────────── */}
      <BgShapes />

      {/* ── Radial glow blobs ─────────────────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* ── Refresh Button ─────────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.88 }}
        onClick={handleRefresh}
        disabled={refreshing}
        className="absolute top-3 right-3 z-30 p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all disabled:opacity-40 text-white"
        title="Refresh stats"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
      </motion.button>

      <div className="relative z-10 p-5 md:p-6">
        {/* ══════════════════════════════════════════════════════════════════
            TOP ROW — Meta Badges
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-1.5 mb-3"
        >
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-white/90 border border-white/10">
            <span className="text-sm">{greeting.emoji}</span>
            {formattedDate}
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-cyan-400/15 backdrop-blur-sm px-2.5 py-1 rounded-full text-cyan-200 border border-cyan-400/20">
            <Clock className="h-3 w-3" />
            {formattedTime}
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-white/70 border border-white/10">
            <Timer className="h-3 w-3" />
            {onlineDuration}
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border cursor-help backdrop-blur-sm',
                    isOnline
                      ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30'
                      : 'bg-gray-400/20 text-gray-300 border-gray-400/30'
                  )}
                >
                  <motion.span
                    animate={isOnline ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn('w-1.5 h-1.5 rounded-full', isOnline ? 'bg-emerald-400' : 'bg-gray-400')}
                  />
                  <StatusIcon className="h-2.5 w-2.5" />
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isOnline ? '✅ You are connected' : '❌ No internet connection'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-400/15 px-2.5 py-1 rounded-full text-violet-200 border border-violet-400/20">
            <GraduationCap className="h-3 w-3" />
            {currentTerm} Term
          </span>

          {isTermComplete && (
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="inline-flex items-center gap-1 text-[10px] font-bold bg-yellow-400/20 px-2.5 py-1 rounded-full text-yellow-200 border border-yellow-400/30"
            >
              🏆 Complete!
            </motion.span>
          )}
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            HERO ROW — Avatar with Animated Ring + Greeting + Quote
        ══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          {/* Avatar with animated rings */}
          <motion.div
            initial={{ scale: 0, rotate: -200 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
            className="relative shrink-0 self-center sm:self-auto"
          >
            {/* Animated rings around avatar */}
            <AnimatedRing isOnline={isOnline} isTermComplete={isTermComplete} />

            {/* Avatar */}
            <Avatar className="relative h-20 w-20 md:h-24 md:w-24 ring-0 shadow-2xl border-2 border-white/20">
              {photoUrl && !avatarError ? (
                <AvatarImage
                  src={photoUrl}
                  alt={firstName}
                  onError={() => setAvatarError(true)}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-3xl md:text-4xl font-extrabold">
                {avatarLetter}
              </AvatarFallback>
            </Avatar>

            {/* Status indicator */}
            <motion.div
              animate={isOnline ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center',
                isOnline ? 'bg-emerald-500' : 'bg-gray-500'
              )}
            >
              <StatusIcon className="h-2.5 w-2.5 text-white" />
            </motion.div>
          </motion.div>

          {/* Greeting + Quote */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                {greeting.text},{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-300 to-violet-300">
                  {firstName}
                </span>
                !
              </h1>
              <p className="text-xs md:text-sm text-white/60 font-medium mt-0.5 mb-1.5">
                {greeting.sub}
              </p>
            </motion.div>

            {/* Quote */}
            {quote.text && (
              <motion.div
                key={quoteKey}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
                className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/10 max-w-lg mb-2"
              >
                <Quote className="h-3 w-3 text-amber-400/60 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/80 text-[10px] sm:text-xs italic leading-relaxed line-clamp-2">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="text-[8px] text-white/40 mt-0.5 font-medium">— {quote.author}</p>
                </div>
              </motion.div>
            )}

            {/* Class Badges */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap gap-1.5"
            >
              {(pupilClass) && (
                <Badge className="bg-white/10 text-white border border-white/15 hover:bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-semibold text-[10px] gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {pupilClass}
                </Badge>
              )}
              {classArm && (
                <Badge className="bg-white/10 text-white border border-white/15 hover:bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-semibold text-[10px] gap-1">
                  <Pencil className="h-3 w-3" />
                  {classArm}
                </Badge>
              )}
              <Badge className="bg-white/10 text-white border border-white/15 hover:bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-semibold text-[10px] gap-1">
                <BookOpen className="h-3 w-3" />
                {TOTAL_SUBJECTS} Subjects
              </Badge>
              <Badge className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-semibold text-[10px] gap-1">
                <Target className="h-3 w-3" />
                {termProgress}% Complete
              </Badge>
              {academicStats.pendingTheoryCount !== undefined && academicStats.pendingTheoryCount > 0 && (
                <Badge className="bg-orange-400/20 text-orange-200 border border-orange-400/30 backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-semibold text-[10px] gap-1">
                  <FileText className="h-3 w-3" />
                  {academicStats.pendingTheoryCount} Pending
                </Badge>
              )}
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STAT CARDS GRID
        ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <StatCard
            delay={0.6}
            gradient={isTermComplete ? 'from-yellow-600 to-amber-700' : 'from-emerald-600 to-emerald-800'}
            icon={<CheckCircle2 className="h-3.5 w-3.5 text-white" />}
            value={
              <span className="flex items-baseline gap-0.5">
                {completed}
                <span className="text-sm font-semibold opacity-70">/{TOTAL_SUBJECTS}</span>
              </span>
            }
            label="Subjects Done"
            sub={isTermComplete ? '🎉 Complete!' : `${termProgress}%`}
            pulse={isTermComplete}
          />

          <StatCard
            delay={0.68}
            gradient="from-amber-600 to-amber-800"
            icon={<FileText className="h-3.5 w-3.5 text-white" />}
            value={marksObtained > 0 ? marksObtained.toLocaleString() : '—'}
            label="Marks Obtained"
            sub={marksObtained > 0 ? `${marksPercent}%` : 'No marks'}
          />

          <StatCard
            delay={0.76}
            gradient="from-cyan-600 to-cyan-800"
            icon={<TrendingUp className="h-3.5 w-3.5 text-white" />}
            value={avg > 0 ? `${avg.toFixed(1)}%` : '—'}
            label="Average Score"
            sub={avg > 0 ? remarkData.remark : 'No data'}
          />

          <StatCard
            delay={0.84}
            gradient={showRemark ? remarkData.gradient : 'from-slate-600 to-slate-700'}
            icon={<Trophy className="h-3.5 w-3.5 text-white" />}
            value={<span className="text-2xl">{showRemark ? remarkData.emoji : '—'}</span>}
            label="Remark"
            sub={showRemark ? remarkData.remark : 'No data'}
            pulse={showRemark && avg >= 80}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TERM PROGRESS BAR
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/5"
        >
          <TermProgressBar value={termProgress} isComplete={isTermComplete} />
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            CELEBRATION / ENCOURAGEMENT BANNERS
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isTermComplete && (
            <motion.div
              key="term-complete"
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="mt-2 flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-2 border border-yellow-400/30"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <PartyPopper className="h-4 w-4 text-yellow-300 shrink-0" />
              </motion.div>
              <p className="text-xs font-bold text-yellow-100 flex-1">
                🎉 <span className="text-yellow-300">{firstName}</span> achieved <span className="text-yellow-300 font-extrabold">100%</span>! 🌟
              </p>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-300 shrink-0" />
              </motion.div>
            </motion.div>
          )}

          {!isTermComplete && termProgress >= 70 && (
            <motion.div
              key="great-progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1 }}
              className="mt-2 flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-2 border border-emerald-400/30"
            >
              <Zap className="h-4 w-4 text-emerald-300 shrink-0 animate-pulse" />
              <p className="text-xs font-semibold text-emerald-100">
                ⚡ {termProgress}% - Almost there, <span className="text-emerald-200">{firstName}</span>!
              </p>
              <Sparkles className="h-3.5 w-3.5 text-emerald-300 shrink-0 ml-auto animate-pulse" />
            </motion.div>
          )}

          {!isTermComplete && termProgress > 0 && termProgress < 70 && (
            <motion.div
              key="encouragement"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1 }}
              className="mt-2 flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-violet-500/20 backdrop-blur-sm rounded-xl p-2 border border-blue-400/30"
            >
              <Heart className="h-4 w-4 text-blue-300 shrink-0 animate-pulse" />
              <p className="text-xs font-semibold text-blue-100">
                💪 {termProgress}% - Keep going, <span className="text-blue-200">{firstName}</span>!
              </p>
              <Rocket className="h-3.5 w-3.5 text-blue-300 shrink-0 ml-auto animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default PupilBanner