/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface User {
  id: string
  email: string
  full_name?: string | null
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  role?: string
  avatar_url?: string | null
  photo_url?: string | null
  class?: string | null
  class_arm?: string | null
  vin_id?: string | null
}

export interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isFocused: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// ─── Helper: Get First Name from Full Name ──────────────────────────────────
const extractFirstName = (fullName: string): string => {
  if (!fullName) return 'User'
  
  const parts = fullName.trim().split(/\s+/)
  
  if (parts.length === 1) return parts[0]
  
  const titlePrefixes = ['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms']
  if (titlePrefixes.includes(parts[0].toLowerCase())) {
    return parts[2] || parts[1] || parts[0]
  }
  
  // Common Nigerian surnames
  const commonSurnames = [
    'Adesope', 'Okafor', 'Okonkwo', 'Adebayo', 'Ogunleye', 
    'Eze', 'Nwosu', 'Adedeji', 'Oladipo', 'Adeyemi',
    'Balogun', 'Fashola', 'Oyedele', 'Akinlade', 'Ogunbiyi',
    'Adeola', 'Olatunji', 'Ogunyemi', 'Akinsanya', 'Olawale'
  ]
  
  // If first part is a common surname, return the second part
  if (commonSurnames.includes(parts[0]) && parts.length > 1) {
    return parts[1]
  }
  
  // For "FirstName LastName" format, return the first part
  return parts[0] || 'User'
}

// ─── Role Colors ──────────────────────────────────────────────────────────────
export const ROLE_COLORS = {
  admin: {
    primary: '#D97706',
    light: '#FBBF24',
    dark: '#B45309',
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#92400E',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    hover: 'hover:bg-amber-50',
    ring: 'ring-amber-500',
    emoji: '👑',
    label: 'Admin'
  },
  teacher: {
    primary: '#2563EB',
    light: '#60A5FA',
    dark: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1E40AF',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    hover: 'hover:bg-blue-50',
    ring: 'ring-blue-500',
    emoji: '👩‍🏫',
    label: 'Teacher'
  },
  staff: {
    primary: '#7C3AED',
    light: '#A78BFA',
    dark: '#5B21B6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    text: '#4C1D95',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    hover: 'hover:bg-purple-50',
    ring: 'ring-purple-500',
    emoji: '💼',
    label: 'Staff'
  },
  student: {
    primary: '#059669',
    light: '#34D399',
    dark: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    hover: 'hover:bg-emerald-50',
    ring: 'ring-emerald-500',
    emoji: '🎒',
    label: 'Pupil'
  }
}

export function getRoleColors(role?: string | null) {
  if (!role) return ROLE_COLORS.student
  const normalizedRole = role.toLowerCase()
  
  if (normalizedRole === 'admin') return ROLE_COLORS.admin
  if (normalizedRole === 'teacher') return ROLE_COLORS.teacher
  if (normalizedRole === 'staff') return ROLE_COLORS.staff
  if (normalizedRole === 'student' || normalizedRole === 'pupil') return ROLE_COLORS.student
  
  return ROLE_COLORS.student
}

export function getRoleEmoji(role?: string | null) {
  if (!role) return '🎒'
  const normalizedRole = role.toLowerCase()
  if (normalizedRole === 'admin') return '👑'
  if (normalizedRole === 'teacher' || normalizedRole === 'staff') return '👩‍🏫'
  if (normalizedRole === 'student' || normalizedRole === 'pupil') return '🎒'
  return '🎒'
}

