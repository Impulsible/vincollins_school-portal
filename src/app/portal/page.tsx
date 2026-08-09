/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/portal/page.tsx
'use client'

import {
  useState, useEffect, useRef, useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/contexts/UserContext'
import { useLoginRateLimit } from '@/hooks/useLoginRateLimit'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import {
  Mail, Eye, EyeOff, GraduationCap, Shield, Users,
  Loader2, AlertCircle, KeyRound, ArrowRight, Sparkles,
  Phone, Mail as MailIcon, CheckCircle, Lock,
  Fingerprint, ShieldCheck, BookOpen,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
interface SchoolSettings {
  logo_path: string
  school_name: string
  school_motto: string
  school_phone?: string
  school_email?: string
}

type UserRole = 'student' | 'teacher' | 'admin'

// ─── Helper: Get First Name ──────────────────────────────────────────────────
// Handles both "FirstName LastName" and "Surname FirstName" formats
const getFirstName = (fullName: string): string => {
  if (!fullName) return 'User'
  
  const parts = fullName.trim().split(/\s+/)
  
  // If there's only one part, return it
  if (parts.length === 1) return parts[0]
  
  // Check if first part is a title (Dr., Prof., Mr., Mrs., Ms.)
  const titlePrefixes = ['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms']
  if (titlePrefixes.includes(parts[0].toLowerCase())) {
    return parts[2] || parts[1] || parts[0]
  }
  
  // Common Nigerian surnames (to detect "Surname FirstName" format)
  const commonSurnames = [
    'Adesope', 'Okafor', 'Okonkwo', 'Adebayo', 'Ogunleye', 
    'Eze', 'Nwosu', 'Adedeji', 'Oladipo', 'Adeyemi',
    'Balogun', 'Fashola', 'Oyedele', 'Akinlade', 'Ogunbiyi',
    'Adeola', 'Olatunji', 'Ogunyemi', 'Akinsanya', 'Olawale'
  ]
  
  // If first part is a common surname and there's a second part,
  // return the second part as the first name
  if (commonSurnames.includes(parts[0]) && parts.length > 1) {
    return parts[1]
  }
  
  // Check if the first part is a single letter (likely an initial)
  if (parts[0].length === 1 && parts[0].toUpperCase() === parts[0]) {
    // If first part is an initial, return the second part as first name
    if (parts.length > 1) {
      return parts[1]
    }
    return parts[0]
  }
  
  // For "FirstName LastName" format, return the first part
  return parts[0] || 'User'
}

// ── Role config ────────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  student: {
    icon: '🎒',
    emoji: '🌟',
    label: 'Pupil',
    Icon: GraduationCap,
    color: '#059669',
    lightBg: '#ECFDF5',
    gradientCSS: 'linear-gradient(135deg, #059669, #0d9488)',
    greeting: 'Welcome back, superstar!',
    infoBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    infoText: 'Access your lessons, results & report cards',
    redirect: '/pupil',
    description: 'Pupil portal',
  },
  teacher: {
    icon: '👩‍🏫',
    emoji: '👋',
    label: 'Teacher/Staff',
    Icon: Users,
    color: '#2563EB',
    lightBg: '#EFF6FF',
    gradientCSS: 'linear-gradient(135deg, #2563EB, #4f46e5)',
    greeting: 'Welcome back, Teacher',
    infoBg: 'bg-blue-50 border-blue-200 text-blue-700',
    infoText: 'Manage classes, results & pupil records',
    redirect: '/staff',
    description: 'Staff portal',
  },
  admin: {
    icon: '👑',
    emoji: '✨',
    label: 'Admin',
    Icon: Shield,
    color: '#D97706',
    lightBg: '#FFFBEB',
    gradientCSS: 'linear-gradient(135deg, #D97706, #ea580c)',
    greeting: 'Welcome back, Administrator',
    infoBg: 'bg-amber-50 border-amber-200 text-amber-700',
    infoText: 'Full school management & admin access',
    redirect: '/admin',
    description: 'Admin portal',
  },
} as const

const DEFAULT_SETTINGS: SchoolSettings = {
  logo_path: '',
  school_name: 'Vincollins Schools',
  school_motto: 'Geared Towards Excellence',
  school_phone: '+234 907 082 9999',
  school_email: 'vincollinsschools@gmail.com',
}

// ── Success Modal ──────────────────────────────────────────────────────────────
interface SuccessModalProps {
  userName: string
  role: UserRole
  redirectPath: string
  onGo: () => void
}

