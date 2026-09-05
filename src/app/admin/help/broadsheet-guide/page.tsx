'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Video,
  LayoutDashboard,
  BarChart3,
  ExternalLink,
  Search,
  MessageSquare,
  Bell,
  AlertCircle,
  Info,
  FileSpreadsheet,
  Download,
  Filter,
  Eye,
  Award,
  TrendingUp,
  Send,
  Table,
  Printer,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────────
type ColorKey = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'teal'

interface Step {
  number: number
  title: string
  description: string
  icon: React.ElementType
  tips?: string[]
  warning?: string
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  href?: string
  color?: ColorKey
}

// ─── Static Color Maps (Fixes missing Tailwind classes) ─────────────────────────
const colorMap: Record<ColorKey, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  violet: 'bg-violet-50 border-violet-200 text-violet-600',
  amber: 'bg-amber-50 border-amber-200 text-amber-600',
  rose: 'bg-rose-50 border-rose-200 text-rose-600',
  teal: 'bg-teal-50 border-teal-200 text-teal-600',
}

const hoverMap: Record<ColorKey, string> = {
  blue: 'hover:border-blue-300',
  emerald: 'hover:border-emerald-300',
  violet: 'hover:border-violet-300',
  amber: 'hover:border-amber-300',
  rose: 'hover:border-rose-300',
  teal: 'hover:border-teal-300',
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, href, color = 'blue' }: FeatureCardProps) {
  const card = (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md',
      colorMap[color],
      'hover:bg-opacity-70'
    )}>
      <div className="p-2 rounded-lg bg-white/80 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      {href && (
        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
      )}
    </div>
  )

  if (href) {
    return <NextLink href={href}>{card}</NextLink>
  }
  return card
}

