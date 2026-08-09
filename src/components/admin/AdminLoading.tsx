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
  profile: any // Keeping any for profile as it comes from context
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
  // Get admin role colors
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
            className="absolute opacity-5"
            style={{ 
              top: `calc(50% + ${y}px)`, 
              left: `calc(50% + ${x}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{ 
              y: [y, y - 20, y],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              delay,
              ease: "easeInOut"
            }}
          >
            <Icon className="h-24 w-24" style={{ color: primaryColor }} />
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 relative z-10">
        <div className="text-center">
          {/* Main Shield with Pulse Ring */}
          <div className="relative inline-block">
            {/* Outer Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: `${primaryColor}15` }}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Inner Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: `${primaryColor}25` }}
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.7, 0, 0.7]
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
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-xl border border-slate-100"
            >
              <Shield className="h-16 w-16" style={{ color: primaryColor }} />
            </motion.div>
          </div>

          {/* Loading Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6"
          >
            <h2 className="text-2xl font-bold text-slate-800">
              Loading Dashboard
            </h2>
            <p className="mt-2 text-slate-500 text-sm max-w-xs mx-auto">
              Preparing your admin workspace with all the tools you need
            </p>
          </motion.div>

          {/* Animated Loading Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-3 w-3 rounded-full"
                style={{ background: primaryColor }}
                animate={{ 
                  y: [0, -12, 0],
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ 
                  duration: 0.8, 
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
            className="mt-4"
          >
            <p className="text-xs font-medium tracking-wider" style={{ color: primaryColor }}>
              <span className="inline-block animate-pulse">●</span> SECURING YOUR SESSION
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}