/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Rocket, Clock, Timer, Wifi, WifiOff, CheckCircle2, RefreshCw,
  GraduationCap, TrendingUp, Quote, BookOpen, Star, PartyPopper,
  FileText, Pencil, Heart, Zap, Trophy, Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

// ── Types ────────────────────────────────────────────────────────────────────
interface AcademicStats {
  termProgress: string
  completedSubjects: number
  totalSubjects: number
  averagePercentage: number
  marksObtained: number
  totalMarks: number
  pendingTheoryCount: number
}

interface PupilBannerProps {
  fullName: string
  className?: string
  class?: string
  classArm?: string
  currentTerm: string
  currentSession: string
  pupilId?: string
  photoUrl?: string
  onTabChange?: (tab: string) => void
  onRefresh?: () => void
  academicStats?: Partial<AcademicStats>
}

interface BgShape {
  shape: 'circle' | 'star'
  w: number
  h: number
  color: string
  delay: number
  top?: string
  left?: string
  right?: string
  bottom?: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const TOTAL_SUBJECTS = 22
const MINIMUM_SUBJECTS = 20
const MARKS_PER_SUBJECT = 100
const QUOTE_ROTATION_MS = 15000

const PRIMARY_SUBJECTS = [
  'English', 'Mathematics', 'Basic Science', 'Social Studies', 'Phonics',
  'Yoruba', 'Civic Education', 'Creative Arts', 'Agriculture',
  'Computer Education', 'Christian Religious Studies', 'French',
  'Quantitative Reasoning', 'Verbal Reasoning', 'Music', 'Handwriting',
  'Literature', 'Vocational Aptitude', 'History', 'Security Education',
  'Home Economics', 'Physical and Health Education',
]

const TITLE_PREFIXES = ['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms']

const CONFETTI_COLORS = [
  'bg-pink-400', 'bg-yellow-400', 'bg-cyan-400',
  'bg-violet-400', 'bg-emerald-400', 'bg-orange-400',
]

const EMPTY_STATS: AcademicStats = {
  termProgress: `0/${TOTAL_SUBJECTS}`,
  completedSubjects: 0,
  totalSubjects: TOTAL_SUBJECTS,
  averagePercentage: 0,
  marksObtained: 0,
  totalMarks: 0,
  pendingTheoryCount: 0,
}

const QUOTES = {
  morning: [
    { text: "Every morning is a new chance to shine, {name}! 🌟", author: "School Motto" },
    { text: "Today is a great day to learn something amazing, {name}!", author: "Your Teacher" },
    { text: "You are smart, kind, and capable, {name}. Believe it!", author: "Vincollins" },
    { text: "Rise and shine, {name}! The world is waiting for your brilliance!", author: "Vincollins" },
  ],
  afternoon: [
    { text: "You're doing amazing, {name}! Keep going strong!", author: "Your Teacher" },
    { text: "Hard work + fun = success! You've got this, {name}!", author: "School Motto" },
    { text: "You're a star, {name}! Never forget how bright you shine!", author: "Vincollins" },
    { text: "Stay curious, {name}! The world is full of wonders to discover!", author: "Your Teacher" },
  ],
  evening: [
    { text: "You did great today, {name}! Rest and dream big!", author: "Your Teacher" },
    { text: "Sleep well, {name}. Tomorrow brings new adventures!", author: "School Motto" },
    { text: "The best part of learning is that it never ends, {name}. Good night!", author: "Your Teacher" },
    { text: "Sleep tight, {name}! Tomorrow you'll wake up even stronger!", author: "Your Teacher" },
  ],
}

const REMARK_TIERS = [
  { min: 80, remark: 'Excellent', emoji: '🏆', gradient: 'from-yellow-500 to-amber-600' },
  { min: 70, remark: 'Very Good', emoji: '🌟', gradient: 'from-green-500 to-emerald-600' },
  { min: 60, remark: 'Good', emoji: '⭐', gradient: 'from-blue-500 to-cyan-600' },
  { min: 50, remark: 'Satisfactory', emoji: '📚', gradient: 'from-indigo-500 to-violet-600' },
  { min: 45, remark: 'Average', emoji: '📖', gradient: 'from-purple-500 to-pink-600' },
  { min: 0, remark: 'Fair', emoji: '💪', gradient: 'from-orange-500 to-red-600' },
]

const GREETINGS = [
  { until: 6, text: 'Good Night', emoji: '🌙', sub: 'Rest well, champion!' },
  { until: 12, text: 'Good Morning', emoji: '☀️', sub: 'Ready to be amazing today?' },
  { until: 17, text: 'Good Afternoon', emoji: '🌤️', sub: "You're doing so well!" },
  { until: 21, text: 'Good Evening', emoji: '🌅', sub: 'Time to review your day!' },
  { until: 24, text: 'Good Night', emoji: '🌙', sub: 'Sweet dreams, superstar!' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────
const getFirstName = (fullName: string): string => {
  if (!fullName) return 'Student'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length < 2) return parts[0] || 'Student'

  const [first, second] = parts
  if (TITLE_PREFIXES.includes(first.toLowerCase())) return second || first
  return second.length <= first.length ? second : first
}

const getQuoteSet = (hour: number) => {
  if (hour >= 17) return QUOTES.evening
  if (hour >= 12) return QUOTES.afternoon
  return QUOTES.morning
}

const getPersonalizedQuote = (hour: number, firstName: string) => {
  const quoteSet = getQuoteSet(hour)
  const now = new Date()
  const seed = now.getDate() + now.getHours() + now.getMinutes()
  const quote = quoteSet[seed % quoteSet.length]
  return {
    text: quote.text.replace(/\{name\}/g, firstName),
    author: quote.author,
  }
}

const getGreeting = (hour: number) =>
  GREETINGS.find(g => hour < g.until) ?? GREETINGS[GREETINGS.length - 1]

const getRemarkData = (avg: number) =>
  REMARK_TIERS.find(t => avg >= t.min) ?? REMARK_TIERS[REMARK_TIERS.length - 1]

const formatDuration = (start: Date | null, current: Date | null): string => {
  if (!start || !current) return '00:00:00'
  const secs = Math.max(0, Math.floor((current.getTime() - start.getTime()) / 1000))
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ── Animated Background Shapes ───────────────────────────────────────────────
const BG_SHAPES: BgShape[] = [
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
]

const BgShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {BG_SHAPES.map((s, i) => {
      const positionStyle = { top: s.top, left: s.left, right: s.right, bottom: s.bottom }
      return s.shape === 'circle' ? (
        <motion.div
          key={i}
          className={cn('absolute rounded-full', s.color)}
          style={{ width: s.w, height: s.h, ...positionStyle }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 8 + i * 1.5, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <motion.div
          key={i}
          className={cn('absolute', s.color)}
          style={positionStyle}
          animate={{ rotate: [0, 25, -25, 0], scale: [1, 1.3, 1], y: [0, -10, 0] }}
          transition={{ duration: 5 + i * 0.8, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Star size={s.w} fill="currentColor" />
        </motion.div>
      )
    })}
  </div>
)

// ── Confetti ─────────────────────────────────────────────────────────────────
const ConfettiPiece = ({ delay, color, x, rot, duration }: {
  delay: number; color: string; x: number; rot: number; duration: number;
}) => (
  <motion.div
    initial={{ x: `${x}%`, y: -20, rotate: rot, opacity: 1, scale: 0 }}
    animate={{ y: '110vh', rotate: rot + 720, opacity: 0, scale: 1 }}
    transition={{ duration, delay, ease: 'easeOut' }}
    className={cn('absolute w-2.5 h-2.5 rounded-sm', color)}
  />
)

// ── Meta Badge ───────────────────────────────────────────────────────────────
const MetaBadge = ({
  icon: Icon, children, tone = 'default', className: cls, pulse,
}: {
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  tone?: 'default' | 'cyan' | 'violet' | 'emerald' | 'gray' | 'yellow' | 'orange'
  className?: string
  pulse?: boolean
}) => {
  const tones = {
    default: 'bg-white/10 text-white/90 border-white/10',
    cyan: 'bg-cyan-400/15 text-cyan-200 border-cyan-400/20',
    violet: 'bg-violet-400/15 text-violet-200 border-violet-400/20',
    emerald: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
    gray: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
    yellow: 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30',
    orange: 'bg-orange-400/20 text-orange-200 border-orange-400/30',
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm',
      tones[tone], cls
    )}>
      {pulse && (
        <motion.span
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn('w-1.5 h-1.5 rounded-full',
            tone === 'emerald' ? 'bg-emerald-400' : 'bg-gray-400'
          )}
        />
      )}
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  )
}

// ── Class Badge ──────────────────────────────────────────────────────────────
const ClassBadge = ({
  icon: Icon, children, tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  tone?: 'default' | 'emerald' | 'orange'
}) => {
  const tones = {
    default: 'bg-white/10 text-white border-white/15 hover:bg-white/20',
    emerald: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
    orange: 'bg-orange-400/20 text-orange-200 border-orange-400/30',
  }
  return (
    <Badge className={cn(
      'border backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-semibold text-[10px] gap-1',
      tones[tone]
    )}>
      <Icon className="h-3 w-3" />
      {children}
    </Badge>
  )
}

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  gradient, icon, value, label, sub, pulse, delay = 0,
}: {
  gradient: string
  icon: React.ReactNode
  value: React.ReactNode
  label: string
  sub?: string
  pulse?: boolean
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 180, damping: 18 }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative overflow-hidden rounded-2xl shadow-xl cursor-default group"
  >
    <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-colors duration-500" />
    <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/5 blur-xl" />

