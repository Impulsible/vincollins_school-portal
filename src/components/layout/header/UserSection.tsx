// src/components/layout/header/UserSection.tsx

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/layout/header/UserSection.tsx
'use client'

import { useState, useRef, useEffect, memo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Search, ChevronDown, User, Settings, LogOut, 
  LayoutDashboard, ArrowRight, Home, KeyRound
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { HeaderUser, Notification } from './types'
import { NotificationPopover } from './NotificationPopover'
import { SignOutDialog } from './SignOutDialog'
import { toast } from 'sonner'

// ✅ 3 Roles: Admin, Teacher/Staff, Pupil
const roleBadgeColors: Record<string, string> = {
  admin: 'bg-amber-500 text-white',
  teacher: 'bg-blue-500 text-white',
  pupil: 'bg-emerald-500 text-white',
}

const roleDisplayNames: Record<string, string> = {
  admin: 'Administrator',
  teacher: 'Teacher/Staff',
  pupil: 'Pupil',
}

// ─── Helper: Get First Name ──────────────────────────────────────────────────
const getFirstName = (user?: HeaderUser | null): string => {
  if (!user) return 'User'
  
  console.log('[UserSection] getFirstName - user.firstName:', user.firstName)
  console.log('[UserSection] getFirstName - user.name:', user.name)
  
  // ✅ FIX: PRIORITIZE user.firstName from the header data
  if (user.firstName) {
    console.log('[UserSection] Using user.firstName:', user.firstName)
    return user.firstName
  }
  
  const fullName = user.name || ''
  if (!fullName) return 'User'
  
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  
  // ✅ FIX: Return the FIRST word as first name (not the second)
  // This is the fallback if user.firstName doesn't exist
  return parts[0] || 'User'
}

// ─── Helper: Get Initials ────────────────────────────────────────────────────
const getInitials = (user?: HeaderUser | null): string => {
  if (!user) return 'U'
  
  const fullName = user.name || ''
  if (!fullName) return 'U'
  
  const parts = fullName.trim().split(/\s+/)
  const firstName = getFirstName(user)
  
  const firstInitial = firstName?.[0] || parts[0]?.[0] || 'U'
  // For initials, use first letter of first name and first letter of last name
  const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] || '' : ''
  
  if (lastInitial) {
    return (firstInitial + lastInitial).toUpperCase()
  }
  
  return firstInitial.toUpperCase()
}

interface UserSectionProps {
  user: HeaderUser | null
  isAuthenticated: boolean
  pathname: string
  notifications: Notification[]
  unreadCount: number
  isPublicPage: boolean
  onSearchToggle: () => void
  onMobileToggle: () => void
  onSignOut: () => Promise<void> | void
  mobileMenuOpen: boolean
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDeleteNotification: (id: string) => void
}

