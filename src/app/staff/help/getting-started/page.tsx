/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, LayoutDashboard, BookOpen, Users,
  CalendarCheck, Calculator, ClipboardCheck,
  NotebookPen, BarChart3, CheckCircle,
  ChevronRight, Sparkles, FileText,
  School, GraduationCap, Shield,
  Clock, Bell, Settings, HelpCircle,
  User, Key
} from 'lucide-react'
import Link from 'next/link'

export default function GettingStartedGuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
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
              <LayoutDashboard className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Getting Started Guide</span>
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
              Staff Portal
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Vincollins Schools Staff Portal
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Your complete guide to navigating and using the staff portal effectively.
              Get started with these essential steps.
            </p>
          </div>
        </div>

        {/* ── Quick Links ────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-blue-600" />
              Quick Start Steps
            </CardTitle>
            <CardDescription>
              Follow these steps to get up and running quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  step: 1,
                  title: 'Complete Your Profile',
                  description: 'Add your photo, bio, and contact details.',
                  icon: User,
                  href: '/staff/profile',
                },
                {
                  step: 2,
                  title: 'Review Your Classes',
                  description: 'See the classes and pupils assigned to you.',
                  icon: Users,
                  href: '/staff/pupils',
                },
                {
                  step: 3,
                  title: 'Mark Attendance',
                  description: 'Start marking daily attendance for your classes.',
                  icon: CalendarCheck,
                  href: '/staff/attendance',
                },
                {
                  step: 4,
                  title: 'Enter Scores',
                  description: 'Begin entering CA and Exam scores for pupils.',
                  icon: Calculator,
                  href: '/staff/scores',
                },
                {
                  step: 5,
                  title: 'Create Assignments',
                  description: 'Create and publish assignments for your class.',
                  icon: ClipboardCheck,
                  href: '/staff/assignments',
                },
                {
                  step: 6,
                  title: 'Explore Analytics',
                  description: 'Track your class performance and insights.',
                  icon: BarChart3,
                  href: '/staff/analytics',
                },
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => router.push(item.href)}
                  className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 ml-auto shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Understanding the Dashboard ────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-blue-600" />
              Understanding the Dashboard
            </CardTitle>
            <CardDescription>
              Key sections of your staff dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Overview</h4>
                    <p className="text-xs text-slate-500">
                      See a summary of your classes, pupil count, pending grading, and recent activity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Quick Actions</h4>
                    <p className="text-xs text-slate-500">
                      One-click access to common tasks: Pupils, Assignments, Scores, Attendance.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Performance Analytics</h4>
                    <p className="text-xs text-slate-500">
                      View class-wide performance, average scores, and grading progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Key Features Overview ──────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <School className="h-4 w-4 text-blue-600" />
              Key Features Overview
            </CardTitle>
            <CardDescription>
              A quick tour of the main features available to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarCheck className="h-5 w-5 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-700">Attendance</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Mark daily attendance for each pupil as Present, Absent, or Late.
                  View attendance trends and reports.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-700">Scores</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Enter CA (40%) and Exam (60%) scores. Automatic total calculation
                  and grade assignment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardCheck className="h-5 w-5 text-amber-600" />
                  <h4 className="text-sm font-bold text-slate-700">Assignments</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Create, publish, and manage assignments. Target specific classes
                  and track submissions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <NotebookPen className="h-5 w-5 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-700">Study Notes</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Create and share study notes with your pupils. Add attachments
                  and organize by subject.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-700">Pupil Management</h4>
                </div>
                <p className="text-xs text-slate-500">
                  View pupil rosters, contact information, and individual
                  performance data.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-rose-600" />
                  <h4 className="text-sm font-bold text-slate-700">Analytics</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Track class performance, identify trends, and make data-driven
                  decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Account Setup ───────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-600" />
              Account Setup &amp; Security
            </CardTitle>
            <CardDescription>
              Keep your account secure and up to date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <User className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Complete Your Profile</p>
                <p className="text-xs text-slate-500">
                  Add a profile photo, bio, phone number, and address so colleagues and pupils can identify you.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => router.push('/staff/profile')}
                  className="p-0 h-auto text-blue-600 text-xs"
                >
                  Go to Profile →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Key className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Change Your Password</p>
                <p className="text-xs text-slate-500">
                  Regularly update your password for security. Go to Settings &gt; Account Security.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => router.push('/staff/settings')}
                  className="p-0 h-auto text-blue-600 text-xs"
                >
                  Go to Settings →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Bell className="h-4 w-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Configure Notifications</p>
                <p className="text-xs text-slate-500">
                  Choose which notifications you receive: email alerts, assignment updates, grade alerts, etc.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => router.push('/staff/settings')}
                  className="p-0 h-auto text-blue-600 text-xs"
                >
                  Go to Settings →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Next Steps ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Ready to get started? Here&apos;s what to do next
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/staff')}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/staff/attendance')}
                className="gap-2"
              >
                <CalendarCheck className="h-4 w-4" />
                Mark Attendance
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/staff/profile')}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Complete Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/staff/help')}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                More Help
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff Portal • Getting Started Guide</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}