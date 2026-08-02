/* eslint-disable react/no-unescaped-entities */
// src/components/home/values.tsx
'use client'

import { motion } from 'framer-motion'
import {
  Heart,
  Shield,
  Target,
  Star,
  Compass,
  Gem,
  Sparkles,
} from 'lucide-react'

type Value = {
  icon: React.ElementType
  letter: string
  title: string
  description: string
  color: string
  bg: string
  ring: string
  gradient: string
  border: string
}

const values: Value[] = [
  {
    icon: Heart,
    letter: 'R',
    title: 'Respect',
    description: 'Treating others with dignity and consideration.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 group-hover:bg-rose-100',
    ring: 'ring-rose-100',
    gradient: 'from-rose-500/10 to-transparent',
    border: 'group-hover:border-rose-200',
  },
  {
    icon: Shield,
    letter: 'R',
    title: 'Responsibility',
    description: 'Taking ownership of actions and duties.',
    color: 'text-blue-600',
    bg: 'bg-blue-50 group-hover:bg-blue-100',
    ring: 'ring-blue-100',
    gradient: 'from-blue-500/10 to-transparent',
    border: 'group-hover:border-blue-200',
  },
  {
    icon: Target,
    letter: 'R',
    title: 'Resilience',
    description: 'Bouncing back from challenges with strength.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 group-hover:bg-emerald-100',
    ring: 'ring-emerald-100',
    gradient: 'from-emerald-500/10 to-transparent',
    border: 'group-hover:border-emerald-200',
  },
  {
    icon: Star,
    letter: 'A',
    title: 'Aspiration',
    description: 'Setting high goals and striving for excellence.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 group-hover:bg-amber-100',
    ring: 'ring-amber-100',
    gradient: 'from-amber-500/10 to-transparent',
    border: 'group-hover:border-amber-200',
  },
  {
    icon: Compass,
    letter: 'I',
    title: 'Independence',
    description: 'Thinking critically and acting confidently.',
    color: 'text-violet-600',
    bg: 'bg-violet-50 group-hover:bg-violet-100',
    ring: 'ring-violet-100',
    gradient: 'from-violet-500/10 to-transparent',
    border: 'group-hover:border-violet-200',
  },
  {
    icon: Gem,
    letter: 'K',
    title: 'Kindness',
    description: 'Showing compassion and empathy to others.',
    color: 'text-pink-600',
    bg: 'bg-pink-50 group-hover:bg-pink-100',
    ring: 'ring-pink-100',
    gradient: 'from-pink-500/10 to-transparent',
    border: 'group-hover:border-pink-200',
  },
]

// ✅ THIS is the named export — make sure this line exists
export const Values = () => {
  return (
    <section className="relative isolate overflow-hidden bg-white py-20 md:py-28">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-blue-50 opacity-60 blur-[110px]" />
        <div className="absolute -right-32 bottom-20 h-[450px] w-[450px] rounded-full bg-amber-50 opacity-60 blur-[100px]" />
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

        {/* Header */}
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
            Our Core Values
          </p>

          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            The Values That{' '}
            <span className="italic text-[#0A2472]">Shape Us</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
            Six guiding principles that shape our community and prepare our
            pupils for a lifetime of success and character.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <motion.div
                key={value.title}
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
                <div className={`relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)] ${value.border} sm:p-6`}>

                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${value.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  <span
                    className={`pointer-events-none absolute -top-3 right-2 font-serif text-6xl font-bold leading-none opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.15] ${value.color}`}
                  >
                    {value.letter}
                  </span>

                  <div className="relative flex flex-col items-center">
                    <div
                      className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-4 transition-all duration-300 ${value.bg} ${value.ring}`}
                    >
                      <Icon className={`h-6 w-6 ${value.color}`} />
                    </div>

                    <h3 className={`font-serif text-base font-bold sm:text-lg ${value.color}`}>
                      {value.title}
                    </h3>

                    <div className="my-2 h-px w-8 bg-slate-200 transition-colors group-hover:bg-slate-300" />

                    <p className="text-xs leading-5 text-slate-500 sm:text-[13px]">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom acronym strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-14 md:mt-16"
        >
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-8 shadow-[0_10px_40px_rgba(15,23,42,0.06)] md:p-10">

            <div
              className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #F5A623 1.5px, transparent 1.5px)',
                backgroundSize: '12px 12px',
              }}
            />

            <div className="relative flex flex-col items-center gap-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F5A623]/10 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#F5A623]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F5A623]">
                  Our Character Framework
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
                <span className="text-rose-600">R</span>
                <span className="text-blue-600">R</span>
                <span className="text-emerald-600">R</span>{' '}
                <span className="text-amber-600">A</span>{' '}
                <span className="text-violet-600">I</span>{' '}
                <span className="text-pink-600">K</span>
              </h3>

              <p className="max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Six letters, six values — the foundation of every Vincollins
                pupil's character. We weave these into every lesson, every
                interaction and every day of school life.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}