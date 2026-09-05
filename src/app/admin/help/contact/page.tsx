/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Shield,
  Sparkles,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  Megaphone,
  LifeBuoy,
  Paperclip,
  ArrowLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Support Channels Data ───────────────────────────────────────────────────
const supportChannels = [
  {
    title: 'Email Support',
    description: 'Direct assistance for administrative & portal queries',
    value: 'support@vincollins.edu.ng',
    actionText: 'Send Email',
    href: 'mailto:vincollinscollege@gmail.com',
    icon: Mail,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    btnBg: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    title: 'Helpline & WhatsApp',
    description: 'Mon - Fri from 8:00 AM to 5:00 PM',
    value: '+234 907 082 9999',
    actionText: 'Call Support',
    href: 'tel:+2349070829999',
    icon: Phone,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700'
  },
  {
    title: 'Admin Office',
    description: 'Main Administrative Block',
    value: 'Vincollins Schools Campus, Lagos',
    actionText: 'Get Directions',
    href: '#',
    icon: MapPin,
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    btnBg: 'bg-violet-600 hover:bg-violet-700'
  }
]

export default function AdminContactSupportPage() {
  const router = useRouter()

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    message: '',
    attachmentName: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, attachmentName: e.target.files![0].name }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subject || !formData.message) return

    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      const generatedTicket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`
      setTicketId(generatedTicket)
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1200)
  }

  const resetForm = () => {
    setFormData({
      subject: '',
      category: 'technical',
      priority: 'medium',
      message: '',
      attachmentName: ''
    })
    setIsSubmitted(false)
  }

  return (
    // ✅ FIX: Centered with max-w-6xl mx-auto w-full px-2 lg:px-4 to clear sidebar
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10 px-2 lg:px-4">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-[#0A2472] flex items-center gap-3">
              <LifeBuoy className="h-8 w-8 text-[#C9A84C]" />
              Contact Support
            </h1>
            <p className="text-slate-500 mt-1">Get in touch with technical support or submit an administrative inquiry ticket.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#0A2472] text-white px-3 py-1">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Helpdesk & Support
            </Badge>
          </div>
        </div>
      </div>

      {/* ─── Contact Channels Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supportChannels.map((channel) => {
          const Icon = channel.icon
          return (
            <Card key={channel.title} className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border mb-4", channel.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">{channel.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{channel.description}</p>
                <p className="text-sm font-semibold text-slate-900 mt-3 font-mono">{channel.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ─── Ticket Form & SLA Notice Split ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Support Ticket Form (2 Cols) */}
        <Card className="lg:col-span-2 border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#C9A84C]" />
              Submit a Support Ticket
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Fill out the details below. Our administrative IT support team will respond within 2-4 working hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-12 px-4 space-y-4 animate-in fade-in-50 duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Support Ticket Created!</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Your request has been logged. Reference Ticket ID:
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono font-bold text-[#0A2472]">
                    {ticketId}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  A confirmation email has been dispatched to your administrator inbox. You will receive updates directly on the portal and email.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={resetForm}>
                    Submit Another Ticket
                  </Button>
                  <Button size="sm" className="bg-[#0A2472] hover:bg-[#1A3A8A]" onClick={() => router.push('/admin')}>
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ticket Subject <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    name="subject"
                    required
                    placeholder="e.g. Issue approving Term 2 Report Cards for JSS 1"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="border-slate-200 focus-visible:ring-[#0A2472]"
                  />
                </div>

                {/* Category & Priority Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Issue Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A2472]"
                    >
                      <option value="technical">Portal Technical Glitch</option>
                      <option value="academics">Broad Sheet & Report Cards</option>
                      <option value="students">Student / VIN ID Issue</option>
                      <option value="staff">Staff & Class Assignment</option>
                      <option value="account">Account & Permission Request</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A2472]"
                    >
                      <option value="low">Low - General Question</option>
                      <option value="medium">Medium - Normal Request</option>
                      <option value="high">High - Portal Feature Blocked</option>
                      <option value="urgent">Urgent - Exam/Report Cards Publishing</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Message <span className="text-rose-500">*</span>
                  </label>
                  <Textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Provide step-by-step context of what happened, error codes, student VIN IDs, or class names if applicable..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="border-slate-200 focus-visible:ring-[#0A2472] text-sm"
                  />
                </div>

                {/* File Upload Simulation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Attachment (Optional Screenshot or CSV)
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                    <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                      <span>Choose file</span>
                      <input type="file" onChange={handleFileSimulate} className="hidden" />
                    </label>
                    <span className="text-xs text-slate-400 truncate">
                      {formData.attachmentName || 'No file selected (Max 5MB)'}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.subject || !formData.message}
                    className="w-full sm:w-auto bg-[#0A2472] hover:bg-[#1A3A8A] text-white px-8 h-11"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Submitting Ticket...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Support Ticket
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* SLA & FAQ Sidebar Card (1 Col) */}
        <div className="space-y-6">
          <Card className="border-0 shadow-soft bg-gradient-to-br from-[#0A2472]/5 to-[#C9A84C]/5">
            <CardHeader>
              <CardTitle className="text-base font-display text-[#0A2472] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#C9A84C]" />
                Support Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-600">
              <div className="p-3 bg-white/80 rounded-xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-800">Regular Desk Hours</p>
                <p>Monday – Friday: 8:00 AM – 5:00 PM</p>
                <p>Saturday: 9:00 AM – 1:00 PM</p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-slate-100 space-y-1">
                <p className="font-bold text-slate-800">Response SLA</p>
                <p>• High / Urgent: Within 2 Hours</p>
                <p>• Medium / General: Same Business Day</p>
              </div>

              <div className="flex items-start gap-2 text-slate-500 pt-1">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  For emergency portal outages during examination or report card publishing windows, call the helpline directly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick FAQ Shortcut */}
          <Card className="border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display text-[#0A2472] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-amber-600" />
                Before You Submit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Check our Frequently Asked Questions or Guides. Most common questions regarding student VIN IDs, broad sheet calculations, and report card publishing are answered immediately.
              </p>
              <Button
                variant="outline"
                className="w-full text-xs h-9 justify-between border-slate-200"
                onClick={() => router.push('/admin/help/faq')}
              >
                <span>Browse Admin FAQ</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ─── Related Guides Navigation ──────────────────────────────────────── */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display text-[#0A2472] flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#0A2472]" />
            Documentation & Guides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Getting Started', href: '/admin/help/getting-started', icon: Sparkles },
              { label: 'Student Management', href: '/admin/help/students-guide', icon: GraduationCap },
              { label: 'Broad Sheet Guide', href: '/admin/help/broadsheet-guide', icon: FileSpreadsheet },
              { label: 'Report Cards Guide', href: '/admin/help/report-cards', icon: FileText },
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

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
        <p>Vincollins Schools Admin Portal • Geared Towards Excellence</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>
    </div>
  )
}