// src/contexts/UserContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  full_name?: string | null
  first_name?: string | null
  role?: string
  avatar_url?: string | null
  photo_url?: string | null
}

export interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.full_name || session.user.user_metadata?.full_name,
            first_name: profile?.first_name || session.user.user_metadata?.first_name,
            role: profile?.role || session.user.user_metadata?.role || 'student',
            avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url,
            photo_url: profile?.photo_url || session.user.user_metadata?.photo_url,
          })
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: profile?.full_name || session.user.user_metadata?.full_name,
            first_name: profile?.first_name || session.user.user_metadata?.first_name,
            role: profile?.role || session.user.user_metadata?.role || 'student',
            avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url,
            photo_url: profile?.photo_url || session.user.user_metadata?.photo_url,
          })
        } catch {
          // Silently fail - user will be set from session metadata
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 'User',
            first_name: session.user.user_metadata?.first_name || 'User',
            role: session.user.user_metadata?.role || 'student',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            photo_url: session.user.user_metadata?.photo_url || null,
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, isAuthenticated: !!user, loading, setUser, logout }}>
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