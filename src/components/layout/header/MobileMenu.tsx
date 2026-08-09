/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/layout/header/MobileMenu.tsx
'use client'

import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  X, LayoutDashboard, Users, FileCheck, GraduationCap, Briefcase, BarChart3,
  LogOut, ArrowRight, Home, KeyRound, BookOpen,
  Mail, MapPin, Phone, Clock, Sparkles,
  FileText, Activity, ChevronRight, Award, UserCog
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { HeaderUser, SchoolSettings } from './types'
import { SignOutDialog } from './SignOutDialog'

// ── Social links ──────────────────────────────────────────────────────────────
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

// ✅ 3 Roles: Admin, Teacher/Staff, Pupil
// ✅ Pupil: Dashboard, Results, Report Cards, Profile
const dashboardNavMap: Record<string, { name: string; href: string; icon: any; description: string }[]> = {
  admin: [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard, description: 'Dashboard summary' },
    { name: 'Students', href: '/admin/students', icon: GraduationCap, description: 'Manage pupils' },
    { name: 'Staff', href: '/admin/staff', icon: Briefcase, description: 'Teachers & admins' },
    { name: 'Reports', href: '/admin/report-cards', icon: FileCheck, description: 'Report cards' },
  ],
  teacher: [
    { name: 'Overview', href: '/staff', icon: LayoutDashboard, description: 'My classes' },
    { name: 'Assignments', href: '/staff/assignments', icon: FileText, description: 'Homework & tasks' },
    { name: 'Students', href: '/staff/students', icon: Users, description: 'My pupils' },
    { name: 'Analytics', href: '/staff/analytics', icon: BarChart3, description: 'Performance insights' },
  ],
  pupil: [
    { name: 'Dashboard', href: '/pupil', icon: LayoutDashboard, description: 'Your dashboard' },
    { name: 'Results', href: '/pupil/results', icon: Award, description: 'View your grades' },
    { name: 'Report Cards', href: '/pupil/report-cards', icon: FileCheck, description: 'Termly reports' },
    { name: 'Profile', href: '/pupil/profile', icon: UserCog, description: 'Your details' },
  ],
}

// ─── Helper: Get Full Name ────────────────────────────────────────────────────
const getFullName = (user?: HeaderUser | null): string => {
  if (!user) return 'User'
  if (user.name) return user.name
  if (user.firstName) return user.firstName
  return 'User'
}

// ─── Helper: Get Initials ────────────────────────────────────────────────────
const getInitials = (user?: HeaderUser | null): string => {
  if (!user) return 'U'
  const fullName = user.name || user.firstName || ''
  if (!fullName) return 'U'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) {
    const firstInitial = parts[0]?.[0] || ''
    const lastInitial = parts[parts.length - 1]?.[0] || ''
    return (firstInitial + lastInitial).toUpperCase()
  }
  return parts[0]?.[0]?.toUpperCase() || 'U'
}

// ✅ 3 Roles: Admin, Teacher/Staff, Pupil
const roleConfig: Record<string, { label: string; color: string; gradient: string; bg: string; emoji: string }> = {
  admin: {
    label: 'Administrator',
    color: '#D97706',
    gradient: 'linear-gradient(135deg, #D97706, #B45309)',
    bg: 'bg-amber-50 border-amber-200 text-amber-700',
    emoji: '👑',
  },
  teacher: {
    label: 'Teacher/Staff',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
    bg: 'bg-blue-50 border-blue-200 text-blue-700',
    emoji: '👩‍🏫',
  },
  pupil: {
    label: 'Pupil',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    emoji: '🎒',
  },
}

