/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import {
  Search, UserPlus, GraduationCap, Mail, Phone, MapPin,
  Loader2, Trash2, Edit2, Eye, Users, UserCheck, UserX,
  RefreshCw, Fingerprint, MoreVertical, LayoutGrid, List,
  X, UserCog, Shield, Sparkles, Calendar, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser, getRoleColors } from '@/contexts/UserContext'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Student {
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  role: 'student'
  class?: string
  class_arm?: string
  phone?: string
  address?: string
  is_active: boolean
  created_at: string
  admission_number?: string
  admission_year?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_email?: string
  date_of_birth?: string
  gender?: string
  photo_url?: string
  first_name?: string
  last_name?: string
  middle_name?: string
}

export interface StudentFormData {
  first_name: string
  middle_name: string
  last_name: string
  class: string
  phone: string
  address: string
  admission_year: string
  admission_number: string
  gender: string
  date_of_birth: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  email: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const CLASSES = [
  { id: 'playgroup', name: 'Playgroup', code: 'PG' },
  { id: 'nursery_1', name: 'Nursery 1', code: 'N1' },
  { id: 'nursery_2', name: 'Nursery 2', code: 'N2' },
  { id: 'kindergarten', name: 'Kindergarten', code: 'KG' },
  { id: 'primary_1', name: 'Primary 1', code: 'P1' },
  { id: 'primary_2', name: 'Primary 2', code: 'P2' },
  { id: 'primary_3', name: 'Primary 3', code: 'P3' },
  { id: 'primary_4', name: 'Primary 4', code: 'P4' },
  { id: 'primary_5', name: 'Primary 5', code: 'P5' },
] as const

const EMPTY_FORM: StudentFormData = {
  first_name: '', middle_name: '', last_name: '',
  class: '', phone: '', address: '',
  admission_year: new Date().getFullYear().toString(),
  admission_number: '', gender: '', date_of_birth: '',
  guardian_name: '', guardian_phone: '', guardian_email: '', email: '',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'

const GRADIENTS = [
  'from-rose-500 to-pink-600', 'from-orange-500 to-amber-600',
  'from-emerald-500 to-teal-600', 'from-blue-500 to-cyan-600',
  'from-violet-500 to-purple-600', 'from-indigo-500 to-blue-600',
  'from-fuchsia-500 to-pink-600', 'from-lime-500 to-green-600',
]

const getAvatarGradient = (name: string) => {
  const hash = (name || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]
}

const getClassCode = (className?: string) => {
  if (!className) return '?'
  return CLASSES.find((c) => c.name === className)?.code ?? className.slice(0, 2).toUpperCase()
}

const buildFullName = (f: StudentFormData) =>
  [f.first_name, f.middle_name, f.last_name].filter(Boolean).join(' ')

// ── Small reusable pieces ──────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string
}) {
  return (
    <Card className="relative overflow-hidden border border-slate-200/60 shadow-sm bg-white">
      <div className={cn('absolute inset-y-0 left-0 w-1', color)} />
      <CardContent className="p-2.5 pl-3.5 sm:p-3 sm:pl-4 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{label}</p>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">{value}</p>
        </div>
        <div className={cn('p-1.5 sm:p-2 rounded-lg shrink-0 opacity-90', color)}>
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  )
}

