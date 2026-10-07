'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Baby, 
  GraduationCap, 
  BookOpen, 
  Trophy,
  Sparkles,
  ArrowRight,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  School,
  Users,
  BookMarked,
  Music2,
  Brush,
  Dumbbell,
  Calculator,
  Code,
  Mic,
  Theater,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'  // ← ADD THIS

// ─── Types ──────────────────────────────────────────────────────────────────────
interface SchoolSettings {
  school_name: string
  school_motto: string
  school_phone: string
  school_email: string
  school_address: string
  logo_path: string
}

interface Programme {
  id: string
  name: string
  age_range: string
  description: string
  icon: React.ElementType
  features: string[]
  color: string
  image: string
  duration: string
  class_size: string
}

// ─── Premium SVG Pattern Backgrounds ───────────────────────────────────────────
function DotGridPattern({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("absolute inset-0 h-full w-full stroke-slate-200/50 [mask-image:radial-gradient(100%_100%_at_top_left,white,transparent)]", className)} 
      aria-hidden="true"
    >
      <defs>
        <pattern id="dot-pattern" width="20" height="20" patternUnits="userSpaceOnUse" x="-1" y="-1">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" className="text-slate-300" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth="0" fill="url(#dot-pattern)" />
    </svg>
  )
}

// ─── Social Icons ─────────────────────────────────────────────────────────────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.418-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 12 5 12 5s6.255 0 7.812.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
    </svg>
  )
}

// ─── Badge Component ─────────────────────────────────────────────────────────
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full border border-[#0A2472]/10 bg-[#0A2472]/5 text-[#0A2472]",
      className
    )}>
      {children}
    </span>
  )
}

