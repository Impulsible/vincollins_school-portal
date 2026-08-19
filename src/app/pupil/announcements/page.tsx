/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Megaphone, Search, RefreshCw, Calendar,
  Users, CheckCircle2, Clock, Eye,
  Filter, Bell, AlertCircle, ChevronRight,
  FileText, Loader2, X, Globe,
  School, Briefcase, Shield,
  Tag, CalendarDays
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
        <p className="text-sm text-slate-400 mt-1">Fetching school updates</p>
      </div>
    </div>
  )
}

// ── Announcement Card ─────────────────────────────────────────────────────────

function AnnouncementCard({
  announcement,
  onView,
}: {
  announcement: Announcement
  onView: (id: string) => void
}) {
  // Pupils see announcements targeted to 'all' or 'students'
  const isRelevant = 
    announcement.target_audience === 'all' || 
    announcement.target_audience === 'students'

  if (!isRelevant) return null

  return (
    <Card 
      className={cn(
        "border-0 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer",
        "border-l-4 border-blue-400"
      )}
      onClick={() => onView(announcement.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {announcement.title}
              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Published
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {format(new Date(announcement.created_at), 'MMM d, yyyy')}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {announcement.target_audience === 'all' && 'Everyone'}
                {announcement.target_audience === 'students' && 'Students'}
                {announcement.target_audience === 'teachers' && 'Teachers'}
                {announcement.target_audience === 'admins' && 'Admins'}
              </span>
              {announcement.published_at && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {format(new Date(announcement.published_at), 'MMM d, yyyy')}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-slate-600 line-clamp-2">
          {announcement.content || 'No content provided.'}
        </p>
      </CardContent>
    </Card>
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{announcement.title}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(announcement.created_at), 'MMM d, yyyy · h:mm a')}
              <span className="text-slate-300">·</span>
              <Users className="h-4 w-4" />
              {announcement.target_audience === 'all' && 'Everyone'}
              {announcement.target_audience === 'students' && 'Students'}
              {announcement.target_audience === 'teachers' && 'Teachers'}
              {announcement.target_audience === 'admins' && 'Admins'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap border border-slate-100">
            {announcement.content}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PupilAnnouncementsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null)
  const [filterAudience, setFilterAudience] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
  })

  // ─── Fetch Announcements ────────────────────────────────────────────────────

  const fetchAnnouncements = useCallback(async () => {
    if (!user?.id) return

    setRefreshing(true)
    try {
      // Fetch published announcements
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
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
        creator_name: profileMap[a.created_by] || 'Admin',
      }))

      // Filter announcements relevant to pupils
      const pupilAnnouncements = announcementsWithNames.filter((a: any) => 
        a.target_audience === 'all' || a.target_audience === 'students'
      )

      setAnnouncements(pupilAnnouncements)
      setStats({ total: pupilAnnouncements.length })

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

  // ─── Filtered Announcements ────────────────────────────────────────────────

  const filteredAnnouncements = announcements.filter((announcement) => {
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

  if (!user) {
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
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
                <div className="text-sm text-slate-500 flex items-center gap-2"> {/* ✅ FIX: Changed <p> to <div> */}
                  <span>School announcements for pupils</span>
                  <span className="text-slate-300">·</span>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {stats.total} announcements
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnnouncements}
              disabled={refreshing}
              className="h-9 gap-1.5 text-xs"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
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
            <Select value={filterAudience} onValueChange={setFilterAudience}>
              <SelectTrigger className="h-9 text-xs w-[150px]">
                <SelectValue placeholder="Filter by audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="all_users">Everyone</SelectItem>
                <SelectItem value="students">Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  : 'No announcements have been published for pupils yet.'}
              </p>
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
              />
            ))}
          </div>
        )}
      </div>

      {/* ── View Announcement Modal ───────────────────────────────────────── */}
      <ViewAnnouncementModal
        open={!!viewingAnnouncement}
        onClose={() => setViewingAnnouncement(null)}
        announcement={viewingAnnouncement}
      />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
        <p>Vincollins Schools Pupil • Announcements</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>
    </div>
  )
}