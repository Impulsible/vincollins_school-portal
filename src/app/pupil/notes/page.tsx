/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  BookOpen, Calendar, Clock,
  Loader2, Paperclip, FileIcon,
  Eye, Search, Download,
  AlertCircle, User, RefreshCw,
  NotebookPen, GraduationCap, FileText,
  X, CheckCircle2
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Note {
  id: string
  title: string
  subject: string
  content: string
  class: string          // ✅ Changed from 'class_name' to 'class'
  is_published: boolean   // ✅ Changed from 'status' to 'is_published'
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
        <p className="font-semibold text-slate-700">Loading study notes...</p>
        <p className="text-sm text-slate-400 mt-1">Fetching your notes</p>
      </div>
    </div>
  )
}

// ── Note Card ─────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onView,
}: {
  note: Note
  onView: (id: string) => void
}) {
  return (
    <Card 
      className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer border-l-4 border-blue-400"
      onClick={() => onView(note.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {note.title}
              <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                <BookOpen className="h-3 w-3 mr-1" />
                {note.subject}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <User className="h-3.5 w-3.5" />
                {note.teacher_name || 'Teacher'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(note.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <GraduationCap className="h-3.5 w-3.5" />
                {note.class}
              </span>
              {note.attachments && note.attachments.length > 0 && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Paperclip className="h-3.5 w-3.5" />
                    {note.attachments.length} file{note.attachments.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-slate-600 line-clamp-2">
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
    </Card>
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
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null)

  if (!open || !note) return null

  // File type icons
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileIcon className="h-4 w-4 text-rose-500" />
    if (type.includes('word') || type.includes('document')) return <FileIcon className="h-4 w-4 text-blue-500" />
    if (type.includes('excel') || type.includes('sheet')) return <FileIcon className="h-4 w-4 text-emerald-500" />
    if (type.includes('image')) return <FileIcon className="h-4 w-4 text-amber-500" />
    return <FileIcon className="h-4 w-4 text-slate-400" />
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{note.title}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {note.subject}
              <span className="text-slate-300">·</span>
              <User className="h-4 w-4" />
              {note.teacher_name || 'Teacher'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700">{note.subject}</Badge>
            <Badge className="bg-purple-100 text-purple-700">{note.class}</Badge>
            <Badge className="bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Published
            </Badge>
          </div>

          {/* Content */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">Content</p>
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 whitespace-pre-wrap border border-slate-100">
              {note.content}
            </div>
          </div>

          {/* Attachments */}
          {note.attachments && note.attachments.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Attachments</p>
              <div className="space-y-2">
                {note.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {getFileIcon(file.type)}
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewFile(file)}
                        className="h-7 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Preview
                      </Button>
                      <a
                        href={file.url}
                        download={file.name}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded-md text-slate-700 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{previewFile.name}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-50">
              {previewFile.type.includes('image') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : previewFile.type.includes('pdf') ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh] rounded-lg border border-slate-200"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center">
                  <FileIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Preview not available for this file type.</p>
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PupilNotesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)
  const [pupilClass, setPupilClass] = useState<string>('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ─── Fetch Pupil Class ──────────────────────────────────────────────────────

  const fetchPupilClass = useCallback(async () => {
    if (!user?.id) return ''
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('class')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data?.class || ''
    } catch (error) {
      console.error('Error fetching pupil class:', error)
      return ''
    }
  }, [user?.id])

  // ─── Fetch Notes ────────────────────────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    if (!user?.id || !pupilClass) return
    setRefreshing(true)
    try {
      console.log('📋 [PupilNotes] Fetching notes for class:', pupilClass)
      console.log('📋 [PupilNotes] User ID:', user.id)

      // ✅ FIXED: Changed 'class_name' to 'class' and 'status' to 'is_published'
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          teacher:profiles!teacher_id(full_name)
        `)
        .eq('class', pupilClass)          // ✅ Changed from 'class_name' to 'class'
        .eq('is_published', true)         // ✅ Changed from 'status' to 'is_published'
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [PupilNotes] Supabase error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      console.log('✅ [PupilNotes] Found', data?.length || 0, 'notes')

      setNotes((data || []).map((note: any) => ({
        ...note,
        teacher_name: note.teacher?.full_name || 'Unknown',
      })))
    } catch (error: any) {
      console.error('❌ [PupilNotes] Error fetching notes:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      toast.error('Failed to load notes')
    } finally {
      setRefreshing(false)
    }
  }, [user?.id, pupilClass])

  // ─── Initial Load ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authLoading && user?.id) {
      const loadAll = async () => {
        setLoading(true)
        const cls = await fetchPupilClass()
        setPupilClass(cls)
        if (cls) {
          await fetchNotes()
        }
        setLoading(false)
      }
      loadAll()
    }
  }, [authLoading, user?.id, fetchPupilClass, fetchNotes])

  // ─── Refresh handler ──────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    await fetchNotes()
    toast.success('Notes refreshed')
  }, [fetchNotes])

  // ─── Extract unique subjects from notes ──────────────────────────────────

  const subjects = [...new Set(notes.map((n) => n.subject))]

  // ─── Filtered Notes ────────────────────────────────────────────────────────

  const filteredNotes = notes.filter((note) => {
    // Subject filter
    if (filterSubject !== 'all' && note.subject !== filterSubject) {
      return false
    }
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        note.title.toLowerCase().includes(q) ||
        note.subject.toLowerCase().includes(q) ||
        note.teacher_name?.toLowerCase().includes(q)
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

  if (!pupilClass) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No Class Assigned</h3>
          <p className="text-sm text-slate-400">
            You haven't been assigned to a class yet. Please contact your teacher or admin.
          </p>
        </div>
      </div>
    )
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
                  {pupilClass} · {notes.length} notes
                </p>
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 gap-2 h-9 text-sm"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
              Refresh
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
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="h-8 text-xs w-[150px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Stats Bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Total Notes</p>
            <p className="text-lg font-bold text-slate-800">{notes.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Subjects</p>
            <p className="text-lg font-bold text-blue-600">{subjects.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Total Files</p>
            <p className="text-lg font-bold text-emerald-600">
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
                : filterSubject !== 'all'
                ? `No ${filterSubject} notes.`
                : 'No notes have been published for your class yet.'}
            </p>
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
              />
            ))}
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 mt-6 border-t border-slate-200/50">
          <p>Vincollins Schools Pupil • Study Notes</p>
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

      {/* ── View Note Modal ───────────────────────────────────────────────── */}
      <ViewNoteModal
        open={!!viewingNote}
        onClose={() => setViewingNote(null)}
        note={viewingNote}
      />
    </div>
  )
}