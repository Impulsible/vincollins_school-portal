/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react/no-unescaped-entities */
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
  FileText, BookOpen, Calendar, Clock,
  Loader2, CheckCircle2, XCircle,
  Paperclip, FileIcon, Upload, Download,
  Eye, Send, ArrowLeft, Search,
  Filter, ChevronDown, ChevronUp,
  AlertCircle, PenLine, Save,
  CheckCircle, Clock as ClockIcon,
  X, Trash2, RefreshCw
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Assignment {
  id: string
  title: string
  subject: string
  description?: string
  instructions?: string
  class: string          // ✅ Changed from 'class_name' to 'class'
  due_date?: string
  status: 'draft' | 'published'
  created_at: string
  teacher_id: string
  teacher_name?: string
  attachments?: Attachment[]
  submission?: Submission | null
}

interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

interface Submission {
  id: string
  assignment_id: string
  pupil_id: string
  content?: string
  attachments?: Attachment[]
  status: 'submitted' | 'graded'
  score?: number
  feedback?: string
  submitted_at: string
  graded_at?: string
}

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
        <p className="text-sm text-slate-400 mt-1">Fetching your tasks</p>
      </div>
    </div>
  )
}

// ── Assignment Card ────────────────────────────────────────────────────────────

function AssignmentCard({
  assignment,
  onView,
}: {
  assignment: Assignment
  onView: (id: string) => void
}) {
  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
  const hasSubmitted = !!assignment.submission
  const isGraded = assignment.submission?.status === 'graded'
  const isSubmitted = assignment.submission?.status === 'submitted'
  
  // Determine status display
  let statusColor = 'bg-slate-100 text-slate-600'
  let statusIcon = <Clock className="h-3 w-3" />
  let statusText = 'Pending'
  
  if (isOverdue && !hasSubmitted) {
    statusColor = 'bg-rose-100 text-rose-700'
    statusIcon = <XCircle className="h-3 w-3" />
    statusText = 'Overdue'
  } else if (isGraded) {
    statusColor = 'bg-emerald-100 text-emerald-700'
    statusIcon = <CheckCircle2 className="h-3 w-3" />
    statusText = `Graded (${assignment.submission?.score || 0}%)`
  } else if (isSubmitted) {
    statusColor = 'bg-blue-100 text-blue-700'
    statusIcon = <CheckCircle2 className="h-3 w-3" />
    statusText = 'Submitted'
  }
  
  return (
    <Card className={cn(
      "border-0 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer",
      isOverdue && !hasSubmitted ? "border-l-4 border-rose-500" :
      isGraded ? "border-l-4 border-emerald-500" :
      isSubmitted ? "border-l-4 border-blue-500" :
      "border-l-4 border-amber-400"
    )}
    onClick={() => onView(assignment.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {assignment.title}
              <Badge className={cn("text-[10px]", statusColor)}>
                {statusIcon}
                <span className="ml-1">{statusText}</span>
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                {assignment.subject}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {assignment.due_date 
                  ? new Date(assignment.due_date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })
                  : 'No due date'
                }
              </span>
              {assignment.due_date && isOverdue && !hasSubmitted && (
                <Badge variant="destructive" className="text-[10px]">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {assignment.attachments && assignment.attachments.length > 0 && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Paperclip className="h-3.5 w-3.5" />
                    {assignment.attachments.length} file{assignment.attachments.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-[10px] bg-slate-100">
              {assignment.class}          {/* ✅ Changed from class_name to class */}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-slate-600 line-clamp-2">
          {assignment.description || 'No description provided.'}
        </p>
        {assignment.instructions && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">
            💡 {assignment.instructions}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Assignment Detail Modal ──────────────────────────────────────────────────

function AssignmentDetailModal({
  open,
  onClose,
  assignment,
  pupilId,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  assignment: Assignment | null
  pupilId: string
  onUpdate: () => void
}) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (open && assignment) {
      setContent(assignment.submission?.content || '')
      setFiles([])
    }
  }, [open, assignment])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!assignment) return
    
    setSubmitting(true)
    try {
      // Upload any new files
      const uploadedAttachments: Attachment[] = []
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${pupilId}-${Date.now()}.${fileExt}`
        const filePath = `submissions/${assignment.id}/${pupilId}/${fileName}`

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

        uploadedAttachments.push({
          id: Date.now().toString(),
          name: file.name,
          url: publicUrl,
          size: file.size,
          type: file.type
        })
      }

      // Combine existing attachments with new ones
      const allAttachments = [
        ...(assignment.submission?.attachments || []),
        ...uploadedAttachments
      ]

      if (assignment.submission) {
        // Update existing submission
        const { error } = await supabase
          .from('assignment_submissions')
          .update({
            content: content.trim() || null,
            attachments: allAttachments,
            updated_at: new Date().toISOString(),
          })
          .eq('id', assignment.submission.id)

        if (error) throw error
        toast.success('Submission updated successfully')
      } else {
        // Create new submission
        const { error } = await supabase
          .from('assignment_submissions')
          .insert({
            assignment_id: assignment.id,
            pupil_id: pupilId,
            content: content.trim() || null,
            attachments: allAttachments,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          })

        if (error) throw error
        toast.success('Assignment submitted successfully!')
      }

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit assignment')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open || !assignment) return null

  // File type icons
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileIcon className="h-4 w-4 text-rose-500" />
    if (type.includes('word') || type.includes('document')) return <FileIcon className="h-4 w-4 text-blue-500" />
    if (type.includes('excel') || type.includes('sheet')) return <FileIcon className="h-4 w-4 text-emerald-500" />
    if (type.includes('image')) return <FileIcon className="h-4 w-4 text-amber-500" />
    return <FileIcon className="h-4 w-4 text-slate-400" />
  }

  const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
  const hasSubmitted = !!assignment.submission
  const isGraded = assignment.submission?.status === 'graded'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{assignment.title}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {assignment.subject}
              <span className="text-slate-300">·</span>
              <Calendar className="h-4 w-4" />
              {assignment.due_date 
                ? new Date(assignment.due_date).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })
                : 'No due date'
              }
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
          
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-700">
              {assignment.subject}
            </Badge>
            <Badge className="bg-purple-100 text-purple-700">
              {assignment.class}          {/* ✅ Changed from class_name to class */}
            </Badge>
            {isGraded && (
              <Badge className="bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Graded: {assignment.submission?.score}%
              </Badge>
            )}
            {hasSubmitted && !isGraded && (
              <Badge className="bg-blue-100 text-blue-700">
                <ClockIcon className="h-3 w-3 mr-1" />
                Awaiting Grade
              </Badge>
            )}
            {!hasSubmitted && isOverdue && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
            {!hasSubmitted && !isOverdue && (
              <Badge variant="outline" className="text-amber-600 border-amber-200">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>

          {/* Description */}
          {assignment.description && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Description</p>
              <p className="text-sm text-slate-600">{assignment.description}</p>
            </div>
          )}

          {/* Instructions */}
          {assignment.instructions && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Instructions</p>
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 whitespace-pre-wrap border border-slate-100">
                {assignment.instructions}
              </div>
            </div>
          )}

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Attachments</p>
              <div className="space-y-2">
                {assignment.attachments.map((file) => (
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

          {/* Feedback (if graded) */}
          {isGraded && assignment.submission?.feedback && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Teacher's Feedback</p>
              <div className="bg-emerald-50 rounded-lg p-3 text-sm text-slate-700 border border-emerald-100">
                {assignment.submission.feedback}
              </div>
            </div>
          )}

          {/* Submission Form (only if not graded) */}
          {!isGraded && (
            <div className="border-t border-slate-100 pt-4 mt-2">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                {hasSubmitted ? 'Update Your Submission' : 'Submit Your Work'}
              </p>

              {/* Text input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Write your answer (optional)
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[100px] focus-visible:ring-blue-500"
                  disabled={isGraded}
                />
              </div>

              {/* File upload */}
              <div className="space-y-1.5 mt-3">
                <label className="text-xs font-medium text-slate-500">
                  Upload files (optional)
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('submission-upload')?.click()}
                    disabled={uploading || isGraded}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Files
                  </Button>
                  <input
                    id="submission-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <span className="text-xs text-slate-400">
                    PDF, Word, Excel, Images up to 10MB each
                  </span>
                </div>

                {/* Selected files */}
                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {(file.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Existing attachments */}
                {hasSubmitted && assignment.submission?.attachments && assignment.submission.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Previously uploaded:</p>
                    <div className="space-y-1.5">
                      {assignment.submission.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <div className="mt-4 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || (!content.trim() && files.length === 0 && !hasSubmitted)}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : hasSubmitted ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {hasSubmitted ? 'Update Submission' : 'Submit Assignment'}
                </Button>
              </div>

              {!content.trim() && files.length === 0 && !hasSubmitted && (
                <p className="text-xs text-amber-500 mt-2">
                  Please write something or upload a file before submitting.
                </p>
              )}
            </div>
          )}

          {/* Graded - no submission allowed */}
          {isGraded && (
            <div className="border-t border-slate-100 pt-4 mt-2">
              <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-700">Assignment Graded</p>
                <p className="text-xs text-emerald-600">
                  Score: {assignment.submission?.score}%
                </p>
                {assignment.submission?.feedback && (
                  <p className="text-xs text-emerald-600 mt-1">
                    "{assignment.submission.feedback}"
                  </p>
                )}
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

export default function PupilAssignmentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [pupilClass, setPupilClass] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded' | 'overdue'>('all')
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

      if (error) {
        console.error('Error fetching pupil class:', error)
        return ''
      }
      return data?.class || ''
    } catch (error) {
      console.error('Error fetching pupil class:', error)
      return ''
    }
  }, [user?.id])

  // ─── Fetch Assignments ──────────────────────────────────────────────────────

  const fetchAssignments = useCallback(async () => {
    if (!user?.id || !pupilClass) return
    setRefreshing(true)
    try {
      // 1. Fetch published assignments for this class
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class', pupilClass)          // ✅ Changed from 'class_name' to 'class'
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error fetching assignments:', error)
        throw error
      }

      // 2. Fetch existing submissions for this pupil
      const { data: submissionsData, error: subError } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('pupil_id', user.id)

      if (subError) {
        console.error('Supabase error fetching submissions:', subError)
        throw subError
      }

      // 3. Combine assignments with their submissions
      const assignmentsWithSubmissions = (assignmentsData || []).map((assignment: any) => {
        const submission = submissionsData?.find((s: any) => s.assignment_id === assignment.id) || null
        return {
          ...assignment,
          teacher_name: assignment.teacher_name || 'Unknown',
          submission: submission ? {
            id: submission.id,
            assignment_id: submission.assignment_id,
            pupil_id: submission.pupil_id,
            content: submission.content,
            attachments: submission.attachments || [],
            status: submission.status,
            score: submission.score,
            feedback: submission.feedback,
            submitted_at: submission.submitted_at,
            graded_at: submission.graded_at,
          } : null,
        }
      })

      setAssignments(assignmentsWithSubmissions)
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load assignments')
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
          await fetchAssignments()
        }
        setLoading(false)
      }
      loadAll()
    }
  }, [authLoading, user?.id, fetchPupilClass, fetchAssignments])

  // ─── Refresh handler ──────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    await fetchAssignments()
    toast.success('Assignments refreshed')
  }, [fetchAssignments])

  // ─── Filtered Assignments ──────────────────────────────────────────────────

  const filteredAssignments = assignments.filter((assignment) => {
    // Status filter
    const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date()
    const hasSubmitted = !!assignment.submission
    const isGraded = assignment.submission?.status === 'graded'
    const isSubmitted = assignment.submission?.status === 'submitted'

    switch (filterStatus) {
      case 'pending':
        return !hasSubmitted && !isOverdue
      case 'submitted':
        return isSubmitted
      case 'graded':
        return isGraded
      case 'overdue':
        return !hasSubmitted && isOverdue
      default:
        return true
    }
  }).filter((assignment) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        assignment.title.toLowerCase().includes(q) ||
        assignment.subject.toLowerCase().includes(q) ||
        assignment.teacher_name?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => !a.submission && !(a.due_date && new Date(a.due_date) < new Date())).length,
    submitted: assignments.filter(a => a.submission?.status === 'submitted').length,
    graded: assignments.filter(a => a.submission?.status === 'graded').length,
    overdue: assignments.filter(a => !a.submission && a.due_date && new Date(a.due_date) < new Date()).length,
  }

  // ─── Loading States ──────────────────────────────────────────────────────

  if (authLoading || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  if (!pupilClass && !loading) {
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
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-none">My Assignments</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-none">
                  {pupilClass} · {assignments.length} assignments
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
              placeholder="Search assignments..."
              className="pl-9 focus-visible:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Stats Bar ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Total</p>
            <p className="text-lg font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Pending</p>
            <p className="text-lg font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Submitted</p>
            <p className="text-lg font-bold text-blue-600">{stats.submitted}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Graded</p>
            <p className="text-lg font-bold text-emerald-600">{stats.graded}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
            <p className="text-xs text-slate-400 font-medium">Overdue</p>
            <p className="text-lg font-bold text-rose-600">{stats.overdue}</p>
          </div>
        </div>

        {/* ── Assignments Grid ───────────────────────────────────────────── */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No assignments found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'No assignments match your search criteria.'
                : filterStatus !== 'all'
                ? `No ${filterStatus} assignments.`
                : 'Great! No pending assignments right now.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onView={(id) => {
                  const found = assignments.find(a => a.id === id)
                  setSelectedAssignment(found || null)
                  setModalOpen(true)
                }}
              />
            ))}
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 mt-6 border-t border-slate-200/50">
          <p>Vincollins Schools Pupil • Assignments</p>
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

      {/* ── Assignment Detail Modal ──────────────────────────────────────── */}
      <AssignmentDetailModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedAssignment(null)
        }}
        assignment={selectedAssignment}
        pupilId={user?.id || ''}
        onUpdate={fetchAssignments}
      />
    </div>
  )
}