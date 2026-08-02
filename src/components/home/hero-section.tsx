// src/components/home/hero-section.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const makeAnim = (delay: number) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
})

export const HeroSection = () => {
  return (
    <>
      {/* ── Announcement bar ── */}
      <div className="relative z-30 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          <p className="text-xs font-semibold tracking-wide text-white sm:text-sm">
            <span className="sm:hidden">Admissions Open · 2025/2026</span>
            <span className="hidden sm:inline">Admissions Open for Academic Year 2025/2026</span>
          </p>
          <Link
            href="/admissions"
            className="hidden items-center gap-1 text-xs font-bold text-white underline-offset-4 hover:underline sm:inline-flex"
          >
            Apply Now
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE HERO — Stacked layout (image on top, content below)
          Only visible below lg breakpoint
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full bg-slate-900 lg:hidden">

        {/* Image container — fixed aspect ratio so it never gets cut off */}
        <div className="relative h-[280px] w-full overflow-hidden sm:h-[380px] md:h-[440px]">
          <Image
            src="/images/hero.png"
            alt="Vincollins School pupils actively engaged in classroom learning"
            fill
            priority
            quality={95}
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Bottom fade so it blends into the dark content section below */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        </div>

        {/* Content below the image */}
        <div className="relative px-5 pb-14 pt-6 sm:px-8 sm:pb-16 sm:pt-8">

          {/* Accent bar */}
          <motion.div {...makeAnim(0)} className="mb-4 flex">
            <span className="block h-[3px] w-12 rounded-full bg-[#F5A623]" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            {...makeAnim(0.08)}
            className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em] text-[#F5A623] sm:text-xs sm:tracking-[0.28em]"
          >
            Primary Education · Est. 2010
          </motion.p>

          {/* Main heading */}
          <motion.h1
            {...makeAnim(0.16)}
            className="font-serif text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Where Every Child
            <span className="mt-1 block">
              Discovers{' '}
              <span className="italic text-[#F5A623]">Their Best</span>
            </span>
          </motion.h1>

          {/* Sub-heading */}
          <motion.p
            {...makeAnim(0.26)}
            className="mt-5 max-w-xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8"
          >
            Nurturing confident learners with strong values, quality teaching
            and modern learning at Vincollins Schools.
          </motion.p>

          {/* CTA buttons — full width, stacked */}
          <motion.div
            {...makeAnim(0.36)}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link href="/about" className="w-full sm:w-auto">
              <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition-all duration-300 hover:bg-slate-50 sm:w-auto">
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>

            <Link href="/portal/login" className="w-full sm:w-auto">
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/60 hover:bg-white/20 sm:w-auto">
                Login to Portal
              </button>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            {...makeAnim(0.44)}
            className="mt-6 text-xs text-white/60"
          >
            Trusted by 500+ families since 2010
          </motion.p>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          DESKTOP HERO — Untouched original design
          Only visible at lg breakpoint and above
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative isolate hidden w-full overflow-hidden bg-slate-900 lg:block">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero.png"
            alt="Vincollins School pupils actively engaged in classroom learning"
            fill
            priority
            quality={95}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/20 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl items-center px-8">

          {/* Right-aligned column */}
          <div className="ml-auto w-full max-w-xl text-right">

            {/* Accent bar */}
            <motion.div {...makeAnim(0)} className="mb-5 flex justify-end">
              <span className="block h-[3px] w-14 rounded-full bg-[#F5A623]" />
            </motion.div>

            {/* Tagline */}
            <motion.p
              {...makeAnim(0.08)}
              className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#F5A623]"
            >
              Primary Education · Est. 2010
            </motion.p>

            {/* Main heading */}
            <motion.h1
              {...makeAnim(0.16)}
              className="font-serif text-[3.75rem] font-bold leading-[1.05] tracking-tight text-white drop-shadow-lg"
            >
              Where Every Child
              <span className="mt-1 block">
                Discovers{' '}
                <span className="italic text-[#F5A623]">Their Best</span>
              </span>
            </motion.h1>

            {/* Sub-heading */}
            <motion.p
              {...makeAnim(0.26)}
              className="ml-auto mt-6 max-w-lg text-lg leading-8 text-white/90 drop-shadow"
            >
              Nurturing confident learners with strong values, quality teaching
              and modern learning at Vincollins Schools.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              {...makeAnim(0.36)}
              className="mt-9 flex flex-wrap items-center justify-end gap-3"
            >
              <Link href="/about">
                <button className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_14px_36px_rgba(0,0,0,0.32)]">
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/portal/login">
                <button className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/15">
                  Login to Portal
                </button>
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.p
              {...makeAnim(0.44)}
              className="mt-6 text-right text-xs text-white/60"
            >
              Trusted by 500+ families since 2010
            </motion.p>

          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-white/60"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em]">
              Scroll
            </span>
            <div className="h-8 w-[1px] bg-gradient-to-b from-white/60 to-transparent" />
          </motion.div>
        </motion.div>

      </section>
    </>
  )
}