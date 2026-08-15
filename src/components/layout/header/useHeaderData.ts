/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// src/components/layout/header/useHeaderData.ts
'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { HeaderUser, SchoolSettings, Notification, UserRole } from './types'

// Default settings if fetch fails
const DEFAULT_SETTINGS: SchoolSettings = {
  school_name: 'Vincollins Schools',
  logo_path: '/images/logo.png',
  school_phone: '+234 907 082 9999',
  school_email: 'vincollinsschools@gmail.com',
  school_motto: 'Geared Towards Excellence',
  school_address: '7/9 Lawani Street, off Ishaga Road, Surulere, Lagos',
}

// ─── Helper: Get First Name from Full Name ──────────────────────────────────
const extractFirstName = (fullName: string): string => {
  if (!fullName) return 'User'
  
  const parts = fullName.trim().split(/\s+/)
  
  if (parts.length === 1) return parts[0]
  
  const titlePrefixes = ['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms']
  if (titlePrefixes.includes(parts[0].toLowerCase())) {
    return parts[2] || parts[1] || parts[0]
  }
  
  const commonSurnames = [
    'Adesope', 'Okafor', 'Okonkwo', 'Adebayo', 'Ogunleye', 
    'Eze', 'Nwosu', 'Adedeji', 'Oladipo', 'Adeyemi',
    'Balogun', 'Fashola', 'Oyedele', 'Akinlade', 'Ogunbiyi',
    'Adeola', 'Olatunji', 'Ogunyemi', 'Akinsanya', 'Olawale'
  ]
  
  if (commonSurnames.includes(parts[0]) && parts.length > 1) {
    return parts[1]
  }
  
  return parts[0] || 'User'
}

