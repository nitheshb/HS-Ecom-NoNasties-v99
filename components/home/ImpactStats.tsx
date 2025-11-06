'use client';

import { Plus, Heart, TreePine, Cloud } from 'lucide-react';

export default function ImpactStats() {
  return (
    <section className="bg-[#28e605] py-12">
      <div className="max-w-7xl mx-auto px-0">
        {/* Main Heading */}
        <div className="mb-12">
          <div className="mb-4">
            <Plus size={48} className="font-bold mb-2" strokeWidth={3} />
            <h2 className="text-4xl font-bold">our impact stats.</h2>
          </div>
          <p className="text-base">
            heal the world, make it a better place. <span className="underline">see how.</span>
          </p>
        </div>

        {/* Three-Column Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1 - OUR FABRICS */}
          <div className="border-t border-gray-600 p-10">
            <div className="flex items-start gap-4">
              <span className="relative">
                <Heart className="w-12 h-12" strokeWidth={2} />
                <Plus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={16} strokeWidth={3} />
              </span>
              <span className="flex flex-col">
                <h3 className="text-base font-bold uppercase">our fabrics</h3>
                <p className="text-sm">100% organic cotton & linen</p>
              </span>
            </div>
          </div>

          {/* Column 2 - OUR TREES */}
          <div className="border-t border-gray-600 p-10">
            <div className="flex items-start gap-4">
              <span className="relative">
                <TreePine className="w-12 h-12" strokeWidth={2} />
                <Plus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={16} strokeWidth={3} />
              </span>
              <span className="flex flex-col">
                <h3 className="text-base font-bold uppercase">our trees</h3>
                <p className="text-sm">251586 trees planted around the world</p>
              </span>
            </div>
          </div>

          {/* Column 3 - OUR FOOTPRINT */}
          <div className="border-t border-gray-600 p-10">
            <div className="flex items-start gap-4">
              <span className="relative">
                <Cloud className="w-12 h-12" strokeWidth={2} />
                <Plus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={16} strokeWidth={3} />
              </span>
              <span className="flex flex-col">
                <h3 className="text-base font-bold uppercase">our footprint</h3>
                <p className="text-sm">-672238.5 kg co2. yep, carbon negative</p>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
