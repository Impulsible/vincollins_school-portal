/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/report-cards/page.tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Loader2, ArrowLeft, Search, X, Filter, RefreshCw,
  ClipboardCheck, FileText, CheckCircle2, Send, Eye,
  Users, Clock, Sparkles, AlertTriangle, ChevronRight,
  Check, XCircle, Layers, ArrowRight, Trash2, MessageSquare,
  Calendar, GraduationCap, LayoutGrid, List,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ─────────────────────────────────────────────────────────────
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
  rejected_at?: string | null
  teacher_comments?: string
  principal_comments?: string
  approved_by?: string | null
  published_by?: string | null
  rejected_by?: string | null
  rejection_reason?: string | null
  photo_url?: string | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  published: number
  rejected: number
}

// ─── Constants ─────────────────────────────────────────────────────────
const TERM_OPTIONS = [
  { value: 'First', label: 'First Term' },
  { value: 'Second', label: 'Second Term' },
  { value: 'Third', label: 'Third Term' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status', icon: Layers },
  { value: 'generated', label: 'Pending Approval', icon: Clock },
  { value: 'approved', label: 'Approved', icon: ClipboardCheck },
  { value: 'published', label: 'Published', icon: CheckCircle2 },
  { value: 'rejected', label: 'Rejected', icon: XCircle },
] as const

// ─── Status Config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  generated: {
    label: 'Pending Approval',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
    accent: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: ClipboardCheck,
    accent: 'bg-blue-500',
  },
  published: {
    label: 'Published',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    accent: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
    accent: 'bg-rose-500',
  },
} as const

// ─── Helpers ───────────────────────────────────────────────────────────
const getInitials = (name?: string | null) => {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase()
}

const getAvatarGradient = (name?: string | null) => {
  const gradients = [
    'from-rose-500 to-pink-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
  ]
  const safeName = (name && typeof name === 'string' && name.trim().length > 0) ? name : 'Student'
  const hash = safeName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatRelativeTime = (dateStr?: string | null) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateStr)
}

