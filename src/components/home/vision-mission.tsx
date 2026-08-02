/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
// src/components/home/vision-mission.tsx
'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Eye,
  Target,
  Sparkles,
  Quote,
  ArrowUpRight,
} from 'lucide-react'

export const VisionMission = () => {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 md:py-28">

      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2472] via-slate-950 to-[#0A2472]" />
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute -right-32 bottom-20 h-[450px] w-[450px] rounded-full bg-amber-500/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
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
          <div className="mb-5 flex justify-center">
            <span className="block h-[3px] w-14 rounded-full bg-[#F5A623]" />
          </div>

          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#F5A623] sm:text-xs">
            Our Purpose
          </p>

          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Vision &{' '}
            <span className="italic text-[#F5A623]">Mission</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
            At Vincollins Schools, we believe that a happy child is a
            successful one — and it all starts with purpose.
          </p>
        </motion.div>

        {/* ── Two-column cards ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">

          {/* ═════════ VISION CARD ═════════ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative"
          >
            <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/30 sm:p-10">

              {/* Corner glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl transition-opacity duration-500 group-hover:bg-blue-500/40" />

              {/* Large decorative icon */}
              <Eye className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-white/[0.03]" strokeWidth={1} />

              {/* Content */}
              <div className="relative">
                {/* Icon + label */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 ring-4 ring-blue-500/10">
                    <Eye className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-300">
                      Where We're Going
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                      Our Vision
                    </h3>
                  </div>
                </div>

                {/* Quote mark */}
                <Quote className="mb-3 h-8 w-8 text-blue-400/40" />

                {/* Vision text */}
                <p className="text-base leading-8 text-white/80 sm:text-lg">
                  We are committed to providing a positive, safe and stimulating
                  environment for children to learn, where all are valued. We
                  intend that all children should enjoy their learning, achieve
                  their potential and become{' '}
                  <span className="font-semibold text-[#F5A623]">
                    independent life-long learners
                  </span>.
                </p>

                {/* Divider */}
                <div className="my-6 h-px bg-gradient-to-r from-white/10 via-white/20 to-transparent" />

                {/* Bottom tag */}
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-300" />
                  <span className="text-xs font-medium text-white/60">
                    A future built on curiosity and confidence
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═════════ MISSION CARD ═════════ */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/30 sm:p-10">

              {/* Corner glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl transition-opacity duration-500 group-hover:bg-amber-500/40" />

              {/* Large decorative icon */}
              <Target className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 text-white/[0.03]" strokeWidth={1} />

              {/* Content */}
              <div className="relative">
                {/* Icon + label */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 ring-4 ring-amber-500/10">
                    <Target className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300">
                      How We Get There
                    </p>
                    <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                      Our Mission
                    </h3>
                  </div>
                </div>

                {/* Motto — hero style */}
                <div className="mb-5 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/70">
                    Our Motto
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
                    Dream · Believe ·{' '}
                    <span className="italic text-[#F5A623]">Achieve</span>
                  </p>
                </div>

                {/* Mission text */}
                <p className="text-base leading-8 text-white/80 sm:text-lg">
                  We aim to ensure that every student at our school is provided
                  with{' '}
                  <span className="font-semibold text-[#F5A623]">
                    high-quality learning experiences
                  </span>{' '}
                  based on a broad, balanced and future-ready curriculum.
                </p>

                {/* Divider */}
                <div className="my-6 h-px bg-gradient-to-r from-white/10 via-white/20 to-transparent" />

                {/* Bottom tag */}
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-amber-300" />
                  <span className="text-xs font-medium text-white/60">
                    Growing every child to their fullest potential
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Bottom quote strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto mt-12 max-w-3xl text-center md:mt-14"
        >
          <p className="font-serif text-xl italic text-white/70 sm:text-2xl">
            "A happy child is a{' '}
            <span className="text-[#F5A623]">successful child</span>."
          </p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.25em] text-white/40">
            — Vincollins Schools Philosophy
          </p>
        </motion.div>

      </div>
    </section>
  )
}