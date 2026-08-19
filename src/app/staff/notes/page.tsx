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
  X, Upload, Save, RefreshCw, Search,
  NotebookPen, GraduationCap, EyeIcon,
  FileOutput
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Note {
  id: string
  title: string
  subject: string
  content: string
  class_name: string
  status: 'draft' | 'published'
  created_at: string
  teacher_id: string
  teacher_name?: string
  attachments?: Attachment[]
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
            <NotebookPen className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading notes...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your notes</p>
      </div>
    </div>
  )
}

// ── Note Card ─────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onView,
  onEdit,
  onDelete,
  onPublish,
}: {
  note: Note
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPublish: (id: string) => void
}) {
  const isPublished = note.status === 'published'
  
  return (
    <Card className={cn(
      "border-0 shadow-sm hover:shadow-md transition-all overflow-hidden",
      isPublished ? "border-l-4 border-emerald-500" : "border-l-4 border-amber-400"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {note.title}
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
            </CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                {note.subject}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {note.class_name}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400">
                {new Date(note.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px] bg-slate-100">
              {note.attachments?.length || 0} files
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-slate-600 line-clamp-3">
          {note.content || 'No content provided.'}
        </p>
        {note.attachments && note.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {note.attachments.slice(0, 3).map((file) => (
              <Badge key={file.id} variant="outline" className="text-[10px] bg-slate-50">
                <Paperclip className="h-3 w-3 mr-1" />
                {file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name}
              </Badge>
            ))}
            {note.attachments.length > 3 && (
              <Badge variant="outline" className="text-[10px] bg-slate-50">
                +{note.attachments.length - 3} more
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
            onClick={() => onView(note.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-blue-600"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-amber-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            className="h-7 text-xs gap-1 text-slate-600 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
        
        {!isPublished && (
          <Button
            size="sm"
            onClick={() => onPublish(note.id)}
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

// ── Create/Edit Note Modal ────────────────────────────────────────────────────

function NoteModal({
  open,
  onClose,
  note,
  classes,
  subjects,
  teacherId,
  onSave,
}: {
  open: boolean
  onClose: () => void
  note?: Note | null
  classes: ClassOption[]
  subjects: SubjectOption[]
  teacherId: string
  onSave: (data: any) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [class_name, setClassName] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (note) {
        setTitle(note.title || '')
        setSubject(note.subject || '')
        setClassName(note.class_name || '')
        setContent(note.content || '')
        setAttachments(note.attachments || [])
      } else {
        setTitle('')
        setSubject('')
        setClassName('')
        setContent('')
        setAttachments([])
      }
    }
  }, [open, note])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${teacherId}-${Date.now()}.${fileExt}`
      const filePath = `notes/${teacherId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('notes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('notes')
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
    if (!content.trim()) {
      toast.error('Please enter some content')
      return
    }

    setSaving(true)
    try {
      await onSave({
        id: note?.id,
        title: title.trim(),
        subject,
        class_name,
        content: content.trim(),
        attachments,
        status: note?.status || 'draft',
        teacher_id: teacherId,
      })
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save note')
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
            {note ? 'Edit Note' : 'Create New Note'}
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
              Note Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Notes: Fractions"
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

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Note Content <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              className="min-h-[200px] focus-visible:ring-blue-500"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Attachments (optional)
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
            {note ? 'Update' : 'Create'} Note
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── View Note Modal ───────────────────────────────────────────────────────────

function ViewNoteModal({
  open,
  onClose,
  note,
}: {
  open: boolean
  onClose: () => void
  note: Note | null
}) {
  if (!open || !note) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{note.title}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {note.subject}
              <span className="text-slate-300">·</span>
              <Users className="h-4 w-4" />
              {note.class_name}
              <span className="text-slate-300">·</span>
              <Calendar className="h-4 w-4" />
              {new Date(note.created_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700">{note.subject}</Badge>
            <Badge className="bg-purple-100 text-purple-700">{note.class_name}</Badge>
            {note.status === 'published' ? (
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

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Content</p>
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 whitespace-pre-wrap border border-slate-100">
              {note.content}
            </div>
          </div>

          {note.attachments && note.attachments.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Attachments</p>
              <div className="space-y-1.5">
                {note.attachments.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
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
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StaffNotesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  
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

  // ─── Fetch Notes ────────────────────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          teacher:profiles!teacher_id(full_name)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotes((data || []).map((note: any) => ({
        ...note,
        teacher_name: note.teacher?.full_name || 'Unknown',
      })))
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
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
          fetchNotes(),
        ])
        setLoading(false)
      }
      loadAll()
    }
  }, [authLoading, user?.id, fetchClasses, fetchSubjects, fetchNotes])

  // ─── Save Note ──────────────────────────────────────────────────────────────

  const handleSaveNote = async (data: any) => {
    if (!user?.id) return

    try {
      if (data.id) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update({
            title: data.title,
            subject: data.subject,
            class_name: data.class_name,
            content: data.content,
            attachments: data.attachments,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id)

        if (error) throw error
        toast.success('Note updated successfully')
      } else {
        // Create new note
        const { error } = await supabase
          .from('notes')
          .insert({
            title: data.title,
            subject: data.subject,
            class_name: data.class_name,
            content: data.content,
            attachments: data.attachments,
            teacher_id: user.id,
            status: data.status || 'draft',
          })

        if (error) throw error
        toast.success('Note created successfully')
      }

      await fetchNotes()
    } catch (error) {
      console.error('Error saving note:', error)
      throw error
    }
  }

  // ─── Publish Note ───────────────────────────────────────────────────────────

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
      
      toast.success('Note published! Pupils can now view it.')
      await fetchNotes()
    } catch (error) {
      console.error('Error publishing note:', error)
      toast.error('Failed to publish note')
    }
  }

  // ─── Delete Note ────────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Note deleted')
      await fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  // ─── Filtered Notes ─────────────────────────────────────────────────────────

  const filteredNotes = notes.filter((note) => {
    // Status filter
    if (filterStatus !== 'all' && note.status !== filterStatus) {
      return false
    }
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        note.title.toLowerCase().includes(q) ||
        note.subject.toLowerCase().includes(q) ||
        note.class_name.toLowerCase().includes(q)
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
                <NotebookPen className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-none">Study Notes</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                  Create, manage, and publish notes
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingNote(null)
                setModalOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-9 text-sm"
            >
              <Plus className="h-4 w-4" />
              New Note
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
              placeholder="Search notes..."
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
            <p className="text-lg font-bold text-slate-800">{notes.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Published</p>
            <p className="text-lg font-bold text-emerald-600">
              {notes.filter(a => a.status === 'published').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Drafts</p>
            <p className="text-lg font-bold text-amber-600">
              {notes.filter(a => a.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Total Files</p>
            <p className="text-lg font-bold text-blue-600">
              {notes.reduce((sum, n) => sum + (n.attachments?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* ── Notes Grid ──────────────────────────────────────────────────── */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <NotebookPen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No notes found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No notes match your search criteria.'
                : filterStatus !== 'all'
                ? `No ${filterStatus} notes yet.`
                : 'Create your first note to get started.'}
            </p>
            <Button
              onClick={() => {
                setEditingNote(null)
                setModalOpen(true)
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onView={(id) => {
                  const found = notes.find(n => n.id === id)
                  setViewingNote(found || null)
                }}
                onEdit={(id) => {
                  const found = notes.find(n => n.id === id)
                  setEditingNote(found || null)
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
          <p>Vincollins Schools Staff • Study Notes</p>
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

      {/* ── Note Modal ────────────────────────────────────────────────────── */}
      <NoteModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingNote(null)
        }}
        note={editingNote}
        classes={classes}
        subjects={subjects}
        teacherId={user?.id || ''}
        onSave={handleSaveNote}
      />

      {/* ── View Note Modal ───────────────────────────────────────────────── */}
      <ViewNoteModal
        open={!!viewingNote}
        onClose={() => setViewingNote(null)}
        note={viewingNote}
      />
    </div>
  )
}