// ─── Loading State ─────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-blue-400 blur-2xl opacity-20 animate-pulse" />
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
          <ClipboardCheck className="h-10 w-10 text-white" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-700">Loading report cards</p>
      <p className="text-xs text-slate-400 mt-1">Fetching approval queue...</p>
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, tone, subtitle, delay = 0,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  tone: 'slate' | 'amber' | 'blue' | 'emerald' | 'rose'
  subtitle?: string
  delay?: number
}) {
  const tones = {
    slate: { bg: 'bg-slate-50', icon: 'text-slate-600', accent: 'bg-slate-500' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', accent: 'bg-amber-500' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', accent: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', accent: 'bg-emerald-500' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', accent: 'bg-rose-500' },
  }
  const t = tones[tone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative overflow-hidden bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
    >
      <div className={cn('absolute top-0 left-0 right-0 h-0.5', t.accent)} />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight truncate">
            {label}
          </p>
          <div className={cn('shrink-0 h-6 w-6 rounded-lg flex items-center justify-center', t.bg)}>
            <Icon className={cn('h-3 w-3', t.icon)} />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
          {value}
        </p>
        {subtitle && (
          <p className="text-[9px] text-slate-500 font-semibold mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Report Card Row ───────────────────────────────────────────────────
function ReportCardRow({
  card,
  index,
  onApprove,
  onReject,
  onPublish,
  onView,
  onDelete,
  processingIds,
}: {
  card: ReportCard
  index: number
  onApprove: (card: ReportCard) => void
  onReject: (card: ReportCard) => void
  onPublish: (card: ReportCard) => void
  onView: (card: ReportCard) => void
  onDelete: (card: ReportCard) => void
  processingIds: Set<string>
}) {
  const status = STATUS_CONFIG[card.status] || STATUS_CONFIG.generated
  const StatusIcon = status.icon
  const isProcessing = processingIds.has(card.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="p-3 sm:p-4 flex items-center gap-3">
        {/* Avatar */}
        <div
          className={cn(
            'shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-sm bg-gradient-to-br',
            getAvatarGradient(card.student_name)
          )}
        >
          {getInitials(card.student_name)}
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onView(card)}
            className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 transition-colors block text-left w-full"
          >
            {card.student_name || 'Unnamed Student'}
          </button>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="text-[10px] font-mono text-slate-400 font-semibold">
              {card.student_admission_number || card.student_vin || 'N/A'}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] font-semibold text-slate-500">
              {card.class || 'No class'}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] text-slate-500">
              {card.term} Term · {card.academic_year}
            </span>
          </div>
        </div>

        {/* Timestamp (desktop) */}
        <div className="hidden md:flex flex-col items-end shrink-0 min-w-[100px]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {card.status === 'published' ? 'Published' :
              card.status === 'approved' ? 'Approved' :
                card.status === 'rejected' ? 'Rejected' : 'Generated'}
          </span>
          <span className="text-[11px] font-semibold text-slate-600">
            {formatRelativeTime(
              card.status === 'published' ? card.published_at :
                card.status === 'approved' ? card.approved_at :
                  card.status === 'rejected' ? card.rejected_at :
                    card.generated_at
            )}
          </span>
        </div>

        {/* Status Badge */}
        <div className={cn('hidden sm:flex items-center gap-1 px-2 py-1 rounded-full border shrink-0', status.bg, status.border)}>
          <StatusIcon className={cn('h-2.5 w-2.5', status.text)} />
          <span className={cn('text-[10px] font-bold', status.text)}>{status.label}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* View button - links to report card view */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(card)}
            className="h-8 w-8 p-0 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            title="View report card"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          {/* Approve button (for pending) */}
          {card.status === 'generated' && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(card)}
                disabled={isProcessing}
                className="h-8 sm:px-3 p-0 sm:gap-1 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 disabled:opacity-40 w-8 sm:w-auto"
                title="Approve"
              >
                {isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs font-bold">Approve</span>
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(card)}
                disabled={isProcessing}
                className="h-8 w-8 p-0 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                title="Reject"
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          {/* Publish button (for approved) */}
          {card.status === 'approved' && (
            <Button
              size="sm"
              onClick={() => onPublish(card)}
              disabled={isProcessing}
              className="h-8 sm:px-3 p-0 sm:gap-1 bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 disabled:opacity-40 w-8 sm:w-auto"
              title="Publish to pupil"
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs font-bold">Publish</span>
                </>
              )}
            </Button>
          )}

          {/* Delete button (for rejected only) */}
          {card.status === 'rejected' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(card)}
              disabled={isProcessing}
              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile status + timestamp */}
      <div className="sm:hidden px-3 pb-3 flex items-center justify-between gap-2">
        <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full border', status.bg, status.border)}>
          <StatusIcon className={cn('h-2.5 w-2.5', status.text)} />
          <span className={cn('text-[10px] font-bold', status.text)}>{status.label}</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400">
          {formatRelativeTime(
            card.status === 'published' ? card.published_at :
              card.status === 'approved' ? card.approved_at :
                card.status === 'rejected' ? card.rejected_at :
                  card.generated_at
          )}
        </span>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════
