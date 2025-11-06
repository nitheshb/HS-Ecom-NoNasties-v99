'use client';

import { useState } from 'react';

export default function NewArrivals() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-16 bg-white">
      <div className="w-[98vw] mx-auto px-0">
        <div className="flex items-center gap-8 px-8">
          {/* Left Side - Overlapping Videos */}
          <div className="w-3/3.5 relative">
            {/* Background Video */}
            <div className="h-[130vh]">
              <video
                src="https://www.nonasties.in/cdn/shop/videos/c/vp/ca49263b053d4cf898f375694466fbfc/ca49263b053d4cf898f375694466fbfc.HD-1080p-4.8Mbps-35668537.mp4?v=0"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            {/* Foreground Video - Overlapping */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[350px]">
              <video
                src="https://www.nonasties.in/cdn/shop/videos/c/vp/955ee444f4b349e8bb0b682a5cc94783/955ee444f4b349e8bb0b682a5cc94783.HD-1080p-3.3Mbps-35668532.mp4?v=0"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Side - Text and Button */}
          <div className="flex-1">
            <p className="text-sm uppercase mb-4">CERTIFIED ORGANIC</p>
            <h2 className="text-4xl font-bold mb-8 leading-tight">
              the{' '}
              <span className="bg-[#28e605] px-2 py-1 inline-block transform -rotate-4">
                softest
              </span>{' '}
              fabric to ever touch your skin.
            </h2>
            <button
              className="bg-black text-white px-8 py-3 font-semibold hover:bg-gray-800 transition overflow-hidden relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered ? 'animate-button-scroll' : ''}`}>
                SHOP NEW ARRIVALS
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
