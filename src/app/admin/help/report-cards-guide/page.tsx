/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowRight,
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
  FileCheck,
  LayoutDashboard,
  BarChart3,
  ExternalLink,
  Search,
  MessageSquare,
  Bell,
  AlertCircle,
  Info,
  Download,
  Eye,
  Edit,
  UserCheck,
  TrendingUp,
  Clock,
  Send,
  Printer,
  ClipboardCheck,
  BookMarked,
  XCircle,
  CheckCircle,
  FileSpreadsheet,
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
        {number < 7 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}
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

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    'draft': { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: FileText },
    'generated': { label: 'Generated', color: 'bg-amber-100 text-amber-700', icon: Clock },
    'pending': { label: 'Pending', color: 'bg-violet-100 text-violet-700', icon: AlertCircle },
    'approved': { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    'published': { label: 'Published', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    'rejected': { label: 'Rejected', color: 'bg-rose-100 text-rose-700', icon: XCircle },
  }

  const config = statusMap[status] || statusMap['draft']
  const Icon = config.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      config.color
    )}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminReportCardsGuidePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const quickActions = [
    {
      title: 'View Report Cards',
      description: 'See all report cards',
      icon: FileText,
      href: '/admin/report-cards',
      color: 'blue' as ColorKey
    },
    {
      title: 'Approval Queue',
      description: 'Review pending report cards',
      icon: ClipboardCheck,
      href: '/admin/report-cards/approval',
      color: 'violet' as ColorKey
    },
    {
      title: 'Generate Reports',
      description: 'Create new report cards',
      icon: FileCheck,
      href: '/admin/broadsheet',
      color: 'emerald' as ColorKey
    },
    {
      title: 'Publish Reports',
      description: 'Publish approved report cards',
      icon: Send,
      href: '/admin/report-cards/publish',
      color: 'amber' as ColorKey
    },
  ]

  const steps: Step[] = [
    {
      number: 1,
      title: 'Generate Report Cards',
      description: 'Go to the Broad Sheet, select students who meet the minimum subject requirement (20 out of 22 subjects), and click "Generate Reports".',
      icon: FileText,
      tips: [
        'Only students with 20+ subjects can generate report cards',
        'Scores must be entered before generating'
      ],
      warning: 'Make sure all scores are correct before generating.'
    },
    {
      number: 2,
      title: 'Review Generated Reports',
      description: 'After generation, report cards appear in the Report Cards section with "Generated" status.',
      icon: Eye,
      tips: ['Review each report card for accuracy', 'Check scores, remarks, and comments']
    },
    {
      number: 3,
      title: 'Approve Report Cards',
      description: 'Go to the Approval Queue, review each report card, and approve or reject them.',
      icon: CheckCircle2,
      tips: ['Approve only accurate report cards', 'Add comments for rejected ones']
    },
    {
      number: 4,
      title: 'Publish Report Cards',
      description: 'Approved report cards can be published to make them visible to students and parents.',
      icon: Send,
      tips: ['Published report cards cannot be edited', 'Ensure all approvals are done before publishing']
    },
    {
      number: 5,
      title: 'View Student Report Cards',
      description: 'Students can view their published report cards on their dashboard under the Report Cards section.',
      icon: Eye,
      tips: ['Students can print their report cards', 'Parents can view through parent portal']
    },
    {
      number: 6,
      title: 'Print Report Cards',
      description: 'Admins can print individual or bulk report cards for distribution.',
      icon: Printer,
      tips: ['Use print-friendly format', 'Batch print for class distribution']
    },
    {
      number: 7,
      title: 'Archive Report Cards',
      description: 'Old report cards can be archived for record keeping while keeping the active ones visible.',
      icon: BookMarked,
      tips: ['Archive after next term begins', 'Keep for historical records']
    },
  ]

  const faqs = [
    {
      question: 'How do I generate report cards?',
      answer: 'Go to the Broad Sheet, select students with 20+ subjects, and click "Generate Reports".'
    },
    {
      question: 'What is the approval process?',
      answer: 'Generated report cards go to the Approval Queue where admins review and approve or reject them.'
    },
    {
      question: 'Can I edit a published report card?',
      answer: 'No, published report cards cannot be edited. You would need to unpublish and regenerate.'
    },
    {
      question: 'How do students view their report cards?',
      answer: 'Students can view published report cards on their dashboard under the Report Cards section.'
    },
    {
      question: 'What happens to rejected report cards?',
      answer: 'Rejected report cards need to be regenerated after corrections are made.'
    },
    {
      question: 'Can I print report cards?',
      answer: 'Yes, both individual and bulk printing is supported.'
    },
  ]

  const videoTutorials = [
    { title: 'Generating Report Cards', duration: '6:15' },
    { title: 'Approving Report Cards', duration: '4:30' },
    { title: 'Publishing Report Cards', duration: '3:45' },
    { title: 'Printing & Distribution', duration: '5:00' },
  ]

  const statusFlow = [
    { status: 'generated', label: 'Generated', color: 'bg-amber-100 text-amber-700' },
    { status: 'pending', label: 'Pending Approval', color: 'bg-violet-100 text-violet-700' },
    { status: 'approved', label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
    { status: 'published', label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
  ]

  return (
    // ✅ FIX: Centered with max-w-6xl mx-auto w-full px-2 lg:px-4 so content shifts to the right properly
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10 px-2 lg:px-4">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-[#0A2472] flex items-center gap-3">
              <FileCheck className="h-8 w-8 text-[#C9A84C]" />
              Report Cards Guide
            </h1>
            <p className="text-slate-500 mt-1">Learn how to manage, approve, and publish report cards.</p>
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
              placeholder="Search report cards guide..."
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

      {/* ─── Report Card Status Flow ────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#0A2472]" />
            Report Card Status Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2 py-4">
            {statusFlow.map((status, index) => (
              <Fragment key={status.status}>
                <div className="flex items-center gap-2">
                  <StatusBadge status={status.status} />
                </div>
                {index < statusFlow.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-300" />
                )}
              </Fragment>
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
                Complete Guide to Report Cards
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
                Report Card Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FeatureCard
                  icon={FileText}
                  title="Generate Report Cards"
                  description="Create report cards from student scores."
                  href="/admin/broadsheet"
                  color="blue"
                />
                <FeatureCard
                  icon={ClipboardCheck}
                  title="Approval Queue"
                  description="Review and approve generated report cards."
                  href="/admin/report-cards/approval"
                  color="violet"
                />
                <FeatureCard
                  icon={CheckCircle2}
                  title="Approve/Reject"
                  description="Approve or reject report cards with comments."
                  color="emerald"
                />
                <FeatureCard
                  icon={Send}
                  title="Publish"
                  description="Publish report cards to make them visible."
                  href="/admin/report-cards/publish"
                  color="amber"
                />
                <FeatureCard
                  icon={Eye}
                  title="View Report Cards"
                  description="View individual student report cards."
                  href="/admin/report-cards"
                  color="teal"
                />
                <FeatureCard
                  icon={Printer}
                  title="Print & Export"
                  description="Print or export report cards for distribution."
                  color="rose"
                />
                <FeatureCard
                  icon={Edit}
                  title="Edit Report Cards"
                  description="Edit report cards before publishing."
                  color="amber"
                />
                <FeatureCard
                  icon={BookMarked}
                  title="Archive"
                  description="Archive old report cards for records."
                  color="teal"
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
              { label: 'Broad Sheet Guide', href: '/admin/help/broadsheet-guide', icon: FileSpreadsheet },
              { label: 'Staff Guide', href: '/admin/help/staff-guide', icon: Users },
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