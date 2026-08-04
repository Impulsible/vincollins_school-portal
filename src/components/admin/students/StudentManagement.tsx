/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
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
  Download,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Student, StudentFormData } from './types'

// ── GPU isolation style ──
const cardIsolationStyle = {
  WebkitTransform: 'translateZ(0)' as const,
  transform: 'translateZ(0)' as const,
  contain: 'paint' as const,
}

// ── Props ──
interface StudentManagementProps {
  students: Student[]
  onRefresh: () => Promise<void>
  loading?: boolean
}

// ── Main Component ──
export function StudentManagement({ students, onRefresh, loading = false }: StudentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Form state
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
    email: ''
  })

  // Stats
  const stats = useMemo(() => {
    const byClass: Record<string, number> = {}
    const active = students.filter(s => s.is_active).length
    const inactive = students.filter(s => !s.is_active).length
    
    students.forEach(s => {
      if (s.class) byClass[s.class] = (byClass[s.class] || 0) + 1
    })
    
    return {
      total: students.length,
      active,
      inactive,
      byClass,
      classes: Object.keys(byClass).sort()
    }
  }, [students])

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.vin_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesClass = classFilter === 'all' || student.class === classFilter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && student.is_active) ||
        (statusFilter === 'inactive' && !student.is_active)
      
      return matchesSearch && matchesClass && matchesStatus
    })
  }, [students, searchQuery, classFilter, statusFilter])

  // Create student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'student' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student')
      }

      toast.success(`Student created! VIN: ${data.credentials.vin_id}`)
      setIsCreateModalOpen(false)
      resetForm()
      await onRefresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create student')
    } finally {
      setIsSubmitting(false)
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
      email: ''
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  // Get role badge
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'teacher': return 'accent'
      case 'staff': return 'secondary'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[#0A2472]">Students</h1>
          <p className="text-sm text-slate-500">Manage all students in the school</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-slate-200"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0A2472] hover:bg-[#1A3A8A]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'text-[#0A2472]' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-emerald-600' },
          { label: 'Inactive', value: stats.inactive, icon: UserX, color: 'text-red-500' },
          { label: 'Classes', value: stats.classes.length, icon: GraduationCap, color: 'text-violet-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-[#0A2472]/5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0A2472]">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, VIN ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {stats.classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>VIN ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0A2472]" />
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono text-sm font-medium text-[#0A2472]">
                        {student.vin_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-800">{student.full_name}</p>
                          <p className="text-xs text-slate-400">{student.display_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{student.email}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-[#0A2472]/10 text-[#0A2472] border-0">
                          {student.class || 'Not Assigned'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.guardian_name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.is_active ? 'success' : 'secondary'}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedStudent(student)
                              setIsDetailModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Student Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[#0A2472]">
              Add New Student
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateStudent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="col-span-2">
                <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">
                  Personal Information
                </h3>
              </div>
              
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* Student Information */}
              <div className="col-span-2 mt-4">
                <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">
                  Student Information
                </h3>
              </div>
              
              <div>
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="e.g., Primary 5A"
                />
              </div>
              
              <div>
                <Label htmlFor="admission_year">Admission Year</Label>
                <Input
                  id="admission_year"
                  value={formData.admission_year}
                  onChange={(e) => setFormData({ ...formData, admission_year: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="admission_number">Admission Number</Label>
                <Input
                  id="admission_number"
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                />
              </div>

              {/* Guardian Information */}
              <div className="col-span-2 mt-4">
                <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">
                  Guardian Information
                </h3>
              </div>
              
              <div>
                <Label htmlFor="guardian_name">Guardian Name</Label>
                <Input
                  id="guardian_name"
                  value={formData.guardian_name}
                  onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="guardian_phone">Guardian Phone</Label>
                <Input
                  id="guardian_phone"
                  value={formData.guardian_phone}
                  onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="guardian_email">Guardian Email</Label>
                <Input
                  id="guardian_email"
                  type="email"
                  value={formData.guardian_email}
                  onChange={(e) => setFormData({ ...formData, guardian_email: e.target.value })}
                />
              </div>

              {/* Account Information */}
              <div className="col-span-2 mt-4">
                <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">
                  Account Information
                </h3>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="email">Custom Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Leave blank to auto-generate"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">
                  If left blank, email will be auto-generated
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#0A2472] hover:bg-[#1A3A8A]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Add Student'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-[#0A2472]">
              Student Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#0A2472]/5 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-[#0A2472] flex items-center justify-center text-white text-2xl font-bold">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-display text-[#0A2472]">{selectedStudent.full_name}</h3>
                  <p className="text-slate-500 text-sm">{selectedStudent.vin_id}</p>
                </div>
                <Badge className="ml-auto bg-[#0A2472]">Student</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{selectedStudent.email}</span>
                </div>
                {selectedStudent.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                )}
                {selectedStudent.class && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span>Class: {selectedStudent.class}</span>
                  </div>
                )}
                {selectedStudent.admission_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">Admission: {selectedStudent.admission_number}</Badge>
                  </div>
                )}
                {selectedStudent.address && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{selectedStudent.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Joined: {new Date(selectedStudent.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedStudent.is_active ? 'success' : 'secondary'}>
                    {selectedStudent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {selectedStudent.guardian_name && (
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">
                    Guardian Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Name:</span>
                      <span>{selectedStudent.guardian_name}</span>
                    </div>
                    {selectedStudent.guardian_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Phone:</span>
                        <span>{selectedStudent.guardian_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}