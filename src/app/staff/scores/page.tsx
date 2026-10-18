/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase/client'
import PrimaryScoresTab from '@/components/staff/PrimaryScoresTab'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Loader2, 
  ArrowLeft, 
  AlertCircle, 
  LogIn, 
  RefreshCw,
  GraduationCap,
  User,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ScoresPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const [staffProfile, setStaffProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchStaffProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError)
      }

      const profile = profileData || {}

      setStaffProfile({
        id: user.id,
        full_name: profile.full_name || user.full_name || 'Teacher',
        first_name: profile.first_name || user.first_name || '',
        last_name: profile.last_name || user.last_name || '',
        display_name: profile.full_name || user.full_name || 'Teacher',
        role: profile.role || user.role || 'staff',
        department: profile.department || '',
        title: profile.title || '',
        photo_url: profile.photo_url || null,
        avatar_url: profile.avatar_url || null,
      })
    } catch (err: any) {
      console.error('Error in fetchStaffProfile:', err)
      setError(err.message || 'Failed to load profile')
      
      // Fallback
      setStaffProfile({
        id: user.id,
        full_name: user.full_name || 'Teacher',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.full_name || 'Teacher',
        role: user.role || 'staff',
      })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchStaffProfile()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading, fetchStaffProfile])

  const handleScoresSaved = () => {
    setRefreshKey(prev => prev + 1)
  }

  // ─── Loading State ──────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20 flex items-center justify-center p-4">
        <div className="text-center space-y-5">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200/60 dark:border-slate-800">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Loading your profile
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Just a moment please...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ─── No User ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-slate-200/60 dark:border-slate-800 shadow-xl">
          <CardContent className="p-6 sm:p-8 text-center space-y-5">
            <div className="inline-flex p-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30">
              <ShieldAlert className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Authentication Required
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Please sign in to access the score management system.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md shadow-emerald-500/20 gap-2 h-11 rounded-xl font-medium"
            >
              <LogIn className="h-4 w-4" />
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── No Staff Profile ───────────────────────────────────────────────
  if (!staffProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-red-950/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm border-slate-200/60 dark:border-slate-800 shadow-xl">
          <CardContent className="p-6 sm:p-8 text-center space-y-5">
            <div className="inline-flex p-4 rounded-2xl bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Profile Not Loaded
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {error || 'We couldn\'t load your staff profile. Please try again.'}
              </p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={fetchStaffProfile}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-md gap-2 h-11 rounded-xl font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/staff')}
                className="w-full h-11 rounded-xl font-medium"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* ─── Sticky Mobile Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            
            {/* Left: Back + Title */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/staff')}
                className="h-9 w-9 sm:h-9 sm:w-auto sm:px-3 p-0 rounded-xl shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline text-xs font-medium">Back</span>
              </Button>

              <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700" />

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="hidden sm:flex p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/20 shrink-0">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
                    Score Management
                  </h1>
                  <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Primary School Assessment
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Staff Badge */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/40 dark:to-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 px-2 sm:px-3 py-1.5 rounded-full">
                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm shrink-0">
                  {(staffProfile.full_name || 'T').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[140px]">
                  {staffProfile.full_name || 'Teacher'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ──────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PrimaryScoresTab 
          key={refreshKey}
          staffProfile={staffProfile}
          onScoresSaved={handleScoresSaved}
        />

        {/* Footer */}
        <footer className="text-center pt-6 sm:pt-8 mt-8 sm:mt-10 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <GraduationCap className="h-3 w-3" />
              <p className="text-[11px] font-semibold">Vincollins Schools</p>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              &copy; {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}