/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  GraduationCap,
  RefreshCw,
  X,
  Sparkles,
  UserSearch,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
interface ClassmatesTabProps {
  classmates?: any[]
  profile: any
}

interface Classmate {
  id: string
  full_name: string
  first_name?: string
  last_name?: string
  display_name?: string
  photo_url?: string
  avatar_url?: string
  class: string
  class_arm?: string
  vin_id?: string
  role?: string
  gender?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const getInitials = (name: string) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0]?.[0]?.toUpperCase() || '?'
}

const getFullName = (c: Classmate) => {
  if (c.full_name) return c.full_name
  if (c.first_name && c.last_name) return `${c.first_name} ${c.last_name}`
  return c.display_name || c.first_name || 'Unknown'
}

const getFirstName = (c: Classmate) => {
  const name = getFullName(c)
  return name.split(' ')[0]
}

const getClassDisplay = (c: Classmate) =>
  c.class_arm ? `${c.class} ${c.class_arm}` : c.class || 'Not Assigned'

const GRADIENTS = [
  'from-rose-500 to-pink-600',
  'from-orange-500 to-amber-600',
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-purple-600',
  'from-indigo-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600',
]

const getAvatarGradient = (name: string) => {
  const hash = (name || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]
}

const getGenderEmoji = (gender?: string) => {
  if (gender === 'male') return '♂'
  if (gender === 'female') return '♀'
  return null
}

