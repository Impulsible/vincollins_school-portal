// src/components/home/why-choose.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  School,
  Laptop,
  Heart,
  Star,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

type Reason = {
  number: string
  icon: React.ElementType
  title: string
  description: string
  color: string
  bg: string
  ring: string
  gradient: string
}

const reasons: Reason[] = [
  {
    number: '01',
    icon: Shield,
    title: 'Qualified Teachers',
    description:
      "Experienced educators dedicated to nurturing every child's unique potential.",
    color: 'text-blue-600',
    bg: 'bg-blue-50 group-hover:bg-blue-100',
    ring: 'ring-blue-100',
    gradient: 'from-blue-500/10 to-transparent',
  },
  {
    number: '02',
    icon: School,
    title: 'Safe Environment',
    description:
      'A secure, welcoming and supportive atmosphere for learning and growth.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 group-hover:bg-emerald-100',
    ring: 'ring-emerald-100',
    gradient: 'from-emerald-500/10 to-transparent',
  },
  {
    number: '03',
    icon: Laptop,
    title: 'Modern Classrooms',
    description:
      'Technology-integrated learning spaces built for 21st-century education.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 group-hover:bg-violet-100',
    ring: 'ring-violet-100',
    gradient: 'from-violet-500/10 to-transparent',
  },
  {
    number: '04',
    icon: Heart,
    title: 'ICT Integration',
    description:
      'Digital literacy programmes preparing pupils for the future.',
    color: 'text-pink-600',
    bg: 'bg-pink-50 group-hover:bg-pink-100',
    ring: 'ring-pink-100',
    gradient: 'from-pink-500/10 to-transparent',
  },
  {
    number: '05',
    icon: Star,
    title: 'Character Building',
    description:
      'Building strong moral values, discipline and leadership skills.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 group-hover:bg-amber-100',
    ring: 'ring-amber-100',
    gradient: 'from-amber-500/10 to-transparent',
  },
  {
    number: '06',
    icon: Award,
    title: 'Academic Excellence',
    description:
      'A proven track record of outstanding academic performance and results.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 group-hover:bg-indigo-100',
    ring: 'ring-indigo-100',
    gradient: 'from-indigo-500/10 to-transparent',
  },
]

export const WhyChoose = () => {
  return (
    <section className="relative isolate overflow-hidden bg-white py-20 md:py-28">

      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-50 opacity-70 blur-[120px]" />
        <div className="absolute -right-32 bottom-20 h-[450px] w-[450px] rounded-full bg-amber-50 opacity-60 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(#0A2472 1px, transparent 1px),
                              linear-gradient(90deg, #0A2472 1px, transparent 1px)`,
            backgroundSize: '52px 52px',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ══════════ SPLIT HERO: Image + Header text ══════════ */}
        <div className="mb-14 grid items-center gap-10 lg:mb-20 lg:grid-cols-2 lg:gap-16">

          {/* ── Left: Image with floating stat ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            {/* Dot grid decoration */}
            <div
              className="absolute -left-6 -top-6 -z-10 h-32 w-32 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #F5A623 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />

            {/* Amber accent frame (behind image) */}
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] bg-gradient-to-br from-[#F5A623]/30 to-[#0A2472]/20" />

            {/* Main image — LANDSCAPE 3:2 matches your photo natively (no blur, no crop) */}
            <div
              className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
              style={{ aspectRatio: '3 / 2' }}
            >
              <Image
                src="/images/why-choose.png"
                alt="Vincollins School teacher engaging with pupils in the classroom"
                fill
                quality={95}
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
                className="object-cover object-center"
              />

              {/* Subtle bottom fade for caption readability */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900/75 via-slate-900/25 to-transparent" />

              {/* Caption inside image */}
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F5A623] drop-shadow-md">
                  Vincollins Schools
                </p>
                <p className="mt-1 font-serif text-lg font-semibold text-white drop-shadow-lg sm:text-xl">
                  Excellence in every classroom
                </p>
              </div>
            </div>

            {/* Floating card — Award (top left) */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: -10 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute -left-4 -top-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.15)] sm:-left-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <Award className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Award Winning</p>
                  <p className="text-[11px] text-slate-500">Since 2010</p>
                </div>
              </div>
            </motion.div>

            {/* Floating card — Rating (bottom right) */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -right-4 -bottom-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.15)] sm:-right-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-lg font-bold text-slate-900">4.9</p>
                    <p className="text-xs text-slate-500">/ 5.0</p>
                  </div>
                  <p className="text-[11px] text-slate-500">Parent Rating</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Section header ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            {/* Accent bar */}
            <div className="mb-5 flex">
              <span className="block h-[3px] w-14 rounded-full bg-[#F5A623]" />
            </div>

            {/* Tagline */}
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#F5A623] sm:text-xs">
              Why Choose Us
            </p>

            {/* Heading */}
            <h2 className="font-serif text-3xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Why Families Choose{' '}
              <span className="italic text-[#0A2472]">Vincollins</span>
            </h2>

            {/* Sub-heading */}
            <p className="mt-6 text-base leading-8 text-slate-500 sm:text-lg">
              We provide a nurturing environment where every child can thrive
              academically, socially and emotionally — building the foundation
              for a lifetime of success.
            </p>

            {/* Quick stats row */}
            <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <div>
                <p className="font-serif text-2xl font-bold text-[#0A2472]">15+</p>
                <p className="text-[11px] text-slate-500">Years Experience</p>
              </div>
              <div className="border-x border-slate-200 px-4">
                <p className="font-serif text-2xl font-bold text-[#0A2472]">98%</p>
                <p className="text-[11px] text-slate-500">Parent Satisfaction</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-[#0A2472]">A+</p>
                <p className="text-[11px] text-slate-500">Academic Grade</p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/about">
                <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0A2472] px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(10,36,114,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0d2d8f] hover:shadow-[0_14px_36px_rgba(10,36,114,0.35)] sm:w-auto">
                  <Sparkles className="h-4 w-4 text-[#F5A623]" />
                  Learn About Us
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </motion.div>

        </div>

        {/* ══════════ REASONS GRID ══════════ */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: 'easeOut',
                }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)] sm:p-7">

                  {/* Gradient reveal on hover */}
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${reason.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  {/* Corner glow */}
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${reason.gradient} opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-80`}
                  />

                  {/* Content */}
                  <div className="relative">
                    {/* Number + Icon row */}
                    <div className="mb-5 flex items-start justify-between">
                      {/* Big number */}
                      <span
                        className={`font-serif text-4xl font-bold leading-none opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${reason.color}`}
                      >
                        {reason.number}
                      </span>

                      {/* Icon */}
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-4 transition-all duration-300 ${reason.bg} ${reason.ring}`}
                      >
                        <Icon className={`h-6 w-6 ${reason.color}`} />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-lg font-bold text-slate-900 sm:text-xl">
                      {reason.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}