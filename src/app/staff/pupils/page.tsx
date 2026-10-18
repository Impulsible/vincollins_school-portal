/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Users,
  Search,
  MoreVertical,
  Eye,
  Phone,
  GraduationCap,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  School,
  Grid3x3,
  FileText,
  BarChart3,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Pupil {
  id: string
  vin_id: string
  full_name: string
  display_name?: string
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  class: string
  class_arm?: string
  gender?: string
  date_of_birth?: string
  photo_url?: string
  avatar_url?: string
  address?: string
  guardian_name?: string
  guardian_phone?: string
  admission_number?: string
  admission_year?: number
  is_active: boolean
  created_at: string
  updated_at?: string
  role: string
  last_active?: string
}

interface PupilStats {
  total: number
  active: number
  inactive: number
  byClass: Record<string, number>
  byGender: { male: number; female: number; other: number }
  byClassArm: Record<string, number>
}

// ── Shared Scrollbar Hiding Class ──────────────────────────────────────────────
const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function PupilsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-4 w-64 bg-slate-200 animate-pulse rounded mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-xl" />
        </div>
      </div>

      <div className={`flex overflow-x-auto gap-4 pb-2 ${hideScrollbar}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 w-[160px] md:w-auto md:flex-1 shrink-0 bg-slate-200 animate-pulse rounded-2xl" />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-12 flex-1 bg-slate-200 animate-pulse rounded-xl" />
        <div className="h-12 w-32 bg-slate-200 animate-pulse rounded-xl hidden sm:block" />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'green' | 'amber' | 'violet'
  subtitle?: string
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    violet: 'bg-violet-50 border-violet-200 text-violet-600',
  }

  return (
    <div className={cn('rounded-2xl p-4 border shrink-0 w-[150px] sm:w-auto sm:flex-1 snap-start', colors[color])}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-xl bg-white/60">
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700">{title}</p>
          {subtitle ? (
            <p className="text-[10px] font-medium text-slate-500 mt-0.5">{subtitle}</p>
          ) : (
            <div className="h-[15px]" /> // Spacer to align cards
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pupil Card ─────────────────────────────────────────────────────────────────
function PupilCard({ pupil, onView }: {
  pupil: Pupil
  onView: (pupil: Pupil) => void
}) {
  const initials = (pupil.full_name || pupil.display_name || '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const displayName = pupil.display_name || pupil.full_name || 'Unknown'
  const avatarUrl = pupil.photo_url || pupil.avatar_url || undefined

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group">
      
      {/* Clickable Area for Mobile-First Tapping */}
      <div 
        onClick={() => onView(pupil)} 
        className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
      >
        <Avatar className="h-12 w-12 shrink-0 border border-slate-100">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className={cn(
            'text-white text-sm font-bold',
            pupil.is_active 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
              : 'bg-gradient-to-br from-slate-400 to-slate-500'
          )}>
            {initials || 'P'}
          </AvatarFallback>
        </Avatar>
        
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">
            {displayName}
          </p>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md">
              <GraduationCap className="h-3 w-3" />
              {pupil.class || 'Unassigned'}
              {pupil.class_arm && ` ${pupil.class_arm}`}
            </span>
            {pupil.vin_id && (
              <span className="hidden sm:inline-block truncate">ID: {pupil.vin_id}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2 shrink-0">
        <Badge
          variant={pupil.is_active ? 'default' : 'secondary'}
          className={cn(
            'text-[10px] hidden sm:flex',
            pupil.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600'
          )}
        >
          {pupil.is_active ? 'Active' : 'Inactive'}
        </Badge>

        {!pupil.is_active && (
          <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center sm:hidden">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          </div>
        )}

        {/* Action Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem onClick={() => onView(pupil)} className="py-2">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {pupil.is_active ? (
              <DropdownMenuItem className="text-amber-600 py-2">
                <UserX className="h-4 w-4 mr-2" />
                Deactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-emerald-600 py-2">
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-slate-400 py-2" disabled>
              <ShieldAlert className="h-4 w-4 mr-2" />
              Requires Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ── Pupil Detail Dialog ──────────────────────────────────────────────────────
function PupilDetailDialog({ pupil, open, onOpenChange }: {
  pupil: Pupil | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!pupil) return null

  const displayName = pupil.display_name || pupil.full_name || 'Unknown'
  const avatarUrl = pupil.photo_url || pupil.avatar_url || undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-slate-100 bg-slate-50">
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className={cn(
                'text-white font-bold text-lg',
                pupil.is_active
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-br from-slate-400 to-slate-500'
              )}>
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
                {displayName}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                {pupil.vin_id && <span className="bg-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-700">ID: {pupil.vin_id}</span>}
                {pupil.class || 'No Class'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Status Banner */}
          <div className={cn(
            'rounded-xl p-3 sm:p-4 flex items-start sm:items-center gap-3',
            pupil.is_active ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'
          )}>
            {pupil.is_active ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <p className={cn("text-sm font-semibold", pupil.is_active ? "text-emerald-800" : "text-amber-800")}>
                {pupil.is_active ? 'Active Student' : 'Inactive Student'}
              </p>
              <p className={cn("text-xs mt-0.5", pupil.is_active ? "text-emerald-600" : "text-amber-600")}>
                {pupil.is_active ? 'Currently active and receiving updates.' : 'Cannot receive updates; historical view only.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4" /> Personal
              </h4>
              <div className="space-y-2.5 text-sm bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Full Name</span>
                  <span className="font-semibold text-slate-800">{pupil.full_name || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Gender</span>
                  <span className="font-medium text-slate-700 capitalize">{pupil.gender || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Date of Birth</span>
                  <span className="font-medium text-slate-700">
                    {pupil.date_of_birth ? new Date(pupil.date_of_birth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* School Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <School className="h-4 w-4" /> Academic
              </h4>
              <div className="space-y-2.5 text-sm bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Class & Arm</span>
                  <span className="font-semibold text-slate-800">
                    {pupil.class || 'Unassigned'} {pupil.class_arm && `(${pupil.class_arm})`}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Admission Number</span>
                  <span className="font-medium text-slate-700">{pupil.admission_number || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Joined Date</span>
                  <span className="font-medium text-slate-700">
                    {new Date(pupil.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contact
              </h4>
              <div className="space-y-2.5 text-sm bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Email Address</span>
                  <span className="font-medium text-slate-700 break-all">{pupil.email || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-medium">Phone Number</span>
                  <span className="font-medium text-slate-700">{pupil.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4" /> Guardian
              </h4>
              <div className="space-y-2.5 text-sm bg-slate-50/50 rounded-xl p-4 border border-slate-100 h-[calc(100%-1.75rem)]">
                {pupil.guardian_name ? (
                  <>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-slate-500 font-medium">Guardian Name</span>
                      <span className="font-medium text-slate-700">{pupil.guardian_name}</span>
                    </div>
                    {pupil.guardian_phone && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-slate-500 font-medium">Guardian Phone</span>
                        <span className="font-medium text-slate-700">{pupil.guardian_phone}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400 text-sm italic">No guardian data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 border-t border-slate-100 bg-white">
          <Button variant="outline" className="w-full sm:w-auto rounded-xl" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled>
            <ShieldAlert className="h-4 w-4 mr-2" />
            Admin Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StaffPupilsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  
  const [pupils, setPupils] = useState<Pupil[]>([])
  const [filteredPupils, setFilteredPupils] = useState<Pupil[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPupil, setSelectedPupil] = useState<Pupil | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  
  const [stats, setStats] = useState<PupilStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byClass: {},
    byGender: { male: 0, female: 0, other: 0 },
    byClassArm: {},
  })

  const [classes, setClasses] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30

  const isAdmin = user?.role === 'admin'

  // ─── Fetch Pupils ────────────────────────────────────────────────────────────
  const fetchPupils = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['pupil', 'student'])
        .order('full_name', { ascending: true })

      if (error) throw error

      const pupilsData = (data || []) as Pupil[]
      setPupils(pupilsData)
      setFilteredPupils(pupilsData)

      // Calculate stats
      const active = pupilsData.filter(p => p.is_active !== false).length
      const inactive = pupilsData.filter(p => p.is_active === false).length
      
      const byClass: Record<string, number> = {}
      const byGender: { male: number; female: number; other: number } = { male: 0, female: 0, other: 0 }
      const byClassArm: Record<string, number> = {}
      
      pupilsData.forEach(p => {
        const className = p.class || 'Unassigned'
        byClass[className] = (byClass[className] || 0) + 1
        
        if (p.gender?.toLowerCase() === 'male') byGender.male++
        else if (p.gender?.toLowerCase() === 'female') byGender.female++
        else byGender.other++
        
        if (p.class_arm) {
          const key = `${className} - ${p.class_arm}`
          byClassArm[key] = (byClassArm[key] || 0) + 1
        }
      })

      setStats({
        total: pupilsData.length,
        active,
        inactive,
        byClass,
        byGender,
        byClassArm,
      })

      const uniqueClasses = Array.from(new Set(pupilsData.map(p => p.class).filter(Boolean)))
      setClasses(uniqueClasses)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load pupils')
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Initial Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading) {
      fetchPupils()
    }
  }, [authLoading, fetchPupils])

  // ─── Filtering ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = [...pupils]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(p =>
        p.full_name?.toLowerCase().includes(query) ||
        p.display_name?.toLowerCase().includes(query) ||
        p.vin_id?.toLowerCase().includes(query)
      )
    }

    if (selectedClass !== 'all') {
      filtered = filtered.filter(p => p.class === selectedClass)
    }

    if (selectedStatus === 'active') {
      filtered = filtered.filter(p => p.is_active !== false)
    } else if (selectedStatus === 'inactive') {
      filtered = filtered.filter(p => p.is_active === false)
    }

    setFilteredPupils(filtered)
    setCurrentPage(1) // Reset to page 1 on filter change
  }, [searchQuery, selectedClass, selectedStatus, pupils])

  // ─── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredPupils.length / itemsPerPage)
  const paginatedPupils = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredPupils.slice(start, end)
  }, [filteredPupils, currentPage, itemsPerPage])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPupils()
    toast.success('Pupils list updated!')
    setRefreshing(false)
  }

  const handleView = (pupil: Pupil) => {
    setSelectedPupil(pupil)
    setDetailOpen(true)
  }

  // ─── Render States ──────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <PupilsLoadingSkeleton />
        </div>
      </div>
    )
  }

  if (!user || user.role === 'student') {
    router.replace('/portal')
    return null
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-600" />
              Pupil Directory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage and view all enrolled pupils across the school.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isAdmin && (
              <Badge className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-lg border-0 shadow-sm">
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                Read Only
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl border-slate-200 shadow-sm"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2 text-slate-500', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Mobile Horizontal Scroll Stats ────────────────────────────────────── */}
        <div className={cn("flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:pb-0", hideScrollbar)}>
          <StatCard title="Total Enrolled" value={stats.total} icon={Users} color="blue" />
          <StatCard title="Active Pupils" value={stats.active} icon={UserCheck} color="green" subtitle={`${stats.active > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% retention`} />
          <StatCard title="Inactive" value={stats.inactive} icon={UserX} color="amber" />
          <StatCard title="Total Classes" value={classes.length} icon={GraduationCap} color="violet" />
        </div>

        {/* ── Sticky Search & Filters for Mobile ───────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:static flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // text-base prevents iOS zoom on focus
                className="pl-10 h-11 text-base sm:text-sm rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl bg-white border-slate-200 shadow-sm text-base sm:text-sm">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[120px] h-11 rounded-xl bg-white border-slate-200 shadow-sm text-base sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Results Count ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
          <p>
            {filteredPupils.length} {filteredPupils.length === 1 ? 'Pupil' : 'Pupils'} found
          </p>
        </div>

        {/* ── Pupils List ──────────────────────────────────────────────────────── */}
        <div className="bg-transparent border-0 shadow-none">
          {paginatedPupils.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-600 font-medium">No pupils found</p>
              <p className="text-sm text-slate-400 mt-1 max-w-[250px] mx-auto">
                {searchQuery ? 'Adjust your search or filters to find what you are looking for.' : 'No pupils are registered yet.'}
              </p>
              {(searchQuery || selectedClass !== 'all' || selectedStatus !== 'all') && (
                <Button 
                  variant="link" 
                  onClick={() => { setSearchQuery(''); setSelectedClass('all'); setSelectedStatus('all'); }}
                  className="mt-2 text-blue-600"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {paginatedPupils.map((pupil) => (
                <PupilCard
                  key={pupil.id}
                  pupil={pupil}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200/60">
            <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border-slate-200 h-10 px-4"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border-slate-200 h-10 px-4"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Class Breakdown (Mobile Horizontal Scroll) ──────────────────────── */}
        {Object.keys(stats.byClass).length > 0 && (
          <div className="pt-8">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Class Capacity Breakdown
            </h3>
            <div className={cn("flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:pb-0", hideScrollbar)}>
              {Object.entries(stats.byClass)
                .sort((a, b) => b[1] - a[1])
                .map(([className, count]) => (
                  <div
                    key={className}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm shrink-0 w-[140px] sm:w-auto"
                  >
                    <span className="text-sm font-semibold text-slate-700">{className}</span>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">{count}</Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────────────── */}
      <PupilDetailDialog
        pupil={selectedPupil}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}