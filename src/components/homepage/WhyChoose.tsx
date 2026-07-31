'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Users, 
  School, 
  Laptop, 
  Heart, 
  Award,
  Star,
  GraduationCap 
} from 'lucide-react'

const reasons = [
  {
    icon: Shield,
    title: 'Qualified Teachers',
    description: 'Experienced educators dedicated to nurturing every child\'s potential.',
    color: 'primary',
  },
  {
    icon: School,
    title: 'Safe Environment',
    description: 'Secure and supportive atmosphere for learning and growth.',
    color: 'accent',
  },
  {
    icon: Laptop,
    title: 'Modern Classrooms',
    description: 'Technology-integrated learning spaces for 21st century education.',
    color: 'primary',
  },
  {
    icon: Heart,
    title: 'ICT Integration',
    description: 'Digital literacy programs preparing students for the future.',
    color: 'secondary',
  },
  {
    icon: Star,
    title: 'Character Development',
    description: 'Building strong moral values and leadership skills.',
    color: 'accent',
  },
  {
    icon: Award,
    title: 'Academic Excellence',
    description: 'Proven track record of outstanding academic performance.',
    color: 'primary',
  },
]

export const WhyChoose = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="accent" className="mb-4">Why Choose Us</Badge>
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
            Why Vincollins Schools?
          </h2>
          <p className="text-muted-foreground text-lg">
            We provide a nurturing environment where every child can thrive 
            academically, socially, and emotionally.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="group hover:shadow-soft-lg transition-all duration-300 border-0 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mb-4">
                    <reason.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl text-primary mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {reason.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}