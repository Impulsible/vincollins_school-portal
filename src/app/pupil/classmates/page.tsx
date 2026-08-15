/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import {
  Users,
  Search,
  Grid3x3,
  List,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  X,
  Sparkles,
  UserSearch,
  Filter,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Classmate {
  id: string
  full_name: string
  display_name?: string
  first_name?: string
  last_name?: string
  photo_url?: string
  avatar_url?: string
  class: string
  class_arm?: string
  vin_id?: string
  admission_number?: string
  gender?: string
  role?: string
}

interface PupilProfile {
  id: string
  full_name: string
  display_name?: string
  first_name?: string
  class: string
  class_arm?: string
  photo_url?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const getInitials = (name: string): string => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const getFullName = (c: Classmate) => {
  if (c.full_name) return c.full_name
  if (c.first_name && c.last_name) return `${c.first_name} ${c.last_name}`
  return c.display_name || c.first_name || 'Unknown'
}

const getClassDisplay = (c: Classmate | PupilProfile) =>
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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  delay = 0,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
    >
      <div className={cn('absolute inset-y-0 left-0 w-1', color)} />
      <div className="p-2.5 pl-3.5 sm:p-3 sm:pl-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {label}
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight truncate">
            {value}
          </p>
        </div>
        <div className={cn('p-1.5 sm:p-2 rounded-lg shrink-0 opacity-90', color)}>
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
      <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({
  onRefresh,
  userClass,
  isSearchEmpty = false,
  onClearSearch,
}: {
  onRefresh: () => void
  userClass?: string
  isSearchEmpty?: boolean
  onClearSearch?: () => void
}) {
  if (isSearchEmpty) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-8 sm:p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
          <UserSearch className="h-6 w-6 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">No matches found</p>
          <p className="text-xs text-slate-500 mt-0.5">Try a different search or filter</p>
        </div>
        {onClearSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            className="rounded-xl gap-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-8 sm:p-12 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
        <Users className="w-7 h-7 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">No classmates yet</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          {userClass
            ? `You don't have any classmates in ${userClass} yet. Check back later!`
            : 'You are not assigned to any class yet.'}
        </p>
      </div>
      <Button variant="outline" onClick={onRefresh} className="rounded-xl gap-2 border-slate-200">
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh
      </Button>
    </div>
  )
}

// ── Classmate Card (Grid) ─────────────────────────────────────────────────────
function ClassmateGridCard({ classmate, index }: { classmate: Classmate; index: number }) {
  const name = getFullName(classmate)
  const emoji = getGenderEmoji(classmate.gender)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4) }}
      className="group bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-[0.99] transition-all overflow-hidden"
    >
      <div className={cn('h-1 w-full bg-gradient-to-r', getAvatarGradient(name))} />

      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3 mb-3">
          <ClassmateAvatar classmate={classmate} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate leading-tight">{name}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {getClassDisplay(classmate)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <GraduationCap className="w-3 h-3" />
            Classmate
          </span>
          {emoji && (
            <span
              className={cn(
                'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold',
                classmate.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
              )}
            >
              {emoji}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Classmate Card (List) ─────────────────────────────────────────────────────
function ClassmateListRow({ classmate, index }: { classmate: Classmate; index: number }) {
  const name = getFullName(classmate)
  const emoji = getGenderEmoji(classmate.gender)
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="group flex items-center gap-3 p-3 sm:p-4 hover:bg-slate-50/70 active:bg-slate-100/50 transition-colors cursor-pointer"
    >
      <ClassmateAvatar classmate={classmate} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 truncate leading-tight">{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
          <p className="text-[11px] text-slate-500 truncate">{getClassDisplay(classmate)}</p>
        </div>
      </div>
      {emoji && (
        <span
          className={cn(
            'shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
            classmate.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
          )}
        >
          {emoji}
        </span>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function ClassmatesPage() {
  const router = useRouter()
  const { user: contextUser, loading: authLoading, isAuthenticated } = useUser()

  const [profile, setProfile] = useState<PupilProfile | null>(null)
  const [classmates, setClassmates] = useState<Classmate[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 12

  // Force list view on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 640px)')
    const apply = () => setViewMode(mq.matches ? 'grid' : 'list')
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // ─── Fetch data ────────────────────────────────────────────────────────────
  const fetchClassmates = useCallback(async (className?: string, classArm?: string) => {
    if (!className) {
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, display_name, first_name, last_name, class, class_arm, photo_url, avatar_url, gender, vin_id, admission_number, role')
        .ilike('class', className)
        .in('role', ['student', 'pupil'])
        .neq('id', contextUser?.id)

      if (classArm) query = query.eq('class_arm', classArm)
      query = query.order('full_name', { ascending: true })

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching classmates:', error)
        toast.error('Failed to load classmates')
        setClassmates([])
        return
      }

      setClassmates((data || []) as Classmate[])
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Failed to load classmates')
      setClassmates([])
    }
  }, [contextUser?.id])

  const fetchProfile = useCallback(async () => {
    if (!contextUser?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, first_name, class, class_arm, photo_url')
        .eq('id', contextUser.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile')
        return
      }

      if (data) {
        setProfile(data as PupilProfile)
        await fetchClassmates(data.class, data.class_arm)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [contextUser?.id, fetchClassmates])

  // ─── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !contextUser)) {
      router.replace('/portal')
      return
    }
    if (contextUser?.id && isAuthenticated) {
      fetchProfile()
    }
  }, [contextUser, authLoading, isAuthenticated, router, fetchProfile])

  // ─── Search & filter ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...classmates]

    const q = searchQuery.toLowerCase().trim()
    if (q) {
      list = list.filter((c) => {
        const name = getFullName(c).toLowerCase()
        return (
          name.includes(q) ||
          c.first_name?.toLowerCase().includes(q) ||
          c.last_name?.toLowerCase().includes(q) ||
          c.display_name?.toLowerCase().includes(q)
        )
      })
    }

    if (selectedGender !== 'all') {
      list = list.filter((c) => c.gender?.toLowerCase() === selectedGender.toLowerCase())
    }

    return list
  }, [classmates, searchQuery, selectedGender])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedGender])

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: classmates.length,
    male: classmates.filter((c) => c.gender?.toLowerCase() === 'male').length,
    female: classmates.filter((c) => c.gender?.toLowerCase() === 'female').length,
  }), [classmates])

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    await fetchProfile()
    toast.success('Refreshed!')
    setRefreshing(false)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedGender('all')
  }

  const activeFilters = (selectedGender !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)

  // ═══════════════════════════════════════════════════════════════════════════
  // Loading
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  // No profile
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
          <EmptyState onRefresh={handleRefresh} />
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl space-y-3 sm:space-y-4">

        {/* ── Back button ─────────────────────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          type="button"
          onClick={() => router.push('/pupil')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-semibold transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </motion.button>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
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
                {stats.total} in {getClassDisplay(profile)}
              </p>
              {(stats.male > 0 || stats.female > 0) && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {stats.male > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-white/80 font-medium">
                      <span className="text-[13px]">♂</span> {stats.male} boys
                    </span>
                  )}
                  {stats.female > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-white/80 font-medium">
                      <span className="text-[13px]">♀</span> {stats.female} girls
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard label="Total" value={stats.total} icon={Users} color="bg-emerald-500" delay={0.05} />
          <StatCard label="Boys" value={stats.male} icon={Users} color="bg-blue-500" delay={0.1} />
          <StatCard label="Girls" value={stats.female} icon={Users} color="bg-pink-500" delay={0.15} />
          <StatCard label="Class" value={profile.class} icon={GraduationCap} color="bg-violet-500" delay={0.2} />
        </div>

        {/* ── Toolbar ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-2.5 sm:p-3 space-y-2.5"
        >
          {/* Row 1: search */}
          <div className="relative">
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

          {/* Row 2: filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="h-8 rounded-lg border-slate-200 text-xs w-32 gap-1">
                <Filter className="w-3 h-3 text-slate-400 shrink-0" />
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Boys</SelectItem>
                <SelectItem value="female">Girls</SelectItem>
              </SelectContent>
            </Select>

            {activeFilters > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="h-8 px-2 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <RefreshCw className={cn('w-3.5 h-3.5 text-slate-400', refreshing && 'animate-spin')} />
              </Button>

              <div className="hidden sm:flex bg-slate-100 rounded-lg p-0.5">
                {(['grid', 'list'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'h-7 w-7 rounded-md flex items-center justify-center transition-all',
                      viewMode === mode
                        ? 'bg-white shadow-sm text-slate-700'
                        : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {mode === 'grid' ? <Grid3x3 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: result count */}
          <p className="text-[11px] text-slate-400">
            <span className="font-bold text-slate-600">{filtered.length}</span> of{' '}
            <span className="font-bold text-slate-600">{stats.total}</span> classmates
            {activeFilters > 0 && (
              <span className="text-violet-500 font-semibold">
                {' '}· {activeFilters} filter{activeFilters > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </motion.div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <EmptyState
              key="empty"
              onRefresh={handleRefresh}
              userClass={profile.class}
              isSearchEmpty={activeFilters > 0}
              onClearSearch={handleClearFilters}
            />
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3"
            >
              {paginated.map((classmate, idx) => (
                <ClassmateGridCard key={classmate.id} classmate={classmate} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden divide-y divide-slate-100"
            >
              {paginated.map((classmate, idx) => (
                <ClassmateListRow key={classmate.id} classmate={classmate} index={idx} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-3 flex items-center justify-between gap-3 flex-wrap"
          >
            <p className="text-[11px] sm:text-xs text-slate-500">
              <span className="font-bold text-slate-700">
                {(currentPage - 1) * itemsPerPage + 1}
                –{Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{' '}
              of <span className="font-bold text-slate-700">{filtered.length}</span>
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 rounded-lg border-slate-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) pageNum = i + 1
                  else if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                        currentPage === pageNum
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100'
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 rounded-lg border-slate-200"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}