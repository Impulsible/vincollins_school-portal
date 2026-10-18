/* eslint-disable react-hooks/set-state-in-effect */
// src/components/layout/header/Header.tsx
'use client'

import { useState, useEffect, Suspense, memo } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHeaderData } from './useHeaderData'
import { Logo } from './Logo'
import { DesktopNav } from './DesktopNav'
import { UserSection } from './UserSection'
import { SearchBar } from './SearchBar'
import { MobileMenu } from './MobileMenu'

export interface HeaderUser {
  id: string
  name: string
  firstName: string
  email: string
  role: 'admin' | 'teacher' | 'pupil'
  avatar?: string
  isAuthenticated: boolean
}

interface HeaderProps {
  user?: HeaderUser
  onLogout?: () => void
}

const HeaderShell = memo(() => (
  <header className="fixed top-0 left-0 right-0 w-full z-50 bg-gradient-to-r from-[#0A2472] to-[#1e3a8a] py-2 sm:py-3">
    <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-white/20 rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white/20 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  </header>
))
HeaderShell.displayName = 'HeaderShell'

function HeaderContent({ user: propUser, onLogout }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const {
    user: fetchedUser, schoolSettings, notifications, unreadCount,
    markAsRead, markAllAsRead, deleteNotification, isLoading, isAuthenticated,
  } = useHeaderData()

  useEffect(() => { setIsHydrated(true) }, [])

  const user = propUser || fetchedUser

  const isHomePage = pathname === '/'
  const isPortalPage = pathname === '/portal'
  const publicPages = ['/', '/admission', '/schools', '/contact']
  const isPublicPage = publicPages.includes(pathname || '') || pathname?.startsWith('/admission') || pathname?.startsWith('/schools')

  const isPupilPage = pathname?.startsWith('/pupil')
  const isStaffPage = pathname?.startsWith('/staff')
  const isAdminPage = pathname?.startsWith('/admin')
  const isDashboardPage = isPupilPage || isStaffPage || isAdminPage

  const effectiveIsAuthenticated = isAuthenticated || !!user

  let showPublicNav = false
  let showDashboardNav = false

  if (!isHydrated || isLoading) {
    showPublicNav = false
    showDashboardNav = false
  } else if (isDashboardPage && effectiveIsAuthenticated) {
    showDashboardNav = true
  } else if (isPublicPage || isHomePage || isPortalPage) {
    showPublicNav = true
  } else if (effectiveIsAuthenticated) {
    showDashboardNav = true
  } else {
    showPublicNav = true
  }

  useEffect(() => {
    const cb = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', cb, { passive: true })
    return () => window.removeEventListener('scroll', cb)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  if (!isHydrated) return <HeaderShell />

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300',
          scrolled ? 'bg-gradient-to-r from-[#0A2472] to-[#1e3a8a] shadow-2xl py-2' : 'bg-gradient-to-r from-[#0A2472] to-[#1e3a8a] py-2.5 sm:py-3 lg:py-4',
        )}
      >
        {/* ✅ FIXED: Added w-full and overflow-hidden to stop right-shifts */}
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 w-full overflow-hidden">
          <div className="flex items-center justify-between gap-1 sm:gap-4 w-full">
            
            <div className="flex-shrink-0 min-w-0">
              <Logo schoolSettings={schoolSettings} />
            </div>

            <div className="hidden lg:flex flex-1 justify-center">
              <DesktopNav
                userRole={showDashboardNav ? user?.role : undefined}
                pathname={pathname}
                isPublic={showPublicNav}
              />
            </div>

            {/* ✅ FIXED: Right section layout with flex-shrink-0 and tight gap */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">
              <UserSection
                user={user}
                isAuthenticated={effectiveIsAuthenticated}
                pathname={pathname}
                notifications={notifications}
                unreadCount={unreadCount}
                isPublicPage={isPublicPage || isPortalPage || isHomePage}
                onSearchToggle={() => setSearchOpen(!searchOpen)}
                onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                onSignOut={onLogout || (() => {})}
                mobileMenuOpen={mobileMenuOpen}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDeleteNotification={deleteNotification}
              />

              {/* Mobile Hamburger - perfectly aligned at the far right */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-xl text-white hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0"
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>

        <SearchBar open={searchOpen} query={searchQuery} onChange={setSearchQuery} onClose={() => setSearchOpen(false)} />
      </header>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        schoolSettings={schoolSettings}
        onSignOut={() => { if (onLogout) onLogout() }}
        pathname={pathname}
      />
    </>
  )
}

export const Header = memo(function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<HeaderShell />}>
      <HeaderContent {...props} />
    </Suspense>
  )
})

export default Header