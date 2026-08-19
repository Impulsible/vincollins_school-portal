// components/layout/header/DesktopNav.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, memo, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, Home, BookOpen, Phone, FileText,
  LayoutDashboard, Users, GraduationCap,
  Briefcase, MessageSquare, FileCheck, BarChart3,
  UserCog, School, NotebookPen, Calendar,
  Megaphone, Settings, Award, Eye, FileSpreadsheet,
  Calculator, CalendarCheck
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavigationItem, UserRole } from './types'

// ─── Public Navigation (Unauthenticated Users) ──────────────────────────────
const publicNavigation: NavigationItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Admission', href: '/admission', icon: FileText },
  { name: 'Schools', href: '/schools', icon: BookOpen },
  { name: 'Contact', href: '/contact', icon: Phone },
]

// ─── Pupil Navigation (Dashboard, Results, Report Cards, Profile) ──────────
const pupilNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/pupil', icon: LayoutDashboard },
  { name: 'Results', href: '/pupil/results', icon: Award },
  { name: 'Report Cards', href: '/pupil/report-cards', icon: FileCheck },
  { name: 'Profile', href: '/pupil/profile', icon: UserCog },
]

// ─── Teacher/Staff Navigation (Dashboard, Scores, Attendance, Analytics) ────
const teacherNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { name: 'Scores', href: '/staff/scores', icon: Calculator },
  { name: 'Attendance', href: '/staff/attendance', icon: CalendarCheck },
  { name: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
]

// ─── Admin Navigation (UPDATED: 4 Items Only) ──────────────────────────────
const adminNavigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Management', 
    href: '#', 
    icon: Users, 
    isDropdown: true,
    dropdownItems: [
      { name: 'Students', href: '/admin/students', icon: GraduationCap },
      { name: 'Staff', href: '/admin/staff', icon: Briefcase },
    ]
  },
  { 
    name: 'Broadsheet', 
    href: '/admin/broadsheet', 
    icon: FileSpreadsheet 
  },
  { 
    name: 'Teacher Classes', 
    href: '/admin/teacher-classes', 
    icon: School 
  },
]

// ─── Get Navigation Based on Role ──────────────────────────────────────────
function getNavigation(role?: UserRole, isPublic: boolean = true): NavigationItem[] {
  if (isPublic || !role) return publicNavigation
  switch (role) {
    case 'admin': return adminNavigation
    case 'teacher': return teacherNavigation
    case 'pupil': return pupilNavigation
    default: return publicNavigation
  }
}

interface DesktopNavProps {
  userRole?: UserRole
  pathname: string
  isPublic?: boolean
}

export const DesktopNav = memo(function DesktopNav({ 
  userRole, 
  pathname, 
  isPublic = true
}: DesktopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const nav = useMemo(() => getNavigation(userRole, isPublic), [userRole, isPublic])

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    if (href === '#') return false
    if (pathname === href) return true
    if (href !== '/admin' && href !== '/staff' && href !== '/pupil') {
      return pathname?.startsWith(href + '/') || false
    }
    return false
  }

  const isDropdownActive = (item: NavigationItem): boolean => {
    if (!item.dropdownItems) return false
    return item.dropdownItems.some(sub => {
      return pathname === sub.href || pathname?.startsWith(sub.href + '/') || false
    })
  }

  return (
    <div className="flex items-center gap-0.5 xl:gap-1.5 bg-white/15 backdrop-blur-sm rounded-full p-0.5 lg:p-1 shadow-lg border border-white/10">
      {nav.map((item) => {
        const Icon = item.icon
        const itemActive = isActive(item.href)
        const dropdownActive = isDropdownActive(item)
        const isDropdownOpen = openDropdown === item.name

        if (item.isDropdown && item.dropdownItems) {
          return (
            <DropdownMenu 
              key={item.name} 
              open={isDropdownOpen} 
              onOpenChange={(open: boolean) => setOpenDropdown(open ? item.name : null)}
            >
              <DropdownMenuTrigger asChild>
                <button 
                  className={cn(
                    "relative px-3 lg:px-4 xl:px-5 py-1.5 lg:py-2.5 text-xs lg:text-sm font-semibold transition-all duration-200 rounded-full whitespace-nowrap flex items-center gap-1.5 lg:gap-2.5 border-2",
                    dropdownActive 
                      ? "text-[#0A2472] bg-white shadow-lg border-white" 
                      : "text-white hover:text-white hover:bg-white/20 border-transparent hover:border-white/20"
                  )}
                  aria-expanded={isDropdownOpen}
                >
                  <Icon className={cn(
                    "h-4 w-4 lg:h-4.5 lg:w-4.5",
                    dropdownActive ? "text-[#0A2472]" : "text-white"
                  )} />
                  <span>{item.name}</span>
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 lg:h-4 lg:w-4 transition-transform duration-200",
                    isDropdownOpen && "rotate-180",
                    dropdownActive ? "text-[#0A2472]" : "text-white/70"
                  )} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="center" 
                className="w-56 mt-2 p-1.5 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl rounded-xl"
              >
                {item.dropdownItems.map((sub) => {
                  const subActive = pathname === sub.href || pathname?.startsWith(sub.href + '/')
                  return (
                    <DropdownMenuItem key={sub.name} asChild>
                      <Link 
                        href={sub.href} 
                        className={cn(
                          "flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200",
                          subActive 
                            ? "bg-[#0A2472]/10 text-[#0A2472] font-medium shadow-sm" 
                            : "hover:bg-slate-100/80 text-slate-700"
                        )}
                        onClick={() => setOpenDropdown(null)}
                      >
                        <sub.icon className={cn(
                          "h-4.5 w-4.5",
                          subActive ? "text-[#0A2472]" : "text-slate-500"
                        )} />
                        <span className="text-sm">{sub.name}</span>
                        {subActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0A2472]" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }

        return (
          <Link 
            key={item.name} 
            href={item.href} 
            prefetch={false}
            className={cn(
              "relative px-3 lg:px-4 xl:px-5 py-1.5 lg:py-2.5 text-xs lg:text-sm font-semibold transition-all duration-200 rounded-full whitespace-nowrap border-2",
              itemActive 
                ? "text-[#0A2472] bg-white shadow-lg border-white" 
                : "text-white hover:text-white hover:bg-white/20 border-transparent hover:border-white/20"
            )}
          >
            <div className="flex items-center gap-1.5 lg:gap-2.5">
              <Icon className={cn(
                "h-4 w-4 lg:h-4.5 lg:w-4.5",
                itemActive ? "text-[#0A2472]" : "text-white"
              )} />
              <span>{item.name}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
})