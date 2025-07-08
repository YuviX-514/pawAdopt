"use client";

import { useEffect, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  author: string;
  pet: string;
  bg: string;
};

export default function TestimonialCarousel() {
  const testimonials: Testimonial[] = [
    {
      quote: "Adopting Max was the best decision we ever made. The adoption process was so smooth!",
      author: "Sarah & Family",
      pet: "Golden Retriever",
      bg: "bg-amber-50",
    },
    {
      quote: "Our cat Luna settled in immediately. She's brought so much joy to our home!",
      author: "Michael T.",
      pet: "Domestic Shorthair",
      bg: "bg-orange-50",
    },
    {
      quote: "The health check was so thorough. We knew exactly what to expect with our new puppy!",
      author: "Johnson Family",
      pet: "Labrador Mix",
      bg: "bg-amber-50",
    },
    {
      quote: "The follow-up support after adoption was exceptional. Highly recommend!",
      author: "David L.",
      pet: "Siamese Cat",
      bg: "bg-orange-50",
    },
    {
      quote: "Adopted two senior dogs who are now living their best lives.",
      author: "Emma & Raj",
      pet: "Senior Dachshunds",
      bg: "bg-amber-50",
    },
    {
      quote: "The matching questionnaire found us the perfect energetic companion.",
      author: "Alex P.",
      pet: "Border Collie",
      bg: "bg-orange-50",
    },
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const duplicatedTestimonials = [
    ...testimonials,
    ...testimonials,
    ...testimonials,
  ];

  useEffect(() => {
  const carousel = carouselRef.current;
  if (!carousel) return;

  let animationFrameId: number;
  const speed = 1;

  const animate = () => {
    if (!isHovered && !isDragging) {
      carousel.scrollLeft += speed;

      // Reset logic
      const scrollWidth = carousel.scrollWidth;
      const visibleWidth = carousel.clientWidth;

      if (carousel.scrollLeft >= (scrollWidth - visibleWidth)) {
        // Jump back smoothly
        carousel.scrollLeft = carousel.scrollLeft - (scrollWidth / 3);
      }
    }
    animationFrameId = requestAnimationFrame(animate);
  };

  animationFrameId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(animationFrameId);
}, [isHovered, isDragging]);


  // Drag logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-800 mb-4">
          Happy Tails
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Hear from families who found their perfect companions
        </p>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseUp();
          }}
        >
          <div
            ref={carouselRef}
            className={`flex gap-6 py-4 overflow-x-auto scrollbar-hide select-none ${
              isDragging ? "cursor-grabbing" : "cursor-pointer"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${index}-${testimonial.author}`}
                className={`${testimonial.bg} flex-shrink-0 w-80 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300`}
              >
                <p className="text-gray-700 mb-6 text-lg italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-orange-100 pt-4">
                  <p className="font-bold text-gray-800">
                    {testimonial.author}
                  </p>
                  <p className="text-amber-600">
                    Adopted: {testimonial.pet}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
