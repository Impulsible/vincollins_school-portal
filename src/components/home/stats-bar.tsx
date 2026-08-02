/* eslint-disable react/no-unescaped-entities */
// src/components/home/stats-bar.tsx
'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { Users, School, GraduationCap, Award, TrendingUp } from 'lucide-react'
import { useEffect, useRef } from 'react'

// ── Types ─────────────────────────────────────────────────────────────
type Stat = {
  icon: React.ElementType
  value: number
  suffix: string
  label: string
  description: string
  color: string
  iconBg: string
  gradient: string
}

// ── Data ──────────────────────────────────────────────────────────────
const stats: Stat[] = [
  {
    icon: Users,
    value: 500,
    suffix: '+',
    label: 'Happy Pupils',
    description: 'Enrolled and thriving',
    color: 'text-blue-600',
    iconBg: 'bg-blue-50 group-hover:bg-blue-100',
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
  },
  {
    icon: School,
    value: 4,
    suffix: '',
    label: 'Academic Levels',
    description: 'Nursery to Primary 6',
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-50 group-hover:bg-emerald-100',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
  },
  {
    icon: GraduationCap,
    value: 35,
    suffix: '+',
    label: 'Expert Teachers',
    description: 'Qualified and dedicated',
    color: 'text-violet-600',
    iconBg: 'bg-violet-50 group-hover:bg-violet-100',
    gradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
  },
  {
    icon: Award,
    value: 15,
    suffix: '+',
    label: 'Years of Excellence',
    description: 'Trusted since 2010',
    color: 'text-amber-600',
    iconBg: 'bg-amber-50 group-hover:bg-amber-100',
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
  },
]

// ── Animated counter component ────────────────────────────────────────
const AnimatedCounter = ({
  value,
  suffix,
  inView,
}: {
  value: number
  suffix: string
  inView: boolean
}) => {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, value, {
      duration: 2,
      ease: 'easeOut',
    })
    return controls.stop
  }, [inView, value, count])

  useEffect(() => {
    return rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${latest}${suffix}`
      }
    })
  }, [rounded, suffix])

  return <span ref={ref}>0{suffix}</span>
}

// ── Component ─────────────────────────────────────────────────────────
export const StatsBar = () => {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-white py-20 md:py-24"
    >

      {/* ── Subtle background decoration ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft blobs */}
        <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-blue-50 opacity-60 blur-[100px]" />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-amber-50 opacity-60 blur-[100px]" />

        {/* Faint grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(#0A2472 1px, transparent 1px),
                              linear-gradient(90deg, #0A2472 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          {/* Accent bar */}
          <div className="mb-5 flex justify-center">
            <span className="block h-[3px] w-14 rounded-full bg-[#F5A623]" />
          </div>

          {/* Small tagline */}
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#F5A623] sm:text-xs">
            Our Impact
          </p>

          {/* Heading */}
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Numbers That Tell{' '}
            <span className="italic text-[#0A2472]">Our Story</span>
          </h2>

          {/* Sub-heading */}
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            More than a decade of excellence, growth and dedication to shaping
            young minds for a brighter tomorrow.
          </p>
        </motion.div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)] sm:p-7">

                  {/* Gradient background — appears on hover */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  {/* Content */}
                  <div className="relative">
                    {/* Icon + trend indicator */}
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${stat.iconBg}`}
                      >
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>

                      {/* Small trend badge */}
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                        <span className="text-[10px] font-semibold text-emerald-600">
                          Growing
                        </span>
                      </div>
                    </div>

                    {/* Animated counter */}
                    <div className="mb-2">
                      <div className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        <AnimatedCounter
                          value={stat.value}
                          suffix={stat.suffix}
                          inView={isInView}
                        />
                      </div>
                    </div>

                    {/* Label */}
                    <p className="text-sm font-semibold text-slate-900 sm:text-base">
                      {stat.label}
                    </p>

                    {/* Description */}
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {stat.description}
                    </p>
                  </div>

                  {/* Decorative corner accent */}
                  <div
                    className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-70`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Bottom trust line ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3"
        >
          <div className="flex -space-x-2">
            {['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'].map((c, i) => (
              <div
                key={i}
                className={`h-8 w-8 rounded-full border-2 border-white ${c}`}
              />
            ))}
          </div>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">Join 500+ families</span>
            {' '}who trust Vincollins with their children's education
          </p>
        </motion.div>

      </div>
    </section>
  )
}