export function getRoleLabel(role?: string | null) {
  if (!role) return 'Pupil'
  const normalizedRole = role.toLowerCase()
  if (normalizedRole === 'admin') return 'Admin'
  if (normalizedRole === 'teacher' || normalizedRole === 'staff') return 'Teacher/Staff'
  if (normalizedRole === 'student' || normalizedRole === 'pupil') return 'Pupil'
  return 'Pupil'
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFocused, setIsFocused] = useState(true)
  const fetchInProgressRef = useRef(false)
  const isMountedRef = useRef(true)
  const initialLoadDoneRef = useRef(false)

  // ─── Fetch User ──────────────────────────────────────────────────────────────
  const fetchUser = useCallback(async (forceRefresh = false) => {
    if (fetchInProgressRef.current && !forceRefresh) {
      console.log('⏳ [UserContext] Fetch already in progress, skipping')
      return
    }

    console.log('🔍 [UserContext] fetchUser called', { forceRefresh })
    fetchInProgressRef.current = true
    
    try {
      setLoading(true)
      
      // ✅ 1. Try to read from cache (if not force refreshing)
      let cachedUser: User | null = null
      if (!forceRefresh) {
        const cached = localStorage.getItem('auth_user')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (parsed && parsed.id) {
              console.log('📂 [UserContext] Cached user found:', parsed)
              cachedUser = parsed
              setUser(parsed)
              setLoading(false)
              fetchInProgressRef.current = false
              // ⚠️ We return early ONLY if we don't need to check for updates.
              // For now, we will proceed to Supabase to ensure the session is valid.
            }
          } catch {
            console.warn('⚠️ [UserContext] Invalid cache, ignoring')
            localStorage.removeItem('auth_user')
          }
        }
      }

      console.log('🔐 [UserContext] Getting session from Supabase...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ [UserContext] Session error:', sessionError)
        setUser(null)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_role')
        setLoading(false)
        fetchInProgressRef.current = false
        return
      }
      
      console.log('📋 [UserContext] Session data:', session ? 'Session found' : 'No session')
      
      if (session?.user) {
        console.log('👤 [UserContext] User found in session:', session.user.email)
        
        // ✅ Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, display_name, first_name, last_name, middle_name, email, photo_url, avatar_url, role, class, class_arm, vin_id, phone, address, guardian_name, guardian_phone, date_of_birth, gender, admission_number, admission_year')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('❌ [UserContext] Profile fetch error:', profileError)
        }

        console.log('📋 [UserContext] Profile data:', profile)

        let role = profile?.role || session.user.user_metadata?.role || 'student'
        console.log('📋 [UserContext] Raw role from DB:', role)
        
        if (role === 'staff') {
          role = 'teacher'
          console.log('🔄 [UserContext] Mapped staff to teacher')
        }

        const fullName = profile?.full_name || session.user.user_metadata?.full_name || 'User'
        console.log('📋 [UserContext] fullName:', fullName)
        
        let firstName = profile?.first_name || session.user.user_metadata?.first_name || ''
        console.log('📋 [UserContext] first_name from DB:', firstName)
        
        if (!firstName) {
          firstName = extractFirstName(fullName)
          console.log('📋 [UserContext] firstName extracted from fullName:', firstName)
        }
        
        if (!firstName) {
          firstName = 'User'
        }

        // ✅ CRITICAL FIX: Preserve photo/avatar if DB returns null but cache has it
        let photoUrl = profile?.photo_url || session.user.user_metadata?.photo_url
        let avatarUrl = profile?.avatar_url || session.user.user_metadata?.avatar_url

        // If Supabase returned null, but we have a cached user with a photo, KEEP the cached photo
        if (!photoUrl && cachedUser?.photo_url) {
          console.log('🖼️ [UserContext] DB returned null photo, keeping cached photo_url:', cachedUser.photo_url)
          photoUrl = cachedUser.photo_url
        }
        if (!avatarUrl && cachedUser?.avatar_url) {
          console.log('🖼️ [UserContext] DB returned null avatar, keeping cached avatar_url:', cachedUser.avatar_url)
          avatarUrl = cachedUser.avatar_url
        }

        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: fullName,
          first_name: firstName,
          middle_name: profile?.middle_name || null,
          last_name: profile?.last_name || null,
          role: role,
          avatar_url: avatarUrl,
          photo_url: photoUrl,
          class: profile?.class || null,
          class_arm: profile?.class_arm || null,
          vin_id: profile?.vin_id || null,
        }
        
        console.log('✅ [UserContext] User data set:', userData)
        console.log('✅ [UserContext] userData.first_name:', userData.first_name)
        console.log('✅ [UserContext] userData.photo_url:', userData.photo_url)
        
        setUser(userData)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        localStorage.setItem('auth_role', role)
        console.log('💾 [UserContext] User saved to localStorage')
      } else {
        console.log('🚫 [UserContext] No session found, clearing user')
        setUser(null)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_role')
      }
    } catch (error) {
      console.error('❌ [UserContext] Error fetching user:', error)
      setUser(null)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
      fetchInProgressRef.current = false
      initialLoadDoneRef.current = true
      console.log('🔄 [UserContext] Loading state set to false')
    }
  }, [])

  // ─── Initial Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('🚀 [UserContext] Initializing...')
    isMountedRef.current = true
    
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 [UserContext] Auth state changed:', event)
      
      if (event === 'SIGNED_OUT') {
        console.log('🚫 [UserContext] User signed out, clearing data...')
        setUser(null)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_role')
        setLoading(false)
        fetchInProgressRef.current = false
      }
    })

    return () => {
      console.log('🧹 [UserContext] Cleaning up subscription')
      isMountedRef.current = false
      subscription.unsubscribe()
    }
  }, [fetchUser])

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    console.log('🚪 [UserContext] logout called')
    try {
      setUser(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_role')
      localStorage.removeItem('user_profile')
      console.log('🧹 [UserContext] Local storage cleared')
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ [UserContext] Sign out error:', error)
        throw error
      }
      
      console.log('✅ [UserContext] Sign out successful')
      fetchInProgressRef.current = false
      initialLoadDoneRef.current = false
      setLoading(false)
    } catch (error) {
      console.error('❌ [UserContext] Error logging out:', error)
      setUser(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_role')
    }
  }, [])

  // ─── Refresh User ──────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    console.log('🔄 [UserContext] Manual refresh called')
    await fetchUser(true)
  }, [fetchUser])

  // ─── Set User ──────────────────────────────────────────────────────────────
  const setUserWithCache = useCallback((newUser: User | null) => {
    console.log('👤 [UserContext] setUser called:', newUser)
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('auth_user', JSON.stringify(newUser))
      if (newUser.role) {
        localStorage.setItem('auth_role', newUser.role)
      }
    } else {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_role')
    }
  }, [])

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        setUser: setUserWithCache,
        logout,
        refreshUser,
        isFocused
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextType {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}