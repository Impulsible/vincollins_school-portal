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
  AlertCircle,
  Info,
  FileSpreadsheet,
  Upload,
  Download,
  Filter,
  Eye,
  Edit,
  UserCheck,
  Briefcase,
  Building2,
  BadgeCheck,
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

// ─── Static color maps (so Tailwind can see all classes) ──────────────────────
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
export default function AdminStaffGuidePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const quickActions = [
    {
      title: 'Add Staff',
      description: 'Hire a new staff member',
      icon: UserPlus,
      href: '/admin/staff?action=add',
      color: 'blue' as ColorKey
    },
    {
      title: 'Import Staff',
      description: 'Bulk upload from CSV',
      icon: Upload,
      href: '/admin/staff/import',
      color: 'emerald' as ColorKey
    },
    {
      title: 'Export Staff',
      description: 'Download staff data',
      icon: Download,
      href: '/admin/staff/export',
      color: 'violet' as ColorKey
    },
    {
      title: 'View All Staff',
      description: 'Manage staff records',
      icon: Briefcase,
      href: '/admin/staff',
      color: 'teal' as ColorKey
    },
  ]

  const steps: Step[] = [
    {
      number: 1,
      title: 'Access Staff Management',
      description: 'Navigate to the Staff section from the admin sidebar. You can also access it from the dashboard quick actions.',
      icon: LayoutDashboard,
      tips: ['Use the sidebar navigation', 'Add to favorites for quick access']
    },
    {
      number: 2,
      title: 'Add a New Staff Member',
      description: 'Click the "Add Staff" button. Fill in the required fields: First Name, Last Name, Department, Role, etc.',
      icon: UserPlus,
      tips: [
        'VIN ID and email are auto-generated',
        'Staff ID should be unique',
        'Staff will receive login credentials via email'
      ],
      warning: 'Ensure all required fields are filled before saving.'
    },
    {
      number: 3,
      title: 'View Staff Profile',
      description: "Click on any staff member's name to view their full profile, including personal information, department, and role.",
      icon: Eye,
      tips: ['Use the search bar to find staff quickly', 'Filter by department or role']
    },
    {
      number: 4,
      title: 'Edit Staff Information',
      description: 'Update staff details such as contact information, department, or role. Changes are saved immediately.',
      icon: Edit,
      tips: ['Keep contact information up to date', 'Update department when staff moves']
    },
    {
      number: 5,
      title: 'Manage Staff Status',
      description: 'Activate or deactivate staff accounts. Deactivated staff cannot access the portal.',
      icon: UserCheck,
      tips: ['Deactivate when staff leaves the school', 'Reactivate when they return']
    },
    {
      number: 6,
      title: 'Bulk Import Staff',
      description: 'Use the CSV import feature to add multiple staff members at once. Download the template for the correct format.',
      icon: Upload,
      tips: ['Download the template first', 'Ensure all required columns are filled'],
      warning: 'Importing will create new staff accounts. Double-check the data before importing.'
    },
    {
      number: 7,
      title: 'Export Staff Data',
      description: 'Export staff data as CSV for reporting or backup purposes.',
      icon: Download,
      tips: ['Use filters before exporting', 'Export contains all staff information']
    },
    {
      number: 8,
      title: 'Staff Reports',
      description: 'Generate reports for staff performance and activities.',
      icon: BarChart3,
      tips: ['Track staff performance over time', 'Generate department reports']
    },
  ]

  const faqs = [
    {
      question: 'How do I add a new staff member?',
      answer: 'Go to Staff > Add Staff. Fill in the required details and click Save. The staff member will receive their login credentials via email.'
    },
    {
      question: 'What is the VIN ID for staff?',
      answer: "VIN ID is a unique identifier for each staff member. It's auto-generated and follows the format: VIN-STF-YYYY-XXXX."
    },
    {
      question: 'How do I import multiple staff members?',
      answer: 'Use the "Import Staff" feature. Download the CSV template, fill in the staff details, and upload the file.'
    },
    {
      question: 'What happens when I deactivate a staff member?',
      answer: 'Deactivated staff cannot login to the portal. Their data is preserved and can be reactivated at any time.'
    },
    {
      question: "How do I change a staff member's role?",
      answer: 'Edit the staff profile and select the new role from the dropdown. The change takes effect immediately.'
    },
    {
      question: 'Can I export staff data?',
      answer: 'Yes, use the "Export Staff" feature to download staff data as a CSV file.'
    },
  ]

  const videoTutorials = [
    { title: 'Adding a New Staff Member', duration: '3:45' },
    { title: 'Bulk Import Staff', duration: '4:30' },
    { title: 'Managing Staff Records', duration: '5:15' },
    { title: 'Staff Reports & Analytics', duration: '6:00' },
  ]

  return (
    // ✅ FIX: Center content and push it away from the sidebar
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10 px-2 lg:px-4">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-[#0A2472] flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-[#C9A84C]" />
              Staff Management Guide
            </h1>
            <p className="text-slate-500 mt-1">Learn how to manage staff members effectively in the Vincollins Schools Admin Portal.</p>
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
              placeholder="Search staff guide..."
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
                Complete Guide to Staff Management
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
                Staff Management Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FeatureCard icon={UserPlus} title="Add Staff" description="Hire new staff members individually with all required details." href="/admin/staff?action=add" color="blue" />
                <FeatureCard icon={Upload} title="Bulk Import" description="Upload multiple staff members at once using a CSV file." href="/admin/staff/import" color="emerald" />
                <FeatureCard icon={Eye} title="View Profile" description="Access complete staff profiles with all records." href="/admin/staff" color="violet" />
                <FeatureCard icon={Edit} title="Edit Information" description="Update staff details, department, and role." href="/admin/staff" color="amber" />
                <FeatureCard icon={UserCheck} title="Manage Status" description="Activate or deactivate staff accounts." color="teal" />
                <FeatureCard icon={BarChart3} title="Reports" description="Generate performance and activity reports." href="/admin/report-cards" color="rose" />
                <FeatureCard icon={FileSpreadsheet} title="Export Data" description="Export staff data to CSV for reporting." href="/admin/staff/export" color="violet" />
                <FeatureCard icon={Filter} title="Search & Filter" description="Find staff quickly using search and filters." color="blue" />
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
                <p className="text-sm text-blue-600">Download the CSV template for bulk staff import</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
          <div className="mt-4 p-3 bg-white/80 rounded-lg border border-blue-200">
            <p className="text-xs text-slate-500 font-mono">
              Columns: first_name, last_name, middle_name, department, role, email, phone, address, date_joined
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ─── Roles & Departments ────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#0A2472]" />
            Roles & Departments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Staff Roles
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Administrator
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Teacher
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  Staff
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Support Staff
                </li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-violet-600" />
                Departments
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-500">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Academics
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Administration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  ICT
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Finance
                </li>
              </ul>
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
              <p className="font-semibold text-slate-700">VIN ID Format</p>
              <p className="text-slate-500 font-mono text-xs">VIN-STF-2026-XXXX</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Default Password</p>
              <p className="text-slate-500 font-mono text-xs">Staff's VIN ID</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Email Format</p>
              <p className="text-slate-500 font-mono text-xs">first.last@staff.vincollins.edu</p>
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
              { label: 'Students Guide', href: '/admin/help/students', icon: GraduationCap },
              { label: 'Report Card Guide', href: '/admin/help/report-cards', icon: FileText },
              { label: 'Attendance Guide', href: '/admin/help/attendance', icon: Calendar },
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