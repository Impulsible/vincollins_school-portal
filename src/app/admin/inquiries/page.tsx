/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Inbox, Mail, Phone, User, Calendar,
  CheckCircle2, XCircle, Clock, AlertCircle,
  Search, Filter, RefreshCw, Loader2,
  ChevronRight, ChevronDown, ChevronUp,
  Reply, Trash2, Eye, MessageSquare,
  Send, FileText, GraduationCap,
  Briefcase, Globe, Sparkles,
  Check, X, Download, Save,
  ArrowLeft, ArrowRight,
  Tag, ListChecks, Users
} from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type: 'contact' | 'admission'
  status: 'new' | 'read' | 'replied' | 'resolved'
  created_at: string
  replied_at?: string
  replied_by?: string
  reply?: string
  metadata?: Record<string, any>
}

interface InquiryStats {
  total: number
  new: number
  read: number
  replied: number
  resolved: number
  contact: number
  admission: number
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Inbox className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading inquiries...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching incoming messages</p>
      </div>
    </div>
  )
}

// ── Inquiry Card ──────────────────────────────────────────────────────────────

function InquiryCard({
  inquiry,
  onView,
  onStatusChange,
  onDelete,
}: {
  inquiry: Inquiry
  onView: (id: string) => void
  onStatusChange: (id: string, status: Inquiry['status']) => void
  onDelete: (id: string) => void
}) {
  const statusColor = 
    inquiry.status === 'new' ? 'bg-blue-100 text-blue-700' :
    inquiry.status === 'read' ? 'bg-amber-100 text-amber-700' :
    inquiry.status === 'replied' ? 'bg-purple-100 text-purple-700' :
    'bg-emerald-100 text-emerald-700'

  const statusIcon = 
    inquiry.status === 'new' ? <AlertCircle className="h-3.5 w-3.5" /> :
    inquiry.status === 'read' ? <Eye className="h-3.5 w-3.5" /> :
    inquiry.status === 'replied' ? <Reply className="h-3.5 w-3.5" /> :
    <CheckCircle2 className="h-3.5 w-3.5" />

  const typeIcon = 
    inquiry.type === 'admission' ? <GraduationCap className="h-3.5 w-3.5" /> :
    <MessageSquare className="h-3.5 w-3.5" />

  return (
    <div
      className={cn(
        "group relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
        inquiry.status === 'new' 
          ? "bg-blue-50/50 border-blue-200 hover:border-blue-300" 
          : "bg-white border-slate-200 hover:border-slate-300"
      )}
      onClick={() => onView(inquiry.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
              inquiry.type === 'admission' ? "bg-emerald-100" : "bg-blue-100"
            )}>
              {typeIcon}
            </div>
            <h4 className="text-sm font-semibold text-slate-800 truncate">
              {inquiry.name}
            </h4>
            {inquiry.status === 'new' && (
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-slate-600 line-clamp-2">
            {inquiry.subject}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {inquiry.email}
            </span>
            {inquiry.phone && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {inquiry.phone}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
          <Badge className={cn("text-[10px] gap-1", statusColor)}>
            {statusIcon}
            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {inquiry.type === 'admission' ? 'Admission' : 'Contact'}
          </Badge>
        </div>
      </div>

      {/* Delete button */}
      <button
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-50 transition-opacity"
        onClick={(e) => { 
          e.stopPropagation(); 
          e.preventDefault();
          if (confirm('Delete this inquiry?')) onDelete(inquiry.id) 
        }}
      >
        <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
      </button>
    </div>
  )
}

// ── View Inquiry Modal ────────────────────────────────────────────────────────

function ViewInquiryModal({
  open,
  onClose,
  inquiry,
  onStatusChange,
  onReply,
}: {
  open: boolean
  onClose: () => void
  inquiry: Inquiry | null
  onStatusChange: (id: string, status: Inquiry['status']) => void
  onReply: (id: string, reply: string) => Promise<void>
}) {
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  if (!open || !inquiry) return null

  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply')
      return
    }
    setSending(true)
    try {
      await onReply(inquiry.id, reply)
      toast.success('Reply sent successfully')
      setReply('')
      onClose()
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const statusColor = 
    inquiry.status === 'new' ? 'bg-blue-100 text-blue-700' :
    inquiry.status === 'read' ? 'bg-amber-100 text-amber-700' :
    inquiry.status === 'replied' ? 'bg-purple-100 text-purple-700' :
    'bg-emerald-100 text-emerald-700'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            {inquiry.subject}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {inquiry.name}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {inquiry.email}
            </span>
            {inquiry.phone && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {inquiry.phone}
                </span>
              </>
            )}
            <span className="text-slate-300">·</span>
            <Badge className={cn("text-[10px]", statusColor)}>
              {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {inquiry.type === 'admission' ? 'Admission' : 'Contact'}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap border border-slate-100">
            {inquiry.message}
          </div>

          {inquiry.reply && (
            <div className="bg-emerald-50 rounded-xl p-4 text-sm text-slate-600 border border-emerald-100">
              <div className="flex items-center gap-2 mb-1">
                <Reply className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-700">Your Reply</p>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{inquiry.reply}</p>
              <p className="text-xs text-slate-400 mt-1">
                Replied on {format(new Date(inquiry.replied_at || inquiry.created_at), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-4 border-t border-slate-100 gap-2 flex-col sm:flex-row">
          <div className="flex items-center gap-2 flex-1">
            <Select 
              value={inquiry.status} 
              onValueChange={(v: any) => onStatusChange(inquiry.id, v)}
            >
              <SelectTrigger className="h-8 text-xs w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!inquiry.reply && inquiry.status !== 'resolved' && (
            <div className="flex-1 space-y-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                className="min-h-[80px] text-sm focus-visible:ring-blue-500"
              />
              <Button
                onClick={handleReply}
                disabled={sending || !reply.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Reply
              </Button>
            </div>
          )}

          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminInquiriesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'contact' | 'admission'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'replied' | 'resolved'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const [stats, setStats] = useState<InquiryStats>({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    resolved: 0,
    contact: 0,
    admission: 0,
  })

  // ─── Fetch Inquiries ────────────────────────────────────────────────────────

  const fetchInquiries = useCallback(async () => {
    if (!user?.id) return

    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setInquiries(data || [])

      // Calculate stats
      const total = data?.length || 0
      const newCount = data?.filter((i: any) => i.status === 'new').length || 0
      const read = data?.filter((i: any) => i.status === 'read').length || 0
      const replied = data?.filter((i: any) => i.status === 'replied').length || 0
      const resolved = data?.filter((i: any) => i.status === 'resolved').length || 0
      const contact = data?.filter((i: any) => i.type === 'contact').length || 0
      const admission = data?.filter((i: any) => i.type === 'admission').length || 0

      setStats({ total, new: newCount, read, replied, resolved, contact, admission })
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Failed to load inquiries')
    } finally {
      setRefreshing(false)
    }
  }, [user?.id])

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchInquiries()
      setLoading(false)
    }
  }, [authLoading, user?.id, fetchInquiries])

  // ─── Update Status ──────────────────────────────────────────────────────────

  const handleStatusChange = useCallback(async (id: string, status: Inquiry['status']) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i))
      
      // Update stats
      setStats(prev => {
        const oldInquiry = inquiries.find(i => i.id === id)
        if (!oldInquiry) return prev

        const newStats = { ...prev }
        
        // Decrement old status
        if (oldInquiry.status === 'new') newStats.new--
        else if (oldInquiry.status === 'read') newStats.read--
        else if (oldInquiry.status === 'replied') newStats.replied--
        else if (oldInquiry.status === 'resolved') newStats.resolved--

        // Increment new status
        if (status === 'new') newStats.new++
        else if (status === 'read') newStats.read++
        else if (status === 'replied') newStats.replied++
        else if (status === 'resolved') newStats.resolved++

        return newStats
      })

      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }, [inquiries])

  // ─── Send Reply ─────────────────────────────────────────────────────────────

  const handleReply = useCallback(async (id: string, reply: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          reply,
          status: 'replied',
          replied_at: new Date().toISOString(),
          replied_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error

      setInquiries(prev => prev.map(i => i.id === id ? { ...i, reply, status: 'replied', replied_at: new Date().toISOString() } : i))
      
      // Update stats
      setStats(prev => {
        const oldInquiry = inquiries.find(i => i.id === id)
        if (!oldInquiry) return prev
        return {
          ...prev,
          new: oldInquiry.status === 'new' ? prev.new - 1 : prev.new,
          read: oldInquiry.status === 'read' ? prev.read - 1 : prev.read,
          replied: prev.replied + 1,
        }
      })

      toast.success('Reply sent successfully')
    } catch (error) {
      console.error('Error sending reply:', error)
      throw error
    }
  }, [user?.id, inquiries])

  // ─── Delete Inquiry ─────────────────────────────────────────────────────────

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', id)

      if (error) throw error

      const deleted = inquiries.find(i => i.id === id)
      setInquiries(prev => prev.filter(i => i.id !== id))
      
      // Update stats
      setStats(prev => {
        if (!deleted) return prev
        const newStats = { ...prev, total: prev.total - 1 }
        if (deleted.status === 'new') newStats.new--
        else if (deleted.status === 'read') newStats.read--
        else if (deleted.status === 'replied') newStats.replied--
        else if (deleted.status === 'resolved') newStats.resolved--
        if (deleted.type === 'contact') newStats.contact--
        else if (deleted.type === 'admission') newStats.admission--
        return newStats
      })

      toast.success('Inquiry deleted')
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      toast.error('Failed to delete inquiry')
    }
  }, [inquiries])

  // ─── Filtered Inquiries ────────────────────────────────────────────────────

  const filteredInquiries = inquiries.filter((inquiry) => {
    // Type filter
    if (filterType !== 'all' && inquiry.type !== filterType) return false

    // Status filter
    if (filterStatus !== 'all' && inquiry.status !== filterStatus) return false

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        inquiry.name.toLowerCase().includes(q) ||
        inquiry.email.toLowerCase().includes(q) ||
        inquiry.subject.toLowerCase().includes(q) ||
        inquiry.message.toLowerCase().includes(q)
      )
    }
    return true
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  if (!user || user.role !== 'admin') {
    router.replace('/portal')
    return null
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Inbox className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Inquiries</h1>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <span>Manage incoming inquiries</span>
                  <span className="text-slate-300">·</span>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {stats.total} total
                  </Badge>
                  {stats.new > 0 && (
                    <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">
                      {stats.new} new
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchInquiries}
              disabled={refreshing}
              className="h-9 w-9 p-0"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Stats Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <Inbox className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-red-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 font-medium">New</p>
                  <p className="text-2xl font-bold text-red-700">{stats.new}</p>
                </div>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-medium">Read</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.read}</p>
                </div>
                <Eye className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Resolved</p>
                  <p className="text-2xl font-bold text-emerald-700">{stats.resolved}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Filters Bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inquiries..."
              className="pl-9 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="admission">Admission</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="h-9 text-xs w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Inquiries List ──────────────────────────────────────────────── */}
        {filteredInquiries.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Inbox className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No inquiries found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No inquiries match your search criteria.'
                  : filterStatus !== 'all'
                  ? `No ${filterStatus} inquiries.`
                  : 'No inquiries have been submitted yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredInquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                onView={(id) => {
                  const found = inquiries.find(i => i.id === id)
                  setViewingInquiry(found || null)
                  setViewDialogOpen(true)
                }}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── View Inquiry Modal ───────────────────────────────────────────── */}
      <ViewInquiryModal
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false)
          setViewingInquiry(null)
        }}
        inquiry={viewingInquiry}
        onStatusChange={handleStatusChange}
        onReply={handleReply}
      />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
        <p>Vincollins Schools Admin • Inquiries</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>
    </div>
  )
}