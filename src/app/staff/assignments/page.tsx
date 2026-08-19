/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Plus, FileText, Users, Calendar, Clock,
  Loader2, CheckCircle2, Trash2,
  Eye, Send, BookOpen,
  Pencil, Paperclip, FileIcon,
  X, Upload, Save, RefreshCw, Search
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Assignment {
  id: string
  title: string
  subject: string
  description?: string
  instructions?: string
  class_name: string
  due_date?: string
  status: 'draft' | 'published'
  created_at: string
  teacher_id: string
  teacher_name?: string
  attachments?: Attachment[]
  submission_count?: number
}

interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

interface ClassOption {
  id: string
  name: string
  studentCount: number
}

interface SubjectOption {
  id: string
  name: string
}

// ── Primary Subjects (from your existing constant) ──────────────────────────

const PRIMARY_SUBJECTS = [
  { id: 'english', name: 'English', category: 'Core' },
  { id: 'mathematics', name: 'Mathematics', category: 'Core' },
  { id: 'basic_science', name: 'Basic Science', category: 'Core' },
  { id: 'social_studies', name: 'Social Studies', category: 'Core' },
  { id: 'phonics', name: 'Phonics', category: 'Core' },
  { id: 'yoruba', name: 'Yoruba', category: 'Languages' },
  { id: 'civic_education', name: 'Civic Education', category: 'Core' },
  { id: 'creative_arts', name: 'Creative Arts', category: 'Arts' },
  { id: 'agriculture', name: 'Agriculture', category: 'Sciences' },
  { id: 'computer_education', name: 'Computer Education', category: 'Sciences' },
  { id: 'crs', name: 'Christian Religious Studies', category: 'Core' },
  { id: 'french', name: 'French', category: 'Languages' },
  { id: 'quantitative_reasoning', name: 'Quantitative Reasoning', category: 'Core' },
  { id: 'verbal_reasoning', name: 'Verbal Reasoning', category: 'Core' },
  { id: 'music', name: 'Music', category: 'Arts' },
  { id: 'handwriting', name: 'Handwriting', category: 'Core' },
  { id: 'literature', name: 'Literature', category: 'Arts' },
  { id: 'vocational_aptitude', name: 'Vocational Aptitude', category: 'Vocational' },
  { id: 'history', name: 'History', category: 'Core' },
  { id: 'security_education', name: 'Security Education', category: 'Core' },
  { id: 'home_economics', name: 'Home Economics', category: 'Vocational' },
  { id: 'phe', name: 'Physical and Health Education', category: 'Core' },
] as const

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading assignments...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your classes</p>
      </div>
    </div>
  )
}

// ── Assignment Card ────────────────────────────────────────────────────────────

