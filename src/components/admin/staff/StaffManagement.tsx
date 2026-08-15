/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Search, UserPlus, Briefcase, Mail, Phone, MapPin,
  Loader2, Trash2, Edit2, Eye, Users, UserCheck, UserX,
  RefreshCw, MoreVertical, LayoutGrid, List,
  X, UserCog, Shield, Sparkles, Calendar, ChevronRight,
  BookOpen, Laptop, Microscope, Calculator, Palette, Music,
  Languages, Landmark, Dumbbell,
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

export interface Staff {
  id: string
  vin_id: string
  full_name: string
  display_name: string
  email: string
  role: 'staff' | 'teacher'
  department?: string
  phone?: string
  address?: string
  is_active: boolean
  created_at: string
  date_joined?: string
  gender?: string
  photo_url?: string
  title?: string
  first_name?: string
  last_name?: string
  middle_name?: string
}

export interface StaffFormData {
  first_name: string
  middle_name: string
  last_name: string
  department: string
  phone: string
  address: string
  date_joined: string
  gender: string
  title: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  { value: 'technology', label: 'Technology', icon: Laptop, color: 'bg-blue-500' },
  { value: 'science', label: 'Science', icon: Microscope, color: 'bg-emerald-500' },
  { value: 'mathematics', label: 'Mathematics', icon: Calculator, color: 'bg-purple-500' },
  { value: 'art', label: 'Art', icon: Palette, color: 'bg-pink-500' },
  { value: 'music', label: 'Music', icon: Music, color: 'bg-amber-500' },
  { value: 'languages', label: 'Languages', icon: Languages, color: 'bg-indigo-500' },
  { value: 'social-studies', label: 'Social Studies', icon: Landmark, color: 'bg-orange-500' },
  { value: 'physical-education', label: 'P.E.', icon: Dumbbell, color: 'bg-red-500' },
  { value: 'business', label: 'Business', icon: Briefcase, color: 'bg-cyan-500' },
  { value: 'general', label: 'General', icon: BookOpen, color: 'bg-slate-500' },
] as const

const TITLES = [
  { value: 'mr', label: 'Mr.' },
  { value: 'mrs', label: 'Mrs.' },
  { value: 'ms', label: 'Ms.' },
  { value: 'dr', label: 'Dr.' },
  { value: 'prof', label: 'Prof.' },
] as const

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const

const EMPTY_FORM: StaffFormData = {
  first_name: '', middle_name: '', last_name: '',
  department: 'general', phone: '', address: '',
  date_joined: new Date().toISOString().split('T')[0],
  gender: '', title: '',
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

const getDepartment = (value?: string) =>
  DEPARTMENTS.find((d) => d.value === value) ?? DEPARTMENTS.find((d) => d.value === 'general')!

const getTitleLabel = (value?: string) =>
  TITLES.find((t) => t.value === value)?.label ?? ''

const generateEmail = (firstName: string, lastName: string): string => {
  const f = firstName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'user'
  const l = lastName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'account'
  return `${f}.${l}@vincollins.edu.ng`
}

const buildFullName = (f: StaffFormData) =>
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

function DepartmentBadge({ value }: { value?: string }) {
  const dept = getDepartment(value)
  const Icon = dept.icon
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold text-white whitespace-nowrap',
      dept.color
    )}>
      <Icon className="w-2.5 h-2.5" />
      {dept.label}
    </span>
  )
}