export function useHeaderData() {
  const { user: contextUser, loading: authLoading, refreshUser } = useUser()
  
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  
  const userRef = useRef<HeaderUser | null>(null)

  // ─── Build user object ──────────────────────────────────────────────────────
  const user: HeaderUser | null = useMemo(() => {
    console.log('🔍 [useHeaderData] contextUser received:', contextUser)
    
    if (contextUser) {
      const displayName = contextUser.full_name || 
                        contextUser.first_name || 
                        (contextUser as any).display_name || 
                        (contextUser as any).name ||
                        'User'
      
      console.log('🔍 [useHeaderData] displayName:', displayName)
      
      let firstName = contextUser.first_name || ''
      console.log('🔍 [useHeaderData] contextUser.first_name from DB:', contextUser.first_name)
      
      if (!firstName) {
        firstName = extractFirstName(displayName)
        console.log('🔍 [useHeaderData] firstName extracted from displayName:', firstName)
      }
      
      if (!firstName) {
        firstName = displayName
        console.log('🔍 [useHeaderData] firstName set to displayName:', firstName)
      }

      let role: UserRole = 'pupil'
      const contextRole = contextUser.role?.toLowerCase()
      if (contextRole === 'admin') role = 'admin'
      else if (contextRole === 'staff' || contextRole === 'teacher') role = 'teacher'
      else if (contextRole === 'pupil' || contextRole === 'student') role = 'pupil'

      // ✅ Get avatar URL from multiple possible sources
      const avatarUrl = contextUser.photo_url || 
                        contextUser.avatar_url || 
                        (contextUser as any).avatar || 
                        undefined
      
      console.log('🔍 [useHeaderData] avatarUrl:', avatarUrl)
      console.log('🔍 [useHeaderData] contextUser.photo_url:', contextUser.photo_url)
      console.log('🔍 [useHeaderData] contextUser.avatar_url:', contextUser.avatar_url)

      const headerUser: HeaderUser = {
        id: contextUser.id,
        name: displayName,
        firstName: firstName,
        email: contextUser.email || '',
        role,
        avatar: avatarUrl,
        photo_url: avatarUrl, // ✅ Add photo_url as an alias
        isAuthenticated: true
      }
      
      console.log('✅ [useHeaderData] Built headerUser:', headerUser)
      console.log('✅ [useHeaderData] headerUser.firstName:', headerUser.firstName)
      console.log('✅ [useHeaderData] headerUser.avatar:', headerUser.avatar)
      console.log('✅ [useHeaderData] headerUser.photo_url:', headerUser.photo_url)
      
      return headerUser
    }
    console.log('🔍 [useHeaderData] No contextUser, returning null')
    return null
  }, [contextUser])

  // Update ref when user changes
  useEffect(() => {
    userRef.current = user
  }, [user])

  // ─── Listen for user context changes ──────────────────────────────────────
  useEffect(() => {
    // When contextUser changes, update the ref
    userRef.current = user
  }, [user])

  // Mark as mounted
  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // ─── FETCH SCHOOL SETTINGS ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      if (settingsLoaded) return
      
      try {
        const cached = localStorage.getItem('school_settings')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            setSchoolSettings(parsed as SchoolSettings)
            setSettingsLoaded(true)
            return
          } catch {
            // Invalid cache, continue to fetch
          }
        }

        const { data, error } = await supabase
          .from('school_settings')
          .select('school_name, logo_path, school_phone, school_email, school_motto, school_address, current_term, current_session')
          .maybeSingle()
        
        if (error) {
          console.warn('[useHeaderData] Error fetching school settings:', error.message)
          setSchoolSettings(DEFAULT_SETTINGS)
          localStorage.setItem('school_settings', JSON.stringify(DEFAULT_SETTINGS))
          setSettingsLoaded(true)
          return
        }
        
        if (data) {
          const settings: SchoolSettings = {
            school_name: data.school_name || DEFAULT_SETTINGS.school_name,
            logo_path: data.logo_path || DEFAULT_SETTINGS.logo_path,
            school_phone: data.school_phone || DEFAULT_SETTINGS.school_phone,
            school_email: data.school_email || DEFAULT_SETTINGS.school_email,
            school_motto: data.school_motto || DEFAULT_SETTINGS.school_motto,
            school_address: data.school_address || DEFAULT_SETTINGS.school_address,
          }
          setSchoolSettings(settings)
          localStorage.setItem('school_settings', JSON.stringify(settings))
        } else {
          setSchoolSettings(DEFAULT_SETTINGS)
          localStorage.setItem('school_settings', JSON.stringify(DEFAULT_SETTINGS))
        }
        setSettingsLoaded(true)
      } catch (err) {
        console.warn('[useHeaderData] Exception fetching school settings:', err)
        setSchoolSettings(DEFAULT_SETTINGS)
        setSettingsLoaded(true)
      }
    }

    fetchSettings()
  }, [settingsLoaded])

  // ─── Load notifications ──────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    const currentUser = userRef.current
    if (!currentUser?.id) return
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        console.log('ℹ️ Notifications table not found or error:', error.message)
        setNotifications([])
        setUnreadCount(0)
        return
      }
      
      if (data && data.length > 0) {
        const notificationsWithRead = data.map((n: any) => ({
          ...n,
          is_read: n.is_read !== undefined ? n.is_read : n.read || false
        }))
        
        setNotifications(notificationsWithRead as Notification[])
        setUnreadCount(notificationsWithRead.filter((n: any) => !n.is_read).length)
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.log('ℹ️ Notifications not available')
      setNotifications([])
      setUnreadCount(0)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return
    
    loadNotifications()
    
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [user?.id, loadNotifications])

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
    } catch {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
      } catch {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n))
        setUnreadCount(prev => prev + 1)
      }
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    const currentUser = userRef.current
    if (!currentUser?.id) return
    
    const previousNotifications = [...notifications]
    const previousUnreadCount = unreadCount
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false)
    } catch {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', currentUser.id)
          .eq('read', false)
      } catch {
        setNotifications(previousNotifications)
        setUnreadCount(previousUnreadCount)
      }
    }
  }, [notifications, unreadCount])

  const deleteNotification = useCallback(async (id: string) => {
    const deletedNotification = notifications.find(n => n.id === id)
    const wasUnread = deletedNotification && !deletedNotification.is_read
    
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    
    try {
      await supabase.from('notifications').delete().eq('id', id)
    } catch {
      if (deletedNotification) {
        setNotifications(prev => [...prev, deletedNotification])
        if (wasUnread) {
          setUnreadCount(prev => prev + 1)
        }
      }
    }
  }, [notifications])

  const isLoading = !mounted || authLoading

  return { 
    user,
    schoolSettings, 
    notifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading,
    isAuthenticated: !!user,
    refreshUser // ✅ Expose refreshUser to force update
  }
}