function AssignmentCard({
  assignment,
  onView,
  onEdit,
  onDelete,
  onPublish,
}: {
  assignment: Assignment
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPublish: (id: string) => void
}) {
  const isPublished = assignment.status === 'published'
  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
  
  return (
    <Card className={cn(
      "border-0 shadow-sm hover:shadow-md transition-all overflow-hidden",
      isPublished ? "border-l-4 border-emerald-500" : "border-l-4 border-amber-400"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {assignment.title}
              {isPublished && (
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              )}
              {!isPublished && (
                <Badge variant="outline" className="text-amber-600 border-amber-200 text-[10px]">
                  <Clock className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )}
              {isPublished && isOverdue && (
                <Badge variant="destructive" className="text-[10px]">
                  Overdue
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                {assignment.subject}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {assignment.class_name}
              </span>
              {assignment.due_date && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className={cn(
                    "flex items-center gap-1",
                    isOverdue && isPublished ? "text-rose-500 font-medium" : "text-slate-400"
                  )}>
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(assignment.due_date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px] bg-slate-100">
              {assignment.submission_count || 0} submissions
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-slate-600 line-clamp-2">
          {assignment.description || 'No description provided.'}
        </p>
        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {assignment.attachments.slice(0, 3).map((file) => (
              <Badge key={file.id} variant="outline" className="text-[10px] bg-slate-50">
                <Paperclip className="h-3 w-3 mr-1" />
                {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
              </Badge>
            ))}
            {assignment.attachments.length > 3 && (
              <Badge variant="outline" className="text-[10px] bg-slate-50">
                +{assignment.attachments.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t border-slate-100 flex flex-wrap justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(assignment.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-blue-600"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(assignment.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-amber-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(assignment.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
        
        {!isPublished && (
          <Button
            size="sm"
            onClick={() => onPublish(assignment.id)}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
          >
            <Send className="h-3.5 w-3.5" />
            Publish
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// ── Create/Edit Assignment Modal ─────────────────────────────────────────────

function AssignmentModal({
  open,
  onClose,
  assignment,
  classes,
  subjects,
  teacherId,
  onSave,
}: {
  open: boolean
  onClose: () => void
  assignment?: Assignment | null
  classes: ClassOption[]
  subjects: SubjectOption[]
  teacherId: string
  onSave: (data: any) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [class_name, setClassName] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (assignment) {
        setTitle(assignment.title || '')
        setSubject(assignment.subject || '')
        setClassName(assignment.class_name || '')
        setDescription(assignment.description || '')
        setInstructions(assignment.instructions || '')
        setDueDate(assignment.due_date ? assignment.due_date.split('T')[0] : '')
        setAttachments(assignment.attachments || [])
      } else {
        setTitle('')
        setSubject('')
        setClassName('')
        setDescription('')
        setInstructions('')
        setDueDate('')
        setAttachments([])
      }
    }
  }, [open, assignment])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${teacherId}-${Date.now()}.${fileExt}`
      const filePath = `assignments/${teacherId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('assignments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('assignments')
        .getPublicUrl(filePath)

      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type
      }

      setAttachments(prev => [...prev, newAttachment])
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!subject) {
      toast.error('Please select a subject')
      return
    }
    if (!class_name) {
      toast.error('Please select a class')
      return
    }

    setSaving(true)
    try {
      await onSave({
        id: assignment?.id,
        title: title.trim(),
        subject,
        class_name,
        description: description.trim() || null,
        instructions: instructions.trim() || null,
        due_date: dueDate || null,
        attachments,
        status: assignment?.status || 'draft',
        teacher_id: teacherId,
      })
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {assignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Assignment Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Homework: Fractions"
              className="focus-visible:ring-blue-500"
            />
          </div>

          {/* Subject & Class */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Subject <span className="text-rose-500">*</span>
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="focus-visible:ring-blue-500">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Target Class <span className="text-rose-500">*</span>
              </label>
              <Select value={class_name} onValueChange={setClassName}>
                <SelectTrigger className="focus-visible:ring-blue-500">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name} ({c.studentCount} pupils)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Due Date (optional)
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="focus-visible:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the assignment..."
              className="min-h-[80px] focus-visible:ring-blue-500"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Instructions for Pupils
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions for pupils..."
              className="min-h-[80px] focus-visible:ring-blue-500"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Attachments
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploading}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload File
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="text-xs text-slate-400">
                PDF, Word, Excel, Images up to 10MB
              </span>
            </div>

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(file.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {assignment ? 'Update' : 'Create'} Assignment
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StaffAssignmentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null)
  
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ─── Fetch Classes ──────────────────────────────────────────────────────────

  const fetchClasses = useCallback(async () => {
    if (!user?.id) return []
    try {
      const { data: teacherClasses, error } = await supabase
        .from('teacher_classes')
        .select('class_name')
        .eq('teacher_id', user.id)

      if (error) throw error

      const classNames = teacherClasses?.map((tc: any) => tc.class_name) || []
      
      // Get student counts for each class
      const { data: students, error: studentError } = await supabase
        .from('profiles')
        .select('class')
        .in('role', ['student', 'pupil'])
        .in('class', classNames)
        .eq('is_active', true)

      if (studentError) throw studentError

      const classCounts: Record<string, number> = {}
      students?.forEach((s: any) => {
        if (s.class) {
          classCounts[s.class] = (classCounts[s.class] || 0) + 1
        }
      })

      const result = classNames.map((name: string) => ({
        id: name,
        name,
        studentCount: classCounts[name] || 0,
      }))

      setClasses(result)
      return result
    } catch (error) {
      console.error('Error fetching classes:', error)
      return []
    }
  }, [user?.id])

  // ─── Fetch Subjects ─────────────────────────────────────────────────────────

  const fetchSubjects = useCallback(async () => {
    const subjectOptions: SubjectOption[] = PRIMARY_SUBJECTS.map((sub) => ({
      id: sub.id,
      name: sub.name,
    }))
    setSubjects(subjectOptions)
    return subjectOptions
  }, [])

  // ─── Fetch Assignments ──────────────────────────────────────────────────────

  const fetchAssignments = useCallback(async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          teacher:profiles!teacher_id(full_name)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch submission counts for each assignment
      const assignmentsWithCounts = await Promise.all(
        (data || []).map(async (assignment: any) => {
          const { count } = await supabase
            .from('assignment_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.id)

          return {
            ...assignment,
            teacher_name: assignment.teacher?.full_name || 'Unknown',
            submission_count: count || 0,
          }
        })
      )

      setAssignments(assignmentsWithCounts)
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load assignments')
    } finally {
      setRefreshing(false)
    }
  }, [user?.id])

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      const loadAll = async () => {
        setLoading(true)
        await Promise.all([
          fetchClasses(),
          fetchSubjects(),
          fetchAssignments(),
        ])
        setLoading(false)
      }
      loadAll()
    }
  }, [authLoading, user?.id, fetchClasses, fetchSubjects, fetchAssignments])

  // ─── Save Assignment ──────────────────────────────────────────────────────

  const handleSaveAssignment = async (data: any) => {
    if (!user?.id) return

    try {
      if (data.id) {
        // Update existing assignment
        const { error } = await supabase
          .from('assignments')
          .update({
            title: data.title,
            subject: data.subject,
            class_name: data.class_name,
            description: data.description,
            instructions: data.instructions,
            due_date: data.due_date,
            attachments: data.attachments,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id)

        if (error) throw error
        toast.success('Assignment updated successfully')
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('assignments')
          .insert({
            title: data.title,
            subject: data.subject,
            class_name: data.class_name,
            description: data.description,
            instructions: data.instructions,
            due_date: data.due_date,
            attachments: data.attachments,
            teacher_id: user.id,
            status: data.status || 'draft',
          })

        if (error) throw error
        toast.success('Assignment created successfully')
      }

      await fetchAssignments()
    } catch (error) {
      console.error('Error saving assignment:', error)
      throw error
    }
  }

  // ─── Publish Assignment ────────────────────────────────────────────────────

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Assignment published! Pupils can now view it.')
      await fetchAssignments()
    } catch (error) {
      console.error('Error publishing assignment:', error)
      toast.error('Failed to publish assignment')
    }
  }

  // ─── Delete Assignment ─────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Assignment deleted')
      await fetchAssignments()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('Failed to delete assignment')
    }
  }

  // ─── Filtered Assignments ──────────────────────────────────────────────────

  const filteredAssignments = assignments.filter((assignment) => {
    // Status filter
    if (filterStatus !== 'all' && assignment.status !== filterStatus) {
      return false
    }
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        assignment.title.toLowerCase().includes(q) ||
        assignment.subject.toLowerCase().includes(q) ||
        assignment.class_name.toLowerCase().includes(q)
      )
    }
    return true
  })

  // ─── Loading States ──────────────────────────────────────────────────────

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-none">Assignments</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                  Create, manage, and publish assignments
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingAssignment(null)
                setModalOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-9 text-sm"
            >
              <Plus className="h-4 w-4" />
              New Assignment
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* ── Filters Bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assignments..."
              className="pl-9 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className={cn(
                "h-8 text-xs",
                filterStatus === 'all' ? "bg-slate-800 text-white" : "text-slate-600"
              )}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('draft')}
              className={cn(
                "h-8 text-xs",
                filterStatus === 'draft' ? "bg-amber-600 text-white" : "text-slate-600"
              )}
            >
              Drafts
            </Button>
            <Button
              variant={filterStatus === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('published')}
              className={cn(
                "h-8 text-xs",
                filterStatus === 'published' ? "bg-emerald-600 text-white" : "text-slate-600"
              )}
            >
              Published
            </Button>
          </div>
        </div>

        {/* ── Stats Bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Total</p>
            <p className="text-lg font-bold text-slate-800">{assignments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Published</p>
            <p className="text-lg font-bold text-emerald-600">
              {assignments.filter(a => a.status === 'published').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Drafts</p>
            <p className="text-lg font-bold text-amber-600">
              {assignments.filter(a => a.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Total Submissions</p>
            <p className="text-lg font-bold text-blue-600">
              {assignments.reduce((sum, a) => sum + (a.submission_count || 0), 0)}
            </p>
          </div>
        </div>

        {/* ── Assignments Grid ───────────────────────────────────────────── */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No assignments found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No assignments match your search criteria.'
                : filterStatus !== 'all'
                ? `No ${filterStatus} assignments yet.`
                : 'Create your first assignment to get started.'}
            </p>
            <Button
              onClick={() => {
                setEditingAssignment(null)
                setModalOpen(true)
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onView={(id) => {
                  const found = assignments.find(a => a.id === id)
                  setViewingAssignment(found || null)
                }}
                onEdit={(id) => {
                  const found = assignments.find(a => a.id === id)
                  setEditingAssignment(found || null)
                  setModalOpen(true)
                }}
                onDelete={handleDelete}
                onPublish={handlePublish}
              />
            ))}
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 mt-6 border-t border-slate-200/50">
          <p>Vincollins Schools Staff • Assignment Management</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>

        {/* ── Refresh indicator ──────────────────────────────────────────── */}
        {refreshing && (
          <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-xl text-xs font-medium">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
            Refreshing...
          </div>
        )}
      </div>

      {/* ── Assignment Modal ─────────────────────────────────────────────── */}
      <AssignmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingAssignment(null)
        }}
        assignment={editingAssignment}
        classes={classes}
        subjects={subjects}
        teacherId={user?.id || ''}
        onSave={handleSaveAssignment}
      />

      {/* ── View Assignment Modal ────────────────────────────────────────── */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {viewingAssignment.title}
              </h2>
              <button
                onClick={() => setViewingAssignment(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700">
                  {viewingAssignment.subject}
                </Badge>
                <Badge className="bg-purple-100 text-purple-700">
                  {viewingAssignment.class_name}
                </Badge>
                {viewingAssignment.status === 'published' ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                )}
              </div>

              {viewingAssignment.description && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Description</p>
                  <p className="text-sm text-slate-600">{viewingAssignment.description}</p>
                </div>
              )}

              {viewingAssignment.instructions && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Instructions</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{viewingAssignment.instructions}</p>
                </div>
              )}

              {viewingAssignment.due_date && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Due Date</p>
                  <p className="text-sm text-slate-600">
                    {new Date(viewingAssignment.due_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {viewingAssignment.attachments && viewingAssignment.attachments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Attachments</p>
                  <div className="space-y-1.5">
                    {viewingAssignment.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                      >
                        <Paperclip className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-slate-700">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setViewingAssignment(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setViewingAssignment(null)
                  const found = assignments.find(a => a.id === viewingAssignment.id)
                  setEditingAssignment(found || null)
                  setModalOpen(true)
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}