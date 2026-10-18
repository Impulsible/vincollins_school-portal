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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Megaphone, Search, RefreshCw, Calendar,
  Users, CheckCircle2, Clock, X,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"

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
  unread: number
  read: number
}

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50/50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Megaphone className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-bold text-slate-800 text-lg">Loading announcements...</p>
        <p className="text-sm text-slate-500 mt-1">Fetching the latest updates</p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'emerald' | 'amber'
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', border: 'border-amber-100' },
  }
  const c = colorMap[color]

  return (
    <div className={cn('rounded-2xl p-4 border shrink-0 w-[150px] sm:w-auto snap-start shadow-sm', c.bg, c.border)}>
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

function AnnouncementCard({
  announcement,
  onView,
}: {
  announcement: Announcement
  onView: (id: string) => void
}) {
  return (
    <div
      className="rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-blue-100 transition-all overflow-hidden cursor-pointer group"
      onClick={() => onView(announcement.id)}
    >
      <div className="border-l-4 border-blue-500 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors">
            {announcement.title}
          </h3>
          <Badge className="bg-emerald-100 text-emerald-700 text-[10px] shrink-0 border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {announcement.content || 'No content provided.'}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
            <Calendar className="h-3 w-3" />
            {format(new Date(announcement.created_at), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md capitalize">
            <Users className="h-3 w-3" />
            {announcement.target_audience === 'all' ? 'Everyone' : announcement.target_audience}
          </span>
        </div>
      </div>
    </div>
  )
}

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0 bg-gradient-to-b from-slate-50 to-white">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{announcement.title}</h2>
            <div className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-2 mt-2">
              <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                <Calendar className="h-3 w-3" />
                {format(new Date(announcement.created_at), 'MMM d · h:mm a')}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md capitalize">
                <Users className="h-3 w-3" />
                {announcement.target_audience === 'all' ? 'Everyone' : announcement.target_audience}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
            {announcement.content}
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto rounded-xl h-11">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function StaffAnnouncementsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null)
  const [filterAudience, setFilterAudience] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<AnnouncementStats>({ total: 0, unread: 0, read: 0 })

  const fetchAnnouncements = useCallback(async () => {
    if (!user?.id) return

    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

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

      const teacherAnnouncements = announcementsWithNames.filter((a: any) => 
        a.target_audience === 'all' || a.target_audience === 'teachers'
      )

      setAnnouncements(teacherAnnouncements)

      const total = teacherAnnouncements.length
      setStats({ total, unread: 0, read: total })

    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchAnnouncements()
      setLoading(false)
    }
  }, [authLoading, user?.id, fetchAnnouncements])

  const filteredAnnouncements = announcements.filter((announcement) => {
    if (filterAudience !== 'all' && announcement.target_audience !== filterAudience) return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        announcement.title.toLowerCase().includes(q) ||
        announcement.content.toLowerCase().includes(q)
      )
    }
    return true
  })

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-20">

      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">Announcements</h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-none truncate">
                  {stats.total} published updates
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnnouncements}
              disabled={refreshing}
              className="h-10 sm:h-9 rounded-xl border-slate-200 shadow-sm px-3 shrink-0"
            >
              <RefreshCw className={cn("h-4 w-4 sm:mr-1.5 text-slate-500", refreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Horizontal Scroll Stats */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 sm:hidden">Overview</h2>
          <div className={cn("flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:pb-0", hideScrollbar)}>
            <StatCard label="Total" value={stats.total} icon={Megaphone} color="blue" />
            <StatCard label="Marked Read" value={stats.read} icon={CheckCircle2} color="emerald" />
            <StatCard label="Unread" value={stats.unread} icon={Clock} color="amber" />
          </div>
        </div>

        {/* Sticky Search & Filters */}
        <div className="sticky top-[73px] z-20 bg-slate-50/90 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:static">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements..."
                className="pl-10 h-11 text-base sm:text-sm rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500"
              />
            </div>

            <Select value={filterAudience} onValueChange={setFilterAudience}>
              <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl bg-white border-slate-200 shadow-sm text-base sm:text-sm">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="admins">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
          <p>{filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Announcements Grid */}
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No announcements found</p>
            <p className="text-sm text-slate-400 mt-1 max-w-[280px] mx-auto">
              {searchQuery ? 'Try adjusting your search or filters.' : 'No announcements have been published yet.'}
            </p>
            {(searchQuery || filterAudience !== 'all') && (
              <Button 
                variant="link" 
                onClick={() => { setSearchQuery(''); setFilterAudience('all'); }}
                className="mt-2 text-blue-600"
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

        <div className="text-center text-xs text-slate-400 pt-8 border-t border-slate-200/60 mt-8">
          <p className="font-medium">Vincollins Schools Announcements</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>

      <ViewAnnouncementModal
        open={!!viewingAnnouncement}
        onClose={() => setViewingAnnouncement(null)}
        announcement={viewingAnnouncement}
      />
    </div>
  )
}