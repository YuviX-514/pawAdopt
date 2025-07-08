"use client";

import { PawPrint } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-r from-[#FFF1E8] via-[#FFE7D6] to-[#FFDDC8] text-[#3B3B3B] text-center overflow-hidden">
      {/* Decorative blurred circles */}
      <div className="absolute top-0 left-0 w-60 h-60 bg-white/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
          Ready to Meet Your New Best Friend?
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Loving pets are waiting for their forever homes. Begin your adoption journey today.
        </p>
        <button className="mt-4 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF8C42] text-white hover:bg-[#e67830] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-[#e67830]/50 hover:-translate-y-0.5">
          <PawPrint className="w-5 h-5" />
          Browse Available Pets
        </button>
      </div>
    </section>
  );
}
