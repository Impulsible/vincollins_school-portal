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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Plus, FileText, Users, Calendar, Clock,
  Loader2, CheckCircle2, Trash2,
  Eye, Send, BookOpen,
  Pencil, Paperclip, FileIcon,
  X, Upload, Save, Search, MoreVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const hideScrollbar = "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"

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

function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50/50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-bold text-slate-800 text-lg">Loading assignments...</p>
        <p className="text-sm text-slate-500 mt-1">Fetching your classes</p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'emerald' | 'amber' | 'purple'
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', border: 'border-amber-100' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', border: 'border-purple-100' },
  }
  const c = colorMap[color]

  return (
    <div className={cn('rounded-2xl p-4 border shrink-0 w-[140px] sm:w-auto snap-start shadow-sm', c.bg, c.border)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm', c.icon)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-xs text-slate-500 font-semibold mt-1.5">{label}</p>
    </div>
  )
}

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
    <div className={cn(
      "rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all overflow-hidden group",
      isPublished ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-400"
    )}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight line-clamp-2 mb-1.5">
              {assignment.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {isPublished ? (
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] border-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 text-[10px] border-0">
                  <Clock className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )}
              {isPublished && isOverdue && (
                <Badge className="bg-rose-100 text-rose-700 text-[10px] border-0">
                  Overdue
                </Badge>
              )}
              <Badge className="bg-slate-100 text-slate-600 text-[10px] border-0">
                {assignment.submission_count || 0} submissions
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0 text-slate-400 hover:text-slate-600">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem onClick={() => onView(assignment.id)} className="py-2">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(assignment.id)} className="py-2 text-amber-600">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {!isPublished && (
                <DropdownMenuItem onClick={() => onPublish(assignment.id)} className="py-2 text-emerald-600">
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(assignment.id)} className="py-2 text-rose-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
          {assignment.description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 mb-3">
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
            <BookOpen className="h-3 w-3" />
            {assignment.subject}
          </span>
          <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
            <Users className="h-3 w-3" />
            {assignment.class_name}
          </span>
          {assignment.due_date && (
            <span className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md",
              isOverdue && isPublished ? "bg-rose-50 text-rose-600" : "bg-slate-50"
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {assignment.attachments && assignment.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
            {assignment.attachments.slice(0, 2).map((file) => (
              <Badge key={file.id} className="text-[10px] bg-blue-50 text-blue-700 border-0 font-medium">
                <Paperclip className="h-3 w-3 mr-1" />
                {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
              </Badge>
            ))}
            {assignment.attachments.length > 2 && (
              <Badge className="text-[10px] bg-slate-100 text-slate-600 border-0">
                +{assignment.attachments.length - 2}
              </Badge>
            )}
          </div>
        )}

        {!isPublished && (
          <Button
            size="sm"
            onClick={() => onPublish(assignment.id)}
            className="w-full mt-3 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Publish Assignment
          </Button>
        )}
      </div>
    </div>
  )
}

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
        setTitle(''); setSubject(''); setClassName('')
        setDescription(''); setInstructions(''); setDueDate(''); setAttachments([])
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
      const { error: uploadError } = await supabase.storage.from('assignments').upload(filePath, file, { cacheControl: '3600', upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('assignments').getPublicUrl(filePath)
      setAttachments(prev => [...prev, { id: Date.now().toString(), name: file.name, url: publicUrl, size: file.size, type: file.type }])
      toast.success('File uploaded')
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeAttachment = (id: string) => setAttachments(prev => prev.filter(a => a.id !== id))

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Please enter a title'); return }
    if (!subject) { toast.error('Please select a subject'); return }
    if (!class_name) { toast.error('Please select a class'); return }
    setSaving(true)
    try {
      await onSave({
        id: assignment?.id,
        title: title.trim(), subject, class_name,
        description: description.trim() || null,
        instructions: instructions.trim() || null,
        due_date: dueDate || null,
        attachments,
        status: assignment?.status || 'draft',
        teacher_id: teacherId,
      })
      onClose()
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            {assignment ? 'Edit Assignment' : 'New Assignment'}
          </h2>
          <button onClick={onClose} className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Homework"
              className="h-11 text-base sm:text-sm rounded-xl focus-visible:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Subject <span className="text-rose-500">*</span>
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-11 text-base sm:text-sm rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Class <span className="text-rose-500">*</span>
              </label>
              <Select value={class_name} onValueChange={setClassName}>
                <SelectTrigger className="h-11 text-base sm:text-sm rounded-xl">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name} ({c.studentCount})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-11 text-base sm:text-sm rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the assignment..."
              className="min-h-[80px] text-base sm:text-sm rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Instructions</label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Step-by-step instructions..."
              className="min-h-[80px] text-base sm:text-sm rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Attachments</label>
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploading}
              className="w-full h-11 rounded-xl border-dashed border-slate-300 text-blue-600 hover:bg-blue-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />

            {attachments.length > 0 && (
              <div className="space-y-2 pt-2">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                      <FileIcon className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-sm truncate text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">
                        {(file.size / 1024).toFixed(0)}KB
                      </span>
                    </div>
                    <button onClick={() => removeAttachment(file.id)} className="h-7 w-7 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
          <Button variant="outline" onClick={onClose} disabled={saving} className="flex-1 sm:flex-none h-11 rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 sm:flex-none h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {assignment ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}

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

  const fetchClasses = useCallback(async () => {
    if (!user?.id) return []
    try {
      const { data: teacherClasses, error } = await supabase.from('teacher_classes').select('class_name').eq('teacher_id', user.id)
      if (error) throw error
      const classNames = teacherClasses?.map((tc: any) => tc.class_name) || []
      const { data: students, error: studentError } = await supabase.from('profiles').select('class').in('role', ['student', 'pupil']).in('class', classNames).eq('is_active', true)
      if (studentError) throw studentError
      const classCounts: Record<string, number> = {}
      students?.forEach((s: any) => { if (s.class) classCounts[s.class] = (classCounts[s.class] || 0) + 1 })
      const result = classNames.map((name: string) => ({ id: name, name, studentCount: classCounts[name] || 0 }))
      setClasses(result)
      return result
    } catch (error) { return [] }
  }, [user?.id])

  const fetchSubjects = useCallback(async () => {
    const subjectOptions: SubjectOption[] = PRIMARY_SUBJECTS.map((sub) => ({ id: sub.id, name: sub.name }))
    setSubjects(subjectOptions)
    return subjectOptions
  }, [])

  const fetchAssignments = useCallback(async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      const { data, error } = await supabase.from('assignments').select(`*, teacher:profiles!teacher_id(full_name)`).eq('teacher_id', user.id).order('created_at', { ascending: false })
      if (error) throw error
      const assignmentsWithCounts = await Promise.all((data || []).map(async (assignment: any) => {
        const { count } = await supabase.from('assignment_submissions').select('*', { count: 'exact', head: true }).eq('assignment_id', assignment.id)
        return { ...assignment, teacher_name: assignment.teacher?.full_name || 'Unknown', submission_count: count || 0 }
      }))
      setAssignments(assignmentsWithCounts)
    } catch (error) {
      toast.error('Failed to load assignments')
    } finally { setRefreshing(false) }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && user?.id) {
      const loadAll = async () => {
        setLoading(true)
        await Promise.all([fetchClasses(), fetchSubjects(), fetchAssignments()])
        setLoading(false)
      }
      loadAll()
    }
  }, [authLoading, user?.id, fetchClasses, fetchSubjects, fetchAssignments])

  const handleSaveAssignment = async (data: any) => {
    if (!user?.id) return
    try {
      if (data.id) {
        const { error } = await supabase.from('assignments').update({
          title: data.title, subject: data.subject, class_name: data.class_name,
          description: data.description, instructions: data.instructions,
          due_date: data.due_date, attachments: data.attachments,
          updated_at: new Date().toISOString(),
        }).eq('id', data.id)
        if (error) throw error
        toast.success('Assignment updated')
      } else {
        const { error } = await supabase.from('assignments').insert({
          title: data.title, subject: data.subject, class_name: data.class_name,
          description: data.description, instructions: data.instructions,
          due_date: data.due_date, attachments: data.attachments,
          teacher_id: user.id, status: data.status || 'draft',
        })
        if (error) throw error
        toast.success('Assignment created')
      }
      await fetchAssignments()
    } catch (error) { throw error }
  }

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase.from('assignments').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
      toast.success('Published! Pupils can now view it.')
      await fetchAssignments()
    } catch (error) { toast.error('Failed to publish') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id)
      if (error) throw error
      toast.success('Deleted')
      await fetchAssignments()
    } catch (error) { toast.error('Failed to delete') }
  }

  const filteredAssignments = assignments.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q) || a.class_name.toLowerCase().includes(q)
    }
    return true
  })

  if (authLoading || loading) return <LoadingScreen />
  if (!user) { router.replace('/portal'); return null }

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-20">

      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">Assignments</h1>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 leading-none truncate">
                  Create, publish & track homework
                </p>
              </div>
            </div>

            <Button
              onClick={() => { setEditingAssignment(null); setModalOpen(true) }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-3 sm:px-4 shadow-sm shrink-0 font-semibold"
            >
              <Plus className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Horizontal Scroll Stats */}
        <div className={cn("flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:pb-0", hideScrollbar)}>
          <StatCard label="Total" value={assignments.length} icon={FileText} color="blue" />
          <StatCard label="Published" value={assignments.filter(a => a.status === 'published').length} icon={CheckCircle2} color="emerald" />
          <StatCard label="Drafts" value={assignments.filter(a => a.status === 'draft').length} icon={Clock} color="amber" />
          <StatCard label="Submissions" value={assignments.reduce((sum, a) => sum + (a.submission_count || 0), 0)} icon={Users} color="purple" />
        </div>

        {/* Search & Filters */}
        <div className="sticky top-[73px] z-20 bg-slate-50/90 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:static space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, subject or class..."
              className="pl-10 h-11 text-base sm:text-sm rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500"
            />
          </div>

          <div className={cn("flex gap-2 overflow-x-auto pb-1", hideScrollbar)}>
            {([
              { v: 'all', label: 'All', color: 'bg-slate-800' },
              { v: 'draft', label: 'Drafts', color: 'bg-amber-600' },
              { v: 'published', label: 'Published', color: 'bg-emerald-600' },
            ] as const).map((item) => (
              <Button
                key={item.v}
                variant={filterStatus === item.v ? 'default' : 'outline'}
                onClick={() => setFilterStatus(item.v)}
                className={cn(
                  "h-10 rounded-xl shrink-0 font-semibold transition-colors border-slate-200",
                  filterStatus === item.v ? `${item.color} text-white border-transparent` : 'bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
          <p>{filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}</p>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-medium">No assignments found</p>
            <p className="text-sm text-slate-400 mt-1 max-w-[280px] mx-auto">
              {searchQuery ? 'Try adjusting your search.' : filterStatus !== 'all' ? `No ${filterStatus} assignments yet.` : 'Create your first assignment to get started.'}
            </p>
            <Button onClick={() => { setEditingAssignment(null); setModalOpen(true) }} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onView={(id) => { const found = assignments.find(a => a.id === id); setViewingAssignment(found || null) }}
                onEdit={(id) => { const found = assignments.find(a => a.id === id); setEditingAssignment(found || null); setModalOpen(true) }}
                onDelete={handleDelete}
                onPublish={handlePublish}
              />
            ))}
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-8 border-t border-slate-200/60 mt-8">
          <p className="font-medium">Vincollins Schools Assignments</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>

      <AssignmentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingAssignment(null) }}
        assignment={editingAssignment}
        classes={classes}
        subjects={subjects}
        teacherId={user?.id || ''}
        onSave={handleSaveAssignment}
      />

      {viewingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-b from-slate-50 to-white">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex-1 min-w-0">
                {viewingAssignment.title}
              </h2>
              <button onClick={() => setViewingAssignment(null)} className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-700 border-0">{viewingAssignment.subject}</Badge>
                <Badge className="bg-purple-100 text-purple-700 border-0">{viewingAssignment.class_name}</Badge>
                {viewingAssignment.status === 'published' ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0"><CheckCircle2 className="h-3 w-3 mr-1" />Published</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-0"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
                )}
              </div>

              {viewingAssignment.description && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{viewingAssignment.description}</p>
                </div>
              )}

              {viewingAssignment.instructions && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Instructions</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{viewingAssignment.instructions}</p>
                </div>
              )}

              {viewingAssignment.due_date && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Due Date</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(viewingAssignment.due_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}

              {viewingAssignment.attachments && viewingAssignment.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attachments</p>
                  <div className="space-y-2">
                    {viewingAssignment.attachments.map((file) => (
                      <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                        <Paperclip className="h-4 w-4 text-blue-500 shrink-0" />
                        <span className="text-sm text-slate-700 truncate">{file.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
              <Button variant="outline" onClick={() => setViewingAssignment(null)} className="flex-1 sm:flex-none h-11 rounded-xl">
                Close
              </Button>
              <Button
                onClick={() => {
                  const found = assignments.find(a => a.id === viewingAssignment.id)
                  setViewingAssignment(null)
                  setEditingAssignment(found || null)
                  setModalOpen(true)
                }}
                className="flex-1 sm:flex-none h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}