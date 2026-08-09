/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/layout.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import AdminLoading from '@/components/admin/AdminLoading'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useUser, getRoleColors } from '@/contexts/UserContext'

interface AdminProfile {
  id: string
  full_name?: string
  display_name?: string
  first_name?: string
  last_name?: string
  middle_name?: string
  email?: string
  photo_url?: string
  avatar_url?: string
  role?: string
}

// ─── Route Maps ───────────────────────────────────────────────────────────────
const routeToTabMap: Record<string, string> = {
  '/admin': 'overview',
  '/admin/broad-sheet': 'broad-sheet',
  '/admin/students': 'students',
  '/admin/staff': 'staff',
  '/admin/report-cards': 'report-cards',
  '/admin/inquiries': 'inquiries',
  '/admin/announcements': 'announcements',
  '/admin/promotions': 'promotions',
  '/admin/settings': 'settings',
}

const tabToRouteMap: Record<string, string> = {
  overview: '/admin',
  'broad-sheet': '/admin/broad-sheet',
  students: '/admin/students',
  staff: '/admin/staff',
  'report-cards': '/admin/report-cards',
  inquiries: '/admin/inquiries',
  announcements: '/admin/announcements',
  promotions: '/admin/promotions',
  settings: '/admin/settings',
}

const getTabFromPathname = (pathname: string): string => {
  if (routeToTabMap[pathname]) return routeToTabMap[pathname]
  for (const [route, tab] of Object.entries(routeToTabMap)) {
    if (pathname?.startsWith(route + '/')) return tab
  }
  return 'overview'
}

// ─── Format Profile ───────────────────────────────────────────────────────────
function formatProfileForHeader(profile: AdminProfile | null) {
  if (!profile) return undefined
  const displayName = profile.display_name || profile.full_name || 'Administrator'
  const nameParts = displayName.split(' ')
  const firstName = nameParts.length >= 2 ? nameParts[1] : nameParts[0]
  return {
    id: profile.id,
    name: displayName,
    firstName,
    email: profile.email || '',
    role: profile.role === 'staff' ? ('teacher' as const) : ('admin' as const),
    avatar: profile.photo_url || profile.avatar_url,
    isAuthenticated: true,
  }
}

// ─── Counts Cache ─────────────────────────────────────────────────────────────
let countsCache: { data: any; timestamp: number } | null = null
const COUNTS_CACHE_DURATION = 120_000

// ─── Page transition variants ─────────────────────────────────────────────────
// ✅ FIX 1: Properly typed `Variants` — `ease` must be a cubic-bezier tuple
//    or one of the accepted string literals. Cast to Variants for safety.
const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
}