// ─── Step Card ─────────────────────────────────────────────────────────────────
function StepGuide({ number, title, description, icon: Icon, tips, warning }: Step) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-[#0A2472] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {number}
        </div>
        {number < 8 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-[#0A2472]" />
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
        {tips && tips.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-slate-600">💡 Tips:</p>
            <ul className="space-y-0.5">
              {tips.map((tip, index) => (
                <li key={index} className="text-xs text-slate-500 flex items-start gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
        {warning && (
          <div className="mt-2 flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">{warning}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({ title, duration }: { title: string; duration: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-[#0A2472]/10 to-[#C9A84C]/10 aspect-video">
        <div className="w-full h-full flex items-center justify-center">
          <PlayCircle className="h-12 w-12 text-[#0A2472]/30 group-hover:text-[#0A2472]/60 transition-colors" />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <PlayCircle className="h-8 w-8 text-[#0A2472] ml-1" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          {duration}
        </div>
      </div>
      <p className="text-xs font-medium text-slate-700 mt-1.5">{title}</p>
    </div>
  )
}

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-medium text-slate-700">{question}</span>
        <ChevronRight className={cn(
          "h-4 w-4 text-slate-400 transition-transform",
          open && "rotate-90"
        )} />
      </button>
      {open && (
        <div className="pb-3 text-sm text-slate-500 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminBroadsheetGuidePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const quickActions = [
    {
      title: 'View Broad Sheet',
      description: 'See all student performance at a glance',
      icon: FileSpreadsheet,
      href: '/admin/broadsheet',
      color: 'blue' as ColorKey
    },
    {
      title: 'Generate Reports',
      description: 'Create report cards from broad sheet',
      icon: FileText,
      href: '/admin/broadsheet?action=generate',
      color: 'emerald' as ColorKey
    },
    {
      title: 'Export Data',
      description: 'Download broad sheet as CSV',
      icon: Download,
      href: '/admin/broadsheet/export',
      color: 'violet' as ColorKey
    },
    {
      title: 'Refresh Data',
      description: 'Update broad sheet with latest scores',
      icon: RefreshCw,
      href: '/admin/broadsheet?action=refresh',
      color: 'amber' as ColorKey
    },
  ]

  const steps: Step[] = [
    {
      number: 1,
      title: 'Access the Broad Sheet',
      description: 'Navigate to the Broad Sheet section from the admin sidebar or dashboard quick actions.',
      icon: LayoutDashboard,
      tips: ['Use the sidebar navigation', 'Quick access from dashboard']
    },
    {
      number: 2,
      title: 'Select Class & Term',
      description: 'Choose the class and term you want to view. The broad sheet will display all students in that class.',
      icon: Filter,
      tips: ['Filter by class for better focus', 'Select the current term for up-to-date data']
    },
    {
      number: 3,
      title: 'View Student Scores',
      description: 'Each row shows a student with their scores across all subjects. CA (40%) and Exam (60%) scores are displayed.',
      icon: Eye,
      tips: [
        'CA = Continuous Assessment (40%)',
        'Exam = End of Term Exam (60%)',
        'Total = CA + Exam combined'
      ]
    },
    {
      number: 4,
      title: 'Understand Performance Metrics',
      description: 'Each student shows their total score, average percentage, and overall remark. The remark indicates performance level.',
      icon: BarChart3,
      tips: [
        'Excellent: 80-100%',
        'Very Good: 70-79%',
        'Good: 60-69%',
        'Satisfactory: 50-59%',
        'Average: 45-49%',
        'Fair: Below 45%'
      ]
    },
    {
      number: 5,
      title: 'Generate Report Cards',
      description: 'Select students who have met the minimum subject requirement (20 out of 22 subjects) and generate their report cards.',
      icon: FileText,
      tips: ['Only students with 20+ subjects can generate report cards', 'Generated report cards go to approval queue'],
      warning: 'Ensure all scores are entered before generating report cards.'
    },
    {
      number: 6,
      title: 'Publish Report Cards',
      description: 'Review generated report cards and publish them to make them visible to students and parents.',
      icon: Send,
      tips: ['Review before publishing', 'Published report cards are final']
    },
    {
      number: 7,
      title: 'Export Broad Sheet Data',
      description: 'Download the broad sheet as CSV for offline analysis or record keeping.',
      icon: Download,
      tips: ['Use filters before exporting', 'Export data for backup or reporting']
    },
    {
      number: 8,
      title: 'Monitor Student Progress',
      description: 'Use the broad sheet to track student performance trends and identify areas needing improvement.',
      icon: TrendingUp,
      tips: ['Compare performance across subjects', 'Identify struggling students early']
    },
  ]

  const faqs = [
    {
      question: 'What is the Broad Sheet?',
      answer: 'The Broad Sheet is a comprehensive view showing all students and their scores across all subjects for a selected term and class.'
    },
    {
      question: 'How are scores calculated?',
      answer: 'Total Score = CA (40%) + Exam (60%). The average is calculated across all completed subjects.'
    },
    {
      question: 'What is the minimum subject requirement?',
      answer: 'Students need at least 20 out of 22 subjects to generate a report card.'
    },
    {
      question: 'How do I generate report cards?',
      answer: 'Select the students who meet the minimum subject requirement and click "Generate Reports". The report cards will go to the approval queue.'
    },
    {
      question: 'What happens after I publish report cards?',
      answer: 'Published report cards become visible to students and parents on their dashboards.'
    },
    {
      question: 'Can I export the broad sheet?',
      answer: 'Yes, you can export the broad sheet as a CSV file for offline analysis or record keeping.'
    },
  ]

  const videoTutorials = [
    { title: 'Understanding the Broad Sheet', duration: '5:30' },
    { title: 'Generating Report Cards', duration: '6:15' },
    { title: 'Publishing Report Cards', duration: '4:45' },
    { title: 'Exporting & Reporting', duration: '3:30' },
  ]

  const remarkGrades = [
    { remark: 'Excellent', range: '80-100%', color: 'bg-emerald-100 text-emerald-700' },
    { remark: 'Very Good', range: '70-79%', color: 'bg-blue-100 text-blue-700' },
    { remark: 'Good', range: '60-69%', color: 'bg-cyan-100 text-cyan-700' },
    { remark: 'Satisfactory', range: '50-59%', color: 'bg-amber-100 text-amber-700' },
    { remark: 'Average', range: '45-49%', color: 'bg-orange-100 text-orange-700' },
    { remark: 'Fair', range: '0-44%', color: 'bg-rose-100 text-rose-700' },
  ]

  return (
    // ✅ FIX: Centered with max-w-6xl mx-auto w-full px-2 lg:px-4 so content shifts to the right properly
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10 px-2 lg:px-4">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-[#0A2472] flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-[#C9A84C]" />
              Broad Sheet Guide
            </h1>
            <p className="text-slate-500 mt-1">Learn how to use the Broad Sheet to manage student performance and generate report cards.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#0A2472] text-white px-3 py-1">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Admin Guide
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Updated: 2026
            </Badge>
          </div>
        </div>
      </div>

      {/* ─── Search ──────────────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search broad sheet guide..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Quick Actions ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-display text-[#0A2472]">Quick Actions</h2>
          <Badge variant="outline" className="text-xs">Common tasks</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <NextLink key={action.title} href={action.href}>
              <div className={cn(
                'group flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer',
                colorMap[action.color],
                hoverMap[action.color],
                'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
              )}>
                <div className="p-2 rounded-lg bg-white/80 shadow-sm">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800">{action.title}</h3>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </NextLink>
          ))}
        </div>
      </div>

      {/* ─── Remark Grades ──────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <Award className="h-5 w-5 text-[#0A2472]" />
            Performance Remarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {remarkGrades.map((grade) => (
              <div key={grade.remark} className={cn(
                'p-3 rounded-lg text-center border',
                grade.color,
                'border-slate-200'
              )}>
                <p className="font-semibold text-sm">{grade.remark}</p>
                <p className="text-xs opacity-75">{grade.range}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Tabs ────────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="steps" className="text-xs">Step-by-Step Guide</TabsTrigger>
          <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
          <TabsTrigger value="faq" className="text-xs">FAQ</TabsTrigger>
          <TabsTrigger value="videos" className="text-xs">Videos</TabsTrigger>
        </TabsList>

        {/* ─── Steps Tab ────────────────────────────────────────────────────── */}
        <TabsContent value="steps" className="mt-4">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Complete Guide to the Broad Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {steps.map((step) => (
                  <StepGuide key={step.number} {...step} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Features Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="features" className="mt-4">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#C9A84C]" />
                Broad Sheet Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FeatureCard
                  icon={Table}
                  title="Comprehensive View"
                  description="See all students and their scores in one place."
                  href="/admin/broadsheet"
                  color="blue"
                />
                <FeatureCard
                  icon={Filter}
                  title="Class & Term Filtering"
                  description="Filter by class and term for focused analysis."
                  color="emerald"
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Performance Metrics"
                  description="View total scores, averages, and remarks for each student."
                  color="violet"
                />
                <FeatureCard
                  icon={FileText}
                  title="Report Generation"
                  description="Generate report cards for eligible students."
                  href="/admin/broadsheet?action=generate"
                  color="amber"
                />
                <FeatureCard
                  icon={Send}
                  title="Publish Report Cards"
                  description="Publish report cards to make them visible to students."
                  color="rose"
                />
                <FeatureCard
                  icon={Download}
                  title="Export Data"
                  description="Download broad sheet data as CSV."
                  href="/admin/broadsheet/export"
                  color="teal"
                />
                <FeatureCard
                  icon={Printer}
                  title="Print View"
                  description="Print the broad sheet for offline records."
                  color="blue"
                />
                <FeatureCard
                  icon={RefreshCw}
                  title="Auto-Refresh"
                  description="Automatically refresh data to show latest scores."
                  color="emerald"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── FAQ Tab ────────────────────────────────────────────────────────── */}
        <TabsContent value="faq" className="mt-4">
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {faqs.map((faq, index) => (
                  <FAQItem key={index} {...faq} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Videos Tab ────────────────────────────────────────────────────── */}
        <TabsContent value="videos" className="mt-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-display text-[#0A2472] flex items-center gap-2">
                <Video className="h-5 w-5 text-violet-600" />
                Video Tutorials
              </h2>
              <Badge variant="outline" className="text-xs">Watch & Learn</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {videoTutorials.map((video, index) => (
                <VideoCard key={index} {...video} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── Report Card Flow ────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft bg-gradient-to-r from-violet-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-violet-100">
              <FileText className="h-5 w-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-violet-800">Report Card Flow</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white/60 rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Enter Scores</p>
              <p className="text-xs text-slate-500">CA & Exam scores entered</p>
            </div>
            <div className="p-3 bg-white/60 rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-emerald-600">2</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Generate</p>
              <p className="text-xs text-slate-500">Report cards generated</p>
            </div>
            <div className="p-3 bg-white/60 rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-amber-600">3</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Approve</p>
              <p className="text-xs text-slate-500">Admin approves report cards</p>
            </div>
            <div className="p-3 bg-white/60 rounded-lg text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-emerald-600">4</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Publish</p>
              <p className="text-xs text-slate-500">Students view report cards</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Quick Reference ────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-600" />
            Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Minimum Subjects</p>
              <p className="text-slate-500 text-xs">20 out of 22 subjects required</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Score Calculation</p>
              <p className="text-slate-500 text-xs">CA (40%) + Exam (60%) = Total</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Report Card Status</p>
              <p className="text-slate-500 text-xs">Generated → Approved → Published</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Helpful Links ──────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            {/* ✅ FIX: BookOpen icon instead of broken <Link /> component */}
            <BookOpen className="h-5 w-5 text-[#0A2472]" />
            Related Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Getting Started', href: '/admin/help/getting-started', icon: Sparkles },
              { label: 'Students Guide', href: '/admin/help/students-guide', icon: GraduationCap },
              { label: 'Staff Guide', href: '/admin/help/staff-guide', icon: Users },
              { label: 'Report Card Guide', href: '/admin/help/report-cards', icon: FileText },
            ].map((link) => (
              <NextLink
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <link.icon className="h-4 w-4 text-[#0A2472]" />
                <span className="text-sm text-slate-600 group-hover:text-[#0A2472]">{link.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-auto group-hover:text-[#0A2472]" />
              </NextLink>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Contact Support ────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft bg-gradient-to-r from-[#0A2472]/5 to-[#C9A84C]/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-[#0A2472]/10">
                <MessageSquare className="h-6 w-6 text-[#0A2472]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0A2472]">Need More Help?</h3>
                <p className="text-sm text-slate-500">Contact our support team for assistance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-slate-200"
                onClick={() => router.push('/admin/help/faq')}
              >
                <Bell className="h-4 w-4 mr-2" />
                FAQ
              </Button>
              <Button
                className="bg-[#0A2472] hover:bg-[#1A3A8A]"
                onClick={() => router.push('/admin/help/contact')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
        <p>Vincollins Schools Admin Portal • Geared Towards Excellence</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>
    </div>
  )
}