function StaffAvatar({ member, size = 'md' }: { member: Staff; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-9 w-9 sm:h-10 sm:w-10', lg: 'h-16 w-16' }
  const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-lg' }
  return (
    <Avatar className={cn(sizes[size], 'shadow-sm ring-1 ring-white shrink-0')}>
      <AvatarImage src={member.photo_url || undefined} />
      <AvatarFallback className={cn('text-white font-bold bg-gradient-to-br', getAvatarGradient(member.full_name), textSizes[size])}>
        {getInitials(member.full_name)}
      </AvatarFallback>
    </Avatar>
  )
}

function ActionMenu({ member, onView, onEdit, onToggle, onDelete }: {
  member: Staff
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
          {member.is_active
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

function Field({ label, id, helper, required, children }: {
  label: string; id: string; helper?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-semibold text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {helper && <p className="text-[10px] text-slate-400">{helper}</p>}
    </div>
  )
}

// ── Props ──
interface StaffManagementProps {
  staff: Staff[]
  onRefresh: () => Promise<void>
  loading?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function StaffManagement({ staff, onRefresh, loading = false }: StaffManagementProps) {
  const { user } = useUser()
  const accent = getRoleColors(user?.role)?.primary || '#0A2472'

  // ── State ──────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')

  const [selected, setSelected] = useState<Staff | null>(null)
  const [modal, setModal] = useState<'none' | 'create' | 'edit' | 'detail' | 'delete'>('none')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [createForm, setCreateForm] = useState<StaffFormData>(EMPTY_FORM)
  const [editForm, setEditForm] = useState<Partial<Staff>>({})

  // Force cards view on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 640px)')
    const apply = () => setViewMode(mq.matches ? 'table' : 'cards')
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => staff.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.full_name?.toLowerCase().includes(q) ||
      m.vin_id?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    const matchDept = deptFilter === 'all' || m.department === deptFilter
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && m.is_active) || (statusFilter === 'inactive' && !m.is_active)
    return matchSearch && matchDept && matchStatus
  }), [staff, search, deptFilter, statusFilter])

  const stats = useMemo(() => ({
    total: staff.length,
    active: staff.filter((s) => s.is_active).length,
    inactive: staff.filter((s) => !s.is_active).length,
    departments: new Set(staff.map((s) => s.department).filter(Boolean)).size,
  }), [staff])

  const activeFilters = (deptFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  // ── Handlers ───────────────────────────────────────────────────────────────
  const closeModal = () => { setModal('none'); setSelected(null) }

  const openEdit = (m: Staff) => {
    setSelected(m)
    setEditForm({
      full_name: m.full_name, first_name: m.first_name, last_name: m.last_name,
      department: m.department, gender: m.gender, phone: m.phone,
      address: m.address, title: m.title, is_active: m.is_active,
    })
    setModal('edit')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!createForm.first_name.trim()) return toast.error('First name is required')
    if (!createForm.last_name.trim()) return toast.error('Last name is required')
    if (!createForm.department) return toast.error('Please select a department')

    setIsSubmitting(true)
    try {
      const email = generateEmail(createForm.first_name, createForm.last_name)
      const fullName = buildFullName(createForm)

      const payload: any = {
        first_name: createForm.first_name.trim(),
        middle_name: createForm.middle_name.trim() || '',
        last_name: createForm.last_name.trim(),
        full_name: fullName,
        display_name: fullName,
        department: createForm.department,
        role: 'staff',
        email,
      }
      if (createForm.phone.trim()) payload.phone = createForm.phone.trim()
      if (createForm.address.trim()) payload.address = createForm.address.trim()
      if (createForm.gender) payload.gender = createForm.gender
      if (createForm.title) payload.title = createForm.title
      if (createForm.date_joined) payload.join_year = new Date(createForm.date_joined).getFullYear().toString()

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create staff')

      const vinId = data.user?.vin_id || data.credentials?.vin_id || 'N/A'
      toast.success(`Staff added! VIN: ${vinId}`, { duration: 6000 })
      setCreateForm(EMPTY_FORM)
      closeModal()
      await onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selected) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, ...editForm }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed')
      toast.success('Staff updated!')
      closeModal()
      await onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users?id=${selected.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed')
      toast.success('Staff deleted!')
      closeModal()
      await onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (m: Staff) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, is_active: !m.is_active }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error)
      toast.success(`Staff ${!m.is_active ? 'activated' : 'deactivated'}!`)
      await onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const btnStyle = { background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-3 sm:space-y-4">

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Total" value={stats.total} icon={Users} color="bg-emerald-500" />
        <StatCard label="Active" value={stats.active} icon={UserCheck} color="bg-blue-500" />
        <StatCard label="Inactive" value={stats.inactive} icon={UserX} color="bg-slate-400" />
        <StatCard label="Depts" value={stats.departments} icon={Briefcase} color="bg-violet-500" />
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
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-8 rounded-lg border-slate-200 text-xs w-36 min-w-36 gap-1 shrink-0">
              <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  <div className="flex items-center gap-2">
                    <d.icon className="w-3 h-3" />
                    {d.label}
                  </div>
                </SelectItem>
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
              onClick={() => { setDeptFilter('all'); setStatusFilter('all') }}
              className="h-8 px-2 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-1 shrink-0"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}

          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}
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
          <span className="font-bold text-slate-600">{staff.length}</span> staff
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
            <p className="text-sm text-slate-400 font-medium">Loading staff…</p>
          </motion.div>

        ) : filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8 sm:p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center"
              style={{ backgroundColor: `${accent}15` }}>
              <Briefcase className="w-6 h-6" style={{ color: accent }} />
            </div>
            <div>
              <p className="font-bold text-slate-700">No staff found</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {search || activeFilters > 0 ? 'Try adjusting your filters.' : 'Add your first staff member to get started.'}
              </p>
            </div>
            {(search || activeFilters > 0) && (
              <Button variant="outline" onClick={() => { setSearch(''); setDeptFilter('all'); setStatusFilter('all') }}
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
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left">Staff</th>
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left hidden md:table-cell">VIN</th>
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left">Department</th>
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left hidden lg:table-cell">Phone</th>
                    <th className="p-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-left">Status</th>
                    <th className="p-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, idx) => (
                    <motion.tr key={m.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <StaffAvatar member={m} />
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate leading-tight">
                              {getTitleLabel(m.title)} {m.full_name || 'Unknown'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{m.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <code className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                          style={{ backgroundColor: `${accent}12`, color: accent }}>
                          {m.vin_id || '—'}
                        </code>
                      </td>
                      <td className="p-3"><DepartmentBadge value={m.department} /></td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-[11px] text-slate-600">{m.phone || '—'}</span>
                      </td>
                      <td className="p-3"><StatusBadge active={m.is_active} /></td>
                      <td className="p-3 text-right">
                        <ActionMenu member={m}
                          onView={() => { setSelected(m); setModal('detail') }}
                          onEdit={() => openEdit(m)}
                          onToggle={() => handleToggleStatus(m)}
                          onDelete={() => { setSelected(m); setModal('delete') }}
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
            {filtered.map((m, idx) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md active:scale-[0.99] transition-all overflow-hidden">

                <div className={cn('h-1 w-full bg-gradient-to-r', getAvatarGradient(m.full_name))} />

                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setSelected(m); setModal('detail') }}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      <div className="relative shrink-0">
                        <StaffAvatar member={m} />
                        {m.is_active && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {getTitleLabel(m.title)} {m.full_name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{m.email || 'No email'}</p>
                      </div>
                    </button>
                    <ActionMenu member={m}
                      onView={() => { setSelected(m); setModal('detail') }}
                      onEdit={() => openEdit(m)}
                      onToggle={() => handleToggleStatus(m)}
                      onDelete={() => { setSelected(m); setModal('delete') }}
                    />
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400 shrink-0">Dept</span>
                      <DepartmentBadge value={m.department} />
                    </div>
                    {m.vin_id && (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-400 shrink-0">VIN</span>
                        <code className="font-mono text-[10px] font-bold truncate" style={{ color: accent }}>{m.vin_id}</code>
                      </div>
                    )}
                    {m.phone && (
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-400 shrink-0">Phone</span>
                        <span className="text-[10px] font-semibold text-slate-600 truncate">{m.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={() => { setSelected(m); setModal('detail') }}
                        className="text-[11px] font-semibold hover:underline flex items-center gap-0.5"
                        style={{ color: accent }}
                      >
                        View profile <ChevronRight className="w-3 h-3" />
                      </button>
                      <StatusBadge active={m.is_active} />
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
                <DialogTitle className="text-base font-extrabold text-slate-900 leading-tight">Add New Staff</DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">Email auto-generated from name</DialogDescription>
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
                  <Field label="First Name" id="fn" required>
                    <Input id="fn" value={createForm.first_name} required
                      placeholder="First name"
                      onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                  <Field label="Middle Name" id="mn">
                    <Input id="mn" value={createForm.middle_name}
                      placeholder="Middle name"
                      onChange={(e) => setCreateForm({ ...createForm, middle_name: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                  <Field label="Last Name" id="ln" required>
                    <Input id="ln" value={createForm.last_name} required
                      placeholder="Last name"
                      onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Field label="Title" id="tt">
                    <Select value={createForm.title} onValueChange={(v) => setCreateForm({ ...createForm, title: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                        {TITLES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Gender" id="gnd">
                    <Select value={createForm.gender} onValueChange={(v) => setCreateForm({ ...createForm, gender: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                        {GENDERS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Phone" id="ph">
                    <Input id="ph" type="tel" value={createForm.phone}
                      placeholder="+234..."
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                </div>
                <Field label="Address" id="addr">
                  <Input id="addr" value={createForm.address}
                    placeholder="Home address"
                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                    className="h-10 rounded-xl border-slate-200 text-sm" />
                </Field>
              </FormSection>

              <FormSection title="Employment" icon={Briefcase} accent={accent}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Field label="Department" id="dept" required>
                    <Select value={createForm.department} onValueChange={(v) => setCreateForm({ ...createForm, department: v })}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            <div className="flex items-center gap-2">
                              <d.icon className="w-3 h-3" />
                              {d.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Date Joined" id="dj">
                    <Input id="dj" type="date" value={createForm.date_joined}
                      onChange={(e) => setCreateForm({ ...createForm, date_joined: e.target.value })}
                      className="h-10 rounded-xl border-slate-200 text-sm" />
                  </Field>
                </div>
              </FormSection>

              {/* Auto-generated info */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-blue-700 mb-0.5">Auto-generated credentials</p>
                  <code className="block text-[10px] font-mono text-blue-600 truncate">
                    {(createForm.first_name || 'first').toLowerCase().replace(/[^a-z]/g, '') || 'first'}
                    .{(createForm.last_name || 'last').toLowerCase().replace(/[^a-z]/g, '') || 'last'}
                    @vincollins.edu.ng
                  </code>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 sm:px-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur shrink-0
                            flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
              <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}
                className="h-10 rounded-xl text-sm font-semibold flex-1 sm:flex-initial">Cancel</Button>
              <Button type="submit" disabled={isSubmitting}
                className="h-10 rounded-xl gap-2 text-white text-sm font-semibold flex-1 sm:flex-initial" style={btnStyle}>
                {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…</>
                  : <><UserPlus className="w-3.5 h-3.5" /> Add Staff</>}
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
                <DialogTitle className="text-base font-extrabold text-slate-900 leading-tight">Edit Staff</DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 truncate">
                  {selected?.full_name}
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
            <Field label="Department" id="edept">
              <Select value={editForm.department || ''} onValueChange={(v) => setEditForm({ ...editForm, department: v })}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      <div className="flex items-center gap-2">
                        <d.icon className="w-3 h-3" />
                        {d.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Field label="Title" id="ett">
                <Select value={editForm.title || ''} onValueChange={(v) => setEditForm({ ...editForm, title: v })}>
                  <SelectTrigger className="h-10 rounded-xl border-slate-200 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white border-slate-200 shadow-xl">
                    {TITLES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Phone" id="eph">
              <Input id="eph" value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="h-10 rounded-xl border-slate-200 text-sm" />
            </Field>
            <Field label="Address" id="ead">
              <Input id="ead" value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
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
          {selected && (
            <>
              <div className="p-4 pb-14 sm:p-5 sm:pb-12 relative overflow-hidden shrink-0"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

                <DialogHeader className="relative space-y-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Staff Profile</span>
                      <DialogTitle className="text-base sm:text-lg font-extrabold text-white mt-0.5 truncate">
                        {getTitleLabel(selected.title)} {selected.full_name}
                      </DialogTitle>
                      <DialogDescription className="sr-only">Profile details for {selected.full_name}</DialogDescription>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-white capitalize">
                          <Sparkles className="w-2.5 h-2.5" /> {selected.role || 'Staff'}
                        </span>
                        <StatusBadge active={selected.is_active} />
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
                  <StaffAvatar member={selected} size="lg" />
                </div>

                <div className="pt-12 px-4 pb-5 sm:px-5 space-y-3">
                  {/* Meta tiles */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-xl p-2 sm:p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 truncate">VIN</span>
                      </div>
                      <p className="text-[11px] font-bold font-mono truncate" style={{ color: accent }}>
                        {selected.vin_id || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 sm:p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 truncate">Dept</span>
                      </div>
                      <p className="text-[11px] font-bold truncate text-slate-700">
                        {getDepartment(selected.department).label}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2 sm:p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <UserCog className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 truncate">Role</span>
                      </div>
                      <p className="text-[11px] font-bold truncate text-slate-700 capitalize">
                        {selected.role || 'Staff'}
                      </p>
                    </div>
                  </div>

                  {/* Info sections */}
                  {[
                    {
                      title: 'Contact', icon: Mail, rows: [
                        { label: 'Email', value: selected.email || 'Not provided', icon: Mail },
                        selected.phone && { label: 'Phone', value: selected.phone, icon: Phone },
                        selected.address && { label: 'Address', value: selected.address, icon: MapPin },
                      ].filter(Boolean) as { label: string; value: string; icon?: React.ElementType }[]
                    },
                    {
                      title: 'Employment', icon: Calendar, rows: [
                        { label: 'Joined', value: new Date(selected.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                        selected.gender && { label: 'Gender', value: selected.gender },
                        selected.title && { label: 'Title', value: getTitleLabel(selected.title) },
                      ].filter(Boolean) as { label: string; value: string }[]
                    },
                  ].map((section: any) => (
                    <div key={section.title} className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <section.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{section.title}</p>
                      </div>
                      <div className="space-y-2">
                        {section.rows.map((row: any) => (
                          <div key={row.label} className="flex items-start justify-between gap-3 text-xs">
                            <span className="text-slate-400 shrink-0 flex items-center gap-1 capitalize">
                              {row.icon && <row.icon className="w-3 h-3" />}
                              {row.label}
                            </span>
                            <span className="text-slate-700 font-semibold text-right break-all min-w-0 capitalize">{row.value}</span>
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
                <Button onClick={() => { closeModal(); openEdit(selected) }}
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
            <AlertDialogTitle className="text-base font-extrabold text-slate-800">Delete staff?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 break-words">
              This will permanently delete{' '}
              <span className="font-bold text-slate-700">{selected?.full_name}</span>{' '}
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