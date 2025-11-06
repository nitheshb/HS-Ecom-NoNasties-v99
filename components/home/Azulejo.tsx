'use client';

import { useState } from 'react';

export default function Azulejo() {
  const [isHovered1, setIsHovered1] = useState(false);
  const [isHovered2, setIsHovered2] = useState(false);
  const [isHovered3, setIsHovered3] = useState(false);

  return (
    <section className="py-16 bg-white">
      <div className="mb-12 pl-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-4">hello, azulejo</h2>
          <p className="text-sm">
            our signature portuguese artwork. from goa, with love.
          </p>
        </div>
      </div>

      {/* Three Videos Row */}
      <div className="grid grid-cols-3 w-full gap-px">
        {/* Video 1 */}
        <div className="relative w-full h-[120vh]">
          <video
            src="https://www.nonasties.in/cdn/shop/videos/c/vp/ae87148a1eee47eea3cb80da233ef269/ae87148a1eee47eea3cb80da233ef269.HD-1080p-3.3Mbps-44379046.mp4?v=0"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <button
              className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
              onMouseEnter={() => setIsHovered1(true)}
              onMouseLeave={() => setIsHovered1(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered1 ? 'animate-button-scroll' : ''}`}>
                SHOP AZULEJO
              </span>
            </button>
          </div>
        </div>

        {/* Video 2 */}
        <div className="relative w-full h-[120vh]">
          <video
            src="https://www.nonasties.in/cdn/shop/videos/c/vp/94e24cabe3a447d7b0f29daf4c96661e/94e24cabe3a447d7b0f29daf4c96661e.HD-1080p-3.3Mbps-44379042.mp4?v=0"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <button
              className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
              onMouseEnter={() => setIsHovered2(true)}
              onMouseLeave={() => setIsHovered2(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered2 ? 'animate-button-scroll' : ''}`}>
                SHOP AZULEJO
              </span>
            </button>
          </div>
        </div>

        {/* Video 3 */}
        <div className="relative w-full h-[120vh]">
          <video
            src="https://www.nonasties.in/cdn/shop/videos/c/vp/bc16f5e472fe4accbfaa37bf187f1fa4/bc16f5e472fe4accbfaa37bf187f1fa4.HD-1080p-3.3Mbps-44379043.mp4?v=0"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <button
              className="bg-white px-5 py-2 text-sm font-semibold hover:bg-gray-100 transition overflow-hidden relative"
              onMouseEnter={() => setIsHovered3(true)}
              onMouseLeave={() => setIsHovered3(false)}
            >
              <span className={`inline-block whitespace-nowrap ${isHovered3 ? 'animate-button-scroll' : ''}`}>
                SHOP AZULEJO
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
