'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Collections() {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);

  return (
    <section className="relative w-full h-screen">
      <div className="grid grid-cols-2 h-full">
        {/* Left Section - For Him */}
        <div className="relative h-full">
          <Image
            src="/images/collections/collectionImg1.webp"
            alt="For Him"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute bottom-8 left-8 z-10 text-white">
            <h2 className="text-4xl font-bold mb-4">for him</h2>
            <p className="text-xl mb-6">
              &ldquo;The fabric is really soft and comfortable. Fits perfectly!&rdquo;
            </p>
            <Link
              href="/him"
              className="bg-white text-[10px] text-black px-6 py-2 font-semibold hover:bg-white-800 transition inline-block overflow-hidden relative"
              onMouseEnter={() => setIsHovered1(true)}
              onMouseLeave={() => setIsHovered1(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered1 ? 'animate-button-scroll' : ''}`}>
                SHOP NOW
              </span>
            </Link>
          </div>
        </div>

        {/* Right Section - For Her */}
        <div className="relative h-full">
          <Image
            src="/images/collections/collectionImg2.webp"
            alt="For Her"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute bottom-8 left-8 z-10 text-white">
            <h2 className="text-4xl font-bold mb-4">for her</h2>
            <p className="text-xl mb-6">
              &ldquo;The most wonderful & comfortable dress ever.&rdquo;
            </p>
            <Link
              href="/her"
              className="bg-white text-[10px] text-black px-6 py-2 font-semibold hover:bg-white-800 transition inline-block overflow-hidden relative"
              onMouseEnter={() => setIsHovered2(true)}
              onMouseLeave={() => setIsHovered2(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered2 ? 'animate-button-scroll' : ''}`}>
                SHOP NOW
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

