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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Megaphone, Plus, Trash2, Edit3, Eye,
  Loader2, CheckCircle2, Clock, Users,
  Calendar, Search, RefreshCw, X,
  Bell, AlertCircle, FileText, Save,
  Send, Sparkles, Globe, School,
  GraduationCap, Briefcase, User,
  ChevronRight, Filter, ListChecks,
  Shield
} from 'lucide-react'
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

interface Announcement {
  id: string
  title: string
  content: string
  target_audience: 'all' | 'students' | 'teachers' | 'admins'
  is_published: boolean
  created_at: string
  published_at?: string
  created_by: string
  creator_name?: string
  metadata?: Record<string, any>
}

interface AnnouncementStats {
  total: number
  published: number
  drafts: number
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading announcements...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your announcements</p>
      </div>
    </div>
  )
}

// ── Announcement Card ─────────────────────────────────────────────────────────

function AnnouncementCard({
  announcement,
  onView,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  announcement: Announcement
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onTogglePublish: (id: string, publish: boolean) => void
}) {
  const isPublished = announcement.is_published

  return (
    <Card className={cn(
      "border-0 shadow-sm hover:shadow-md transition-all overflow-hidden",
      isPublished ? "border-l-4 border-emerald-500" : "border-l-4 border-amber-400"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {announcement.title}
              {isPublished && (
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              )}
              {!isPublished && (
                <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">
                  <Clock className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {announcement.target_audience === 'all' && 'Everyone'}
                {announcement.target_audience === 'students' && 'Students Only'}
                {announcement.target_audience === 'teachers' && 'Teachers Only'}
                {announcement.target_audience === 'admins' && 'Admins Only'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {format(new Date(announcement.created_at), 'MMM d, yyyy')}
              </span>
              {isPublished && announcement.published_at && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Published {format(new Date(announcement.published_at), 'MMM d, yyyy')}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px] bg-slate-100">
            {announcement.target_audience}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-slate-600 line-clamp-2">
          {announcement.content || 'No content provided.'}
        </p>
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-100 flex flex-wrap justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(announcement.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-blue-600"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(announcement.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-amber-600"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(announcement.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>

        {!isPublished ? (
          <Button
            size="sm"
            onClick={() => onTogglePublish(announcement.id, true)}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
          >
            <Send className="h-3.5 w-3.5" />
            Publish
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTogglePublish(announcement.id, false)}
            className="h-7 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Unpublish
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// ── Create/Edit Announcement Modal ────────────────────────────────────────────

function AnnouncementModal({
  open,
  onClose,
  announcement,
  onSave,
}: {
  open: boolean
  onClose: () => void
  announcement?: Announcement | null
  onSave: (data: any) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetAudience, setTargetAudience] = useState<'all' | 'students' | 'teachers' | 'admins'>('all')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && announcement) {
      setTitle(announcement.title || '')
      setContent(announcement.content || '')
      setTargetAudience(announcement.target_audience || 'all')
    } else if (open) {
      setTitle('')
      setContent('')
      setTargetAudience('all')
    }
  }, [open, announcement])

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!content.trim()) {
      toast.error('Please enter content')
      return
    }

    setSaving(true)
    try {
      await onSave({
        id: announcement?.id,
        title: title.trim(),
        content: content.trim(),
        target_audience: targetAudience,
        is_published: announcement?.is_published || false,
      })
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save announcement')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-600" />
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {announcement
              ? 'Update the details of this announcement.'
              : 'Create a new announcement to share with your school community.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., School Closure Notice"
              className="focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Target Audience <span className="text-rose-500">*</span>
            </label>
            <Select
              value={targetAudience}
              onValueChange={(v: any) => setTargetAudience(v)}
            >
              <SelectTrigger className="focus-visible:ring-blue-500">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Everyone (All Users)
                  </div>
                </SelectItem>
                <SelectItem value="students">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-emerald-500" />
                    Students Only
                  </div>
                </SelectItem>
                <SelectItem value="teachers">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                    Teachers Only
                  </div>
                </SelectItem>
                <SelectItem value="admins">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    Admins Only
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Content <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full announcement content here..."
              className="min-h-[150px] focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {announcement ? 'Update' : 'Create'} Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── View Announcement Modal ───────────────────────────────────────────────────

function ViewAnnouncementModal({
  open,
  onClose,
  announcement,
}: {
  open: boolean
  onClose: () => void
  announcement: Announcement | null
}) {
  if (!open || !announcement) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-600" />
            {announcement.title}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {announcement.target_audience === 'all' && 'Everyone'}
              {announcement.target_audience === 'students' && 'Students'}
              {announcement.target_audience === 'teachers' && 'Teachers'}
              {announcement.target_audience === 'admins' && 'Admins'}
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(announcement.created_at), 'MMM d, yyyy · h:mm a')}
            </span>
            {announcement.is_published && (
              <>
                <span className="text-slate-300">·</span>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-100 dark:border-slate-700">
            {announcement.content}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [filterAudience, setFilterAudience] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<AnnouncementStats>({
    total: 0,
    published: 0,
    drafts: 0,
  })

  // ─── Fetch Announcements ────────────────────────────────────────────────────

  const fetchAnnouncements = useCallback(async () => {
    if (!user?.id) return

    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch creator names
      const creatorIds = [...new Set((data || []).map((a: any) => a.created_by))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds)

      const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p.full_name
        return acc
      }, {})

      const announcementsWithNames = (data || []).map((a: any) => ({
        ...a,
        creator_name: profileMap[a.created_by] || 'Unknown',
      }))

      setAnnouncements(announcementsWithNames)

      const total = announcementsWithNames.length
      const published = announcementsWithNames.filter((a: any) => a.is_published).length
      const drafts = announcementsWithNames.filter((a: any) => !a.is_published).length

      setStats({ total, published, drafts })
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setRefreshing(false)
    }
  }, [user?.id])

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchAnnouncements()
      setLoading(false)
    }
  }, [authLoading, user?.id, fetchAnnouncements])

  // ─── Save Announcement ──────────────────────────────────────────────────────

  const handleSaveAnnouncement = useCallback(async (data: any) => {
    if (!user?.id) return

    try {
      if (data.id) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            title: data.title,
            content: data.content,
            target_audience: data.target_audience,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id)

        if (error) throw error
        toast.success('Announcement updated successfully')
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('announcements')
          .insert({
            title: data.title,
            content: data.content,
            target_audience: data.target_audience,
            created_by: user.id,
            is_published: false,
          })

        if (error) throw error
        toast.success('Announcement created successfully')
      }

      await fetchAnnouncements()
    } catch (error) {
      console.error('Error saving announcement:', error)
      throw error
    }
  }, [user?.id, fetchAnnouncements])

  // ─── Send Announcement Notifications ────────────────────────────────────────

  const sendAnnouncementNotifications = useCallback(async (announcement: Announcement) => {
    try {
      // Get all users who should receive this announcement
      let query = supabase.from('profiles').select('id')

      if (announcement.target_audience === 'students') {
        query = query.in('role', ['student', 'pupil'])
      } else if (announcement.target_audience === 'teachers') {
        query = query.in('role', ['teacher', 'staff'])
      } else if (announcement.target_audience === 'admins') {
        query = query.eq('role', 'admin')
      }
      // 'all' includes everyone

      const { data: users, error } = await query

      if (error) throw error

      if (!users || users.length === 0) {
        console.log('No users found for this audience')
        return
      }

      // Create notifications for all target users
      const notifications = users.map((user: any) => ({
        user_id: user.id,
        title: 'New Announcement',
        message: `${announcement.title} — ${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}`,
        type: 'announcement',
        link: '/admin/announcements',
        sender_name: 'Admin',
        metadata: {
          announcement_id: announcement.id,
        },
      }))

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notifError) {
        console.error('Error sending notifications:', notifError)
        toast.warning('Announcement published, but some notifications may not have been sent.')
      } else {
        toast.success(`Announcement sent to ${users.length} users`)
      }
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }, [])

  // ─── Toggle Publish ─────────────────────────────────────────────────────────

  const handleTogglePublish = useCallback(async (id: string, publish: boolean) => {
    try {
      const updates: any = {
        is_published: publish,
        updated_at: new Date().toISOString(),
      }

      if (publish) {
        updates.published_at = new Date().toISOString()
      } else {
        updates.published_at = null
      }

      const { error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      toast.success(publish ? 'Announcement published!' : 'Announcement unpublished.')
      await fetchAnnouncements()

      // If published, also send notifications to target audience
      if (publish) {
        const announcement = announcements.find(a => a.id === id)
        if (announcement) {
          await sendAnnouncementNotifications(announcement)
        }
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
      toast.error('Failed to update announcement')
    }
  }, [announcements, fetchAnnouncements, sendAnnouncementNotifications])

  // ─── Delete Announcement ────────────────────────────────────────────────────

  const handleDelete = useCallback(async () => {
    if (!deletingId) return

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', deletingId)

      if (error) throw error

      toast.success('Announcement deleted')
      await fetchAnnouncements()
      setDeleteDialogOpen(false)
      setDeletingId(null)
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Failed to delete announcement')
    }
  }, [deletingId, fetchAnnouncements])

  // ─── Filtered Announcements ────────────────────────────────────────────────

  const filteredAnnouncements = announcements.filter((announcement) => {
    // Status filter
    if (filterStatus === 'published' && !announcement.is_published) return false
    if (filterStatus === 'draft' && announcement.is_published) return false

    // Audience filter
    if (filterAudience !== 'all' && announcement.target_audience !== filterAudience) return false

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        announcement.title.toLowerCase().includes(q) ||
        announcement.content.toLowerCase().includes(q)
      )
    }
    return true
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

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
                <div className="text-sm text-slate-500 flex items-center gap-2"> {/* ✅ FIX: Changed <p> to <div> */}
                  <span>Create and manage school-wide announcements</span>
                  <span className="text-slate-300">·</span>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {stats.total} total
                  </Badge>
                  {stats.published > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                      {stats.published} published
                    </Badge>
                  )}
                  {stats.drafts > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 text-xs">
                      {stats.drafts} drafts
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingAnnouncement(null)
                setModalOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              New Announcement
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Filters Bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="pl-9 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="h-9 text-xs w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAudience} onValueChange={setFilterAudience}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="admins">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnnouncements}
              disabled={refreshing}
              className="h-9 w-9 p-0"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
                <Megaphone className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Published</p>
                  <p className="text-2xl font-bold text-emerald-700">{stats.published}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-medium">Drafts</p>
                  <p className="text-2xl font-bold text-amber-700">{stats.drafts}</p>
                </div>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-purple-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Audiences</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {[...new Set(announcements.map(a => a.target_audience))].length}
                  </p>
                </div>
                <Users className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Announcements Grid ───────────────────────────────────────────── */}
        {filteredAnnouncements.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Megaphone className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No announcements found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? 'No announcements match your search criteria.'
                  : filterStatus !== 'all'
                  ? `No ${filterStatus} announcements.`
                  : 'Create your first announcement to get started.'}
              </p>
              <Button
                onClick={() => {
                  setEditingAnnouncement(null)
                  setModalOpen(true)
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onView={(id) => {
                  const found = announcements.find(a => a.id === id)
                  setViewingAnnouncement(found || null)
                }}
                onEdit={(id) => {
                  const found = announcements.find(a => a.id === id)
                  setEditingAnnouncement(found || null)
                  setModalOpen(true)
                }}
                onDelete={(id) => {
                  setDeletingId(id)
                  setDeleteDialogOpen(true)
                }}
                onTogglePublish={handleTogglePublish}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {/* Create/Edit Modal */}
      <AnnouncementModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingAnnouncement(null)
        }}
        announcement={editingAnnouncement}
        onSave={handleSaveAnnouncement}
      />

      {/* View Modal */}
      <ViewAnnouncementModal
        open={!!viewingAnnouncement}
        onClose={() => setViewingAnnouncement(null)}
        announcement={viewingAnnouncement}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                Delete Announcement?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              This action cannot be undone. The announcement will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9 rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white h-9 gap-1.5 rounded-lg shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
        <p>Vincollins Schools Admin • Announcements</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>
    </div>
  )
}