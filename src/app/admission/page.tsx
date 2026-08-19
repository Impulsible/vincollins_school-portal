'use client'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  GraduationCap, Send, Loader2, CheckCircle2,
  Mail, Phone, Clock, User, Baby, School as SchoolIcon,
  Users, Award, Sparkles, Home, ChevronRight,
  FileText, MessageSquare, ArrowRight,
  Shield, Star, X,
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'

// ─── School WhatsApp Number ─────────────────────────────────────
const WHATSAPP_NUMBER = '2349070829999'
const WHATSAPP_DEFAULT_MSG = 'Hello Vincollins Schools! I would like to enquire about admission for my child.'

// ─── WhatsApp Brand Icon ────────────────────────────────────────
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

// ─── Constants ───────────────────────────────────────────────────
const CLASSES = [
  'Nursery 1', 'Nursery 2',
  'Primary 1', 'Primary 2', 'Primary 3',
  'Primary 4', 'Primary 5', 'Primary 6',
]

const HIGHLIGHTS = [
  { icon: Users, label: 'Students', value: '500+', color: 'text-blue-300' },
  { icon: Award, label: 'Years', value: '20+', color: 'text-amber-300' },
  { icon: SchoolIcon, label: 'Campuses', value: '3', color: 'text-emerald-300' },
]

const BENEFITS = [
  'Quality education with modern facilities',
  'Dedicated and experienced teaching staff',
  'Nurturing environment for holistic development',
  'State-of-the-art learning resources',
  'Extracurricular activities & sports',
  'Safe, secure, and supportive campus',
]

const PROCESS_STEPS = [
  { num: 1, title: 'Submit Application', desc: 'Fill out the admission form', tone: 'blue' },
  { num: 2, title: 'Review & Contact', desc: 'Our team will reach out to you', tone: 'amber' },
  { num: 3, title: 'Assessment & Interview', desc: 'Student assessment and parent interview', tone: 'emerald' },
  { num: 4, title: 'Enrollment', desc: 'Complete registration and join us', tone: 'purple' },
]

const CONTACT_ITEMS = [
  { icon: Phone, label: '+234 907 082 9999', href: 'tel:+2349070829999' },
  { icon: Mail, label: 'vincollinsschools@gmail.com', href: 'mailto:vincollinsschools@gmail.com' },
  { icon: Clock, label: 'Mon-Fri: 8:00 AM - 4:00 PM' },
]

// ─── WhatsApp quick messages (admission-focused) ─────────────────
const WHATSAPP_QUICK_MESSAGES = [
  { emoji: '🎓', label: 'Start admission process', text: 'Hello! I would like to start the admission process for my child. What are the next steps?' },
  { emoji: '📋', label: 'Required documents', text: 'Hello! Please share the list of documents required for admission.' },
  { emoji: '💰', label: 'Fees & payment plans', text: 'Hello! Could you share information about school fees and payment plans?' },
  { emoji: '📅', label: 'Schedule a school visit', text: 'Hello! I would like to schedule a visit to see the school. When is available?' },
  { emoji: '🎯', label: 'Admission requirements', text: 'Hello! What are the admission requirements for my child?' },
]