// ─── Premium Programme Card ──────────────────────────────────────────────────
function ProgrammeCard({ 
  programme, 
  index 
}: { 
  programme: Programme
  index: number 
}) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = programme.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-[#0A2472]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col justify-between"
    >
      {/* Structural Color Bar */}
      <div 
        className="h-2 w-full transition-all duration-500" 
        style={{ backgroundColor: programme.color }} 
      />

      <div className="p-8 flex flex-col flex-1 justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${programme.color}15` }}
            >
              <Icon className="h-7 w-7" style={{ color: programme.color }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{programme.name}</h3>
              <span className="inline-block text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
                {programme.age_range}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {programme.description}
          </p>

          {/* Dynamic Badges */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {programme.features.slice(0, 4).map((feature, i) => (
              <span 
                key={i}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/40"
              >
                {feature}
              </span>
            ))}
            {programme.features.length > 4 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-400">
                +{programme.features.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Class Metrics */}
        <div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 border-t border-slate-100 pt-5 mb-6">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{programme.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" />
              <span>{programme.class_size}</span>
            </div>
          </div>

          {/* Clean Interactive Action Button */}
          <Link href="/admission">
            <button 
              className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 group/btn flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: isHovered ? programme.color : `${programme.color}10`,
                color: isHovered ? '#fff' : programme.color,
                border: `1px solid ${programme.color}25`
              }}
            >
              Request Admission Outline
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Premium Stat Card ─────────────────────────────────────────────────────────
function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="relative p-6 text-center md:text-left bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-shadow duration-300"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#0A2472]/5 flex items-center justify-center shrink-0">
        <Icon className="h-7 w-7 text-[#0A2472]" />
      </div>
      <div>
        <p className="text-3xl md:text-4xl font-extrabold text-[#0A2472] tracking-tight">{value}</p>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Programmes Page ──────────────────────────────────────────────────────
export default function ProgrammesPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // ─── Fetch school settings ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('school_settings')
          .select('*')
          .maybeSingle()

        if (!error && data) {
          setSettings(data as SchoolSettings)
        }
      } catch (error) {
        console.error('Error fetching school settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // ─── Default values ─────────────────────────────────────────────────────────
  const schoolName = settings?.school_name || 'Vincollins Schools'
  const phone = settings?.school_phone || '+234 907 082 9999'
  const email = settings?.school_email || 'vincollinsschools@gmail.com'
  const address = settings?.school_address || '7/9 Lawani Street, off Ishaga Road, Surulere, Lagos'
  const logoPath = settings?.logo_path || '/images/logo.png'

  const programmes: Programme[] = [
    {
      id: 'playgroup',
      name: 'Playgroup',
      age_range: '1 - 2 years',
      description: 'A nurturing environment where toddlers develop social skills, confidence, and a love for learning through play-based activities.',
      icon: Baby,
      color: '#FF6B6B',
      features: ['Social Development', 'Play-Based Learning', 'Sensory Activities', 'Story Time', 'Music & Movement', 'Outdoor Play'],
      image: '/images/playgroup.jpg',
      duration: '2 - 3 hours daily',
      class_size: '8 - 10 children'
    },
    {
      id: 'nursery',
      name: 'Nursery',
      age_range: '2 - 4 years',
      description: 'Building foundational skills through structured learning, creative play, and social interaction in a caring environment.',
      icon: BookOpen,
      color: '#4ECDC4',
      features: ['Early Literacy', 'Numeracy Skills', 'Creative Arts', 'Physical Development', 'Social Skills', 'Language Development'],
      image: '/images/nursery.jpg',
      duration: '3 - 4 hours daily',
      class_size: '12 - 15 children'
    },
    {
      id: 'kindergarten',
      name: 'Kindergarten',
      age_range: '4 - 5 years',
      description: 'Preparing children for primary school with a balanced curriculum of academics, creativity, and social-emotional learning.',
      icon: GraduationCap,
      color: '#45B7D1',
      features: ['Reading Readiness', 'Writing Skills', 'Basic Mathematics', 'Science Exploration', 'Social Studies', 'Art & Craft'],
      image: '/images/kindergarten.jpg',
      duration: '4 - 5 hours daily',
      class_size: '15 - 18 children'
    },
    {
      id: 'primary_1_3',
      name: 'Primary 1 - 3',
      age_range: '5 - 8 years',
      description: 'Building strong academic foundations with a comprehensive curriculum that develops critical thinking and problem-solving skills.',
      icon: BookMarked,
      color: '#96CEB4',
      features: ['English Language', 'Mathematics', 'Basic Science', 'Social Studies', 'ICT', 'Physical Education'],
      image: '/images/primary-1-3.jpg',
      duration: '5 - 6 hours daily',
      class_size: '20 - 25 children'
    },
    {
      id: 'primary_4_5',
      name: 'Primary 4 - 5',
      age_range: '8 - 10 years',
      description: 'Advanced primary education that deepens knowledge across subjects while fostering independence and leadership skills.',
      icon: Calculator,
      color: '#DDA0DD',
      features: ['Advanced English', 'Mathematics', 'Science', 'Social Studies', 'ICT', 'French', 'Music', 'Arts'],
      image: '/images/primary-4-5.jpg',
      duration: '5 - 6 hours daily',
      class_size: '20 - 25 children'
    },
    {
      id: 'co_curricular',
      name: 'Co-Curricular Activities',
      age_range: 'All ages',
      description: 'Enriching programmes that develop talents, skills, and character beyond the academic curriculum.',
      icon: Trophy,
      color: '#F7DC6F',
      features: ['Sports', 'Music', 'Dance', 'Drama', 'Art & Craft', 'ICT Club', 'Debate', 'STEM Club'],
      image: '/images/co-curricular.jpg',
      duration: '1 - 2 hours weekly',
      class_size: 'Flexible'
    }
  ]

  const stats = [
    { value: '6+', label: 'Structured Pathways', icon: GraduationCap },
    { value: '15+', label: 'Years Experience', icon: Star },
    { value: '100+', label: 'Co-Curricular Events', icon: Trophy },
    { value: '100%', label: 'Developmental Care', icon: School },
  ]

  const extracurricularActivities = [
    { icon: Music2, label: 'Instrumental & Vocal Music', color: '#FF6B6B', description: 'Comprehensive training in string instruments, rhythm, and group choir performance.' },
    { icon: Brush, label: 'Creative Fine Arts', color: '#4ECDC4', description: 'Fostering imaginative canvas expression, modeling, sketching, and structural craftsmanship.' },
    { icon: Dumbbell, label: 'Eminent Physical Education', color: '#45B7D1', description: 'Developing core motor coordination, cooperative sportsmanship, and cardiovascular fitness.' },
    { icon: Code, label: 'Modern ICT Academy', color: '#96CEB4', description: 'Early exposure to computer programming paradigms, engineering basics, and digital designs.' },
    { icon: Theater, label: 'Dynamic Theater Art', color: '#DDA0DD', description: 'Instilling dramatic poise, vocal modulation, and robust creative play.' },
    { icon: Mic, label: 'Elocution & Argumentative Debate', color: '#F7DC6F', description: 'Formulating critical reasoning skills, poise, and fluent public oratory.' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mt-6 animate-pulse">
            Sourcing Academic Architectures...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-[#0A2472] selection:text-white">
      
      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <Header />

      {/* ─── Premium Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0A2472] text-white py-24 md:py-32 border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(10,36,114,0.8),rgba(26,58,138,0.95))]" />

        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3.5"
            >
              {logoPath ? (
                <div className="relative w-16 h-16">
                  <Image
                    src={logoPath}
                    alt={schoolName}
                    fill
                    className="object-contain filter drop-shadow-md"
                    sizes="64px"
                  />
                </div>
              ) : (
                <School className="h-12 w-12 text-[#C9A84C]" />
              )}
              <span className="text-sm font-bold tracking-widest uppercase text-slate-200">{schoolName}</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white"
              >
                Structured Programmes For <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] via-[#e5c977] to-[#C9A84C]">
                  Every Growth Phase
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed"
              >
                From fundamental playgroups to dynamic primary cohorts, discover our carefully formulated pathways designed to foster your child&apos;s hidden excellence.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link href="/admission">
                <button className="px-8 py-4 bg-[#C9A84C] text-[#0A2472] rounded-full font-bold hover:bg-[#DBC06A] hover:-translate-y-0.5 transition-all shadow-xl hover:shadow-[#C9A84C]/25 flex items-center gap-2">
                  Enroll Today <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="#programmes-section">
                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full font-bold transition-all">
                  Examine Curriculums
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Metric Badges ────────────────────────────────────────────────── */}
      <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </section>

      {/* ─── Modern Grid Programmes Section ────────────────────────────────── */}
      <section id="programmes-section" className="py-24 relative overflow-hidden bg-slate-50">
        <DotGridPattern />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge><Sparkles className="h-3 w-3" /> Growth Pathways</Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A2472]">
              A Curated Fit For Every Age
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              Each class structure maintains optimized student-teacher metrics, ensuring focused pedagogical support and custom milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programmes.map((programme, index) => (
              <ProgrammeCard key={programme.id} programme={programme} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Extracurricular Showcase ─────────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-[#C9A84C]/10 text-[#0A2472] border-[#C9A84C]/20">Holistic Horizon</Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A2472]">
              Extracurricular Specializations
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              Beyond standard metrics, we encourage scholars to explore specialized workshops designed to uncover athletic and artistic brilliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {extracurricularActivities.map((activity, idx) => (
              <motion.div
                key={activity.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/60 hover:border-[#0A2472]/20 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${activity.color}15` }}
                >
                  <activity.icon className="h-6 w-6" style={{ color: activity.color }} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{activity.label}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mt-1">{activity.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Premium Matrix (Comparison Table) ──────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge>Analytical View</Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A2472]">
              Programme Framework Matrix
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              Quickly contrast each programme structure to locate the appropriate platform matching your scholar&apos;s milestones.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A2472] text-white">
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider">Programme Tier</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-center">Recommended Age</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-center">Session Length</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-center">Class Ratio Limit</th>
                    <th className="px-6 py-5 text-sm font-bold uppercase tracking-wider text-center">Primary Development Focus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programmes.map((prog, idx) => (
                    <tr 
                      key={prog.id} 
                      className={cn(
                        "transition-colors hover:bg-slate-50/70",
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      )}
                    >
                      <td className="px-6 py-4.5 text-base font-bold text-slate-800">{prog.name}</td>
                      <td className="px-6 py-4.5 text-sm text-slate-600 text-center font-medium">{prog.age_range}</td>
                      <td className="px-6 py-4.5 text-sm text-slate-500 text-center">{prog.duration}</td>
                      <td className="px-6 py-4.5 text-sm text-slate-500 text-center">{prog.class_size}</td>
                      <td className="px-6 py-4.5 text-center">
                        <span 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" 
                          style={{ 
                            backgroundColor: `${prog.color}15`,
                            color: prog.color
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {prog.features[0]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dynamic CTA Section ─────────────────────────────────────────── */}
      <section className="relative py-24 bg-[#0A2472] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.12),transparent_50%)]" />
        
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10 space-y-8">
          <Badge className="bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20">Limited Cohorts Remaining</Badge>
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Ready to Enroll Your Child?
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto leading-relaxed text-base md:text-lg font-light">
              Secure a premier pathway designed for advanced thinking and core moral values.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/admission">
              <button className="px-8 py-4 bg-[#C9A84C] text-[#0A2472] rounded-full font-bold hover:bg-[#DBC06A] transition-all hover:scale-105 shadow-xl hover:shadow-[#C9A84C]/20">
                Begin Online Registration
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-full font-bold hover:bg-white/10 transition-all">
                Connect with Admissions
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer Section ───────────────────────────────────────────────── */}
      <footer className="bg-[#040E30] text-slate-300 pt-16 pb-8 border-t border-white/5 relative z-30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/5">
            
            {/* Institution Description */}
            <div className="md:col-span-5 space-y-4">
              <h4 className="font-bold text-white text-lg tracking-wide uppercase">Vincollins Schools</h4>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-light">
                Delivering high-quality academic mentoring and leadership preparation for young learners.
              </p>
              <p className="text-slate-400 text-xs flex items-center gap-2 pt-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#C9A84C]" /> {address}
              </p>
            </div>

            {/* Quick Contact Info */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="font-bold text-white text-sm tracking-widest uppercase">Direct Channels</h4>
              <ul className="space-y-3">
                <li>
                  <a href={`tel:${phone}`} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#C9A84C]" /> {phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${email}`} className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#C9A84C]" /> {email}
                  </a>
                </li>
              </ul>
            </div>

            {/* Premium Social Matrix */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-bold text-white text-sm tracking-widest uppercase">Stay Connected</h4>
              <div className="flex gap-3">
                <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-[#C9A84C] transition-all">
                  <FacebookIcon className="h-5 w-5" />
                </a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-[#C9A84C] transition-all">
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-[#C9A84C] transition-all">
                  <TwitterIcon className="h-5 w-5" />
                </a>
                <a href="#" aria-label="YouTube" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-[#C9A84C] transition-all">
                  <YoutubeIcon className="h-5 w-5" />
                </a>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-slate-500 text-xs text-center sm:text-left">
            <p>&copy; {new Date().getFullYear()} Vincollins Schools. All rights reserved.</p>
            <p className="italic">Geared Towards Excellence.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}