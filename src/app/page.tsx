// app/page.tsx
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { HeroSection } from "../components/home/hero-section";
import { AcademicLevels } from "../components/home/academic-levels";
import { WhyChoose } from "../components/home/why-choose";
import { VisionMission } from "../components/home/vision-mission";
import { Values } from "../components/home/values";
import { StatsBar } from "../components/home/stats-bar";
import { CTA } from "../components/home/cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <StatsBar />
        <AcademicLevels />
        <VisionMission />
        <WhyChoose />
        <Values />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
