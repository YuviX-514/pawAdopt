"use client";

import { Search, PhoneCall, Heart } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="w-10 h-10 text-[#FF8C42]" />,
      title: "Search Pets",
      description:
        "Browse hundreds of adorable animals waiting for a loving home.",
    },
    {
      icon: <PhoneCall className="w-10 h-10 text-[#FF8C42]" />,
      title: "Connect with Shelter",
      description:
        "Get in touch with shelters or rescuers near your location.",
    },
    {
      icon: <Heart className="w-10 h-10 text-[#FF8C42]" />,
      title: "Adopt Your Friend",
      description:
        "Give your new furry friend the loving home they deserve!",
    },
  ];

  return (
    <section className="w-full py-20 px-4 bg-[#FFF7EC] text-[#3B3B3B]">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-12">
          How <span className="text-[#FF8C42]">PawAdopt</span> Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition duration-300"
            >
              <div className="mb-4 flex justify-center">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
