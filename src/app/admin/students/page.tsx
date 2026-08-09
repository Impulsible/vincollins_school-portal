/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useUser, getRoleColors } from '@/contexts/UserContext'
import { AuthGuard } from '@/components/AuthGuard'
import { StudentManagement } from '@/components/admin/students/StudentManagement'
import type { Student } from '@/components/admin/students/StudentManagement'
import { supabase } from '@/lib/supabase/client'
import {
  GraduationCap,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  Sparkles,
  UserPlus,
  Download,
  Upload,
  MoreVertical,
  Copy,
  Check,
  Mail,
  Key,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ─── Skeleton shimmer block ───────────────────────────────────────────────────
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

// ─── Loading state ────────────────────────────────────────────────────────────
function StudentsLoadingState({ accentColor }: { accentColor: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-9 rounded-xl" />
          <Skeleton className="w-32 h-9 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
            className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="w-10 h-10 rounded-2xl" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-2 w-28" />
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-56" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-full shadow-xl border border-slate-200/80 px-4 py-2.5">
          <div className="relative w-4 h-4 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent"
              style={{ borderTopColor: accentColor }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-600">Loading students…</span>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function StudentsEmptyState({
  onRefresh,
  onAdd,
  accentColor,
}: {
  onRefresh: () => void
  onAdd: () => void
  accentColor: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <GraduationCap className="w-8 h-8" style={{ color: accentColor }} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">No students yet</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
        Get started by enrolling your first student. You can also import a CSV or refresh the list.
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Button
          onClick={onAdd}
          className="rounded-xl gap-2 text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
            boxShadow: `0 8px 20px -6px ${accentColor}55`,
          }}
        >
          <UserPlus className="w-4 h-4" />
          Enrol Student
        </Button>
        <Button onClick={onRefresh} variant="outline" className="rounded-xl gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────
function StudentsErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
    >
      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-red-100">
        <AlertCircle className="w-7 h-7 text-red-600" />
      </div>
      <h3 className="text-base font-bold text-red-800 mb-1">Couldn&apos;t load students</h3>
      <p className="text-sm text-red-600/80 max-w-sm mx-auto mb-5">{error}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="rounded-xl gap-2 bg-white border-red-200 text-red-700 hover:bg-red-100"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </Button>
    </motion.div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  delay = 0,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  gradient: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div
        className={cn(
          'absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform',
          gradient
        )}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-3xl font-extrabold text-slate-800 tabular-nums leading-none">{value}</p>
        </div>
        <div className={cn('p-3 rounded-2xl shadow-sm shrink-0', gradient)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Add Student Dialog ───────────────────────────────────────────────────────
interface AddStudentFormData {
  full_name: string
  email: string
  admission_number: string
  admission_year: string
  class: string
  gender: string
  parent_email: string
  parent_phone: string
  guardian_name: string
}

const INITIAL_FORM: AddStudentFormData = {
  full_name: '',
  email: '',
  admission_number: '',
  admission_year: new Date().getFullYear().toString(),
  class: '',
  gender: '',
  parent_email: '',
  parent_phone: '',
  guardian_name: '',
}

// Generate years from 2018 to current year + 5
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = 2018; year <= currentYear + 5; year++) {
    years.push(year.toString())
  }
  return years
}

// Class options (Primary only, removed JSS and SSS)
const CLASS_OPTIONS = [
  { id: 'nursery-1', name: 'Nursery 1' },
  { id: 'nursery-2', name: 'Nursery 2' },
  { id: 'primary-1', name: 'Primary 1' },
  { id: 'primary-2', name: 'Primary 2' },
  { id: 'primary-3', name: 'Primary 3' },
  { id: 'primary-4', name: 'Primary 4' },
  { id: 'primary-5', name: 'Primary 5' },
  { id: 'primary-6', name: 'Primary 6' },
]

function AddStudentDialog({
  open,
  onOpenChange,
  onSuccess,
  accentColor,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
  accentColor: string
}) {
  const [formData, setFormData] = useState<AddStudentFormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string; vin_id: string } | null>(null)

  const yearOptions = useMemo(() => generateYearOptions(), [])

  const updateField = (field: keyof AddStudentFormData) => (
    e: React.ChangeEvent<HTMLInputElement> | string
  ) => {
    const value = typeof e === 'string' ? e : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM)
    setCredentials(null)
    setShowCredentials(false)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.full_name.trim()) {
      toast.error('Full name is required')
      return
    }
    if (!formData.admission_year) {
      toast.error('Admission year is required')
      return
    }
    if (!formData.class) {
      toast.error('Please select a class')
      return
    }

    try {
      setSubmitting(true)

      // Split full name into parts
      const nameParts = formData.full_name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
      const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''

      const requestData = {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        role: 'student',
        class: formData.class,
        email: formData.email.trim().toLowerCase() || undefined,
        admission_number: formData.admission_number.trim().toUpperCase() || undefined,
        admission_year: parseInt(formData.admission_year),
        gender: formData.gender || '',
        guardian_name: formData.guardian_name || '',
        guardian_phone: formData.parent_phone || '',
        guardian_email: formData.parent_email || '',
      }

      console.log('📤 Sending data to API:', requestData)

      // Call the API endpoint
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      console.log('📥 API Response status:', response.status)

      // Get the response text first
      const responseText = await response.text()
      console.log('📥 API Response text (first 200 chars):', responseText.substring(0, 200))

      // Try to parse as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        console.error('❌ Failed to parse JSON. Response starts with:', responseText.substring(0, 50))
        
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          throw new Error('Server returned HTML instead of JSON. The API route might not exist or returned an error page.')
        }
        
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`)
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to enrol student (Status: ${response.status})`)
      }

      // Store credentials
      const creds = {
        email: data.credentials.email,
        password: data.credentials.password,
        vin_id: data.credentials.vin_id,
      }
      
      setCredentials(creds)
      setShowCredentials(true)
      
      // Refresh the student list
      await onSuccess()
      
      // Show toast with credentials
      toast.success(
        <div className="space-y-2 max-w-sm">
          <p className="font-bold text-base text-emerald-600">{formData.full_name} enrolled successfully! 🎉</p>
          <div className="text-xs space-y-2 bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email:
              </span>
              <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-mono truncate max-w-[150px]">
                {creds.email}
              </code>
              <button
                onClick={() => copyToClipboard(creds.email, 'email')}
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                {copied === 'email' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Key className="w-3 h-3" /> VIN ID / Password:
              </span>
              <code className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-mono font-bold text-amber-700">
                {creds.vin_id}
              </code>
              <button
                onClick={() => copyToClipboard(creds.vin_id, 'vin')}
                className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                {copied === 'vin' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 rounded-lg p-1.5 px-2 border border-amber-100">
              <span>🔑</span>
              <span>Use VIN ID as password to login</span>
            </div>
          </div>
          <p className="text-[10px] text-amber-600 mt-1">⚠️ Please save these credentials for the student</p>
        </div>,
        { duration: 10000 }
      )

      // Additional refresh after 1 second to ensure data is loaded
      setTimeout(() => {
        onSuccess()
      }, 1000)

    } catch (err: any) {
      console.error('❌ Error adding student:', err)
      toast.error(err?.message || 'Failed to enrol student. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      resetForm()
      setShowCredentials(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with gradient accent */}
        <div
          className="p-6 pb-5 relative overflow-hidden shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
          }}
        >
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
            style={{ backgroundColor: accentColor }}
          />

          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                }}
              >
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-extrabold text-slate-900 leading-tight text-left">
                  {showCredentials && credentials ? '🎉 Student Enrolled!' : 'Enrol New Student'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5 text-left">
                  {showCredentials && credentials 
                    ? 'Student account created successfully with the credentials below'
                    : 'Add a new pupil to the school records'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        {showCredentials && credentials ? (
          <div className="px-6 py-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-700" />
                </div>
                <span className="text-sm font-bold text-emerald-700">Account Created Successfully</span>
              </div>
              
              <div className="space-y-2 bg-white rounded-lg p-3 border border-emerald-100">
                {/* Email */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email:
                  </span>
                  <code className="bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-xs font-mono truncate max-w-[180px]">
                    {credentials.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(credentials.email, 'email')}
                    className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  >
                    {copied === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* VIN ID / Password (combined) */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Key className="w-3 h-3" /> VIN ID / Password:
                  </span>
                  <code className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs font-mono font-bold text-amber-700">
                    {credentials.vin_id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(credentials.vin_id, 'vin')}
                    className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  >
                    {copied === 'vin' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2 border border-amber-100">
                <span>🔑</span>
                <span>Use the VIN ID as your password to login</span>
              </div>
            </div>

            <DialogFooter className="flex-row justify-end gap-2">
              <Button
                onClick={handleClose}
                className="rounded-xl gap-2 text-white shadow-md font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  boxShadow: `0 8px 20px -6px ${accentColor}55`,
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Personal Info */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Personal Information
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name" className="text-xs font-semibold text-slate-700">
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={updateField('full_name')}
                      placeholder="e.g. Adaeze Ifeoma Okonkwo"
                      disabled={submitting}
                      className="rounded-xl border-slate-200 h-10 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                        Email <span className="text-slate-400 font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={updateField('email')}
                        placeholder="student@school.com"
                        disabled={submitting}
                        className="rounded-xl border-slate-200 h-10 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="gender" className="text-xs font-semibold text-slate-700">
                        Gender
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={updateField('gender')}
                        disabled={submitting}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 h-10 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Info */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Academic Information
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="admission_year" className="text-xs font-semibold text-slate-700">
                      Admission Year *
                    </Label>
                    <Select
                      value={formData.admission_year}
                      onValueChange={updateField('admission_year')}
                      disabled={submitting}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 h-10 text-sm">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="class" className="text-xs font-semibold text-slate-700">
                      Class *
                    </Label>
                    <Select
                      value={formData.class}
                      onValueChange={updateField('class')}
                      disabled={submitting}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 h-10 text-sm">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLASS_OPTIONS.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="admission_number" className="text-xs font-semibold text-slate-700">
                      Admission Number <span className="text-slate-400 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="admission_number"
                      value={formData.admission_number}
                      onChange={updateField('admission_number')}
                      placeholder="e.g. VS/2024/001"
                      disabled={submitting}
                      className="rounded-xl border-slate-200 h-10 text-sm font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Parent / Guardian
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="guardian_name" className="text-xs font-semibold text-slate-700">
                      Guardian Name
                    </Label>
                    <Input
                      id="guardian_name"
                      value={formData.guardian_name}
                      onChange={updateField('guardian_name')}
                      placeholder="e.g. Chidi Okonkwo"
                      disabled={submitting}
                      className="rounded-xl border-slate-200 h-10 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="parent_email" className="text-xs font-semibold text-slate-700">
                        Parent Email
                      </Label>
                      <Input
                        id="parent_email"
                        type="email"
                        value={formData.parent_email}
                        onChange={updateField('parent_email')}
                        placeholder="parent@example.com"
                        disabled={submitting}
                        className="rounded-xl border-slate-200 h-10 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="parent_phone" className="text-xs font-semibold text-slate-700">
                        Parent Phone
                      </Label>
                      <Input
                        id="parent_phone"
                        type="tel"
                        value={formData.parent_phone}
                        onChange={updateField('parent_phone')}
                        placeholder="+234 800 000 0000"
                        disabled={submitting}
                        className="rounded-xl border-slate-200 h-10 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
                className="rounded-xl border-slate-200 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl gap-2 text-white shadow-md font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  boxShadow: `0 8px 20px -6px ${accentColor}55`,
                }}
              >
                {submitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Enrolling…
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Enrol Student
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────
function StudentsPageContent() {
  const { user } = useUser()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const roleColors = getRoleColors(user?.role)
  const accentColor = roleColors.primary

  const fetchStudents = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true)
      else setLoading(true)
      setError(null)

      console.log('🔍 [fetchStudents] Fetching students via API...')

      // ✅ Use the API endpoint with service role to bypass RLS
      const response = await fetch('/api/admin/users?role=student')
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      
      const result = await response.json()

      console.log('📊 [fetchStudents] API result:', { 
        success: result.success, 
        count: result.data?.length || 0,
        data: result.data 
      })

      if (result.success) {
        // Map the data to match the Student type expected by StudentManagement
        const mappedStudents: Student[] = (result.data || []).map((item: any) => ({
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
          password_changed: item.password_changed || false,
          first_name: item.first_name || '',
          last_name: item.last_name || '',
          middle_name: item.middle_name || '',
        }))
        
        setStudents(mappedStudents)
        if (silent) {
          toast.success(`✅ ${mappedStudents.length} students loaded`)
        }
      } else {
        throw new Error(result.error || 'Failed to fetch students')
      }
      
    } catch (err: any) {
      console.error('❌ [fetchStudents] Error fetching students:', err)
      const msg = err?.message || 'Failed to load students. Please try again.'
      setError(msg)
      if (silent) toast.error(msg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchStudents()
    }
  }, [user])

  const stats = useMemo(() => {
    const total = students.length
    const active = students.filter((s) => s.is_active !== false).length
    const inactive = total - active
    const now = new Date()
    const thisMonth = students.filter((s) => {
      if (!s.created_at) return false
      const d = new Date(s.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    return { total, active, inactive, thisMonth }
  }, [students])

  const handleExport = () => {
    toast.info('Export coming soon')
  }
  const handleImport = () => {
    toast.info('Import coming soon')
  }

  if (loading) return <StudentsLoadingState accentColor={accentColor} />

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              boxShadow: `0 8px 20px -6px ${accentColor}55`,
            }}
          >
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
                Student Management
              </h1>
              <span
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                Admin
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Enrol, view and manage all pupils in the school
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="rounded-xl gap-2 border-slate-200 hover:border-slate-300 h-9"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            <span className="text-xs font-semibold hidden sm:inline">
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 hover:border-slate-300 h-9 w-9 p-0"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem onClick={handleImport} className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport} className="cursor-pointer">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => fetchStudents(true)} className="cursor-pointer">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setAddDialogOpen(true)}
            size="sm"
            className="rounded-xl gap-2 text-white shadow-md h-9 font-semibold"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
              boxShadow: `0 8px 20px -6px ${accentColor}55`,
            }}
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Add Student</span>
          </Button>
        </div>
      </motion.div>

      {/* ── Error state ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && !refreshing && (
          <StudentsErrorState error={error} onRetry={() => fetchStudents()} />
        )}
      </AnimatePresence>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      {!error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Pupils"
            value={stats.total}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={UserCheck}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            delay={0.07}
          />
          <StatCard
            label="Inactive"
            value={stats.inactive}
            icon={UserX}
            gradient="bg-gradient-to-br from-slate-400 to-slate-500"
            delay={0.14}
          />
          <StatCard
            label="This Month"
            value={stats.thisMonth}
            icon={Sparkles}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
            delay={0.21}
          />
        </div>
      )}

      {/* ── Empty or list ───────────────────────────────────────────────── */}
      {!error && students.length === 0 ? (
        <StudentsEmptyState
          onRefresh={() => fetchStudents(true)}
          onAdd={() => setAddDialogOpen(true)}
          accentColor={accentColor}
        />
      ) : (
        !error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35 }}
          >
            <StudentManagement
              students={students}
              onRefresh={() => fetchStudents(true)}
              loading={refreshing}
            />
          </motion.div>
        )
      )}

      {/* ── Add Student Dialog ──────────────────────────────────────────── */}
      <AddStudentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => fetchStudents(true)}
        accentColor={accentColor}
      />
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