/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/staff/page.tsx
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { AuthGuard } from '@/components/AuthGuard'
import StaffManagement from '@/components/admin/staff/StaffManagement'
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
      
      // Use the API endpoint instead of direct Supabase query
      const response = await fetch('/api/admin/users?role=staff')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch staff')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch staff')
      }
      
      // Map the data to Staff type
      const staffData = (data.data || []).map((item: any) => ({
        id: item.id,
        vin_id: item.vin_id || '',
        full_name: item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
        display_name: item.display_name || item.full_name || '',
        email: item.email || '',
        role: item.role || 'staff',
        department: item.department || '',
        phone: item.phone || '',
        address: item.address || '',
        is_active: item.is_active !== undefined ? item.is_active : true,
        created_at: item.created_at || new Date().toISOString(),
        date_joined: item.date_joined || item.created_at || '',
        gender: item.gender || '',
        photo_url: item.photo_url || '',
        password_changed: item.password_changed || false,
        title: item.title || '',
        first_name: item.first_name || '',
        last_name: item.last_name || '',
        middle_name: item.middle_name || '',
      }))
      
      console.log('📊 Fetched staff:', staffData.length, 'members')
      setStaff(staffData)
      
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load staff')
      setStaff([])
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

  return (
    <StaffManagement
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