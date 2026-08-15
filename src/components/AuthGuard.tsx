// src/components/AuthGuard.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: ReactNode
  allowedRoles?: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        // ✅ Redirect to portal if not authenticated
        router.replace('/portal')
      } else if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role || 'student'
        // ✅ Normalize 'pupil' to 'student' for role checks
        const normalizedRole = userRole === 'pupil' ? 'student' : userRole
        if (!allowedRoles.includes(normalizedRole) && !allowedRoles.includes(userRole)) {
          // Redirect to the correct dashboard based on role
          const dashboardPath = userRole === 'admin' ? '/admin' 
            : userRole === 'teacher' ? '/staff' 
            : '/pupil'
          router.replace(dashboardPath)
        }
      }
    }
  }, [user, loading, isAuthenticated, router, allowedRoles])

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0A2472]" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role || 'student'
    // ✅ Normalize 'pupil' to 'student' for role checks
    const normalizedRole = userRole === 'pupil' ? 'student' : userRole
    if (!allowedRoles.includes(normalizedRole) && !allowedRoles.includes(userRole)) {
      // Redirect to the correct dashboard based on role
      const dashboardPath = userRole === 'admin' ? '/admin' 
        : userRole === 'teacher' ? '/staff' 
        : '/pupil'
      router.replace(dashboardPath)
      return null
    }
  }

  return <>{children}</>
}