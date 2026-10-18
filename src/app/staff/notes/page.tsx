/* eslint-disable react-hooks/preserve-manual-memoization */
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Plus, Users, Calendar, Clock,
  Loader2, CheckCircle2, Trash2,
  Eye, Send, BookOpen,
  Pencil, Paperclip, FileIcon,
  X, Upload, Save, Search,
  NotebookPen, MoreVertical, FileText,
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

const hideScrollbar =
  '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'

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
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50/50">
      <div className="text-center px-4">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <NotebookPen className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading notes...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your study notes</p>
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'emerald' | 'amber' | 'violet'
}) {
  const map = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-500' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'bg-violet-500' },
  }
  const c = map[color]

  return (
    <div
      className={cn(
        'rounded-2xl p-4 border shrink-0 w-[150px] sm:w-auto snap-start shadow-sm',
        c.bg,
        c.border
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm',
            c.icon
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
      <p className="text-xs text-slate-500 font-semibold mt-1.5">{label}</p>
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
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all hover:shadow-md',
        isPublished ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-amber-400'
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 className="text-base font-bold text-slate-800 leading-snug truncate">
                {note.title}
              </h3>
              {isPublished ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-semibold shrink-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-semibold shrink-0">
                  <Clock className="h-3 w-3 mr-1" />
                  Draft
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                {note.subject}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {note.class_name}
              </span>
              <span className="text-slate-300">·</span>
              <span>
                {new Date(note.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
                aria-label="Note actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem onClick={() => onView(note.id)} className="gap-2 cursor-pointer">
                <Eye className="h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(note.id)} className="gap-2 cursor-pointer">
                <Pencil className="h-4 w-4" /> Edit
              </DropdownMenuItem>
              {!isPublished && (
                <DropdownMenuItem
                  onClick={() => onPublish(note.id)}
                  className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600"
                >
                  <Send className="h-4 w-4" /> Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(note.id)}
                className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-slate-600 line-clamp-3 mt-3 leading-relaxed">
          {note.content || 'No content provided.'}
        </p>

        {note.attachments && note.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {note.attachments.slice(0, 3).map((file) => (
              <span
                key={file.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-600"
              >
                <Paperclip className="h-3 w-3 text-slate-400" />
                {file.name.length > 18 ? file.name.slice(0, 18) + '…' : file.name}
              </span>
            ))}
            {note.attachments.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-medium text-slate-500">
                +{note.attachments.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {!isPublished && (
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button
            size="sm"
            onClick={() => onPublish(note.id)}
            className="h-9 sm:h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl"
          >
            <Send className="h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      )}
    </div>
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
  onSave: (data: Record<string, unknown>) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [class_name, setClassName] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

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

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

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
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('notes').getPublicUrl(filePath)

      setAttachments((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.type,
        },
      ])
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
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSubmit = async () => {
    if (!title.trim()) return toast.error('Please enter a title')
    if (!subject) return toast.error('Please select a subject')
    if (!class_name) return toast.error('Please select a class')
    if (!content.trim()) return toast.error('Please enter some content')

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex flex-col items-center pt-3 sm:pt-0 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3 sm:hidden" />
          <div className="w-full flex items-center justify-between px-5 pb-3 sm:pt-5 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              {note ? 'Edit Note' : 'Create New Note'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={cn('flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4', hideScrollbar)}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Note Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Notes: Fractions"
              className="h-11 sm:h-10 text-base sm:text-sm rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Subject <span className="text-rose-500">*</span>
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm rounded-xl">
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
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target Class <span className="text-rose-500">*</span>
              </label>
              <Select value={class_name} onValueChange={setClassName}>
                <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm rounded-xl">
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Note Content <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              className="min-h-[160px] sm:min-h-[200px] text-base sm:text-sm rounded-xl resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Attachments
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('note-file-upload')?.click()}
                disabled={uploading}
                className="h-10 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload File
              </Button>
              <input
                id="note-file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="text-xs text-slate-400">PDF, Word, Excel, Images · max 10MB</span>
            </div>

            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <FileIcon className="h-4 w-4 text-blue-500 shrink-0" />
                      <span className="text-sm truncate font-medium text-slate-700">
                        {file.name}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(file.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="h-11 sm:h-10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="h-11 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open || !note) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <div className="flex flex-col items-center pt-3 sm:pt-0 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-3 sm:hidden" />
          <div className="w-full flex items-start justify-between gap-3 px-5 pb-3 sm:pt-5 border-b border-slate-100">
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                {note.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {note.subject}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {note.class_name}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(note.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={cn('flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-5', hideScrollbar)}>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700 border-0">{note.subject}</Badge>
            <Badge className="bg-violet-100 text-violet-700 border-0">{note.class_name}</Badge>
            {note.status === 'published' ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Published
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-0">
                <Clock className="h-3 w-3 mr-1" />
                Draft
              </Badge>
            )}
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Content
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 whitespace-pre-wrap border border-slate-100 leading-relaxed">
              {note.content}
            </div>
          </div>

          {note.attachments && note.attachments.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Attachments
              </p>
              <div className="space-y-1.5">
                {note.attachments.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <Paperclip className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {file.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
          <Button variant="outline" onClick={onClose} className="h-11 sm:h-10 rounded-xl">
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

  const fetchClasses = useCallback(async () => {
    if (!user?.id) return []
    try {
      const { data: teacherClasses, error } = await supabase
        .from('teacher_classes')
        .select('class_name')
        .eq('teacher_id', user.id)

      if (error) throw error

      const classNames = teacherClasses?.map((tc: { class_name: string }) => tc.class_name) || []

      const { data: students, error: studentError } = await supabase
        .from('profiles')
        .select('class')
        .in('role', ['student', 'pupil'])
        .in('class', classNames)
        .eq('is_active', true)

      if (studentError) throw studentError

      const classCounts: Record<string, number> = {}
      students?.forEach((s: { class?: string }) => {
        if (s.class) classCounts[s.class] = (classCounts[s.class] || 0) + 1
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

  const fetchSubjects = useCallback(async () => {
    const subjectOptions: SubjectOption[] = PRIMARY_SUBJECTS.map((sub) => ({
      id: sub.id,
      name: sub.name,
    }))
    setSubjects(subjectOptions)
    return subjectOptions
  }, [])

  const fetchNotes = useCallback(async () => {
    if (!user?.id) return
    setRefreshing(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`*, teacher:profiles!teacher_id(full_name)`)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotes(
        (data || []).map((note: Note & { teacher?: { full_name?: string } }) => ({
          ...note,
          teacher_name: note.teacher?.full_name || 'Unknown',
        }))
      )
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setRefreshing(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!authLoading && user?.id) {
      const loadAll = async () => {
        setLoading(true)
        await Promise.all([fetchClasses(), fetchSubjects(), fetchNotes()])
        setLoading(false)
      }
      loadAll()
    }
  }, [authLoading, user?.id, fetchClasses, fetchSubjects, fetchNotes])

  const handleSaveNote = async (data: Record<string, unknown>) => {
    if (!user?.id) return

    try {
      if (data.id) {
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
          .eq('id', data.id as string)

        if (error) throw error
        toast.success('Note updated successfully')
      } else {
        const { error } = await supabase.from('notes').insert({
          title: data.title,
          subject: data.subject,
          class_name: data.class_name,
          content: data.content,
          attachments: data.attachments,
          teacher_id: user.id,
          status: (data.status as string) || 'draft',
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

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      toast.success('Note published! Pupils can now view it.')
      await fetchNotes()
    } catch (error) {
      console.error('Error publishing note:', error)
      toast.error('Failed to publish note')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      toast.success('Note deleted')
      await fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  const filteredNotes = notes.filter((note) => {
    if (filterStatus !== 'all' && note.status !== filterStatus) return false
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

  const publishedCount = notes.filter((n) => n.status === 'published').length
  const draftCount = notes.filter((n) => n.status === 'draft').length
  const totalFiles = notes.reduce((sum, n) => sum + (n.attachments?.length || 0), 0)

  if (authLoading || loading) return <LoadingScreen />

  if (!user) {
    router.replace('/portal')
    return null
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50/50 pb-24 lg:pb-8">
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[73px]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shrink-0">
                <NotebookPen className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 leading-none">Study Notes</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none truncate">
                  Create, manage & publish notes
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingNote(null)
                setModalOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 sm:h-9 text-sm rounded-xl shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">New Note</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Stats — horizontal scroll on mobile */}
        <div
          className={cn(
            'flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:pb-0',
            hideScrollbar
          )}
        >
          <StatCard label="Total" value={notes.length} icon={FileText} color="blue" />
          <StatCard label="Published" value={publishedCount} icon={CheckCircle2} color="emerald" />
          <StatCard label="Drafts" value={draftCount} icon={Clock} color="amber" />
          <StatCard label="Total Files" value={totalFiles} icon={Paperclip} color="violet" />
        </div>

        {/* Sticky filter bar */}
        <div className="sticky top-[73px] z-20 bg-slate-50/90 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:static space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-10 h-11 sm:h-10 text-base sm:text-sm rounded-xl bg-white"
            />
          </div>

          <div className={cn('flex gap-2 overflow-x-auto pb-1', hideScrollbar)}>
            {(
              [
                { id: 'all', label: 'All', active: 'bg-slate-800 text-white' },
                { id: 'draft', label: 'Drafts', active: 'bg-amber-600 text-white' },
                { id: 'published', label: 'Published', active: 'bg-emerald-600 text-white' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={cn(
                  'shrink-0 h-9 px-4 rounded-full text-xs font-semibold transition-all border',
                  filterStatus === f.id
                    ? f.active + ' border-transparent shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes grid */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <NotebookPen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No notes found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No notes match your search. Try a different term.'
                : filterStatus !== 'all'
                  ? `No ${filterStatus} notes yet.`
                  : 'Create your first note to get started.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-5">
              {(searchQuery || filterStatus !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setFilterStatus('all')
                  }}
                  className="h-10 rounded-xl"
                >
                  Clear filters
                </Button>
              )}
              <Button
                onClick={() => {
                  setEditingNote(null)
                  setModalOpen(true)
                }}
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Create Note
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onView={(id) => setViewingNote(notes.find((n) => n.id === id) || null)}
                onEdit={(id) => {
                  setEditingNote(notes.find((n) => n.id === id) || null)
                  setModalOpen(true)
                }}
                onDelete={handleDelete}
                onPublish={handlePublish}
              />
            ))}
          </div>
        )}

        <div className="text-center text-xs text-slate-400 pt-4 mt-2 border-t border-slate-200/50">
          <p>Vincollins Schools Staff · Study Notes</p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.
          </p>
        </div>
      </div>

      {refreshing && (
        <div className="fixed bottom-24 lg:bottom-6 right-4 z-40 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-full shadow-xl text-xs font-medium">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
          Refreshing...
        </div>
      )}

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

      <ViewNoteModal
        open={!!viewingNote}
        onClose={() => setViewingNote(null)}
        note={viewingNote}
      />
    </div>
  )
}