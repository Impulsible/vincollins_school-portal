/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  School,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Shield,
  UserPlus,
  BookOpen,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Teacher {
  id: string
  full_name: string
  display_name?: string
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  photo_url?: string
  avatar_url?: string
  role: string
  class?: string
  class_arm?: string
  department?: string
  is_active: boolean
  created_at: string
}

interface TeacherClass {
  id: string
  teacher_id: string
  class_name: string
  class_arm?: string
  assigned_at: string
  teacher?: Teacher
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
          <div className="h-4 w-64 bg-slate-200 animate-pulse rounded mt-1" />
        </div>
        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded my-2" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'green' | 'amber' | 'violet' | 'rose'
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    violet: 'bg-violet-50 border-violet-200 text-violet-600',
    rose: 'bg-rose-50 border-rose-200 text-rose-600',
  }

  return (
    <div className={cn('rounded-2xl p-4 border shadow-sm', colors[color])}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/50">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs font-medium text-slate-500">{title}</p>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminTeacherClassesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [classToDelete, setClassToDelete] = useState<TeacherClass | null>(null)
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)

  // ─── Form State ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    teacher_id: '',
    class_name: '',
    class_arm: '',
  })

  // ─── New Class Input (for custom class entry) ──────────────────────────────
  const [newClassName, setNewClassName] = useState('')
  const [showCustomClassInput, setShowCustomClassInput] = useState(false)

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalTeachers = teachers.length
    const totalAssignments = teacherClasses.length
    const uniqueClasses = new Set(teacherClasses.map(tc => tc.class_name)).size
    const unassignedTeachers = teachers.filter(t => 
      !teacherClasses.some(tc => tc.teacher_id === t.id)
    ).length

    return {
      totalTeachers,
      totalAssignments,
      uniqueClasses,
      unassignedTeachers,
    }
  }, [teachers, teacherClasses])

  // ─── Fetch Teachers ──────────────────────────────────────────────────────────
  const fetchTeachers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['teacher', 'staff'])
        .order('full_name', { ascending: true })

      if (error) {
        console.error('Error fetching teachers:', error)
        toast.error('Failed to load teachers')
        return []
      }

      return (data || []) as Teacher[]
    } catch (error) {
      console.error('Error:', error)
      return []
    }
  }, [])

  // ─── Fetch Teacher Classes ──────────────────────────────────────────────────
  const fetchTeacherClasses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_classes')
        .select(`
          *,
          teacher:profiles!teacher_classes_teacher_id_fkey(
            id,
            full_name,
            display_name,
            first_name,
            last_name,
            email,
            photo_url,
            avatar_url,
            role
          )
        `)
        .order('assigned_at', { ascending: false })

      if (error) {
        console.error('Error fetching teacher classes:', error)
        toast.error('Failed to load teacher classes')
        return []
      }

      return (data || []) as TeacherClass[]
    } catch (error) {
      console.error('Error:', error)
      return []
    }
  }, [])

  // ─── Fetch Available Classes ────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    try {
      setIsLoadingClasses(true)
      
      // Try to get classes from profiles where role is student or pupil
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('class')
        .in('role', ['student', 'pupil'])
        .not('class', 'is', null)

      if (studentError) {
        console.error('Error fetching student classes:', studentError)
        // If there's an error, try to get from teacher_classes
        const { data: classData, error: classError } = await supabase
          .from('teacher_classes')
          .select('class_name')
          .order('class_name', { ascending: true })

        if (!classError && classData) {
          const uniqueClasses = [...new Set(classData.map((c: any) => c.class_name))]
          return uniqueClasses.sort()
        }
        return []
      }

      // Extract unique classes from student profiles
      const uniqueClasses = studentData 
        ? [...new Set(studentData.map((d: any) => d.class).filter(Boolean))]
        : []

      // Also get classes from teacher_classes that might not have students yet
      const { data: classData, error: classError } = await supabase
        .from('teacher_classes')
        .select('class_name')
        .order('class_name', { ascending: true })

      if (!classError && classData) {
        const existingClasses = classData.map((c: any) => c.class_name)
        existingClasses.forEach((cls: string) => {
          if (!uniqueClasses.includes(cls)) {
            uniqueClasses.push(cls)
          }
        })
      }

      return uniqueClasses.sort()
    } catch (error) {
      console.error('Error fetching classes:', error)
      return []
    } finally {
      setIsLoadingClasses(false)
    }
  }, [])

  // ─── Fetch All Data ─────────────────────────────────────────────────────────
  const fetchAllData = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true)
    else setLoading(true)

    try {
      const [teachersData, classesData, teacherClassesData] = await Promise.all([
        fetchTeachers(),
        fetchClasses(),
        fetchTeacherClasses(),
      ])

      setTeachers(teachersData)
      setClasses(classesData)
      setTeacherClasses(teacherClassesData)

      if (showToast) toast.success('Data refreshed!')
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [fetchTeachers, fetchClasses, fetchTeacherClasses])

  // ─── Initial Load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchAllData()
    }
  }, [authLoading, user, fetchAllData])

  // ─── Assign Class to Teacher ────────────────────────────────────────────────
  const handleAssignClass = async () => {
    if (!formData.teacher_id) {
      toast.error('Please select a teacher')
      return
    }

    // Check if class_name is provided either from select or custom input
    const className = formData.class_name || newClassName
    if (!className) {
      toast.error('Please select or enter a class name')
      return
    }

    // Check if this teacher already has this class
    const existing = teacherClasses.some(
      tc => tc.teacher_id === formData.teacher_id && 
            tc.class_name === className &&
            tc.class_arm === (formData.class_arm || null)
    )

    if (existing) {
      toast.error('This teacher is already assigned to this class')
      return
    }

    try {
      const { data, error } = await supabase
        .from('teacher_classes')
        .insert({
          teacher_id: formData.teacher_id,
          class_name: className,
          class_arm: formData.class_arm || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error assigning class:', error)
        toast.error('Failed to assign class')
        return
      }

      toast.success(`Class assigned successfully!`)
      setDialogOpen(false)
      setFormData({ teacher_id: '', class_name: '', class_arm: '' })
      setNewClassName('')
      setShowCustomClassInput(false)
      await fetchAllData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to assign class')
    }
  }

  // ─── Remove Class Assignment ────────────────────────────────────────────────
  const handleRemoveClass = async () => {
    if (!classToDelete) return

    try {
      const { error } = await supabase
        .from('teacher_classes')
        .delete()
        .eq('id', classToDelete.id)

      if (error) {
        console.error('Error removing class:', error)
        toast.error('Failed to remove class')
        return
      }

      toast.success('Class assignment removed successfully!')
      setDeleteOpen(false)
      setClassToDelete(null)
      await fetchAllData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to remove class')
    }
  }

  // ─── Filtered Teachers ──────────────────────────────────────────────────────
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers
    const query = searchQuery.toLowerCase().trim()
    return teachers.filter(t =>
      t.full_name?.toLowerCase().includes(query) ||
      t.email?.toLowerCase().includes(query) ||
      t.display_name?.toLowerCase().includes(query)
    )
  }, [teachers, searchQuery])

  // ─── Get Teacher's Classes ──────────────────────────────────────────────────
  const getTeacherClasses = (teacherId: string) => {
    return teacherClasses.filter(tc => tc.teacher_id === teacherId)
  }

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  // ─── Admin Check ────────────────────────────────────────────────────────────
  if (!user || user.role !== 'admin') {
    router.replace('/staff')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-blue-600" />
              Teacher Class Assignments
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Assign and manage classes for teachers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="border-slate-200"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Class
            </Button>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Total Assignments"
            value={stats.totalAssignments}
            icon={BookOpen}
            color="green"
          />
          <StatCard
            title="Unique Classes"
            value={stats.uniqueClasses}
            icon={School}
            color="violet"
          />
          <StatCard
            title="Unassigned Teachers"
            value={stats.unassignedTeachers}
            icon={UserX}
            color={stats.unassignedTeachers > 0 ? 'amber' : 'green'}
          />
        </div>

        {/* ── Search ───────────────────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search teachers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-200 focus:border-blue-400"
          />
        </div>

        {/* ── Teachers List ───────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[250px]">Teacher</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Assigned Classes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No teachers found</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {searchQuery ? 'Try adjusting your search' : 'Teachers will appear here'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => {
                    const assignedClasses = getTeacherClasses(teacher.id)
                    return (
                      <TableRow key={teacher.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={teacher.photo_url || teacher.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                                {teacher.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'T'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-800">{teacher.full_name}</p>
                              <p className="text-xs text-slate-500">{teacher.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 text-sm">
                            <p className="flex items-center gap-1 text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {teacher.email}
                            </p>
                            {teacher.phone && (
                              <p className="flex items-center gap-1 text-slate-600">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {teacher.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {assignedClasses.length > 0 ? (
                              assignedClasses.map((tc) => (
                                <Badge key={tc.id} variant="secondary" className="text-xs">
                                  {tc.class_name}
                                  {tc.class_arm && ` (${tc.class_arm})`}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-slate-400">No classes assigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setFormData({
                                  teacher_id: teacher.id,
                                  class_name: '',
                                  class_arm: '',
                                })
                                setSelectedTeacher(teacher)
                                setDialogOpen(true)
                              }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Assign Class
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {assignedClasses.map((tc) => (
                                <DropdownMenuItem
                                  key={tc.id}
                                  className="text-rose-600"
                                  onClick={() => {
                                    setClassToDelete(tc)
                                    setDeleteOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove {tc.class_name}{tc.class_arm ? ` (${tc.class_arm})` : ''}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools • Teacher Class Assignment Management</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>

      {/* ── Assign Class Dialog ───────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Class to Teacher</DialogTitle>
            <DialogDescription>
              Select a teacher and assign them to a class
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Teacher Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Teacher *</label>
              <Select
                value={formData.teacher_id}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, teacher_id: value }))
                  const teacher = teachers.find(t => t.id === value)
                  setSelectedTeacher(teacher || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name} {teacher.email && `(${teacher.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTeacher && (
                <p className="text-xs text-slate-500">
                  {selectedTeacher.full_name} currently has {getTeacherClasses(selectedTeacher.id).length} class(es)
                </p>
              )}
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Class *</label>
              
              {!showCustomClassInput ? (
                <div className="flex gap-2">
                  <Select
                    value={formData.class_name}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, class_name: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingClasses ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">Loading classes...</span>
                        </div>
                      ) : classes.length > 0 ? (
                        classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-center py-4 text-sm text-slate-500">
                          No classes found. Enter manually.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomClassInput(true)}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter class name (e.g., Primary 2)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCustomClassInput(false)
                      setNewClassName('')
                    }}
                    className="shrink-0"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {classes.length === 0 && !showCustomClassInput && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  No classes found. Click + to add a custom class.
                </p>
              )}
            </div>

            {/* Class Arm (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Class Arm (Optional)</label>
              <Input
                placeholder="e.g., A, B, C, or 1, 2, 3"
                value={formData.class_arm}
                onChange={(e) => setFormData(prev => ({ ...prev, class_arm: e.target.value }))}
              />
              <p className="text-xs text-slate-400">
                Leave empty if the class doesn't have arms
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false)
              setFormData({ teacher_id: '', class_name: '', class_arm: '' })
              setNewClassName('')
              setShowCustomClassInput(false)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignClass}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!formData.teacher_id || (!formData.class_name && !newClassName)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Remove Class Confirmation ────────────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Class Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{classToDelete?.class_name}</strong>
              {classToDelete?.class_arm && ` (${classToDelete.class_arm})`} from{' '}
              <strong>{classToDelete?.teacher?.full_name}</strong>?
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveClass}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}