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
        router.push('/portal')
      } else if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role || 'student'
        if (!allowedRoles.includes(userRole)) {
          router.push('/dashboard')
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
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F7F4]">
          <div className="max-w-md p-8 text-center bg-white rounded-2xl shadow-soft">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-display text-[#0A2472] mb-2">Access Denied</h2>
            <p className="text-slate-500">You don&apos;t have permission to view this page.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}