// ── Reusable pieces ────────────────────────────────────────────────────────────
function ClassmateAvatar({ classmate, size = 'md' }: { classmate: Classmate; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-9 w-9', md: 'h-11 w-11 sm:h-12 sm:w-12', lg: 'h-14 w-14' }
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }
  const name = getFullName(classmate)
  return (
    <Avatar className={cn(sizes[size], 'ring-2 ring-white shadow-sm shrink-0')}>
      {classmate.photo_url && <AvatarImage src={classmate.photo_url} alt={name} />}
      <AvatarFallback
        className={cn('text-white font-bold bg-gradient-to-br', getAvatarGradient(name), textSizes[size])}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export function ClassmatesTab({ classmates: propsClassmates, profile }: ClassmatesTabProps) {
  const [loading, setLoading] = useState(true)
  const [classmates, setClassmates] = useState<Classmate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentUserClass, setCurrentUserClass] = useState<string>('')

  // Force list view on mobile for better readability
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 640px)')
    const apply = () => setViewMode(mq.matches ? 'grid' : 'list')
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // ─── Fetch classmates ──────────────────────────────────────────────────────
  const fetchClassmates = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const userClass = profile.class || profile.class_name || ''

      if (!userClass) {
        setClassmates([])
        setLoading(false)
        return
      }

      setCurrentUserClass(userClass)

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, class, class_arm, role, photo_url, avatar_url, first_name, last_name, display_name, gender, vin_id')
        .ilike('class', userClass)
        .in('role', ['student', 'pupil'])
        .neq('id', profile.id)
        .order('full_name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching classmates:', error)
        toast.error('Failed to load classmates')
        setClassmates([])
        return
      }

      const mapped: Classmate[] = (data || []).map((item: any) => ({
        id: item.id,
        full_name: item.full_name || item.display_name ||
          `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown',
        first_name: item.first_name,
        last_name: item.last_name,
        display_name: item.display_name,
        photo_url: item.photo_url || item.avatar_url,
        avatar_url: item.avatar_url,
        class: item.class || userClass,
        class_arm: item.class_arm,
        vin_id: item.vin_id,
        role: item.role,
        gender: item.gender,
      }))

      setClassmates(mapped)
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Failed to load classmates')
      setClassmates([])
    } finally {
      setLoading(false)
    }
  }, [profile?.id, profile?.class, profile?.class_name])

  // ─── Initial fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (propsClassmates && propsClassmates.length > 0) {
      setClassmates(propsClassmates as Classmate[])
      if (propsClassmates[0]?.class) setCurrentUserClass(propsClassmates[0].class)
      setLoading(false)
      return
    }
    fetchClassmates()
  }, [propsClassmates, fetchClassmates])

  // ─── Filter classmates ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return classmates
    return classmates.filter((c) => {
      const name = getFullName(c).toLowerCase()
      return name.includes(q) ||
        c.first_name?.toLowerCase().includes(q) ||
        c.last_name?.toLowerCase().includes(q) ||
        c.display_name?.toLowerCase().includes(q)
    })
  }, [classmates, searchQuery])

  const displayed = showAll ? filtered : filtered.slice(0, 12)

  // ─── Gender stats ──────────────────────────────────────────────────────────
  const genderStats = useMemo(() => {
    const males = classmates.filter((c) => c.gender === 'male').length
    const females = classmates.filter((c) => c.gender === 'female').length
    return { males, females }
  }, [classmates])

  // ═══════════════════════════════════════════════════════════════════════════
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-12 sm:p-16 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading classmates…</p>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Empty state (no classmates at all)
  if (classmates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-8 sm:p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
          <Users className="w-7 h-7 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">No classmates yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {currentUserClass
              ? `You don't have any classmates in ${currentUserClass} yet.`
              : 'You are not assigned to any class yet.'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchClassmates}
          className="rounded-xl gap-2 border-slate-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Main content
  return (
    <div className="space-y-3 sm:space-y-4">

      {/* ── Hero / Stats ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm p-4 sm:p-5"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-white/70" />
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/70">
                My Classmates
              </p>
            </div>
            <p className="mt-0.5 text-xl sm:text-2xl font-extrabold text-white leading-tight truncate">
              {classmates.length} in {currentUserClass || 'your class'}
            </p>
            {(genderStats.males > 0 || genderStats.females > 0) && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {genderStats.males > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/80 font-medium">
                    <span className="text-[13px]">♂</span> {genderStats.males} boys
                  </span>
                )}
                {genderStats.females > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-white/80 font-medium">
                    <span className="text-[13px]">♀</span> {genderStats.females} girls
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-2.5 sm:p-3"
      >
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-xl border-slate-200 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            )}
          </div>

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchClassmates}
            className="h-10 w-10 p-0 rounded-xl shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </Button>

          {/* View mode toggle — hidden on mobile, list-only there */}
          <div className="hidden sm:flex bg-slate-100 rounded-xl p-0.5 h-10 shrink-0">
            {(['grid', 'list'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={cn(
                  'h-9 w-9 rounded-lg flex items-center justify-center transition-all',
                  viewMode === mode
                    ? 'bg-white shadow-sm text-slate-800'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {mode === 'grid' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {searchQuery && (
          <p className="text-[11px] text-slate-400 mt-2 px-1">
            <span className="font-bold text-slate-600">{filtered.length}</span> of{' '}
            <span className="font-bold text-slate-600">{classmates.length}</span> match "{searchQuery}"
          </p>
        )}
      </motion.div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty-search"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-8 sm:p-12 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
              <UserSearch className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">No matches found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                No classmate matches "{searchQuery}"
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="rounded-xl gap-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear search
            </Button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* ── GRID VIEW ──────────────────────────────────────────────── */
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3"
          >
            {displayed.map((c, idx) => {
              const name = getFullName(c)
              const emoji = getGenderEmoji(c.gender)
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                  className="group bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-[0.99] transition-all overflow-hidden"
                >
                  <div className={cn('h-1 w-full bg-gradient-to-r', getAvatarGradient(name))} />

                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ClassmateAvatar classmate={c} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                          {name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {getClassDisplay(c)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <GraduationCap className="w-3 h-3" />
                        Classmate
                      </span>
                      {emoji && (
                        <span className={cn(
                          'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold',
                          c.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                        )}>
                          {emoji}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          /* ── LIST VIEW (mobile-first default) ───────────────────────── */
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden divide-y divide-slate-100"
          >
            {displayed.map((c, idx) => {
              const name = getFullName(c)
              const emoji = getGenderEmoji(c.gender)
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                  className="group flex items-center gap-3 p-3 sm:p-4 hover:bg-slate-50/70 active:bg-slate-100/50 transition-colors cursor-pointer"
                >
                  <ClassmateAvatar classmate={c} size="md" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                      {name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                      <p className="text-[11px] text-slate-500 truncate">
                        {getClassDisplay(c)}
                      </p>
                    </div>
                  </div>

                  {emoji && (
                    <span className={cn(
                      'shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                      c.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                    )}>
                      {emoji}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Show more / less ──────────────────────────────────────────── */}
      {filtered.length > 12 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center pt-1"
        >
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="rounded-xl gap-2 text-xs sm:text-sm font-semibold border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            {showAll ? (
              <>Show Less</>
            ) : (
              <>Show all {filtered.length} classmates</>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  )
}

export default ClassmatesTab