// components/layout/header/DesktopNav.tsx - FIXED
'use client'

import { useState, memo, useMemo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { 
  ChevronDown, Home, BookOpen, Phone, FileText,
  LayoutDashboard, Users, GraduationCap,
  Briefcase, MessageSquare, FileCheck, BarChart3
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavigationItem, UserRole } from './types'

const publicNavigation: NavigationItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Admission', href: '/admission', icon: FileText },
  { name: 'Schools', href: '/schools', icon: BookOpen },
  { name: 'Contact', href: '/contact', icon: Phone },
]

const studentNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { name: 'Results', href: '/student/results', icon: GraduationCap },
  { name: 'Profile', href: '/student/profile', icon: Users },
]

const teacherNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/staff', icon: LayoutDashboard },
  { name: 'Assignments', href: '/staff/assignments', icon: FileText },
  { name: 'Students', href: '/staff/students', icon: Users },
  { name: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
]

const adminNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { 
    name: 'User Management', href: '#', icon: Users, isDropdown: true,
    dropdownItems: [
      { name: 'Students', href: '/admin/students', icon: GraduationCap },
      { name: 'Staff', href: '/admin/staff', icon: Briefcase },
      { name: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    ]
  },
  { name: 'Reports', href: '/admin/report-cards', icon: FileCheck },
]

function getNavigation(role?: UserRole, isPublic: boolean = true): NavigationItem[] {
  if (isPublic) return publicNavigation
  
  switch (role) {
    case 'admin': return adminNavigation
    case 'teacher': return teacherNavigation
    case 'student': return studentNavigation
    default: return publicNavigation
  }
}

interface DesktopNavProps {
  userRole?: UserRole
  pathname: string
  isPublic?: boolean
}

export const DesktopNav = memo(function DesktopNav({ userRole, pathname, isPublic = true }: DesktopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const nav = useMemo(() => getNavigation(userRole, isPublic), [userRole, isPublic])

  const isActive = (href: string): boolean => {
    if (href === '/') return pathname === '/'
    if (href === '#') return false
    if (pathname === href) return true
    if (href !== '/admin' && href !== '/staff' && href !== '/student') {
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
    <div className="flex items-center gap-0.5 xl:gap-1.5 bg-white/15 backdrop-blur-sm rounded-full p-0.5 lg:p-1 shadow-lg">
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
                    "relative px-3 lg:px-3.5 xl:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold transition-all rounded-full whitespace-nowrap flex items-center gap-1.5 lg:gap-2",
                    dropdownActive 
                      ? "text-[#0A2472] bg-white shadow-lg" 
                      : "text-white hover:text-white hover:bg-white/25"
                  )}
                  aria-expanded={isDropdownOpen}
                >
                  <Icon className={cn(
                    "h-3.5 w-3.5 lg:h-4 lg:w-4",
                    dropdownActive ? "text-[#0A2472]" : "text-white"
                  )} />
                  <span className="hidden xl:inline">{item.name}</span>
                  <span className="lg:hidden xl:hidden">Users</span>
                  <ChevronDown className={cn(
                    "h-3 w-3 lg:h-3.5 lg:w-3.5 transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 mt-2 p-1">
                {item.dropdownItems.map((sub) => {
                  const subActive = pathname === sub.href || pathname?.startsWith(sub.href + '/')
                  return (
                    <DropdownMenuItem key={sub.name} asChild>
                      <Link 
                        href={sub.href} 
                        className={cn(
                          "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md transition-colors",
                          subActive 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "hover:bg-slate-100"
                        )}
                        onClick={() => setOpenDropdown(null)}
                      >
                        <sub.icon className="h-4 w-4" />
                        <span>{sub.name}</span>
                        {subActive && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
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
              "relative px-3 lg:px-3.5 xl:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold transition-all rounded-full whitespace-nowrap",
              itemActive 
                ? "text-[#0A2472] bg-white shadow-lg" 
                : "text-white hover:text-white hover:bg-white/25"
            )}
          >
            <div className="flex items-center gap-1.5 lg:gap-2">
              <Icon className={cn(
                "h-3.5 w-3.5 lg:h-4 lg:w-4",
                itemActive ? "text-[#0A2472]" : "text-white"
              )} />
              <span className="hidden xl:inline">{item.name}</span>
              <span className="lg:hidden xl:hidden">
                {item.name === 'User Management' ? 'Users' :
                 item.name === 'My Exams' ? 'Exams' : item.name.substring(0, 4)}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
})