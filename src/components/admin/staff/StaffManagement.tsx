/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/staff/StaffManagement.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Search,
  UserPlus,
  Briefcase,
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
  MoreVertical,
  LayoutGrid,
  List,
  Filter,
  X,
  UserCog,
  Shield,
  Sparkles,
  BookOpen,
  Laptop,
  Microscope,
  Calculator,
  Palette,
  Music,
  Languages,
  Landmark,
  Dumbbell,
  Copy,
  Check,
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
  password_changed?: boolean
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
  { value: 'technology', label: 'Technology', icon: Laptop },
  { value: 'science', label: 'Science', icon: Microscope },
  { value: 'mathematics', label: 'Mathematics', icon: Calculator },
  { value: 'art', label: 'Art', icon: Palette },
  { value: 'music', label: 'Music', icon: Music },
  { value: 'languages', label: 'Languages', icon: Languages },
  { value: 'social-studies', label: 'Social Studies', icon: Landmark },
  { value: 'physical-education', label: 'Physical Education', icon: Dumbbell },
  { value: 'business', label: 'Business', icon: Briefcase },
  { value: 'general', label: 'General Studies', icon: BookOpen },
]

const TITLES = [
  { value: 'mr', label: 'Mr.' },
  { value: 'mrs', label: 'Mrs.' },
  { value: 'ms', label: 'Ms.' },
  { value: 'dr', label: 'Dr.' },
  { value: 'prof', label: 'Prof.' },
]

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

