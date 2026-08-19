/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  HelpCircle, Shield, Users, School,
  FileSpreadsheet, Megaphone, Settings,
  BookOpen, FileText, Calendar,
  CheckCircle2, AlertCircle, ArrowRight,
  Search, RefreshCw, ChevronRight, User,
  Mail, Phone, MessageSquare, Clock,
  Sparkles, LayoutDashboard, FileCheck,
  Globe, GraduationCap, Briefcase,
  Lock, Key, Download, Trash2,
  BarChart3, Calculator, CalendarCheck,
  ClipboardCheck, NotebookPen, UserCog,
  Save, Loader2, X,
  Send
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'getting_started' | 'students' | 'staff' | 'announcements' | 'broadsheet' | 'account' | 'general'
}

interface GuideItem {
  id: string
  title: string
  description: string
  icon: React.ElementType
  link: string
}

// ── FAQ Data ──────────────────────────────────────────────────────────────────

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I add a new student?',
    answer: 'Go to the Students page and click "Add Student". Fill in the student\'s details including full name, class, admission number, and guardian information. The student will automatically receive a welcome notification.',
    category: 'students',
  },
  {
    id: 'faq-2',
    question: 'How do I assign a teacher to a class?',
    answer: 'Go to the Staff page and select the teacher you want to assign. Click "Assign Classes" and choose the classes from the list. The teacher will receive a notification about their new assignment.',
    category: 'staff',
  },
  {
    id: 'faq-3',
    question: 'How do I create a school-wide announcement?',
    answer: 'Go to the Announcements page and click "New Announcement". Enter the title, content, and target audience (Everyone, Students, Teachers, or Admins). Publish it to send notifications to all targeted users.',
    category: 'announcements',
  },
  {
    id: 'faq-4',
    question: 'How do I generate a broadsheet?',
    answer: 'Go to the Broadsheet page and select the term and session. The broadsheet will automatically generate from all published scores. You can preview, print, or export it as a PDF.',
    category: 'broadsheet',
  },
  {
    id: 'faq-5',
    question: 'How do I reset a user\'s password?',
    answer: 'Go to the Staff or Students page, find the user, and click "Reset Password". The user will receive an email with instructions to set a new password.',
    category: 'account',
  },
  {
    id: 'faq-6',
    question: 'How do I contact support?',
    answer: 'Use the contact form below to send a message to the support team. You can also reach us via email at support@vincollins.edu.ng or call +234 907 082 9999.',
    category: 'general',
  },
  {
    id: 'faq-7',
    question: 'How do I export data?',
    answer: 'Go to Settings > Data & Privacy and click "Export Data". You can export student data, staff data, scores, and announcements in JSON or CSV format.',
    category: 'account',
  },
  {
    id: 'faq-8',
    question: 'How do I manage teacher classes?',
    answer: 'Go to the Teacher Classes page. You can view all teachers and their assigned classes. Click "Manage" to add or remove class assignments.',
    category: 'staff',
  },
  {
    id: 'faq-9',
    question: 'How do I view student report cards?',
    answer: 'Go to the Report Cards page. You can view, generate, and print report cards for all students. Filter by class, term, or session for specific reports.',
    category: 'students',
  },
  {
    id: 'faq-10',
    question: 'How do I manage school settings?',
    answer: 'Go to the Settings page. You can update school name, logo, motto, term dates, and other system-wide preferences.',
    category: 'general',
  },
]

// ── Guides Data ─────────────────────────────────────────────────────────────────

const GUIDES: GuideItem[] = [
  {
    id: 'guide-1',
    title: 'Getting Started',
    description: 'Learn the basics of the admin portal and navigation.',
    icon: LayoutDashboard,
    link: '/admin/help/getting-started',
  },
  {
    id: 'guide-2',
    title: 'Managing Students',
    description: 'Add, edit, and manage student records.',
    icon: GraduationCap,
    link: '/admin/help/students-guide',
  },
  {
    id: 'guide-3',
    title: 'Managing Staff',
    description: 'Add teachers, assign classes, and manage staff.',
    icon: Briefcase,
    link: '/admin/help/staff-guide',
  },
  {
    id: 'guide-4',
    title: 'Creating Announcements',
    description: 'Create and publish school-wide announcements.',
    icon: Megaphone,
    link: '/admin/help/announcements-guide',
  },
  {
    id: 'guide-5',
    title: 'Generating Broadsheet',
    description: 'Generate termly broadsheet from scores.',
    icon: FileSpreadsheet,
    link: '/admin/help/broadsheet-guide',
  },
  {
    id: 'guide-6',
    title: 'Managing Report Cards',
    description: 'View and generate student report cards.',
    icon: FileCheck,
    link: '/admin/help/report-cards-guide',
  },
]

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <HelpCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="font-semibold text-slate-700">Loading help center...</p>
        <p className="text-sm text-slate-400 mt-1">Getting support resources</p>
      </div>
    </div>
  )
}