// ─── Helper: Open WhatsApp ───────────────────────────────────────
const openWhatsApp = (message: string = WHATSAPP_DEFAULT_MSG) => {
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

// ═══════════════════════════════════════════════════════════════
// WHATSAPP FLOATING WIDGET
// ═══════════════════════════════════════════════════════════════
function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      if (!isOpen) setShowTooltip(true)
    }, 3000)

    const hideT = setTimeout(() => {
      setShowTooltip(false)
    }, 8000)

    return () => {
      clearTimeout(t)
      clearTimeout(hideT)
    }
  }, [isOpen])

  const handleSend = (message?: string) => {
    const msg = message || customMessage.trim() || WHATSAPP_DEFAULT_MSG
    openWhatsApp(msg)
    setCustomMessage('')
    setIsOpen(false)
  }

  const currentHour = new Date().getHours()
  const isOfficeHours = currentHour >= 8 && currentHour < 16
  const dayOfWeek = new Date().getDay()
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
  const isOnline = isOfficeHours && isWeekday

  return (
    <>
      {/* ─── Chat Popup ─────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px]"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700">
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="wa-pattern-adm" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="1" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#wa-pattern-adm)" />
                    </svg>
                  </div>

                  <div className="relative p-4 flex items-start justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg">
                          <WhatsAppIcon className="h-6 w-6 text-white" />
                        </div>
                        {isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-emerald-600 shadow-sm">
                            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-black leading-tight">Vincollins Admissions</h3>
                        <p className="text-[11px] text-emerald-50/90 font-medium flex items-center gap-1 mt-0.5">
                          {isOnline ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                              Typically replies in minutes
                            </>
                          ) : (
                            <>
                              <Clock className="h-2.5 w-2.5" />
                              We&apos;ll reply during office hours
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="shrink-0 h-7 w-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                      title="Close"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 bg-slate-50/50 max-h-[60vh] overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-2 mb-4"
                  >
                    <div className="shrink-0 h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center">
                      <WhatsAppIcon className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <div className="flex-1 max-w-[85%]">
                      <div className="bg-white border border-slate-200/60 rounded-2xl rounded-tl-md px-3 py-2 shadow-sm">
                        <p className="text-xs text-slate-700 leading-relaxed">
                          👋 Welcome! Ready to enrol your child at <span className="font-bold text-slate-900">Vincollins Schools</span>?
                          How can we help you today?
                        </p>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 ml-2">Just now</p>
                    </div>
                  </motion.div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
                    Quick questions
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {WHATSAPP_QUICK_MESSAGES.map((qm, i) => (
                      <motion.button
                        key={qm.label}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        onClick={() => handleSend(qm.text)}
                        className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/60 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
                      >
                        <span className="text-base shrink-0">{qm.emoji}</span>
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700 flex-1">
                          {qm.label}
                        </span>
                        <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                      </motion.button>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
                      Or type your own
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        className="h-10 text-sm border-slate-200 bg-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400 rounded-lg flex-1"
                      />
                      <Button
                        onClick={() => handleSend()}
                        className="h-10 w-10 p-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 shrink-0 shadow-sm shadow-emerald-500/20"
                        title="Send via WhatsApp"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/60 flex items-center justify-center gap-1">
                  <Shield className="h-2.5 w-2.5 text-slate-400" />
                  <p className="text-[10px] text-slate-500 font-medium">
                    Powered by <span className="font-bold text-emerald-600">WhatsApp</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Tooltip Bubble ─────────────────────────────────── */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-24 right-4 sm:right-6 z-40 max-w-[240px]"
          >
            <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/60 p-3 pr-8">
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute top-1.5 right-1.5 h-5 w-5 rounded-md hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="h-3 w-3 text-slate-400" />
              </button>
              <p className="text-xs font-bold text-slate-900 leading-tight">
                🎓 Quick admission enquiry?
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Chat with our admissions team on WhatsApp!
              </p>
              <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-r border-b border-slate-200/60 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Button ────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setIsOpen(!isOpen)
          setShowTooltip(false)
        }}
        className="fixed bottom-5 right-4 sm:right-6 z-50 group"
        aria-label="Chat on WhatsApp"
      >
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse opacity-30" />
          </>
        )}

        <div className={cn(
          'relative h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
          isOpen
            ? 'bg-slate-700 hover:bg-slate-800'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/40'
        )}>
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6 text-white" strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="whatsapp"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <WhatsAppIcon className="h-7 w-7 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {!isOpen && isOnline && (
            <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-sm">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </span>
          )}
        </div>
      </motion.button>
    </>
  )
}

// ─── Field Component ─────────────────────────────────────────────
interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

