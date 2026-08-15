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
  Info,
  Calendar,
  Mail,
  MapPin,
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

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function PupilsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-64 bg-slate-200 animate-pulse rounded mt-1" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-10 w-10 bg-slate-200 animate-pulse rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-xl" />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-10 flex-1 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-10 w-40 bg-slate-200 animate-pulse rounded-lg" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 animate-pulse rounded my-2" />
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
  onClick,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'green' | 'amber' | 'rose' | 'violet' | 'cyan' | 'slate'
  subtitle?: string
  onClick?: () => void
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    rose: 'bg-rose-50 border-rose-200 text-rose-600',
    violet: 'bg-violet-50 border-violet-200 text-violet-600',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-600',
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
  }

  return (
    <div 
      className={cn('rounded-2xl p-4 border shadow-sm', colors[color], onClick && 'cursor-pointer hover:shadow-md transition-all')}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/50">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
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
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
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
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-0.5">
              <GraduationCap className="h-3 w-3" />
              {pupil.class || 'Unassigned'}
              {pupil.class_arm && ` ${pupil.class_arm}`}
            </span>
            {pupil.gender && (
              <>
                <span>•</span>
                <span>{pupil.gender}</span>
              </>
            )}
            {pupil.vin_id && (
              <>
                <span>•</span>
                <span>ID: {pupil.vin_id}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant={pupil.is_active ? 'default' : 'secondary'}
          className={cn(
            'text-[10px]',
            pupil.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
          )}
        >
          {pupil.is_active ? (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              Inactive
            </span>
          )}
        </Badge>

        {!pupil.is_active && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 text-amber-600" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">This pupil is inactive</p>
                <p className="text-xs text-slate-400">They can view previous info only</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(pupil)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {pupil.is_active && (
              <DropdownMenuItem className="text-amber-600">
                <UserX className="h-4 w-4 mr-2" />
                Deactivate (Admin Only)
              </DropdownMenuItem>
            )}
            {!pupil.is_active && (
              <DropdownMenuItem className="text-emerald-600">
                <UserCheck className="h-4 w-4 mr-2" />
                Activate (Admin Only)
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-slate-400" disabled>
              <ShieldAlert className="h-4 w-4 mr-2" />
              Changes require admin access
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className={cn(
                'text-white font-bold',
                pupil.is_active
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-gradient-to-br from-slate-400 to-slate-500'
              )}>
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">{displayName}</div>
              <div className="text-sm font-normal text-slate-500">{pupil.email}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete pupil information and details
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Status Banner */}
          <div className="md:col-span-2">
            <div className={cn(
              'rounded-lg p-3 flex items-center gap-3',
              pupil.is_active ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
            )}>
              {pupil.is_active ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Active Student</p>
                    <p className="text-xs text-emerald-600">This student is currently active and receives all updates</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Inactive Student</p>
                    <p className="text-xs text-amber-600">This student cannot receive updates but can view previous information</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Personal Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name</span>
                <span className="font-medium text-slate-700">{pupil.full_name || 'N/A'}</span>
              </div>
              {pupil.display_name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Display Name</span>
                  <span className="font-medium text-slate-700">{pupil.display_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Gender</span>
                <span className="font-medium text-slate-700">{pupil.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date of Birth</span>
                <span className="font-medium text-slate-700">
                  {pupil.date_of_birth ? new Date(pupil.date_of_birth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* School Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <School className="h-4 w-4 text-emerald-500" />
              School Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Class</span>
                <span className="font-medium text-slate-700">{pupil.class || 'Unassigned'}</span>
              </div>
              {pupil.class_arm && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Class Arm</span>
                  <span className="font-medium text-slate-700">{pupil.class_arm}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Admission Number</span>
                <span className="font-medium text-slate-700">{pupil.admission_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VIN ID</span>
                <span className="font-medium text-slate-700">{pupil.vin_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <Badge variant={pupil.is_active ? 'default' : 'secondary'} className="text-xs">
                  {pupil.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan-500" />
              Contact Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-700 truncate max-w-[200px]">{pupil.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="font-medium text-slate-700">{pupil.phone || 'N/A'}</span>
              </div>
              {pupil.address && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Address</span>
                  <span className="font-medium text-slate-700 text-right max-w-[200px]">{pupil.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              Guardian Information
            </h4>
            <div className="space-y-2 text-sm">
              {pupil.guardian_name ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guardian Name</span>
                    <span className="font-medium text-slate-700">{pupil.guardian_name}</span>
                  </div>
                  {pupil.guardian_phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Guardian Phone</span>
                      <span className="font-medium text-slate-700">{pupil.guardian_phone}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-400 text-sm">No guardian information available</p>
              )}
            </div>
          </div>

          {/* Last Active */}
          <div className="md:col-span-2">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Last Active: {pupil.last_active ? new Date(pupil.last_active).toLocaleString() : 'N/A'}</span>
                <span className="mx-2">•</span>
                <span>Joined: {new Date(pupil.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            disabled
          >
            <ShieldAlert className="h-4 w-4 mr-2" />
            Admin Only
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
  const [selectedView, setSelectedView] = useState<'list' | 'grid'>('list')
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
  const itemsPerPage = 20

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

      if (error) {
        console.error('Error fetching pupils:', error)
        toast.error('Failed to load pupils')
        return
      }

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
        // By class
        const className = p.class || 'Unassigned'
        byClass[className] = (byClass[className] || 0) + 1
        
        // By gender
        if (p.gender?.toLowerCase() === 'male') byGender.male++
        else if (p.gender?.toLowerCase() === 'female') byGender.female++
        else byGender.other++
        
        // By class arm
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

      // Get unique classes
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

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(p =>
        p.full_name?.toLowerCase().includes(query) ||
        p.display_name?.toLowerCase().includes(query) ||
        p.first_name?.toLowerCase().includes(query) ||
        p.last_name?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.vin_id?.toLowerCase().includes(query) ||
        p.admission_number?.toLowerCase().includes(query)
      )
    }

    // Class filter
    if (selectedClass !== 'all') {
      filtered = filtered.filter(p => p.class === selectedClass)
    }

    // Status filter
    if (selectedStatus === 'active') {
      filtered = filtered.filter(p => p.is_active !== false)
    } else if (selectedStatus === 'inactive') {
      filtered = filtered.filter(p => p.is_active === false)
    }

    setFilteredPupils(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedClass, selectedStatus, pupils])

  // ─── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredPupils.length / itemsPerPage)
  const paginatedPupils = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredPupils.slice(start, end)
  }, [filteredPupils, currentPage, itemsPerPage])

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPupils()
    toast.success('Pupils refreshed!')
    setRefreshing(false)
  }

  const handleView = (pupil: Pupil) => {
    setSelectedPupil(pupil)
    setDetailOpen(true)
  }

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="h-7 w-7 text-blue-600" />
              Pupils
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View all pupils across classes {!isAdmin && '• Read-only access'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Read Only
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-slate-200"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Pupils"
            value={stats.total}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={UserCheck}
            color="green"
            subtitle={`${stats.active > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`}
          />
          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={UserX}
            color="amber"
          />
          <StatCard
            title="Classes"
            value={classes.length}
            icon={GraduationCap}
            color="violet"
          />
        </div>

        {/* ── Search & Filters ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search pupils by name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px] border-slate-200">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px] border-slate-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Results Count ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {paginatedPupils.length} of {filteredPupils.length} pupils
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedView('list')}
              className={cn(
                'h-8 w-8 p-0',
                selectedView === 'list' ? 'bg-slate-200' : ''
              )}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedView('grid')}
              className={cn(
                'h-8 w-8 p-0',
                selectedView === 'grid' ? 'bg-slate-200' : ''
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Pupils List ──────────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            {paginatedPupils.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No pupils found</p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchQuery ? 'Try adjusting your search or filters' : 'No pupils registered yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedPupils.map((pupil) => (
                  <PupilCard
                    key={pupil.id}
                    pupil={pupil}
                    onView={handleView}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Pagination ───────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="border-slate-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-slate-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Class Breakdown ────────────────────────────────────────────────── */}
        {Object.keys(stats.byClass).length > 0 && (
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-600" />
                Class Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.byClass)
                  .sort((a, b) => b[1] - a[1])
                  .map(([className, count]) => (
                    <div
                      key={className}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                    >
                      <span className="text-sm font-medium text-slate-700">{className}</span>
                      <Badge className="bg-blue-100 text-blue-700">{count} pupils</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Pupils Management</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
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