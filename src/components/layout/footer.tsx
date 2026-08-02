// components/layout/footer.tsx

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Mail, Phone, MapPin, ArrowRight, ChevronRight,
  Award, Shield, Heart, Sparkles, Send, Clock,
  GraduationCap, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Brand SVG Icons (lucide removed these in v0.29+) ────────────────────────

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SchoolSettings {
  school_name?: string
  logo_path?: string
  school_phone?: string
  school_email?: string
  school_address?: string
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const socialLinks = [
  {
    icon: FacebookIcon,
    href: 'https://facebook.com/vincollins',
    label: 'Facebook',
    hoverColor: 'hover:bg-[#1877f2] hover:border-[#1877f2] hover:text-white',
  },
  {
    icon: TwitterXIcon,
    href: 'https://twitter.com/vincollins',
    label: 'Twitter / X',
    hoverColor: 'hover:bg-zinc-900 hover:border-zinc-700 hover:text-white',
  },
  {
    icon: InstagramIcon,
    href: 'https://instagram.com/vincollins',
    label: 'Instagram',
    hoverColor: 'hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white',
  },
  {
    icon: LinkedinIcon,
    href: 'https://linkedin.com/school/vincollins',
    label: 'LinkedIn',
    hoverColor: 'hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white',
  },
]

const footerNavItems = {
  academics: [
    { id: 'creche',   title: 'Crèche / Playgroup', href: '/academics/creche-playgroup' },
    { id: 'nursery',  title: 'Nursery',             href: '/academics/nursery' },
    { id: 'primary',  title: 'Primary',             href: '/academics/primary' },
    { id: 'college',  title: 'College',             href: '/academics/college' },
  ],
  about: [
    { id: 'story',      title: 'Our Story',       href: '/about' },
    { id: 'mission',    title: 'Mission & Vision', href: '/about/mission' },
    { id: 'values',     title: 'Core Values',      href: '/about/values' },
    { id: 'leadership', title: 'Leadership',       href: '/about/leadership' },
    { id: 'contact',    title: 'Contact Us',       href: '/contact' },
  ],
  portal: [
    { id: 'student-portal', title: 'Student Portal', href: '/portal' },
    { id: 'staff-portal',   title: 'Staff Portal',   href: '/portal' },
    { id: 'admin-portal',   title: 'Admin Portal',   href: '/portal' },
  ],
}

const defaultContactInfo = {
  address: '7/9 Lawani Street, off Ishaga Rd, Surulere, Lagos',
  phone:   '+234 912 1155 554',
  email:   'vincollinsschools@gmail.com',
  hours:   'Mon – Fri: 8:00 AM – 4:00 PM',
}

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms',   label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/sitemap', label: 'Sitemap' },
]

// ─── Reusable Sub-components ──────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white mb-6">
      <span className="w-1 h-4 rounded-full bg-amber-400 shrink-0" />
      {children}
    </h3>
  )
}

