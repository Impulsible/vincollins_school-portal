/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Calculator, Users, School,
  CheckCircle2, XCircle, AlertCircle,
  ChevronRight, Sparkles, Shield,
  BookOpen, FileText, BarChart3,
  HelpCircle, Save, PenLine, CheckSquare,
  Percent, Target, Award, TrendingUp,
  ClipboardCheck, User, ListChecks,
  SaveAll, Eye, Edit3, RotateCcw,
  Star, Circle, TrendingDown,
  LayoutDashboard
} from 'lucide-react'

export default function ScoresGuidePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-white" />
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
              <Calculator className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-600">Scores Guide</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Hero Section ────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 shadow-lg">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-teal-400/10 blur-2xl" />
          
          <div className="relative">
            <Badge className="bg-white/20 text-white border-0 mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              Step-by-Step Guide
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">
              How to Enter Scores
            </h1>
            <p className="text-teal-100 text-lg max-w-2xl">
              Learn how to enter CA (40%) and Exam (60%) scores for your pupils.
              This guide covers everything from accessing the scores page to reviewing final grades.
            </p>
          </div>
        </div>

        {/* ── Quick Steps Overview ───────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-emerald-600" />
              Quick Steps Overview
            </CardTitle>
            <CardDescription>
              A quick summary of the scores entry process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  step: 1,
                  title: 'Access Scores',
                  description: 'Go to the Scores page from your sidebar.',
                  icon: Calculator,
                },
                {
                  step: 2,
                  title: 'Select Subject',
                  description: 'Choose the subject you want to enter scores for.',
                  icon: BookOpen,
                },
                {
                  step: 3,
                  title: 'Choose Class',
                  description: 'Select the class you are teaching.',
                  icon: School,
                },
                {
                  step: 4,
                  title: 'Enter Scores',
                  description: 'Enter CA (40%) and Exam (60%) for each pupil.',
                  icon: PenLine,
                },
                {
                  step: 5,
                  title: 'Review & Save',
                  description: 'Review all scores and save the term record.',
                  icon: SaveAll,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <item.icon className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Score Breakdown ─────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-emerald-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Percent className="h-4 w-4 text-emerald-600" />
              Score Breakdown
            </CardTitle>
            <CardDescription>
              Understanding the CA (40%) and Exam (60%) scoring system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <PenLine className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">CA Score (40%)</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Continuous Assessment score. This represents <strong>40%</strong> of the final grade.
                  Includes classwork, homework, quizzes, and class participation.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '40%' }} />
                  </div>
                  <span className="text-xs font-bold text-blue-600">40%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Exam Score (60%)</h4>
                </div>
                <p className="text-xs text-slate-600">
                  End-of-term examination score. This represents <strong>60%</strong> of the final grade.
                  Includes the written exam paper.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '60%' }} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600">60%</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-slate-700">Total Score = CA (40%) + Exam (60%)</p>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                The total score is automatically calculated when both CA and Exam scores are entered.
                Example: CA = 35, Exam = 55 → Total = 90%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 1: Access the Scores Page ────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-emerald-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">1</span>
              Access the Scores Page
            </CardTitle>
            <CardDescription>
              Navigate to the scores section of the staff portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                There are <strong>three ways</strong> to access the scores page:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>
                  <strong>From the Sidebar:</strong> Click on the <strong>Scores</strong> icon in the left sidebar.
                </li>
                <li>
                  <strong>From the Dashboard:</strong> Click the <strong>Quick Actions</strong> card labeled &quot;Scores&quot;.
                </li>
                <li>
                  <strong>From the Help Page:</strong> Click the <strong>Scores</strong> quick link on the help page.
                </li>
              </ul>
            </div>

            <Button
              onClick={() => router.push('/staff/scores')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Calculator className="h-4 w-4" />
              Go to Scores Page
            </Button>
          </CardContent>
        </Card>

        {/* ── Step 2: Select Subject and Class ───────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-emerald-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">2</span>
              Select Subject and Class
            </CardTitle>
            <CardDescription>
              Choose the subject and class you want to enter scores for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                Once on the scores page, you&apos;ll need to <strong>select the subject and class</strong>:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>
                  <strong>Subject:</strong> Select the subject from the dropdown list (e.g., Mathematics, English, Basic Science).
                </li>
                <li>
                  <strong>Class:</strong> Select the class you are teaching (e.g., Primary 5, JSS 2, SS 1).
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>
                <strong>Note:</strong> You can only enter scores for classes and subjects assigned to you.
                If you don&apos;t see your class or subject, contact the admin.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 3: Enter CA and Exam Scores ───────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-emerald-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">3</span>
              Enter CA and Exam Scores
            </CardTitle>
            <CardDescription>
              Enter CA (40%) and Exam (60%) scores for each pupil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                After selecting the subject and class, you&apos;ll see a <strong>pupil list</strong> with input fields for CA and Exam scores:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li><strong>CA Score:</strong> Enter the Continuous Assessment score (0–40).</li>
                <li><strong>Exam Score:</strong> Enter the Examination score (0–60).</li>
                <li><strong>Total:</strong> The total score (CA + Exam) is calculated automatically.</li>
                <li><strong>Remark:</strong> A grade remark is assigned based on the total.</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-xs text-slate-500">CA Score</div>
                <div className="text-2xl font-bold text-blue-600">0–40</div>
                <div className="text-[10px] text-blue-500">Continuous Assessment</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <div className="text-xs text-slate-500">Exam Score</div>
                <div className="text-2xl font-bold text-emerald-600">0–60</div>
                <div className="text-[10px] text-emerald-500">End-of-Term Exam</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <div className="text-xs text-slate-500">Total Score</div>
                <div className="text-2xl font-bold text-amber-600">0–100</div>
                <div className="text-[10px] text-amber-500">CA + Exam</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <PenLine className="h-4 w-4 text-emerald-600" />
              <span>
                <strong>Tip:</strong> Use the <strong>Tab</strong> key to move quickly between input fields.
                This speeds up data entry significantly.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 4: Grade Remarks ───────────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-emerald-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">4</span>
              Grade Remarks
            </CardTitle>
            <CardDescription>
              Understanding the grade remark system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Based on the total score, pupils receive a grade remark. Here is the grading scale:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { range: '80–100', remark: 'Excellent', color: 'emerald' },
                  { range: '70–79', remark: 'Very Good', color: 'blue' },
                  { range: '60–69', remark: 'Good', color: 'teal' },
                  { range: '50–59', remark: 'Satisfactory', color: 'amber' },
                  { range: '45–49', remark: 'Average', color: 'orange' },
                  { range: '1–44', remark: 'Fair', color: 'rose' },
                ].map((grade) => (
                  <div
                    key={grade.range}
                    className={`p-3 rounded-xl bg-${grade.color}-50 border border-${grade.color}-200 text-center`}
                  >
                    <div className={`text-sm font-bold text-${grade.color}-700`}>{grade.range}</div>
                    <div className={`text-xs font-medium text-${grade.color}-600`}>{grade.remark}</div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center mt-1">
                <div className="text-sm font-bold text-slate-500">0</div>
                <div className="text-xs font-medium text-slate-400">Not graded</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Step 5: Review and Save ────────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-emerald-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">5</span>
              Review and Save Scores
            </CardTitle>
            <CardDescription>
              Review all scores and save the term record
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-600">
                Before saving, <strong>review</strong> all scores carefully:
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 list-disc list-inside">
                <li>Check that all pupils have both CA and Exam scores entered</li>
                <li>Verify that scores are within the correct ranges (CA: 0–40, Exam: 0–60)</li>
                <li>Ensure the total and grade remark are accurate</li>
                <li>Make corrections if needed before saving</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>
                <strong>⚠️ Important:</strong> Once saved, scores are permanently recorded for the term.
                Double-check all entries before saving!
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Eye className="h-4 w-4 text-emerald-600" />
              <span>
                <strong>Tip:</strong> Use the <strong>Save All</strong> button to save all scores at once.
                This prevents data loss if you need to leave the page.
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
              Tips and recommendations for efficient scores entry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckSquare className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Double-check all scores</p>
                <p className="text-xs text-emerald-600">
                  Review each pupil&apos;s scores before saving. A single mistake can affect a pupil&apos;s final grade.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <SaveAll className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Save regularly</p>
                <p className="text-xs text-emerald-600">
                  Save your progress periodically to avoid losing data due to connection issues.
                  The &quot;Save All&quot; button saves all scores at once.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <RotateCcw className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Correct mistakes promptly</p>
                <p className="text-xs text-emerald-600">
                  If you notice a mistake, correct it immediately. If the term has been closed, contact support.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <BarChart3 className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Monitor class performance</p>
                <p className="text-xs text-emerald-600">
                  After saving, review the class averages and identify pupils who may need extra support.
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
              Troubleshooting common scores entry problems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Pupil not showing in scores list</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Ensure the pupil is active and assigned to the class.
                Contact the admin if the pupil is missing.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Cannot save scores</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Check that all scores are within the correct ranges.
                CA must be 0–40, Exam must be 0–60. If the issue persists, contact support.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Scores not updating after save</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Refresh the page and try again. If scores still don&apos;t update,
                contact support for assistance.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-semibold text-amber-700">Grade remark incorrect</p>
              <p className="text-xs text-amber-600">
                <strong>Solution:</strong> Check that the total score is calculated correctly.
                Grade remarks are automatically assigned based on the total. If incorrect, verify the CA and Exam scores.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Next Steps ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Ready to Start Entering Scores?
            </CardTitle>
            <CardDescription>
              Put your knowledge into practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/staff/scores')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Calculator className="h-4 w-4" />
                Go to Scores
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
          <p>Vincollins Schools Staff Portal • Scores Guide</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}