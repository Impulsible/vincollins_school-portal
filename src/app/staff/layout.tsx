/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { StaffSidebar } from '@/components/staff/StaffSidebar'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { Header, HeaderUser } from '@/components/layout/header'

interface StaffProfile {
  id?: string
  full_name?: string
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  email?: string
  photo_url?: string | null
  avatar_url?: string | null
  department?: string
  role?: string
  school_id?: string | null
  class?: string | null
}

interface StaffLayoutProps {
  children: React.ReactNode
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { user, loading: userLoading, logout } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [termInfo, setTermInfo] = useState({
    termCode: '',
    sessionYear: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // ─── Fetch full profile ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) {
      setProfileLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setProfileLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          return
        }

        if (data) {
          setProfile({
            id: data.id,
            full_name: data.full_name || data.display_name || 'Staff',
            display_name: data.display_name,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            photo_url: data.photo_url || data.avatar_url,
            avatar_url: data.avatar_url,
            department: data.department,
            role: data.role,
            school_id: data.school_id,
            class: data.class,
          })
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  // ─── Fetch term info ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTermInfo = async () => {
      try {
        const { data: settings, error: settingsError } = await supabase
          .from('school_settings')
          .select('current_term, current_session')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (settingsError) {
          console.error('Error fetching term settings:', settingsError)
          return
        }

        if (settings) {
          setTermInfo({
            termCode: settings.current_term || '',
            sessionYear: settings.current_session || '',
          })
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    if (mounted) {
      fetchTermInfo()
    }
  }, [mounted])

  // ─── Sync active tab with pathname ────────────────────────────────────────
  useEffect(() => {
    if (!pathname) return
    
    if (pathname === '/staff' || pathname === '/staff/') {
      setActiveTab('overview')
    } else if (pathname?.startsWith('/staff/attendance')) {
      setActiveTab('attendance')
    } else if (pathname?.startsWith('/staff/announcements')) {
      setActiveTab('announcements')
    } else if (pathname?.startsWith('/staff/pupils')) {
      setActiveTab('pupils')
    } else if (pathname?.startsWith('/staff/assignments')) {
      setActiveTab('assignments')
    } else if (pathname?.startsWith('/staff/notes')) {
      setActiveTab('notes')
    } else if (pathname?.startsWith('/staff/scores')) {
      setActiveTab('scores')
    } else if (pathname?.startsWith('/staff/report-cards')) {
      setActiveTab('report-cards')
    } else if (pathname?.startsWith('/staff/notifications')) {
      setActiveTab('notifications')
    } else if (pathname?.startsWith('/staff/profile')) {
      setActiveTab('profile')
    } else if (pathname?.startsWith('/staff/settings')) {
      setActiveTab('settings')
    } else if (pathname?.startsWith('/staff/help')) {
      setActiveTab('help')
    }
  }, [pathname])

  // ─── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return
    
    if (!userLoading) {
      if (!user) {
        router.replace('/portal')
      } else if (user.role === 'student') {
        router.replace('/pupil')
      }
    }
  }, [user, userLoading, router, mounted])

  // ─── Build header user ─────────────────────────────────────────────────────
  const headerUser: HeaderUser | undefined = user ? {
    id: user.id,
    name: user.full_name || user.first_name || 'Staff',
    firstName: user.first_name || user.full_name?.split(' ')[0] || 'Staff',
    email: user.email || '',
    role: user.role === 'admin' ? 'admin' : 'teacher',
    avatar: user.avatar_url || user.photo_url || undefined,
    isAuthenticated: true
  } : undefined

  // ─── Handle logout ─────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout()
    router.replace('/portal')
  }

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (!mounted || userLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F4]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-400 font-medium">Loading staff dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role === 'student') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden w-full">
      {/* Header */}
      <Header user={headerUser} onLogout={handleLogout} />
      
      {/* Sidebar and Main Content */}
      <div className="flex w-full overflow-x-hidden">
        <StaffSidebar 
          profile={profile}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          termCode={termInfo.termCode}
          sessionYear={termInfo.sessionYear}
        />

        <div className={cn(
          "flex-1 transition-all duration-300 w-full overflow-x-hidden",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        )}>
          <main className="min-h-[calc(100vh-64px)] pt-[72px] lg:pt-24 pb-12 px-3 sm:px-4 lg:px-8 w-full overflow-x-hidden">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}