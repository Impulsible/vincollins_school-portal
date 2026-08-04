// src/app/admin/staff/page.tsx
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { AuthGuard } from '@/components/AuthGuard'
import StaffManagement from '@/components/admin/staff/StaffManagement'
import { supabase } from '@/lib/supabase'
import { Staff } from '@/components/admin/staff/types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function StaffPageContent() {
  const { user } = useUser()
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['staff', 'teacher', 'admin', 'principal', 'vice-principal', 'accountant', 'librarian'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchStaff()
    }
  }, [user, fetchStaff])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A2472]" />
          <p className="text-sm text-slate-400">Loading staff...</p>
        </div>
      </div>
    )
  }

  const StaffManagementComponent = StaffManagement as React.ComponentType<{
    staff: Staff[]
    onRefresh: () => Promise<void>
    loading: boolean
  }>

  return (
    <StaffManagementComponent
      staff={staff}
      onRefresh={fetchStaff}
      loading={loading}
    />
  )
}

export default function AdminStaffPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <StaffPageContent />
    </AuthGuard>
  )
}