function ClassBadge({ className, accent }: { className?: string; accent: string }) {
  if (!className) return <span className="text-xs text-slate-400">—</span>
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold text-white whitespace-nowrap"
      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)` }}
    >
      {getClassCode(className)}
    </span>
  )
}

function StudentAvatar({ student, size = 'md' }: { student: Student; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-9 w-9 sm:h-10 sm:w-10', lg: 'h-16 w-16' }
  const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-lg' }
  return (
    <Avatar className={cn(sizes[size], 'shadow-sm ring-1 ring-white shrink-0')}>
      <AvatarImage src={student.photo_url || undefined} />
      <AvatarFallback className={cn('text-white font-bold bg-gradient-to-br', getAvatarGradient(student.full_name), textSizes[size])}>
        {getInitials(student.full_name)}
      </AvatarFallback>
    </Avatar>
  )
}

function ActionMenu({ student, onView, onEdit, onToggle, onDelete }: {
  student: Student
  onView: () => void
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg shrink-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl bg-white border border-slate-200 shadow-xl">
        <DropdownMenuItem onClick={onView} className="cursor-pointer text-xs">
          <Eye className="mr-2 h-3.5 w-3.5" /> View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-xs">
          <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggle} className="cursor-pointer text-xs">
          {student.is_active
            ? <><UserX className="mr-2 h-3.5 w-3.5" /> Deactivate</>
            : <><UserCheck className="mr-2 h-3.5 w-3.5" /> Activate</>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-xs text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FormSection({ title, icon: Icon, accent, children }: {
  title: string; icon: React.ElementType; accent: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}20` }}>
          <Icon className="w-3 h-3" style={{ color: accent }} />
        </div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 whitespace-nowrap">{title}</p>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function Field({ label, id, helper, children }: {
  label: string; id: string; helper?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-semibold text-slate-600">{label}</Label>
      {children}
      {helper && <p className="text-[10px] text-slate-400">{helper}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export function StudentManagement() {
  const { user } = useUser()
  const accent = getRoleColors(user?.role).primary

  // ── State ──────────────────────────────────────────────────────────────────
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [modal, setModal] = useState<'none' | 'create' | 'edit' | 'detail' | 'delete'>('none')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [createForm, setCreateForm] = useState<StudentFormData>(EMPTY_FORM)
  const [editForm, setEditForm] = useState<Partial<Student>>({})

  // Force cards view on mobile — much better UX than tables
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 640px)')
    const apply = () => setViewMode(mq.matches ? 'table' : 'cards')
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // ── Data ───────────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      let query = supabase.from('profiles').select('*').eq('role', 'pupil').order('display_name')
      if ((user?.role === 'teacher' || user?.role === 'staff') && user?.class) {
        query = query.eq('class', user.class)
      }
      const { data, error } = await query
      if (error) throw error
      setStudents(
        (data ?? []).map((p: any): Student => ({
          id: p.id, vin_id: p.vin_id || '', full_name: p.full_name || p.display_name || 'Unknown',
          display_name: p.display_name || p.full_name || 'Unknown', email: p.email || '',
          role: 'student', class: p.class || '', class_arm: p.class_arm || '',
          phone: p.phone || '', address: p.address || '', is_active: p.is_active ?? true,
          created_at: p.created_at || new Date().toISOString(),
          admission_number: p.admission_number || '', admission_year: p.admission_year || '',
          guardian_name: p.guardian_name || '', guardian_phone: p.guardian_phone || '',
          guardian_email: p.guardian_email || '', date_of_birth: p.date_of_birth || '',
          gender: p.gender || '', photo_url: p.photo_url || '',
          first_name: p.first_name || '', last_name: p.last_name || '', middle_name: p.middle_name || '',
        }))
      )
    } catch (e: any) {
      setError(e.message || 'Failed to load pupils')
      toast.error(e.message || 'Failed to load pupils')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => students.filter((s) => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.full_name?.toLowerCase().includes(q) ||
      s.vin_id?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) ||
      s.admission_number?.toLowerCase().includes(q)
    const matchClass = classFilter === 'all' || s.class === classFilter
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && s.is_active) || (statusFilter === 'inactive' && !s.is_active)
    return matchSearch && matchClass && matchStatus
  }), [students, search, classFilter, statusFilter])

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter((s) => s.is_active).length,
    inactive: students.filter((s) => !s.is_active).length,
    classes: new Set(students.map((s) => s.class).filter(Boolean)).size,
  }), [students])

  const activeFilters = (classFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  // ── Handlers ───────────────────────────────────────────────────────────────
  const closeModal = () => { setModal('none'); setSelectedStudent(null) }

  const openEdit = (s: Student) => {
    setSelectedStudent(s)
    setEditForm({
      full_name: s.full_name, first_name: s.first_name, last_name: s.last_name,
      class: s.class, gender: s.gender, phone: s.phone, address: s.address,
      guardian_name: s.guardian_name, guardian_phone: s.guardian_phone,
      guardian_email: s.guardian_email, admission_number: s.admission_number, is_active: s.is_active,
    })
    setModal('edit')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // ── Validate required fields ─────────────────────────────────────────
    if (!createForm.first_name.trim()) {
      toast.error('First name is required')
      return
    }
    if (!createForm.last_name.trim()) {
      toast.error('Last name is required')
      return
    }
    if (!createForm.class) {
      toast.error('Please select a class')
      return
    }
    if (!createForm.admission_number.trim()) {
      toast.error('Admission number is required')
      return
    }

    // ── Check duplicate admission number ─────────────────────────────────
    const admNo = createForm.admission_number.trim().toUpperCase()
    const duplicate = students.find(
      (s) => s.admission_number?.toUpperCase() === admNo
    )
    if (duplicate) {
      toast.error(`Admission number "${admNo}" already exists for ${duplicate.full_name}`)
      return
    }

    setIsSubmitting(true)
    try {
      const fullName = buildFullName(createForm)
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          admission_number: admNo,
          role: 'pupil',
          full_name: fullName,
          display_name: fullName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create student')
      toast.success(`Enrolled! VIN: ${data.credentials?.vin_id || 'N/A'}`)
      setCreateForm(EMPTY_FORM)
      closeModal()
      await fetchStudents()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedStudent) return

    // ── Validate required fields ─────────────────────────────────────────
    if (!editForm.admission_number?.trim()) {
      toast.error('Admission number is required')
      return
    }

    // ── Check duplicate admission number (excluding self) ────────────────
    const admNo = editForm.admission_number.trim().toUpperCase()
    const duplicate = students.find(
      (s) =>
        s.id !== selectedStudent.id &&
        s.admission_number?.toUpperCase() === admNo
    )
    if (duplicate) {
      toast.error(`Admission number "${admNo}" already exists for ${duplicate.full_name}`)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStudent.id,
          ...editForm,
          admission_number: admNo,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed')
      toast.success('Student updated!')
      closeModal()
      await fetchStudents()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedStudent) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users?id=${selectedStudent.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed')
      toast.success('Student deleted!')
      closeModal()
      await fetchStudents()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (s: Student) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      toast.success(`Student ${!s.is_active ? 'activated' : 'deactivated'}!`)
      await fetchStudents()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const btnStyle = { background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-8 sm:p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <p className="font-bold text-slate-800">Failed to load pupils</p>
          <p className="text-sm text-slate-400 mt-1 break-words">{error}</p>
        </div>
        <Button onClick={fetchStudents} variant="outline" className="rounded-xl gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-3 sm:space-y-4">

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Total" value={stats.total} icon={Users} color="bg-emerald-500" />
        <StatCard label="Active" value={stats.active} icon={UserCheck} color="bg-blue-500" />
        <StatCard label="Inactive" value={stats.inactive} icon={UserX} color="bg-slate-400" />
        <StatCard label="Classes" value={stats.classes} icon={GraduationCap} color="bg-violet-500" />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-2.5 sm:p-3 space-y-2.5">
        {/* Row 1: search + add */}
        <div className="flex gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-10 rounded-xl border-slate-200 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            )}
          </div>
          <Button onClick={() => setModal('create')} size="sm"
            className="h-10 rounded-xl gap-1.5 text-white shrink-0 font-semibold px-3" style={btnStyle}>
            <UserPlus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Add</span>
          </Button>
        </div>

        {/* Row 2: filters */}
        <div className="flex items-center gap-2 overflow-x-auto -mx-0.5 px-0.5 pb-0.5 scrollbar-none">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="h-8 rounded-lg border-slate-200 text-xs w-32 min-w-32 gap-1 shrink-0">
              <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
              <SelectItem value="all">All Classes</SelectItem>
              {CLASSES.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 rounded-lg border-slate-200 text-xs w-24 min-w-24 shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => { setClassFilter('all'); setStatusFilter('all') }}
              className="h-8 px-2 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={fetchStudents} disabled={loading}
              className="h-8 w-8 p-0 rounded-lg">
              <RefreshCw className={cn('w-3.5 h-3.5 text-slate-400', loading && 'animate-spin')} />
            </Button>
            <div className="hidden sm:flex bg-slate-100 rounded-lg p-0.5">
              {(['table', 'cards'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setViewMode(mode)}
                  className={cn('h-7 w-7 rounded-md flex items-center justify-center transition-all',
                    viewMode === mode ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600')}>
                  {mode === 'table' ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: result count */}
        <p className="text-[11px] text-slate-400">
          <span className="font-bold text-slate-600">{filtered.length}</span> of{' '}
          <span className="font-bold text-slate-600">{students.length}</span> pupils
          {activeFilters > 0 && (
            <span className="text-violet-500 font-semibold">
              {' '}· {activeFilters} filter{activeFilters > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 sm:p-16 flex flex-col items-center gap-3">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: accent }} />
            <p className="text-sm text-slate-400 font-medium">Loading pupils…</p>
          </motion.div>

        ) : filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 sm:p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
              style={{ backgroundColor: `${accent}15` }}>
              <GraduationCap className="w-6 h-6" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-bold text-slate-700">No pupils found</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {search || activeFilters > 0 ? 'Try adjusting your filters.' : 'Add your first pupil to get started.'}
              </p>
            </div>
            {(search || activeFilters > 0) && (
              <Button variant="outline" onClick={() => { setSearch(''); setClassFilter('all'); setStatusFilter('all') }}
                className="rounded-xl gap-2 text-sm">
                <X className="w-3.5 h-3.5" /> Clear filters
              </Button>
            )}
          </motion.div>

        ) : viewMode === 'table' ? (
          /* ── TABLE VIEW ─────────────────────────────────────────────────── */
          <motion.div key="table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left">Student</th>
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left">Adm. No.</th>
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left hidden md:table-cell">VIN</th>
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left">Class</th>
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left">Status</th>
                    <th className="p-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <motion.tr key={s.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <StudentAvatar student={s} />
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate leading-tight">
                              {s.full_name || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{s.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <code className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {s.admission_number || '—'}
                        </code>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <code className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                          style={{ backgroundColor: `${accent}12`, color: accent }}>
                          {s.vin_id || '—'}
                        </code>
                      </td>
                      <td className="p-3"><ClassBadge className={s.class} accent={accent} /></td>
                      <td className="p-3"><StatusBadge active={s.is_active} /></td>
                      <td className="p-3 text-right">
                        <ActionMenu student={s}
                          onView={() => { setSelectedStudent(s); setModal('detail') }}
                          onEdit={() => openEdit(s)}
                          onToggle={() => handleToggleStatus(s)}
                          onDelete={() => { setSelectedStudent(s); setModal('delete') }}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        ) : (
          /* ── CARD VIEW ──────────────────────────────────────────────────── */
          <motion.div key="cards" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {filtered.map((s, idx) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md active:scale-[0.99] transition-all overflow-hidden">

                <div className={cn('h-1 w-full bg-gradient-to-r', getAvatarGradient(s.full_name))} />

                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setSelectedStudent(s); setModal('detail') }}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      <div className="relative shrink-0">
                        <StudentAvatar student={s} />
                        {s.is_active && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">{s.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{s.email || 'No email'}</p>
                      </div>
                    </button>
                    <ActionMenu student={s}
                      onView={() => { setSelectedStudent(s); setModal('detail') }}
                      onEdit={() => openEdit(s)}
                      onToggle={() => handleToggleStatus(s)}
                      onDelete={() => { setSelectedStudent(s); setModal('delete') }}
                    />
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400 shrink-0">Class</span>
                      <ClassBadge className={s.class} accent={accent} />
                    </div>
                    {s.admission_number && (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-400 shrink-0">Adm.</span>
                        <code className="font-mono text-[10px] font-bold text-slate-600 truncate">{s.admission_number}</code>
                      </div>
                    )}
                    {s.vin_id && (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-400 shrink-0">VIN</span>
                        <code className="font-mono text-[10px] font-bold truncate" style={{ color: accent }}>{s.vin_id}</code>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => { setSelectedStudent(s); setModal('detail') }}
                        className="text-[11px] font-semibold hover:underline flex items-center gap-0.5"
                        style={{ color: accent }}
                      >
                        View profile <ChevronRight className="w-3 h-3" />
                      </button>
                      <StatusBadge active={s.is_active} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CREATE MODAL                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={modal === 'create'} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent
          className="p-0 gap-0 border-0 shadow-2xl bg-white flex flex-col
                     w-screen h-[100dvh] max-w-full rounded-none
                     sm:w-[calc(100vw-2rem)] sm:h-auto sm:max-w-2xl sm:max-h-[90vh] sm:rounded-2xl"
        >
          <DialogHeader className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 shrink-0 space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={btnStyle}>
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <DialogTitle className="text-base font-extrabold text-slate-900 leading-tight">Enrol New Student</DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">Fill in the details below</DialogDescription>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreate} className="flex flex-col overflow-hidden flex-1">
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 space-y-5">

              <FormSection title="Personal" icon={Users} accent={accent}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Field label="First Name *" id="fn">
                    <Input id="fn" value={createForm.first_name} required
                      onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                  <Field label="Middle Name" id="mn">
                    <Input id="mn" value={createForm.middle_name}
                      onChange={(e) => setCreateForm({ ...createForm, middle_name: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                  <Field label="Last Name *" id="ln">
                    <Input id="ln" value={createForm.last_name} required
                      onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Field label="Gender" id="gnd">
                    <Select value={createForm.gender} onValueChange={(v) => setCreateForm({ ...createForm, gender: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Date of Birth" id="dob">
                    <Input id="dob" type="date" value={createForm.date_of_birth}
                      onChange={(e) => setCreateForm({ ...createForm, date_of_birth: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                  <Field label="Phone" id="ph">
                    <Input id="ph" type="tel" value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                </div>
                <Field label="Address" id="addr">
                  <Input id="addr" value={createForm.address}
                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                    className="h-10 rounded-xl border-slate-200 text-sm" />
                </Field>
              </FormSection>

              <FormSection title="Academic" icon={GraduationCap} accent={accent}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Field label="Class *" id="cls">
                    <Select value={createForm.class} onValueChange={(v) => setCreateForm({ ...createForm, class: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                        {CLASSES.map((c) => (
                          <SelectItem key={c.id} value={c.name}>{c.name} ({c.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Admission Year" id="yr">
                    <Input id="yr" value={createForm.admission_year}
                      onChange={(e) => setCreateForm({ ...createForm, admission_year: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                  <Field
                    label="Admission No. *"
                    id="ano"
                    helper="Must be unique"
                  >
                    <Input
                      id="ano"
                      value={createForm.admission_number}
                      required
                      placeholder="e.g. PUP001"
                      onChange={(e) => setCreateForm({ ...createForm, admission_number: e.target.value.toUpperCase() })}
                      className="h-10 rounded-xl border-slate-200 text-sm font-mono"
                    />
                  </Field>
                </div>
              </FormSection>

              <FormSection title="Guardian" icon={UserCog} accent={accent}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Field label="Guardian Name" id="gn">
                    <Input id="gn" value={createForm.guardian_name}
                      onChange={(e) => setCreateForm({ ...createForm, guardian_name: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                  <Field label="Guardian Phone" id="gp">
                    <Input id="gp" value={createForm.guardian_phone}
                      onChange={(e) => setCreateForm({ ...createForm, guardian_phone: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                </div>
                <Field label="Guardian Email" id="ge">
                  <Input id="ge" type="email" value={createForm.guardian_email}
                    onChange={(e) => setCreateForm({ ...createForm, guardian_email: e.target.value })}
                    className="h-10 rounded-xl border-slate-200 text-sm" />
                </Field>
              </FormSection>

              <FormSection title="Account" icon={Shield} accent={accent}>
                <Field label="Student Email" id="em" helper="Used for login credentials">
                  <Input id="em" type="email" placeholder="student@example.com" value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="h-10 rounded-xl border-slate-200 text-sm" />
                </Field>
              </FormSection>
            </div>

            <div className="px-4 py-3 sm:px-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur shrink-0
                            flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
              <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}
                className="h-10 rounded-xl text-sm font-semibold flex-1 sm:flex-initial">Cancel</Button>
              <Button type="submit" disabled={isSubmitting}
                className="h-10 rounded-xl gap-2 text-white text-sm font-semibold flex-1 sm:flex-initial" style={btnStyle}>
                {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enrolling…</>
                  : <><UserPlus className="w-3.5 h-3.5" /> Enrol</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EDIT MODAL                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={modal === 'edit'} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent
          className="p-0 gap-0 border-0 shadow-2xl bg-white flex flex-col
                     w-screen h-[100dvh] max-w-full rounded-none
                     sm:w-[calc(100vw-2rem)] sm:h-auto sm:max-w-xl sm:max-h-[90vh] sm:rounded-2xl"
        >
          <DialogHeader className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 shrink-0 space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={btnStyle}>
                <Edit2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <DialogTitle className="text-base font-extrabold text-slate-900 leading-tight">Edit Student</DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  {selectedStudent?.full_name}
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Field label="First Name" id="ef">
                <Input id="ef" value={editForm.first_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 text-sm" />
              </Field>
              <Field label="Last Name" id="el">
                <Input id="el" value={editForm.last_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 text-sm" />
              </Field>
            </div>
            <Field label="Full Name" id="efn">
              <Input id="efn" value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="h-10 rounded-xl border-slate-200 text-sm" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Field label="Class" id="ec">
                <Select value={editForm.class || ''} onValueChange={(v) => setEditForm({ ...editForm, class: v })}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                    {CLASSES.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Gender" id="eg">
                <Select value={editForm.gender || ''} onValueChange={(v) => setEditForm({ ...editForm, gender: v })}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Field label="Phone" id="eph">
                <Input id="eph" value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 text-sm" />
              </Field>
              <Field label="Admission No. *" id="ean" helper="Must be unique">
                <Input
                  id="ean"
                  value={editForm.admission_number || ''}
                  required
                  onChange={(e) => setEditForm({ ...editForm, admission_number: e.target.value.toUpperCase() })}
                  className="h-10 rounded-xl border-slate-200 text-sm font-mono"
                />
              </Field>
            </div>
            <Field label="Address" id="ead">
              <Input id="ead" value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="h-10 rounded-xl border-slate-200 text-sm" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Field label="Guardian Name" id="egn">
                <Input id="egn" value={editForm.guardian_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, guardian_name: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 text-sm" />
              </Field>
              <Field label="Guardian Phone" id="egp">
                <Input id="egp" value={editForm.guardian_phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, guardian_phone: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 text-sm" />
              </Field>
            </div>
            <Field label="Guardian Email" id="ege">
              <Input id="ege" type="email" value={editForm.guardian_email || ''}
                onChange={(e) => setEditForm({ ...editForm, guardian_email: e.target.value })}
                className="h-10 rounded-xl border-slate-200 text-sm" />
            </Field>
          </div>

          <div className="px-4 py-3 sm:px-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur shrink-0
                          flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
            <Button variant="outline" onClick={closeModal}
              className="h-10 rounded-xl text-sm font-semibold flex-1 sm:flex-initial">Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}
              className="h-10 rounded-xl gap-2 text-white text-sm font-semibold flex-1 sm:flex-initial" style={btnStyle}>
              {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={modal === 'detail'} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent
          className="p-0 gap-0 border-0 shadow-2xl bg-white flex flex-col
                     w-screen h-[100dvh] max-w-full rounded-none
                     sm:w-[calc(100vw-2rem)] sm:h-auto sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl"
        >
          {selectedStudent && (
            <>
              <div className="p-4 pb-14 sm:p-5 sm:pb-12 relative overflow-hidden shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

                <DialogHeader className="relative space-y-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Student Profile</span>
                      <DialogTitle className="text-base sm:text-lg font-extrabold text-white mt-0.5 truncate">
                        {selectedStudent.full_name}
                      </DialogTitle>
                      <DialogDescription className="sr-only">Profile details for {selectedStudent.full_name}</DialogDescription>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-white">
                          <Sparkles className="w-2.5 h-2.5" /> Student
                        </span>
                        <StatusBadge active={selectedStudent.is_active} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </DialogHeader>
              </div>

              <div className="relative flex-1 overflow-y-auto overscroll-contain">
                <div className="absolute -top-8 left-4 sm:left-5">
                  <StudentAvatar student={selectedStudent} size="lg" />
                </div>

                <div className="pt-12 px-4 pb-5 sm:px-5 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Fingerprint, label: 'Adm.', value: selectedStudent.admission_number || 'N/A' },
                      { icon: Shield, label: 'VIN', value: selectedStudent.vin_id || 'N/A', colored: true },
                      { icon: GraduationCap, label: 'Class', value: selectedStudent.class || '—' },
                    ].map(({ icon: Icon, label, value, colored }) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-2 sm:p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 truncate">{label}</span>
                        </div>
                        <p className="text-[11px] font-bold font-mono truncate"
                          style={{ color: colored ? accent : '#334155' }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {[
                    {
                      title: 'Contact', icon: Mail, rows: [
                        { label: 'Email', value: selectedStudent.email || 'Not provided', icon: Mail },
                        selectedStudent.phone && { label: 'Phone', value: selectedStudent.phone, icon: Phone },
                        selectedStudent.address && { label: 'Address', value: selectedStudent.address, icon: MapPin },
                      ].filter(Boolean) as { label: string; value: string; icon: React.ElementType }[]
                    },
                    selectedStudent.guardian_name && {
                      title: 'Guardian', icon: UserCog, rows: [
                        { label: 'Name', value: selectedStudent.guardian_name },
                        selectedStudent.guardian_phone && { label: 'Phone', value: selectedStudent.guardian_phone, icon: Phone },
                        selectedStudent.guardian_email && { label: 'Email', value: selectedStudent.guardian_email, icon: Mail },
                      ].filter(Boolean) as { label: string; value: string; icon?: React.ElementType }[]
                    },
                    {
                      title: 'Enrolment', icon: Calendar, rows: [
                        { label: 'Joined', value: new Date(selectedStudent.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                        selectedStudent.admission_year && { label: 'Year', value: selectedStudent.admission_year },
                        selectedStudent.gender && { label: 'Gender', value: selectedStudent.gender },
                      ].filter(Boolean) as { label: string; value: string }[]
                    },
                  ].filter(Boolean).map((section: any) => (
                    <div key={section.title} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <section.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{section.title}</p>
                      </div>
                      <div className="space-y-2">
                        {section.rows.map((row: any) => (
                          <div key={row.label} className="flex items-start justify-between gap-3 text-xs">
                            <span className="text-slate-400 shrink-0 flex items-center gap-1">
                              {row.icon && <row.icon className="w-3 h-3" />}
                              {row.label}
                            </span>
                            <span className="text-slate-700 font-semibold text-right break-all min-w-0">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3 sm:px-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur shrink-0
                              flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
                <Button variant="outline" onClick={closeModal}
                  className="h-10 rounded-xl text-sm font-semibold flex-1 sm:flex-initial">Close</Button>
                <Button onClick={() => { closeModal(); openEdit(selectedStudent) }}
                  className="h-10 rounded-xl gap-2 text-white text-sm font-semibold flex-1 sm:flex-initial" style={btnStyle}>
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DELETE DIALOG                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={modal === 'delete'} onOpenChange={(o) => !o && closeModal()}>
        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl bg-white w-[calc(100vw-2rem)] max-w-sm">
          <AlertDialogHeader>
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <AlertDialogTitle className="text-base font-extrabold text-slate-800">Delete student?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 break-words">
              This will permanently delete{' '}
              <span className="font-bold text-slate-700">{selectedStudent?.full_name}</span>{' '}
              and all associated data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel onClick={closeModal}
              className="rounded-xl font-semibold text-sm mt-0 h-10 flex-1 sm:flex-initial">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}
              className="rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-sm gap-2 h-10 flex-1 sm:flex-initial">
              {isSubmitting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
                : <><Trash2 className="w-3.5 h-3.5" /> Delete</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}