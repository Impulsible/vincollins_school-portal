/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  FileText,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  ClipboardCheck,
  MessageSquare,
  ArrowLeft,
  Users,
  School,
} from 'lucide-react'
import { format } from 'date-fns'

// ── Types ──────────────────────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────────

const getInitials = (name?: string | null) => {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase()
}

// ── Loading State ──────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-blue-400 blur-2xl opacity-20 animate-pulse" />
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <FileText className="h-10 w-10 text-white" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-700">Loading report cards</p>
      <p className="text-xs text-slate-400 mt-1">Fetching your students...</p>
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'green' | 'amber' | 'violet' | 'rose'
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    violet: 'bg-violet-50 border-violet-200 text-violet-600',
    rose: 'bg-rose-50 border-rose-200 text-rose-600',
  }

  return (
    <div className={cn('rounded-2xl p-4 border shadow-sm', colors[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/50">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StaffReportCardsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [reportCards, setReportCards] = useState<ReportCard[]>([])
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // ─── Dialog States ──────────────────────────────────────────────────────────
  const [editingCard, setEditingCard] = useState<ReportCard | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [tempComment, setTempComment] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [viewingCard, setViewingCard] = useState<ReportCard | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = reportCards.length
    const published = reportCards.filter(c => c.status === 'published').length
    const pending = reportCards.filter(c => c.status === 'generated' || c.status === 'approved').length
    const needComment = reportCards.filter(c => !c.teacher_comment && c.status !== 'published').length

    return { total, published, pending, needComment }
  }, [reportCards])

  // ─── Fetch Teacher's Classes ────────────────────────────────────────────────

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

  // ─── Fetch Students for Teacher's Classes ──────────────────────────────────

  const fetchStudents = useCallback(async (classes: TeacherClass[]) => {
    if (classes.length === 0) {
      setStudents([])
      return
    }

    try {
      const classNames = classes.map(c => c.class_name)
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

  // ─── Fetch Report Cards ─────────────────────────────────────────────────────

  const fetchReportCards = useCallback(async () => {
    if (!user?.id || teacherClasses.length === 0) {
      setReportCards([])
      setLoading(false)
      return
    }

    setRefreshing(true)
    try {
      const studentIds = students.map(s => s.id)

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

      // Add student details and format fields to match database schema
      const reportCardsWithPhotos: ReportCard[] = (data || []).map((rc: any) => {
        const student = students.find(s => s.id === rc.student_id)
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
      })

      setReportCards(reportCardsWithPhotos)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load report cards')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, teacherClasses, students])

  // ─── Load All Data ──────────────────────────────────────────────────────────

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

  // ─── Initial Load ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user) {
      loadAllData()
    }
  }, [authLoading, user, loadAllData])

  // ─── Load Report Cards when students change ─────────────────────────────────

  useEffect(() => {
    if (students.length > 0 && teacherClasses.length > 0) {
      fetchReportCards()
    } else if (students.length === 0 && teacherClasses.length > 0) {
      setReportCards([])
      setLoading(false)
    }
  }, [students, teacherClasses, fetchReportCards])

  // ─── Handle Refresh ─────────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    await loadAllData()
    toast.success('Refreshed!')
  }, [loadAllData])

  // ─── Handle Save Teacher Comment ────────────────────────────────────────────

  const handleSaveComment = async () => {
    if (!editingCard) return

    setSavingComment(true)
    try {
      // ✅ Correct column name: teacher_comment (singular)
      const { error } = await supabase
        .from('report_cards')
        .update({
          teacher_comment: tempComment.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCard.id)

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }

      // Update local state
      setReportCards(prev =>
        prev.map(rc =>
          rc.id === editingCard.id
            ? { ...rc, teacher_comment: tempComment.trim() }
            : rc
        )
      )

      toast.success('Comment saved successfully!')
      setEditDialogOpen(false)
      setEditingCard(null)
      setTempComment('')
    } catch (error: any) {
      console.error('Error saving comment:', error?.message || error)
      toast.error(error?.message || 'Failed to save comment')
    } finally {
      setSavingComment(false)
    }
  }

  // ─── Open Edit Dialog ───────────────────────────────────────────────────────

  const openEditDialog = (card: ReportCard) => {
    setEditingCard(card)
    setTempComment(card.teacher_comment || '')
    setEditDialogOpen(true)
  }

  // ─── Filtered Report Cards ──────────────────────────────────────────────────

  const filteredCards = useMemo(() => {
    let filtered = [...reportCards]

    if (selectedClass !== 'all') {
      filtered = filtered.filter(rc => rc.class === selectedClass)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(rc => rc.status === selectedStatus)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(rc =>
        rc.student_name.toLowerCase().includes(q) ||
        rc.student_admission_number?.toLowerCase().includes(q) ||
        rc.student_vin?.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [reportCards, selectedClass, selectedStatus, searchQuery])

  // ─── Loading State ──────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState />
        </div>
      </div>
    )
  }

  // ─── No Classes Assigned ────────────────────────────────────────────────────

  if (teacherClasses.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <School className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">No Classes Assigned</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                You haven't been assigned to any classes yet. Please contact the admin.
              </p>
              <Button
                onClick={() => router.push('/staff')}
                className="mt-4 bg-slate-800 hover:bg-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ─── No Students ─────────────────────────────────────────────────────────────

  if (students.length === 0 && !loading && teacherClasses.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">No Students Found</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No students are currently enrolled in your assigned classes.
              </p>
              <Button
                onClick={handleRefresh}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ─── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-7 w-7 text-blue-600" />
              Report Cards
            </h1>
            <p className="text-sm text-slate-500">
              View and manage report cards for your students
            </p>
          </div>
          <div className="flex items-center gap-2">
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

        {/* ─── Stats ────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} icon={FileText} color="blue" />
          <StatCard label="Published" value={stats.published} icon={CheckCircle2} color="green" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
          <StatCard label="Need Comment" value={stats.needComment} icon={MessageSquare} color="violet" />
        </div>

        {/* ─── Filters ──────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm border-slate-200 rounded-lg"
              />
            </div>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-9 text-xs w-[150px] border-slate-200 rounded-lg font-semibold">
                <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
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
              <SelectTrigger className="h-9 text-xs w-[140px] border-slate-200 rounded-lg font-semibold">
                <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
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
              Showing <span className="font-bold text-slate-700">{filteredCards.length}</span> of {reportCards.length} report cards
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedClass('all')
                setSelectedStatus('all')
              }}
              className="h-7 text-xs text-slate-500 hover:text-slate-700"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          </div>
        </div>

        {/* ─── Report Cards List ───────────────────────────────────────────────── */}
        {filteredCards.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No report cards found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No report cards match your search criteria.'
                  : selectedStatus !== 'all'
                  ? `No ${selectedStatus} report cards.`
                  : 'Report cards will appear here once generated.'}
              </p>
            </CardContent>
          </Card>
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

        {/* ─── Footer ──────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff • Report Cards</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>

      {/* ─── Edit Comment Dialog ──────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              Teacher's Remark
            </DialogTitle>
            <DialogDescription>
              Add or edit your comment for <strong>{editingCard?.student_name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <Avatar className="h-10 w-10">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Your Comment</label>
              <Textarea
                value={tempComment}
                onChange={(e) => setTempComment(e.target.value)}
                placeholder="Enter your remark for this student..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-slate-400">
                This comment will appear on the report card and can be edited later.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setEditingCard(null)
                setTempComment('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveComment}
              disabled={savingComment}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              {savingComment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── View Report Card Dialog ──────────────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Report Card Details
            </DialogTitle>
          </DialogHeader>

          {viewingCard && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={viewingCard.photo_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                    {getInitials(viewingCard.student_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-800">{viewingCard.student_name}</p>
                  <p className="text-xs text-slate-500">
                    {viewingCard.class} · {viewingCard.student_admission_number || viewingCard.student_vin}
                  </p>
                </div>
                <Badge className={cn(
                  'ml-auto',
                  viewingCard.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                  viewingCard.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                  viewingCard.status === 'generated' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                )}>
                  {viewingCard.status.charAt(0).toUpperCase() + viewingCard.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Term</p>
                  <p className="font-semibold text-slate-700">{viewingCard.term}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Session</p>
                  <p className="font-semibold text-slate-700">{viewingCard.academic_year}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-xs font-bold text-purple-700 flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Teacher's Remark
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  {viewingCard.teacher_comment || (
                    <span className="text-slate-400 italic">No comment yet</span>
                  )}
                </p>
              </div>

              {viewingCard.principal_comment && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 flex items-center gap-1">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Principal's Remark
                  </p>
                  <p className="text-sm text-slate-700 mt-1">{viewingCard.principal_comment}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Generated: {viewingCard.generated_at ? format(new Date(viewingCard.generated_at), 'MMM d, yyyy') : 'N/A'}</span>
                {viewingCard.published_at && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>Published: {format(new Date(viewingCard.published_at), 'MMM d, yyyy')}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {viewingCard && (
              <Button
                variant="outline"
                onClick={() => {
                  setViewDialogOpen(false)
                  openEditDialog(viewingCard)
                }}
                className="gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit Comment
              </Button>
            )}
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Report Card Row Component ─────────────────────────────────────────────────

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
    generated: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: ClipboardCheck },
    published: { label: 'Published', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-700', icon: AlertCircle },
  }

  const config = statusConfig[card.status as keyof typeof statusConfig] || statusConfig.generated
  const StatusIcon = config.icon

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden group">
      <div className="p-4 flex items-center gap-4">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={card.photo_url || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
            {getInitials(card.student_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 truncate">{card.student_name}</p>
            <Badge className={cn('text-[10px] gap-1', config.color)}>
              <StatusIcon className="h-2.5 w-2.5" />
              {config.label}
            </Badge>
            {!card.teacher_comment && card.status !== 'published' && (
              <Badge className="bg-purple-100 text-purple-700 text-[10px]">
                <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
                Needs Comment
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-medium">{card.class}</span>
            <span className="text-slate-300">·</span>
            <span>{card.student_admission_number || card.student_vin}</span>
            <span className="text-slate-300">·</span>
            <span>{card.term} Term</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {card.status !== 'published' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
              title={card.teacher_comment ? 'Edit comment' : 'Add comment'}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {card.teacher_comment && (
        <div className="px-4 pb-3 pt-0 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-600 line-clamp-1">
            <span className="font-semibold text-slate-700">💬</span> {card.teacher_comment}
          </p>
        </div>
      )}
    </div>
  )
}