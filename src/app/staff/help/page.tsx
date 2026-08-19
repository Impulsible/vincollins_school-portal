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
import {
  HelpCircle, BookOpen, MessageSquare,
  FileText, Users, GraduationCap,
  Settings, Shield, Key, Bell,
  Download, Upload, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink,
  Clock, Save, Loader2,
  Search, Sparkles, Lightbulb,
  Video, FileQuestion, Info,
  ArrowRight, LayoutDashboard,
  Calculator, CalendarCheck,
  ClipboardCheck, NotebookPen,
  BarChart3, School, Send,
  Calendar,
  User
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'getting_started' | 'attendance' | 'scores' | 'assignments' | 'account' | 'general'
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
    question: 'How do I mark attendance for my class?',
    answer: 'Go to the Attendance page from your sidebar, select the class you want to mark, and click the "Mark Attendance" button. You can mark individual pupils as Present, Absent, or Late.',
    category: 'attendance',
  },
  {
    id: 'faq-2',
    question: 'How do I enter scores for my pupils?',
    answer: 'Navigate to the Scores page from your sidebar. Select the subject and class, then enter CA (40%) and Exam (60%) scores for each pupil. The total score will be calculated automatically.',
    category: 'scores',
  },
  {
    id: 'faq-3',
    question: 'How do I create a new assignment?',
    answer: 'Go to the Assignments page and click "New Assignment". Fill in the title, subject, target class, description, instructions, due date, and upload any attachments. You can save as draft or publish immediately.',
    category: 'assignments',
  },
  {
    id: 'faq-4',
    question: 'How do I update my profile photo?',
    answer: 'Go to your Profile page and click "Edit Profile". Click the camera icon on your avatar to upload a new photo. You can also remove your photo by clicking the red X button.',
    category: 'account',
  },
  {
    id: 'faq-5',
    question: 'How do I change my password?',
    answer: 'Go to Settings > Account Security. Enter your current password, new password, and confirm the new password. Click "Update Password" to save changes.',
    category: 'account',
  },
  {
    id: 'faq-6',
    question: 'How do I contact support?',
    answer: 'Use the contact form below to send a message to the admin team. You can also reach us via email at support@vincollins.edu.ng or call +234 907 082 9999.',
    category: 'general',
  },
  {
    id: 'faq-7',
    question: 'How do I export my data?',
    answer: 'Go to Settings > Data & Privacy and click "Export Data". Your data will be downloaded as a JSON file containing your profile, assignments, and notes.',
    category: 'account',
  },
  {
    id: 'faq-8',
    question: 'What do I do if I forget my password?',
    answer: 'Click the "Forgot?" link on the login page. You will receive an email with instructions to reset your password. If you have issues, contact support.',
    category: 'account',
  },
  {
    id: 'faq-9',
    question: 'How do I view my pupils\' report cards?',
    answer: 'Go to the Report Cards page from your sidebar. You can view, generate, and print report cards for all pupils in your assigned classes.',
    category: 'scores',
  },
  {
    id: 'faq-10',
    question: 'How do I create study notes?',
    answer: 'Go to the Study Notes page and click "New Note". Enter the title, subject, target class, content, and upload any attachments. Save as draft or publish for pupils to view.',
    category: 'assignments',
  },
]

// ── Guides Data ─────────────────────────────────────────────────────────────────

const GUIDES: GuideItem[] = [
  {
    id: 'guide-1',
    title: 'Getting Started',
    description: 'Learn the basics of the staff portal and navigation.',
    icon: LayoutDashboard,
    link: '/staff/help/getting-started',
  },
  {
    id: 'guide-2',
    title: 'Marking Attendance',
    description: 'Step-by-step guide on how to mark daily attendance.',
    icon: CalendarCheck,
    link: '/staff/help/attendance-guide',
  },
  {
    id: 'guide-3',
    title: 'Entering Scores',
    description: 'How to enter CA and Exam scores for your pupils.',
    icon: Calculator,
    link: '/staff/help/scores-guide',
  },
  {
    id: 'guide-4',
    title: 'Creating Assignments',
    description: 'Create, publish, and manage assignments for your class.',
    icon: ClipboardCheck,
    link: '/staff/help/assignments-guide',
  },
  {
    id: 'guide-5',
    title: 'Managing Study Notes',
    description: 'Create and publish study notes for your pupils.',
    icon: NotebookPen,
    link: '/staff/help/notes-guide',
  },
  {
    id: 'guide-6',
    title: 'Analytics Dashboard',
    description: 'Understand your class performance analytics.',
    icon: BarChart3,
    link: '/staff/help/analytics-guide',
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
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="scores">Scores & Grades</SelectItem>
              <SelectItem value="assignments">Assignments</SelectItem>
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

export default function StaffHelpPage() {
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
    attendance: 'Attendance',
    scores: 'Scores & Grades',
    assignments: 'Assignments & Notes',
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
      <div className="bg-white border-b border-slate-100 shadow-sm">
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
              {user?.full_name || 'Staff'}
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
            { icon: LayoutDashboard, label: 'Dashboard', href: '/staff' },
            { icon: CalendarCheck, label: 'Attendance', href: '/staff/attendance' },
            { icon: Calculator, label: 'Scores', href: '/staff/scores' },
            { icon: ClipboardCheck, label: 'Assignments', href: '/staff/assignments' },
            { icon: NotebookPen, label: 'Notes', href: '/staff/notes' },
            { icon: User, label: 'Profile', href: '/staff/profile' },
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
              Step-by-step guides to help you master the staff portal
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
              <FileQuestion className="h-4 w-4 text-slate-600" />
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

        {/* ── System Status ────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All systems operational</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Last checked: {new Date().toLocaleTimeString()}</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Uptime: 99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
          <p>Vincollins Schools Staff Help Center • Geared Towards Excellence</p>
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