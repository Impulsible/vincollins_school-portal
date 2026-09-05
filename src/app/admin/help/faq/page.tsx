/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Shield,
  Sparkles,
  ChevronRight,
  HelpCircle,
  BarChart3,
  ExternalLink,
  Search,
  MessageSquare,
  Bell,
  Settings,
  FileSpreadsheet,
  CheckCircle2,
  Megaphone,
  Briefcase,
  Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────────
type CategoryKey = 'all' | 'general' | 'students' | 'staff' | 'academics' | 'system'

interface FAQItemData {
  id: string
  category: CategoryKey
  question: string
  answer: string
  popular?: boolean
}

// ─── Category Configuration ────────────────────────────────────────────────────
const categories: { key: CategoryKey; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All Questions', icon: Layers },
  { key: 'general', label: 'General', icon: HelpCircle },
  { key: 'students', label: 'Student Management', icon: GraduationCap },
  { key: 'staff', label: 'Staff Management', icon: Briefcase },
  { key: 'academics', label: 'Academics & Reports', icon: FileSpreadsheet },
  { key: 'system', label: 'System & Settings', icon: Settings },
]

// ─── FAQ Dataset ───────────────────────────────────────────────────────────────
const faqsList: FAQItemData[] = [
  // General
  {
    id: 'g1',
    category: 'general',
    question: 'How do I change my admin portal password?',
    answer: 'Navigate to Settings > Security from the sidebar. Enter your current password, followed by your new password, and click "Save Changes".',
    popular: true
  },
  {
    id: 'g2',
    category: 'general',
    question: 'What should I do if I forget my login credentials?',
    answer: 'Click "Forgot Password" on the portal login page. An email with password reset instructions will be sent to your registered admin email address.',
  },
  {
    id: 'g3',
    category: 'general',
    question: 'Where can I find video tutorials for portal features?',
    answer: 'Video tutorials are embedded within each guide section under Help (e.g., Students Guide, Staff Guide, Broad Sheet Guide) under the "Videos" tab.',
  },

  // Students
  {
    id: 's1',
    category: 'students',
    question: 'How are Student VIN IDs structured?',
    answer: 'VIN IDs are auto-generated unique identifiers following the format VIN-STD-YYYY-XXXX (e.g., VIN-STD-2026-0042).',
    popular: true
  },
  {
    id: 's2',
    category: 'students',
    question: 'How do I bulk import multiple students at once?',
    answer: 'Go to Students > Import Students. Download the official CSV template, fill in student details, and upload the file. Double check required fields like admission number and class.',
    popular: true
  },
  {
    id: 's3',
    category: 'students',
    question: 'What happens when I deactivate a student account?',
    answer: 'Deactivated students cannot log into the student portal. All their academic records, attendance history, and report cards remain preserved and can be reactivated anytime.',
  },

  // Staff
  {
    id: 't1',
    category: 'staff',
    question: 'How do I assign classes and subjects to a teacher?',
    answer: 'Go to Teacher Classes under Management in the sidebar. Select a teacher, choose the class and subjects they instruct, and click "Assign".',
    popular: true
  },
  {
    id: 't2',
    category: 'staff',
    question: 'What is the default password for new staff accounts?',
    answer: 'When a new staff account is created, their auto-generated VIN ID (e.g., VIN-STF-2026-0012) serves as their initial login password until changed.',
  },

  // Academics
  {
    id: 'a1',
    category: 'academics',
    question: 'What is the minimum subject requirement for generating report cards?',
    answer: 'Students must have scores entered for at least 20 out of 22 required subjects before a report card can be generated from the Broad Sheet.',
    popular: true
  },
  {
    id: 'a2',
    category: 'academics',
    question: 'How is the total score calculated on the Broad Sheet?',
    answer: 'Total Score = Continuous Assessment CA (40%) + End of Term Exam (60%). Subject averages are computed automatically across completed courses.',
  },
  {
    id: 'a3',
    category: 'academics',
    question: 'What is the difference between Approval Queue and Publishing?',
    answer: 'Generated report cards first enter the Approval Queue for administrative verification. Once approved, clicking "Publish" makes them immediately visible on pupil and parent portals.',
    popular: true
  },

  // System
  {
    id: 'sys1',
    category: 'system',
    question: 'How do I update academic term dates or current session?',
    answer: 'Access Settings > Academic Session. From there, set the active academic session (e.g., 2025/2026) and designate current term start/end dates.',
  },
  {
    id: 'sys2',
    category: 'system',
    question: 'Who receives school announcements?',
    answer: 'When creating an announcement, you can set the audience target to All Users, Staff, Students, Parents, or specific classes.',
  }
]