export default function AdminReportCardsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [reportCards, setReportCards] = useState<ReportCard[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'generated' | 'approved' | 'published' | 'rejected'>('all')
  const [filterClass, setFilterClass] = useState<string>('all')
  const [filterTerm, setFilterTerm] = useState<string>('all')
  const [filterYear, setFilterYear] = useState<string>('all')

  // Dialog states
  const [viewingCard, setViewingCard] = useState<ReportCard | null>(null)
  const [rejectingCard, setRejectingCard] = useState<ReportCard | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [bulkAction, setBulkAction] = useState<'approve' | 'publish' | null>(null)

  const [profile, setProfile] = useState<{ id: string; full_name: string } | null>(null)

  // ─── Fetch profile ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data)
      }
    }
    fetchProfile()
  }, [])

  // ─── Fetch report cards ───────────────────────────────────────────
  const fetchReportCards = useCallback(async () => {
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('report_cards')
        .select(`
          *,
          student:profiles!report_cards_student_id_fkey (
            id,
            full_name,
            display_name,
            admission_number,
            vin_id,
            photo_url
          )
        `)
        .order('generated_at', { ascending: false })
        .limit(1000)

      if (error) {
        // Fallback to simple select if join alias fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('report_cards')
          .select('*')
          .order('generated_at', { ascending: false })
          .limit(1000)

        if (fallbackError) throw fallbackError

        // Fetch students separately
        const studentIds = [...new Set((fallbackData || []).map(r => r.student_id).filter(Boolean))]
        const studentMap: Record<string, any> = {}

        if (studentIds.length > 0) {
          const { data: studentsData } = await supabase
            .from('profiles')
            .select('id, full_name, display_name, admission_number, vin_id, photo_url')
            .in('id', studentIds)

          ;(studentsData || []).forEach(s => {
            studentMap[s.id] = s
          })
        }

        const mappedFallback: ReportCard[] = (fallbackData || []).map((rc: any) => {
          const student = studentMap[rc.student_id] || {}
          return {
            ...rc,
            student_name: student.display_name || student.full_name || rc.student_name || 'Student',
            student_vin: student.vin_id || rc.student_vin || 'N/A',
            student_admission_number: student.admission_number || rc.student_admission_number || 'N/A',
            academic_year: rc.session_year || rc.academic_year || 'N/A',
            photo_url: student.photo_url || rc.photo_url || null,
          }
        })

        setReportCards(mappedFallback)
        return
      }

      const mappedData: ReportCard[] = (data || []).map((rc: any) => {
        const student = rc.student || {}
        return {
          ...rc,
          student_name: student.display_name || student.full_name || rc.student_name || 'Student',
          student_vin: student.vin_id || rc.student_vin || 'N/A',
          student_admission_number: student.admission_number || rc.student_admission_number || 'N/A',
          academic_year: rc.session_year || rc.academic_year || 'N/A',
          photo_url: student.photo_url || rc.photo_url || null,
        }
      })

      setReportCards(mappedData)
    } catch (error) {
      console.error('Error fetching report cards:', error)
      toast.error('Failed to load report cards')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchReportCards()
  }, [fetchReportCards])

  // ─── Computed ─────────────────────────────────────────────────────
  const stats = useMemo<Stats>(() => ({
    total: reportCards.length,
    pending: reportCards.filter(c => c.status === 'generated').length,
    approved: reportCards.filter(c => c.status === 'approved').length,
    published: reportCards.filter(c => c.status === 'published').length,
    rejected: reportCards.filter(c => c.status === 'rejected').length,
  }), [reportCards])

  const availableClasses = useMemo(
    () => [...new Set(reportCards.map(c => c.class).filter(Boolean))].sort(),
    [reportCards]
  )

  const availableYears = useMemo(
    () => [...new Set(reportCards.map(c => c.academic_year).filter(Boolean))].sort().reverse(),
    [reportCards]
  )

  const filteredCards = useMemo(() => {
    let f = [...reportCards]

    if (filterStatus !== 'all') f = f.filter(c => c.status === filterStatus)
    if (filterClass !== 'all') f = f.filter(c => c.class === filterClass)
    if (filterTerm !== 'all') f = f.filter(c => c.term === filterTerm)
    if (filterYear !== 'all') f = f.filter(c => c.academic_year === filterYear)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      f = f.filter(c =>
        c.student_name.toLowerCase().includes(q) ||
        c.student_admission_number?.toLowerCase().includes(q) ||
        c.student_vin?.toLowerCase().includes(q)
      )
    }

    return f
  }, [reportCards, filterStatus, filterClass, filterTerm, filterYear, searchQuery])

  const selectedCards = useMemo(
    () => filteredCards.filter(c => selectedIds.has(c.id)),
    [filteredCards, selectedIds]
  )

  const canBulkApprove = selectedCards.length > 0 && selectedCards.every(c => c.status === 'generated')
  const canBulkPublish = selectedCards.length > 0 && selectedCards.every(c => c.status === 'approved')

  // ─── Handlers ─────────────────────────────────────────────────────
  const addProcessing = (id: string) => {
    setProcessingIds(prev => new Set(prev).add(id))
  }

  const removeProcessing = (id: string) => {
    setProcessingIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(filteredCards.map(c => c.id)))
  }

  const clearSelection = () => setSelectedIds(new Set())

  // Adaptive Fallback Handlers prevent 400 Bad Requests if database structure differs
  const handleApprove = useCallback(async (card: ReportCard) => {
    addProcessing(card.id)
    try {
      const { error } = await supabase
        .from('report_cards')
        .update({
          status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', card.id)

      if (error) {
        console.warn('Full approval payload failed, retrying with adaptive minimal payload...', error)
        const { error: fallbackError } = await supabase
          .from('report_cards')
          .update({ status: 'approved' })
          .eq('id', card.id)

        if (fallbackError) throw fallbackError
      }

      toast.success(`✅ Approved ${card.student_name}`)
      await fetchReportCards()
    } catch (err) {
      console.error('Approval failed:', err)
      toast.error('Failed to approve')
    } finally {
      removeProcessing(card.id)
    }
  }, [profile, fetchReportCards])

  const handlePublish = useCallback(async (card: ReportCard) => {
    addProcessing(card.id)
    try {
      const { error } = await supabase
        .from('report_cards')
        .update({
          status: 'published',
          published_by: profile?.id,
          published_at: new Date().toISOString(),
        })
        .eq('id', card.id)

      if (error) {
        console.warn('Full publish payload failed, retrying with adaptive minimal payload...', error)
        const { error: fallbackError } = await supabase
          .from('report_cards')
          .update({ status: 'published' })
          .eq('id', card.id)

        if (fallbackError) throw fallbackError
      }

      toast.success(`🎉 Published ${card.student_name}'s report`)
      await fetchReportCards()
    } catch (err) {
      console.error('Publish failed:', err)
      toast.error('Failed to publish')
    } finally {
      removeProcessing(card.id)
    }
  }, [profile, fetchReportCards])

  const handleRejectSubmit = async () => {
    if (!rejectingCard) return
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    addProcessing(rejectingCard.id)
    try {
      const { error } = await supabase
        .from('report_cards')
        .update({
          status: 'rejected',
          rejected_by: profile?.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', rejectingCard.id)

      if (error) {
        console.warn('Full rejection payload failed, retrying with partial payloads...', error)
        const { error: fallbackError1 } = await supabase
          .from('report_cards')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason.trim(),
          })
          .eq('id', rejectingCard.id)

        if (fallbackError1) {
          console.warn('Rejection reason update failed, updating only status...', fallbackError1)
          const { error: fallbackError2 } = await supabase
            .from('report_cards')
            .update({ status: 'rejected' })
            .eq('id', rejectingCard.id)

          if (fallbackError2) throw fallbackError2
        }
      }

      toast.success(`Rejected ${rejectingCard.student_name}`)
      setRejectingCard(null)
      setRejectionReason('')
      await fetchReportCards()
    } catch (err) {
      console.error('Rejection failed:', err)
      toast.error('Failed to reject')
    } finally {
      if (rejectingCard) removeProcessing(rejectingCard.id)
    }
  }

  const handleDelete = async (card: ReportCard) => {
    if (!confirm(`Delete rejected report card for ${card.student_name}? This cannot be undone.`)) return

    addProcessing(card.id)
    try {
      const { error } = await supabase.from('report_cards').delete().eq('id', card.id)
      if (error) throw error
      toast.success(`Deleted report card`)
      await fetchReportCards()
    } catch {
      toast.error('Failed to delete')
    } finally {
      removeProcessing(card.id)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCards.length === 0) return

    const isApprove = bulkAction === 'approve'
    const fullUpdateData = isApprove
      ? { status: 'approved', approved_by: profile?.id, approved_at: new Date().toISOString() }
      : { status: 'published', published_by: profile?.id, published_at: new Date().toISOString() }

    const fallbackUpdateData = isApprove
      ? { status: 'approved' }
      : { status: 'published' }

    let successCount = 0
    let errorCount = 0

    for (const card of selectedCards) {
      addProcessing(card.id)
      try {
        const { error } = await supabase
          .from('report_cards')
          .update(fullUpdateData)
          .eq('id', card.id)

        if (error) {
          console.warn(`Bulk update failed for ID ${card.id}, retrying with fallback data...`, error)
          const { error: fallbackError } = await supabase
            .from('report_cards')
            .update(fallbackUpdateData)
            .eq('id', card.id)

          if (fallbackError) {
            errorCount++
          } else {
            successCount++
          }
        } else {
          successCount++
        }
      } catch (err) {
        errorCount++
      } finally {
        removeProcessing(card.id)
      }
    }

    if (successCount > 0) {
      toast.success(
        isApprove
          ? `✅ Approved ${successCount} report cards`
          : `🎉 Published ${successCount} report cards`
      )
    }
    if (errorCount > 0) toast.warning(`⚠️ ${errorCount} failed`)

    setBulkAction(null)
    clearSelection()
    await fetchReportCards()
  }

  // ─── View Handler - Navigate to report card view ────────────────────────
  const handleViewCard = (card: ReportCard) => {
    router.push(`/admin/report-cards/${card.id}/view`)
  }

  // ─── Guards ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState />
      </div>
    )
  }

  // ═══ Render ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 space-y-4">

        {/* ═══ Header ══════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 mb-1.5 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
                <ClipboardCheck className="h-4 w-4 text-white" />
              </div>
              Report Card Approval
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review, approve, and publish student report cards
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/admin/broadsheet')}
              className="h-8 text-xs gap-1.5 rounded-lg font-semibold"
            >
              <FileText className="h-3.5 w-3.5" />
              Broad Sheet
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={fetchReportCards}
              disabled={refreshing}
              className="h-8 text-xs gap-1.5 rounded-lg font-semibold"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ═══ Workflow Info ════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 border border-blue-200/60 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">
              Approval Workflow
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 font-black flex items-center justify-center text-[10px]">1</span>
              Pending Review
            </span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span className="flex items-center gap-1">
              <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[10px]">2</span>
              Approve or Reject
            </span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span className="flex items-center gap-1">
              <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-[10px]">3</span>
              Publish to Pupils
            </span>
          </div>
        </div>

        {/* ═══ Stats ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <StatCard label="Total Cards" value={stats.total} icon={Users} tone="slate" delay={0.05} />
          <StatCard label="Pending" value={stats.pending} icon={Clock} tone="amber" delay={0.08} subtitle="awaiting review" />
          <StatCard label="Approved" value={stats.approved} icon={ClipboardCheck} tone="blue" delay={0.11} subtitle="ready to publish" />
          <StatCard label="Published" value={stats.published} icon={CheckCircle2} tone="emerald" delay={0.14} subtitle="visible to pupils" />
          <StatCard label="Rejected" value={stats.rejected} icon={XCircle} tone="rose" delay={0.17} subtitle="sent back" />
        </div>

        {/* ═══ Filters & Actions ═══════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-3 sm:p-4 space-y-3">

          {/* Filter row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <div className="col-span-2 lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm bg-slate-50/50 border-slate-200 focus-visible:bg-white rounded-lg font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-slate-100 flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-slate-400" />
                </button>
              )}
            </div>

            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg font-semibold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg font-semibold">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {availableClasses.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTerm} onValueChange={setFilterTerm}>
              <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg font-semibold">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                {TERM_OPTIONS.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="h-9 text-xs bg-slate-50/50 border-slate-200 rounded-lg font-semibold">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {availableYears.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selection bar */}
          {selectedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100"
            >
              <div className="flex items-center gap-2 mr-auto">
                <span className="text-xs font-black text-slate-700">
                  {selectedCards.length} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>

              {canBulkApprove && (
                <Button
                  size="sm"
                  onClick={() => setBulkAction('approve')}
                  className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xs shadow-sm shadow-blue-500/20"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  Approve {selectedCards.length}
                </Button>
              )}

              {canBulkPublish && (
                <Button
                  size="sm"
                  onClick={() => setBulkAction('publish')}
                  className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-bold text-xs shadow-sm shadow-emerald-500/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  Publish {selectedCards.length}
                </Button>
              )}
            </motion.div>
          )}

          {/* Active filters */}
          {(filterStatus !== 'all' || filterClass !== 'all' || filterTerm !== 'all' || filterYear !== 'all' || searchQuery) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-semibold">
                <span className="font-black text-slate-800">{filteredCards.length}</span> of {reportCards.length}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterStatus('all')
                  setFilterClass('all')
                  setFilterTerm('all')
                  setFilterYear('all')
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ═══ Report Cards List ═══════════════════════════════════ */}
        {filteredCards.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">No report cards found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No report cards match your search.'
                : filterStatus !== 'all'
                  ? `No ${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label.toLowerCase() || filterStatus} report cards.`
                  : 'Generate report cards from the Broad Sheet page first.'}
            </p>
            {reportCards.length === 0 && (
              <Button
                onClick={() => router.push('/admin/broadsheet')}
                className="mt-4 h-9 text-xs font-bold gap-1.5"
              >
                <FileText className="h-4 w-4" />
                Go to Broad Sheet
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-2 px-1">
              <button
                onClick={() => filteredCards.length === selectedCards.length ? clearSelection() : selectAll()}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <div className={cn(
                  'h-3.5 w-3.5 rounded border-2 flex items-center justify-center transition-colors',
                  selectedCards.length === filteredCards.length && filteredCards.length > 0
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-slate-300 hover:border-slate-400'
                )}>
                  {selectedCards.length === filteredCards.length && filteredCards.length > 0 && (
                    <Check className="h-2.5 w-2.5 text-white" />
                  )}
                </div>
                {selectedCards.length === filteredCards.length && filteredCards.length > 0
                  ? 'Deselect all'
                  : `Select all ${filteredCards.length}`}
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {filteredCards.map((card, i) => (
                <div key={card.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSelect(card.id)}
                    className="shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: selectedIds.has(card.id) ? '#2563eb' : '#cbd5e1',
                      backgroundColor: selectedIds.has(card.id) ? '#2563eb' : 'transparent',
                    }}
                  >
                    {selectedIds.has(card.id) && <Check className="h-2.5 w-2.5 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <ReportCardRow
                      card={card}
                      index={i}
                      onApprove={handleApprove}
                      onReject={setRejectingCard}
                      onPublish={handlePublish}
                      onView={handleViewCard}
                      onDelete={handleDelete}
                      processingIds={processingIds}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="pt-4 pb-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/50">
          <p className="font-semibold">Vincollins Schools · Report Card Approval</p>
          <p>&copy; {new Date().getFullYear()} All rights reserved</p>
        </footer>
      </div>

      {/* ═══ View Details Dialog ═════════════════════════════════ */}
      <Dialog open={!!viewingCard} onOpenChange={(open) => !open && setViewingCard(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          {viewingCard && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-2">
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg bg-gradient-to-br',
                    getAvatarGradient(viewingCard.student_name)
                  )}>
                    {getInitials(viewingCard.student_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg font-black text-slate-900 truncate">
                      {viewingCard.student_name || 'Student'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs mt-0.5">
                      {viewingCard.student_admission_number || 'N/A'} · {viewingCard.class}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-3">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Term</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{viewingCard.term}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Session</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{viewingCard.academic_year}</p>
                  </div>
                </div>

                {/* Status timeline */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Timeline
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <FileText className="h-2.5 w-2.5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">Generated</p>
                        <p className="text-[10px] text-slate-500">
                          {formatDate(viewingCard.generated_at)}
                        </p>
                      </div>
                    </div>

                    {viewingCard.approved_at && (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <ClipboardCheck className="h-2.5 w-2.5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800">Approved</p>
                          <p className="text-[10px] text-slate-500">
                            {formatDate(viewingCard.approved_at)}
                          </p>
                        </div>
                      </div>
                    )}

                    {viewingCard.published_at && (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800">Published</p>
                          <p className="text-[10px] text-slate-500">
                            {formatDate(viewingCard.published_at)} · Now visible to pupil
                          </p>
                        </div>
                      </div>
                    )}

                    {viewingCard.rejected_at && (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                          <XCircle className="h-2.5 w-2.5 text-rose-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-800">Rejected</p>
                          <p className="text-[10px] text-slate-500">
                            {formatDate(viewingCard.rejected_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection reason */}
                {viewingCard.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MessageSquare className="h-3 w-3 text-rose-600" />
                      <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">
                        Rejection Reason
                      </p>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      {viewingCard.rejection_reason}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                {viewingCard.status === 'generated' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRejectingCard(viewingCard)
                        setViewingCard(null)
                      }}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        handleApprove(viewingCard)
                        setViewingCard(null)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
                    >
                      <ClipboardCheck className="h-4 w-4 mr-1.5" />
                      Approve
                    </Button>
                  </>
                )}
                {viewingCard.status === 'approved' && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handlePublish(viewingCard)
                      setViewingCard(null)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="h-4 w-4 mr-1.5" />
                    Publish to Pupil
                  </Button>
                )}
                <Button variant="outline" onClick={() => setViewingCard(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Reject Dialog ════════════════════════════════════════ */}
      <Dialog open={!!rejectingCard} onOpenChange={(open) => { if (!open) { setRejectingCard(null); setRejectionReason('') } }}>
        <DialogContent className="max-w-md rounded-2xl">
          {rejectingCard && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-1">
                  <div className="h-11 w-11 rounded-xl bg-rose-100 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-black text-slate-900">
                      Reject Report Card
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs mt-0.5">
                      {rejectingCard.student_name}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Reason for rejection
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Missing subject scores, incorrect data, needs teacher review..."
                  className="min-h-[100px] text-sm border-slate-200 focus-visible:ring-rose-500/20 resize-none rounded-lg"
                  autoFocus
                />
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => { setRejectingCard(null); setRejectionReason('') }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectSubmit}
                  disabled={!rejectionReason.trim()}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  Confirm Reject
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Bulk Action Dialog ═══════════════════════════════════ */}
      <Dialog open={!!bulkAction} onOpenChange={(open) => !open && setBulkAction(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          {bulkAction && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3 mb-1">
                  <div className={cn(
                    'h-11 w-11 rounded-xl flex items-center justify-center',
                    bulkAction === 'approve' ? 'bg-blue-100' : 'bg-emerald-100'
                  )}>
                    {bulkAction === 'approve' ? (
                      <ClipboardCheck className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Send className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-black text-slate-900">
                      {bulkAction === 'approve' ? 'Approve' : 'Publish'} {selectedCards.length} Report Cards
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 text-xs mt-0.5">
                      {bulkAction === 'approve'
                        ? 'These will be ready to publish.'
                        : 'Pupils will be able to view and download their reports.'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="max-h-[240px] overflow-y-auto space-y-1 py-2">
                {selectedCards.slice(0, 10).map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs">
                    <div className={cn(
                      'shrink-0 h-6 w-6 rounded-md flex items-center justify-center text-white font-black text-[9px] bg-gradient-to-br',
                      getAvatarGradient(c.student_name)
                    )}>
                      {getInitials(c.student_name)}
                    </div>
                    <span className="font-bold text-slate-700 truncate">{c.student_name}</span>
                    <span className="text-slate-400 shrink-0 ml-auto">{c.class}</span>
                  </div>
                ))}
                {selectedCards.length > 10 && (
                  <p className="text-[10px] text-slate-400 text-center py-1 font-semibold">
                    +{selectedCards.length - 10} more
                  </p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setBulkAction(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAction}
                  className={cn(
                    'text-white font-bold gap-1.5 shadow-lg',
                    bulkAction === 'approve'
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  )}
                >
                  {bulkAction === 'approve' ? (
                    <>
                      <ClipboardCheck className="h-4 w-4" />
                      Approve All
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Publish All
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}