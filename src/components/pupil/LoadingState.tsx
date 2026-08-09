/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { motion } from 'framer-motion'
import { GraduationCap, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/header'

interface LoadingStateProps {
  profile?: any
  onLogout?: () => void
}

// ─── Helper: Get First Name ──────────────────────────────────────────────────
// Handles both "FirstName LastName" and "Surname FirstName" formats
const getFirstName = (fullName: string): string => {
  if (!fullName) return 'Student'
  
  const parts = fullName.trim().split(/\s+/)
  
  if (parts.length === 1) return parts[0]
  
  const titlePrefixes = ['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms']
  if (titlePrefixes.includes(parts[0].toLowerCase())) {
    return parts[2] || parts[1] || parts[0]
  }
  
  const commonSurnames = [
    'Adesope', 'Okafor', 'Okonkwo', 'Adebayo', 'Ogunleye', 
    'Eze', 'Nwosu', 'Adedeji', 'Oladipo', 'Adeyemi',
    'Balogun', 'Fashola', 'Oyedele', 'Akinlade', 'Ogunbiyi',
    'Adeola', 'Olatunji', 'Ogunyemi', 'Akinsanya', 'Olawale'
  ]
  
  if (commonSurnames.includes(parts[0]) && parts.length > 1) {
    return parts[1]
  }
  
  if (parts[0].length === 1 && parts[0].toUpperCase() === parts[0]) {
    if (parts.length > 1) {
      return parts[1]
    }
    return parts[0]
  }
  
  return parts[0] || 'Student'
}

// ── Format Profile for Header ──────────────────────────────────────────────
const formatProfileForHeader = (profile: any) => {
  if (!profile) return undefined
  
  const displayName = profile.display_name || profile.full_name || 'Student'
  const firstName = getFirstName(displayName)
  
  return {
    id: profile.id,
    name: displayName,
    firstName: firstName,
    email: profile.email || '',
    role: 'pupil' as const,
    avatar: profile.photo_url || undefined,
    isAuthenticated: true
  }
}

// ── Main Loading Component ────────────────────────────────────────────────────
export function PupilLoadingState({ profile, onLogout }: LoadingStateProps) {
  const formattedUser = formatProfileForHeader(profile)
  const displayName = formattedUser?.firstName || 'Student'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-x-hidden">
      <Header user={formattedUser} onLogout={onLogout} />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="text-center max-w-md w-full">
          {/* Main Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <GraduationCap className="h-16 w-16 text-emerald-600 mx-auto" />
          </motion.div>
          
          {/* Greeting - uses first name */}
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-2xl font-bold text-slate-800"
          >
            Hi, <span className="text-emerald-600">{displayName}</span>! 👋
          </motion.h2>
          
          {/* Loading Message - Animated sequence */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-slate-600 text-lg font-medium"
          >
            🚀 Getting your classroom ready...
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-2 text-slate-500 text-sm"
          >
            🌟 Your learning adventure is loading
          </motion.p>
          
          {/* Almost there message - child-friendly version */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="mt-2 text-emerald-500 text-sm font-medium"
          >
            ⏳ Just a few more seconds, superstar!
          </motion.p>
          
          {/* Bouncing Dots */}
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-emerald-400"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>

          {/* Fun Fact Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-4 border-t border-slate-200/60"
          >
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              <span>Your learning adventure is about to begin!</span>
              <Sparkles className="h-3 w-3 text-yellow-400" />
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ── Mini Loading State ──────────────────────────────────────────────────────
export function MiniLoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 rounded-full border-2 border-emerald-200 border-t-emerald-600"
      />
      <p className="text-sm text-slate-500 mt-3 flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-yellow-400" />
        {message}
        <Sparkles className="h-3 w-3 text-yellow-400" />
      </p>
    </div>
  )
}

// ── Skeleton Loading for Cards ──────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-soft p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}