import dynamic from "next/dynamic";
import { Suspense } from "react";
import SectionFallback from "@/components/ui/SectionFallback";

const Hero = dynamic(() => import("@/components/home/Hero"), {
  loading: () => <SectionFallback />,
});
const Features = dynamic(() => import("@/components/home/Features"), {
  loading: () => <SectionFallback />,
});
const HowItWorks = dynamic(() => import("@/components/home/HowItWorks"), {
  loading: () => <SectionFallback />,
});
const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
  loading: () => <SectionFallback />,
});
const CallToAction = dynamic(() => import("@/components/home/CallToAction"), {
  loading: () => <SectionFallback />,
});
const Footer = dynamic(() => import("@/components/layout/Footer"));

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Suspense fallback={<SectionFallback />}>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CallToAction />
        <Footer />
      </Suspense>
    </main>
  );
}
