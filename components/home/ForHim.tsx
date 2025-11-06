'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ForHim() {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);
  const [isHovered4, setIsHovered4] = useState(false);

  return (
    <section className="py-16 bg-white">
      <div className="w-[98vw] mx-auto px-0">
        {/* Header */}
        <div className="mb-12 px-8">
          <h2 className="text-2xl font-bold mb-5">shop for him</h2>
          <p className="text-sm">
            organic cotton shirts, tees, pants for men
          </p>
        </div>

        {/* 1x4 Horizontal Grid */}
        <div className="grid grid-cols-4 px-8">
          {/* Image 1 - Organic Tees */}
          <div className="relative w-full aspect-3/4">
            <Image
              src="/images/forHim/ForHim1.jpg"
              alt="Organic Tees"
              fill
              className="object-cover"
              sizes="25vw"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <button
                className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
                onMouseEnter={() => setIsHovered1(true)}
                onMouseLeave={() => setIsHovered1(false)}
              >
                <span className={`inline-block whitespace-nowrap ${isHovered1 ? 'animate-button-scroll' : ''}`}>
                  SHOP ORGANIC TEES
                </span>
              </button>
            </div>
          </div>

          {/* Image 2 - Casual Shirts */}
          <div className="relative w-full aspect-3/4">
            <Image
              src="/images/forHim/ForHim2.webp"
              alt="Casual Shirts"
              fill
              className="object-cover"
              sizes="25vw"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <button
                className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
                onMouseEnter={() => setIsHovered2(true)}
                onMouseLeave={() => setIsHovered2(false)}
              >
                <span className={`inline-block whitespace-nowrap ${isHovered2 ? 'animate-button-scroll' : ''}`}>
                  SHOP CASUAL SHIRTS
                </span>
              </button>
            </div>
          </div>

          {/* Image 3 - Linen Pants */}
          <div className="relative w-full aspect-3/4">
            <Image
              src="/images/forHim/ForHim3.webp"
              alt="Linen Pants"
              fill
              className="object-cover"
              sizes="25vw"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <button
                className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
                onMouseEnter={() => setIsHovered3(true)}
                onMouseLeave={() => setIsHovered3(false)}
              >
                <span className={`inline-block whitespace-nowrap ${isHovered3 ? 'animate-button-scroll' : ''}`}>
                  SHOP LINEN PANTS
                </span>
              </button>
            </div>
          </div>

          {/* Image 4 - Sleep Sets */}
          <div className="relative w-full aspect-3/4">
            <Image
              src="/images/forHim/ForHim4.webp"
              alt="Sleep Sets"
              fill
              className="object-cover"
              sizes="25vw"
            />
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <button
                className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
                onMouseEnter={() => setIsHovered4(true)}
                onMouseLeave={() => setIsHovered4(false)}
              >
                <span className={`inline-block whitespace-nowrap ${isHovered4 ? 'animate-button-scroll' : ''}`}>
                  SHOP SLEEP SETS
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
