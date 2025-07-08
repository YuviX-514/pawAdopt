// app/page.tsx
"use client"

import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";
import Footer from "@/components/layout/Footer";
import HowItWorks from "@/components/home/HowItWorks";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <Features />
      <HowItWorks/>
      
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}
