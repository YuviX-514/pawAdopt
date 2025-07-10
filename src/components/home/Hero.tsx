"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


export default function Hero() {
  const images = [
    "/hero1.jpg",
    "/hero2.jpg",
    "/hero3.jpg",
    "/hero4.jpg",
  ];

  const router = useRouter();

  return (
    <section className="w-full min-h-[80vh] flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-24 py-22 bg-gradient-to-br from-amber-50 to-orange-50">
      {/* LEFT SIDE */}
      <div className="flex-1 mb-12 md:mb-0 md:pr-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-800 leading-tight">
          Find Your Perfect
          <br />
          <span className="text-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text">
            Furry Friend
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
          Adopt cute pets waiting for a loving home. Browse animals near you
          and make a difference today!
        </p>
        <button
          onClick={() => router.push("/pets")}
          className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-full hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-orange-200/50 transform hover:-translate-y-1"
        >
          Explore Pets
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex justify-center relative w-full max-w-2xl">
        <div className="relative w-full aspect-square max-w-[500px]">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              nextEl: ".custom-next",
              prevEl: ".custom-prev",
            }}
            pagination={{
              clickable: true,
              bulletClass: "swiper-pagination-bullet bg-orange-200",
              bulletActiveClass: "swiper-pagination-bullet-active !bg-orange-500",
            }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop
            className="w-full h-full rounded-2xl overflow-hidden shadow-xl"
          >
            {images.map((src, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full">
                  <Image
                    src={src}
                    alt={`Hero Image ${index}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button
            className="custom-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-orange-500 p-3 rounded-full shadow-lg hover:bg-white hover:text-orange-600 transition-all duration-300 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="custom-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 text-orange-500 p-3 rounded-full shadow-lg hover:bg-white hover:text-orange-600 transition-all duration-300 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