function UserSectionComponent({
  user, isAuthenticated, pathname, notifications, unreadCount, isPublicPage,
  onSearchToggle, onMobileToggle, onSignOut, mobileMenuOpen,
  onMarkAsRead, onMarkAllAsRead, onDeleteNotification
}: UserSectionProps) {
  const router = useRouter()
  const currentPathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const isHomePage = pathname === '/'
  const isPortalPage = pathname === '/portal'
  const isDashboardPage = !isPublicPage && !isPortalPage && !isHomePage

  // ─── Debug: Log user object when it changes ──────────────────────────────────
  useEffect(() => {
    console.log('🔍 [UserSection] User object received:', user)
    console.log('🔍 [UserSection] user?.firstName:', user?.firstName)
    console.log('🔍 [UserSection] user?.name:', user?.name)
    console.log('🔍 [UserSection] isAuthenticated:', isAuthenticated)
  }, [user, isAuthenticated])

  // ─── Get first name and initials ──────────────────────────────────────────
  const firstName = getFirstName(user)
  const userInitials = getInitials(user)

  console.log('🔍 [UserSection] Computed firstName:', firstName)
  console.log('🔍 [UserSection] Computed userInitials:', userInitials)

  // Close dropdowns on route change
  useEffect(() => {
    setProfileOpen(false)
    setNotificationOpen(false)
    setSignOutDialogOpen(false)
  }, [currentPathname])

  // Close profile on outside click
  useEffect(() => {
    const cb = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', cb)
    return () => document.removeEventListener('mousedown', cb)
  }, [])

  // Close notification on outside click
  useEffect(() => {
    const cb = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', cb)
    return () => document.removeEventListener('mousedown', cb)
  }, [])

  const handleProfileToggle = useCallback(() => {
    setNotificationOpen(false)
    setProfileOpen(prev => !prev)
  }, [])

  const handleNotificationToggle = useCallback((open: boolean) => {
    setProfileOpen(false)
    setNotificationOpen(open)
  }, [])

  const goToDashboard = useCallback(() => {
    setProfileOpen(false)
    const urls: Record<string, string> = { 
      admin: '/admin', 
      teacher: '/staff', 
      pupil: '/pupil' 
    }
    router.push(urls[user?.role || 'pupil'] || '/pupil')
  }, [router, user?.role])

  const handlePortalClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setProfileOpen(false)
    router.push('/portal')
  }, [router])

  // ─── Sign Out Handlers ────────────────────────────────────────────────────
  const handleSignOutClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setProfileOpen(false)
    setSignOutDialogOpen(true)
  }, [])

  const handleSignOutCancel = useCallback(() => {
    setSignOutDialogOpen(false)
  }, [])

  const handleSignOutConfirm = useCallback(async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    
    try {
      // Close the dialog
      setSignOutDialogOpen(false)
      
      // Show toast
      toast.success(`👋 Goodbye, ${firstName || 'User'}! See you soon!`, {
        duration: 1500,
        icon: '✨',
        position: 'top-center',
      })
      
      // Small delay for toast visibility
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Call sign out - this clears the user but DOES NOT redirect
      await onSignOut()
      
      // Redirect to portal
      router.replace('/portal')
      
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out. Please try again.')
      setSignOutDialogOpen(true)
      setIsLoggingOut(false)
    } finally {
      // Reset logging out state after a delay
      setTimeout(() => {
        setIsLoggingOut(false)
      }, 500)
    }
  }, [onSignOut, isLoggingOut, firstName, router])

  const getAvatarUrl = () => {
    if (avatarError) return undefined
    if (user?.avatar) return user.avatar
    return undefined
  }

  const showAuthenticated = isAuthenticated || !!user
  const avatarUrl = getAvatarUrl()

  return (
    <>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onSearchToggle}
          className="hidden sm:inline-flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full text-white hover:bg-white/20 mx-0.5"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {showAuthenticated && !isPortalPage && !isHomePage && (
          <div ref={notifRef} className="inline-flex">
            <NotificationPopover
              open={notificationOpen}
              onOpenChange={handleNotificationToggle}
              notifications={notifications}
              unreadCount={unreadCount}
              userRole={user?.role}
              onMarkAsRead={onMarkAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onDelete={onDeleteNotification}
            />
          </div>
        )}

        <div ref={profileRef} className="inline-flex">
          {showAuthenticated ? (
            <div>
              <button 
                onClick={handleProfileToggle}
                className="flex items-center gap-1.5 sm:gap-2 rounded-full text-white hover:bg-white/20 px-2 sm:px-3 py-1 transition-all mx-0.5"
              >
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-white/50">
                  {avatarUrl && !avatarError ? (
                    <AvatarImage 
                      src={avatarUrl} 
                      alt={firstName || 'User'} 
                      onError={() => setAvatarError(true)} 
                    />
                  ) : null}
                  <AvatarFallback 
                    className="text-white text-xs font-bold"
                    style={{ 
                      background: user?.role === 'admin' ? '#D97706' : 
                                 user?.role === 'teacher' ? '#2563EB' : 
                                 '#059669'
                    }}
                  >
                    {userInitials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-xs lg:text-sm font-semibold text-white truncate max-w-[80px]">
                    Hi, {firstName || 'User'}
                  </p>
                  <p className="text-[8px] lg:text-[10px] text-white/80">
                    {roleDisplayNames[user?.role || 'pupil']}
                  </p>
                </div>
                <ChevronDown className={cn("h-3 w-3 text-white transition-transform", profileOpen && "rotate-180")} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[64px] w-72 sm:w-80 bg-white rounded-xl shadow-2xl border z-[60] overflow-hidden">
                  <div className="p-4 border-b" style={{ 
                    background: user?.role === 'admin' ? 'linear-gradient(135deg, #FFFBEB, #FDE68A)' :
                               user?.role === 'teacher' ? 'linear-gradient(135deg, #EFF6FF, #BFDBFE)' :
                               'linear-gradient(135deg, #ECFDF5, #A7F3D0)'
                  }}>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-white/20 shrink-0">
                        {avatarUrl && !avatarError ? (
                          <AvatarImage src={avatarUrl} alt={firstName || 'User'} />
                        ) : null}
                        <AvatarFallback 
                          className="text-white font-bold"
                          style={{ 
                            background: user?.role === 'admin' ? '#D97706' : 
                                       user?.role === 'teacher' ? '#2563EB' : 
                                       '#059669'
                          }}
                        >
                          {userInitials || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {firstName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                        <Badge className={cn("mt-1 text-xs text-white", roleBadgeColors[user?.role || 'pupil'])}>
                          {roleDisplayNames[user?.role || 'pupil']}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {isPublicPage && (
                    <div className="p-3 border-b" style={{ 
                      background: user?.role === 'admin' ? '#FFFBEB' :
                                 user?.role === 'teacher' ? '#EFF6FF' :
                                 '#ECFDF5'
                    }}>
                      <button 
                        onClick={goToDashboard} 
                        className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 text-white"
                        style={{ 
                          background: user?.role === 'admin' ? '#D97706' :
                                     user?.role === 'teacher' ? '#2563EB' :
                                     '#059669'
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </button>
                    </div>
                  )}
                  
                  {isDashboardPage && (
                    <div className="py-1">
                      <Link 
                        href={user?.role === 'pupil' ? '/pupil/profile' : '/staff/settings'}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="h-4 w-4 text-gray-400 shrink-0" />
                        My Profile
                      </Link>
                      <Link 
                        href={user?.role === 'pupil' ? '/pupil/settings' : '/staff/settings'}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-gray-400 shrink-0" />
                        Settings
                      </Link>
                    </div>
                  )}
                  
                  <div className="py-1 border-t">
                    {pathname !== '/' && (
                      <Link 
                        href="/" 
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Home className="h-4 w-4 text-gray-400 shrink-0" />
                        Home Page
                      </Link>
                    )}
                    {pathname !== '/portal' && (
                      <button 
                        onClick={handlePortalClick}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <KeyRound className="h-4 w-4 text-gray-400 shrink-0" />
                        Portal Page
                      </button>
                    )}
                  </div>
                  
                  <div className="border-t p-2">
                    <button 
                      onClick={handleSignOutClick}
                      className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-lg text-sm flex items-center gap-3"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            !isPortalPage && (
              <Link 
                href="/portal" 
                className="hidden sm:inline-flex items-center px-4 py-2 bg-[#F5A623] text-[#0A2472] rounded-full font-semibold text-sm mx-0.5"
              >
                <KeyRound className="mr-1.5 h-4 w-4" />
                Portal Login
              </Link>
            )
          )}
        </div>
      </div>

      {/* Sign Out Dialog */}
      <SignOutDialog
        open={signOutDialogOpen}
        onClose={handleSignOutCancel}
        onLogout={handleSignOutConfirm}
        isLoggingOut={isLoggingOut}
      />
    </>
  )
}

// ─── Export ──────────────────────────────────────────────────────────────────
export const UserSection = memo(UserSectionComponent)
export default UserSection