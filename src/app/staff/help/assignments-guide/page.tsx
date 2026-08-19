/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, ClipboardCheck, Users, School,
  CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Sparkles, Shield,
  BookOpen, FileText, BarChart3,
  HelpCircle, Save, PenLine, CheckSquare,
  Plus, Eye, Edit3, Trash2, Send,
  Paperclip, FileIcon, Upload, Download,
  Calendar, Clock, ListChecks, Target,
  GraduationCap, User, SaveAll,
  RefreshCw, Filter, Search,
  LayoutDashboard
} from 'lucide-react'

export default function AssignmentsGuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ClipboardCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="font-semibold text-slate-700">Loading guide...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/staff/help')}
              className="gap-1.5 text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Help
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Assignments Guide</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-lg">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-indigo-400/10 blur-2xl" />
          
          <div className="relative">
            <Badge className="bg-white/20 text-white border-0 mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              Step-by-Step Guide
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">
              How to Create &amp; Manage Assignments
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Learn how to create, publish, and manage assignments for your classes.
              This guide covers everything from creating an assignment to tracking submissions.
            </p>
          </div>
        </div>

        {/* ── Quick Steps Overview ───────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-blue-600" />
              Quick Steps Overview
            </CardTitle>
            <CardDescription>
              A quick summary of the assignments workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  step: 1,
                  title: 'Access Assignments',
                  description: 'Go to the Assignments page from your sidebar.',
                  icon: ClipboardCheck,
                },
                {
                  step: 2,
                  title: 'Create New',
                  description: 'Click the "New Assignment" button.',
                  icon: Plus,
                },
                {
                  step: 3,
                  title: 'Fill Details',
                  description: 'Enter title, subject, class, description, instructions, and due date.',
                  icon: PenLine,
                },
                {
                  step: 4,
                  title: 'Save as Draft',
                  description: 'Save as draft for later editing, or publish immediately.',
                  icon: Save,
                },
                {
                  step: 5,
                  title: 'Publish',
                  description: 'Publish the assignment so pupils can view and submit.',
                  icon: Send,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <item.icon className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Step 1: Access the Assignments Page ────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
              Access the Assignments Page
            </CardTitle>
            <CardDescription>
              Navigate to the assignments section of the staff portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                There are <strong>three ways</strong> to access the assignments page:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>
                  <strong>From the Sidebar:</strong> Click on the <strong>Assignments</strong> icon in the left sidebar.
                </li>
                <li>
                  <strong>From the Dashboard:</strong> Click the <strong>Quick Actions</strong> card labeled &quot;Assignments&quot;.
                </li>
                <li>
                  <strong>From the Help Page:</strong> Click the <strong>Assignments</strong> quick link on the help page.
                </li>
              </ul>
            </div>

            <Button
              onClick={() => router.push('/staff/assignments')}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              Go to Assignments Page
            </Button>
          </CardContent>
        </Card>

        {/* ── Step 2: Create a New Assignment ────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
              Create a New Assignment
            </CardTitle>
            <CardDescription>
              Start creating a new assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                Once on the assignments page, click the <strong>New Assignment</strong> button in the top right corner.
                This will open the <strong>Create New Assignment</strong> modal.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
              <Plus className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-700">New Assignment Button</p>
                <p className="text-xs text-blue-600">
                  Located in the top right corner of the assignments page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 3: Fill in Assignment Details ─────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
              Fill in Assignment Details
            </CardTitle>
            <CardDescription>
              Enter all required information for the assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                The assignment modal has the following fields:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Assignment Title *:</strong> A clear, descriptive title for the assignment.</li>
                <li><strong>Subject *:</strong> Select the subject from the dropdown list.</li>
                <li><strong>Target Class *:</strong> Select the class you want to assign this to.</li>
                <li><strong>Due Date:</strong> Set a deadline for submission (optional).</li>
                <li><strong>Description:</strong> Provide a brief description of the assignment.</li>
                <li><strong>Instructions:</strong> Step-by-step instructions for pupils.</li>
                <li><strong>Attachments:</strong> Upload files (PDF, Word, Excel, Images up to 10MB).</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>
                <strong>Tip:</strong> The <strong>Target Class</strong> determines which pupils can see the assignment.
                Only pupils in the selected class will see it in their portal.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500">Required Fields</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-sm font-medium text-slate-700">Title, Subject, Class</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500">Optional Fields</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="text-sm font-medium text-slate-700">Due Date, Description, Instructions, Attachments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 4: Attach Files ────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">4</span>
              Attach Files
            </CardTitle>
            <CardDescription>
              Upload supporting files for the assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                You can attach files to the assignment to provide additional resources:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Supported formats:</strong> PDF, Word, Excel, Images</li>
                <li><strong>Max file size:</strong> 10MB per file</li>
                <li><strong>Multiple files:</strong> You can upload multiple files</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
              <Upload className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-700">Upload Files</p>
                <p className="text-xs text-blue-600">
                  Click the &quot;Upload File&quot; button to select files from your computer.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Paperclip className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Tip:</strong> Uploaded files are stored securely in Supabase Storage and are accessible to pupils.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 5: Save as Draft or Publish ───────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">5</span>
              Save as Draft or Publish
            </CardTitle>
            <CardDescription>
              Choose whether to save as draft or publish immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                After filling in all details, you have <strong>two options</strong>:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>
                  <strong>Save as Draft:</strong> The assignment is saved but <strong>not visible</strong> to pupils.
                  You can edit it later before publishing.
                </li>
                <li>
                  <strong>Publish:</strong> The assignment is <strong>immediately visible</strong> to pupils in the selected class.
                  They can view it, download attachments, and submit their work.
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-amber-700">Draft</span>
                </div>
                <p className="text-xs text-amber-600">Not visible to pupils</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700">Published</span>
                </div>
                <p className="text-xs text-emerald-600">Visible to pupils</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Tip:</strong> You can publish a draft at any time from the assignments list by clicking the &quot;Publish&quot; button.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 6: Manage Assignments ──────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">6</span>
              Manage Existing Assignments
            </CardTitle>
            <CardDescription>
              View, edit, delete, and track assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                From the assignments list, you can manage each assignment:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>View:</strong> Click the &quot;View&quot; button to see full details, instructions, and attachments.</li>
                <li><strong>Edit:</strong> Click the &quot;Edit&quot; button to update the assignment details.</li>
                <li><strong>Delete:</strong> Click the &quot;Delete&quot; button to permanently remove the assignment.</li>
                <li><strong>Publish:</strong> Click the &quot;Publish&quot; button to make a draft visible to pupils.</li>
                <li><strong>Track Submissions:</strong> The &quot;Submissions&quot; badge shows how many pupils have submitted.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {[
                { label: 'View', icon: Eye, color: 'blue' },
                { label: 'Edit', icon: Edit3, color: 'amber' },
                { label: 'Delete', icon: Trash2, color: 'rose' },
                { label: 'Publish', icon: Send, color: 'emerald' },
              ].map((action) => (
                <div
                  key={action.label}
                  className={`p-3 rounded-xl bg-${action.color}-50 border border-${action.color}-200 text-center`}
                >
                  <action.icon className={`h-4 w-4 text-${action.color}-600 mx-auto mb-1`} />
                  <span className={`text-xs font-medium text-${action.color}-700`}>{action.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ListChecks className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Tip:</strong> Use the <strong>Search</strong> bar and <strong>Filters</strong> (All, Drafts, Published)
                to quickly find assignments.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 7: Track Submissions ───────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">7</span>
              Track Pupil Submissions
            </CardTitle>
            <CardDescription>
              Monitor which pupils have submitted the assignment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                After publishing, you can track submissions from the assignments list:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Submission Count:</strong> Each assignment card shows the number of submissions.</li>
                <li><strong>Status Badge:</strong> See whether the assignment is Published, Draft, or Overdue.</li>
                <li><strong>View Submissions:</strong> Click on the submission count to see which pupils have submitted.</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Tip:</strong> The submission count updates automatically as pupils submit their work.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Best Practices ──────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-emerald-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Best Practices
            </CardTitle>
            <CardDescription>
              Tips and recommendations for effective assignment management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Target className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Be clear and specific</p>
                <p className="text-xs text-emerald-600">
                  Provide clear instructions and expectations so pupils know exactly what to do.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Calendar className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Set realistic due dates</p>
                <p className="text-xs text-emerald-600">
                  Give pupils enough time to complete the assignment. Consider holidays and other events.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Paperclip className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Provide resources</p>
                <p className="text-xs text-emerald-600">
                  Attach relevant files, templates, or reference materials to help pupils succeed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Send className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Publish early</p>
                <p className="text-xs text-emerald-600">
                  Publish assignments at least a week before the due date to give pupils ample time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Common Issues & Solutions ───────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-amber-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Common Issues &amp; Solutions
            </CardTitle>
            <CardDescription>
              Troubleshooting common assignment problems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Assignment not showing for pupils</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Ensure the assignment is <strong>published</strong> and the correct <strong>Target Class</strong> is selected.
                Drafts are not visible to pupils.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Cannot upload file</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Check the file size (max 10MB) and format (PDF, Word, Excel, Images).
                If the issue persists, check your internet connection.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Cannot edit published assignment</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> You can edit published assignments at any time. Click the &quot;Edit&quot; button,
                make your changes, and save. Pupils will see the updated version.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Submissions not showing</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Refresh the page. Submissions update automatically but may require a refresh to appear.
                If the issue persists, contact support.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Next Steps ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Ready to Create Assignments?
            </CardTitle>
            <CardDescription>
              Put your knowledge into practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/staff/assignments')}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <ClipboardCheck className="h-4 w-4" />
                Go to Assignments
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/staff')}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/staff/help')}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                More Help Guides
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff Portal • Assignments Guide</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}