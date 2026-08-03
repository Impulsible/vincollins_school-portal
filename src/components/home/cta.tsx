/* eslint-disable react/no-unescaped-entities */
// src/components/home/cta.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

const benefits = [
  'Small class sizes for personalised attention',
  'Qualified & experienced primary school teachers',
  'Safe, secure and nurturing environment',
  'Digital reports & regular parent updates',
]

const makeAnim = (delay: number) => ({
  initial:    { opacity: 0, y: 24 },
  whileInView:{ opacity: 1, y: 0  },
  viewport:   { once: true, margin: '-80px' },
  transition: { duration: 0.65, delay, ease: 'easeOut' as const },
})

export const CTA = () => {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 md:py-28">

      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2472] via-slate-950 to-[#0A2472]" />
        <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute -right-32 bottom-10 h-[450px] w-[450px] rounded-full bg-amber-500/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

          {/* ═════════ LEFT — Text content ═════════ */}
          <div>

            {/* Accent bar */}
            <motion.div {...makeAnim(0)}>
              <span className="mb-5 inline-block h-[3px] w-14 rounded-full bg-[#F5A623]" />
            </motion.div>

            {/* Tagline */}
            <motion.p
              {...makeAnim(0.05)}
              className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#F5A623] sm:text-xs"
            >
              Admissions Open
            </motion.p>

            {/* Main heading */}
            <motion.h2
              {...makeAnim(0.12)}
              className="font-serif text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Ready to Enroll Your{' '}
              <span className="italic text-[#F5A623]">Child?</span>
            </motion.h2>

            {/* Body */}
            <motion.p
              {...makeAnim(0.2)}
              className="mt-6 text-base leading-8 text-white/70 sm:text-lg"
            >
              Join the Vincollins Schools family and give your child the gift
              of quality education geared towards excellence. Our doors are
              open — let's build their bright future together.
            </motion.p>

            {/* Benefits checklist */}
            <motion.ul
              {...makeAnim(0.28)}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2.5 text-sm text-white/80"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F5A623]" />
                  <span>{b}</span>
                </li>
              ))}
            </motion.ul>

            {/* CTA buttons */}
            <motion.div
              {...makeAnim(0.36)}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link href="/admissions" className="w-full sm:w-auto">
                <button className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#F5A623] to-amber-500 px-8 py-4 text-sm font-bold text-slate-900 shadow-[0_10px_40px_rgba(245,166,35,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(245,166,35,0.55)] sm:w-auto">
                  <Sparkles className="h-4 w-4" />
                  Enroll Now
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/contact" className="w-full sm:w-auto">
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 sm:w-auto">
                  <Calendar className="h-4 w-4" />
                  Book a School Tour
                </button>
              </Link>
            </motion.div>

            {/* Quick contact strip */}
            <motion.div
              {...makeAnim(0.44)}
              className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:gap-8"
            >
              <Link
                href="tel:+2348001234567"
                className="group flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 transition-colors group-hover:bg-emerald-500/25">
                  <Phone className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Call us
                  </p>
                  <p className="font-medium">+234 907 082 9999</p>
                </div>
              </Link>

              <Link
                href="mailto:vincollinsschools@gmail.com"
                className="group flex items-center gap-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 transition-colors group-hover:bg-amber-500/25">
                  <Mail className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Email us
                  </p>
                  <p className="font-medium">vincollinsschools@gmail.com</p>
                </div>
              </Link>
            </motion.div>

          </div>

          {/* ═════════ RIGHT — Photo only (no floating cards) ═════════ */}
          <motion.div
            {...makeAnim(0.2)}
            className="relative"
          >
            {/* Dot grid — top right decoration */}
            <div
              className="absolute -right-6 -top-6 -z-10 h-32 w-32 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #F5A623 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />

            {/* Dot grid — bottom left decoration */}
            <div
              className="absolute -bottom-6 -left-6 -z-10 h-28 w-28 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #60A5FA 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />

            {/* Amber accent frame (behind image) */}
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] bg-gradient-to-br from-[#F5A623]/25 to-blue-500/10" />

            {/* Main image container — LANDSCAPE 3:2 matches your photo natively */}
            <div
              className="relative overflow-hidden rounded-[2rem] border-4 border-white/20 bg-slate-800 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
              style={{ aspectRatio: '3 / 2' }}
            >
              <Image
                src="/images/cta.jpg"
                alt="Vincollins School pupils learning happily"
                fill
                quality={95}
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
                className="object-cover object-center"
              />

              {/* Subtle bottom fade for caption */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

              {/* Caption inside image */}
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F5A623] drop-shadow-md">
                  Vincollins Schools
                </p>
                <p className="mt-1 font-serif text-lg font-semibold text-white drop-shadow-lg sm:text-xl">
                  Building bright futures, one child at a time
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}