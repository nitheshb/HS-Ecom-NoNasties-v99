'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Press() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pressItems = [
    {
      image: "/images/press/Fortune.avif",
      quote: "Rewriting the rules of fashion proving that age-old adage that style can also be a force for good.",
      source: "FORTUNE",
    },
    {
      image: "/images/press/Vogue.avif",
      quote: "It starts with using organic cotton, an all-Indian supply chain, upcycling surplus packaging.",
      source: "VOGUE",
    },
    {
      image: "/images/press/HindustanTimes.avif",
      quote: "A triple bottom-line of people, planet, and profits.",
      source: "HINDUSTAN TIMES",
    },
    {
      image: "/images/press/indianExpress.avif",
      quote: "Sustainably made, right from the seed to the garment.",
      source: "INDIAN EXPRESS",
    },
    {
      image: "/images/press/Traveler.avif",
      quote: "Possibly India's oldest and most established vegan clothing brand.",
      source: "TRAVELER",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev === pressItems.length - 1 ? 0 : prev + 1));
        setIsTransitioning(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [pressItems.length]);

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? pressItems.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === pressItems.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <section className="relative w-full h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/press/pressBgImg.webp"
          alt="Press Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        {/* Press Label */}
        <p className="uppercase mb-8 text-base font-semibold">PRESS</p>

        {/* Quote with transition */}
        <div className="max-w-4xl text-center px-8 mb-12 overflow-hidden h-32">
          <div
            className={`transition-transform duration-300 ${isTransitioning ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            <p className="text-3xl font-semibold leading-relaxed">
              &ldquo;{pressItems[currentIndex].quote}&rdquo;
            </p>
          </div>
        </div>

        {/* Source Circle with Image */}
        <div className="mb-12 overflow-hidden h-32">
          <div
            className={`transition-transform duration-300 flex justify-center ${isTransitioning ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
          >
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <Image
                src={pressItems[currentIndex].image}
                alt={pressItems[currentIndex].source}
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevious}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
