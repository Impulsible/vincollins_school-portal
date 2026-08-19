/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, CalendarCheck, Users, Clock,
  CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Sparkles, Shield,
  Calendar, BookOpen, FileText,
  GraduationCap, School, User,
  BarChart3, Settings, HelpCircle,
  Lock, RefreshCw, Eye,
  Check, X, PenLine, Save, MousePointerClick,
  Fingerprint, CheckSquare, ListChecks,
  LayoutDashboard
} from 'lucide-react'

export default function AttendanceGuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CalendarCheck className="h-8 w-8 text-white" />
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
              <CalendarCheck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Attendance Guide</span>
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
              How to Mark Attendance
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Learn how to mark daily attendance for your assigned classes.
              This guide covers everything from accessing the attendance page to locking records.
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
              A quick summary of the attendance marking process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: 1,
                  title: 'Access Page',
                  description: 'Go to the Attendance page from your sidebar.',
                  icon: CalendarCheck,
                },
                {
                  step: 2,
                  title: 'Select Class',
                  description: 'Choose the class you want to mark attendance for.',
                  icon: School,
                },
                {
                  step: 3,
                  title: 'Mark Pupils',
                  description: 'Mark each pupil as Present (P) or Absent (A).',
                  icon: CheckSquare,
                },
                {
                  step: 4,
                  title: 'Lock & Save',
                  description: 'Lock the day to save attendance permanently.',
                  icon: Lock,
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

        {/* ── Step 1: Access the Attendance Page ────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
              Access the Attendance Page
            </CardTitle>
            <CardDescription>
              Navigate to the attendance section of the staff portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                There are <strong>three ways</strong> to access the attendance page:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>
                  <strong>From the Sidebar:</strong> Click on the <strong>Attendance</strong> icon in the left sidebar.
                </li>
                <li>
                  <strong>From the Dashboard:</strong> Click the <strong>Quick Actions</strong> card labeled &quot;Attendance&quot;.
                </li>
                <li>
                  <strong>From the Help Page:</strong> Click the <strong>Attendance</strong> quick link on the help page.
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>
                <strong>Tip:</strong> You can only mark attendance for classes assigned to you. If you don&apos;t see your class, contact the admin.
              </span>
            </div>

            <Button
              onClick={() => router.push('/staff/attendance')}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <CalendarCheck className="h-4 w-4" />
              Go to Attendance Page
            </Button>
          </CardContent>
        </Card>

        {/* ── Step 2: View Your Assigned Classes ────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
              View Your Assigned Classes
            </CardTitle>
            <CardDescription>
              See all classes assigned to you and their attendance status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                The attendance page displays <strong>all your assigned classes</strong> in a grid layout.
                Each class card shows:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Class name</strong> and number of students</li>
                <li><strong>Present, Absent, and Unmarked</strong> counts for today</li>
                <li><strong>Attendance rate</strong> percentage with progress bar</li>
                <li><strong>Status badge:</strong> Locked, Done, In Progress, or Pending</li>
                <li><strong>Action button:</strong> Mark or Update Attendance</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>
                <strong>Note:</strong> If a class is marked as &quot;Locked&quot;, attendance has already been finalized for the day.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {[
                { label: 'Locked', color: 'bg-amber-100 text-amber-700' },
                { label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
                { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
                { label: 'Pending', color: 'bg-slate-100 text-slate-500' },
              ].map((status) => (
                <div
                  key={status.label}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold text-center ${status.color}`}
                >
                  {status.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Step 3: Mark Individual Pupils ─────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
              Mark Individual Pupils (Present / Absent)
            </CardTitle>
            <CardDescription>
              Mark each pupil as Present (P) or Absent (A) with a single click
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                After clicking &quot;Mark Attendance&quot; on a class, you&apos;ll see a <strong>weekly view</strong> of all pupils.
                Each pupil has a cell for each day of the week.
              </p>
              <p className="text-sm text-slate-600 mt-2">
                <strong>How to mark:</strong> Click on a pupil&apos;s cell to cycle through:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col items-center p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-sm mb-2">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-bold text-emerald-700">Present (P)</span>
                <span className="text-xs text-emerald-600">Click once → Green</span>
                <div className="mt-2 text-[10px] text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded-full">
                  1 click
                </div>
              </div>

              <div className="flex flex-col items-center p-4 rounded-xl bg-rose-50 border-2 border-rose-400 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-sm mb-2">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-bold text-rose-700">Absent (A)</span>
                <span className="text-xs text-rose-600">Click twice → Red</span>
                <div className="mt-2 text-[10px] text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full">
                  2 clicks
                </div>
              </div>

              <div className="flex flex-col items-center p-4 rounded-xl bg-slate-50 border-2 border-slate-300 shadow-sm">
                <div className="w-12 h-12 rounded-2xl border-2 border-slate-300 bg-white flex items-center justify-center shadow-sm mb-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                </div>
                <span className="text-sm font-bold text-slate-600">Unmarked</span>
                <span className="text-xs text-slate-400">Click to start → Gray</span>
                <div className="mt-2 text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Default
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
              <MousePointerClick className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Quick Tip:</strong> Use the &quot;All P&quot; or &quot;All A&quot; buttons at the top of each day column
                to mark the entire class at once. This is useful when most pupils are present or absent.
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Correction:</strong> Click a marked cell again to cycle back. Present → Absent → Unmarked → Present.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 4: Lock and Save Attendance ───────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">4</span>
              Lock and Save Attendance
            </CardTitle>
            <CardDescription>
              Finalize and lock attendance for the day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                Once all pupils are marked (Present or Absent), you must <strong>lock the day</strong> to save the attendance permanently:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>Click the <strong>Lock Day</strong> button at the top of the day column</li>
                <li>This prevents any further changes to attendance for that day</li>
                <li>The day will show a <span className="text-emerald-600 font-bold">Saved</span> badge once locked</li>
                <li>Locking is <strong>permanent</strong> — you cannot unmark after locking</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Why lock attendance?</p>
                <p className="text-xs text-emerald-600">
                  Locking ensures attendance records are secure and cannot be altered after the fact.
                  This is important for accurate reporting, grading, and auditing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 p-3 rounded-xl bg-rose-50 border border-rose-100">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <span>
                <strong>⚠️ Important:</strong> Once locked, you <strong>cannot</strong> change attendance for that day.
                Double-check all marks before locking!
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 5: Review and Monitor ──────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">5</span>
              Review and Monitor Attendance
            </CardTitle>
            <CardDescription>
              Track attendance trends and view reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                After locking attendance, you can review and monitor attendance data from the dashboard:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Weekly Overview:</strong> See attendance patterns for the current week</li>
                <li><strong>Term Overview:</strong> View attendance percentages for all weeks in the term</li>
                <li><strong>Individual Pupil Tracking:</strong> See how often each pupil attends</li>
                <li><strong>Export Reports:</strong> Generate attendance reports for administration</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Tip:</strong> The attendance dashboard updates automatically. Use the &quot;Refresh&quot; button to sync with the latest data.
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
              Tips and recommendations for efficient attendance marking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Clock className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Mark attendance early</p>
                <p className="text-xs text-emerald-600">
                  Mark attendance within the first 15 minutes of class to ensure accuracy and avoid last-minute rushes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Users className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Use class rosters</p>
                <p className="text-xs text-emerald-600">
                  Keep the class roster open while marking to match names with faces and avoid marking the wrong pupil.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Lock className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Lock promptly</p>
                <p className="text-xs text-emerald-600">
                  Lock the day as soon as you finish marking to prevent accidental changes and ensure data integrity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <BarChart3 className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Monitor trends</p>
                <p className="text-xs text-emerald-600">
                  Check the term overview regularly to identify attendance patterns, address issues early, and recognize improvements.
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
              Troubleshooting common attendance marking problems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Class not showing in attendance list</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Contact the admin to ensure you are assigned to that class in the teacher_classes table.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Cannot lock attendance</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Ensure all pupils are marked (Present or Absent). Unmarked pupils prevent locking.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Attendance not saving</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Check your internet connection and refresh the page. If the issue persists, contact support.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Marked wrong pupil by mistake</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> If the day is not locked yet, click the cell again to cycle back to the correct status.
                If the day is locked, contact support for assistance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Next Steps ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Ready to Start Marking?
            </CardTitle>
            <CardDescription>
              Put your knowledge into practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/staff/attendance')}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <CalendarCheck className="h-4 w-4" />
                Go to Attendance
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
          <p>Vincollins Schools Staff Portal • Attendance Guide</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}