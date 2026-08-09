/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/AdminBanner.tsx
'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  X, ChevronRight, Info, CheckCircle, AlertCircle, AlertTriangle,
  Shield, Activity, TrendingUp, Zap, Sun, Moon, Sunset, Sunrise,
  Calendar, Clock, Timer, Quote, GraduationCap, RefreshCw,
  BookOpen, Users, Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────
type BannerType  = 'info' | 'success' | 'warning' | 'error'
type TimePeriod  = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night'

interface BannerMessage {
  id: string
  title: string
  message: string
  type: BannerType
  dismissible: boolean
  action?: { label: string; href: string }
}

interface AdminBannerProps {
  className?: string
  onDismiss?: () => void
  userName?: string
  termInfo?: { term: string; session: string } | null
}

// ── Quote bank (unchanged) ─────────────────────────────────────────────────────
const QUOTE_BANK: Record<TimePeriod, Array<{ text: string; author: string; role: string }>> = {
  dawn: [
    { text: 'The secret of getting ahead is getting started. Each dawn is a new canvas — paint it with purpose.', author: 'Mark Twain', role: 'Author & Philosopher' },
    { text: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela', role: 'Statesman & Educator' },
    { text: 'Rise early. Work hard. Strike oil. The early administrator sets the tone for the whole school.', author: 'J. Paul Getty', role: 'Adapted for Educators' },
  ],
  morning: [
    { text: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B.B. King', role: 'Musician & Lifelong Learner' },
    { text: 'Teaching is the one profession that creates all other professions.', author: 'Unknown', role: 'Educational Wisdom' },
    { text: 'Children must be taught how to think, not what to think.', author: 'Margaret Mead', role: 'Cultural Anthropologist' },
    { text: 'A good teacher can inspire hope, ignite the imagination, and instil a love of learning.', author: 'Brad Henry', role: 'Governor & Education Advocate' },
    { text: 'Your work today shapes the leaders of tomorrow. Begin with intention.', author: 'Educational Wisdom', role: 'School Leadership' },
  ],
  midday: [
    { text: 'In the middle of every difficulty lies opportunity. Keep going — you are halfway there.', author: 'Albert Einstein', role: 'Theoretical Physicist' },
    { text: 'Excellence is not a destination; it is a continuous journey that never ends.', author: 'Brian Tracy', role: 'Educator & Author' },
    { text: 'Leadership and learning are indispensable to each other.', author: 'John F. Kennedy', role: '35th US President' },
    { text: 'The function of education is to teach one to think intensively and to think critically.', author: 'Martin Luther King Jr.', role: 'Civil Rights Leader' },
  ],
  afternoon: [
    { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius', role: 'Philosopher & Teacher' },
    { text: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.', author: 'Benjamin Franklin', role: 'Polymath & Statesman' },
    { text: 'The purpose of education is to replace an empty mind with an open one.', author: 'Malcolm Forbes', role: 'Publisher & Educator' },
    { text: 'Strive not to be a success, but rather to be of value to those around you.', author: 'Albert Einstein', role: 'Theoretical Physicist' },
  ],
  evening: [
    { text: 'At the end of every day, ask yourself: what did I do today to help a child believe in themselves?', author: 'Educational Wisdom', role: 'School Leadership' },
    { text: 'Reflect on what went well today. Tomorrow is another opportunity to do even better.', author: 'John Dewey', role: 'Educational Reformer' },
    { text: "The work of education is never done. But every effort planted today blooms in tomorrow's leaders.", author: 'Horace Mann', role: 'Father of Modern Education' },
    { text: 'What we learn with pleasure we never forget.', author: 'Alfred Mercier', role: 'Educator & Poet' },
  ],
  night: [
    { text: "Rest is not idleness. The mind needs stillness to process today's lessons and prepare for tomorrow's challenges.", author: 'John Lubbock', role: 'Naturalist & Politician' },
    { text: 'The stars cannot shine without darkness. Every late hour spent on education lights a path for others.', author: 'Educational Wisdom', role: 'School Leadership' },
    { text: 'Great achievements require patience and perseverance. What you nurture tonight will blossom at dawn.', author: 'Ancient Proverb', role: 'Educational Wisdom' },
    { text: "Tomorrow is a new day with new opportunities to impact lives. Rest well — you've earned it.", author: 'Educational Wisdom', role: 'School Leadership' },
  ],
}

// ── Banner config ──────────────────────────────────────────────────────────────
const BANNER_CFG: Record<BannerType, {
  bg: string; border: string; text: string; icon: string
  pill: string; action: string; Icon: React.ElementType
  bar: string
}> = {
  info:    { bg: 'bg-blue-50/80',    border: 'border-blue-200/70',    text: 'text-blue-800',    icon: 'text-blue-500',    pill: 'bg-blue-100 text-blue-700',    action: 'bg-blue-100 hover:bg-blue-200 text-blue-800',    Icon: Info,          bar: 'bg-blue-500'    },
  success: { bg: 'bg-emerald-50/80', border: 'border-emerald-200/70', text: 'text-emerald-800', icon: 'text-emerald-500', pill: 'bg-emerald-100 text-emerald-700', action: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800', Icon: CheckCircle,   bar: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50/80',   border: 'border-amber-200/70',   text: 'text-amber-800',   icon: 'text-amber-500',   pill: 'bg-amber-100 text-amber-700',   action: 'bg-amber-100 hover:bg-amber-200 text-amber-800',   Icon: AlertTriangle, bar: 'bg-amber-500'   },
  error:   { bg: 'bg-red-50/80',     border: 'border-red-200/70',     text: 'text-red-800',     icon: 'text-red-500',     pill: 'bg-red-100 text-red-700',     action: 'bg-red-100 hover:bg-red-200 text-red-800',     Icon: AlertCircle,   bar: 'bg-red-500'     },
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'admin_session_start'

function getTimePeriod(h: number): TimePeriod {
  if (h >= 4  && h < 6)  return 'dawn'
  if (h >= 6  && h < 12) return 'morning'
  if (h >= 12 && h < 14) return 'midday'
  if (h >= 14 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}
function getDayOfYear() {
  const n = new Date()
  return Math.floor((n.getTime() - new Date(n.getFullYear(), 0, 0).getTime()) / 86_400_000)
}
function getGreetingIcon(h: number) {
  if (h >= 5 && h < 12) return Sunrise
  if (h >= 12 && h < 17) return Sun
  if (h >= 17 && h < 21) return Sunset
  return Moon
}
function fmt12(date: Date, withSec = false) {
  let h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  const period = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return {
    time: withSec
      ? `${String(h).padStart(2,'0')}:${m}:${s}`
      : `${String(h).padStart(2,'0')}:${m}`,
    period,
  }
}
function formatTerm(term: string): string {
  if (!term) return 'Current Term'
  const c = term.toLowerCase().trim()
  if (c.includes('third')  || c.includes('3rd') || c === '3') return 'Third Term'
  if (c.includes('second') || c.includes('2nd') || c === '2') return 'Second Term'
  if (c.includes('first')  || c.includes('1st') || c === '1') return 'First Term'
  return term.split(/[_\s-]+/).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

// ── Micro-components ───────────────────────────────────────────────────────────
function LivePulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  )
}

// ── Clock tile ─────────────────────────────────────────────────────────────────
function ClockTile({
  icon: Icon,
  label,
  children,
  accent = false,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div className={cn(
      'relative flex flex-col gap-1 rounded-xl border px-3 py-2.5 backdrop-blur-sm',
      accent
        ? 'border-amber-300/25 bg-gradient-to-br from-amber-400/12 via-amber-300/6 to-transparent'
        : 'border-white/10 bg-white/6',
    )}>
      <div className="flex items-center gap-1.5">
        <Icon className={cn('h-3 w-3 shrink-0', accent ? 'text-amber-300' : 'text-blue-300/70')} />
        <span className={cn('text-[9px] font-black uppercase tracking-widest', accent ? 'text-amber-200/70' : 'text-blue-200/55')}>
          {label}
        </span>
      </div>
      <div className="text-white font-bold tabular-nums leading-none">{children}</div>
    </div>
  )
}

// ── Alert strip ────────────────────────────────────────────────────────────────
function BannerStrip({ banner, onDismiss }: { banner: BannerMessage; onDismiss: (id: string) => void }) {
  const cfg  = BANNER_CFG[banner.type]
  const Icon = cfg.Icon
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn('overflow-hidden rounded-xl border backdrop-blur-sm', cfg.bg, cfg.border)}
    >
      {/* left accent bar */}
      <div className="flex">
        <div className={cn('w-1 shrink-0 rounded-l-xl', cfg.bar)} />
        <div className="flex items-start gap-3 px-4 py-3 flex-1 min-w-0">
          <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', cfg.icon)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full', cfg.pill)}>
                {banner.type}
              </span>
              <p className={cn('text-[12px] font-bold', cfg.text)}>{banner.title}</p>
            </div>
            <p className={cn('text-[11px] mt-0.5 leading-relaxed opacity-75', cfg.text)}>
              {banner.message}
            </p>
            {banner.action && (
              <button
                onClick={() => (window.location.href = banner.action!.href)}
                className={cn(
                  'inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors',
                  cfg.action,
                )}
              >
                {banner.action.label}
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          {banner.dismissible && (
            <button
              onClick={() => onDismiss(banner.id)}
              className={cn(
                'shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100',
                'hover:bg-black/8 transition-all duration-150', cfg.text,
              )}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Main Banner ────────────────────────────────────────────────────────────────
export function AdminBanner({ className, onDismiss, userName, termInfo }: AdminBannerProps) {
  const [now,          setNow]          = useState<Date>(() => new Date())
  const [sessionStart, setSessionStart] = useState<Date | null>(null)
  const [quoteIndex,   setQuoteIndex]   = useState(0)
  const [banners,      setBanners]      = useState<BannerMessage[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const initialised = useRef(false)

  const firstName = (userName?.split(' ')[0] || 'Admin')

  // Clock
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setSessionStart(new Date(stored))
    else {
      const s = new Date()
      localStorage.setItem(STORAGE_KEY, s.toISOString())
      setSessionStart(s)
    }
    const tick = setInterval(() => setNow(new Date()), 1000)
    const clear = () => localStorage.removeItem(STORAGE_KEY)
    window.addEventListener('beforeunload', clear)
    return () => { clearInterval(tick); window.removeEventListener('beforeunload', clear) }
  }, [])

  // Load banners
  useEffect(() => {
    if (initialised.current) return
    initialised.current = true
    const saved = localStorage.getItem('dismissed_banners')
    const savedSet = new Set<string>()
    if (saved) { try { JSON.parse(saved).forEach((id: string) => savedSet.add(id)) } catch {} }
    setDismissedIds(savedSet)

    const load = async () => {
      try {
        const { data } = await supabase.from('school_settings').select('current_term,current_session').single()
        const term    = data?.current_term    || 'First'
        const session = data?.current_session || '2024/2025'
        const all: BannerMessage[] = [
          { id: 'term-notice', title: `${formatTerm(term)} · ${session}`, message: `Welcome to ${formatTerm(term)} of the ${session} academic session. Ensure all records are up to date.`, type: 'info', dismissible: true },
          { id: 'reports-due', title: 'Report Cards Pending', message: 'Report cards are due for generation. Visit the Broad Sheet to review scores before publishing.', type: 'warning', dismissible: true, action: { label: 'Open Broad Sheet', href: '/admin/broad-sheet' } },
        ]
        setBanners(all.filter(b => !savedSet.has(b.id)))
      } catch {}
    }
    load()
  }, [])

  // Derived
  const hour         = now.getHours()
  const period       = useMemo(() => getTimePeriod(hour), [hour])
  const GreetIcon    = useMemo(() => getGreetingIcon(hour), [hour])
  const greeting     = useMemo(() => hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Good night', [hour])
  const quote        = useMemo(() => { const p = QUOTE_BANK[period]; return p[(getDayOfYear() + quoteIndex) % p.length] }, [period, quoteIndex])
  const timeFull     = useMemo(() => fmt12(now, true),  [now])
  const timeShort    = useMemo(() => fmt12(now, false), [now])
  const dateLong     = useMemo(() => now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }), [now])
  const dateShort    = useMemo(() => now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }), [now])
  const onlineFull   = useMemo(() => {
    if (!sessionStart) return '00:00:00'
    const t = Math.floor((now.getTime() - sessionStart.getTime()) / 1000)
    return [Math.floor(t/3600), Math.floor((t%3600)/60), t%60].map(n => String(n).padStart(2,'0')).join(':')
  }, [now, sessionStart])
  const onlineShort  = useMemo(() => {
    if (!sessionStart) return '0m'
    const t = Math.floor((now.getTime() - sessionStart.getTime()) / 1000)
    const h = Math.floor(t/3600), m = Math.floor((t%3600)/60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }, [now, sessionStart])
  const academicInfo = useMemo(() => termInfo?.term
    ? { term: formatTerm(termInfo.term), session: termInfo.session }
    : { term: 'Loading…', session: '' }, [termInfo])

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev); next.add(id)
      localStorage.setItem('dismissed_banners', JSON.stringify([...next]))
      return next
    })
    setBanners(prev => {
      const next = prev.filter(b => b.id !== id)
      if (!next.length) onDismiss?.()
      return next
    })
  }, [onDismiss])

  return (
    <div className={cn('space-y-2.5', className)}>

      {/*
        ══════════════════════════════════════════════════════════
        HERO BANNER
        Layout:
          [Left: greeting + name + term badge]  [Right: clock tiles]
          [Bottom: quote strip]
        ══════════════════════════════════════════════════════════
      */}
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10"
        style={{
          background: 'linear-gradient(135deg, #050f24 0%, #0a2050 45%, #0f3070 75%, #1a4a9a 100%)',
          isolation: 'isolate',
        }}
      >
        {/* Decorative glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative z-10">

          {/* ── TOP BAR: portal label + live badge ────────────────────────── */}
          <div className="flex items-center justify-between px-5 pt-4 pb-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-amber-300" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-200/70 leading-none">
                  Admin Portal
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <GraduationCap className="h-2.5 w-2.5 text-blue-300/50" />
                  <p className="text-[10px] text-blue-300/60 font-semibold">
                    {academicInfo.term}{academicInfo.session ? ` · ${academicInfo.session}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Term badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full
                              bg-white/8 border border-white/10">
                <BookOpen className="h-3 w-3 text-blue-300/70" />
                <span className="text-[10px] font-semibold text-blue-200/70">
                  {academicInfo.term}
                </span>
              </div>
              {/* Live dot */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                              bg-emerald-400/10 border border-emerald-400/25">
                <LivePulse />
                <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT: 2-col on md+ ─────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 px-5 py-5">

            {/* LEFT: greeting + name */}
            <div className="flex flex-col justify-center gap-2 min-w-0">
              {/* Greeting line */}
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-amber-400/15 border border-amber-300/20
                                flex items-center justify-center shrink-0">
                  <GreetIcon className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <span className="text-[12px] text-blue-100/70 font-medium">{greeting}</span>
              </div>

              {/* Name */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Welcome back,{' '}
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-200
                                   bg-clip-text text-transparent">
                    {firstName}
                  </span>
                </h1>
                <p className="text-[11px] text-blue-200/50 mt-1 font-medium">
                  Here&apos;s your dashboard overview for today
                </p>
              </div>

              {/* Quick-info pills row */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {[
                  { icon: Activity,  label: 'All systems operational', color: 'text-emerald-300', bg: 'bg-emerald-400/10 border-emerald-400/20' },
                  { icon: TrendingUp, label: 'Real-time sync active',  color: 'text-blue-300',    bg: 'bg-blue-400/10 border-blue-400/20' },
                  { icon: Zap,        label: 'Optimal performance',    color: 'text-amber-300',   bg: 'bg-amber-400/10 border-amber-400/20' },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <div key={label}
                    className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold', bg, color)}>
                    <Icon className={cn('h-3 w-3 shrink-0', color)} />
                    <span className="text-white/70">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: clock tiles */}
            <div className="flex flex-row md:flex-col gap-2 md:w-44">
              {/* Date */}
              <ClockTile icon={Calendar} label="Date">
                <span className="md:hidden text-[11px]">{dateShort}</span>
                <span className="hidden md:block text-[12px] leading-snug">{dateLong}</span>
              </ClockTile>

              {/* Time */}
              <ClockTile icon={Clock} label="Time">
                <span className="md:hidden flex items-baseline gap-1">
                  <span className="font-mono text-[12px]">{timeShort.time}</span>
                  <span className="text-[9px] font-black text-amber-300">{timeShort.period}</span>
                </span>
                <span className="hidden md:flex items-baseline gap-1.5">
                  <span className="font-mono text-[15px] tracking-tight">{timeFull.time}</span>
                  <span className="text-[10px] font-black text-amber-300">{timeFull.period}</span>
                </span>
              </ClockTile>

              {/* Session timer */}
              <ClockTile icon={Timer} label="Online" accent>
                <span className="md:hidden font-mono text-[12px]">{onlineShort}</span>
                <span className="hidden md:block font-mono text-[14px] tracking-tight">{onlineFull}</span>
              </ClockTile>
            </div>
          </div>

          {/* ── QUOTE STRIP ──────────────────────────────────────────────────── */}
          <div className="mx-5 mb-4 rounded-xl border border-white/8 bg-white/4 backdrop-blur-sm px-4 py-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${period}-${quoteIndex}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-start gap-3"
              >
                <div className="h-7 w-7 rounded-lg bg-amber-400/12 border border-amber-300/20
                                flex items-center justify-center shrink-0 mt-0.5">
                  <Quote className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] sm:text-[13px] text-blue-50/85 italic leading-relaxed">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                    <div>
                      <p className="text-[10px] font-bold text-amber-200/65">— {quote.author}</p>
                      <p className="text-[9px] text-blue-300/45 font-medium">{quote.role}</p>
                    </div>
                    <button
                      onClick={() => setQuoteIndex(i => i + 1)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold
                                 border border-white/10 hover:border-white/25 text-white/40 hover:text-white/70
                                 hover:bg-white/8 transition-all duration-200"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      New quote
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-200" />
      </div>

      {/* ── Alert strips ────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {banners.map(banner => (
          <BannerStrip key={banner.id} banner={banner} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}