const getRoleConfig = (role?: string) => {
  if (!role) return roleConfig.pupil
  const normalized = role.toLowerCase()
  if (normalized === 'admin') return roleConfig.admin
  if (normalized === 'teacher' || normalized === 'staff') return roleConfig.teacher
  if (normalized === 'pupil' || normalized === 'student') return roleConfig.pupil
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
  open, onClose, user, schoolSettings, onSignOut, pathname,
}: MobileMenuProps) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const [avatarError, setAvatarError] = useState(false)
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isAuthenticated = user?.isAuthenticated ?? false

  // ─── Get full name and initials ──────────────────────────────────────────
  const fullName = getFullName(user)
  const userInitials = getInitials(user)

  const getAvatarUrl = () => {
    if (avatarError) return undefined
    if (user?.avatar) return user.avatar
    return undefined
  }

  const avatarUrl = getAvatarUrl()
  const currentRole = getRoleConfig(user?.role)

  const isDashboardPage =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/staff') ||
    pathname?.startsWith('/pupil') ||
    pathname?.startsWith('/student')
  const isPortalPage = pathname === '/portal'

  const navItems = isDashboardPage && isAuthenticated
    ? (dashboardNavMap[user?.role || 'pupil'] || dashboardNavMap.pupil)
    : publicNavItems

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    if (href === '/admin') return pathname === '/admin'
    if (href === '/staff') return pathname === '/staff'
    if (href === '/pupil' || href === '/student') return pathname === '/pupil' || pathname === '/student'
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const handleNav = (href: string) => {
    onClose()
    router.push(href)
  }

  const goToDashboard = () => {
    onClose()
    const urls: Record<string, string> = {
      admin: '/admin', 
      teacher: '/staff', 
      pupil: '/pupil',
    }
    router.push(urls[user?.role || 'pupil'] || '/pupil')
  }

  // ─── Sign Out Handlers ────────────────────────────────────────────────────
  const handleSignOutClick = () => {
    onClose()
    // Small delay to let the drawer close before dialog opens
    setTimeout(() => {
      setSignOutDialogOpen(true)
    }, 150)
  }

  const handleSignOutCancel = () => {
    setSignOutDialogOpen(false)
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-full xs:w-[340px] sm:w-[400px] bg-white z-50 shadow-2xl lg:hidden flex flex-col overflow-hidden"
            >

              {/* ══════════════════════════════════════════════════════
                  HEADER — School identity with gradient
              ══════════════════════════════════════════════════════ */}
              <div className="relative flex-shrink-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A2472] via-[#1e3a8a] to-[#312e81]" />
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full border-[3px] border-white/10" />
                <div className="absolute -bottom-20 -left-16 w-48 h-48 rounded-full border-[3px] border-white/5" />
                <div className="absolute top-8 right-16 w-2 h-2 rounded-full bg-yellow-300/60" />
                <div className="absolute top-16 right-8 w-1.5 h-1.5 rounded-full bg-white/40" />

                <div className="relative p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {schoolSettings?.logo_path ? (
                        <div className="relative h-12 w-12 rounded-2xl bg-white/95 p-1.5 flex-shrink-0 shadow-lg ring-1 ring-white/20">
                          <Image
                            src={schoolSettings.logo_path}
                            alt="Logo"
                            fill
                            className="object-contain p-0.5"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm ring-1 ring-white/30">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-bold text-[15px] leading-tight truncate">
                          Vincollins Schools
                        </p>
                        <p className="text-white/70 text-[11px] italic mt-0.5 truncate">
                          Geared Towards Excellence
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="h-9 w-9 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors flex-shrink-0 ring-1 ring-white/20"
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {!isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-sm"
                    >
                      <Sparkles className="h-3 w-3 text-yellow-300" />
                      <span className="text-white text-[11px] font-semibold">
                        Welcome, Guest
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════
                  USER PROFILE CARD (authenticated)
              ══════════════════════════════════════════════════════ */}
              {isAuthenticated && (
                <div className="flex-shrink-0 px-4 pt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-2xl p-4 overflow-hidden border border-gray-100 bg-gradient-to-br from-white to-gray-50/80 shadow-sm"
                  >
                    <div
                      className="absolute top-0 left-0 right-0 h-[3px]"
                      style={{ background: currentRole.gradient }}
                    />

                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12 ring-[2.5px] ring-white shadow-md">
                          {avatarUrl && !avatarError ? (
                            <AvatarImage
                              src={avatarUrl}
                              alt={fullName || 'User'}
                              onError={() => setAvatarError(true)}
                            />
                          ) : null}
                          <AvatarFallback
                            className="text-white font-bold text-sm"
                            style={{ background: currentRole.gradient }}
                          >
                            {userInitials || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-[14px] truncate leading-tight">
                          {fullName || 'User'}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {user?.email || ''}
                        </p>
                        <div
                          className={cn(
                            'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border',
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

                    {!isDashboardPage && (
                      <button
                        onClick={goToDashboard}
                        className="mt-3.5 w-full py-2.5 rounded-xl text-white font-bold text-[12.5px] flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] shadow-md"
                        style={{
                          background: currentRole.gradient,
                          boxShadow: `0 6px 16px -4px ${currentRole.color}55`,
                        }}
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Go to Dashboard
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </motion.div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════
                  SCROLLABLE CONTENT
              ══════════════════════════════════════════════════════ */}
              <ScrollArea className="flex-1 mt-2">
                <div className="p-4 space-y-6">

                  {/* ── Primary Navigation ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                        {isDashboardPage ? 'Dashboard' : 'Navigation'}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
                    </div>

                    <div className="space-y-1.5">
                      {navItems.map((item, idx) => {
                        const active = isActive(item.href)
                        const activeColor = isDashboardPage ? currentRole.color : '#0A2472'

                        return (
                          <motion.button
                            key={item.name}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => handleNav(item.href)}
                            className={cn(
                              'group relative flex items-center gap-3 w-full px-3 py-3 rounded-2xl text-[13.5px] transition-all',
                              active
                                ? 'bg-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100',
                            )}
                            style={active ? {
                              border: `1.5px solid ${activeColor}25`,
                              boxShadow: `0 2px 12px -2px ${activeColor}20`,
                            } : {
                              border: '1.5px solid transparent',
                            }}
                          >
                            <div
                              className={cn(
                                'h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                                active ? 'shadow-sm' : 'bg-gray-100 group-hover:bg-white',
                              )}
                              style={active ? {
                                background: `linear-gradient(135deg, ${activeColor}15, ${activeColor}05)`,
                                boxShadow: `inset 0 0 0 1.5px ${activeColor}25`,
                              } : {}}
                            >
                              <item.icon
                                className="h-4 w-4 transition-colors"
                                style={{ color: active ? activeColor : '#9ca3af' }}
                              />
                            </div>

                            <div className="flex-1 text-left min-w-0">
                              <p
                                className={cn(
                                  'font-bold leading-tight truncate',
                                  active ? '' : 'text-gray-800',
                                )}
                                style={active ? { color: activeColor } : {}}
                              >
                                {item.name}
                              </p>
                              <p className="text-[10.5px] text-gray-400 truncate mt-0.5 font-medium">
                                {item.description}
                              </p>
                            </div>

                            {active ? (
                              <div
                                className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: activeColor }}
                              >
                                <ChevronRight className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ── Quick Links (dashboard only) ── */}
                  {isDashboardPage && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                          Quick Links
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleNav('/')}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                        >
                          <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <Home className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700">Home</span>
                        </button>

                        {!isPortalPage && (
                          <button
                            onClick={() => handleNav('/portal')}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors group border border-amber-100"
                          >
                            <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                              <KeyRound className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-[11px] font-bold text-amber-700">Portal</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Contact info ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                        Get in Touch
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 divide-y divide-gray-100">
                      {contactInfoData.map((info, idx) => (
                        <a
                          key={idx}
                          href={
                            info.icon === Phone ? `tel:${info.text.replace(/\s/g, '')}` :
                            info.icon === Mail ? `mailto:${info.text}` : '#'
                          }
                          className="flex items-center gap-3 px-3.5 py-3 hover:bg-white transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                            <info.icon className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-0.5">
                              {info.label}
                            </p>
                            <p className="text-[11.5px] text-gray-700 font-medium truncate">
                              {info.text}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* ── Social links ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                        Follow Us
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-l from-gray-200 to-transparent" />
                    </div>

                    <div className="flex items-center justify-center gap-2.5">
                      {socialLinks.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={s.label}
                          className="group relative h-10 w-10 rounded-xl bg-gray-100 hover:bg-white flex items-center justify-center transition-all hover:shadow-md hover:-translate-y-0.5 border border-transparent hover:border-gray-200"
                        >
                          <span
                            className="font-black text-[13px] text-gray-500 group-hover:text-white transition-colors relative z-10"
                            style={{
                              fontFamily: s.icon === '𝕏' ? 'system-ui' : 'inherit',
                            }}
                          >
                            {s.icon}
                          </span>
                          <div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: s.color }}
                          />
                          <span
                            className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <span className="text-white font-black text-[13px]" style={{
                              fontFamily: s.icon === '𝕏' ? 'system-ui' : 'inherit',
                            }}>
                              {s.icon}
                            </span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* ══════════════════════════════════════════════════════
                  FIXED FOOTER
              ══════════════════════════════════════════════════════ */}
              <div className="flex-shrink-0 border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/60 p-4 space-y-3">
                {!isAuthenticated && !isPortalPage && (
                  <button
                    onClick={() => handleNav('/portal')}
                    className="relative w-full h-12 rounded-2xl font-bold text-[13px] text-[#0A2472] shadow-lg overflow-hidden group active:scale-[0.98] transition-transform"
                    style={{
                      background: 'linear-gradient(135deg, #F5A623, #FFB84D)',
                      boxShadow: '0 8px 20px -4px rgba(245, 166, 35, 0.4)',
                    }}
                  >
                    <span className="absolute inset-0 overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </span>
                    <span className="relative flex items-center justify-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      <span>Access Portal</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                )}

                {isAuthenticated && (
                  <button
                    onClick={handleSignOutClick}
                    className="w-full h-12 rounded-2xl font-bold text-[13px] text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                )}

                <div className="text-center pt-1">
                  <p className="text-[10.5px] font-semibold text-gray-500">
                    © {currentYear} Vincollins Schools
                  </p>
                  <p className="text-[9.5px] text-gray-400 italic mt-0.5">
                    Geared Towards Excellence
                  </p>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sign Out Dialog */}
      <SignOutDialog
        open={signOutDialogOpen}
        onClose={handleSignOutCancel}
        onLogout={handleSignOutConfirm}
        isLoggingOut={isLoggingOut}
      />
    </>
  )
})