    <div className="relative z-10 p-4 flex flex-col items-center text-center min-h-[130px] justify-between">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md shadow-lg ring-1 ring-white/20">
          {icon}
        </div>
        {pulse && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-white shadow-lg shadow-white/50"
          />
        )}
      </div>

      <p className="text-2xl md:text-3xl font-black text-white drop-shadow-md leading-none tracking-tight">
        {value}
      </p>

      <div className="mt-2 space-y-0.5">
        <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest">{label}</p>
        {sub && <p className="text-[9px] text-white/70 font-medium truncate max-w-[140px] mx-auto">{sub}</p>}
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </motion.div>
)

// ── Term Progress Bar ────────────────────────────────────────────────────────
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

// ── Animated Ring ────────────────────────────────────────────────────────────
const AnimatedRing = ({ isOnline, isTermComplete }: { isOnline: boolean; isTermComplete: boolean }) => {
  const colors = isTermComplete
    ? 'from-yellow-400 via-amber-400 to-orange-400'
    : isOnline
      ? 'from-emerald-400 via-teal-400 to-cyan-400'
      : 'from-gray-400 via-gray-500 to-gray-600'

  const ringLayers = [
    { inset: 'inset-0', opacity: 'opacity-70', duration: 12, direction: 360 },
    { inset: 'inset-1', opacity: 'opacity-50', duration: 8, direction: -360 },
  ]

  return (
    <div className="absolute -inset-2.5">
      {ringLayers.map((l, i) => (
        <motion.div
          key={i}
          animate={{ rotate: l.direction }}
          transition={{ duration: l.duration, repeat: Infinity, ease: 'linear' }}
          className={cn('absolute rounded-full bg-gradient-to-r', l.inset, l.opacity, colors)}
          style={{ borderRadius: '50%' }}
        />
      ))}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={cn('absolute inset-2 rounded-full bg-gradient-to-r opacity-40', colors)}
        style={{ borderRadius: '50%' }}
      />
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/60 shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 6 + i * 0.5, repeat: Infinity, ease: 'linear' }}
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

