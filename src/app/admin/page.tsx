/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// src/app/admin/page.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useUser } from '@/contexts/UserContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  Shield,
  UserPlus,
  FileText,
  Megaphone,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ── GPU isolation style ──
const cardIsolationStyle = {
  WebkitTransform: 'translateZ(0)' as const,
  transform: 'translateZ(0)' as const,
  contain: 'paint' as const,
}

// ── Quick Action Card ──
interface QuickActionCardProps {
  icon: React.ElementType
  label: string
  desc: string
  href: string
  color?: string
  alert?: boolean
}

const quickActionColors: Record<string, { bg: string; icon: string; hover: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', hover: 'hover:border-blue-200 hover:bg-blue-50/50' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', hover: 'hover:border-emerald-200 hover:bg-emerald-50/50' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', hover: 'hover:border-violet-200 hover:bg-violet-50/50' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', hover: 'hover:border-amber-200 hover:bg-amber-50/50' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', hover: 'hover:border-rose-200 hover:bg-rose-50/50' },
  primary: { bg: 'bg-[#0A2472]/5', icon: 'text-[#0A2472]', hover: 'hover:border-[#0A2472]/20 hover:bg-[#0A2472]/5' },
}

function QuickActionCard({ icon: Icon, label, desc, href, color = 'primary', alert }: QuickActionCardProps) {
  const colors = quickActionColors[color] || quickActionColors.primary
  return (
    <Link href={href}>
      <button
        style={cardIsolationStyle}
        className={cn(
          'group relative w-full text-left p-4 rounded-2xl border border-slate-200/80 bg-white',
          'hover:shadow-md transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2472]',
          colors.hover,
          alert && 'border-amber-200 bg-amber-50/30'
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110',
            alert ? 'bg-amber-100' : colors.bg
          )}>
            <Icon className={cn('h-5 w-5', alert ? 'text-amber-600' : colors.icon)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{label}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{desc}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {alert && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </button>
    </Link>
  )
}

// ── Main Dashboard ──
export default function AdminDashboardPage() {
  const { user, loading } = useUser()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalAdmins: 0,
    totalUsers: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role')
      
      if (error) throw error
      
      const students = profiles?.filter(p => p.role === 'student') || []
      const staff = profiles?.filter(p => p.role === 'staff') || []
      const admins = profiles?.filter(p => p.role === 'admin') || []
      
      setStats({
        totalStudents: students.length,
        totalStaff: staff.length,
        totalAdmins: admins.length,
        totalUsers: profiles?.length || 0,
      })
    } catch {
      toast.error('Failed to load statistics')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const quickStats = [
    { 
      label: 'Total Students', 
      value: stats.totalStudents, 
      icon: GraduationCap, 
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/students'
    },
    { 
      label: 'Staff Members', 
      value: stats.totalStaff, 
      icon: Briefcase, 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/staff'
    },
    { 
      label: 'Admins', 
      value: stats.totalAdmins, 
      icon: Shield, 
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      href: '/admin/admins'
    },
    { 
      label: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-[#0A2472]',
      bg: 'bg-[#0A2472]/5',
      href: '/admin/students'
    },
  ]

  const recentActivity = [
    { action: 'New student enrolled', time: '2 hours ago', user: 'John Doe' },
    { action: 'Teacher assigned', time: '5 hours ago', user: 'Mrs. Adeleke' },
    { action: 'Report cards generated', time: '1 day ago', user: 'Admin' },
    { action: 'Attendance report generated', time: '2 days ago', user: 'Mr. Smith' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A2472] to-[#1A3A8A] p-6 md:p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-[#C9A84C]" />
            <span className="text-sm font-medium text-[#C9A84C]">Admin Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display">
            Welcome back, {user?.full_name?.split(' ')[0] || user?.first_name || 'Admin'}! 👋
          </h1>
          <p className="text-white/80 mt-1 text-sm md:text-base">
            Manage your school efficiently. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/5 rounded-full -mb-16" />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="hover:shadow-soft-lg transition-all cursor-pointer group border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#0A2472]">
                        {statsLoading ? '...' : stat.value}
                      </p>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickActionCard
              icon={UserPlus}
              label="Add Student"
              desc="Enroll a new student"
              href="/admin/students?action=add"
              color="blue"
            />
            <QuickActionCard
              icon={UserPlus}
              label="Add Staff"
              desc="Hire a new staff member"
              href="/admin/staff?action=add"
              color="green"
            />
            <QuickActionCard
              icon={FileText}
              label="Report Cards"
              desc="Generate and view report cards"
              href="/admin/report-cards"
              color="violet"
            />
            <QuickActionCard
              icon={Megaphone}
              label="Announcements"
              desc="Send updates to parents"
              href="/admin/announcements"
              color="amber"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-display text-[#0A2472]">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.action} className="flex items-center gap-3 p-3 bg-[#F9F7F4] rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{activity.action}</p>
                    <p className="text-xs text-slate-400">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200/50">
        <p>Vincollins Schools Admin Panel • Geared Towards Excellence</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
      </div>
    </div>
  )
}