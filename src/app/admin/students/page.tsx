/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { AuthGuard } from '@/components/AuthGuard'
import { StudentManagement } from '@/components/admin/students/StudentManagement'
import { supabase } from '@/lib/supabase'
import { Student } from '@/components/admin/students/types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function StudentsPageContent() {
  const { user } = useUser()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchStudents()
    }
  }, [user, fetchStudents])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A2472]" />
          <p className="text-sm text-slate-400">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <StudentManagement 
      students={students} 
      onRefresh={fetchStudents}
      loading={loading}
    />
  )
}

export default function AdminStudentsPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <StudentsPageContent />
    </AuthGuard>
  )
}