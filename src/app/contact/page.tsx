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
  Mail, Phone, MapPin, Send, Loader2,
  CheckCircle2, MessageSquare, Clock,
  Home, ChevronRight, User, FileText,
  ArrowRight, Shield, Sparkles, Zap,
  Copy, Check, X,
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'

// ─── School WhatsApp Number (change here) ─────────────────────
const WHATSAPP_NUMBER = '2349070829999' // No + sign, no spaces — international format
const WHATSAPP_DEFAULT_MSG = 'Hello Vincollins Schools! I would like to make an enquiry.'

// ─── Brand Icons (inline SVGs — reliable across lucide versions) ────────────
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

// ─── WhatsApp Brand Icon ──────────────────────────────────────
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

// ─── Constants ────────────────────────────────────────────────
const CONTACT_METHODS = [
  {
    icon: MapPin,
    label: 'Visit Us',
    value: '7/9 Lawani Street, off Ishaga Rd, Surulere, Lagos',
    tone: 'blue' as const,
    copyable: true,
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+234 907 082 9999',
    href: 'tel:+2349070829999',
    tone: 'emerald' as const,
    copyable: true,
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'vincollinsschools@gmail.com',
    href: 'mailto:vincollinsschools@gmail.com',
    tone: 'purple' as const,
    copyable: true,
  },
  {
    icon: Clock,
    label: 'Office Hours',
    value: 'Mon-Fri · 8:00 AM - 4:00 PM',
    tone: 'amber' as const,
  },
]

const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: TwitterIcon, href: '#', label: 'Twitter / X' },
  { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
]

const QUICK_FACTS = [
  { icon: Zap, value: '< 24h', label: 'Response Time' },
  { icon: MessageSquare, value: '1,200+', label: 'Messages Handled' },
  { icon: CheckCircle2, value: '98%', label: 'Satisfaction' },
]

const SUBJECT_SUGGESTIONS = [
  'Admission Enquiry',
  'Fee Structure',
  'Curriculum Info',
  'Visit Request',
  'General Feedback',
]

// ─── WhatsApp quick messages ─────────────────────────────────
const WHATSAPP_QUICK_MESSAGES = [
  { emoji: '🎓', label: 'I want to enrol my child', text: 'Hello! I would like to enrol my child at Vincollins Schools. Can you share the admission process?' },
  { emoji: '💰', label: 'What are the school fees?', text: 'Hello! I would like to know about the school fees and payment plans.' },
  { emoji: '📅', label: 'I want to visit the school', text: 'Hello! I would like to schedule a visit to the school. When would be a good time?' },
  { emoji: '📚', label: 'Tell me about the curriculum', text: 'Hello! Please share more information about your curriculum and subjects offered.' },
]

// ─── Tone mappings ────────────────────────────────────────────
const TONE_STYLES = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
}

