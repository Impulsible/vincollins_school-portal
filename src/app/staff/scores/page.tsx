/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase/client'
import PrimaryScoresTab from '@/components/staff/PrimaryScoresTab'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ScoresPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const [staffProfile, setStaffProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // ─── Fetch Staff Profile ──────────────────────────────────────────────
  useEffect(() => {
    const fetchStaffProfile = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        // First try to get from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          // Fallback: use user data
          setStaffProfile({
            id: user.id,
            full_name: user.full_name || user.name || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            display_name: user.full_name || user.name || '',
            role: user.role || 'staff',
          })
        } else if (profileData) {
          setStaffProfile({
            id: profileData.id,
            full_name: profileData.full_name || '',
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            display_name: profileData.full_name || '',
            role: profileData.role || 'staff',
            department: profileData.department || '',
            title: profileData.title || '',
            photo_url: profileData.photo_url || null,
            avatar_url: profileData.avatar_url || null,
          })
        } else {
          // Fallback: use user data
          setStaffProfile({
            id: user.id,
            full_name: user.full_name || user.name || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            display_name: user.full_name || user.name || '',
            role: user.role || 'staff',
          })
        }
      } catch (error) {
        console.error('Error in fetchStaffProfile:', error)
        // Fallback: use user data
        setStaffProfile({
          id: user.id,
          full_name: user.full_name || user.name || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          display_name: user.full_name || user.name || '',
          role: user.role || 'staff',
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user?.id) {
      fetchStaffProfile()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [user, authLoading])

  // ─── Handle Scores Saved ──────────────────────────────────────────────
  const handleScoresSaved = () => {
    console.log('✅ Scores saved, refreshing...')
    setRefreshKey(prev => prev + 1)
    toast.success('Scores updated successfully')
  }

  // ─── Loading State ──────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // ─── No User ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">Please log in to access this page.</p>
            <Button 
              onClick={() => router.push('/login')}
              className="mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── No Staff Profile ──────────────────────────────────────────────────
  if (!staffProfile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">Could not load staff profile.</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─── Debug Log ──────────────────────────────────────────────────────────
  console.log('🔍 ScoresPage - Staff Profile:', {
    id: staffProfile.id,
    full_name: staffProfile.full_name,
    hasId: !!staffProfile.id
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/staff')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Score Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter and manage pupil scores for primary school
            </p>
          </div>
          {staffProfile && (
            <div className="ml-auto text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              👤 {staffProfile.full_name || staffProfile.display_name || 'Staff'}
            </div>
          )}
        </div>

        {/* ─── Primary Scores Tab ────────────────────────────────────────── */}
        <PrimaryScoresTab 
          key={refreshKey}
          staffProfile={staffProfile}
          onScoresSaved={handleScoresSaved}
        />

      </div>
    </div>
  )
}