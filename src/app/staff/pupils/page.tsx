/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  BarChart3,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  User,
  LayoutGrid,
  List,
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

// ── Helper: Group Classes Dynamically from DB ──────────────────────────────────
// Extracts the first word (e.g. "Nursery 1" -> "Nursery") to group classes dynamically
const groupClasses = (classes: string[]) => {
  const groups: Record<string, string[]> = {}

  classes.forEach(c => {
    if (!c) return
    const category = c.trim().split(/\s+/)[0] || 'Unassigned'
    
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(c)
  })

  // Sort categories alphabetically, and classes alphanumerically inside them
  const sortedGroups: Record<string, string[]> = {}
  Object.keys(groups).sort().forEach(key => {
    sortedGroups[key] = groups[key].sort((a, b) => 
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    )
  })

  return sortedGroups
}

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
            <div className="h-[15px]" />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Pupil Card ─────────────────────────────────────────────────────────────────
function PupilCard({ pupil, onView, viewMode }: {
  pupil: Pupil
  onView: (pupil: Pupil) => void
  viewMode: 'list' | 'grid'
}) {
  const initials = (pupil.full_name || pupil.display_name || '')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const displayName = pupil.display_name || pupil.full_name || 'Unknown'
  const avatarUrl = pupil.photo_url || pupil.avatar_url || undefined

  const statusColor = pupil.is_active 
    ? 'bg-emerald-100 text-emerald-700' 
    : 'bg-slate-100 text-slate-600'
  const avatarGradient = pupil.is_active 
    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
    : 'bg-gradient-to-br from-slate-400 to-slate-500'

  // More Options Menu component to avoid duplication
  const ActionMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl bg-white shadow-xl border border-slate-200 z-[100] p-1.5">
        <DropdownMenuItem onClick={() => onView(pupil)} className="py-2.5 px-3 rounded-lg cursor-pointer hover:bg-slate-50 text-sm font-medium focus:bg-slate-50 focus:text-slate-900">
          <Eye className="h-4 w-4 mr-2.5 text-slate-500" />
          View Details
        </DropdownMenuItem>
        
        {pupil.is_active ? (
          <DropdownMenuItem className="py-2.5 px-3 rounded-lg cursor-pointer hover:bg-amber-50 focus:bg-amber-50 text-amber-600 focus:text-amber-700 text-sm font-medium">
            <UserX className="h-4 w-4 mr-2.5" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="py-2.5 px-3 rounded-lg cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 text-emerald-600 focus:text-emerald-700 text-sm font-medium">
            <UserCheck className="h-4 w-4 mr-2.5" />
            Activate
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="bg-slate-100 my-1" />
        
        <DropdownMenuItem className="py-2.5 px-3 rounded-lg text-sm font-medium text-slate-400 focus:bg-transparent" disabled>
          <ShieldAlert className="h-4 w-4 mr-2.5" />
          Requires Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (viewMode === 'grid') {
    return (
      <div className="relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
        
        {/* Absolute Action Menu - stop propagation to avoid opening modal when clicking menu */}
        <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
          <ActionMenu />
        </div>

        <div onClick={() => onView(pupil)} className="flex flex-col items-center w-full cursor-pointer mt-1">
          <Avatar className="h-16 w-16 mb-3 border border-slate-100 shadow-sm shrink-0">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className={cn('text-white text-base font-bold', avatarGradient)}>
              {initials || 'P'}
            </AvatarFallback>
          </Avatar>
          
          <p className="text-sm sm:text-base font-semibold text-slate-800 text-center line-clamp-1 w-full px-2">
            {displayName}
          </p>
          
          <div className="flex flex-col items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded-lg">
              <GraduationCap className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{pupil.class || 'Unassigned'}</span>
            </span>
            {pupil.vin_id && (
              <span className="text-[11px] font-medium text-slate-400">ID: {pupil.vin_id}</span>
            )}
          </div>

          <Badge
            variant={pupil.is_active ? 'default' : 'secondary'}
            className={cn('mt-4 text-[10px] border-0 font-semibold shadow-none px-2.5 py-0.5', statusColor)}
          >
            {pupil.is_active ? 'Active Status' : 'Inactive Status'}
          </Badge>
        </div>
      </div>
    )
  }

  // List View (Default Horizontal Layout)
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
      
      {/* Clickable Area for Mobile-First Tapping */}
      <div 
        onClick={() => onView(pupil)} 
        className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
      >
        <Avatar className="h-12 w-12 shrink-0 border border-slate-100 shadow-sm">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className={cn('text-white text-sm font-bold', avatarGradient)}>
            {initials || 'P'}
          </AvatarFallback>
        </Avatar>
        
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">
            {displayName}
          </p>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md truncate max-w-[120px] sm:max-w-none">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span className="truncate">{pupil.class || 'Unassigned'}</span>
            </span>
            {pupil.vin_id && (
              <span className="truncate hidden sm:inline-block">ID: {pupil.vin_id}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2 shrink-0 relative">
        <Badge
          variant={pupil.is_active ? 'default' : 'secondary'}
          className={cn('text-[10px] hidden sm:flex border-0 font-semibold shadow-none', statusColor)}
        >
          {pupil.is_active ? 'Active' : 'Inactive'}
        </Badge>

        {!pupil.is_active && (
          <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center sm:hidden">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          </div>
        )}

        <div onClick={e => e.stopPropagation()}>
          <ActionMenu />
        </div>
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
      <DialogContent className="w-[95vw] max-w-2xl rounded-3xl max-h-[90dvh] overflow-hidden flex flex-col p-0 gap-0 border-0 shadow-2xl">
        
        <DialogHeader className="p-5 sm:p-6 pb-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-slate-200 shadow-sm shrink-0">
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
            <div className="text-left min-w-0">
              <div className="text-lg sm:text-xl font-bold text-slate-800 leading-tight truncate">
                {displayName}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                {pupil.vin_id && (
                  <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-600 shadow-sm font-semibold">
                    ID: {pupil.vin_id}
                  </span>
                )}
                <span>{pupil.class || 'No Class'}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className={cn("flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-white", hideScrollbar)}>
          <div className={cn(
            'rounded-2xl p-4 flex items-start sm:items-center gap-3',
            pupil.is_active ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-amber-50/50 border border-amber-100'
          )}>
            {pupil.is_active ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div>
              <p className={cn("text-sm font-bold", pupil.is_active ? "text-emerald-800" : "text-amber-800")}>
                {pupil.is_active ? 'Active Student' : 'Inactive Student'}
              </p>
              <p className={cn("text-xs mt-0.5", pupil.is_active ? "text-emerald-600" : "text-amber-600")}>
                {pupil.is_active ? 'Currently active and enrolled.' : 'Historical view only.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Personal
              </h4>
              <div className="space-y-3 text-sm bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Full Name</span>
                  <span className="font-semibold text-slate-800">{pupil.full_name || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Gender</span>
                  <span className="font-medium text-slate-700 capitalize">{pupil.gender || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Date of Birth</span>
                  <span className="font-medium text-slate-700">
                    {pupil.date_of_birth ? new Date(pupil.date_of_birth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* School Information */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <School className="h-3.5 w-3.5" /> Academic
              </h4>
              <div className="space-y-3 text-sm bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Class & Arm</span>
                  <span className="font-semibold text-slate-800">
                    {pupil.class || 'Unassigned'} {pupil.class_arm && `(${pupil.class_arm})`}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Admission Number</span>
                  <span className="font-medium text-slate-700">{pupil.admission_number || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Joined Date</span>
                  <span className="font-medium text-slate-700">
                    {new Date(pupil.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Contact
              </h4>
              <div className="space-y-3 text-sm bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Email Address</span>
                  <span className="font-medium text-slate-700 break-all">{pupil.email || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold">Phone Number</span>
                  <span className="font-medium text-slate-700">{pupil.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> Guardian
              </h4>
              <div className="space-y-3 text-sm bg-slate-50/50 rounded-2xl p-4 border border-slate-100 h-[calc(100%-1.75rem)]">
                {pupil.guardian_name ? (
                  <>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] text-slate-500 font-semibold">Guardian Name</span>
                      <span className="font-medium text-slate-700">{pupil.guardian_name}</span>
                    </div>
                    {pupil.guardian_phone && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-slate-500 font-semibold">Guardian Phone</span>
                        <span className="font-medium text-slate-700">{pupil.guardian_phone}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-slate-400 text-sm italic py-2">No guardian data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-5 border-t border-slate-100 bg-white sm:bg-slate-50/50">
          <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-10 rounded-xl" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="w-full sm:w-auto h-11 sm:h-10 rounded-xl bg-slate-800 hover:bg-slate-900 text-white" disabled>
            <ShieldAlert className="h-4 w-4 mr-2" />
            Admin Only Edit
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
  
  // States for Filtering and Viewing
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  
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
      <div className="min-h-[100dvh] bg-slate-50/50 pb-20">
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

  // Dynamically group classes based on DB data
  const groupedClasses = groupClasses(classes)

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-24">
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
              <Badge className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1.5 rounded-lg border-0 shadow-sm font-semibold">
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                Read Only
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl border-slate-200 shadow-sm h-9"
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
        <div className="sticky top-[73px] sm:top-0 z-20 bg-slate-50/90 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:static flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // text-base prevents iOS zoom on focus
                className="pl-10 h-11 sm:h-10 text-base sm:text-sm rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500 w-full"
              />
            </div>
            
            <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="flex-1 sm:w-[160px] h-11 sm:h-10 rounded-xl bg-white border-slate-200 shadow-sm text-base sm:text-sm font-medium">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                {/* Fixed Background & Z-Index on SelectContent */}
                <SelectContent className="rounded-xl bg-white z-[100] border-slate-200 shadow-xl max-h-[50vh]">
                  <SelectItem value="all" className="font-semibold text-blue-600">All Classes</SelectItem>
                  {Object.entries(groupedClasses).map(([group, classList]) => {
                    if (classList.length === 0) return null
                    return (
                      <SelectGroup key={group}>
                        <SelectLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-3 pb-1">{group}</SelectLabel>
                        {classList.map((cls) => (
                          <SelectItem key={cls} value={cls} className="font-medium text-slate-700 pl-4">
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )
                  })}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1 sm:w-[130px] h-11 sm:h-10 rounded-xl bg-white border-slate-200 shadow-sm text-base sm:text-sm font-medium shrink-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white z-[100] border-slate-200 shadow-xl">
                  <SelectItem value="all" className="font-semibold text-slate-700">All Status</SelectItem>
                  <SelectItem value="active" className="text-emerald-700 font-medium">Active</SelectItem>
                  <SelectItem value="inactive" className="text-amber-700 font-medium">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl shrink-0 h-11 sm:h-10 ml-auto sm:ml-0">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex items-center justify-center w-11 sm:w-9 h-full rounded-lg transition-all",
                    viewMode === 'list' 
                      ? "bg-white shadow-sm text-blue-600" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
                  aria-label="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "flex items-center justify-center w-11 sm:w-9 h-full rounded-lg transition-all",
                    viewMode === 'grid' 
                      ? "bg-white shadow-sm text-blue-600" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
                  aria-label="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Results Count ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between text-sm text-slate-500 font-medium px-1">
          <p>
            {filteredPupils.length} {filteredPupils.length === 1 ? 'Pupil' : 'Pupils'} found
          </p>
        </div>

        {/* ── Pupils List / Grid ───────────────────────────────────────────────── */}
        <div className="bg-transparent border-0 shadow-none">
          {paginatedPupils.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
              <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-700">No pupils found</p>
              <p className="text-sm text-slate-400 mt-1 max-w-[250px] mx-auto">
                {searchQuery ? 'Adjust your search or filters to find what you are looking for.' : 'No pupils are registered yet.'}
              </p>
              {(searchQuery || selectedClass !== 'all' || selectedStatus !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchQuery(''); setSelectedClass('all'); setSelectedStatus('all'); }}
                  className="mt-4 rounded-xl h-10 px-6"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <div className={cn(
              "grid gap-3 sm:gap-4",
              viewMode === 'grid'
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" // Grid mode
                : "grid-cols-1 lg:grid-cols-2" // List mode
            )}>
              {paginatedPupils.map((pupil) => (
                <PupilCard
                  key={pupil.id}
                  pupil={pupil}
                  onView={handleView}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ───────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/60">
            <p className="text-sm text-slate-500 font-medium text-center sm:text-left">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border-slate-200 h-10 px-4 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border-slate-200 h-10 px-4 shadow-sm"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Class Breakdown (Mobile Horizontal Scroll) ──────────────────────── */}
        {Object.keys(stats.byClass).length > 0 && (
          <div className="pt-6 border-t border-slate-200/60 mt-8">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4 px-1">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Class Capacity Breakdown
            </h3>
            <div className={cn("flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:pb-0", hideScrollbar)}>
              {Object.entries(stats.byClass)
                .sort((a, b) => b[1] - a[1])
                .map(([className, count]) => (
                  <div
                    key={className}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm shrink-0 w-[160px] sm:w-auto"
                  >
                    <span className="text-sm font-semibold text-slate-700 truncate mr-2">{className}</span>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 shrink-0 font-bold">{count}</Badge>
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