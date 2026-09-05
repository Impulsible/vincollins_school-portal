
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ArrowRight,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Calendar,
  Settings,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Video,
  FileCheck,
  LayoutDashboard,
  UserPlus,
  Megaphone,
  BarChart3,
  ExternalLink,
  Search,
  MessageSquare,
  Bell,
  School,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
interface QuickAction {
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'teal'
  badge?: string
}

// ── Quick Action Card ─────────────────────────────────────────────────────────
function QuickActionCard({ title, description, icon: Icon, href, color, badge }: QuickAction) {
  const colors = {
    blue: { bg: 'bg-blue-50 border-blue-200 hover:border-blue-300', icon: 'text-blue-600', hover: 'hover:bg-blue-100/50' },
    emerald: { bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300', icon: 'text-emerald-600', hover: 'hover:bg-emerald-100/50' },
    violet: { bg: 'bg-violet-50 border-violet-200 hover:border-violet-300', icon: 'text-violet-600', hover: 'hover:bg-violet-100/50' },
    amber: { bg: 'bg-amber-50 border-amber-200 hover:border-amber-300', icon: 'text-amber-600', hover: 'hover:bg-amber-100/50' },
    rose: { bg: 'bg-rose-50 border-rose-200 hover:border-rose-300', icon: 'text-rose-600', hover: 'hover:bg-rose-100/50' },
    teal: { bg: 'bg-teal-50 border-teal-200 hover:border-teal-300', icon: 'text-teal-600', hover: 'hover:bg-teal-100/50' },
  }
  const c = colors[color]

  return (
    <Link href={href}>
      <div className={cn(
        'group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer',
        c.bg,
        c.hover,
        'hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
      )}>
        <div className={cn('p-2 rounded-lg bg-white/80 shadow-sm', c.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {badge && (
              <Badge variant="outline" className="text-[10px]">{badge}</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  )
}

// ─── Step Card ─────────────────────────────────────────────────────────────────
function StepCard({ 
  number, 
  title, 
  description, 
  icon: Icon,
  children 
}: { 
  number: number
  title: string
  description: string
  icon: React.ElementType
  children?: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-[#0A2472] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
          {number}
        </div>
        {number < 5 && <div className="w-0.5 flex-1 bg-slate-200 mt-2" />}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-[#0A2472]" />
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
        {children && <div className="mt-3">{children}</div>}
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminHelpGettingStartedPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const quickActions: QuickAction[] = [
    {
      title: 'Add Student',
      description: 'Enroll a new student into the system',
      icon: UserPlus,
      href: '/admin/students?action=add',
      color: 'blue',
      badge: 'Popular'
    },
    {
      title: 'Add Staff',
      description: 'Hire a new teacher or staff member',
      icon: Users,
      href: '/admin/staff?action=add',
      color: 'emerald'
    },
    {
      title: 'Create Announcement',
      description: 'Send updates to parents and students',
      icon: Megaphone,
      href: '/admin/announcements/create',
      color: 'amber'
    },
    {
      title: 'Generate Report Cards',
      description: 'Create termly report cards',
      icon: FileText,
      href: '/admin/report-cards',
      color: 'violet'
    },
    {
      title: 'Manage Classes',
      description: 'Set up and manage classes',
      icon: GraduationCap,
      href: '/admin/classes',
      color: 'teal'
    },
    {
      title: 'View Broad Sheet',
      description: 'See all student performance at a glance',
      icon: BarChart3,
      href: '/admin/broadsheet',
      color: 'rose'
    },
  ]

  const gettingStartedSteps = [
    {
      title: 'Set Up School Settings',
      description: 'Configure your school name, logo, contact details, and academic terms.',
      icon: School,
      action: { label: 'Go to Settings', href: '/admin/settings' }
    },
    {
      title: 'Add Staff Members',
      description: 'Create staff accounts for teachers and administrators.',
      icon: Users,
      action: { label: 'Add Staff', href: '/admin/staff' }
    },
    {
      title: 'Enroll Students',
      description: 'Add students to the system and assign them to classes.',
      icon: GraduationCap,
      action: { label: 'Add Students', href: '/admin/students' }
    },
    {
      title: 'Set Up Classes & Subjects',
      description: 'Create classes and assign subjects to each class.',
      icon: BookOpen,
      action: { label: 'Manage Classes', href: '/admin/classes' }
    },
    {
      title: 'Generate Report Cards',
      description: 'Create and publish termly report cards for students.',
      icon: FileCheck,
      action: { label: 'Report Cards', href: '/admin/report-cards' }
    },
  ]

  const helpfulLinks = [
    { label: 'Student Management Guide', href: '/admin/help/students', icon: Users },
    { label: 'Report Card Guide', href: '/admin/help/report-cards', icon: FileText },
    { label: 'Broad Sheet Guide', href: '/admin/help/broadsheet', icon: BarChart3 },
    { label: 'Attendance Guide', href: '/admin/help/attendance', icon: Calendar },
    { label: 'Announcements Guide', href: '/admin/help/announcements', icon: Megaphone },
  ]

  const videoTutorials = [
    { title: 'Getting Started with Admin Portal', duration: '5:23' },
    { title: 'How to Add Students', duration: '3:45' },
    { title: 'Generating Report Cards', duration: '6:12' },
    { title: 'Managing Classes & Subjects', duration: '4:30' },
  ]

  const adminFeatures = [
    { icon: LayoutDashboard, label: 'Dashboard', description: 'Overview of all school activities' },
    { icon: Users, label: 'Student Management', description: 'Add, edit, and manage students' },
    { icon: Users, label: 'Staff Management', description: 'Manage teachers and staff' },
    { icon: FileText, label: 'Report Cards', description: 'Generate and publish report cards' },
    { icon: BarChart3, label: 'Broad Sheet', description: 'View all student performance' },
    { icon: Megaphone, label: 'Announcements', description: 'Send updates to parents' },
    { icon: Calendar, label: 'Attendance', description: 'Track student attendance' },
    { icon: Settings, label: 'Settings', description: 'Configure school settings' },
  ]

  return (
    // ✅ FIX: Added max-w-6xl mx-auto w-full to center the content and push it away from the sidebar
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10 px-2 lg:px-4">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span>Help</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-slate-700">Getting Started</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-[#0A2472] flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-[#C9A84C]" />
              Getting Started
            </h1>
            <p className="text-slate-500 mt-1">Welcome to the Vincollins Schools Admin Portal!</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#0A2472] text-white px-3 py-1">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Admin Guide
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              v1.0
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
              placeholder="Search help articles..."
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
          <Badge variant="outline" className="text-xs">Frequently used</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </div>

      {/* ─── Getting Started Steps ──────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Getting Started Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {gettingStartedSteps.map((step, index) => (
              <StepCard
                key={index}
                number={index + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
              >
                <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                  <Link href={step.action.href}>
                    {step.action.label} <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </StepCard>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Video Tutorials ────────────────────────────────────────────────── */}
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

      {/* ─── Admin Features Overview ────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-[#0A2472]" />
            All Admin Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {adminFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <feature.icon className="h-4 w-4 text-[#0A2472] mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{feature.label}</p>
                  <p className="text-xs text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Helpful Links ──────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            Helpful Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {helpfulLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <link.icon className="h-4 w-4 text-[#0A2472]" />
                <span className="text-sm text-slate-600 group-hover:text-[#0A2472]">{link.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-auto group-hover:text-[#0A2472]" />
              </Link>
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