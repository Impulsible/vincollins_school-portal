/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/admin/students/StudentManagement.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Users,
  GraduationCap,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ──
interface Student {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  date_of_birth?: string
  grade?: string
  class?: string
  enrollment_date?: string
  status: 'active' | 'inactive' | 'graduated'
  parent_name?: string
  parent_email?: string
  parent_phone?: string
}

interface StudentManagementProps {
  initialStudents?: Student[]
}

// ── Student Management Component ──
export default function StudentManagement({ initialStudents = [] }: StudentManagementProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  // ── Form State ──
  const [formData, setFormData] = useState<Partial<Student>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    grade: '',
    class: '',
    status: 'active',
    parent_name: '',
    parent_email: '',
    parent_phone: '',
  })

  // ── Filter Students ──
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // ── Handlers ──
  const handleAddStudent = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      grade: '',
      class: '',
      status: 'active',
      parent_name: '',
      parent_email: '',
      parent_phone: '',
    })
    setSelectedStudent(null)
    setIsDialogOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setFormData(student)
    setSelectedStudent(student)
    setIsDialogOpen(true)
  }

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (studentToDelete) {
      setStudents(students.filter(s => s.id !== studentToDelete.id))
      toast.success(`${studentToDelete.first_name} ${studentToDelete.last_name} has been deleted.`)
      setIsDeleteDialogOpen(false)
      setStudentToDelete(null)
    }
  }

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error('Please fill in all required fields.')
      return
    }

    if (selectedStudent) {
      // Edit existing student
      setStudents(students.map(s => 
        s.id === selectedStudent.id ? { ...s, ...formData } as Student : s
      ))
      toast.success(`Student updated successfully.`)
    } else {
      // Add new student
      const newStudent: Student = {
        id: `STU-${Date.now()}`,
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        date_of_birth: formData.date_of_birth || '',
        grade: formData.grade || '',
        class: formData.class || '',
        status: (formData.status as 'active' | 'inactive' | 'graduated') || 'active',
        parent_name: formData.parent_name || '',
        parent_email: formData.parent_email || '',
        parent_phone: formData.parent_phone || '',
        enrollment_date: new Date().toISOString().split('T')[0],
      }
      setStudents([newStudent, ...students])
      toast.success(`Student added successfully.`)
    }
    setIsDialogOpen(false)
  }

  // ── Get Status Badge Color ──
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
      case 'inactive':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Inactive</Badge>
      case 'graduated':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Graduated</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{status}</Badge>
    }
  }

  // ── Stats ──
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    graduated: students.filter(s => s.status === 'graduated').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display text-[#0A2472]">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all students across the school</p>
        </div>
        <Button 
          onClick={handleAddStudent}
          className="bg-[#0A2472] hover:bg-[#1A3A8A]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0A2472]/5">
                <Users className="w-4 h-4 text-[#0A2472]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0A2472]">{stats.total}</p>
                <p className="text-xs text-slate-500">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
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
                <Users className="w-4 h-4 text-amber-600" />
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
              <div className="p-2 rounded-lg bg-blue-50">
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.graduated}</p>
                <p className="text-xs text-slate-500">Graduated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9F7F4]">
                <TableHead className="font-semibold text-[#0A2472]">Student</TableHead>
                <TableHead className="font-semibold text-[#0A2472]">Email</TableHead>
                <TableHead className="font-semibold text-[#0A2472]">Grade</TableHead>
                <TableHead className="font-semibold text-[#0A2472]">Class</TableHead>
                <TableHead className="font-semibold text-[#0A2472]">Status</TableHead>
                <TableHead className="font-semibold text-[#0A2472] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No students found. Click "Add Student" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-[#F9F7F4]/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-slate-400">ID: {student.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-sm">{student.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.grade || '-'}</TableCell>
                    <TableCell>{student.class || '-'}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => handleEditStudent(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeleteStudent(student)}
                        >
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
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-[#0A2472]">
              {selectedStudent ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First Name *</label>
              <Input
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Last Name *</label>
              <Input
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email *</label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Grade</label>
              <Input
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., Grade 10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Class</label>
              <Input
                value={formData.class || ''}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="e.g., Class A"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <Input
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select
                value={formData.status || 'active'}
                onValueChange={(value: 'active' | 'inactive' | 'graduated') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Parent Name</label>
              <Input
                value={formData.parent_name || ''}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                placeholder="Enter parent name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Parent Email</label>
              <Input
                type="email"
                value={formData.parent_email || ''}
                onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                placeholder="Enter parent email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Parent Phone</label>
              <Input
                value={formData.parent_phone || ''}
                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                placeholder="Enter parent phone"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#0A2472] hover:bg-[#1A3A8A]">
              {selectedStudent ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-display text-[#0A2472]">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-800">
              {studentToDelete?.first_name} {studentToDelete?.last_name}
            </span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}