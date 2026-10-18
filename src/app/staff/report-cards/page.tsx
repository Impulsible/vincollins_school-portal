/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  FileText, Search, RefreshCw, Loader2, Eye, Edit3, Save, X,
  CheckCircle2, Clock, AlertCircle, Calendar, ClipboardCheck,
  MessageSquare, ArrowLeft, Users, School, MoreVertical,
} from 'lucide-react'
import { format } from 'date-fns'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportCard {
  id: string
  student_id: string
  student_name: string
  student_vin: string
  student_admission_number: string
  class: string
  term: string
  session_year?: string
  academic_year: string
  status: 'generated' | 'approved' | 'published' | 'rejected'
  generated_at: string
  approved_at?: string | null
  published_at?: string | null
  teacher_comment?: string | null
  principal_comment?: string | null
  photo_url?: string | null
}

interface TeacherClass {
  id: string
  class_name: string
  class_arm?: string
}

interface Student {
  id: string
  full_name: string
  display_name?: string
  admission_number?: string
  vin_id?: string
  photo_url?: string
  class: string
  class_arm?: string
}

const hideScrollbar =
  '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'

const getInitials = (name?: string | null) => {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase()
}

// ── Loading ───────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50/50 px-4">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-3xl bg-blue-400 blur-2xl opacity-20 animate-pulse" />
        <div className="relative p-4 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <FileText className="h-10 w-10 text-white" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-700">Loading report cards</p>
      <p className="text-xs text-slate-400 mt-1">Fetching your students...</p>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'emerald' | 'amber' | 'violet'
}) {
  const map = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-500' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'bg-violet-500' },
  }
  const c = map[color]

  return (
    <div
      className={cn(
        'rounded-2xl p-4 border shrink-0 w-[150px] sm:w-auto snap-start shadow-sm',
        c.bg,
        c.border
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm', c.icon)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-xs text-slate-500 font-semibold mt-1.5">{label}</p>
    </div>
  )
}

// ── Report Card Row ───────────────────────────────────────────────────────────

function ReportCardRow({
  card,
  onEdit,
  onView,
}: {
  card: ReportCard
  onEdit: () => void
  onView: () => void
}) {
  const statusConfig = {
    generated: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: ClipboardCheck },
    published: { label: 'Published', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700', icon: AlertCircle },
  }

  const config = statusConfig[card.status] || statusConfig.generated
  const StatusIcon = config.icon
  const needsComment = !card.teacher_comment && card.status !== 'published'

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all hover:shadow-md active:scale-[0.99]">
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-11 w-11 sm:h-10 sm:w-10 shrink-0">
          <AvatarImage src={card.photo_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
            {getInitials(card.student_name)}
          </AvatarFallback>
        </Avatar>

        <button onClick={onView} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 truncate text-[15px] sm:text-sm">
              {card.student_name}
            </p>
            <Badge className={cn('text-[10px] gap-1 border-0 font-semibold', config.color)}>
              <StatusIcon className="h-2.5 w-2.5" />
              {config.label}
            </Badge>
            {needsComment && (
              <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] font-semibold">
                <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                Needs Comment
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap">
            <span className="font-medium">{card.class}</span>
            <span className="text-slate-300">·</span>
            <span className="truncate">{card.student_admission_number || card.student_vin}</span>
            <span className="text-slate-300">·</span>
            <span>{card.term} Term</span>
          </div>
        </button>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="h-9 w-9 p-0 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {card.status !== 'published' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-9 w-9 p-0 rounded-full text-slate-500 hover:text-amber-600 hover:bg-amber-50"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile dropdown */}
        <div className="sm:hidden shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem onClick={onView} className="gap-2 cursor-pointer">
                <Eye className="h-4 w-4" /> View
              </DropdownMenuItem>
              {card.status !== 'published' && (
                <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                  <Edit3 className="h-4 w-4" />
                  {card.teacher_comment ? 'Edit Comment' : 'Add Comment'}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {card.teacher_comment && (
        <div className="px-4 pb-3 pt-0 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-600 line-clamp-2 pt-2.5 leading-relaxed">
            <span className="font-semibold text-violet-600">Remark · </span>
            {card.teacher_comment}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function StaffReportCardsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [reportCards, setReportCards] = useState<ReportCard[]>([])
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [editingCard, setEditingCard] = useState<ReportCard | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [tempComment, setTempComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [viewingCard, setViewingCard] = useState<ReportCard | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const stats = useMemo(() => {
    const total = reportCards.length
    const published = reportCards.filter((c) => c.status === 'published').length
    const pending = reportCards.filter(
      (c) => c.status === 'generated' || c.status === 'approved'
    ).length
    const needComment = reportCards.filter(
      (c) => !c.teacher_comment && c.status !== 'published'
    ).length
    return { total, published, pending, needComment }
  }, [reportCards])

  const fetchTeacherClasses = useCallback(async () => {
    if (!user?.id) return []
    try {
      const { data, error } = await supabase
        .from('teacher_classes')
        .select('id, class_name, class_arm')
        .eq('teacher_id', user.id)
      if (error) {
        console.error('Error fetching teacher classes:', error)
        return []
      }
      setTeacherClasses(data || [])
      return data || []
    } catch (error) {
      console.error('Error:', error)
      return []
    }
  }, [user?.id])

  const fetchStudents = useCallback(async (classes: TeacherClass[]) => {
    if (classes.length === 0) {
      setStudents([])
      return
    }
    try {
      const classNames = classes.map((c) => c.class_name)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, display_name, admission_number, vin_id, photo_url, class, class_arm')
        .in('role', ['student', 'pupil'])
        .in('class', classNames)
        .eq('is_active', true)
        .order('full_name', { ascending: true })
      if (error) {
        console.error('Error fetching students:', error)
        return
      }
      setStudents(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  const fetchReportCards = useCallback(async () => {
    if (!user?.id || teacherClasses.length === 0) {
      setReportCards([])
      setLoading(false)
      return
    }
    setRefreshing(true)
    try {
      const studentIds = students.map((s) => s.id)
      if (studentIds.length === 0) {
        setReportCards([])
        setLoading(false)
        setRefreshing(false)
        return
      }

      const { data, error } = await supabase
        .from('report_cards')
        .select('*')
        .in('student_id', studentIds)
        .order('generated_at', { ascending: false })

      if (error) {
        console.error('Error fetching report cards:', error)
        toast.error('Failed to load report cards')
        return
      }

      const reportCardsWithPhotos: ReportCard[] = (data || []).map(
        (rc: ReportCard & { session_year?: string }) => {
          const student = students.find((s) => s.id === rc.student_id)
          return {
            ...rc,
            student_name: student?.display_name || student?.full_name || 'Student',
            student_vin: student?.vin_id || 'N/A',
            student_admission_number: student?.admission_number || 'N/A',
            academic_year: rc.session_year || rc.academic_year || 'N/A',
            teacher_comment: rc.teacher_comment || '',
            principal_comment: rc.principal_comment || '',
            photo_url: student?.photo_url || null,
          }
        }
      )
      setReportCards(reportCardsWithPhotos)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load report cards')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, teacherClasses, students])

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      const classes = await fetchTeacherClasses()
      await fetchStudents(classes)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [fetchTeacherClasses, fetchStudents])

  useEffect(() => {
    if (!authLoading && user) loadAllData()
  }, [authLoading, user, loadAllData])

  useEffect(() => {
    if (students.length > 0 && teacherClasses.length > 0) {
      fetchReportCards()
    } else if (students.length === 0 && teacherClasses.length > 0) {
      setReportCards([])
      setLoading(false)
    }
  }, [students, teacherClasses, fetchReportCards])

  const handleRefresh = useCallback(async () => {
    await loadAllData()
    toast.success('Refreshed!')
  }, [loadAllData])

  const handleSaveComment = async () => {
    if (!editingCard) return
    setSavingComment(true)
    try {
      const { error } = await supabase
        .from('report_cards')
        .update({
          teacher_comment: tempComment.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCard.id)

      if (error) throw error

      setReportCards((prev) =>
        prev.map((rc) =>
          rc.id === editingCard.id ? { ...rc, teacher_comment: tempComment.trim() } : rc
        )
      )
      toast.success('Comment saved successfully!')
      setEditDialogOpen(false)
      setEditingCard(null)
      setTempComment('')
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to save comment'
      console.error('Error saving comment:', msg)
      toast.error(msg)
    } finally {
      setSavingComment(false)
    }
  }

  const openEditDialog = (card: ReportCard) => {
    setEditingCard(card)
    setTempComment(card.teacher_comment || '')
    setEditDialogOpen(true)
  }

  const filteredCards = useMemo(() => {
    let filtered = [...reportCards]
    if (selectedClass !== 'all') filtered = filtered.filter((rc) => rc.class === selectedClass)
    if (selectedStatus !== 'all') filtered = filtered.filter((rc) => rc.status === selectedStatus)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (rc) =>
          rc.student_name.toLowerCase().includes(q) ||
          rc.student_admission_number?.toLowerCase().includes(q) ||
          rc.student_vin?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [reportCards, selectedClass, selectedStatus, searchQuery])

  // Body scroll lock for modals
  useEffect(() => {
    if (editDialogOpen || viewDialogOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [editDialogOpen, viewDialogOpen])

  if (authLoading || loading) return <LoadingState />

  if (teacherClasses.length === 0 && !loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50/50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <School className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Classes Assigned</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You haven&apos;t been assigned to any classes yet. Please contact the admin.
          </p>
          <Button
            onClick={() => router.push('/staff')}
            className="mt-5 h-11 bg-slate-800 hover:bg-slate-900 rounded-xl gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (students.length === 0 && !loading && teacherClasses.length > 0) {
    return (
      <div className="min-h-[100dvh] bg-slate-50/50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Students Found</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            No students are currently enrolled in your assigned classes.
          </p>
          <Button
            onClick={handleRefresh}
            className="mt-5 h-11 bg-blue-600 hover:bg-blue-700 rounded-xl gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-24 lg:pb-8">
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[73px]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">Report Cards</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none truncate">
                  View & manage student reports
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-10 w-10 sm:w-auto sm:px-3 p-0 rounded-xl border-slate-200"
            >
              <RefreshCw className={cn('h-4 w-4 sm:mr-2', refreshing && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Stats */}
        <div
          className={cn(
            'flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:pb-0',
            hideScrollbar
          )}
        >
          <StatCard label="Total" value={stats.total} icon={FileText} color="blue" />
          <StatCard label="Published" value={stats.published} icon={CheckCircle2} color="emerald" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
          <StatCard label="Need Comment" value={stats.needComment} icon={MessageSquare} color="violet" />
        </div>

        {/* Filters */}
        <div className="sticky top-[73px] z-20 bg-slate-50/90 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:static">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-3 sm:p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 sm:h-10 text-base sm:text-sm rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-11 sm:h-9 text-base sm:text-xs rounded-xl font-semibold flex-1">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {teacherClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.class_name}>
                      {cls.class_name} {cls.class_arm && `(${cls.class_arm})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 sm:h-9 text-base sm:text-xs rounded-xl font-semibold flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="generated">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Showing{' '}
                <span className="font-bold text-slate-700">{filteredCards.length}</span> of{' '}
                {reportCards.length}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedClass('all')
                  setSelectedStatus('all')
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 h-8 px-2"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        {filteredCards.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No report cards found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No report cards match your search.'
                : selectedStatus !== 'all'
                  ? `No ${selectedStatus} report cards.`
                  : 'Report cards will appear here once generated.'}
            </p>
            {(searchQuery || selectedClass !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedClass('all')
                  setSelectedStatus('all')
                }}
                className="mt-4 h-10 rounded-xl"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCards.map((card) => (
              <ReportCardRow
                key={card.id}
                card={card}
                onEdit={() => openEditDialog(card)}
                onView={() => {
                  setViewingCard(card)
                  setViewDialogOpen(true)
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff · Report Cards</p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.
          </p>
        </div>
      </div>

      {/* Edit Comment — bottom sheet on mobile */}
      {editDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => {
              setEditDialogOpen(false)
              setEditingCard(null)
              setTempComment('')
            }}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90dvh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex flex-col items-center pt-3 sm:pt-0 shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3 sm:hidden" />
              <div className="w-full flex items-center justify-between px-5 pb-3 sm:pt-5 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-blue-600" />
                    Teacher&apos;s Remark
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For <strong>{editingCard?.student_name}</strong>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditDialogOpen(false)
                    setEditingCard(null)
                    setTempComment('')
                  }}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={editingCard?.photo_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                    {getInitials(editingCard?.student_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-800">{editingCard?.student_name}</p>
                  <p className="text-xs text-slate-500">{editingCard?.class}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Your Comment
                </label>
                <Textarea
                  value={tempComment}
                  onChange={(e) => setTempComment(e.target.value)}
                  placeholder="Enter your remark for this student..."
                  className="min-h-[140px] text-base sm:text-sm rounded-xl resize-none"
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setEditingCard(null)
                  setTempComment('')
                }}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveComment}
                disabled={savingComment}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl"
              >
                {savingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Dialog — bottom sheet on mobile */}
      {viewDialogOpen && viewingCard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setViewDialogOpen(false)}
          />
          <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90dvh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="flex flex-col items-center pt-3 sm:pt-0 shrink-0">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3 sm:hidden" />
              <div className="w-full flex items-center justify-between px-5 pb-3 sm:pt-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  Report Card Details
                </h2>
                <button
                  onClick={() => setViewDialogOpen(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className={cn('flex-1 overflow-y-auto px-5 py-4 space-y-4', hideScrollbar)}>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={viewingCard.photo_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                    {getInitials(viewingCard.student_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{viewingCard.student_name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {viewingCard.class} ·{' '}
                    {viewingCard.student_admission_number || viewingCard.student_vin}
                  </p>
                </div>
                <Badge
                  className={cn(
                    'border-0 font-semibold shrink-0',
                    viewingCard.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : viewingCard.status === 'approved'
                        ? 'bg-blue-100 text-blue-700'
                        : viewingCard.status === 'generated'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                  )}
                >
                  {viewingCard.status.charAt(0).toUpperCase() + viewingCard.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Term</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{viewingCard.term}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Session</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{viewingCard.academic_year}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
                <p className="text-xs font-bold text-violet-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Teacher&apos;s Remark
                </p>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                  {viewingCard.teacher_comment || (
                    <span className="text-slate-400 italic">No comment yet</span>
                  )}
                </p>
              </div>

              {viewingCard.principal_comment && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Principal&apos;s Remark
                  </p>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                    {viewingCard.principal_comment}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Generated:{' '}
                  {viewingCard.generated_at
                    ? format(new Date(viewingCard.generated_at), 'MMM d, yyyy')
                    : 'N/A'}
                </span>
                {viewingCard.published_at && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>
                      Published: {format(new Date(viewingCard.published_at), 'MMM d, yyyy')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
              {viewingCard.status !== 'published' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewDialogOpen(false)
                    openEditDialog(viewingCard)
                  }}
                  className="flex-1 h-11 rounded-xl gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Comment
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
                className="flex-1 h-11 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}