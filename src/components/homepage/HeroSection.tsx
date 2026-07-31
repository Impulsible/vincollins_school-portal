'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, ArrowRight } from 'lucide-react'

export const HeroSection = () => {
  const floatingElements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 5 + 3,
    delay: Math.random() * 2,
  }))

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light">
      {/* Animated floating elements */}
      <div className="absolute inset-0 opacity-20">
        {floatingElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute rounded-full bg-white"
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: el.duration,
              delay: el.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Decorative shapes */}
      <div className="absolute right-0 top-20 opacity-10">
        <div className="w-64 h-64 rounded-full border-4 border-white/20" />
      </div>
      <div className="absolute left-10 bottom-20 opacity-10">
        <div className="w-96 h-96 rounded-full border-4 border-white/10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 flex items-center min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="max-w-3xl">
            {/* Glass Card */}
            <div className="backdrop-blur-md bg-white/10 rounded-3xl p-8 md:p-12 lg:p-16 border border-white/20 shadow-glass">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <span className="text-accent-light font-semibold text-sm uppercase tracking-wider">
                    Since 2010
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-tight">
                  Vincollins Schools
                  <span className="block text-accent-light text-2xl md:text-3xl lg:text-4xl font-script mt-2">
                    Geared Towards Excellence
                  </span>
                </h1>

                <p className="text-white/90 text-lg md:text-xl mt-6 font-body leading-relaxed max-w-2xl">
                  Inspiring young minds through quality education, strong values, 
                  and innovative learning experiences that prepare every child 
                  for lifelong success.
                </p>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Button 
                    size="xl" 
                    className="bg-accent text-primary hover:bg-accent-light font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Explore School
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="xl" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Login to Portal
                  </Button>
                </div>

                {/* Quick stats inside hero */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/10">
                  {[
                    { label: 'Students', value: '500+', icon: '👨‍🎓' },
                    { label: 'Teachers', value: '35+', icon: '👩‍🏫' },
                    { label: 'Years', value: '15+', icon: '⭐' },
                    { label: 'Digital Reports', value: '100%', icon: '📊' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-white/70 text-sm mt-1">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path 
            fill="#F9F7F4" 
            fillOpacity="1" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  )
}