/* eslint-disable react-hooks/preserve-manual-memoization */
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Bell, CheckCircle2, Trash2, Loader2,
  Megaphone, AlertCircle, UserPlus,
  FileText, BookOpen, Award, Users,
  Calendar, Clock, ChevronRight,
  Filter, Search, RefreshCw,
  Check, X, Mail, Settings,
  GraduationCap, School, Sparkles
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'announcement' | 'message' | 'alert' | 'success' | 'info' | 'warning'
  link?: string
  read: boolean
  created_at: string
  sender_id?: string
  sender_name?: string
  metadata?: Record<string, any>
}

interface NotificationStats {
  total: number
  unread: number
  read: number
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Bell className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading notifications...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your alerts</p>
      </div>
    </div>
  )
}

// ── Notification Icon Helper ──────────────────────────────────────────────────

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const icons = {
    announcement: <Megaphone className="h-5 w-5 text-blue-600" />,
    message: <Mail className="h-5 w-5 text-orange-600" />,
    alert: <AlertCircle className="h-5 w-5 text-red-600" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    info: <Bell className="h-5 w-5 text-slate-600" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
  }
  return icons[type] || icons.info
}

// ── Notification Card ─────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(notification.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className={cn(
        "group relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md",
        notification.read
          ? "bg-white border-slate-200 hover:border-slate-300"
          : "bg-blue-50/80 border-blue-200 hover:border-blue-300"
      )}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            notification.read ? "bg-slate-100" : "bg-blue-100"
          )}>
            <NotificationIcon type={notification.type} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={cn(
                "text-sm font-semibold leading-tight",
                notification.read ? "text-slate-800" : "text-blue-800"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>

            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            {notification.sender_name && (
              <>
                <span className="text-slate-300">·</span>
                <span>From: {notification.sender_name}</span>
              </>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
              {notification.type}
            </Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PupilNotificationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0,
  })

  // ─── Fetch Notifications ──────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return

    setRefreshing(true)
    try {
      // Fetch notifications for the current user only
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotifications(data || [])

      // Calculate stats
      const total = data?.length || 0
      const unread = data?.filter((n: any) => !n.read).length || 0
      const read = data?.filter((n: any) => n.read).length || 0

      setStats({ total, unread, read })
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setRefreshing(false)
    }
  }, [user?.id])

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchNotifications()
      setLoading(false)
    }
  }, [authLoading, user?.id, fetchNotifications])

  // ─── Mark as Read ──────────────────────────────────────────────────────────

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1,
      }))
    } catch (error) {
      console.error('Error marking read:', error)
      toast.error('Failed to mark notification as read')
    }
  }, [user?.id])

  // ─── Mark All as Read ──────────────────────────────────────────────────────

  const handleMarkAllRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) {
      toast.info('All notifications are already read')
      return
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds)
        .eq('user_id', user?.id)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total,
      }))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all read:', error)
      toast.error('Failed to mark all as read')
    }
  }, [notifications, user?.id])

  // ─── Delete Notification ───────────────────────────────────────────────────

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error

      const deleted = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        unread: deleted && !deleted.read ? Math.max(0, prev.unread - 1) : prev.unread,
        read: deleted && deleted.read ? Math.max(0, prev.read - 1) : prev.read,
      }))
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }, [notifications, user?.id])

  // ─── Filter Notifications ─────────────────────────────────────────────────

  const filteredNotifications = notifications.filter((notification) => {
    // Status filter
    if (filterStatus === 'unread' && notification.read) return false
    if (filterStatus === 'read' && !notification.read) return false

    // Type filter
    if (filterType !== 'all' && notification.type !== filterType) return false

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        notification.title.toLowerCase().includes(q) ||
        notification.message.toLowerCase().includes(q) ||
        notification.sender_name?.toLowerCase().includes(q)
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

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">My Notifications</h1>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <span>Your personal notifications</span>
                  <span className="text-slate-300">·</span>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {stats.total} total
                  </Badge>
                  {stats.unread > 0 && (
                    <Badge className="bg-red-100 text-red-700 text-xs animate-pulse">
                      {stats.unread} unread
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {stats.unread > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="h-9 gap-1.5 text-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                disabled={refreshing}
                className="h-9 w-9 p-0"
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              </Button>
            </div>
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
              placeholder="Search notifications..."
              className="pl-9 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 text-xs w-[140px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
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
                <Bell className="h-5 w-5 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Unread</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.unread}</p>
                </div>
                <AlertCircle className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Read</p>
                  <p className="text-2xl font-bold text-emerald-700">{stats.read}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-purple-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-medium">Types</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {[...new Set(notifications.map(n => n.type))].length}
                  </p>
                </div>
                <Filter className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Notifications List ───────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-600" />
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No notifications found</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No notifications match your search criteria.'
                    : filterStatus !== 'all'
                    ? `No ${filterStatus} notifications.`
                    : 'You have no notifications yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Notification Center • Geared Towards Excellence</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}