function SuccessModal({ userName, role, redirectPath, onGo }: SuccessModalProps) {
  const config = ROLE_CONFIG[role]
  const firstName = getFirstName(userName)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => setCountdown((p) => Math.max(0, p - 1)), 1000)
    return () => clearInterval(interval)
  }, [])

  // Auto redirect when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      onGo()
    }
  }, [countdown, onGo])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 24 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="relative h-28 overflow-hidden" style={{ background: config.gradientCSS }}>
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full border-4 border-white/20" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border-4 border-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl border border-white/30 shadow-xl"
            >
              {config.icon}
            </motion.div>
          </div>
          <button
            onClick={onGo}
            className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-7 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                Login Successful
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              Hello, {firstName}! {config.emoji}
            </h3>
            <p className="text-sm text-gray-400 mb-6">{config.greeting}</p>

            <div className="relative w-14 h-14 mb-5">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                <motion.circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={config.color} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 24 }}
                  transition={{ duration: 3, ease: 'linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: config.color }}>{countdown}</span>
              </div>
            </div>

            <Button
              onClick={onGo}
              className="w-full h-12 text-sm font-bold rounded-2xl text-white shadow-lg hover:shadow-xl transition-all"
              style={{ background: config.gradientCSS }}
            >
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-[11px] text-gray-400 mt-3">
              Redirecting automatically in {countdown}s...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Lockout Banner ─────────────────────────────────────────────────────────────
function LockoutBanner({ remainingSeconds }: { remainingSeconds: number }) {
  const minutes = Math.ceil(remainingSeconds / 60)
  const progress = (remainingSeconds / 300) * 100
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 space-y-2.5"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
          <Lock className="h-3.5 w-3.5 text-rose-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-rose-800">Temporarily Locked</p>
          <p className="text-xs text-rose-500">
            Wait <span className="font-bold">{minutes} min{minutes !== 1 ? 's' : ''}</span>
          </p>
        </div>
      </div>
      <div className="h-1 bg-rose-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </motion.div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const { user, setUser, loading: userLoading } = useUser()
  const { isLocked, remainingSeconds, checkAndRecord } = useLoginRateLimit()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(DEFAULT_SETTINGS)
  const [imageError, setImageError] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [successData, setSuccessData] = useState<{
    userName: string; role: UserRole; redirectPath: string
  } | null>(null)

  const loginInProgressRef = useRef(false)

  // ─── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true)
  }, [])

  // ─── Check for existing user ──────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !user || successData) return

    // If user already exists, show success modal and redirect
    const redirectMap: Record<string, string> = {
      admin: '/admin',
      teacher: '/staff',
      student: '/pupil',
    }
    const path = redirectMap[user.role as string] || '/dashboard'
    
    setSuccessData({
      userName: user.full_name || user.first_name || 'User',
      role: user.role as UserRole,
      redirectPath: path
    })
  }, [mounted, user, successData])

  // ─── LOAD SCHOOL SETTINGS ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return
    
    const loadSchoolSettings = async () => {
      try {
        const cached = localStorage.getItem('school_settings')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            setSchoolSettings((prev) => ({ ...prev, ...parsed }))
          } catch {
            // Invalid cache, ignore
          }
        }

        const { data, error } = await supabase
          .from('school_settings')
          .select('school_name, logo_path, school_phone, school_email, school_motto, school_address')
          .maybeSingle()

        if (error) {
          console.warn('[Portal] Error fetching school settings:', error.message)
          return
        }

        if (data) {
          const settings: SchoolSettings = {
            logo_path: data.logo_path || DEFAULT_SETTINGS.logo_path,
            school_name: data.school_name || DEFAULT_SETTINGS.school_name,
            school_motto: data.school_motto || DEFAULT_SETTINGS.school_motto,
            school_phone: data.school_phone || DEFAULT_SETTINGS.school_phone,
            school_email: data.school_email || DEFAULT_SETTINGS.school_email,
          }
          setSchoolSettings(settings)
          localStorage.setItem('school_settings', JSON.stringify(settings))
        }
      } catch (err) {
        console.warn('[Portal] Exception loading school settings:', err)
      }
    }

    loadSchoolSettings()
  }, [mounted])

  // ─── Go to Dashboard ──────────────────────────────────────────────────────
  const goToDashboard = useCallback(() => {
    if (!successData) return
    router.push(successData.redirectPath)
  }, [successData, router])

  // ─── HANDLE LOGIN ───────────────────────────────────────────────────────────
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔐 [LoginPage] Login attempt started')
    
    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${Math.ceil(remainingSeconds / 60)} minute(s).`)
      return
    }
    
    if (loginInProgressRef.current || loading) {
      console.log('⏳ [LoginPage] Login already in progress')
      return
    }
    
    loginInProgressRef.current = true
    setLoading(true)
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.')
      loginInProgressRef.current = false
      setLoading(false)
      return
    }

    try {
      console.log('🔐 [LoginPage] Calling supabase.auth.signInWithPassword...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      })

      if (signInError) {
        console.error('❌ [LoginPage] Sign in error:', signInError)
        const { allowed, message } = checkAndRecord(false)
        if (!allowed) {
          setError(message ?? 'Too many attempts. Please try again later.')
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError(message
            ? `Invalid email or password. ${message}`
            : 'Invalid email or password. Please try again.')
        } else {
          setError('Login failed. Please check your credentials.')
        }
        loginInProgressRef.current = false
        setLoading(false)
        return
      }

      if (!signInData?.user) {
        console.error('❌ [LoginPage] No user data received')
        setError('Login failed. No user data received.')
        loginInProgressRef.current = false
        setLoading(false)
        return
      }

      console.log('✅ [LoginPage] Sign in successful, user ID:', signInData.user.id)

      // Get user profile
      console.log('🔍 [LoginPage] Fetching user profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name, first_name, last_name, avatar_url, photo_url, class')
        .eq('id', signInData.user.id)
        .maybeSingle()

      if (profileError) {
        console.error('❌ [LoginPage] Profile fetch error:', profileError)
      }

      console.log('📋 [LoginPage] Profile data:', profile)

      const rawRole = profile?.role?.toLowerCase()
        ?? signInData.user.user_metadata?.role?.toLowerCase()
        ?? 'student'
      
      let userRole: UserRole = 'student'
      if (rawRole === 'admin') userRole = 'admin'
      else if (rawRole === 'teacher' || rawRole === 'staff') userRole = 'teacher'
      else if (rawRole === 'student') userRole = 'student'

      console.log('📋 [LoginPage] User role:', userRole)

      // Check if role matches selected tab
      if (userRole !== selectedRole) {
        const displayName = userRole === 'teacher'
          ? 'Teacher/Staff'
          : userRole.charAt(0).toUpperCase() + userRole.slice(1)
        setError(`This account is registered as ${displayName}. Please select the correct tab above.`)
        await supabase.auth.signOut()
        checkAndRecord(false)
        loginInProgressRef.current = false
        setLoading(false)
        return
      }

      checkAndRecord(true)

      // Format user name
      let userName = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile?.full_name
          ?? signInData.user.user_metadata?.full_name
          ?? signInData.user.email?.split('@')[0]
          ?? 'User'

      userName = userName
        .split(/[.\s_-]+/)
        .filter(Boolean)
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')

      const redirectPath = ROLE_CONFIG[userRole].redirect

      // Get the first name using the robust helper
      const firstName = getFirstName(userName)

      // Set user in context
      const userData = {
        id: signInData.user.id,
        email: cleanEmail,
        full_name: userName,
        first_name: firstName,
        role: userRole,
        avatar_url: profile?.avatar_url || null,
        photo_url: profile?.photo_url || null,
      }
      
      console.log('👤 [LoginPage] Setting user data:', userData)
      setUser(userData)

      // Store in localStorage - ensure first_name is saved
      try {
        localStorage.setItem('auth_user', JSON.stringify({
          id: signInData.user.id,
          role: userRole,
          name: userName,
          full_name: userName,
          first_name: firstName,
          email: cleanEmail
        }))
        localStorage.setItem('auth_role', userRole)
        console.log('💾 [LoginPage] User saved to localStorage with first_name:', firstName)
      } catch (e) {
        console.warn('⚠️ [LoginPage] Failed to save to localStorage:', e)
      }

      // Show success modal
      setSuccessData({
        userName,
        role: userRole,
        redirectPath
      })

      setLoading(false)
      loginInProgressRef.current = false

    } catch (err) {
      console.error('❌ [LoginPage] Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      loginInProgressRef.current = false
      setLoading(false)
    }
  }, [email, password, selectedRole, loading, isLocked, remainingSeconds, checkAndRecord, setUser])

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A2472]" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  const currentConfig = ROLE_CONFIG[selectedRole]

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <div className="flex-1 flex pt-16 sm:pt-20">
          <div className="flex w-full min-h-[calc(100vh-80px)]">

            {/* LEFT - Image Side */}
            <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-[#0A2472]">
              <div className="relative w-full min-h-[calc(100vh-80px)]">
                {!imageError && (
                  <>
                    {!heroLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0A2472] to-[#1e3a8a] animate-pulse z-0" />
                    )}
                    <Image
                      src="/images/portal.jpg"
                      alt="Vincollins Schools Campus"
                      fill
                      className={cn(
                        'object-cover object-center transition-opacity duration-700 z-0',
                        heroLoaded ? 'opacity-100' : 'opacity-0',
                      )}
                      priority
                      quality={95}
                      sizes="(max-width: 1024px) 55vw, 60vw"
                      onLoad={() => setHeroLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  </>
                )}

                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-48 z-10 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-32 z-10 bg-gradient-to-b from-black/40 to-transparent" />

                <div className="relative z-20 flex flex-col justify-between w-full px-12 xl:px-16 py-12 min-h-[calc(100vh-80px)]">
                  {/* TOP: School identity */}
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-4"
                  >
                    {schoolSettings.logo_path ? (
                      <div className="relative h-14 w-14 flex-shrink-0 drop-shadow-2xl">
                        <Image
                          src={schoolSettings.logo_path}
                          alt="School Logo"
                          fill
                          sizes="56px"
                          className={cn(
                            'object-contain transition-opacity duration-300',
                            logoLoaded ? 'opacity-100' : 'opacity-0',
                          )}
                          priority
                          onLoad={() => setLogoLoaded(true)}
                          onError={() => setLogoLoaded(true)}
                        />
                        {!logoLoaded && (
                          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                        )}
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/30">
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                    )}
                    <div>
                      <h2
                        className="text-xl xl:text-2xl font-bold text-white leading-tight"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)' }}
                      >
                        {schoolSettings.school_name}
                      </h2>
                      <p
                        className="text-white/85 text-[13px] italic mt-0.5"
                        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
                      >
                        &ldquo;{schoolSettings.school_motto}&rdquo;
                      </p>
                    </div>
                  </motion.div>

                  {/* MIDDLE: Headline */}
                  <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="space-y-5 max-w-lg"
                  >
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-lg">
                      <Sparkles className="h-4 w-4 text-yellow-300" />
                      <span
                        className="text-[13px] font-semibold text-white tracking-wide"
                        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
                      >
                        Secure Portal Access
                      </span>
                    </div>

                    <h1
                      className="text-4xl xl:text-5xl 2xl:text-[3.25rem] font-bold text-white leading-[1.08] tracking-tight"
                      style={{ textShadow: '0 4px 28px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.5)' }}
                    >
                      Welcome to Your{' '}
                      <br />
                      <span
                        className="text-[#FFB84D]"
                        style={{ textShadow: '0 4px 28px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.6)' }}
                      >
                        Digital Campus
                      </span>
                    </h1>

                    <p
                      className="text-white/90 text-[15px] leading-relaxed font-light max-w-md"
                      style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
                    >
                      Sign in to continue your learning journey.
                    </p>
                  </motion.div>

                  {/* BOTTOM: Contact pills */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap items-center gap-3"
                  >
                    {schoolSettings.school_phone && (
                      <a
                        href={`tel:${schoolSettings.school_phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 hover:text-white hover:bg-white/20 transition-all"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-semibold">{schoolSettings.school_phone}</span>
                      </a>
                    )}
                    {schoolSettings.school_email && (
                      <a
                        href={`mailto:${schoolSettings.school_email}`}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 hover:text-white hover:bg-white/20 transition-all"
                      >
                        <MailIcon className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-semibold">{schoolSettings.school_email}</span>
                      </a>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* RIGHT - Form Side */}
            <div className="w-full lg:w-[45%] xl:w-[40%] bg-white flex items-center justify-center py-8 lg:py-10 px-5 sm:px-8 lg:px-10 xl:px-12 min-h-[calc(100vh-80px)] relative overflow-hidden">

              {/* Soft ambient background gradient */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-700"
                style={{
                  background: `radial-gradient(ellipse at top right, ${currentConfig.color}08, transparent 60%)`,
                }}
              />

              <div className="w-full max-w-[440px] relative">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >

                  {/* HEADER */}
                  <div className="flex items-start gap-3 mb-8">
                    <div
                      className="relative h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${currentConfig.lightBg}, white)`,
                        border: `1.5px solid ${currentConfig.color}30`,
                      }}
                    >
                      <BookOpen
                        className="h-5 w-5 transition-colors duration-500"
                        style={{ color: currentConfig.color }}
                      />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[1.65rem] font-bold text-gray-900 tracking-tight leading-none">
                          Sign In
                        </h3>
                      </div>
                      <p className="text-gray-500 text-[13px] mt-1.5">
                        Ready to learn something amazing today?{' '}
                        <span className="inline-block">🚀</span>
                      </p>
                    </div>
                  </div>

                  {/* MOBILE ONLY: School branding */}
                  <div className="lg:hidden flex items-center gap-3 mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    {schoolSettings.logo_path ? (
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src={schoolSettings.logo_path}
                          alt="Logo" fill sizes="40px"
                          className="object-contain"
                          priority
                          onLoad={() => setLogoLoaded(true)}
                          onError={() => setLogoLoaded(true)}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0A2472] to-[#1e3a8a] flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{schoolSettings.school_name}</p>
                      <p className="text-[11px] text-gray-500 italic">{schoolSettings.school_motto}</p>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">
                    I am a...
                  </label>

                  <div className="grid grid-cols-3 gap-2.5 mb-6">
                    {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => {
                      const cfg = ROLE_CONFIG[role]
                      const isActive = selectedRole === role

                      return (
                        <motion.button
                          key={role}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role)
                            setError('')
                          }}
                          whileTap={{ scale: 0.96 }}
                          className={cn(
                            'group relative flex flex-col items-center gap-1.5 pt-3 pb-2.5 px-2 rounded-2xl',
                            'transition-all duration-250 border-2',
                            isActive
                              ? 'bg-white shadow-md'
                              : 'bg-gray-50/70 border-transparent hover:bg-gray-100 hover:border-gray-200',
                          )}
                          style={isActive ? {
                            borderColor: cfg.color,
                            boxShadow: `0 4px 16px -4px ${cfg.color}35, 0 0 0 4px ${cfg.color}0d`,
                          } : {}}
                        >
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full border-[2.5px] border-white shadow-md flex items-center justify-center z-10"
                              style={{ background: cfg.color }}
                            >
                              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}

                          <div
                            className={cn(
                              'w-11 h-11 rounded-full flex items-center justify-center text-2xl transition-all duration-300',
                              isActive ? 'scale-105' : 'group-hover:scale-105',
                            )}
                            style={{
                              background: isActive
                                ? `linear-gradient(135deg, ${cfg.color}18, ${cfg.color}08)`
                                : '#ffffff',
                              boxShadow: isActive
                                ? `inset 0 0 0 2px ${cfg.color}25`
                                : 'inset 0 0 0 1px #e5e7eb',
                            }}
                          >
                            {cfg.icon}
                          </div>

                          <span
                            className={cn(
                              'text-[13px] font-bold transition-colors',
                              isActive ? '' : 'text-gray-700',
                            )}
                            style={isActive ? { color: cfg.color } : {}}
                          >
                            {cfg.label}
                          </span>

                          <span className={cn(
                            'text-[9.5px] font-medium transition-colors -mt-0.5',
                            isActive ? 'text-gray-500' : 'text-gray-400',
                          )}>
                            {cfg.description}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Info banner */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedRole}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'flex items-center gap-2.5 px-4 py-3 rounded-2xl border mb-6',
                        currentConfig.infoBg,
                      )}
                    >
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: currentConfig.color + '22' }}
                      >
                        <currentConfig.Icon
                          className="h-3.5 w-3.5"
                          style={{ color: currentConfig.color }}
                        />
                      </div>
                      <span className="text-[12.5px] font-semibold flex-1">
                        {currentConfig.infoText}
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Error alert */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                          <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                          </div>
                          <p className="text-[12.5px] text-rose-700 leading-relaxed pt-0.5 font-medium flex-1">
                            {error}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Lockout banner */}
                  <AnimatePresence>
                    {isLocked && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-5"
                      >
                        <LockoutBanner remainingSeconds={remainingSeconds} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Login form */}
                  <form onSubmit={handleLogin} className="space-y-5" noValidate>

                    {/* Email */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-700 pl-0.5"
                      >
                        <Mail className="h-3 w-3 text-gray-400" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
                          className={cn(
                            'w-full h-[50px] px-4 rounded-2xl border-2 text-[14px] text-gray-900',
                            'bg-gray-50/70 focus:bg-white outline-none transition-all duration-200',
                            'placeholder:text-gray-400 font-medium',
                            error
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-gray-200',
                          )}
                          onFocus={(e) => {
                            if (!error) {
                              e.target.style.borderColor = currentConfig.color
                              e.target.style.boxShadow = `0 0 0 4px ${currentConfig.color}12`
                            }
                          }}
                          onBlur={(e) => {
                            if (!error) {
                              e.target.style.borderColor = '#e5e7eb'
                              e.target.style.boxShadow = 'none'
                            }
                          }}
                          required
                          disabled={loading || isLocked}
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pl-0.5">
                        <label
                          htmlFor="password"
                          className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-700"
                        >
                          <KeyRound className="h-3 w-3 text-gray-400" />
                          Password
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-[11.5px] font-semibold hover:underline underline-offset-4 transition-colors"
                          style={{ color: currentConfig.color }}
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); if (error) setError('') }}
                          className={cn(
                            'w-full h-[50px] pl-4 pr-12 rounded-2xl border-2 text-[14px] text-gray-900',
                            'bg-gray-50/70 focus:bg-white outline-none transition-all duration-200',
                            'placeholder:text-gray-400 font-medium',
                            error
                              ? 'border-red-300 focus:border-red-400'
                              : 'border-gray-200',
                          )}
                          onFocus={(e) => {
                            if (!error) {
                              e.target.style.borderColor = currentConfig.color
                              e.target.style.boxShadow = `0 0 0 4px ${currentConfig.color}12`
                            }
                          }}
                          onBlur={(e) => {
                            if (!error) {
                              e.target.style.borderColor = '#e5e7eb'
                              e.target.style.boxShadow = 'none'
                            }
                          }}
                          required
                          disabled={loading || isLocked}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword
                            ? <EyeOff className="h-4 w-4" />
                            : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={loading || isLocked}
                      whileTap={!loading && !isLocked ? { scale: 0.985 } : {}}
                      className={cn(
                        'relative w-full h-[52px] mt-2 rounded-2xl text-[14px] font-bold text-white overflow-hidden group',
                        'transition-all duration-300',
                        (loading || isLocked) && 'opacity-60 cursor-not-allowed',
                      )}
                      style={!(loading || isLocked) ? {
                        background: currentConfig.gradientCSS,
                        boxShadow: `0 10px 30px -8px ${currentConfig.color}66, 0 4px 12px -4px ${currentConfig.color}44`,
                      } : { background: '#9ca3af' }}
                    >
                      {!loading && !isLocked && (
                        <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </span>
                      )}
                      <span className="relative flex items-center justify-center gap-2.5">
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Signing you in...</span>
                          </>
                        ) : isLocked ? (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Account Locked</span>
                          </>
                        ) : (
                          <>
                            <span>Continue as {currentConfig.label}</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </form>

                  {/* Trust row */}
                  <div className="flex items-center justify-center gap-5 mt-7 pt-5 border-t border-gray-100">
                    {[
                      { icon: ShieldCheck, text: 'SSL Secured' },
                      { icon: Lock, text: 'Encrypted' },
                      { icon: Fingerprint, text: 'Protected' },
                    ].map(({ icon: TIcon, text }) => (
                      <div key={text} className="flex items-center gap-1.5 text-gray-400">
                        <TIcon className="h-3 w-3" />
                        <span className="text-[10px] font-semibold">{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-5 space-y-2">
                    <p className="text-center text-[11.5px] text-gray-400">
                      Need help?{' '}
                      <Link
                        href="/contact"
                        className="font-semibold hover:underline transition-colors"
                        style={{ color: currentConfig.color }}
                      >
                        Contact Support
                      </Link>
                    </p>
                    <p className="text-center text-[10.5px] text-gray-300">
                      © {new Date().getFullYear()} {schoolSettings.school_name}. All rights reserved.
                    </p>
                  </div>

                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Success Modal ─── */}
      <AnimatePresence>
        {successData && (
          <SuccessModal
            userName={successData.userName}
            role={successData.role}
            redirectPath={successData.redirectPath}
            onGo={goToDashboard}
          />
        )}
      </AnimatePresence>
    </>
  )
}