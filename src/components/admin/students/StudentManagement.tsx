/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Search,
  UserPlus,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  Trash2,
  Edit2,
  Eye,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Fingerprint,
  MoreVertical,
  LayoutGrid,
  List,
  Filter,
  X,
  UserCog,
  Shield,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  password_changed?: boolean
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

// ── Helpers ────────────────────────────────────────────────────────────────────

const getInitials = (name: string) => {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

// Deterministic hue from name → colourful, consistent avatar backgrounds
const getAvatarGradient = (name: string) => {
  const gradients = [
    'from-rose-500 to-pink-600',
    'from-orange-500 to-amber-600',
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-cyan-600',
    'from-violet-500 to-purple-600',
    'from-indigo-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
    'from-lime-500 to-green-600',
  ]
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

const getClassCode = (className?: string) => {
  if (!className) return '?'
  const found = CLASSES.find((c) => c.name === className)
  return found?.code || className.slice(0, 2).toUpperCase()
}

// ── Props ──
interface StudentManagementProps {
  students: Student[]
  onRefresh: () => Promise<void>
  loading?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export function StudentManagement({
  students,
  onRefresh,
  loading = false,
}: StudentManagementProps) {
  const { user } = useUser()
  const roleColors = getRoleColors(user?.role)
  const accent = roleColors.primary

  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Student>>({})

  const [formData, setFormData] = useState<StudentFormData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    class: '',
    phone: '',
    address: '',
    admission_year: new Date().getFullYear().toString(),
    admission_number: '',
    gender: '',
    date_of_birth: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    email: '',
  })

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.vin_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_number?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesClass = classFilter === 'all' || student.class === classFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && student.is_active) ||
        (statusFilter === 'inactive' && !student.is_active)

      return matchesSearch && matchesClass && matchesStatus
    })
  }, [students, searchQuery, classFilter, statusFilter])

  const activeFilterCount =
    (classFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const studentData = {
        ...formData,
        role: 'student',
        full_name: `${formData.first_name} ${
          formData.middle_name ? formData.middle_name + ' ' : ''
        }${formData.last_name}`.trim(),
        display_name: `${formData.first_name} ${
          formData.middle_name ? formData.middle_name + ' ' : ''
        }${formData.last_name}`.trim(),
      }
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create student')

      toast.success(`Student enrolled! VIN: ${data.credentials?.vin_id || 'N/A'}`)
      setIsCreateModalOpen(false)
      resetForm()
      await onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create student')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setEditFormData({
      full_name: student.full_name,
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      class: student.class,
      gender: student.gender,
      phone: student.phone,
      address: student.address,
      guardian_name: student.guardian_name,
      guardian_phone: student.guardian_phone,
      guardian_email: student.guardian_email,
      admission_number: student.admission_number,
      is_active: student.is_active,
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedStudent) return
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedStudent.id, ...editFormData }),
      })
      const result = await response.json()
      if (!response.ok || !result.success)
        throw new Error(result.error || 'Failed to update student')
      toast.success('Student updated successfully!')
      setIsEditModalOpen(false)
      setSelectedStudent(null)
      await onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update student')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (student: Student) => {
    setSelectedStudent(student)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `/api/admin/users?id=${selectedStudent.id}`,
        { method: 'DELETE' }
      )
      const result = await response.json()
      if (!response.ok || !result.success)
        throw new Error(result.error || 'Failed to delete student')
      toast.success('Student deleted successfully!')
      setIsDeleteDialogOpen(false)
      setSelectedStudent(null)
      await onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete student')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (student: Student) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, is_active: !student.is_active }),
      })
      const result = await response.json()
      if (!response.ok || !result.success)
        throw new Error(result.error || 'Failed to update status')
      toast.success(
        `Student ${!student.is_active ? 'activated' : 'deactivated'}!`
      )
      await onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      class: '',
      phone: '',
      address: '',
      admission_year: new Date().getFullYear().toString(),
      admission_number: '',
      gender: '',
      date_of_birth: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      email: '',
    })
  }

  const clearFilters = () => {
    setClassFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
  }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {/* ── Filter / Search Toolbar ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4"
      >
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, VIN ID, admission number, or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl border-slate-200 focus-visible:ring-1"
              style={
                { ['--tw-ring-color' as any]: accent } as React.CSSProperties
              }
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-3 h-3 text-slate-500" />
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl border-slate-200">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <SelectValue placeholder="Class" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                <SelectItem value="all">All Classes</SelectItem>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls.id} value={cls.name}>
                    {cls.name} ({cls.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36 h-10 rounded-xl border-slate-200">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 rounded-xl gap-1 text-slate-500 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}

            {/* View mode toggle */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 h-10">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'px-3 h-9 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold',
                  viewMode === 'table'
                    ? 'bg-white shadow-sm text-slate-800'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  'px-3 h-9 rounded-lg flex items-center gap-1.5 transition-all text-xs font-semibold',
                  viewMode === 'cards'
                    ? 'bg-white shadow-sm text-slate-800'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-700">
              {filteredStudents.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-slate-700">{students.length}</span>{' '}
            students
          </p>
          {activeFilterCount > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{
                backgroundColor: `${accent}15`,
                color: accent,
              }}
            >
              <Filter className="w-2.5 h-2.5" />
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center"
          >
            <Loader2
              className="w-8 h-8 animate-spin mx-auto mb-3"
              style={{ color: accent }}
            />
            <p className="text-sm font-semibold text-slate-600">
              Loading students…
            </p>
          </motion.div>
        ) : filteredStudents.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${accent}15` }}
            >
              <GraduationCap className="w-8 h-8" style={{ color: accent }} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No students found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery || activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : "Click 'Add Student' to enrol your first pupil."}
            </p>
            {(searchQuery || activeFilterCount > 0) && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="rounded-xl gap-2"
              >
                <X className="w-4 h-4" />
                Clear filters
              </Button>
            )}
          </motion.div>
        ) : viewMode === 'table' ? (
          // ── TABLE VIEW ────────────────────────────────────────────────
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Student
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hidden md:table-cell">
                      Admission No.
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                      VIN ID
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                      Contact
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Class
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                    <th className="text-right p-4 w-[60px]" />
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Name + avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 shadow-sm">
                            <AvatarImage
                              src={student.photo_url || undefined}
                            />
                            <AvatarFallback
                              className={cn(
                                'text-white font-bold text-xs bg-gradient-to-br',
                                getAvatarGradient(student.full_name || 'A')
                              )}
                            >
                              {getInitials(
                                student.full_name || student.display_name || ''
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                              {student.full_name ||
                                student.display_name ||
                                'Unknown'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {student.gender && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {student.gender === 'male'
                                    ? '♂'
                                    : student.gender === 'female'
                                    ? '♀'
                                    : '⚧'}{' '}
                                  {student.gender}
                                </span>
                              )}
                              <span className="text-xs text-slate-400 md:hidden truncate">
                                · {student.admission_number || 'No adm.#'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Admission # */}
                      <td className="p-4 hidden md:table-cell">
                        <code className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-semibold">
                          {student.admission_number || 'N/A'}
                        </code>
                      </td>

                      {/* VIN ID */}
                      <td className="p-4 hidden lg:table-cell">
                        <code
                          className="text-xs font-mono px-2 py-1 rounded-md font-bold"
                          style={{
                            backgroundColor: `${accent}12`,
                            color: accent,
                          }}
                        >
                          {student.vin_id || 'N/A'}
                        </code>
                      </td>

                      {/* Contact */}
                      <td className="p-4 hidden lg:table-cell">
                        <div className="text-xs text-slate-600 truncate max-w-[180px]">
                          {student.email || 'No email'}
                        </div>
                        {student.phone && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {student.phone}
                          </div>
                        )}
                      </td>

                      {/* Class */}
                      <td className="p-4">
                        {student.class ? (
                          <div className="inline-flex items-center gap-2">
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-[10px] text-white shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                              }}
                            >
                              {getClassCode(student.class)}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 hidden xl:inline">
                              {student.class}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {student.is_active !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg opacity-60 group-hover:opacity-100 hover:bg-slate-200"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl bg-white border border-slate-200 shadow-xl"
                          >
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedStudent(student)
                                setIsDetailModalOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(student)}
                              className="cursor-pointer"
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit student
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(student)}
                              className="cursor-pointer"
                            >
                              {student.is_active !== false ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(student)}
                              className="text-red-600 cursor-pointer focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          // ── CARD VIEW ─────────────────────────────────────────────────
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Top gradient */}
                <div
                  className={cn(
                    'h-1.5 w-full bg-gradient-to-r',
                    getAvatarGradient(student.full_name || 'A')
                  )}
                />

                <div className="p-5">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 shadow-md">
                        <AvatarImage src={student.photo_url || undefined} />
                        <AvatarFallback
                          className={cn(
                            'text-white font-bold text-sm bg-gradient-to-br',
                            getAvatarGradient(student.full_name || 'A')
                          )}
                        >
                          {getInitials(student.full_name || '')}
                        </AvatarFallback>
                      </Avatar>
                      {student.is_active !== false && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {student.full_name || 'Unknown'}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {student.email}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-lg opacity-40 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        className="w-44 rounded-xl bg-white border border-slate-200 shadow-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsDetailModalOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(student)}>
                          <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(student)}
                        >
                          {student.is_active !== false ? (
                            <>
                              <UserX className="mr-2 h-3.5 w-3.5" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(student)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Details grid */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    {student.class && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Class</span>
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-md flex items-center justify-center font-extrabold text-[9px] text-white"
                            style={{
                              background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
                            }}
                          >
                            {getClassCode(student.class)}
                          </span>
                          <span className="text-slate-700 font-semibold">
                            {student.class}
                          </span>
                        </span>
                      </div>
                    )}
                    {student.admission_number && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">
                          Adm. No.
                        </span>
                        <code className="font-mono font-bold text-slate-700 text-[10px]">
                          {student.admission_number}
                        </code>
                      </div>
                    )}
                    {student.vin_id && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">VIN</span>
                        <code
                          className="font-mono font-bold text-[10px]"
                          style={{ color: accent }}
                        >
                          {student.vin_id}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Bottom actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedStudent(student)
                        setIsDetailModalOpen(true)
                      }}
                      className="text-xs font-semibold hover:underline transition-colors"
                      style={{ color: accent }}
                    >
                      View profile →
                    </button>
                    {student.is_active !== false ? (
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                        ● Active
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        ○ Inactive
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Create Student Modal                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col bg-white">
          {/* Header */}
          <div
            className="p-6 pb-5 relative overflow-hidden shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}
          >
            <div
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: accent }}
            />
            <DialogHeader className="relative">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  }}
                >
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 text-left">
                    Enrol New Student
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5 text-left">
                    Fill in the details below to register a new pupil
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleCreateStudent} className="flex flex-col overflow-hidden flex-1">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <FormSection title="Personal Information" icon={Users} accent={accent}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="First Name *" htmlFor="first_name">
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </FormField>
                  <FormField label="Middle Name" htmlFor="middle_name">
                    <Input
                      id="middle_name"
                      value={formData.middle_name}
                      onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </FormField>
                  <FormField label="Last Name *" htmlFor="last_name">
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Gender" htmlFor="gender">
                    <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                      <SelectTrigger className="rounded-xl border-slate-200 h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Date of Birth" htmlFor="dob">
                    <Input
                      id="dob"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </FormField>
                  <FormField label="Phone" htmlFor="phone">
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </FormField>
                </div>
                <FormField label="Address" htmlFor="address">
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="rounded-xl border-slate-200 h-10"
                  />
                </FormField>
              </FormSection>

              <FormSection title="Academic Information" icon={GraduationCap} accent={accent}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField label="Class *" htmlFor="class">
                    <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })} required>
                      <SelectTrigger className="rounded-xl border-slate-200 h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                        {CLASSES.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Admission Year" htmlFor="year">
                    <Input
                      id="year"
                      value={formData.admission_year}
                      onChange={(e) => setFormData({ ...formData, admission_year: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </FormField>
                  <FormField label="Admission No." htmlFor="adm_no">
                    <Input
                      id="adm_no"
                      value={formData.admission_number}
                      onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                      placeholder="Auto-generated"
                      className="rounded-xl border-slate-200 h-10 font-mono"
                    />
                  </FormField>
                </div>
              </FormSection>

              <FormSection title="Guardian Information" icon={UserCog} accent={accent}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Guardian Name" htmlFor="g_name">
                    <Input
                      id="g_name"
                      value={formData.guardian_name}
                      onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </FormField>
                  <FormField label="Guardian Phone" htmlFor="g_phone">
                    <Input
                      id="g_phone"
                      value={formData.guardian_phone}
                      onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </FormField>
                </div>
                <FormField label="Guardian Email" htmlFor="g_email">
                  <Input
                    id="g_email"
                    type="email"
                    value={formData.guardian_email}
                    onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                    className="rounded-xl border-slate-200 h-10"
                  />
                </FormField>
              </FormSection>

              <FormSection title="Account Details" icon={Shield} accent={accent}>
                <FormField
                  label="Student Email"
                  htmlFor="email"
                  helper="This email will be used for the student's login account"
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-slate-200 h-10"
                  />
                </FormField>
              </FormSection>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-xl border-slate-200 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl gap-2 text-white shadow-md font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  boxShadow: `0 8px 20px -6px ${accent}55`,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Edit Student Modal                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col bg-white">
          <div
            className="p-6 pb-5 relative overflow-hidden shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}15, ${accent}05)` }}
          >
            <div
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: accent }}
            />
            <DialogHeader className="relative">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  }}
                >
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-extrabold text-slate-900 text-left">
                    Edit Student
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5 text-left">
                    Update {selectedStudent?.full_name || 'this student'}&apos;s information
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" htmlFor="e_first">
                <Input
                  id="e_first"
                  value={editFormData.first_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  className="rounded-xl border-slate-200 h-10"
                />
              </FormField>
              <FormField label="Last Name" htmlFor="e_last">
                <Input
                  id="e_last"
                  value={editFormData.last_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  className="rounded-xl border-slate-200 h-10"
                />
              </FormField>
            </div>
            <FormField label="Full Name" htmlFor="e_full">
              <Input
                id="e_full"
                value={editFormData.full_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                className="rounded-xl border-slate-200 h-10"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Class" htmlFor="e_class">
                <Select
                  value={editFormData.class || ''}
                  onValueChange={(v) => setEditFormData({ ...editFormData, class: v })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 h-10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                    {CLASSES.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Gender" htmlFor="e_gender">
                <Select
                  value={editFormData.gender || ''}
                  onValueChange={(v) => setEditFormData({ ...editFormData, gender: v })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 h-10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="Phone" htmlFor="e_phone">
              <Input
                id="e_phone"
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="rounded-xl border-slate-200 h-10"
              />
            </FormField>
            <FormField label="Address" htmlFor="e_address">
              <Input
                id="e_address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                className="rounded-xl border-slate-200 h-10"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Guardian Name" htmlFor="e_gname">
                <Input
                  id="e_gname"
                  value={editFormData.guardian_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, guardian_name: e.target.value })}
                  className="rounded-xl border-slate-200 h-10"
                />
              </FormField>
              <FormField label="Guardian Phone" htmlFor="e_gphone">
                <Input
                  id="e_gphone"
                  value={editFormData.guardian_phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, guardian_phone: e.target.value })}
                  className="rounded-xl border-slate-200 h-10"
                />
              </FormField>
            </div>
            <FormField label="Guardian Email" htmlFor="e_gemail">
              <Input
                id="e_gemail"
                type="email"
                value={editFormData.guardian_email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, guardian_email: e.target.value })}
                className="rounded-xl border-slate-200 h-10"
              />
            </FormField>
            <FormField label="Admission Number" htmlFor="e_adm">
              <Input
                id="e_adm"
                value={editFormData.admission_number || ''}
                onChange={(e) => setEditFormData({ ...editFormData, admission_number: e.target.value })}
                className="rounded-xl border-slate-200 h-10 font-mono"
              />
            </FormField>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border-slate-200 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="rounded-xl gap-2 text-white shadow-md font-semibold"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Detail Modal                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh] flex flex-col bg-white">
          {selectedStudent && (
            <>
              {/* Hero */}
              <div
                className="p-6 pb-16 relative overflow-hidden shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                }}
              >
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-white/5 blur-2xl" />

                <DialogHeader className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        Student Profile
                      </span>
                      <DialogTitle className="text-xl font-extrabold text-white mt-1 text-left">
                        {selectedStudent.full_name}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
                          <Sparkles className="w-2.5 h-2.5" />
                          Student
                        </span>
                        {selectedStudent.is_active !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-400/20 backdrop-blur-sm border border-emerald-300/30 text-[10px] font-bold text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-bold text-white/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              {/* Avatar overlap */}
              <div className="relative flex-1 overflow-y-auto">
                <div className="absolute -top-10 left-6">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-2xl">
                    <AvatarImage src={selectedStudent.photo_url || undefined} />
                    <AvatarFallback
                      className={cn(
                        'text-white font-extrabold text-xl bg-gradient-to-br',
                        getAvatarGradient(selectedStudent.full_name)
                      )}
                    >
                      {getInitials(selectedStudent.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="pt-14 px-6 pb-6 space-y-5">
                  {/* Meta row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MetaTile
                      icon={Fingerprint}
                      label="Admission No."
                      value={selectedStudent.admission_number || 'N/A'}
                    />
                    <MetaTile
                      icon={Shield}
                      label="VIN ID"
                      value={selectedStudent.vin_id || 'N/A'}
                      accent={accent}
                    />
                    <MetaTile
                      icon={GraduationCap}
                      label="Class"
                      value={selectedStudent.class || 'Not assigned'}
                    />
                  </div>

                  {/* Contact */}
                  <SectionBlock title="Contact" icon={Mail}>
                    <DetailRow label="Email" value={selectedStudent.email} icon={Mail} />
                    {selectedStudent.phone && (
                      <DetailRow label="Phone" value={selectedStudent.phone} icon={Phone} />
                    )}
                    {selectedStudent.address && (
                      <DetailRow label="Address" value={selectedStudent.address} icon={MapPin} />
                    )}
                  </SectionBlock>

                  {/* Guardian */}
                  {selectedStudent.guardian_name && (
                    <SectionBlock title="Guardian" icon={UserCog}>
                      <DetailRow label="Name" value={selectedStudent.guardian_name} />
                      {selectedStudent.guardian_phone && (
                        <DetailRow
                          label="Phone"
                          value={selectedStudent.guardian_phone}
                          icon={Phone}
                        />
                      )}
                      {selectedStudent.guardian_email && (
                        <DetailRow
                          label="Email"
                          value={selectedStudent.guardian_email}
                          icon={Mail}
                        />
                      )}
                    </SectionBlock>
                  )}

                  {/* Meta */}
                  <SectionBlock title="Enrolment" icon={Calendar}>
                    <DetailRow
                      label="Joined"
                      value={new Date(selectedStudent.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    />
                    {selectedStudent.admission_year && (
                      <DetailRow
                        label="Admission Year"
                        value={selectedStudent.admission_year}
                      />
                    )}
                    {selectedStudent.gender && (
                      <DetailRow label="Gender" value={selectedStudent.gender} />
                    )}
                  </SectionBlock>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex-row justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="rounded-xl border-slate-200 font-semibold"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    handleEdit(selectedStudent)
                  }}
                  className="rounded-xl gap-2 text-white shadow-md font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Student
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Delete Confirmation                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-0 shadow-2xl bg-white">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <AlertDialogTitle className="text-lg font-extrabold text-slate-800">
              Delete student?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This will permanently delete
              {selectedStudent && (
                <span className="font-bold text-slate-700">
                  {' '}
                  {selectedStudent.full_name}
                </span>
              )}{' '}
              and all associated data including reports, attendance, and results.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200 font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-600 hover:bg-red-700 font-semibold gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Yes, delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════════

function FormSection({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string
  icon: React.ElementType
  accent: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accent}15` }}
        >
          <Icon className="w-3 h-3" style={{ color: accent }} />
        </div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          {title}
        </p>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function FormField({
  label,
  htmlFor,
  helper,
  children,
}: {
  label: string
  htmlFor: string
  helper?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700">
        {label}
      </Label>
      {children}
      {helper && <p className="text-[10px] text-slate-400 mt-1">{helper}</p>}
    </div>
  )
}

function MetaTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-slate-400" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <p
        className="text-xs font-bold font-mono truncate"
        style={{ color: accent || '#1e293b' }}
      >
        {value}
      </p>
    </div>
  )
}

function SectionBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          {title}
        </p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: React.ElementType
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <span className="text-slate-700 font-semibold text-right break-all">
        {value}
      </span>
    </div>
  )
}