// ─── Helper: Open WhatsApp with message ──────────────────────
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

  // Auto-show tooltip on first visit after 3s
  useEffect(() => {
    const t = setTimeout(() => {
      if (!isOpen) setShowTooltip(true)
    }, 3000)

    // Hide tooltip after 5s
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
            {/* Backdrop for mobile */}
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
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="whatsapp-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="1" fill="white" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#whatsapp-pattern)" />
                    </svg>
                  </div>

                  <div className="relative p-4 flex items-start justify-between text-white">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
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
                        <h3 className="text-sm font-black leading-tight">Vincollins Schools</h3>
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
                  {/* Welcome bubble */}
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
                          👋 Hi there! Welcome to <span className="font-bold text-slate-900">Vincollins Schools</span>.
                          How can we help you today?
                        </p>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 ml-2">Just now</p>
                    </div>
                  </motion.div>

                  {/* Quick reply chips */}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">
                    Quick messages
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

                  {/* Custom message input */}
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
                💬 Need help fast?
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                Chat with us on WhatsApp for a quick reply!
              </p>
              {/* Speech bubble tail */}
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
        {/* Pulse rings */}
        {!isOpen && (
          <>
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse opacity-30" />
          </>
        )}

        {/* Button */}
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

          {/* Online indicator dot */}
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

// ─── Field Component ──────────────────────────────────────────
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

// ─── Contact Method Row (with copy button) ────────────────────
function ContactMethodRow({
  method,
  index,
}: {
  method: typeof CONTACT_METHODS[number]
  index: number
}) {
  const [copied, setCopied] = useState(false)
  const t = TONE_STYLES[method.tone]

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(method.value)
    setCopied(true)
    toast.success(`${method.label} copied!`, { duration: 1500 })
    setTimeout(() => setCopied(false), 2000)
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="group flex items-start gap-3 p-3 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer bg-white"
    >
      <div className={cn('shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ring-4', t.bg, t.ring)}>
        <method.icon className={cn('h-4 w-4', t.text)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
          {method.label}
        </p>
        <p className="text-xs font-semibold text-slate-800 leading-snug break-words">
          {method.value}
        </p>
      </div>

      {method.copyable && (
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          title="Copy"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>
      )}
    </motion.div>
  )

  return method.href ? (
    <a href={method.href} className="block">
      {content}
    </a>
  ) : (
    content
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const progress = useMemo(() => {
    const required = ['name', 'email', 'subject', 'message']
    const filled = required.filter(k => formData[k as keyof typeof formData].trim() !== '').length
    return Math.round((filled / required.length) * 100)
  }, [formData])

  const charCount = formData.message.length
  const charLimit = 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim() ||
      !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          type: 'contact',
          status: 'new',
        })

      if (error) throw error

      setSubmitted(true)
      toast.success('🎉 Message sent successfully!')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubjectSuggestion = (subject: string) => {
    setFormData({ ...formData, subject })
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
            {/* Animated header */}
            <div className="relative h-24 bg-gradient-to-br from-emerald-500 to-teal-600 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-white rounded-full"
                    initial={{ y: -10, x: `${(i * 7) % 100}%`, opacity: 0 }}
                    animate={{ y: 120, opacity: [0, 1, 0] }}
                    transition={{ duration: 2, delay: i * 0.15, repeat: Infinity, repeatDelay: 1 }}
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
                <h2 className="text-2xl font-black text-slate-900 mb-2">Message Sent! 🎉</h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Thanks for reaching out to <span className="font-semibold text-slate-700">Vincollins Schools</span>.
                  We&apos;ll get back to you within 24 hours.
                </p>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-6 flex items-center gap-3 text-left">
                  <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Quick reply expected</p>
                    <p className="text-[11px] text-emerald-700">Check your email inbox</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="flex-1 h-10 rounded-lg border-slate-200 font-semibold text-sm"
                  >
                    Send Another
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button className="w-full h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold text-sm">
                      Back Home
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* WhatsApp Widget on success page too */}
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
        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        {/* Grid pattern */}
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
              <span className="text-white font-semibold">Contact Us</span>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Left: Copy */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 backdrop-blur-sm mb-4"
              >
                <MessageSquare className="h-3 w-3 text-cyan-300" />
                <span className="text-[11px] font-bold text-cyan-200 uppercase tracking-widest">
                  We&apos;re Here to Help
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight"
              >
                Let&apos;s Start a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300">
                    Conversation
                  </span>
                  <span className="absolute inset-x-0 bottom-1 h-2 bg-cyan-400/20 -z-0 blur-sm" />
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-sm sm:text-base text-slate-300/90 max-w-xl leading-relaxed"
              >
                Have questions, feedback, or just want to say hello? We&apos;d love to hear from you.
                Reach out through the form below or use any of our direct channels.
              </motion.p>

              {/* Trust indicators + WhatsApp CTA */}
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
                  Chat on WhatsApp
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center gap-3 text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-cyan-300" />
                    <span className="text-xs font-medium">Fast Response</span>
                  </div>
                  <div className="w-px h-3 bg-white/20" />
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-300" />
                    <span className="text-xs font-medium">Private &amp; Secure</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Quick facts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-2 sm:gap-3 w-full lg:w-auto"
            >
              {QUICK_FACTS.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex-1 lg:w-28 relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 sm:p-4 hover:bg-white/10 transition-colors group"
                >
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors" />
                  <div className="relative flex flex-col items-center text-center gap-1">
                    <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-300" />
                    <p className="text-lg sm:text-2xl font-black text-white leading-none">{f.value}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-white/60 uppercase tracking-widest">
                      {f.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">

          {/* ─── FORM ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0"
          >
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              {/* Progress bar */}
              <div className="relative h-1 bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
                />
              </div>

              {/* Card header */}
              <div className="p-5 sm:p-6 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      Send Us a Message
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Fill out the form and we&apos;ll respond as soon as possible.
                    </p>
                  </div>
                  <Badge className="shrink-0 bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] hover:bg-blue-100">
                    {progress}% Complete
                  </Badge>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">

                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Field
                    id="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    icon={User}
                    required
                  />
                  <Field
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    icon={Mail}
                    required
                  />
                </div>

                {/* Row 2: Phone + Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Field
                    id="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    icon={Phone}
                  />
                  <Field
                    id="subject"
                    label="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    icon={FileText}
                    required
                  />
                </div>

                {/* Subject suggestions */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Quick pick
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUBJECT_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleSubjectSuggestion(sug)}
                        className={cn(
                          'text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all',
                          formData.subject === sug
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message with char counter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-slate-400" />
                      Message
                      <span className="text-rose-500">*</span>
                    </Label>
                    <span className={cn(
                      'text-[10px] font-semibold tabular-nums',
                      charCount > charLimit * 0.9 ? 'text-amber-600' : 'text-slate-400'
                    )}>
                      {charCount}/{charLimit}
                    </span>
                  </div>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                    maxLength={charLimit}
                    className="min-h-[140px] text-sm border-slate-200 bg-slate-50/50 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-400 transition-all rounded-lg resize-none"
                    required
                  />
                </div>

                {/* Submit */}
                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all font-bold text-sm gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending your message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* WhatsApp alternative */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      or faster
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const message = formData.message.trim()
                        ? `Hello Vincollins Schools! ${formData.name ? `My name is ${formData.name}.` : ''} ${formData.subject ? `Subject: ${formData.subject}.` : ''}\n\n${formData.message.trim()}`
                        : WHATSAPP_DEFAULT_MSG
                      openWhatsApp(message)
                    }}
                    className="w-full h-11 rounded-xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 text-emerald-700 font-bold text-sm flex items-center justify-center gap-2 transition-all group"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Send via WhatsApp
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <p className="text-[10px] text-center text-slate-400 mt-1 flex items-center justify-center gap-1">
                    <Shield className="h-2.5 w-2.5" />
                    Your information is safe with us
                  </p>
                </div>
              </form>
            </div>
          </motion.div>

          {/* ─── SIDEBAR ──────────────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">

            {/* Contact Methods */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  Get in Touch
                </h3>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold hover:bg-emerald-100">
                  <span className="relative flex h-1.5 w-1.5 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  ONLINE
                </Badge>
              </div>

              <div className="space-y-2">
                {CONTACT_METHODS.map((method, i) => (
                  <ContactMethodRow key={method.label} method={method} index={i} />
                ))}
              </div>
            </motion.div>

            {/* WhatsApp CTA Card (replaces Quick Response) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                  Get an <span className="font-bold text-white">instant response</span> by messaging us
                  directly on WhatsApp. Perfect for quick questions!
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

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5"
            >
              <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                </div>
                Follow Us
              </h3>

              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Stay updated with school news, events, and student achievements.
              </p>

              <div className="grid grid-cols-4 gap-2">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="group aspect-square rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center"
                  >
                    <s.icon className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Map preview */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm bg-gradient-to-br from-slate-100 to-slate-200"
            >
              <div className="relative h-40 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(148,163,184,.4) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(148,163,184,.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '24px 24px',
                  }}
                />
                <div className="absolute top-[30%] left-0 right-0 h-1 bg-white/60" />
                <div className="absolute top-[60%] left-0 right-0 h-1 bg-white/60" />
                <div className="absolute top-0 bottom-0 left-[40%] w-1 bg-white/60" />

                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full"
                >
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-red-500 border-r-2 border-b-2 border-white" />
                    <motion.div
                      animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-red-500"
                    />
                  </div>
                </motion.div>
              </div>

              <div className="p-4 bg-white">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                  Our Campus
                </p>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  7/9 Lawani Street, off Ishaga Rd
                </p>
                <p className="text-[11px] text-slate-500">Surulere, Lagos</p>
                <a
                  href="https://maps.google.com/?q=7/9+Lawani+Street+Surulere+Lagos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                >
                  Open in Maps
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          </aside>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-8 mt-10 border-t border-slate-200/50">
          <p className="font-semibold text-slate-500">Vincollins Schools · Contact Us</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
        </div>
      </div>

      {/* ═══ WhatsApp Floating Widget ═══════════════════════════ */}
      <WhatsAppWidget />
    </div>
  )
}