// ── Encouragement Banner ────────────────────────────────────────────────────
const EncouragementBanner = ({
  variant, firstName, completed,
}: {
  variant: 'complete' | 'almost' | 'keepgoing'
  firstName: string
  completed: number
}) => {
  const configs = {
    complete: {
      bg: 'from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-yellow-400/30',
      textColor: 'text-yellow-100',
      leftIcon: (
        <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
          <PartyPopper className="h-4 w-4 text-yellow-300 shrink-0" />
        </motion.div>
      ),
      rightIcon: (
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Sparkles className="h-3.5 w-3.5 text-yellow-300 shrink-0" />
        </motion.div>
      ),
      message: (
        <>🎉 <span className="text-yellow-300">{firstName}</span> completed <span className="text-yellow-300 font-extrabold">{completed}/{TOTAL_SUBJECTS}</span> subjects! 🌟</>
      ),
    },
    almost: {
      bg: 'from-emerald-500/20 to-cyan-500/20 border-emerald-400/30',
      textColor: 'text-emerald-100',
      leftIcon: <Zap className="h-4 w-4 text-emerald-300 shrink-0 animate-pulse" />,
      rightIcon: <Sparkles className="h-3.5 w-3.5 text-emerald-300 shrink-0 ml-auto animate-pulse" />,
      message: (<>⚡ {completed}/{TOTAL_SUBJECTS} - Almost there, <span className="text-emerald-200">{firstName}</span>!</>),
    },
    keepgoing: {
      bg: 'from-blue-500/20 to-violet-500/20 border-blue-400/30',
      textColor: 'text-blue-100',
      leftIcon: <Heart className="h-4 w-4 text-blue-300 shrink-0 animate-pulse" />,
      rightIcon: <Rocket className="h-3.5 w-3.5 text-blue-300 shrink-0 ml-auto animate-bounce" />,
      message: (<>💪 {completed}/{TOTAL_SUBJECTS} - Keep going, <span className="text-blue-200">{firstName}</span>!</>),
    },
  }
  const cfg = configs[variant]
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: variant === 'complete' ? 0.5 : 1, type: 'spring' }}
      className={cn('mt-2 flex items-center gap-2 backdrop-blur-sm rounded-xl p-2 border bg-gradient-to-r', cfg.bg)}
    >
      {cfg.leftIcon}
      <p className={cn('text-xs font-bold flex-1', cfg.textColor)}>{cfg.message}</p>
      {cfg.rightIcon}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN BANNER
