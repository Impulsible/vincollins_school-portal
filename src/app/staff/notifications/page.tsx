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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Bell, CheckCircle2, Trash2, Loader2,
  Megaphone, AlertCircle, Mail,
  Clock, Filter, Search, RefreshCw, Check,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"

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

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50/50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Bell className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-bold text-slate-800 text-lg">Loading notifications...</p>
        <p className="text-sm text-slate-500 mt-1">Fetching your alerts</p>
      </div>
    </div>
  )
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const config = {
    announcement: { icon: Megaphone, bg: 'bg-blue-100', color: 'text-blue-600' },
    message: { icon: Mail, bg: 'bg-orange-100', color: 'text-orange-600' },
    alert: { icon: AlertCircle, bg: 'bg-red-100', color: 'text-red-600' },
    success: { icon: CheckCircle2, bg: 'bg-emerald-100', color: 'text-emerald-600' },
    info: { icon: Bell, bg: 'bg-slate-100', color: 'text-slate-600' },
    warning: { icon: AlertCircle, bg: 'bg-amber-100', color: 'text-amber-600' },
  }
  const c = config[type] || config.info
  const Icon = c.icon
  return (
    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", c.bg)}>
      <Icon className={cn("h-5 w-5", c.color)} />
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
  value: number
  icon: React.ElementType
  color: 'blue' | 'emerald' | 'amber' | 'purple'
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', border: 'border-amber-100' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', border: 'border-purple-100' },
  }
  const c = colorMap[color]

  return (
    <div className={cn('rounded-2xl p-4 border shrink-0 w-[140px] sm:w-auto snap-start shadow-sm', c.bg, c.border)}>
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    try { await onDelete(notification.id) } finally { setIsDeleting(false) }
  }

  return (
    <div
      className={cn(
        "p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md group",
        notification.read
          ? "bg-white border-slate-100 hover:border-slate-200"
          : "bg-blue-50/60 border-blue-200 hover:border-blue-300"
      )}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <NotificationIcon type={notification.type} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className={cn(
                "text-sm sm:text-base font-bold leading-tight flex items-center gap-2",
                notification.read ? "text-slate-800" : "text-blue-900"
              )}>
                <span className="truncate">{notification.title}</span>
                {!notification.read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                )}
              </h4>
              <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {notification.message}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full shrink-0 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            <Badge className="bg-slate-100 text-slate-600 border-0 text-[10px] capitalize">
              {notification.type}
            </Badge>
            {notification.sender_name && (
              <span className="truncate">From: {notification.sender_name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffNotificationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, read: 0 })

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      setNotifications(data || [])
      const total = data?.length || 0
      const unread = data?.filter((n: any) => !n.read).length || 0
      const read = data?.filter((n: any) => n.read).length || 0
      setStats({ total, unread, read })
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally { setRefreshing(false) }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchNotifications()
      setLoading(false)
    }
  }, [authLoading, user?.id, fetchNotifications])

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user?.id)
      if (error) throw error
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1), read: prev.read + 1 }))
    } catch (error) { toast.error('Failed to mark as read') }
  }, [user?.id])

  const handleMarkAllRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) { toast.info('All already read'); return }
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).in('id', unreadIds).eq('user_id', user?.id)
      if (error) throw error
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setStats(prev => ({ ...prev, unread: 0, read: prev.total }))
      toast.success('All marked as read')
    } catch (error) { toast.error('Failed to mark all') }
  }, [notifications, user?.id])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id).eq('user_id', user?.id)
      if (error) throw error
      const deleted = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        unread: deleted && !deleted.read ? Math.max(0, prev.unread - 1) : prev.unread,
        read: deleted && deleted.read ? Math.max(0, prev.read - 1) : prev.read,
      }))
    } catch (error) { toast.error('Failed to delete') }
  }, [notifications, user?.id])

  const filteredNotifications = notifications.filter((n) => {
    if (filterStatus === 'unread' && n.read) return false
    if (filterStatus === 'read' && !n.read) return false
    if (filterType !== 'all' && n.type !== filterType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q) || n.sender_name?.toLowerCase().includes(q)
    }
    return true
  })

  if (authLoading || loading) return <LoadingScreen />
  if (!user) { router.replace('/portal'); return null }

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-20">

      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                {stats.unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {stats.unread > 9 ? '9+' : stats.unread}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">Notifications</h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-none truncate">
                  {stats.unread > 0 ? `${stats.unread} new · ${stats.total} total` : `${stats.total} total`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {stats.unread > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="h-10 sm:h-9 rounded-xl border-slate-200 shadow-sm px-3"
                >
                  <Check className="h-4 w-4 sm:mr-1.5 text-emerald-600" />
                  <span className="hidden sm:inline">Mark All</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNotifications}
                disabled={refreshing}
                className="h-10 sm:h-9 w-10 sm:w-auto rounded-xl border-slate-200 shadow-sm p-0 sm:px-3"
              >
                <RefreshCw className={cn("h-4 w-4 text-slate-500", refreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Horizontal Scroll Stats */}
        <div className={cn("flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:pb-0", hideScrollbar)}>
          <StatCard label="Total" value={stats.total} icon={Bell} color="blue" />
          <StatCard label="Unread" value={stats.unread} icon={AlertCircle} color="amber" />
          <StatCard label="Read" value={stats.read} icon={CheckCircle2} color="emerald" />
          <StatCard label="Types" value={[...new Set(notifications.map(n => n.type))].length} icon={Filter} color="purple" />
        </div>

        {/* Sticky Search & Filters */}
        <div className="sticky top-[73px] z-20 bg-slate-50/90 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:static">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="pl-10 h-11 text-base sm:text-sm rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 shrink-0">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[140px] h-11 rounded-xl bg-white border-slate-200 shadow-sm text-base sm:text-sm">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
                <SelectTrigger className="w-full sm:w-[130px] h-11 rounded-xl bg-white border-slate-200 shadow-sm text-base sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
          <p>{filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}</p>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No notifications found</p>
            <p className="text-sm text-slate-400 mt-1 max-w-[280px] mx-auto">
              {searchQuery ? 'Try adjusting your search.' : filterStatus !== 'all' ? `No ${filterStatus} notifications.` : "You're all caught up!"}
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

        <div className="text-center text-xs text-slate-400 pt-8 border-t border-slate-200/60 mt-8">
          <p className="font-medium">Vincollins Schools Notifications</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}