// ─── Sidebar widths ───────────────────────────────────────────────────────────
const SIDEBAR_EXPANDED = 256
const SIDEBAR_COLLAPSED = 72

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()

  const roleColors = getRoleColors(user?.role)

  const [activeTab, setActiveTab] = useState(() =>
    getTabFromPathname(pathname || '/admin')
  )
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [pendingReports, setPendingReports] = useState(0)
  const [pendingInquiries, setPendingInquiries] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)

  const prevPathRef = useRef(pathname)
  const isInitialMount = useRef(true)

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push('/portal')
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select(
            'id, full_name, display_name, first_name, last_name, middle_name, email, photo_url, avatar_url, role'
          )
          .eq('id', session.user.id)
          .single()

        if (data) setProfile(data)

        if (
          countsCache &&
          Date.now() - countsCache.timestamp < COUNTS_CACHE_DURATION
        ) {
          const c = countsCache.data
          setNotificationCount(c.notificationCount)
          setPendingReports(c.pendingReports)
          setPendingInquiries(c.pendingInquiries)
          setLoading(false)
          return
        }

        try {
          const [notifRes, reportsRes, inquiriesRes] = await Promise.allSettled([
            supabase
              .from('notifications')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', session.user.id)
              .eq('read', false),
            supabase
              .from('report_cards')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'pending'),
            supabase
              .from('inquiries')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'pending'),
          ])

          const counts = {
            notificationCount:
              notifRes.status === 'fulfilled' ? notifRes.value.count ?? 0 : 0,
            pendingReports:
              reportsRes.status === 'fulfilled'
                ? reportsRes.value.count ?? 0
                : 0,
            pendingInquiries:
              inquiriesRes.status === 'fulfilled'
                ? inquiriesRes.value.count ?? 0
                : 0,
          }

          countsCache = { data: counts, timestamp: Date.now() }
          setNotificationCount(counts.notificationCount)
          setPendingReports(counts.pendingReports)
          setPendingInquiries(counts.pendingInquiries)
        } catch {
          /* silent */
        }
      } catch (err) {
        console.error('[AdminLayout] init error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [router])

  // ── Sync tab with pathname ────────────────────────────────────────────────
  useEffect(() => {
    if (!pathname) return
    const tab = getTabFromPathname(pathname)

    if (isInitialMount.current) {
      isInitialMount.current = false
      if (tab !== activeTab) setActiveTab(tab)
      return
    }

    if (tab !== activeTab) setActiveTab(tab)

    if (prevPathRef.current !== pathname) {
      setIsNavigating(true)
      const t = setTimeout(() => setIsNavigating(false), 400)
      prevPathRef.current = pathname
      return () => clearTimeout(t)
    }
  }, [pathname])

  // ── Close mobile sidebar on route change ─────────────────────────────────
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false)
  }, [pathname])

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab)
      const target = tabToRouteMap[tab]
      if (target && pathname !== target) router.push(target)
    },
    [pathname, router]
  )

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/portal')
  }, [router])

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  if (loading) {
    return <AdminLoading profile={profile} onLogout={handleLogout} />
  }

  const headerUser = formatProfileForHeader(profile)

  return (
    <div className="min-h-screen bg-slate-50/60 overflow-x-hidden">
      {/* Top progress bar */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            key="nav-bar"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'left' }}
            className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0A2472] via-blue-400 to-indigo-400 z-[60]"
          />
        )}
      </AnimatePresence>

      <Header user={headerUser} onLogout={handleLogout} />

      <div className="flex min-h-screen overflow-x-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <AdminSidebar
            profile={profile}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            pendingReports={pendingReports}
            pendingInquiries={pendingInquiries}
          />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <AdminSidebar
                profile={profile}
                onLogout={handleLogout}
                collapsed={false}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                pendingReports={pendingReports}
                pendingInquiries={pendingInquiries}
                isMobile
                onMobileClose={() => setMobileOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ FIX 2: Main content — margin only on lg+ (fixes mobile squishing) */}
        <main
          className={cn(
            'flex-1 min-h-screen w-full',
            'pt-16 pb-24 lg:pb-10',
            'overflow-x-hidden',
            'transition-[margin-left] duration-300 ease-in-out',
            'lg:ml-[var(--sidebar-w)]'
          )}
          style={
            {
              '--sidebar-w': `${sidebarWidth}px`,
            } as React.CSSProperties
          }
        >
          <div className="relative min-h-[calc(100vh-4rem)]">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-100/60 to-transparent pointer-events-none z-0" />

            <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <PathBreadcrumb pathname={pathname || '/admin'} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  variants={pageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* ✅ FIX 3: Removed `onLogout` prop — MobileBottomNav doesn't accept it.
          Pass whatever props your MobileBottomNav actually expects below. */}
      <MobileBottomNav />
    </div>
  )
}

// ─── Breadcrumb Component ─────────────────────────────────────────────────────
function PathBreadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.replace('/admin', '').split('/').filter(Boolean)

  const crumbs = [
    { label: 'Admin', href: '/admin' },
    ...segments.map((seg, i) => ({
      label: seg
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      href: '/admin/' + segments.slice(0, i + 1).join('/'),
    })),
  ]

  if (crumbs.length <= 1) return null

  return (
    <motion.nav
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-1.5 mb-5 text-xs text-slate-400 font-medium"
      aria-label="Breadcrumb"
    >
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-slate-600 font-semibold">{crumb.label}</span>
            ) : (
              <>
                <a href={crumb.href} className="hover:text-[#0A2472] transition-colors">
                  {crumb.label}
                </a>
                <svg
                  className="w-3 h-3 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </span>
        )
      })}
    </motion.nav>
  )
}