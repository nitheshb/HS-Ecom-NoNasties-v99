'use client';

import { Clock, Truck, Repeat } from 'lucide-react';

export default function Features() {
  return (
    <section className="py-16 bg-[#1c1c1c] text-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 items-center justify-center">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center">
            <Clock className="w-8 h-8 mb-4" strokeWidth={1.5} />
            <p className="text-sm">ships in 48 hours</p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center">
            <Truck className="w-8 h-8 mb-4" strokeWidth={1.5} />
            <p className="text-sm">free shipping over rs. 2000</p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center">
            <Repeat className="w-8 h-8 mb-4" strokeWidth={1.5} />
            <p className="text-sm">free exchanges & returns</p>
          </div>
        </div>
      </div>
    </section>
  );
}