// ── Contact Form ──────────────────────────────────────────────────────────────

function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSending(true)
    try {
      // Simulate sending (in production, send to Supabase or API)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Your message has been sent! Support will respond within 24 hours.')
      setName('')
      setEmail('')
      setSubject('')
      setCategory('')
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Your Name <span className="text-rose-500">*</span></label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Email Address <span className="text-rose-500">*</span></label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@vincollins.edu.ng"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief subject of your inquiry"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical Issue</SelectItem>
              <SelectItem value="account">Account & Profile</SelectItem>
              <SelectItem value="students">Student Management</SelectItem>
              <SelectItem value="staff">Staff Management</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-500">Message <span className="text-rose-500">*</span></label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue or question in detail..."
          className="min-h-[120px]"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={sending}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto"
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send Message
      </Button>
    </form>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminHelpPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // ─── Filter FAQs based on search ────────────────────────────────────────────

  const filteredFAQs = FAQS.filter((faq) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      faq.category.toLowerCase().includes(q)
    )
  })

  // ─── Group FAQs by category ────────────────────────────────────────────────

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQItem[]>)

  // ─── Category labels ────────────────────────────────────────────────────────

  const categoryLabels: Record<string, string> = {
    getting_started: 'Getting Started',
    students: 'Student Management',
    staff: 'Staff Management',
    announcements: 'Announcements',
    broadsheet: 'Broadsheet',
    account: 'Account & Security',
    general: 'General',
  }

  // ─── Loading State ─────────────────────────────────────────────────────────

  if (authLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    router.replace('/portal')
    return null
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-slate-600" />
                Help & Support
              </h1>
              <p className="text-sm text-slate-500">
                Find answers to common questions and get help when you need it
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1.5 text-sm">
              {user?.full_name || 'Admin'}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Search Bar ──────────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            className="pl-9 focus-visible:ring-blue-500"
          />
        </div>

        {/* ── Quick Links ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
            { icon: GraduationCap, label: 'Students', href: '/admin/students' },
            { icon: Briefcase, label: 'Staff', href: '/admin/staff' },
            { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
            { icon: FileSpreadsheet, label: 'Broadsheet', href: '/admin/broadsheet' },
            { icon: Settings, label: 'Settings', href: '/admin/settings' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <item.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span className="text-xs font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Guides Section ───────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-600" />
              Guides & Tutorials
            </CardTitle>
            <CardDescription>
              Step-by-step guides to help you master the admin portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GUIDES.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => router.push(guide.link)}
                  className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                    <guide.icon className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{guide.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{guide.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 ml-auto shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── FAQ Section ──────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to the most common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedFAQs).length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No FAQs match your search.</p>
              </div>
            ) : (
              <Accordion
                type="single"
                collapsible
                value={expandedCategory || undefined}
                onValueChange={setExpandedCategory}
                className="space-y-4"
              >
                {Object.entries(groupedFAQs).map(([category, faqs]) => (
                  <AccordionItem
                    key={category}
                    value={category}
                    className="border border-slate-100 rounded-xl overflow-hidden bg-white"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {faqs.length} questions
                        </Badge>
                        <span className="font-semibold text-slate-700">
                          {categoryLabels[category] || category}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="space-y-3 pt-2">
                        {faqs.map((faq) => (
                          <div
                            key={faq.id}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <p className="text-sm font-semibold text-slate-700">
                              {faq.question}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* ── Contact Support ──────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm border-l-4 border-blue-400">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Contact Support
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Send us a message and we'll get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Admin Help Center • Geared Towards Excellence</p>
          <p className="mt-1 flex items-center justify-center gap-2">
            <span>&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</span>
            <span className="text-slate-300">·</span>
            <span>Support: support@vincollins.edu.ng</span>
            <span className="text-slate-300">·</span>
            <span>Phone: +234 907 082 9999</span>
          </p>
        </div>
      </div>
    </div>
  )
}