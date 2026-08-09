/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Header, HeaderUser } from '@/components/layout/header'
import { PupilSidebar } from '@/components/pupil/PupilSidebar'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface PupilProfile {
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  class?: string
  class_arm?: string
  phone?: string
  address?: string
  guardian_name?: string
  guardian_phone?: string
  date_of_birth?: string
  gender?: string
  photo_url?: string
  admission_number?: string
  admission_year?: number
}

// ✅ Define the profile data type from Supabase
interface ProfileData {
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  class?: string
  class_arm?: string
  phone?: string
  address?: string
  guardian_name?: string
  guardian_phone?: string
  date_of_birth?: string
  gender?: string
  photo_url?: string
  avatar_url?: string
  admission_number?: string
  admission_year?: number
  role?: string
  first_name?: string
}

// Add a type guard to check if profile is PupilProfile
function isPupilProfile(profile: PupilProfile | any): profile is PupilProfile {
  return profile && 'vin_id' in profile && 'display_name' in profile
}

interface PupilLayoutProps {
  children: React.ReactNode
}

export default function PupilLayout({ children }: PupilLayoutProps) {
  const { user, loading: userLoading, logout } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<PupilProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // ─── Mount state ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true)
    return () => {
      // Cleanup if needed
    }
  }, [])

  // ─── Fetch full profile ─────────────────────────────────────────────────────
  useEffect(() => {
    // Early return if no user ID
    if (!user?.id) {
      setProfileLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setProfileLoading(true)
        // ✅ Add 'as any' to fix TypeScript, then cast the data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single() as any

        if (error) {
          console.error('Error fetching profile:', error)
          setProfileLoading(false)
          return
        }

        if (data) {
          const profileData = data as ProfileData
          setProfile({
            id: profileData.id,
            vin_id: profileData.vin_id,
            full_name: profileData.full_name || profileData.display_name || 'Pupil',
            display_name: profileData.display_name,
            email: profileData.email,
            class: profileData.class,
            class_arm: profileData.class_arm,
            phone: profileData.phone,
            address: profileData.address,
            guardian_name: profileData.guardian_name,
            guardian_phone: profileData.guardian_phone,
            date_of_birth: profileData.date_of_birth,
            gender: profileData.gender,
            photo_url: profileData.photo_url || profileData.avatar_url,
            admission_number: profileData.admission_number,
            admission_year: profileData.admission_year,
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

  // ─── Sync active tab with pathname ────────────────────────────────────────
  useEffect(() => {
    if (!pathname) return
    
    let newTab = 'overview'
    
    if (pathname === '/pupil' || pathname === '/pupil/') {
      newTab = 'overview'
    } else if (pathname?.startsWith('/pupil/assignments')) {
      newTab = 'assignments'
    } else if (pathname?.startsWith('/pupil/notes')) {
      newTab = 'notes'
    } else if (pathname?.startsWith('/pupil/report-cards')) {
      newTab = 'report-cards'
    } else if (pathname?.startsWith('/pupil/classmates')) {
      newTab = 'classmates'
    } else if (pathname?.startsWith('/pupil/profile')) {
      newTab = 'profile'
    } else if (pathname?.startsWith('/pupil/settings')) {
      newTab = 'settings'
    } else if (pathname?.startsWith('/pupil/notifications')) {
      newTab = 'notifications'
    } else if (pathname?.startsWith('/pupil/help')) {
      newTab = 'help'
    }
    
    setActiveTab(newTab)
  }, [pathname])

  // ─── Auth check ─────────────────────────────────────────────────────────────
  useEffect(() => {
    // Don't run until mounted and user loading is complete
    if (!mounted || userLoading) return
    
    if (!user) {
      router.replace('/portal')
    } else if (user.role !== 'student') {
      router.replace('/dashboard')
    }
  }, [user, userLoading, router, mounted])

  // ─── Build header user ─────────────────────────────────────────────────────
  const headerUser: HeaderUser | undefined = user ? {
    id: user.id,
    name: user.full_name || user.first_name || 'Pupil',
    firstName: user.first_name || user.full_name?.split(' ')[0] || 'Pupil',
    email: user.email || '',
    role: 'pupil' as const,
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
          <p className="text-sm text-slate-400 font-medium">Loading pupil dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'student') {
    return null
  }

  // Use profile if available, otherwise create a minimal profile from user
  const sidebarProfile: PupilProfile = profile || {
    id: user.id,
    vin_id: user.vin_id || '',
    full_name: user.full_name || user.first_name || 'Pupil',
    display_name: user.full_name || user.first_name || 'Pupil',
    email: user.email || '',
    class: user.class || '',
    class_arm: user.class_arm || '',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden w-full">
      <Header user={headerUser} onLogout={handleLogout} />
      
      <div className="flex w-full overflow-x-hidden">
        <PupilSidebar 
          profile={sidebarProfile}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
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