const getInitials = (name: string) => {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

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

const generateEmail = (firstName: string, lastName: string): string => {
  const sanitizedFirst = firstName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'user'
  const sanitizedLast = lastName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 15) || 'account'
  return `${sanitizedFirst}.${sanitizedLast}@vincollins.edu.ng`
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

export default function StaffManagement({
  staff,
  onRefresh,
  loading = false,
}: StaffManagementProps) {
  const { user } = useUser()
  const roleColors = getRoleColors(user?.role)
  const accent = roleColors?.primary || '#0A2472'

  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Staff>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const [formData, setFormData] = useState<StaffFormData>({
    first_name: '',
    middle_name: '',
    last_name: '',
    department: 'general',
    phone: '',
    address: '',
    date_joined: new Date().toISOString().split('T')[0],
    gender: '',
    title: '',
  })

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const fullName = member.full_name || `${member.first_name || ''} ${member.last_name || ''}`
      const matchesSearch =
        fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.vin_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && member.is_active) ||
        (statusFilter === 'inactive' && !member.is_active)

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [staff, searchQuery, departmentFilter, statusFilter])

  const activeFilterCount =
    (departmentFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const generatedEmail = generateEmail(formData.first_name, formData.last_name)

      const payload: any = {
        first_name: formData.first_name,
        middle_name: formData.middle_name || '',
        last_name: formData.last_name,
        department: formData.department,
        role: 'staff',
        email: generatedEmail,
      }

      if (formData.phone && formData.phone.trim()) payload.phone = formData.phone
      if (formData.address && formData.address.trim()) payload.address = formData.address
      if (formData.gender && formData.gender.trim()) payload.gender = formData.gender
      if (formData.title && formData.title.trim()) payload.title = formData.title
      if (formData.date_joined) payload.join_year = new Date(formData.date_joined).getFullYear().toString()

      console.log('📤 Sending payload:', JSON.stringify(payload, null, 2))

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const data = await response.json()
      console.log('📥 Full response:', data)
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create staff')
      }

      const emailCred = data.credentials?.email || data.user?.email || generatedEmail
      const passwordCred = data.credentials?.password || data.user?.vin_id || 'Check email for password'
      const vinId = data.user?.vin_id || data.credentials?.vin_id || 'N/A'
      
      // Show success message with credentials in a nice format
      toast.success(
        `✅ Staff Added Successfully!\n\n📧 Email: ${emailCred}\n🔑 Password: ${passwordCred}\n🆔 VIN: ${vinId}`,
        {
          duration: 15000,
          style: {
            whiteSpace: 'pre-line',
            maxWidth: '500px',
          },
        }
      )
      
      // Also show individual toasts for visibility
      toast.info(`📧 Email: ${emailCred}`, { duration: 5000 })
      toast.info(`🔑 Password: ${passwordCred}`, { duration: 5000 })
      
      setIsCreateModalOpen(false)
      resetForm()
      
      // Refresh the staff list
      await onRefresh()
      
    } catch (error: any) {
      console.error('❌ Error creating staff:', error)
      toast.error(error.message || 'Failed to create staff')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
    toast.success(`Copied ${label} to clipboard!`)
  }

  const handleEdit = (member: Staff) => {
    setSelectedStaff(member)
    setEditFormData({
      full_name: member.full_name,
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      department: member.department,
      gender: member.gender,
      phone: member.phone,
      address: member.address,
      title: member.title,
      is_active: member.is_active,
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedStaff) return
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedStaff.id, ...editFormData }),
      })
      const result = await response.json()
      if (!response.ok || !result.success)
        throw new Error(result.error || 'Failed to update staff')
      toast.success('Staff updated successfully!')
      setIsEditModalOpen(false)
      setSelectedStaff(null)
      await onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update staff')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (member: Staff) => {
    setSelectedStaff(member)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedStaff) return
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `/api/admin/users?id=${selectedStaff.id}`,
        { method: 'DELETE' }
      )
      const result = await response.json()
      if (!response.ok || !result.success)
        throw new Error(result.error || 'Failed to delete staff')
      toast.success('Staff deleted successfully!')
      setIsDeleteDialogOpen(false)
      setSelectedStaff(null)
      await onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete staff')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (member: Staff) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member.id, is_active: !member.is_active }),
      })
      const result = await response.json()
      if (!response.ok || !result.success)
        throw new Error(result.error || 'Failed to update status')
      toast.success(`Staff ${!member.is_active ? 'activated' : 'deactivated'}!`)
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
      department: 'general',
      phone: '',
      address: '',
      date_joined: new Date().toISOString().split('T')[0],
      gender: '',
      title: '',
    })
  }

  const clearFilters = () => {
    setDepartmentFilter('all')
    setStatusFilter('all')
    setSearchQuery('')
  }

  // ── Get Department Badge ──
  const getDepartmentBadge = (department: string) => {
    const deptColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      technology: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Laptop },
      science: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Microscope },
      mathematics: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Calculator },
      art: { bg: 'bg-pink-100', text: 'text-pink-700', icon: Palette },
      music: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Music },
      languages: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Languages },
      'social-studies': { bg: 'bg-orange-100', text: 'text-orange-700', icon: Landmark },
      'physical-education': { bg: 'bg-red-100', text: 'text-red-700', icon: Dumbbell },
      business: { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: Briefcase },
      general: { bg: 'bg-slate-100', text: 'text-slate-700', icon: BookOpen },
    }
    const colors = deptColors[department] || deptColors.general
    const Icon = colors.icon
    
    return (
      <Badge className={`${colors.bg} ${colors.text} hover:${colors.bg} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {department.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </Badge>
    )
  }

  // ── Get Title Display ──
  const getTitleDisplay = (title: string) => {
    const found = TITLES.find(t => t.value === title)
    return found ? found.label : ''
  }

  // ── Stats ──
  const stats = {
    total: staff.length,
    active: staff.filter(s => s.is_active).length,
    inactive: staff.filter(s => !s.is_active).length,
    departments: DEPARTMENTS.map(dept => ({
      ...dept,
      count: staff.filter(s => s.department === dept.value).length,
    })).filter(d => d.count > 0),
  }

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {/* ── Header with Add Staff button ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[#0A2472]">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all staff members across departments</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#0A2472] hover:bg-[#1A3A8A] rounded-xl gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0A2472]/5">
                <Users className="w-4 h-4 text-[#0A2472]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2472]">{stats.total}</p>
                <p className="text-xs text-slate-500">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <UserX className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.inactive}</p>
                <p className="text-xs text-slate-500">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Briefcase className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.departments.length}</p>
                <p className="text-xs text-slate-500">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Department Stats ───────────────────────────────────────────────── */}
      {stats.departments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.departments.map((dept) => {
            const Icon = dept.icon
            return (
              <Badge key={dept.value} variant="outline" className="px-3 py-1 text-sm gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {dept.label}: {dept.count}
              </Badge>
            )
          })}
        </div>
      )}

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
              placeholder="Search by name, VIN ID, or email…"
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
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl border-slate-200">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <SelectValue placeholder="Department" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    <div className="flex items-center gap-2">
                      <dept.icon className="w-3.5 h-3.5" />
                      {dept.label}
                    </div>
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
              {filteredStaff.length}
            </span>{' '}
            of{' '}
            <span className="font-bold text-slate-700">{staff.length}</span>{' '}
            staff members
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
              Loading staff…
            </p>
          </motion.div>
        ) : filteredStaff.length === 0 ? (
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
              <Briefcase className="w-8 h-8" style={{ color: accent }} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No staff found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery || activeFilterCount > 0
                ? 'Try adjusting your search or filters.'
                : "Click 'Add Staff' to onboard your first team member."}
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
                      Staff
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                      VIN ID
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hidden lg:table-cell">
                      Contact
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Department
                    </th>
                    <th className="text-left p-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                    <th className="text-right p-4 w-[60px]" />
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member, idx) => (
                    <motion.tr
                      key={member.id}
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
                              src={member.photo_url || undefined}
                            />
                            <AvatarFallback
                              className={cn(
                                'text-white font-bold text-xs bg-gradient-to-br',
                                getAvatarGradient(member.full_name || 'A')
                              )}
                            >
                              {getInitials(
                                member.full_name || member.display_name || ''
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm leading-tight truncate">
                              {member.title && getTitleDisplay(member.title)} {member.full_name ||
                                member.display_name ||
                                'Unknown'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-slate-400 truncate">
                                {member.email}
                              </span>
                            </div>
                          </div>
                        </div>
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
                          {member.vin_id || 'N/A'}
                        </code>
                      </td>

                      {/* Contact */}
                      <td className="p-4 hidden lg:table-cell">
                        <div className="text-xs text-slate-600 truncate max-w-[180px]">
                          {member.email || 'No email'}
                        </div>
                        {member.phone && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {member.phone}
                          </div>
                        )}
                      </td>

                      {/* Department */}
                      <td className="p-4">
                        {getDepartmentBadge(member.department || 'general')}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {member.is_active !== false ? (
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
                                setSelectedStaff(member)
                                setIsDetailModalOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(member)}
                              className="cursor-pointer"
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit staff
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(member)}
                              className="cursor-pointer"
                            >
                              {member.is_active !== false ? (
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
                              onClick={() => handleDelete(member)}
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
            {filteredStaff.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Top gradient */}
                <div
                  className={cn(
                    'h-1.5 w-full bg-gradient-to-r',
                    getAvatarGradient(member.full_name || 'A')
                  )}
                />

                <div className="p-5">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 shadow-md">
                        <AvatarImage src={member.photo_url || undefined} />
                        <AvatarFallback
                          className={cn(
                            'text-white font-bold text-sm bg-gradient-to-br',
                            getAvatarGradient(member.full_name || 'A')
                          )}
                        >
                          {getInitials(member.full_name || '')}
                        </AvatarFallback>
                      </Avatar>
                      {member.is_active !== false && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate leading-tight">
                        {member.title && getTitleDisplay(member.title)} {member.full_name || 'Unknown'}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {member.email}
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
                            setSelectedStaff(member)
                            setIsDetailModalOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-3.5 w-3.5" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(member)}>
                          <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(member)}
                        >
                          {member.is_active !== false ? (
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
                          onClick={() => handleDelete(member)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Details grid */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Department</span>
                      <span>{getDepartmentBadge(member.department || 'general')}</span>
                    </div>
                    {member.vin_id && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">VIN</span>
                        <code
                          className="font-mono font-bold text-[10px]"
                          style={{ color: accent }}
                        >
                          {member.vin_id}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Bottom actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedStaff(member)
                        setIsDetailModalOpen(true)
                      }}
                      className="text-xs font-semibold hover:underline transition-colors"
                      style={{ color: accent }}
                    >
                      View profile →
                    </button>
                    {member.is_active !== false ? (
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
      {/* Create Staff Modal                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col bg-white">
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
                    Add New Staff
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5 text-left">
                    Email will be auto-generated from first and last name
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <form onSubmit={handleCreateStaff} className="flex flex-col overflow-hidden flex-1">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Required Fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accent}15` }}
                  >
                    <Users className="w-3 h-3" style={{ color: accent }} />
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                    Required Information
                  </p>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 h-10"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Middle Name
                    </Label>
                    <Input
                      value={formData.middle_name}
                      onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                      placeholder="Enter middle name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                      className="rounded-xl border-slate-200 h-10"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(v) => setFormData({ ...formData, department: v })}
                    required
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 h-10">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          <div className="flex items-center gap-2">
                            <dept.icon className="w-3.5 h-3.5" />
                            {dept.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accent}10` }}
                  >
                    <UserCog className="w-3 h-3" style={{ color: accent }} />
                  </div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Additional Information (Optional)
                  </p>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Title</Label>
                    <Select
                      value={formData.title}
                      onValueChange={(v) => setFormData({ ...formData, title: v })}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 h-10">
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                        {TITLES.map((title) => (
                          <SelectItem key={title.value} value={title.value}>
                            {title.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(v) => setFormData({ ...formData, gender: v })}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 h-10">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                        {GENDERS.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Date Joined</Label>
                    <Input
                      type="date"
                      value={formData.date_joined}
                      onChange={(e) => setFormData({ ...formData, date_joined: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold text-slate-700">Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="rounded-xl border-slate-200 h-10"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>

              {/* Auto-generated info note */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>📧 Auto-generated:</strong> Email will be created as{' '}
                  <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                    {formData.first_name || 'first'}.{formData.last_name || 'last'}@vincollins.edu.ng
                  </code>
                  {' '}and VIN ID will be auto-generated by the system.
                </p>
              </div>
            </div>

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
                    Adding…
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add Staff
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Edit Staff Modal                                                  */}
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
                    Edit Staff
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5 text-left">
                    Update {selectedStaff?.full_name || 'this staff member'}&apos;s information
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">First Name</Label>
                <Input
                  value={editFormData.first_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                  className="rounded-xl border-slate-200 h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Last Name</Label>
                <Input
                  value={editFormData.last_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                  className="rounded-xl border-slate-200 h-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Full Name</Label>
              <Input
                value={editFormData.full_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                className="rounded-xl border-slate-200 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Department</Label>
              <Select
                value={editFormData.department || ''}
                onValueChange={(v) => setEditFormData({ ...editFormData, department: v })}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-10">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      <div className="flex items-center gap-2">
                        <dept.icon className="w-3.5 h-3.5" />
                        {dept.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Title</Label>
                <Select
                  value={editFormData.title || ''}
                  onValueChange={(v) => setEditFormData({ ...editFormData, title: v })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 h-10">
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                    {TITLES.map((title) => (
                      <SelectItem key={title.value} value={title.value}>
                        {title.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Gender</Label>
                <Select
                  value={editFormData.gender || ''}
                  onValueChange={(v) => setEditFormData({ ...editFormData, gender: v })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 h-10">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl">
                    {GENDERS.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Phone</Label>
              <Input
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="rounded-xl border-slate-200 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Address</Label>
              <Input
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                className="rounded-xl border-slate-200 h-10"
              />
            </div>
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
          {selectedStaff && (
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
                        Staff Profile
                      </span>
                      <DialogTitle className="text-xl font-extrabold text-white mt-1 text-left">
                        {selectedStaff.title && getTitleDisplay(selectedStaff.title)} {selectedStaff.full_name}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
                          <Sparkles className="w-2.5 h-2.5" />
                          {selectedStaff.role || 'Staff'}
                        </span>
                        {selectedStaff.is_active !== false ? (
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
                    <AvatarImage src={selectedStaff.photo_url || undefined} />
                    <AvatarFallback
                      className={cn(
                        'text-white font-extrabold text-xl bg-gradient-to-br',
                        getAvatarGradient(selectedStaff.full_name)
                      )}
                    >
                      {getInitials(selectedStaff.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="pt-14 px-6 pb-6 space-y-5">
                  {/* Meta row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Shield className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">VIN ID</span>
                      </div>
                      <p className="text-xs font-bold font-mono truncate" style={{ color: accent }}>
                        {selectedStaff.vin_id || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Department</span>
                      </div>
                      <p className="text-xs font-bold truncate">
                        {getDepartmentBadge(selectedStaff.department || 'general')}
                      </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Email</span>
                      </div>
                      <p className="text-xs font-bold truncate text-slate-700">
                        {selectedStaff.email}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  {(selectedStaff.phone || selectedStaff.address) && (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Contact</p>
                      </div>
                      <div className="space-y-2">
                        {selectedStaff.phone && (
                          <div className="flex items-start justify-between gap-3 text-xs">
                            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
                              <Phone className="w-3 h-3" />
                              Phone
                            </span>
                            <span className="text-slate-700 font-semibold text-right">{selectedStaff.phone}</span>
                          </div>
                        )}
                        {selectedStaff.address && (
                          <div className="flex items-start justify-between gap-3 text-xs">
                            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5">
                              <MapPin className="w-3 h-3" />
                              Address
                            </span>
                            <span className="text-slate-700 font-semibold text-right">{selectedStaff.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Details</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3 text-xs">
                        <span className="text-slate-400 font-medium">Joined</span>
                        <span className="text-slate-700 font-semibold text-right">
                          {new Date(selectedStaff.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {selectedStaff.gender && (
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <span className="text-slate-400 font-medium">Gender</span>
                          <span className="text-slate-700 font-semibold text-right capitalize">{selectedStaff.gender}</span>
                        </div>
                      )}
                    </div>
                  </div>
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
                    handleEdit(selectedStaff)
                  }}
                  className="rounded-xl gap-2 text-white shadow-md font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Staff
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
              Delete staff member?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This will permanently delete
              {selectedStaff && (
                <span className="font-bold text-slate-700">
                  {' '}{selectedStaff.full_name}
                </span>
              )}{' '}
              and all associated data. This action cannot be undone.
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