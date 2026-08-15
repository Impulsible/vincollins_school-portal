/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser, getRoleColors } from '@/contexts/UserContext'
import { AuthGuard } from '@/components/AuthGuard'
import { StudentManagement } from '@/components/admin/students/StudentManagement'
import type { Student } from '@/components/admin/students/StudentManagement'
import {
  GraduationCap,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Download,
  Upload,
  MoreVertical,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-slate-100', className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent -translate-x-full"
        animate={{ translateX: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
      />
    </div>
  )
}

// ─── Loading skeleton (compact, mobile-first) ────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-2.5 w-48" />
          </div>
        </div>
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>

      {/* Toolbar skeleton */}
      <Skeleton className="h-32 rounded-2xl" />

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
    >
      <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-red-100">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-sm font-bold text-red-800 mb-1">Couldn&apos;t load students</h3>
      <p className="text-xs text-red-600/80 max-w-sm mx-auto mb-4">{error}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="rounded-xl gap-2 bg-white border-red-200 text-red-700 hover:bg-red-100"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Try again
      </Button>
    </motion.div>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────
function StudentsPageContent() {
  const { user } = useUser()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accentColor = getRoleColors(user?.role).primary

  const fetchStudents = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/users?role=student')
      if (!response.ok) throw new Error(`API returned ${response.status}`)

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to fetch students')

      const mapped: Student[] = (result.data || []).map((item: any) => ({
        id: item.id,
        vin_id: item.vin_id || '',
        full_name: item.full_name || '',
        display_name: item.display_name || item.full_name || '',
        email: item.email || '',
        role: 'student',
        class: item.class || '',
        phone: item.phone || '',
        address: item.address || '',
        is_active: item.is_active !== false,
        created_at: item.created_at || new Date().toISOString(),
        admission_number: item.admission_number || '',
        admission_year: item.admission_year || '',
        guardian_name: item.guardian_name || '',
        guardian_phone: item.guardian_phone || '',
        guardian_email: item.guardian_email || '',
        date_of_birth: item.date_of_birth || '',
        gender: item.gender || '',
        photo_url: item.photo_url || '',
        first_name: item.first_name || '',
        last_name: item.last_name || '',
        middle_name: item.middle_name || '',
      }))

      setStudents(mapped)
      if (silent) toast.success(`${mapped.length} students loaded`)
    } catch (err: any) {
      const msg = err?.message || 'Failed to load students'
      setError(msg)
      if (silent) toast.error(msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchStudents()
  }, [user, fetchStudents])

  const handleExport = () => toast.info('Export coming soon')
  const handleImport = () => toast.info('Import coming soon')

  if (loading) return <LoadingSkeleton />

  return (
    <div className="space-y-4">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PAGE HEADER (only title + secondary actions — StudentManagement    */}
      {/*  provides its own "Add Student" button, refresh, and stats)         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              boxShadow: `0 6px 16px -6px ${accentColor}55`,
            }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight truncate">
                Students
              </h1>
              <span
                className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shrink-0"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                Admin
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Manage all pupils in the school
            </p>
          </div>
        </div>

        {/* Secondary menu (import/export only — refresh + add live inside StudentManagement) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 hover:border-slate-300 h-9 w-9 p-0 shrink-0"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl bg-white border-slate-200 shadow-xl">
            <DropdownMenuItem onClick={handleImport} className="cursor-pointer text-xs">
              <Upload className="w-3.5 h-3.5 mr-2" />
              Import CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport} className="cursor-pointer text-xs">
              <Download className="w-3.5 h-3.5 mr-2" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => fetchStudents(true)}
              className="cursor-pointer text-xs"
              disabled={refreshing}
            >
              <RefreshCw className={cn('w-3.5 h-3.5 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CONTENT — StudentManagement owns stats, toolbar, list, empty, modals*/}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {error ? (
          <ErrorState error={error} onRetry={() => fetchStudents()} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StudentManagement />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminStudentsPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <StudentsPageContent />
    </AuthGuard>
  )
}