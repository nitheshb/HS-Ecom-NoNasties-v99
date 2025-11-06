'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Hero() {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);
  const [isHovered4, setIsHovered4] = useState(false);

  return (
    <section className="relative overflow-hidden">
      <div className="grid grid-cols-2">
        {/* Row 1 - Image 1 */}
        <div className="relative h-[120vh]">
          <Image
            src="/images/hero/Hero1.webp"
            alt="Hero 1"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />

          {/* Horizontal scrolling text */}
          <div className="absolute top-[50%] left-0 right-0 overflow-hidden z-10">
            <div className="whitespace-nowrap animate-scroll flex">
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                the ultimate wardrobe hack? the ultimate wardrobe hack? the ultimate wardrobe hack?
              </span>
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                the ultimate wardrobe hack? the ultimate wardrobe hack? the ultimate wardrobe hack?
              </span>
            </div>
          </div>

          <div className="absolute top-[58%] left-8 right-8 z-10">
            <Link
              href="/her"
              className="inline-block bg-black text-yellow-400 px-8 py-4 transition font-semibold overflow-hidden relative"
              onMouseEnter={() => setIsHovered1(true)}
              onMouseLeave={() => setIsHovered1(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered1 ? 'animate-button-scroll' : ''}`}>
                NEW FOR HER
              </span>
            </Link>
          </div>
        </div>

        {/* Row 1 - Image 2 */}
        <div className="relative h-[120vh]">
          <Image
            src="/images/hero/Hero2.webp"
            alt="Hero 2"
            fill
            className="object-cover"
            priority
            sizes="50vw"
          />

          {/* Horizontal scrolling text */}
          <div className="absolute top-[50%] left-0 right-0 overflow-hidden z-10">
            <div className="whitespace-nowrap animate-scroll flex">
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                comfort, of course. comfort, of course. comfort, of course. comfort, of course.
              </span>
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                comfort, of course. comfort, of course. comfort, of course. comfort, of course.
              </span>
            </div>
          </div>

          <div className="absolute top-[58%] left-8 right-8 z-10">
            <Link
              href="/him"
              className="inline-block bg-black text-yellow-400 px-8 py-4 transition font-semibold overflow-hidden relative"
              onMouseEnter={() => setIsHovered2(true)}
              onMouseLeave={() => setIsHovered2(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered2 ? 'animate-button-scroll' : ''}`}>
                NEW FOR HIM
              </span>
            </Link>
          </div>
        </div>

        {/* Row 2 - Image 3 */}
        <div className="relative h-[120vh]">
          <Image
            src="/images/hero/Hero3.webp"
            alt="Hero 3"
            fill
            className="object-cover"
            sizes="50vw"
          />

          {/* Horizontal scrolling text */}
          <div className="absolute top-[50%] left-0 right-0 overflow-hidden z-10">
            <div className="whitespace-nowrap animate-scroll flex">
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                hello zero waste. hello zero waste. hello zero waste. hello zero waste.
              </span>
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                hello zero waste. hello zero waste. hello zero waste. hello zero waste.
              </span>
            </div>
          </div>

          <div className="absolute top-[58%] left-8 right-8 z-10">
            <Link
              href="/her"
              className="inline-block bg-black text-yellow-400 px-8 py-4 transition font-semibold overflow-hidden relative"
              onMouseEnter={() => setIsHovered3(true)}
              onMouseLeave={() => setIsHovered3(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered3 ? 'animate-button-scroll' : ''}`}>
                NEW FOR HER
              </span>
            </Link>
          </div>
        </div>

        {/* Row 2 - Image 4 */}
        <div className="relative h-[120vh]">
          <Image
            src="/images/hero/Hero4.webp"
            alt="Hero 4"
            fill
            className="object-cover"
            sizes="50vw"
          />

          {/* Horizontal scrolling text */}
          <div className="absolute top-[50%] left-0 right-0 overflow-hidden z-10">
            <div className="whitespace-nowrap animate-scroll flex">
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                hello organic cotton. hello organic cotton. hello organic cotton. hello organic cotton.
              </span>
              <span className="text-yellow-200 text-4xl font-bold pr-8">
                hello organic cotton. hello organic cotton. hello organic cotton. hello organic cotton.
              </span>
            </div>
          </div>

          <div className="absolute top-[58%] left-8 right-8 z-10">
            <Link
              href="/him"
              className="inline-block bg-black text-yellow-400 px-8 py-4 transition font-semibold overflow-hidden relative"
              onMouseEnter={() => setIsHovered4(true)}
              onMouseLeave={() => setIsHovered4(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered4 ? 'animate-button-scroll' : ''}`}>
                NEW FOR HIM
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
