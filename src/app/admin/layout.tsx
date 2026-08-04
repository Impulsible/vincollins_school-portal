// src/app/admin/layout.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'

import { 
  LayoutDashboard, 
  GraduationCap, 
  Briefcase, 
  Shield,
  Settings,
  LogOut,
  Menu,
  Bell,
  MessageSquare,
  Megaphone,
  TrendingUp,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

// ── Navigation Items ──
const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/students', icon: GraduationCap },
  { label: 'Staff', href: '/admin/staff', icon: Briefcase },
  { label: 'Admins', href: '/admin/admins', icon: Shield },
  { label: 'Report Cards', href: '/admin/report-cards', icon: FileText },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Promotions', href: '/admin/promotions', icon: TrendingUp },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

// ── Admin Layout ──
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isAuthenticated } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const supabase = createClient()

  // Handle responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) setIsSidebarOpen(true)
      else setIsSidebarOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, isAuthenticated, loading, router])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/portal')
    } catch {
      toast.error('Error logging out')
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0A2472]" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F4]">
        <Card className="max-w-md border-0 shadow-soft-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-display text-[#0A2472] mb-2">Access Denied</h2>
            <p className="text-slate-500">You don&apos;t have permission to view this page.</p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-[#0A2472] hover:bg-[#1A3A8A]"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-white border-r border-[#0A2472]/5 shadow-soft transition-all duration-300",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isMobile && "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#0A2472]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A2472] flex items-center justify-center shadow-lg shadow-[#0A2472]/20">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div>
              <h3 className="font-display text-lg text-[#0A2472]">Admin Panel</h3>
              <p className="text-xs text-slate-400">Vincollins Schools</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                  "hover:bg-[#0A2472]/5 hover:text-[#0A2472] group",
                  isActive 
                    ? "bg-[#0A2472]/10 text-[#0A2472] font-medium" 
                    : "text-slate-600"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-[#0A2472]" : "text-slate-400 group-hover:text-[#0A2472]"
                )} />
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-6 rounded-full bg-[#0A2472]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#0A2472]/5 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9F7F4]">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src={user?.photo_url || user?.avatar_url || undefined} />
              <AvatarFallback className="bg-[#0A2472] text-white text-sm">
                {user?.full_name?.[0] || user?.first_name?.[0] || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0A2472] truncate">
                {user?.full_name || user?.first_name || 'Admin'}
              </p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || 'admin'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#0A2472]/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0A2472] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-display text-sm text-[#0A2472]">Admin</span>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9A84C]" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 pt-16 lg:pt-0",
        isSidebarOpen ? "lg:ml-72" : ""
      )}>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}