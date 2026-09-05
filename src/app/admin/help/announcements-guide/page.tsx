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
  Megaphone,
  BarChart3,
  ExternalLink,
  Search,
  MessageSquare,
  Bell,
  AlertCircle,
  Info,
  Edit,
  Users,
  Award,
  Clock,
  UsersRound,
  Globe,
  Tag,
  Pin
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

const announcementTypeMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminAnnouncementsGuidePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const quickActions = [
    {
      title: 'Create Announcement',
      description: 'Send updates to parents and students',
      icon: Megaphone,
      href: '/admin/announcements/create',
      color: 'amber' as ColorKey
    },
    {
      title: 'View All Announcements',
      description: 'Manage all announcements',
      icon: Bell,
      href: '/admin/announcements',
      color: 'blue' as ColorKey
    },
    {
      title: 'Schedule Announcement',
      description: 'Schedule announcements for later',
      icon: Clock,
      href: '/admin/announcements/schedule',
      color: 'violet' as ColorKey
    },
    {
      title: 'Announcement Templates',
      description: 'Use pre-made templates',
      icon: FileText,
      href: '/admin/announcements/templates',
      color: 'teal' as ColorKey
    },
  ]

  const steps: Step[] = [
    {
      number: 1,
      title: 'Access Announcements',
      description: 'Navigate to the Announcements section from the admin sidebar or dashboard quick actions.',
      icon: LayoutDashboard,
      tips: ['Use the sidebar navigation', 'Quick access from dashboard']
    },
    {
      number: 2,
      title: 'Create a New Announcement',
      description: 'Click the "Create Announcement" button. Fill in the title, content, and select the target audience.',
      icon: Megaphone,
      tips: [
        'Keep titles clear and concise',
        'Use formatting for better readability',
        'Add images to make announcements engaging'
      ],
      warning: 'Double-check the content before sending as announcements cannot be recalled.'
    },
    {
      number: 3,
      title: 'Select Target Audience',
      description: 'Choose who should receive the announcement: All Users, Parents, Students, Staff, or specific classes.',
      icon: UsersRound,
      tips: [
        'Target specific groups for relevant announcements',
        'Use "All Users" for school-wide communications'
      ]
    },
    {
      number: 4,
      title: 'Schedule Announcements',
      description: 'Schedule announcements to be published at a specific date and time. Useful for planning ahead.',
      icon: Clock,
      tips: ['Schedule during peak reading times', 'Plan announcements in advance']
    },
    {
      number: 5,
      title: 'Pin Important Announcements',
      description: 'Pin important announcements to keep them at the top of the list for better visibility.',
      icon: Pin,
      tips: ['Pin urgent announcements', 'Unpin after the information is no longer critical']
    },
    {
      number: 6,
      title: 'Track Announcement Performance',
      description: 'View engagement metrics: how many people viewed, read, and responded to the announcement.',
      icon: BarChart3,
      tips: ['Track engagement to improve future announcements', 'Monitor read rates']
    },
    {
      number: 7,
      title: 'Manage Announcements',
      description: 'Edit, delete, or archive announcements. Keep your announcement list organized and up to date.',
      icon: Edit,
      tips: ['Archive old announcements', 'Keep important ones pinned']
    },
  ]

  const faqs = [
    {
      question: 'How do I create an announcement?',
      answer: 'Go to Announcements > Create Announcement. Fill in the title, content, select the audience, and click Publish.'
    },
    {
      question: 'Who can receive announcements?',
      answer: 'You can send announcements to All Users, Parents, Students, Staff, or specific classes and groups.'
    },
    {
      question: 'Can I schedule announcements?',
      answer: 'Yes, you can schedule announcements to be published at a specific date and time.'
    },
    {
      question: 'How do I pin an announcement?',
      answer: 'Click the pin icon on the announcement card. Pinned announcements stay at the top of the list.'
    },
    {
      question: 'Can I edit an announcement after publishing?',
      answer: 'Yes, you can edit published announcements. Changes will be reflected immediately.'
    },
    {
      question: 'How do I track who viewed an announcement?',
      answer: 'Click on the announcement and view the analytics section to see view counts and engagement.'
    },
  ]

  const videoTutorials = [
    { title: 'Creating Announcements', duration: '4:30' },
    { title: 'Scheduling Announcements', duration: '3:45' },
    { title: 'Announcement Best Practices', duration: '5:20' },
    { title: 'Tracking Engagement', duration: '4:00' },
  ]

  const announcementTypes = [
    { icon: Megaphone, label: 'General', description: 'School-wide updates and news', color: 'blue' },
    { icon: Calendar, label: 'Events', description: 'Upcoming school events', color: 'emerald' },
    { icon: Bell, label: 'Urgent', description: 'Important and time-sensitive', color: 'rose' },
    { icon: Award, label: 'Achievements', description: 'Student and staff accomplishments', color: 'amber' },
  ]

  return (
    // ✅ FIX: Centered with max-w-6xl mx-auto w-full px-2 lg:px-4 so content shifts to the right properly
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10 px-2 lg:px-4">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-[#0A2472] flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-[#C9A84C]" />
              Announcements Guide
            </h1>
            <p className="text-slate-500 mt-1">Learn how to create and manage announcements effectively.</p>
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
              placeholder="Search announcements guide..."
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

      {/* ─── Announcement Types ─────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <Tag className="h-5 w-5 text-[#0A2472]" />
            Announcement Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {announcementTypes.map((type) => {
              const styles = announcementTypeMap[type.color] || announcementTypeMap.blue
              return (
                <div key={type.label} className={cn(
                  'p-4 rounded-xl border text-center',
                  styles.bg,
                  styles.border
                )}>
                  <type.icon className={cn('h-8 w-8 mx-auto mb-2', styles.text)} />
                  <h4 className="font-semibold text-slate-800">{type.label}</h4>
                  <p className="text-xs text-slate-500">{type.description}</p>
                </div>
              )
            })}
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
                Complete Guide to Announcements
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
                Announcement Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FeatureCard
                  icon={Megaphone}
                  title="Create Announcement"
                  description="Create new announcements with rich content and formatting."
                  href="/admin/announcements/create"
                  color="amber"
                />
                <FeatureCard
                  icon={UsersRound}
                  title="Target Audience"
                  description="Send announcements to specific groups: parents, students, staff, or classes."
                  color="blue"
                />
                <FeatureCard
                  icon={Clock}
                  title="Schedule"
                  description="Schedule announcements to be published at a specific date and time."
                  href="/admin/announcements/schedule"
                  color="violet"
                />
                <FeatureCard
                  icon={Pin}
                  title="Pin Announcements"
                  description="Pin important announcements to keep them at the top."
                  color="rose"
                />
                <FeatureCard
                  icon={FileText}
                  title="Templates"
                  description="Use pre-made templates for common announcement types."
                  href="/admin/announcements/templates"
                  color="teal"
                />
                <FeatureCard
                  icon={BarChart3}
                  title="Analytics"
                  description="Track view counts and engagement for each announcement."
                  color="emerald"
                />
                <FeatureCard
                  icon={Edit}
                  title="Edit & Manage"
                  description="Edit, archive, or delete announcements as needed."
                  color="amber"
                />
                <FeatureCard
                  icon={Globe}
                  title="Multi-channel"
                  description="Send announcements via email, SMS, and in-app notifications."
                  color="violet"
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

      {/* ─── Best Practices ──────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-amber-100">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-800">Best Practices</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">Keep announcements clear, concise, and action-oriented</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">Use relevant images and formatting to improve engagement</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">Target specific audiences for better relevance</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white/60 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">Pin important announcements for better visibility</p>
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
              <p className="font-semibold text-slate-700">Best Time to Post</p>
              <p className="text-slate-500 text-xs">Morning: 8-10 AM • Evening: 5-7 PM</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Ideal Length</p>
              <p className="text-slate-500 text-xs">Title: 5-8 words • Content: 100-150 words</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-700">Engagement Tips</p>
              <p className="text-slate-500 text-xs">Use images • Add call-to-action • Keep it scannable</p>
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