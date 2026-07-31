'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Baby, BookOpen, Music, Palette, Trophy, Laptop } from 'lucide-react'

const levels = [
  {
    title: 'Nursery',
    subtitle: 'Early Childhood Development',
    ages: 'Ages 1–5',
    icon: Baby,
    color: 'primary',
    features: ['Play-based Learning', 'Social Skills', 'Creative Arts'],
  },
  {
    title: 'Primary',
    subtitle: 'Foundation Learning',
    ages: 'Primary 1–6',
    icon: BookOpen,
    color: 'accent',
    features: ['Core Academics', 'Character Building', 'STEM Introduction'],
  },
  {
    title: 'Co-Curricular',
    subtitle: 'Holistic Development',
    ages: 'Sports • ICT • Music • Art • Leadership',
    icon: Trophy,
    color: 'secondary',
    features: ['Sports Excellence', 'Digital Skills', 'Creative Expression'],
  },
]

export const AcademicLevels = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="accent" className="mb-4">Academic Programs</Badge>
          <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
            Our Learning Pathways
          </h2>
          <p className="text-muted-foreground text-lg">
            Nurturing young minds through carefully designed educational programs 
            that grow with your child.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {levels.map((level, index) => (
            <motion.div
              key={level.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full hover:shadow-soft-lg transition-all duration-300 border-2 border-transparent hover:border-primary/10">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <level.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary">
                    {level.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-medium">
                    {level.subtitle}
                  </p>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mb-4">
                    {level.ages}
                  </Badge>
                  <ul className="space-y-2">
                    {level.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}