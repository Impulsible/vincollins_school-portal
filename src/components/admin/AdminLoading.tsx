/* eslint-disable @typescript-eslint/no-explicit-any */
// components/admin/AdminLoading.tsx - NO SKELETON LOADER
// ============================================
// ADMIN DASHBOARD LOADING STATE
// ============================================

'use client'

import { motion } from 'framer-motion'
import { Shield, GraduationCap, Users, BookOpen } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { getRoleColors } from '@/contexts/UserContext'

interface AdminLoadingProps {
  profile: any
  onLogout: () => void
}

interface HeaderUser {
  id: string
  name: string
  firstName: string
  email: string
  role: 'admin'
  avatar?: string
  isAuthenticated: boolean
}

export default function AdminLoading({ profile, onLogout }: AdminLoadingProps) {
  const roleColors = getRoleColors('admin')
  const primaryColor = roleColors?.primary || '#0A2472'

  const formatProfileForHeader = (profile: any): HeaderUser | undefined => {
    if (!profile) return undefined

    return {
      id: profile.id || '',
      name: profile.display_name || profile.full_name || 'Administrator',
      firstName: profile.first_name || profile.display_name?.split(' ')[0] || profile.full_name?.split(' ')[0] || 'Admin',
      email: profile.email || '',
      role: 'admin' as const,
      avatar: profile.photo_url || undefined,
      isAuthenticated: true
    }
  }

  // Floating icons for background decoration
  const floatingIcons = [
    { Icon: GraduationCap, delay: 0, x: -120, y: -80 },
    { Icon: Users, delay: 0.8, x: 120, y: -60 },
    { Icon: BookOpen, delay: 1.6, x: -80, y: 80 },
    { Icon: Shield, delay: 2.4, x: 100, y: 70 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden">
      <Header user={formatProfileForHeader(profile)} onLogout={onLogout} />

      {/* Background Decorative Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map(({ Icon, delay, x, y }, index) => (
          <motion.div
            key={index}
            className="absolute opacity-[0.03]"
            style={{
              top: `calc(50% + ${y}px)`,
              left: `calc(50% + ${x}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              y: [y, y - 15, y],
              rotate: [0, 8, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              delay,
              ease: "easeInOut"
            }}
          >
            <Icon className="h-20 w-20" style={{ color: primaryColor }} />
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 relative z-10">
        <div className="text-center">
          {/* Main Shield with Pulse Ring */}
          <div className="relative inline-block">
            {/* Outer Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: `${primaryColor}20` }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0, 0.4]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Inner Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: `${primaryColor}30` }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: 0.3,
                ease: "easeInOut"
              }}
            />

            {/* Shield Icon */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.03, 1]
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative bg-white/80 backdrop-blur-sm rounded-full p-5 shadow-sm border border-slate-100"
            >
              <Shield className="h-12 w-12" strokeWidth={1.5} style={{ color: primaryColor }} />
            </motion.div>
          </div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6"
          >
            <h2 className="text-lg font-semibold text-slate-700">
              Loading Dashboard
            </h2>
            <p className="mt-1.5 text-slate-400 text-xs max-w-xs mx-auto">
              Preparing your admin workspace with all the tools you need
            </p>
          </motion.div>

          {/* Animated Loading Dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: primaryColor, opacity: 0.6 }}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Loading Progress Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3"
          >
            <p className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
              <span className="inline-block animate-pulse mr-1" style={{ color: `${primaryColor}80` }}>●</span>
              Securing your session
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}