// ─── Single FAQ Accordion Item ────────────────────────────────────────────────
function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left transition-colors hover:text-[#0A2472]"
      >
        <span className="text-sm font-semibold text-slate-800 pr-4">{question}</span>
        <ChevronRight className={cn(
          "h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200",
          open && "rotate-90 text-[#0A2472]"
        )} />
      </button>
      {open && (
        <div className="pb-4 text-sm text-slate-500 leading-relaxed animate-in fade-in-50 duration-200">
          {answer}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminFAQPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all')

  // Filter FAQs based on active category & search query
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return faqsList.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesSearch = !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  const popularFaqs = useMemo(() => {
    return faqsList.filter(f => f.popular)
  }, [])

  return (
    // ✅ FIX: Centered with max-w-6xl mx-auto w-full px-2 lg:px-4 to clear sidebar
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10 px-2 lg:px-4">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-[#0A2472] flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-[#C9A84C]" />
              Frequently Asked Questions
            </h1>
            <p className="text-slate-500 mt-1">Find quick answers to common questions about the Vincollins Admin Portal.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#0A2472] text-white px-3 py-1">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Admin Knowledge Base
            </Badge>
          </div>
        </div>
      </div>

      {/* ─── Search Bar ──────────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-4">
          <div className="relative max-w-xl mx-auto py-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Type your question or keyword (e.g. Broad Sheet, Report Cards, VIN ID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-sm md:text-base rounded-xl border-slate-200 focus-visible:ring-[#0A2472]"
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Category Filter Chips ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isActive = selectedCategory === cat.key
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                isActive
                  ? 'bg-[#0A2472] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-[#C9A84C]' : 'text-slate-400')} />
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* ─── Popular Questions Section (Shows when no search active and on 'All') ─ */}
      {!searchQuery && selectedCategory === 'all' && (
        <Card className="border-0 shadow-soft bg-gradient-to-br from-blue-50/60 to-indigo-50/30 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display text-[#0A2472] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C9A84C]" />
              Popular Admin Queries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {popularFaqs.map((faq) => (
                <div
                  key={faq.id}
                  onClick={() => setSearchQuery(faq.question)}
                  className="p-3.5 rounded-xl bg-white/80 border border-blue-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all flex items-start gap-2.5 group"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-[#0A2472] transition-colors">
                      {faq.question}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Main FAQ List Accordion ─────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-amber-600" />
            {selectedCategory === 'all' ? 'All Questions' : categories.find(c => c.key === selectedCategory)?.label}
            <Badge variant="outline" className="ml-auto text-xs font-normal">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">No matching questions found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching with different keywords or switch categories.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
              >
                Reset Search
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredFaqs.map((faq) => (
                <FAQAccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Related Documentation Guides ────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#0A2472]" />
            Detailed System Guides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Getting Started', href: '/admin/help/getting-started', icon: Sparkles },
              { label: 'Student Management', href: '/admin/help/students-guide', icon: GraduationCap },
              { label: 'Staff Management', href: '/admin/help/staff-guide', icon: Users },
              { label: 'Broad Sheet Guide', href: '/admin/help/broadsheet-guide', icon: FileSpreadsheet },
              { label: 'Report Cards Guide', href: '/admin/help/report-cards', icon: FileText },
              { label: 'Announcements Guide', href: '/admin/help/announcements-guide', icon: Megaphone },
            ].map((link) => (
              <NextLink
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors group"
              >
                <link.icon className="h-4 w-4 text-[#0A2472]" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0A2472]">
                  {link.label}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 ml-auto group-hover:text-[#0A2472]" />
              </NextLink>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Contact Support Box ─────────────────────────────────────────────── */}
      <Card className="border-0 shadow-soft bg-gradient-to-r from-[#0A2472]/5 to-[#C9A84C]/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-[#0A2472]/10">
                <MessageSquare className="h-6 w-6 text-[#0A2472]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0A2472]">Still need assistance?</h3>
                <p className="text-sm text-slate-500">Our technical support team is ready to help you resolve any issues.</p>
              </div>
            </div>
            <div className="flex gap-3">
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