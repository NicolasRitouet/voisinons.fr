import { HeroSection } from "@/components/landing/hero-section";
import { MarqueeSection } from "@/components/landing/marquee-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ContextSection } from "@/components/landing/context-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";

export default function HomePage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      <Navbar />
      <HeroSection />
      <MarqueeSection />
      <HowItWorksSection />
      <ContextSection />
      <CTASection />
      <Footer />
    </div>
  );
}
