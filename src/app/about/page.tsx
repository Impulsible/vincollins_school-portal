'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  School, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award,
  Globe,
  Heart,
  Target,
  Lightbulb,
  Shield,
  Users2,
  Phone,
  Mail,
  Star,
  Quote,
  Flag,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'

// ─── Types ──────────────────────────────────────────────────────────────────────
interface SchoolSettings {
  school_name: string
  school_motto: string
  school_phone: string
  school_email: string
  school_address: string
  logo_path: string
  about_us?: string
  vision?: string
  mission?: string
  values?: string[]
  founded_year?: string
  principal_name?: string
  principal_message?: string
  school_images?: string[]
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

// ─── Bento Feature Card ────────────────────────────────────────────────────────
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  span = "col-span-1"
}: { 
  icon: React.ElementType
  title: string
  description: string
  delay?: number
  span?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      viewport={{ once: true }}
      className={cn(
        "group relative p-8 bg-white rounded-3xl border border-slate-200/80 hover:border-[#0A2472]/30 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col justify-between overflow-hidden",
        span
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#0A2472]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-[#C9A84C]/5 to-transparent rounded-bl-full pointer-events-none" />
      
      <div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A2472]/10 to-[#0A2472]/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#0A2472] group-hover:to-[#1A3A8A] transition-all duration-300">
          <Icon className="h-6 w-6 text-[#0A2472] group-hover:text-white transition-colors duration-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0A2472] mt-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        Learn more <ArrowRight className="h-3.5 w-3.5" />
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

// ─── Value Card ────────────────────────────────────────────────────────────────
function ValueCard({ title, description, icon: Icon }: { title: string; description: string; icon: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-150 hover:border-[#C9A84C]/30 transition-all duration-300 hover:shadow-lg hover:shadow-slate-100/80"
    >
      <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-5 w-5 text-[#0A2472]" />
      </div>
      <div>
        <h4 className="font-bold text-slate-800 text-base">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed mt-1">{description}</p>
      </div>
    </motion.div>
  )
}

// ─── Interactive Image Gallery ─────────────────────────────────────────────────
function ImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Main Image Viewport */}
      <div className="relative rounded-3xl overflow-hidden aspect-video shadow-2xl shadow-slate-200 bg-slate-100 border border-slate-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={images[activeIndex]}
              alt="School Campus Life"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1000px"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <span className="text-white/90 text-sm font-medium tracking-wide uppercase backdrop-blur-md bg-black/30 px-4 py-2 rounded-full border border-white/10">
            School Highlights
          </span>
          <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md bg-black/30 border border-white/10">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      </div>
      
      {/* Interactive Thumbnails */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative rounded-2xl overflow-hidden aspect-video bg-slate-100 transition-all duration-300",
              activeIndex === index 
                ? "ring-4 ring-[#0A2472] ring-offset-2 scale-95" 
                : "opacity-60 hover:opacity-100 hover:scale-[1.02]"
            )}
          >
            <Image
              src={img}
              alt={`Gallery thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, 200px"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function AboutPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)

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

  const schoolName = settings?.school_name || 'Vincollins Schools'
  const motto = settings?.school_motto || 'Geared Towards Excellence'
  const phone = settings?.school_phone || '+234 907 082 9999'
  const email = settings?.school_email || 'vincollinsschools@gmail.com'
  const address = settings?.school_address || '7/9 Lawani Street, off Ishaga Road, Surulere, Lagos'
  const logoPath = settings?.logo_path || '/images/logo.png'
  const aboutUs = settings?.about_us || 'Vincollins Schools is a premier educational institution dedicated to providing quality education that develops the whole child - academically, socially, and spiritually. We are committed to excellence in education, character development, and preparing students for a successful future.'
  const vision = settings?.vision || 'To be a leading educational institution that raises godly, well-rounded, and academically excellent children who will become transformative leaders in their generation.'
  const mission = settings?.mission || 'To provide a nurturing, Christ-centered learning environment that fosters academic excellence, character development, and spiritual growth, equipping students with the skills and values needed for lifelong success.'

  const features = [
    {
      icon: GraduationCap,
      title: 'Academic Rigor',
      description: 'An advanced curriculum formulated to instigate creative analysis, systematic mastery, and academic distinction across global criteria.',
      span: "col-span-1 lg:col-span-2"
    },
    {
      icon: Heart,
      title: 'Character Shaping',
      description: 'Nurturing deep moral foundations, empathetic peer relationships, and global citizenship.',
      span: "col-span-1"
    },
    {
      icon: Users,
      title: 'Eminent Faculty',
      description: 'Qualified and mission-aligned pedagogical guides prioritizing dynamic growth for every child.',
      span: "col-span-1"
    },
    {
      icon: BookOpen,
      title: 'Modern Methodology',
      description: 'State-of-the-art classroom spaces enriched with specialized tech tools, experimental research pathways, and collaborative dynamics.',
      span: "col-span-1 lg:col-span-2"
    },
    {
      icon: Shield,
      title: 'Protective Haven',
      description: 'Rigorous campus protection guidelines ensuring peace of mind for parents and children.',
      span: "col-span-1"
    },
    {
      icon: Award,
      title: 'Recognized Excellence',
      description: 'Consistently pioneering creative curriculum practices that lead to exceptional achievements.',
      span: "col-span-1 lg:col-span-2"
    },
  ]

  const values = [
    { icon: Target, title: 'Uncompromising Excellence', description: 'Consistently demanding elite rigor across both core and creative endeavors.' },
    { icon: Shield, title: 'Absolute Integrity', description: 'Holding our words and actions to clear, honest, and moral principles.' },
    { icon: Users2, title: 'Vibrant Community', description: 'Sustaining dynamic integration between teachers, students, and family guides.' },
    { icon: Lightbulb, title: 'Creative Innovation', description: 'Encouraging bold, experimental problem-solving to master future landscapes.' },
    { icon: Heart, title: 'Faith & Stewardship', description: 'Grounding educational journeys on solid, transformative values.' },
    { icon: Globe, title: 'Altruistic Service', description: 'Directing knowledge toward serving the immediate community and wider world.' },
  ]

  const stats = [
    { value: '15+', label: 'Academic Years', icon: Star },
    { value: '500+', label: 'Elite Scholars', icon: Users2 },
    { value: '35+', label: 'Expert Mentors', icon: School },
    { value: '100%', label: 'Digital Success', icon: Award },
  ]

  const galleryImages = [
    '/images/school-1.jpg',
    '/images/school-2.jpg',
    '/images/school-3.jpg',
    '/images/school-4.jpg',
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mt-6 animate-pulse">
            Loading Institution Details...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-[#0A2472] selection:text-white">
      
      {/* ─── Global Header ───────────────────────────────────────────────────── */}
      <Header />

      {/* ─── Premium Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0A2472] text-white pt-32 md:pt-40 pb-16 md:pb-20 border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(10,36,114,0.8),rgba(26,58,138,0.95))]" />
        
        <div className="container mx-auto px-4 relative z-10 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
                  <Sparkles className="h-3.5 w-3.5" /> Welcome to Our Legacy
                </span>
              </motion.div>

              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white"
                >
                  Inspiring Minds, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] via-[#e5c977] to-[#C9A84C]">
                    Shaping Excellence
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-white/80 text-lg italic tracking-wide"
                >
                  &quot;{motto}&quot;
                </motion.p>
              </div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-slate-200 text-base md:text-lg leading-relaxed max-w-2xl font-light"
              >
                {aboutUs}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 pt-4"
              >
                <Link href="/admission">
                  <button className="group px-8 py-4 bg-[#C9A84C] text-[#0A2472] rounded-full font-bold hover:bg-[#DBC06A] hover:-translate-y-0.5 transition-all shadow-xl hover:shadow-[#C9A84C]/25 flex items-center gap-2">
                    Enroll Your Child <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full font-bold transition-all">
                    Arrange a Visit
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right Interactive Logo/Visual Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-72 h-72 md:w-96 md:h-96"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A84C]/20 to-transparent rounded-full blur-3xl animate-pulse" />
                <div className="absolute inset-4 border border-white/10 rounded-full" />
                <div className="absolute inset-12 border border-white/5 rounded-full" />
                
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  {logoPath ? (
                    <div className="relative w-44 h-44 md:w-56 md:h-56">
                      <Image
                        src={logoPath}
                        alt={schoolName}
                        fill
                        className="object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                        sizes="(max-width: 768px) 180px, 250px"
                      />
                    </div>
                  ) : (
                    <School className="h-32 w-32 text-[#C9A84C] drop-shadow-[0_10px_15px_rgba(10,36,114,0.5)]" />
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Performance Metrics (Stats) ────────────────────────────────── */}
      <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </section>

      {/* ─── Corporate Mandate (Vision & Mission) ─────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-slate-50">
        <DotGridPattern />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Vision Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-6 flex flex-col justify-between bg-gradient-to-br from-[#0A2472] to-[#143085] text-white p-10 rounded-3xl shadow-xl border border-white/5"
            >
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-[#C9A84C]" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight uppercase">Our Vision</h2>
                </div>
                <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed italic">
                  &ldquo;{vision}&rdquo;
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2 text-xs text-[#C9A84C] font-semibold tracking-wider uppercase">
                Developing Next Generation Achievers <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

            {/* Mission Column */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-6 flex flex-col justify-between bg-white p-10 rounded-3xl shadow-xl shadow-slate-100 border border-slate-200/60"
            >
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#0A2472]/5 flex items-center justify-center">
                    <Flag className="h-6 w-6 text-[#0A2472]" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight uppercase text-[#0A2472]">Our Mission</h2>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed italic">
                  &ldquo;{mission}&rdquo;
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 text-xs text-[#0A2472] font-semibold tracking-wider uppercase">
                Rooted in Values, Built on Trust <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── Premium Bento Grid Features ─────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge><Sparkles className="h-3 w-3" /> Core Pillars</Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A2472]">
              What Makes Us Exceptional
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              Through deliberate pedagogical architectures, we orchestrate dynamic, transformational environments for your children.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Principles (Values) ───────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-[#C9A84C]/10 text-[#0A2472] border-[#C9A84C]/20">Ethical Framework</Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0A2472]">
              Values That Guide Us
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              We guide children along structured pathways of growth, laying a foundation of timeless, noble principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {values.map((value, idx) => (
              <ValueCard key={idx} {...value} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Visual Showcase (Gallery) ─────────────────────────────────── */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <Badge>Immersive Glimpse</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A2472]">
                Our World-Class Campus & Life
              </h2>
              <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                Explore a welcoming environment designed to promote active inquiry, creative collaboration, and healthy student development.
              </p>
              
              <ul className="space-y-3 pt-2">
                {['Advanced Learning Spaces', 'Dedicated Sports Areas', 'Modern Science Laboratories', 'Nurturing Playgrounds'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="h-5 w-5 text-[#C9A84C]" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <ImageGallery images={galleryImages} />
            </div>

          </div>
        </div>
      </section>

      {/* ─── Leadership Address (Principal's Message) ────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-200 overflow-hidden">
            <div className="absolute top-0 left-0 w-3 h-full bg-[#0A2472]" />
            
            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Profile Image & Metadata */}
              <div className="md:col-span-5 bg-gradient-to-b from-[#0A2472] to-[#1A3A8A] flex flex-col justify-center items-center p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.1),transparent)]" />
                
                <div className="relative w-40 h-40 rounded-full border-4 border-[#C9A84C]/50 overflow-hidden shadow-2xl mb-6 bg-white/10">
                  <span className="text-7xl absolute inset-0 flex items-center justify-center filter drop-shadow-md select-none">
                    👩‍🏫
                  </span>
                </div>
                
                <h3 className="font-bold text-xl text-white tracking-wide">Mrs. Joy Adaobi Nnoli</h3>
                <p className="text-[#C9A84C] text-sm uppercase font-semibold tracking-widest mt-1">Proprietress</p>
              </div>

              {/* Message Content */}
              <div className="md:col-span-7 p-10 md:p-14 flex flex-col justify-center relative">
                <Quote className="absolute top-8 right-8 h-20 w-20 text-slate-100 -z-0 pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-2xl font-bold text-[#0A2472] tracking-tight">Our Commitment to Your Child</h3>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base italic">
                    &quot;Welcome to Vincollins Schools, where we are committed to nurturing the whole child - academically, spiritually, and socially. Our dedicated team of educators works tirelessly to create a learning environment that inspires excellence and builds character.&quot;
                  </p>
                  
                  <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    We believe every child is unique and has the potential to excel. Our goal is to unlock that potential and prepare our students to be confident, responsible, and successful individuals in a rapidly changing world.
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#0A2472]">Mrs. Joy Adaobi Nnoli</p>
                      <p className="text-xs text-slate-400 font-medium">Founder & Proprietress</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── Enrollment Push (CTA) ────────────────────────────────────────── */}
      <section className="relative py-20 bg-[#0A2472] text-white overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,76,0.12),transparent_50%)]" />
        
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10 space-y-8">
          <Badge className="bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20">Admissions Ongoing</Badge>
          
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Ready to Join Vincollins Schools?
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto leading-relaxed text-base md:text-lg font-light">
              Give your child the gift of a quality education in a highly nurturing, academically rich learning environment.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/admission">
              <button className="px-8 py-4 bg-[#C9A84C] text-[#0A2472] rounded-full font-bold hover:bg-[#DBC06A] transition-all hover:scale-105 shadow-xl hover:shadow-[#C9A84C]/20">
                Begin Application Now
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-full font-bold hover:bg-white/10 transition-all">
                Schedule a Private Tour
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Premium Footer ──────────────────────────────────────────────── */}
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