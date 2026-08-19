/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, BarChart3, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Sparkles, Shield,
  BookOpen, FileText, Users,
  HelpCircle, Target, Award,
  PieChart, LineChart, Activity,
  Eye, ListChecks, Clock,
  Calendar, GraduationCap, School,
  LayoutDashboard, Star, Percent,
  User, Filter, Download
} from 'lucide-react'

export default function AnalyticsGuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-600 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-white" />
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
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Analytics Guide</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-teal-600 to-emerald-600 p-8 shadow-lg">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-emerald-400/10 blur-2xl" />
          
          <div className="relative">
            <Badge className="bg-white/20 text-white border-0 mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              Step-by-Step Guide
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">
              Understanding Analytics
            </h1>
            <p className="text-teal-100 text-lg max-w-2xl">
              Learn how to use the analytics dashboard to track class performance,
              identify trends, and make data-driven decisions.
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
              A quick summary of the analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  step: 1,
                  title: 'Access Analytics',
                  description: 'Go to the Analytics page from your sidebar.',
                  icon: BarChart3,
                },
                {
                  step: 2,
                  title: 'View Overview',
                  description: 'See summary statistics for your classes.',
                  icon: LayoutDashboard,
                },
                {
                  step: 3,
                  title: 'Analyze Performance',
                  description: 'Review class averages, trends, and outliers.',
                  icon: TrendingUp,
                },
                {
                  step: 4,
                  title: 'Take Action',
                  description: 'Use insights to improve teaching strategies.',
                  icon: Target,
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

        {/* ── Step 1: Access the Analytics Page ───────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
              Access the Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Navigate to the analytics section of the staff portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                There are <strong>two ways</strong> to access the analytics page:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>
                  <strong>From the Sidebar:</strong> Click on the <strong>Analytics</strong> icon in the left sidebar.
                </li>
                <li>
                  <strong>From the Dashboard:</strong> Click the <strong>Quick Actions</strong> card labeled &quot;Analytics&quot;.
                </li>
              </ul>
            </div>

            <Button
              onClick={() => router.push('/staff/analytics')}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Go to Analytics
            </Button>
          </CardContent>
        </Card>

        {/* ── Step 2: Understanding the Overview ──────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
              Understanding the Overview
            </CardTitle>
            <CardDescription>
              See key metrics at a glance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                The analytics dashboard provides a <strong>high-level overview</strong> of your class performance:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Total Pupils:</strong> Number of pupils in your classes.</li>
                <li><strong>Average Performance:</strong> Overall average score across all subjects.</li>
                <li><strong>Class Breakdown:</strong> Distribution of pupils across classes.</li>
                <li><strong>Recent Activity:</strong> Latest assignments, notes, and submissions.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {[
                { label: 'Total Pupils', value: '42', icon: Users, color: 'blue' },
                { label: 'Avg. Score', value: '68%', icon: Percent, color: 'emerald' },
                { label: 'Classes', value: '4', icon: School, color: 'purple' },
                { label: 'Subjects', value: '12', icon: BookOpen, color: 'amber' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-3 rounded-xl bg-${stat.color}-50 border border-${stat.color}-200 text-center`}
                >
                  <stat.icon className={`h-4 w-4 text-${stat.color}-600 mx-auto mb-1`} />
                  <div className={`text-lg font-bold text-${stat.color}-700`}>{stat.value}</div>
                  <div className={`text-xs text-${stat.color}-600`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Step 3: Class Performance Breakdown ─────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
              Class Performance Breakdown
            </CardTitle>
            <CardDescription>
              See how each class is performing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                The analytics dashboard shows a <strong>breakdown of each class</strong>:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Class Name:</strong> The name of the class (e.g., Primary 5, JSS 2).</li>
                <li><strong>Pupil Count:</strong> Number of pupils in the class.</li>
                <li><strong>Average Score:</strong> The class average across all subjects.</li>
                <li><strong>Performance Bar:</strong> Visual representation of the class average.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Primary 5</span>
                <span className="font-bold text-blue-600">72%</span>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '72%' }} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">28 pupils</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span>
                <strong>Tip:</strong> Compare class averages to identify which classes are excelling and which need additional support.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 4: Subject Performance ─────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">4</span>
              Subject Performance Analysis
            </CardTitle>
            <CardDescription>
              See how pupils are performing in each subject
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                The analytics dashboard also shows <strong>subject-level performance</strong>:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Subject Name:</strong> The name of the subject (e.g., Mathematics, English).</li>
                <li><strong>Average Score:</strong> The subject average across all pupils.</li>
                <li><strong>Performance Trend:</strong> Whether the subject is improving or declining.</li>
                <li><strong>Top Pupils:</strong> Pupils who are excelling in each subject.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">Mathematics</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600">78%</span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">English</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-600">65%</span>
                  <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">Basic Science</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-600">58%</span>
                  <Activity className="h-3.5 w-3.5 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Target className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Tip:</strong> Use subject performance data to identify which subjects need more attention and which pupils are struggling.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 5: Pupil Performance Tracking ──────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">5</span>
              Individual Pupil Tracking
            </CardTitle>
            <CardDescription>
              Monitor individual pupil performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                You can also track <strong>individual pupil performance</strong>:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Pupil Name:</strong> The name of the pupil.</li>
                <li><strong>Overall Average:</strong> The pupil's average score across all subjects.</li>
                <li><strong>Subject Scores:</strong> Individual subject scores.</li>
                <li><strong>Trend:</strong> Whether the pupil is improving, stable, or declining.</li>
                <li><strong>Remark:</strong> Performance remark (Excellent, Very Good, Good, Satisfactory, Average, Fair).</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  AA
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Adebayo Adeola</p>
                  <p className="text-xs text-slate-400">Primary 5 · Mathematics</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">85%</p>
                <p className="text-xs text-emerald-500">Excellent</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Tip:</strong> Use individual pupil data to provide targeted support and interventions.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 6: Trends and Insights ────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">6</span>
              Trends and Insights
            </CardTitle>
            <CardDescription>
              Identify trends and make data-driven decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                The analytics dashboard helps you identify <strong>trends and insights</strong>:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Class Trends:</strong> Which classes are improving or declining over time.</li>
                <li><strong>Subject Trends:</strong> Which subjects are showing improvement or decline.</li>
                <li><strong>Pupil Trends:</strong> Which pupils are improving, stable, or declining.</li>
                <li><strong>Overall Performance:</strong> How the term is progressing.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-sm font-bold text-emerald-700">Improving</p>
                <p className="text-xs text-emerald-600">Primary 5, JSS 2</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <TrendingDown className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <p className="text-sm font-bold text-amber-700">Declining</p>
                <p className="text-xs text-amber-600">SS 1, JSS 3</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>
                <strong>Tip:</strong> Use trends to anticipate future performance and proactively address issues.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 7: Export and Reports ──────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">7</span>
              Export Reports
            </CardTitle>
            <CardDescription>
              Generate and export analytics reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                You can <strong>export analytics data</strong> for reporting and analysis:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>Class Performance Report:</strong> Export class-level performance data.</li>
                <li><strong>Subject Performance Report:</strong> Export subject-level performance data.</li>
                <li><strong>Pupil Performance Report:</strong> Export individual pupil performance data.</li>
                <li><strong>Term Summary Report:</strong> Export a summary of the term's performance.</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
              <Download className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-700">Export Data</p>
                <p className="text-xs text-blue-600">
                  Click the &quot;Export&quot; button to download reports in CSV or JSON format.
                </p>
              </div>
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
              Tips for using analytics effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Eye className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Review regularly</p>
                <p className="text-xs text-emerald-600">
                  Check the analytics dashboard weekly to stay on top of class performance and identify issues early.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Target className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Identify outliers</p>
                <p className="text-xs text-emerald-600">
                  Look for pupils who are significantly above or below the class average and provide targeted support.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Activity className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Track trends</p>
                <p className="text-xs text-emerald-600">
                  Monitor performance trends over time to see if your teaching strategies are effective.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <Users className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Share insights</p>
                <p className="text-xs text-emerald-600">
                  Share analytics insights with other teachers and administrators to collaborate on improving pupil outcomes.
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
              Troubleshooting common analytics problems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Data not showing</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Ensure you have entered scores and marked attendance for your classes.
                Analytics data is derived from these inputs.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Pupil not showing in analytics</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Ensure the pupil is active and assigned to your class.
                Contact the admin if the pupil is missing.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Analytics not updating</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Refresh the page. Analytics data updates automatically but may require a refresh.
                If the issue persists, contact support.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Next Steps ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Ready to Explore Analytics?
            </CardTitle>
            <CardDescription>
              Put your knowledge into practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/staff/analytics')}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Go to Analytics
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
          <p>Vincollins Schools Staff Portal • Analytics Guide</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}