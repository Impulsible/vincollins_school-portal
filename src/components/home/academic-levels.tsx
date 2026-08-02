/* eslint-disable react/no-unescaped-entities */
// src/components/home/academic-levels.tsx
'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Baby,
  BookOpen,
  Laptop,
  GraduationCap,
  ArrowRight,
  Clock,
  Users,
  Sparkles,
} from 'lucide-react'

type Level = {
  number: string
  title: string
  subtitle: string
  description: string
  icon: React.ElementType
  features: string[]
  ageRange: string
  classSize: string
  // Color theme
  accent:   string  // main accent (text)
  iconBg:   string  // icon container bg
  iconRing: string  // decorative ring color
  gradient: string  // subtle gradient overlay
  border:   string  // active border color
  dot:      string  // feature bullet dot
}

const levels: Level[] = [
  {
    number: '01',
    title: 'Crèche / Playgroup',
    subtitle: 'Early Childhood Development',
    description:
      'A safe, secure and nurturing space where our youngest learners begin their journey through play, discovery and gentle care.',
    icon: Baby,
    features: ['Play-based learning', 'Safe environment', 'Social skills'],
    ageRange: 'Below 3 years',
    classSize: 'Max 12 pupils',
    accent:   'text-pink-600',
    iconBg:   'bg-pink-50 group-hover:bg-pink-100',
    iconRing: 'ring-pink-100',
    gradient: 'from-pink-500/10 via-pink-500/5 to-transparent',
    border:   'group-hover:border-pink-200',
    dot:      'bg-pink-500',
  },
  {
    number: '02',
    title: 'Nursery',
    subtitle: 'Foundation Stage',
    description:
      'A curriculum full of rhymes, activities and real-life experiences that inspire creativity, curiosity and confidence in early learners.',
    icon: BookOpen,
    features: ['Rhymes & activities', 'Creative arts', 'Early literacy'],
    ageRange: '3 – 5 years',
    classSize: 'Max 20 pupils',
    accent:   'text-emerald-600',
    iconBg:   'bg-emerald-50 group-hover:bg-emerald-100',
    iconRing: 'ring-emerald-100',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    border:   'group-hover:border-emerald-200',
    dot:      'bg-emerald-500',
  },
  {
    number: '03',
    title: 'Primary',
    subtitle: 'Building Strong Foundations',
    description:
      'Fundamental skills in reading, writing and mathematics — building a solid academic foundation with character and confidence.',
    icon: Laptop,
    features: ['Core academics', 'Character building', 'STEM introduction'],
    ageRange: 'Primary 1 – 6',
    classSize: 'Max 25 pupils',
    accent:   'text-blue-600',
    iconBg:   'bg-blue-50 group-hover:bg-blue-100',
    iconRing: 'ring-blue-100',
    gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    border:   'group-hover:border-blue-200',
    dot:      'bg-blue-500',
  },
  {
    number: '04',
    title: 'College',
    subtitle: 'Secondary Education',
    description:
      'A challenging, balanced curriculum that prepares young adults for the modern world — blending tradition with innovation.',
    icon: GraduationCap,
    features: ['Challenging curriculum', 'Balanced education', 'Future ready'],
    ageRange: 'JSS 1 – SSS 3',
    classSize: 'Max 30 pupils',
    accent:   'text-amber-600',
    iconBg:   'bg-amber-50 group-hover:bg-amber-100',
    iconRing: 'ring-amber-100',
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    border:   'group-hover:border-amber-200',
    dot:      'bg-amber-500',
  },
]