// ═══════════════════════════════════════════════════════════════════
export function PupilBanner({
  fullName,
  className,
  class: pupilClass,
  classArm,
  currentTerm,
  currentSession,
  pupilId,
  photoUrl,
  onRefresh,
  academicStats: propsAcademicStats,
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
  const [academicStats, setAcademicStats] = useState<AcademicStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const prevAvg = useRef(0)
  const hasShownTermCompleteToast = useRef(false)

  // ─── Mount + Live Clock + Session Timer ────────────────────────────────
  useEffect(() => {
    const now = new Date()
    setMounted(true)
    setCurrentTime(now)
    setSessionStart(now)
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ─── Reset timer on user switch ────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !pupilId) return
    setSessionStart(new Date())
  }, [pupilId, mounted])

  // ─── Fetch Stats ───────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (propsAcademicStats) {
      const completedSubjects = propsAcademicStats.completedSubjects || 0
      const avg = propsAcademicStats.averagePercentage || 0
      let marksObtained = propsAcademicStats.marksObtained || 0

      if (marksObtained === 0 && avg > 0 && completedSubjects > 0) {
        marksObtained = Math.round(avg * completedSubjects)
      }

      setAcademicStats({
        termProgress: `${completedSubjects}/${TOTAL_SUBJECTS}`,
        completedSubjects,
        totalSubjects: TOTAL_SUBJECTS,
        averagePercentage: avg,
        marksObtained,
        totalMarks: TOTAL_SUBJECTS * MARKS_PER_SUBJECT,
        pendingTheoryCount: propsAcademicStats.pendingTheoryCount || 0,
      })
      setLoading(false)
      return
    }

    if (!pupilId || !currentTerm || !currentSession) {
      setAcademicStats(EMPTY_STATS)
      setLoading(false)
      return
    }

    try {
      const { data: scores, error } = await supabase
        .from('primary_scores')
        .select('subject, ca_score, exam_score, total_score')
        .eq('student_id', pupilId)
        .eq('term', currentTerm)
        .eq('academic_year', currentSession)

      if (error || !scores?.length) {
        setAcademicStats(EMPTY_STATS)
        setLoading(false)
        return
      }

      const subjectLookup = new Map(PRIMARY_SUBJECTS.map(s => [s.toLowerCase(), s]))
      const subjectScoreMap: Record<string, { ca: number; exam: number; total: number }> = {}

      scores.forEach((s: any) => {
        const matchedSubject = subjectLookup.get(s.subject?.toLowerCase())
        if (matchedSubject) {
          subjectScoreMap[matchedSubject] = {
            ca: s.ca_score || 0,
            exam: s.exam_score || 0,
            total: s.total_score || 0,
          }
        }
      })

      let completedSubjects = 0
      let totalMarksObtained = 0

      Object.values(subjectScoreMap).forEach(({ ca, exam, total }) => {
        if (ca > 0 && exam > 0) {
          completedSubjects++
          totalMarksObtained += total
        }
      })

      const avgPercentage = completedSubjects > 0
        ? Math.round((totalMarksObtained / completedSubjects) * 100) / 100
        : 0

      setAcademicStats({
        termProgress: `${completedSubjects}/${TOTAL_SUBJECTS}`,
        completedSubjects,
        totalSubjects: TOTAL_SUBJECTS,
        averagePercentage: avgPercentage,
        marksObtained: totalMarksObtained,
        totalMarks: TOTAL_SUBJECTS * MARKS_PER_SUBJECT,
        pendingTheoryCount: 0,
      })
    } catch {
      setAcademicStats(EMPTY_STATS)
    } finally {
      setLoading(false)
    }
  }, [pupilId, currentTerm, currentSession, propsAcademicStats])

  useEffect(() => {
    void fetchStats()
  }, [fetchStats])

  // ─── Quote rotation ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setQuoteKey(p => p + 1), QUOTE_ROTATION_MS)
    return () => clearInterval(interval)
  }, [])

  // ─── Online/offline ────────────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSessionStart(new Date())
      toast.info('🌐 Back online!', { duration: 3000 })
    }
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('📡 You\'re offline.', { duration: 3000 })
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // ─── Grade celebration ─────────────────────────────────────────────────
  useEffect(() => {
    const cur = academicStats.averagePercentage
    if (cur > 0 && prevAvg.current > 0 && cur > prevAvg.current) {
      const { remark, emoji } = getRemarkData(cur)
      setShowCelebration(true)
      toast.success(`${emoji} You're doing ${remark.toLowerCase()}! Amazing!`, { duration: 5000, position: 'top-center' })
      const t = setTimeout(() => setShowCelebration(false), 3500)
      prevAvg.current = cur
      return () => clearTimeout(t)
    }
    prevAvg.current = cur
  }, [academicStats.averagePercentage])

  // ─── Term complete ─────────────────────────────────────────────────────
  useEffect(() => {
    if (
      academicStats.completedSubjects >= MINIMUM_SUBJECTS &&
      !hasShownTermCompleteToast.current
    ) {
      hasShownTermCompleteToast.current = true
      setShowTermComplete(true)
      toast.success(
        `🎉 ${academicStats.completedSubjects} subjects complete! Great job!`,
        { duration: 8000, position: 'top-center' }
      )
    }
  }, [academicStats.completedSubjects])

  // ─── Welcome toast ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !fullName || loading) return
    const fn = getFirstName(fullName)
    const t = setTimeout(
      () => toast.success(`👋 Welcome back, ${fn}! Ready to shine?`, { duration: 3000, icon: '🎒', position: 'top-center' }),
      600
    )
    return () => clearTimeout(t)
  }, [mounted, fullName, loading])

  // ─── Refresh ───────────────────────────────────────────────────────────
  const handleRefresh = () => {
    if ((!onRefresh && !pupilId) || refreshing) return
    setRefreshing(true)
    toast.loading('🔄 Refreshing…', { duration: 1000 })
    if (onRefresh) {
      onRefresh()
    } else {
      void fetchStats()
    }
    setTimeout(() => {
      setRefreshing(false)
      toast.success('✅ Updated!', { duration: 2000 })
    }, 1200)
  }

  // ─── Confetti ──────────────────────────────────────────────────────────
  const confettiItems = useMemo(() => (
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      delay: i * 0.04,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      x: (i * 137.5) % 100,
      rot: (i * 73.7) % 360,
      duration: 2 + (i * 31.3) % 3,
    }))
  ), [])

  // ─── Computed values ───────────────────────────────────────────────────
  const firstName = getFirstName(fullName || 'Student')
  const hour = currentTime?.getHours() ?? 9
  const greeting = useMemo(() => getGreeting(hour), [hour])
  const quote = useMemo(
    () => getPersonalizedQuote(new Date().getHours(), firstName),
    [firstName, quoteKey]
  )

  const formattedDate = currentTime?.toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }) ?? ''
  const formattedTime = currentTime?.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }) ?? ''
  const onlineDuration = useMemo(
    () => formatDuration(sessionStart, currentTime),
    [currentTime, sessionStart]
  )

  const { completedSubjects: completed, averagePercentage: avg, marksObtained, pendingTheoryCount } = academicStats
  const isComplete = completed >= MINIMUM_SUBJECTS
  const termProgress = Math.min(Math.round((completed / TOTAL_SUBJECTS) * 100), 100)
  const showRemark = avg > 0
  const remarkData = getRemarkData(avg)
  const avatarLetter = firstName.charAt(0).toUpperCase()
  const StatusIcon = isOnline ? Wifi : WifiOff

  const encouragement: 'complete' | 'almost' | 'keepgoing' | null = isComplete
    ? 'complete'
    : completed >= 15
      ? 'almost'
      : completed > 0
        ? 'keepgoing'
        : null

  // ─── Skeleton ──────────────────────────────────────────────────────────
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
      {/* Confetti */}
      <AnimatePresence>
        {(showCelebration || showTermComplete) && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {confettiItems.map(item => <ConfettiPiece key={item.id} {...item} />)}
          </div>
        )}
      </AnimatePresence>

      {/* Backgrounds */}
      <BgShapes />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Refresh Button */}
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
        {/* Top Meta Badges */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center gap-1.5 mb-3"
        >
          <MetaBadge>
            <span className="text-sm">{greeting.emoji}</span>
            {formattedDate}
          </MetaBadge>

          <MetaBadge icon={Clock} tone="cyan" className="font-mono">
            {formattedTime}
          </MetaBadge>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-white/70 border border-white/10 cursor-help">
                  <Timer className="h-3 w-3" />
                  {onlineDuration}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>⏱️ Session time</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <MetaBadge tone={isOnline ? 'emerald' : 'gray'} pulse={isOnline}>
                    <StatusIcon className="h-2.5 w-2.5" />
                    {isOnline ? 'Online' : 'Offline'}
                  </MetaBadge>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isOnline ? '✅ You are connected' : '❌ No internet connection'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <MetaBadge icon={GraduationCap} tone="violet">
            {currentTerm} Term
          </MetaBadge>

          {isComplete && (
            <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <MetaBadge tone="yellow">
                🏆 {completed}/{TOTAL_SUBJECTS} Complete!
              </MetaBadge>
            </motion.span>
          )}
        </motion.div>

        {/* Hero Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -200 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
            className="relative shrink-0 self-center sm:self-auto"
          >
            <AnimatedRing isOnline={isOnline} isTermComplete={isComplete} />

            <Avatar className="relative h-20 w-20 md:h-24 md:w-24 ring-0 shadow-2xl border-2 border-white/20">
              {photoUrl && !avatarError && (
                <AvatarImage src={photoUrl} alt={firstName} onError={() => setAvatarError(true)} className="object-cover" />
              )}
              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-3xl md:text-4xl font-extrabold">
                {avatarLetter}
              </AvatarFallback>
            </Avatar>

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

          <div className="flex-1 min-w-0">
            <motion.div initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                {greeting.text},{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-300 to-violet-300">
                  {firstName}
                </span>!
              </h1>
              <p className="text-xs md:text-sm text-white/60 font-medium mt-0.5 mb-1.5">{greeting.sub}</p>
            </motion.div>

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

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap gap-1.5"
            >
              {pupilClass && <ClassBadge icon={GraduationCap}>{pupilClass}</ClassBadge>}
              {classArm && <ClassBadge icon={Pencil}>{classArm}</ClassBadge>}
              <ClassBadge icon={BookOpen}>{TOTAL_SUBJECTS} Subjects</ClassBadge>
              <ClassBadge icon={Target} tone="emerald">{termProgress}% Complete</ClassBadge>
              {pendingTheoryCount > 0 && (
                <ClassBadge icon={FileText} tone="orange">{pendingTheoryCount} Pending</ClassBadge>
              )}
            </motion.div>
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <StatCard
            delay={0.6}
            gradient={isComplete ? 'from-yellow-500 via-amber-500 to-orange-600' : 'from-emerald-500 via-emerald-600 to-teal-700'}
            icon={<CheckCircle2 className="h-4 w-4 text-white" />}
            value={
              <span className="flex items-baseline justify-center gap-0.5">
                {completed}
                <span className="text-base font-bold opacity-60">/{TOTAL_SUBJECTS}</span>
              </span>
            }
            label="Subjects Done"
            sub={isComplete ? `✅ ${MINIMUM_SUBJECTS}+ Complete!` : `${termProgress}% completed`}
            pulse={isComplete}
          />

          <StatCard
            delay={0.68}
            gradient="from-amber-500 via-amber-600 to-orange-700"
            icon={<FileText className="h-4 w-4 text-white" />}
            value={marksObtained > 0 ? marksObtained.toLocaleString() : '—'}
            label="Marks Obtained"
            sub={marksObtained > 0 ? `from ${completed} subjects` : 'No marks yet'}
          />

          <StatCard
            delay={0.76}
            gradient="from-cyan-500 via-cyan-600 to-blue-700"
            icon={<TrendingUp className="h-4 w-4 text-white" />}
            value={avg > 0 ? `${avg.toFixed(2)}%` : '—'}
            label="Average Score"
            sub={avg > 0 ? remarkData.remark : 'No data yet'}
          />

          <StatCard
            delay={0.84}
            gradient={showRemark ? remarkData.gradient : 'from-slate-500 via-slate-600 to-slate-700'}
            icon={<Trophy className="h-4 w-4 text-white" />}
            value={<span className="text-3xl md:text-4xl">{showRemark ? remarkData.emoji : '—'}</span>}
            label="Remark"
            sub={showRemark ? remarkData.remark : 'No data yet'}
            pulse={showRemark && avg >= 80}
          />
        </div>

        {/* Term Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/5"
        >
          <TermProgressBar value={termProgress} isComplete={isComplete} />
        </motion.div>

        {/* Encouragement Banner */}
        <AnimatePresence mode="wait">
          {encouragement && (
            <EncouragementBanner
              key={encouragement}
              variant={encouragement}
              firstName={firstName}
              completed={completed}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default PupilBanner