function NavLink({
  href,
  children,
  onClick,
  isActive = false,
}: {
  href: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  isActive?: boolean
}) {
  const base   = 'group inline-flex items-center gap-2 text-[13px] transition-colors duration-200'
  const colour = isActive
    ? 'text-amber-400 font-semibold'
    : 'text-white/60 hover:text-amber-400'

  const inner = (
    <>
      <ChevronRight
        className={cn(
          'h-3 w-3 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5',
          isActive ? 'text-amber-400' : 'text-amber-400/40 group-hover:text-amber-400'
        )}
      />
      {children}
    </>
  )

  if (onClick) {
    return (
      <a href={href} onClick={onClick} className={cn(base, colour)}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={cn(base, colour)}>
      {inner}
    </Link>
  )
}

function ContactRow({
  icon: Icon,
  children,
}: {
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3 group">
      <span className="mt-0.5 p-2 rounded-lg bg-amber-400/10 border border-amber-400/10 group-hover:bg-amber-400/20 transition-colors duration-200 shrink-0">
        <Icon className="h-3.5 w-3.5 text-amber-400" />
      </span>
      <span className="text-[13px] leading-relaxed text-white/65 pt-1.5">
        {children}
      </span>
    </li>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Footer() {
  const pathname    = usePathname()
  const router      = useRouter()
  const currentYear = new Date().getFullYear()

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null)
  const [email,      setEmail]      = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subError,   setSubError]   = useState('')
  const [contactData, setContactData] = useState(defaultContactInfo)

  // ── Auth listener (kept for portal behaviour) ──────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {})
    return () => subscription.unsubscribe()
  }, [])

  // ── School settings ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('school_name, logo_path, school_phone, school_email, school_address')
          .single()

        if (!error && data) {
          setSchoolSettings(data)
          setContactData({
            address: data.school_address || defaultContactInfo.address,
            phone:   data.school_phone   || defaultContactInfo.phone,
            email:   data.school_email   || defaultContactInfo.email,
            hours:   defaultContactInfo.hours,
          })
        }
      } catch { /* silent */ }
    }
    fetchSettings()
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setSubError('Please enter a valid email.'); return }
    setSubError('')
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 4000)
  }

  const handlePortalClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/portal')
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <footer className="relative isolate bg-[#07194f] text-white overflow-hidden">

      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-amber-400/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-sky-500/5 blur-3xl" />

      {/* Top accent line */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

      {/* ══════════════════════════════════════════════════════════════
          NEWSLETTER BANNER
      ══════════════════════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* Copy */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </span>
              <div>
                <p className="font-bold text-white text-sm">Stay in the loop</p>
                <p className="text-white/55 text-xs mt-0.5">
                  Get school news, events &amp; updates delivered to your inbox.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
              <div className="relative flex-1 sm:w-64">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSubError('') }}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#07194f] text-sm font-bold transition-all duration-200 shadow-md shadow-amber-400/20 hover:shadow-amber-300/30 whitespace-nowrap"
              >
                {subscribed ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {(subscribed || subError) && (
              <motion.p
                key={subscribed ? 'ok' : 'err'}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'pb-3 text-xs text-center',
                  subscribed ? 'text-amber-400' : 'text-rose-400'
                )}
              >
                {subscribed ? "🎉 Thank you! You're now subscribed." : subError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN GRID
      ══════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-14 lg:py-20 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">

          {/* ── Brand column ─────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-7">

            {/* Logo + name */}
            <Link href="/" className="group inline-flex items-center gap-3.5 w-fit">
              <motion.div
                whileHover={{ scale: 1.06 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative h-14 w-14 shrink-0"
              >
                {schoolSettings?.logo_path ? (
                  <Image
                    src={schoolSettings.logo_path}
                    alt={schoolSettings.school_name || 'Vincollins Schools'}
                    width={56}
                    height={56}
                    className="object-contain rounded-xl"
                    priority
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <GraduationCap className="h-7 w-7 text-amber-400" />
                  </div>
                )}
              </motion.div>

              <div>
                <p 
                  className="text-3xl sm:text-4xl font-bold leading-none"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  <span className="text-white group-hover:text-amber-400 transition-colors duration-300">
                    Vincollins
                  </span>{' '}
                  <span className="text-amber-400">Schools</span>
                </p>
                <p 
                  className="mt-1 text-[11px] font-medium tracking-widest text-amber-400/70 uppercase"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  Geared Towards Excellence
                </p>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-[13.5px] leading-[1.75] text-white/55 max-w-sm">
              Providing quality education from Crèche to College. Nurturing
              future leaders with excellence, integrity, and innovation since 2022.
            </p>

            {/* Stat badges */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: Award,  label: '4+ Years' },
                { icon: Shield, label: 'Accredited' },
                { icon: Heart,  label: '50+ Alumni' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-[12px] font-medium text-white/75 hover:border-amber-400/30 hover:text-white transition-all duration-200"
                >
                  <Icon className="h-3.5 w-3.5 text-amber-400" />
                  {label}
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="flex gap-2.5 pt-1">
              {socialLinks.map(({ icon: Icon, href, label, hoverColor }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    'h-9 w-9 flex items-center justify-center rounded-lg',
                    'bg-white/[0.08] border border-white/[0.12]',
                    'text-white/60 transition-all duration-200 hover:scale-110',
                    hoverColor
                  )}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Nav columns ──────────────────────────────────────────── */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 gap-8">

            {/* Our Schools */}
            <div>
              <SectionHeading>Our Schools</SectionHeading>
              <ul className="space-y-3">
                {footerNavItems.academics.map((item) => (
                  <li key={item.id}>
                    <NavLink href={item.href} isActive={pathname === item.href}>
                      {item.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* About */}
            <div>
              <SectionHeading>About Us</SectionHeading>
              <ul className="space-y-3">
                {footerNavItems.about.map((item) => (
                  <li key={item.id}>
                    <NavLink href={item.href} isActive={pathname === item.href}>
                      {item.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portals */}
            <div>
              <SectionHeading>Portals</SectionHeading>
              <ul className="space-y-3">
                {footerNavItems.portal.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      href={item.href}
                      isActive={pathname === item.href}
                      onClick={handlePortalClick}
                    >
                      {item.title}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* Enrolment CTA card */}
              <div className="mt-8 rounded-xl bg-amber-400/[0.08] border border-amber-400/15 p-4 space-y-2">
                <p className="text-[12px] font-semibold text-white/80">Ready to enrol?</p>
                <p className="text-[11.5px] text-white/45 leading-relaxed">
                  Begin your child&apos;s journey with us today.
                </p>
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-amber-400 hover:text-amber-300 transition-colors group"
                >
                  Apply now
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── Contact column ───────────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <SectionHeading>Get in Touch</SectionHeading>

            <ul className="space-y-4">
              <ContactRow icon={MapPin}>
                {contactData.address}
              </ContactRow>

              <ContactRow icon={Phone}>
                <a
                  href={`tel:${contactData.phone.replace(/\s/g, '')}`}
                  className="hover:text-amber-400 transition-colors"
                >
                  {contactData.phone}
                </a>
              </ContactRow>

              <ContactRow icon={Mail}>
                <a
                  href={`mailto:${contactData.email}`}
                  className="hover:text-amber-400 transition-colors break-all"
                >
                  {contactData.email}
                </a>
              </ContactRow>

              <ContactRow icon={Clock}>
                {contactData.hours}
              </ContactRow>
            </ul>

            {/* CTA button */}
            <Link
              href="/contact"
              className="group mt-1 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-3 text-sm font-bold text-[#07194f] shadow-lg shadow-amber-400/20 hover:shadow-amber-300/30 transition-all duration-200"
            >
              <Send className="h-4 w-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              Send us a message
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Google Maps link */}
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(contactData.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 hover:border-amber-400/30 bg-white/[0.03] hover:bg-amber-400/5 py-4 text-xs text-white/40 group-hover:text-amber-400 transition-all duration-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM BAR
      ══════════════════════════════════════════════════════════════ */}
      <div className="border-t border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11.5px] text-white/35 text-center sm:text-left">
              © {currentYear}{' '}
              <span className="text-white/55 font-medium">Vincollins Schools</span>.
              All rights reserved.
            </p>

            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {legalLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-[11.5px] text-white/35 hover:text-amber-400 transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}