export const AcademicLevels = () => {
  return (
    <section className="relative isolate overflow-hidden bg-slate-50/50 py-20 md:py-28">

      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-40 h-[500px] w-[500px] rounded-full bg-blue-50 opacity-60 blur-[120px]" />
        <div className="absolute -right-32 bottom-40 h-[450px] w-[450px] rounded-full bg-amber-50 opacity-60 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#0A2472 1px, transparent 1px),
                              linear-gradient(90deg, #0A2472 1px, transparent 1px)`,
            backgroundSize: '52px 52px',
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
          className="mx-auto mb-14 max-w-2xl text-center md:mb-16"
        >
          {/* Accent bar */}
          <div className="mb-5 flex justify-center">
            <span className="block h-[3px] w-14 rounded-full bg-[#F5A623]" />
          </div>

          {/* Tagline */}
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#F5A623] sm:text-xs">
            Academic Programmes
          </p>

          {/* Heading */}
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Our Learning{' '}
            <span className="italic text-[#0A2472]">Pathways</span>
          </h2>

          {/* Sub-heading */}
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            A carefully designed journey that grows with your child — from
            their first steps in playgroup to their final year of college.
          </p>
        </motion.div>

        {/* ── Journey progress bar (desktop only) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8 hidden lg:block"
        >
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-pink-200 via-emerald-200 to-amber-200" />
            <div className="relative flex items-center justify-between">
              {levels.map((l) => (
                <div key={l.number} className="flex flex-col items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${l.dot} ring-4 ring-white`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${l.accent}`}>
                    Stage {l.number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Level cards grid ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {levels.map((level, index) => {
            const Icon = level.icon
            return (
              <motion.div
                key={level.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: 'easeOut',
                }}
                className="group relative"
              >
                {/* Card */}
                <div className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)] ${level.border} sm:p-7`}>

                  {/* Gradient reveal on hover */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${level.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  {/* Corner glow */}
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${level.gradient} opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-80`}
                  />

                  {/* ── Content ── */}
                  <div className="relative flex h-full flex-col">

                    {/* Number + Icon row */}
                    <div className="mb-6 flex items-start justify-between">
                      {/* Level number */}
                      <div>
                        <span className={`font-serif text-5xl font-bold leading-none ${level.accent} opacity-25 transition-opacity duration-500 group-hover:opacity-40`}>
                          {level.number}
                        </span>
                      </div>

                      {/* Icon */}
                      <div
                        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-4 transition-all duration-300 ${level.iconBg} ${level.iconRing}`}
                      >
                        <Icon className={`h-7 w-7 ${level.accent}`} />
                      </div>
                    </div>

                    {/* Title + subtitle */}
                    <h3 className="font-serif text-xl font-bold text-slate-900 sm:text-2xl">
                      {level.title}
                    </h3>
                    <p className={`mt-1 text-sm font-semibold ${level.accent}`}>
                      {level.subtitle}
                    </p>

                    {/* Description */}
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {level.description}
                    </p>

                    {/* Features list */}
                    <ul className="mt-5 space-y-2">
                      {level.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2.5 text-xs text-slate-600 sm:text-sm"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${level.dot}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Spacer to push footer down */}
                    <div className="flex-1" />

                    {/* Divider */}
                    <div className="my-5 h-px bg-slate-100" />

                    {/* Info footer — age & class size */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{level.ageRange}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{level.classSize}</span>
                      </div>
                    </div>

                    {/* Learn more link */}
                    <Link
                      href={`/programmes/${level.title.toLowerCase().replace(/[\s/]+/g, '-')}`}
                      className={`mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${level.accent} transition-all hover:gap-2.5`}
                    >
                      Learn More
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Bottom CTA banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-14 md:mt-16"
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-[#0A2472] to-[#153d96] p-8 shadow-[0_20px_60px_rgba(10,36,114,0.20)] md:p-10">

            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F5A623]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-[#F5A623]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                    Personalised Journey
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                  Not sure which level suits your child?
                </h3>
                <p className="mt-2 text-sm text-white/70 sm:text-base">
                  Book a free consultation with our academic team — we'll help
                  you find the perfect programme for your child's age and stage.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-shrink-0">
                <Link href="/contact">
                  <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#F5A623] to-amber-500 px-7 py-3.5 text-sm font-bold text-slate-900 shadow-[0_10px_30px_rgba(245,166,35,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(245,166,35,0.5)] sm:w-auto">
                    Book Consultation
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </Link>

                <Link href="/programmes">
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/10 sm:w-auto">
                    View All Programmes
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}