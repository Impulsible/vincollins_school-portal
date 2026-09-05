/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
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
  Calendar,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Video,
  LayoutDashboard,
  UserPlus,
  BarChart3,
  ExternalLink,
  Search,
  MessageSquare,
  Bell,
  Copy,
  Check,
  AlertCircle,
  Info,
  FileSpreadsheet,
  Upload,
  Download,
  Filter,
  Eye,
  Edit,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────────
interface Step {
  number: number
  title: string
  description: string
  icon: React.ElementType
  tips?: string[]
  warning?: string
}

type ColorKey = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'teal'

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  href?: string
  color?: ColorKey
}

// ─── Static Color Maps (Fixes missing Tailwind colors) ─────────────────────────
const colorMap: Record<ColorKey, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
  violet: 'bg-violet-50 border-violet-200 text-violet-600',
  amber: 'bg-amber-50 border-amber-200 text-amber-600',
  rose: 'bg-rose-50 border-rose-200 text-rose-600',
  teal: 'bg-teal-50 border-teal-200 text-teal-600',
}

const quickActionHoverMap: Record<ColorKey, string> = {
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
export default function AdminStudentsGuidePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const quickActions = [
    {
      title: 'Add Student',
      description: 'Enroll a new student',
      icon: UserPlus,
      href: '/admin/students?action=add',
      color: 'blue' as ColorKey
    },
    {
      title: 'Import Students',
      description: 'Bulk upload from CSV',
      icon: Upload,
      href: '/admin/students/import',
      color: 'emerald' as ColorKey
    },
    {
      title: 'Export Students',
      description: 'Download student data',
      icon: Download,
      href: '/admin/students/export',
      color: 'violet' as ColorKey
    },
    {
      title: 'View All Students',
      description: 'Manage student records',
      icon: Users,
      href: '/admin/students',
      color: 'teal' as ColorKey
    },
  ]

  const steps: Step[] = [
    {
      number: 1,
      title: 'Access Student Management',
      description: 'Navigate to the Students section from the admin sidebar. You can also access it directly from the dashboard quick actions.',
      icon: LayoutDashboard,
      tips: ['Use the sidebar navigation', 'Add to favorites for quick access']
    },
    {
      number: 2,
      title: 'Add a New Student',
      description: 'Click the "Add Student" button. Fill in the required fields: First Name, Last Name, Class, Admission Number, etc.',
      icon: UserPlus,
      tips: [
        'VIN ID and email are auto-generated',
        'Admission number should be unique',
        'Student will receive login credentials via email'
      ],
      warning: 'Make sure all required fields are filled before saving.'
    },
    {
      number: 3,
      title: 'View Student Profile',
      description: 'Click on any student\'s name to view their full profile, including personal information, academic records, and attendance.',
      icon: Eye,
      tips: ['Use the search bar to find students quickly', 'Filter by class or status']
    },
    {
      number: 4,
      title: 'Edit Student Information',
      description: 'Update student details such as contact information, class, or guardian details. Changes are saved immediately.',
      icon: Edit,
      tips: ['Keep guardian contact information up to date', 'Update class at the beginning of each term']
    },
    {
      number: 5,
      title: 'Manage Student Status',
      description: 'Activate or deactivate student accounts. Deactivated students cannot access the portal.',
      icon: UserCheck,
      tips: ['Deactivate when a student leaves the school', 'Reactivate when they return']
    },
    {
      number: 6,
      title: 'Bulk Import Students',
      description: 'Use the CSV import feature to add multiple students at once. Download the template for the correct format.',
      icon: Upload,
      tips: ['Download the template first', 'Ensure all required columns are filled'],
      warning: 'Importing will create new student accounts. Double-check the data before importing.'
    },
    {
      number: 7,
      title: 'Export Student Data',
      description: 'Export student data as CSV for reporting or backup purposes. You can export all students or filter by class.',
      icon: Download,
      tips: ['Use filters before exporting', 'Export contains all student information']
    },
    {
      number: 8,
      title: 'Student Reports',
      description: 'Generate reports for individual students or whole classes. View performance, attendance, and progress.',
      icon: BarChart3,
      tips: ['Generate report cards from here', 'Track student progress over time']
    },
  ]

  const faqs = [
    {
      question: 'How do I add a new student?',
      answer: 'Go to Students > Add Student. Fill in the required details and click Save. The student will receive their login credentials via email.'
    },
    {
      question: 'What is the VIN ID?',
      answer: 'VIN ID is a unique identifier for each student. It\'s auto-generated and follows the format: VIN-STD-YYYY-XXXX.'
    },
    {
      question: 'How do I import multiple students?',
      answer: 'Use the "Import Students" feature. Download the CSV template, fill in the student details, and upload the file. Make sure the data format matches the template.'
    },
    {
      question: 'What happens when I deactivate a student?',
      answer: 'Deactivated students cannot login to the portal. Their data is preserved and can be reactivated at any time.'
    },
    {
      question: 'How do I change a student\'s class?',
      answer: 'Edit the student profile and select the new class from the dropdown. The student will be moved to the new class immediately.'
    },
    {
      question: 'Can I export student data?',
      answer: 'Yes, use the "Export Students" feature to download student data as a CSV file. You can filter by class before exporting.'
    },
  ]

  const videoTutorials = [
    { title: 'Adding a New Student', duration: '3:45' },
    { title: 'Bulk Import Students', duration: '4:30' },
    { title: 'Managing Student Records', duration: '5:15' },
    { title: 'Student Reports & Analytics', duration: '6:00' },
  ]

  return (
    // ✅ FIX: Added max-w-6xl mx-auto w-full to center the content and push it away from the sidebar
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10 px-2 lg:px-4">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-[#0A2472] flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-[#C9A84C]" />
              Student Management Guide
            </h1>
            <p className="text-slate-500 mt-1">Learn how to manage students effectively in the Vincollins Schools Admin Portal.</p>
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
              placeholder="Search students guide..."
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
                quickActionHoverMap[action.color],
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
                Complete Guide to Student Management
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
                Student Management Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FeatureCard icon={UserPlus} title="Add Student" description="Enroll new students individually with all required details." href="/admin/students?action=add" color="blue" />
                <FeatureCard icon={Upload} title="Bulk Import" description="Upload multiple students at once using a CSV file." href="/admin/students/import" color="emerald" />
                <FeatureCard icon={Eye} title="View Profile" description="Access complete student profiles with all records." href="/admin/students" color="violet" />
                <FeatureCard icon={Edit} title="Edit Information" description="Update student details, class, and guardian information." href="/admin/students" color="amber" />
                <FeatureCard icon={UserCheck} title="Manage Status" description="Activate or deactivate student accounts." color="teal" />
                <FeatureCard icon={BarChart3} title="Reports" description="Generate performance and attendance reports." href="/admin/report-cards" color="rose" />
                <FeatureCard icon={FileSpreadsheet} title="Export Data" description="Export student data to CSV for reporting." href="/admin/students/export" color="violet" />
                <FeatureCard icon={Filter} title="Search & Filter" description="Find students quickly using search and filters." color="blue" />
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

      {/* ─── Import Template ────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft bg-blue-50 border-blue-100">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Import Template</h3>
                <p className="text-sm text-blue-600">Download the CSV template for bulk student import</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          <div className="mt-4 p-3 bg-white/80 rounded-lg border border-blue-200">
            <p className="text-xs text-slate-500 font-mono">
              Columns: first_name, last_name, middle_name, class, admission_number, gender, date_of_birth, guardian_name, guardian_phone, guardian_email
            </p>
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
              <p className="font-semibold text-slate-700">VIN ID Format</p>
              <p className="text-slate-500 font-mono text-xs">VIN-STD-2026-XXXX</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Default Password</p>
              <p className="text-slate-500 font-mono text-xs">Pupil's VIN ID</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Email Format</p>
              <p className="text-slate-500 font-mono text-xs">first.last@student.vincollins.edu</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Helpful Links ──────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            {/* ✅ FIX: Replaced `<Link>` component with `<BookOpen>` icon so it doesn't crash */}
            <BookOpen className="h-5 w-5 text-[#0A2472]" />
            Related Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Report Card Guide', href: '/admin/help/report-cards', icon: FileText },
              { label: 'Attendance Guide', href: '/admin/help/attendance', icon: Calendar },
              { label: 'Broad Sheet Guide', href: '/admin/help/broadsheet', icon: BarChart3 },
              { label: 'Getting Started', href: '/admin/help/getting-started', icon: Sparkles },
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