function Field({
  id, label, type = 'text', value, onChange, placeholder, required, icon: Icon,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-slate-600 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3 text-slate-400" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="h-10 text-sm border-slate-200 bg-slate-50/50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all rounded-lg"
      />
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────────────
function SectionHeader({
  step, title, description, icon: Icon,
}: {
  step: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
            Step {step}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] font-medium text-slate-500">{description}</span>
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{title}</h3>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function AdmissionPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    studentName: '',
    studentAge: '',
    classApplyingFor: '',
    previousSchool: '',
    message: '',
  })

  const progress = useMemo(() => {
    const required = ['parentName', 'parentEmail', 'studentName', 'classApplyingFor']
    const filled = required.filter(k => formData[k as keyof typeof formData].trim() !== '').length
    return Math.round((filled / required.length) * 100)
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.parentName.trim() || !formData.parentEmail.trim() ||
      !formData.studentName.trim() || !formData.classApplyingFor) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert({
          name: formData.parentName.trim(),
          email: formData.parentEmail.trim(),
          phone: formData.parentPhone.trim() || null,
          subject: `Admission Application - ${formData.studentName} (${formData.classApplyingFor})`,
          message: `Student Name: ${formData.studentName}\nAge: ${formData.studentAge || 'Not provided'}\nApplying for: ${formData.classApplyingFor}\nPrevious School: ${formData.previousSchool || 'N/A'}\n\nMessage: ${formData.message || 'No additional message'}`,
          type: 'admission',
          status: 'new',
          metadata: {
            student_name: formData.studentName,
            student_age: formData.studentAge,
            class_applying: formData.classApplyingFor,
            previous_school: formData.previousSchool,
          },
        })

      if (error) throw error

      setSubmitted(true)
      toast.success('🎉 Application submitted successfully!')
      setFormData({
        parentName: '', parentEmail: '', parentPhone: '',
        studentName: '', studentAge: '', classApplyingFor: '',
        previousSchool: '', message: '',
      })
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  // ─── Send WhatsApp with form data pre-filled ─────────────────
  const handleSendViaWhatsApp = () => {
    const lines = [
      'Hello Vincollins Schools! I would like to apply for admission.',
      '',
      formData.parentName ? `Parent Name: ${formData.parentName}` : '',
      formData.parentPhone ? `Phone: ${formData.parentPhone}` : '',
      formData.studentName ? `Student Name: ${formData.studentName}` : '',
      formData.studentAge ? `Student Age: ${formData.studentAge}` : '',
      formData.classApplyingFor ? `Applying for: ${formData.classApplyingFor}` : '',
      formData.previousSchool ? `Previous School: ${formData.previousSchool}` : '',
      formData.message ? `\nMessage: ${formData.message}` : '',
    ].filter(Boolean).join('\n')

    openWhatsApp(lines || WHATSAPP_DEFAULT_MSG)
  }

  // ─── Success Screen ─────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            className="max-w-md w-full bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden"
          >
            <div className="relative h-24 bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    initial={{ y: -20, x: `${(i * 5) % 100}%`, opacity: 0 }}
                    animate={{ y: 120, opacity: [0, 1, 0] }}
                    transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }}
                  />
                ))}
              </div>
            </div>

            <div className="px-6 pb-8 -mt-12 relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
                className="mx-auto w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 ring-4 ring-emerald-50"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </motion.div>

              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Application Received! 🎉</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Thank you for choosing <span className="font-semibold text-slate-700">Vincollins Schools</span>.
                  Our admissions team will review your application and contact you within 24-48 hours.
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-4 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">What&apos;s Next?</p>
                  <div className="space-y-2">
                    {['Check your email for confirmation', 'Prepare student documents', 'Await our call for assessment'].map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <div className="shrink-0 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                          <span className="text-[9px] font-bold text-emerald-700">{i + 1}</span>
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WhatsApp follow-up */}
                <button
                  onClick={() => openWhatsApp('Hello! I just submitted an admission application for my child. Could you please confirm receipt and let me know the next steps?')}
                  className="w-full h-10 rounded-lg bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 mb-3 transition-all"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  Follow up on WhatsApp
                </button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="flex-1 h-10 rounded-lg border-slate-200 font-semibold text-sm"
                  >
                    Submit Another
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold text-sm">
                      Back to Home
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* WhatsApp widget stays visible on success page */}
        <WhatsAppWidget />
      </div>
    )
  }

  // ─── Main Page ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* ═══ Hero Banner ═══════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Breadcrumb */}
        <div className="relative border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center gap-1.5 text-xs">
              <Link href="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-1 font-medium">
                <Home className="h-3 w-3" />
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-white/30" />
              <span className="text-white font-semibold">Admission</span>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 backdrop-blur-sm mb-4"
              >
                <Sparkles className="h-3 w-3 text-emerald-300" />
                <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-widest">
                  Admissions Open · 2026/2027
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
              >
                Join the{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300">
                    Vincollins
                  </span>
                  <span className="absolute inset-x-0 bottom-1 h-2 bg-emerald-400/20 -z-0 blur-sm" />
                </span>{' '}
                Family
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-sm sm:text-base text-slate-300/90 max-w-xl leading-relaxed"
              >
                Give your child the gift of quality education in a nurturing, secure, and inspiring environment.
                Complete the application below or chat with us on WhatsApp to begin their journey.
              </motion.p>

              {/* WhatsApp CTA + Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <button
                  onClick={() => openWhatsApp()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] group"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Enquire on WhatsApp
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center gap-3 text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-300" />
                    <span className="text-xs font-medium">Secure</span>
                  </div>
                  <div className="w-px h-3 bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                    <span className="text-xs font-medium">Since 2004</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Stat cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-2 sm:gap-3 w-full lg:w-auto"
            >
              {HIGHLIGHTS.map((h, i) => (
                <motion.div
                  key={h.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex-1 lg:w-24 relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 sm:p-4 hover:bg-white/10 transition-colors group"
                >
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors" />
                  <div className="relative flex flex-col items-center text-center gap-1">
                    <h.icon className={cn('h-4 w-4 sm:h-5 sm:w-5', h.color)} />
                    <p className="text-xl sm:text-2xl font-black text-white leading-none">{h.value}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-white/60 uppercase tracking-widest">{h.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">

          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0"
          >
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="relative h-1 bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                />
              </div>

              <div className="p-5 sm:p-6 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Admission Application
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Please fill out the form below. Fields marked with <span className="text-rose-500 font-bold">*</span> are required.
                    </p>
                  </div>
                  <Badge className="shrink-0 bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] hover:bg-blue-100">
                    {progress}% Complete
                  </Badge>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">

                {/* Section 1: Parent */}
                <div className="space-y-4">
                  <SectionHeader
                    step={1}
                    title="Parent / Guardian Information"
                    description="Who's applying"
                    icon={User}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Field id="parentName" label="Full Name" value={formData.parentName} onChange={handleChange} placeholder="e.g. John Adebayo" required />
                    <Field id="parentEmail" label="Email Address" type="email" value={formData.parentEmail} onChange={handleChange} placeholder="you@example.com" required />
                  </div>

                  <Field id="parentPhone" label="Phone Number" value={formData.parentPhone} onChange={handleChange} placeholder="+234 800 000 0000" icon={Phone} />
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Section 2: Student */}
                <div className="space-y-4">
                  <SectionHeader
                    step={2}
                    title="Student Information"
                    description="Tell us about your child"
                    icon={Baby}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Field id="studentName" label="Student Name" value={formData.studentName} onChange={handleChange} placeholder="Full name" required />
                    <Field id="studentAge" label="Age" type="number" value={formData.studentAge} onChange={handleChange} placeholder="e.g. 5" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="classApplyingFor" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <SchoolIcon className="h-3 w-3 text-slate-400" />
                        Applying For Class
                        <span className="text-rose-500">*</span>
                      </Label>
                      <select
                        id="classApplyingFor"
                        value={formData.classApplyingFor}
                        onChange={handleChange}
                        className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all cursor-pointer"
                        required
                      >
                        <option value="">Select a class</option>
                        {CLASSES.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <Field id="previousSchool" label="Previous School" value={formData.previousSchool} onChange={handleChange} placeholder="Name of previous school" />
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Section 3: Message */}
                <div className="space-y-4">
                  <SectionHeader
                    step={3}
                    title="Additional Information"
                    description="Optional"
                    icon={MessageSquare}
                  />

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <FileText className="h-3 w-3 text-slate-400" />
                      Anything else we should know?
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Special requirements, health information, or any questions you may have..."
                      className="min-h-[110px] text-sm border-slate-200 bg-slate-50/50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all rounded-lg resize-none"
                    />
                  </div>
                </div>

                {/* Submit + WhatsApp alternative */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all font-bold text-sm gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting your application...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Application
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      or faster
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendViaWhatsApp}
                    className="w-full h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 transition-all group"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Send via WhatsApp
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <p className="text-[10px] text-center text-slate-400 mt-1 flex items-center justify-center gap-1">
                    <Shield className="h-2.5 w-2.5" />
                    Your information is secure and confidential
                  </p>
                </div>
              </form>
            </div>
          </motion.div>

          {/* SIDEBAR */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">

            {/* Why us */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl shadow-indigo-500/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 blur-xl" />

              <div className="relative p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Why Choose Us
                  </span>
                </div>
                <h3 className="text-lg font-black mb-4">The Vincollins Advantage</h3>

                <ul className="space-y-2.5">
                  {BENEFITS.map((benefit, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-start gap-2 text-xs leading-relaxed"
                    >
                      <div className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-white/15 flex items-center justify-center">
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-300" />
                      </div>
                      <span className="text-white/90">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* WhatsApp CTA — matches contact page */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-xl shadow-emerald-500/25"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 blur-xl" />

              <div className="relative p-5 text-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <WhatsAppIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Chat on WhatsApp</h3>
                    <p className="text-[11px] text-white/80 font-semibold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Instant Reply
                    </p>
                  </div>
                </div>

                <p className="text-xs text-white/90 leading-relaxed mb-4">
                  Have questions about admission? Get an{' '}
                  <span className="font-bold text-white">instant response</span> from our admissions team!
                </p>

                <button
                  onClick={() => openWhatsApp()}
                  className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 transition-colors text-xs font-black shadow-md group"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Start Chat Now
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Process */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5"
            >
              <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-slate-600" />
                </div>
                Admission Process
              </h3>

              <div className="relative space-y-4">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-200 via-amber-200 to-purple-200" />

                {PROCESS_STEPS.map((step) => {
                  const tones = {
                    blue: 'bg-blue-100 text-blue-700 ring-blue-50',
                    amber: 'bg-amber-100 text-amber-700 ring-amber-50',
                    emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-50',
                    purple: 'bg-purple-100 text-purple-700 ring-purple-50',
                  }
                  return (
                    <div key={step.num} className="relative flex items-start gap-3">
                      <div className={cn(
                        'relative shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-black ring-4',
                        tones[step.tone as keyof typeof tones]
                      )}>
                        {step.num}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{step.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5"
            >
              <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                Need Help?
              </h3>

              <div className="space-y-2">
                {CONTACT_ITEMS.map((item, i) => {
                  const content = (
                    <div className="flex items-center gap-2.5 p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="shrink-0 h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <item.icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {item.label}
                      </span>
                    </div>
                  )
                  return item.href ? (
                    <a key={i} href={item.href} className="group block">
                      {content}
                    </a>
                  ) : (
                    <div key={i} className="group">{content}</div>
                  )
                })}
              </div>
            </motion.div>
          </aside>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-8 mt-10 border-t border-slate-200/50">
          <p className="font-semibold text-slate-500">Vincollins Schools · Admission</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>

      {/* ═══ WhatsApp Floating Widget ═══════════════════════════ */}
      <WhatsAppWidget />
    </div>
  )
}