'use client'

import { useState, useEffect } from 'react'
import { HeroSection } from '@/components/homepage/HeroSection'
import { AcademicLevels } from '@/components/homepage/AcademicLevels'
import { WhyChoose } from '@/components/homepage/WhyChoose'
import { Footer } from '@/components/homepage/Footer'
import { Navigation } from '@/components/layout/Navigation'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <AcademicLevels />
      <WhyChoose />
      
      {/* Optional: Add Latest News Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">📰 Latest News & Events Coming Soon</p>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}