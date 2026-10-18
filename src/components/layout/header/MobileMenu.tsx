/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { memo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, LayoutDashboard, Users, FileCheck, GraduationCap, Briefcase,
  LogOut, Home, KeyRound, BookOpen,
  Mail, MapPin, Phone, Clock,
  FileText, Activity, Award, UserCog,
  CalendarCheck, Calculator, Notebook, ClipboardCheck, Megaphone,
  BarChart3
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { HeaderUser, SchoolSettings } from './types'
import { SignOutDialog } from './SignOutDialog'

// ── Social & Contact ────────────────────────────────────────────────────────
const socialLinks = [
  { icon: 'f', href: 'https://facebook.com/vincollins', label: 'Facebook', color: '#1877f2' },
  { icon: '𝕏', href: 'https://twitter.com/vincollins', label: 'Twitter', color: '#000000' },
  { icon: 'ig', href: 'https://instagram.com/vincollins', label: 'Instagram', color: '#E1306C' },
  { icon: 'in', href: 'https://linkedin.com/school/vincollins', label: 'LinkedIn', color: '#0A66C2' },
]

const contactInfoData = [
  { icon: MapPin, label: 'Address', text: '7/9 Lawani Street, Surulere, Lagos' },
  { icon: Phone, label: 'Phone', text: '+234 907 082 9999' },
  { icon: Mail, label: 'Email', text: 'vincollinsschools@gmail.com' },
  { icon: Clock, label: 'Hours', text: 'Mon–Fri · 8:00 AM – 4:00 PM' },
]

const publicNavItems = [
  { name: 'Home', href: '/', icon: Home, description: 'Back to landing page' },
  { name: 'Admission', href: '/admission', icon: FileText, description: 'Apply to enroll' },
  { name: 'Schools', href: '/schools', icon: BookOpen, description: 'Explore our sections' },
  { name: 'Contact', href: '/contact', icon: Activity, description: 'Get in touch' },
]

// ✅ PERFECTLY SYNCED WITH StaffSidebar.tsx
const dashboardNavMap: Record<string, { name: string; href: string; icon: any; description: string }[]> = {
  admin: [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard, description: 'Dashboard summary' },
    { name: 'Students', href: '/admin/students', icon: GraduationCap, description: 'Manage pupils' },
    { name: 'Staff', href: '/admin/staff', icon: Briefcase, description: 'Teachers & admins' },
    { name: 'Reports', href: '/admin/report-cards', icon: FileCheck, description: 'Report cards' },
  ],
  teacher: [
    { name: 'Overview', href: '/staff', icon: LayoutDashboard, description: 'Dashboard & Analytics' },
    { name: 'Attendance', href: '/staff/attendance', icon: CalendarCheck, description: 'Mark Daily Attendance' },
    { name: 'Pupils', href: '/staff/pupils', icon: Users, description: 'Class Roster' },
    { name: 'Assignments', href: '/staff/assignments', icon: FileText, description: 'Course Work' },
    { name: 'Study Notes', href: '/staff/notes', icon: Notebook, description: 'Learning Materials' },
    { name: 'Scores', href: '/staff/scores', icon: Calculator, description: 'CA & Exam Scores' },
    { name: 'Report Cards', href: '/staff/report-cards', icon: ClipboardCheck, description: 'Termly Reports' },
    { name: 'Analytics', href: '/staff/analytics', icon: BarChart3, description: 'Performance Insights' },
    { name: 'Announcements', href: '/staff/announcements', icon: Megaphone, description: 'School Updates' },
  ],
  pupil: [
    { name: 'Dashboard', href: '/pupil', icon: LayoutDashboard, description: 'Your dashboard' },
    { name: 'Results', href: '/pupil/results', icon: Award, description: 'View your grades' },
    { name: 'Report Cards', href: '/pupil/report-cards', icon: FileCheck, description: 'Termly reports' },
    { name: 'Profile', href: '/pupil/profile', icon: UserCog, description: 'Your details' },
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getFullName = (user?: HeaderUser | null): string => {
  if (!user) return 'User'
  return user.name || user.firstName || 'User'
}

const getInitials = (user?: HeaderUser | null): string => {
  const name = getFullName(user).trim()
  if (!name || name === 'User') return 'U'
  const parts = name.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const roleConfig: Record<string, { label: string; color: string; gradient: string; bg: string }> = {
  admin: {
    label: 'Administrator',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706, #B45309)',
    bg: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  teacher: {
    label: 'Teacher/Staff',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    bg: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  pupil: {
    label: 'Pupil',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
}

const getRoleConfig = (role?: string) => {
  if (!role) return roleConfig.pupil
  const norm = role.toLowerCase()
  if (norm === 'admin') return roleConfig.admin
  if (norm === 'teacher' || norm === 'staff') return roleConfig.teacher
  return roleConfig.pupil
}

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  user: HeaderUser | null
  schoolSettings: SchoolSettings | null
  onSignOut: () => void
  pathname: string
}

export const MobileMenu = memo(function MobileMenu({
  open, onClose, user, onSignOut, pathname,
}: MobileMenuProps) {
  const router = useRouter()
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const currentYear = new Date().getFullYear()

  // ─── Body scroll lock (stable, no jitter) ────────────────────────────────
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [open])

  const isAuthenticated = user?.isAuthenticated ?? false
  const fullName = getFullName(user)
  const userInitials = getInitials(user)
  const currentRole = getRoleConfig(user?.role)
  const isDashboardPage = !!pathname?.match(/^\/(admin|staff|pupil|student)/)
  const isPortalPage = pathname === '/portal'

  const navItems = isDashboardPage && isAuthenticated
    ? (dashboardNavMap[user?.role || 'pupil'] || dashboardNavMap.pupil)
    : publicNavItems

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    if (pathname === href) return true
    if (href === '/admin' || href === '/staff' || href === '/pupil') return pathname === href
    return pathname?.startsWith(href + '/') || false
  }

  const handleNav = (href: string) => {
    onClose()
    setTimeout(() => router.push(href), 100)
  }

  // ─── Sign Out ────────────────────────────────────────────────────────────
  const handleSignOutClick = () => {
    onClose()
    setTimeout(() => setSignOutDialogOpen(true), 200)
  }

  const handleSignOutConfirm = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      setSignOutDialogOpen(false)
      await onSignOut()
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoggingOut(false)
      setSignOutDialogOpen(true)
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop — z-[60] to sit above header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={onClose}
            />

            {/* Drawer — z-[70] above backdrop */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed top-0 right-0 h-[100dvh] w-[88%] max-w-[380px] bg-white z-[70] lg:hidden flex flex-col overflow-hidden shadow-2xl"
            >
              {/* ── Header ── */}
              <div className="relative flex-shrink-0 bg-gradient-to-br from-[#0A2472] via-[#1e3a8a] to-[#312e81] px-4 py-4 safe-area-inset-top">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-white/30">
                      <GraduationCap className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-[13px] leading-tight truncate">
                        Vincollins Schools
                      </p>
                      <p className="text-white/70 text-[10px] italic mt-0.5 truncate">
                        Geared Towards Excellence
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white flex-shrink-0 active:scale-95 transition-all"
                    aria-label="Close menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Profile Card (authenticated) ── */}
              {isAuthenticated && (
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                        <AvatarImage src={user?.avatar} alt={fullName} />
                        <AvatarFallback
                          className="text-white text-xs font-bold"
                          style={{ background: currentRole.gradient }}
                        >
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-[13px] truncate leading-tight">
                        {fullName}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {user?.email || ''}
                      </p>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border',
                          currentRole.bg,
                        )}
                      >
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: currentRole.color }}
                        />
                        {currentRole.label}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Scrollable Nav ── */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-4">

                  {/* Primary Navigation */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-2">
                      {isDashboardPage ? 'Dashboard Menu' : 'Navigation'}
                    </p>
                    <div className="space-y-1">
                      {navItems.map((item) => {
                        const active = isActive(item.href)
                        const color = isDashboardPage ? currentRole.color : '#0A2472'

                        return (
                          <button
                            key={item.name}
                            onClick={() => handleNav(item.href)}
                            className={cn(
                              'flex items-center gap-3 w-full p-2.5 rounded-xl transition-all text-left active:scale-[0.98]',
                              active ? 'bg-blue-50/70 shadow-sm' : 'hover:bg-gray-50 active:bg-gray-100',
                            )}
                            style={active ? { borderLeft: `3px solid ${color}` } : {}}
                          >
                            <div
                              className={cn(
                                'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                active ? 'bg-white shadow-sm' : 'bg-gray-100',
                              )}
                            >
                              <item.icon
                                className="h-4 w-4"
                                style={{ color: active ? color : '#9ca3af' }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  'text-[13px] font-bold leading-tight truncate',
                                  active ? '' : 'text-gray-800',
                                )}
                                style={active ? { color } : {}}
                              >
                                {item.name}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate mt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Quick Links (dashboard only) */}
                  {isDashboardPage && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-2">
                        Quick Links
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleNav('/')}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all"
                        >
                          <Home className="h-4 w-4 text-gray-600" />
                          <span className="text-[11px] font-bold text-gray-700">Home</span>
                        </button>
                        {!isPortalPage && (
                          <button
                            onClick={() => handleNav('/portal')}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 transition-all border border-amber-100"
                          >
                            <KeyRound className="h-4 w-4 text-amber-600" />
                            <span className="text-[11px] font-bold text-amber-700">Portal</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-2">
                      Get in Touch
                    </p>
                    <div className="rounded-xl border border-gray-100 bg-gray-50/60 divide-y divide-gray-100">
                      {contactInfoData.map((info, idx) => (
                        <a
                          key={idx}
                          href={
                            info.icon === Phone ? `tel:${info.text.replace(/\s/g, '')}` :
                            info.icon === Mail ? `mailto:${info.text}` : '#'
                          }
                          className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white transition-colors first:rounded-t-xl last:rounded-b-xl active:bg-gray-100"
                        >
                          <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                            <info.icon className="h-3 w-3 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-0.5">
                              {info.label}
                            </p>
                            <p className="text-[11px] text-gray-700 font-medium truncate">
                              {info.text}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Social */}
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-2">
                      Follow Us
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {socialLinks.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all active:scale-90"
                          style={{ color: s.color }}
                        >
                          <span className="font-black text-[12px]" style={{ fontFamily: s.icon === '𝕏' ? 'system-ui' : 'inherit' }}>
                            {s.icon}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* ── Footer ── */}
              <div className="flex-shrink-0 border-t border-gray-100 bg-white p-3 space-y-2 pb-[max(12px,env(safe-area-inset-bottom))]">
                {isAuthenticated ? (
                  <button
                    onClick={handleSignOutClick}
                    className="w-full h-11 rounded-xl font-bold text-[13px] text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                ) : (
                  !isPortalPage && (
                    <button
                      onClick={() => handleNav('/portal')}
                      className="w-full h-11 rounded-xl font-bold text-[13px] text-[#0A2472] bg-gradient-to-r from-amber-400 to-amber-500 shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <KeyRound className="h-4 w-4" />
                      Access Portal
                    </button>
                  )
                )}

                <div className="text-center pt-1">
                  <p className="text-[10px] font-semibold text-gray-500">
                    © {currentYear} Vincollins Schools
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SignOutDialog
        open={signOutDialogOpen}
        onClose={() => setSignOutDialogOpen(false)}
        onLogout={handleSignOutConfirm}
        isLoggingOut={isLoggingOut}
      />
    </>
  )
})

export default MobileMenu